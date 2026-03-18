import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * check-availability
 * Returns real free slots from Kasandra's GHL Calendar API.
 * Calendar ID: N7himS3BLf5KxaVbQPz6 (Kasandra Prieto | Real Estate Consultation)
 * Location ID: kGfxAFqz1M7sxRFm52L1
 *
 * Upgraded from stub → real GHL Calendar API integration.
 * Falls back gracefully to booking page URL if API is unavailable.
 */

const GHL_CALENDAR_ID = "N7himS3BLf5KxaVbQPz6";
const GHL_LOCATION_ID = "kGfxAFqz1M7sxRFm52L1";
const BOOKING_PAGE_URL = "https://kasandraprietorealtor.com/book";

interface AvailabilityRequest {
  lead_id: string;
  channel: "call" | "zoom";
  preferred_window?: "today" | "tomorrow" | "next_3_days" | "next_7_days";
  timezone?: string;
}

interface TimeSlot {
  start: string;
  end: string;
  booking_url: string;
  display_time: string;
}

interface GHLSlot {
  startTime: string;
  endTime: string;
  slots?: string[];
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      lead_id,
      channel,
      preferred_window = "next_3_days",
      timezone = "America/Phoenix",
    }: AvailabilityRequest = await req.json();

    // Input validation
    if (!lead_id || !channel) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing required fields: lead_id, channel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["call", "zoom"].includes(channel)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid channel. Must be "call" or "zoom"' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lead_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid lead_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range based on preferred_window
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMinutes(startDate.getMinutes() + 30); // 30 min buffer from now

    let endDate = new Date(now);
    switch (preferred_window) {
      case "today":
        endDate.setHours(23, 59, 59, 999);
        break;
      case "tomorrow":
        endDate.setDate(endDate.getDate() + 2);
        endDate.setHours(23, 59, 59, 999);
        break;
      case "next_7_days":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "next_3_days":
      default:
        endDate.setDate(endDate.getDate() + 3);
        break;
    }

    // Fetch real slots from GHL Calendar API
    const ghlApiKey = Deno.env.get("GHL_PRIVATE_KEY");
    let slots: TimeSlot[] = [];
    let usedRealApi = false;

    if (ghlApiKey) {
      try {
        const params = new URLSearchParams({
          locationId: GHL_LOCATION_ID,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          timezone,
        });

        const ghlRes = await fetch(
          `https://services.leadconnectorhq.com/calendars/${GHL_CALENDAR_ID}/free-slots?${params}`,
          {
            headers: {
              Authorization: `Bearer ${ghlApiKey}`,
              Version: "2021-07-28",
              "Content-Type": "application/json",
            },
          }
        );

        if (ghlRes.ok) {
          const ghlData = await ghlRes.json();
          // GHL returns { _dates_: { [date]: { slots: string[] } } }
          const dateMap: Record<string, { slots: string[] }> =
            ghlData._dates_ ?? ghlData.data ?? {};

          const allSlots: string[] = [];
          for (const dateKey of Object.keys(dateMap).sort()) {
            const daySlots = dateMap[dateKey]?.slots ?? [];
            allSlots.push(...daySlots);
          }

          slots = allSlots.slice(0, 8).map((slotStart) => {
            const start = new Date(slotStart);
            const end = new Date(start.getTime() + 30 * 60 * 1000); // 30-min slot

            const displayTime = start.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: timezone,
            });
            const displayDate = start.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              timeZone: timezone,
            });

            const bookingUrl =
              `${BOOKING_PAGE_URL}?channel=${channel}&slot=${encodeURIComponent(start.toISOString())}&lead_id=${lead_id}&priority=hot&calendar=${GHL_CALENDAR_ID}`;

            return {
              start: start.toISOString(),
              end: end.toISOString(),
              booking_url: bookingUrl,
              display_time: `${displayDate} · ${displayTime}`,
            };
          });

          usedRealApi = true;
          console.log(
            `[check-availability] GHL API returned ${allSlots.length} slots, serving ${slots.length}`
          );
        } else {
          console.warn(
            `[check-availability] GHL API returned ${ghlRes.status} — falling back to booking page`
          );
        }
      } catch (apiErr) {
        console.error("[check-availability] GHL API error:", apiErr);
      }
    } else {
      console.warn("[check-availability] GHL_PRIVATE_KEY not set — returning booking page fallback");
    }

    // Fallback: if no real slots, return a single CTA pointing to the booking page
    if (slots.length === 0) {
      slots = [
        {
          start: startDate.toISOString(),
          end: new Date(startDate.getTime() + 30 * 60 * 1000).toISOString(),
          booking_url: `${BOOKING_PAGE_URL}?lead_id=${lead_id}&channel=${channel}&priority=hot`,
          display_time: "View Available Times →",
        },
      ];
    }

    return new Response(
      JSON.stringify({
        ok: true,
        slots,
        source: usedRealApi ? "ghl_calendar" : "booking_page_fallback",
        calendar_id: GHL_CALENDAR_ID,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-availability] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
