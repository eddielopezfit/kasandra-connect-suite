import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * book-appointment
 * Production GHL booking endpoint:
 *   1. Re-validate slot availability (prevent double-booking)
 *   2. Search/create GHL contact
 *   3. Create calendar appointment
 *   4. Record handoff in DB
 *   5. Fire notify-handoff
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_CALENDAR_ID = "SRRfanKgjVH2Gk9auQRH";

interface BookRequest {
  lead_id: string;
  slot_start: string;    // ISO string
  slot_end: string;      // ISO string
  name: string;
  email: string;
  phone: string;
  intent?: string;
  message?: string;
  timezone?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: BookRequest = await req.json();
    const {
      lead_id,
      slot_start,
      slot_end,
      name,
      email,
      phone,
      intent,
      message,
      timezone = "America/Phoenix",
    } = body;

    // Validate required fields
    if (!lead_id || !slot_start || !slot_end || !name || !email) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limit: 3 booking attempts per hour per IP
    const rlKey = extractRateLimitKey(req, { lead_id });
    const rl = await checkRateLimit(supabase, rlKey, "book-appointment");
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    const ghlApiKey = Deno.env.get("GHL_PRIVATE_KEY");
    if (!ghlApiKey) {
      console.error(`[book-appointment][${requestId}] GHL_PRIVATE_KEY not set`);
      return new Response(
        JSON.stringify({ ok: false, error: "Calendar service unavailable", code: "api_unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ghlHeaders = {
      Authorization: `Bearer ${ghlApiKey}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
    };

    const ghlLocationId = Deno.env.get("GHL_LOCATION_ID") ?? "kGfxAFqz1M7sxRFm52L1";

    // ─── STEP 1: Re-validate slot availability ───
    console.log(`[book-appointment][${requestId}] Validating slot ${slot_start}`);

    const slotDate = new Date(slot_start);
    const validationStart = new Date(slotDate.getTime() - 5 * 60 * 1000); // 5 min before
    const validationEnd = new Date(slotDate.getTime() + 35 * 60 * 1000);  // 5 min after end

    const validationParams = new URLSearchParams({
      startDate: validationStart.toISOString(),
      endDate: validationEnd.toISOString(),
      timezone,
    });

    const validateRes = await fetch(
      `${GHL_BASE_URL}/calendars/${GHL_CALENDAR_ID}/free-slots?${validationParams}`,
      { headers: ghlHeaders }
    );

    if (!validateRes.ok) {
      const errText = await validateRes.text().catch(() => "");
      console.error(`[book-appointment][${requestId}] Slot validation failed: ${validateRes.status} ${errText.slice(0, 200)}`);
      return new Response(
        JSON.stringify({ ok: false, error: "Could not verify slot availability", code: "validation_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validateData = await validateRes.json();
    const dateMap: Record<string, { slots: string[] }> = validateData._dates_ ?? validateData.data ?? {};
    const allAvailableSlots: string[] = [];
    for (const dateKey of Object.keys(dateMap)) {
      allAvailableSlots.push(...(dateMap[dateKey]?.slots ?? []));
    }

    // Check if the requested slot_start matches any available slot (within 60s tolerance)
    const requestedMs = new Date(slot_start).getTime();
    const slotStillAvailable = allAvailableSlots.some((s) => {
      return Math.abs(new Date(s).getTime() - requestedMs) < 60_000;
    });

    if (!slotStillAvailable) {
      console.warn(`[book-appointment][${requestId}] SLOT CONFLICT — ${slot_start} no longer available`);

      // Log conflict event
      await supabase.from("event_log").insert({
        session_id: lead_id,
        event_type: "slot_conflict",
        event_payload: { slot_start, available_count: allAvailableSlots.length },
      }).then(() => {});

      return new Response(
        JSON.stringify({
          ok: false,
          error: "This time slot is no longer available. Please select another time.",
          code: "slot_conflict",
          available_slots: allAvailableSlots.slice(0, 8).map((s) => {
            const start = new Date(s);
            return {
              start: start.toISOString(),
              end: new Date(start.getTime() + 30 * 60 * 1000).toISOString(),
              display_time: start.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", hour12: true, timeZone: timezone,
              }),
            };
          }),
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[book-appointment][${requestId}] Slot validated ✓`);

    // ─── STEP 2: Search or create GHL contact ───
    console.log(`[book-appointment][${requestId}] Resolving GHL contact for ${email}`);

    let contactId: string | null = null;

    // Search by email
    const searchParams = new URLSearchParams({
      locationId: ghlLocationId,
      query: email,
    });
    const searchRes = await fetch(`${GHL_BASE_URL}/contacts/?${searchParams}`, {
      headers: ghlHeaders,
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const contacts = searchData?.contacts ?? [];
      if (contacts.length > 0) {
        contactId = contacts[0].id;
        console.log(`[book-appointment][${requestId}] Found existing contact: ${contactId}`);
      }
    } else {
      const errText = await searchRes.text().catch(() => "");
      console.warn(`[book-appointment][${requestId}] Contact search failed: ${searchRes.status} ${errText.slice(0, 200)}`);
    }

    // Create contact if not found
    if (!contactId) {
      console.log(`[book-appointment][${requestId}] Creating new GHL contact`);
      const nameParts = name.trim().split(" ");
      const createRes = await fetch(`${GHL_BASE_URL}/contacts/`, {
        method: "POST",
        headers: ghlHeaders,
        body: JSON.stringify({
          locationId: ghlLocationId,
          firstName: nameParts[0] ?? "",
          lastName: nameParts.slice(1).join(" ") ?? "",
          email: email.trim(),
          phone: phone?.trim() || undefined,
          source: "DCOS Native Booking",
          tags: ["selena - website lead", "selena_os_lead", `selena - intent ${intent ?? "explore"}`],
        }),
      });

      if (createRes.ok) {
        const createData = await createRes.json();
        contactId = createData?.contact?.id ?? null;
        console.log(`[book-appointment][${requestId}] Created contact: ${contactId}`);
      } else {
        const errText = await createRes.text().catch(() => "");
        console.error(`[book-appointment][${requestId}] Contact creation failed: ${createRes.status} ${errText.slice(0, 200)}`);
      }
    }

    if (!contactId) {
      console.error(`[book-appointment][${requestId}] Could not resolve GHL contact`);
      return new Response(
        JSON.stringify({ ok: false, error: "Could not create booking contact", code: "contact_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update lead_profiles with GHL contact ID
    await supabase
      .from("lead_profiles")
      .update({ ghl_contact_id: contactId, ghl_synced_at: new Date().toISOString() })
      .eq("id", lead_id)
      .then(() => {});

    // ─── STEP 3: Create GHL calendar appointment ───
    console.log(`[book-appointment][${requestId}] Creating appointment`);

    const appointmentPayload = {
      calendarId: GHL_CALENDAR_ID,
      locationId: ghlLocationId,
      contactId,
      startTime: slot_start,
      endTime: slot_end,
      title: "Real Estate Consultation Call",
      appointmentStatus: "confirmed",
      address: timezone,
      notes: [
        `Source: DCOS Native Booking`,
        `Intent: ${intent ?? "explore"}`,
        message ? `Note: ${message}` : null,
      ].filter(Boolean).join("\n"),
    };

    const appointmentRes = await fetch(`${GHL_BASE_URL}/calendars/events`, {
      method: "POST",
      headers: ghlHeaders,
      body: JSON.stringify(appointmentPayload),
    });

    if (!appointmentRes.ok) {
      const errText = await appointmentRes.text().catch(() => "");
      console.error(`[book-appointment][${requestId}] Appointment creation failed: ${appointmentRes.status} ${errText.slice(0, 300)}`);

      // Check if it's a slot conflict from GHL side
      if (appointmentRes.status === 422 || appointmentRes.status === 409) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "This time slot was just taken. Please select another time.",
            code: "slot_conflict",
          }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ ok: false, error: "Could not create appointment", code: "appointment_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appointmentData = await appointmentRes.json();
    const appointmentId = appointmentData?.id ?? appointmentData?.event?.id ?? null;
    console.log(`[book-appointment][${requestId}] Appointment created ✓ ID: ${appointmentId}`);

    // ─── STEP 4: Record handoff in DB ───
    const slotLabel = new Date(slot_start).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", timeZone: timezone,
    }) + " at " + new Date(slot_start).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true, timeZone: timezone,
    });

    const { data: handoff } = await supabase
      .from("lead_handoffs")
      .insert({
        lead_id,
        channel: "call",
        priority: "hot",
        status: "delivered",
        delivery_status: "confirmed",
        reason: `Booking via DCOS — ${intent ?? "explore"}`,
        summary_md: [
          `**Name:** ${name}`,
          `**Email:** ${email}`,
          `**Phone:** ${phone}`,
          `**Intent:** ${intent}`,
          message ? `**Note:** ${message}` : null,
          `**Slot:** ${slotLabel}`,
        ].filter(Boolean).join("\n"),
        recommended_next_step: "Strategy call",
        requested_slot_start: slot_start,
        requested_slot_label: slotLabel,
        calendar_event_id: appointmentId,
        contact_pref: "call",
      })
      .select("id")
      .single();

    console.log(`[book-appointment][${requestId}] Handoff recorded: ${handoff?.id}`);

    // ─── STEP 5: Fire notify-handoff (background) ───
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const nameParts = name.trim().split(" ");
    fetch(`${supabaseUrl}/functions/v1/notify-handoff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        contact: {
          email,
          phone,
          firstName: nameParts[0] ?? "",
          lastName: nameParts.slice(1).join(" ") ?? "",
        },
        context: {
          intent: intent ?? "explore",
          selena_lead_id: lead_id,
          lead_score: 90,
          priority: "hot",
          channel: "call",
          reason: `DCOS booking confirmed — ${slotLabel}`,
          summary_md: `Appointment confirmed for ${slotLabel}`,
          handoff_id: handoff?.id,
          appointment_id: appointmentId,
          ghl_contact_id: contactId,
        },
      }),
    }).catch((err) => {
      console.error(`[book-appointment][${requestId}] notify-handoff failed:`, err);
    });

    // ─── STEP 6: Log booking success ───
    await supabase.from("event_log").insert({
      session_id: lead_id,
      event_type: "booking_success",
      event_payload: {
        appointment_id: appointmentId,
        contact_id: contactId,
        slot_start,
        intent,
      },
    }).then(() => {});

    // ─── STEP 7: Return confirmation ───
    return new Response(
      JSON.stringify({
        ok: true,
        success: true,
        appointmentId,
        contactId,
        startTime: slot_start,
        endTime: slot_end,
        slotLabel,
        handoff_id: handoff?.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[book-appointment][${requestId}] Unhandled error:`, error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error", code: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
