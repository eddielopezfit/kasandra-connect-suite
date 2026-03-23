import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeTimeline, computeLeadScore } from "../_shared/normalizeLead.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

/**
 * submit-valuation-request
 * High-intent seller lead from /home-valuation CMA request form.
 *
 * Revision 1: Property details stored in handoff payload, NOT in buyer_criteria.
 * Revision 2: name, email, phone all required.
 * Revision 3: source=website, tool_origin=home_valuation.
 */

interface ValuationPayload {
  name: string;
  email: string;
  phone: string;
  propertyAddress: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  condition?: string;
  yearBuilt?: string;
  estimatedValue?: number;
  timeline?: string;
  sessionId?: string;
  language?: string;
  consent?: boolean;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: ValuationPayload = await req.json();

    // Rate limiting
    const rlUrl = Deno.env.get("SUPABASE_URL");
    const rlKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (rlUrl && rlKey) {
      const rlClient = createClient(rlUrl, rlKey);
      const rlk = extractRateLimitKey(req, payload as any);
      const rl = await checkRateLimit(rlClient, rlk, "submit-valuation-request");
      if (!rl.allowed) return rateLimitResponse(corsHeaders);
    }

    // Validation — all 3 fields required (Revision 2)
    if (!payload.name?.trim() || !payload.email?.trim() || !payload.phone?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Name, email, and phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!payload.propertyAddress?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Property address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build property details for handoff (Revision 1: NOT stored in buyer_criteria)
    const propertyDetails = {
      address: payload.propertyAddress.trim().slice(0, 200),
      beds: payload.beds || null,
      baths: payload.baths || null,
      sqft: payload.sqft || null,
      condition: payload.condition?.trim().slice(0, 50) || null,
      year_built: payload.yearBuilt?.trim().slice(0, 4) || null,
    };

    const normalizedTimeline = normalizeTimeline(payload.timeline);

    // Upsert lead_profiles with source=website, tool_origin=home_valuation (Revision 3)
    let canonicalLeadId: string;

    const { data: existingLead } = await supabase
      .from("lead_profiles")
      .select("id, lead_score")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const leadPayload = {
      name: payload.name.trim().slice(0, 100),
      phone: payload.phone.trim().slice(0, 20),
      intent: "sell",
      timeline: normalizedTimeline.canonical,
      source: "website",
      language: payload.language || "en",
      session_id: payload.sessionId || null,
      tags: ["valuation_request", "tool_origin:home_valuation"],
    };

    if (existingLead) {
      await supabase
        .from("lead_profiles")
        .update(leadPayload)
        .eq("id", existingLead.id);
      canonicalLeadId = existingLead.id;
    } else {
      const { data: newProfile, error: insertErr } = await supabase
        .from("lead_profiles")
        .insert({ email: normalizedEmail, ...leadPayload })
        .select("id")
        .single();

      if (insertErr) {
        console.error("[submit-valuation-request] Insert error:", insertErr);
        return new Response(
          JSON.stringify({ ok: false, error: "Failed to create lead" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      canonicalLeadId = newProfile.id;
    }

    // Compute lead score
    const scoreResult = computeLeadScore({
      intent_canonical: "sell",
      timeline_canonical: normalizedTimeline.canonical,
      phone: payload.phone,
      property_address: payload.propertyAddress,
      tool_used: "home_valuation",
      consent_communications: payload.consent === true,
    });

    await supabase
      .from("lead_profiles")
      .update({
        lead_score: scoreResult.lead_score,
        lead_grade: scoreResult.lead_grade,
      })
      .eq("id", canonicalLeadId);

    // Build summary for handoff (property details live HERE, Revision 1)
    const summaryMd = `**Valuation Request — ${propertyDetails.address}**\n\n` +
      `- **Name:** ${leadPayload.name}\n` +
      `- **Phone:** ${leadPayload.phone}\n` +
      `- **Email:** ${normalizedEmail}\n` +
      `- **Beds:** ${propertyDetails.beds || "N/A"} · **Baths:** ${propertyDetails.baths || "N/A"}\n` +
      `- **Sqft:** ${propertyDetails.sqft || "N/A"}\n` +
      `- **Condition:** ${propertyDetails.condition || "N/A"}\n` +
      `- **Year Built:** ${propertyDetails.year_built || "N/A"}\n` +
      `- **Timeline:** ${normalizedTimeline.raw || "Not specified"}\n` +
      `- **Lead Grade:** ${scoreResult.lead_grade} (${scoreResult.lead_score}/100)\n` +
      `- **Tool Origin:** home_valuation`;

    const summaryJson = {
      intent: "sell",
      timeline: normalizedTimeline.raw,
      condition: propertyDetails.condition,
      address_if_known: propertyDetails.address,
      property_details: propertyDetails,
      tool_origin: "home_valuation",
      urgency_level: scoreResult.lead_score_bucket,
    };

    // Create handoff — high-intent seller
    const { error: handoffErr } = await supabase
      .from("lead_handoffs")
      .insert({
        lead_id: canonicalLeadId,
        channel: "call",
        priority: scoreResult.lead_score_bucket === "hot" ? "hot" : "warm",
        reason: "Valuation request — personalized CMA",
        summary_md: summaryMd,
        convo_summary_json: summaryJson,
        recommended_next_step: "Prepare CMA for property",
        contact_pref: "call",
      });

    if (handoffErr) {
      console.error("[submit-valuation-request] Handoff error:", handoffErr);
    }

    // Notify Kasandra via notify-handoff (canonical enriched GHL payload)
    // Routes through notify-handoff for consistent field mapping, tag derivation,
    // and GHL failure observability — same path as create-handoff.
    const nameParts = leadPayload.name.trim().split(" ");
    fetch(`${supabaseUrl}/functions/v1/notify-handoff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        contact: {
          email: normalizedEmail,
          firstName: nameParts[0] ?? leadPayload.name,
          lastName: nameParts.slice(1).join(" ") ?? "",
          phone: leadPayload.phone,
        },
        context: {
          intent: "sell",
          language: payload.language || "en",
          selena_lead_id: canonicalLeadId,
          session_id: payload.sessionId || null,
          // Use lead_score (not readiness_score) for priority derivation
          readiness_score: scoreResult.lead_score,
          lead_score: scoreResult.lead_score,
          lead_grade: scoreResult.lead_grade,
          // Score bucket tags — drives GHL workflow branching
          journey_state: scoreResult.lead_score_bucket === "hot" ? "decide" : "qualify",
          tool_used: "home_valuation",
          entry_source: "website",
          source: "website",
          tool_origin: "home_valuation",
          // Property details
          property_address: propertyDetails.address,
          estimated_value: payload.estimatedValue || null,
          timeline: normalizedTimeline.raw || null,
          timeline_raw: normalizedTimeline.raw || null,
          // Consent
          sms_consent: payload.consent === true,
          ai_disclosure_accepted: payload.consent === true,
          // Score context
          urgency_level: scoreResult.lead_score_bucket,
        },
      }),
    }).catch((e) => console.warn("[submit-valuation-request] notify-handoff failed:", e));

    // Log event
    if (payload.sessionId) {
      await supabase.from("event_log").insert({
        session_id: payload.sessionId,
        event_type: "valuation_request_completed",
        event_payload: {
          lead_id: canonicalLeadId,
          tool_origin: "home_valuation",
          lead_grade: scoreResult.lead_grade,
          has_address: true,
        },
      });

      // P3: Write property_address to session_snapshot for Selena context
      try {
        const { data: existingSnap } = await supabase
          .from("session_snapshots")
          .select("id, context_json")
          .eq("session_id", payload.sessionId)
          .maybeSingle();

        const existingCtx = (existingSnap?.context_json as Record<string, unknown>) || {};
        const updatedCtx = {
          ...existingCtx,
          property_address: propertyDetails.address,
          estimated_value: payload.estimatedValue || existingCtx.estimated_value,
        };

        if (existingSnap) {
          await supabase
            .from("session_snapshots")
            .update({
              lead_id: canonicalLeadId,
              intent: "sell",
              context_json: updatedCtx,
            })
            .eq("id", existingSnap.id);
        } else {
          await supabase
            .from("session_snapshots")
            .insert({
              session_id: payload.sessionId,
              lead_id: canonicalLeadId,
              intent: "sell",
              context_json: updatedCtx,
            });
        }
        console.log("[submit-valuation-request] P3: Property address written to session_snapshot");
      } catch (snapErr) {
        console.error("[submit-valuation-request] P3 snapshot update failed:", snapErr);
      }
    }

    console.log("[submit-valuation-request] Success:", {
      lead_id: canonicalLeadId,
      grade: scoreResult.lead_grade,
      is_new: !existingLead,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        lead_id: canonicalLeadId,
        is_new: !existingLead,
        lead_grade: scoreResult.lead_grade,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[submit-valuation-request] Error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
