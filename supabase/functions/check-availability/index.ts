import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * check-availability
 * Returns real free slots from Kasandra's GHL Calendar API.
 * Calendar ID: SRRfanKgjVH2Gk9auQRH
 * 
 * Production GHL Calendar integration.
 * Falls back gracefully if API is unavailable.
 */

const GHL_BASE_URL = "https://services.leadconnectorhq.com";
const GHL_CALENDAR_ID = "SRRfanKgjVH2Gk9auQRH";
const MAX_SLOTS = 8;

interface AvailabilityRequest {
  lead_id: string;
  channel: "call" | "zoom";
  preferred_window?: "today" | "tomorrow" | "next_3_days" | "next_7_days";
  timezone?: string;
  action?: "health";
}

interface TimeSlot {
  start: string;
  end: string;
  display_time: string;
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

    const body: AvailabilityRequest = await req.json();

    // Rate limiting (skip for health checks)
    if (body.action !== "health") {
      const rlKey = extractRateLimitKey(req, body);
      const rl = await checkRateLimit(supabase, rlKey, "check-availability");
      if (!rl.allowed) return rateLimitResponse(corsHeaders);
    }

    const ghlApiKey = Deno.env.get("GHL_PRIVATE_KEY");

    // ============= HEALTH CHECK MODE =============
    if (body.action === "health") {
      console.log(`[check-availability][${requestId}] Health check`);
      let apiStatus: "success" | "failed" = "failed";
      let slotsFound = 0;

      if (ghlApiKey) {
        try {
          const now = new Date();
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() + 1);

          const params = new URLSearchParams({
            startDate: String(now.getTime()),
            endDate: String(endDate.getTime()),
            timezone: "America/Phoenix",
          });

          const res = await fetch(
            `${GHL_BASE_URL}/calendars/${GHL_CALENDAR_ID}/free-slots?${params}`,
            {
              headers: {
                Authorization: `Bearer ${ghlApiKey}`,
                Version: "2021-07-28",
              },
            }
          );

          if (res.ok) {
            apiStatus = "success";
            const data = await res.json();
            const dateMap = data?._dates_ ?? data?.data ?? {};
            for (const dateKey of Object.keys(dateMap)) {
              slotsFound += dateMap[dateKey]?.slots?.length ?? 0;
            }
          } else {
            await res.text(); // consume body
          }
        } catch (e) {
          console.error(`[check-availability][${requestId}] Health error:`, e);
        }
      }

      return new Response(
        JSON.stringify({
          ok: true,
          has_api_key: !!ghlApiKey,
          api_connection_status: apiStatus,
          slots_found: slotsFound,
          calendar_id: GHL_CALENDAR_ID,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ============= STANDARD AVAILABILITY CHECK =============
    const {
      lead_id,
      channel,
      preferred_window = "next_3_days",
      timezone = "America/Phoenix",
    } = body;

    console.log(`[check-availability][${requestId}] lead=${lead_id}, window=${preferred_window}`);

    if (!lead_id || !channel) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing lead_id or channel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setMinutes(startDate.getMinutes() + 30);

    const endDate = new Date(now);
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

    let slots: TimeSlot[] = [];
    let source: "ghl_calendar" | "unavailable" = "unavailable";
    let fallback_reason: string | null = null;

    if (!ghlApiKey) {
      console.error(`[check-availability][${requestId}] GHL_PRIVATE_KEY not set`);
      fallback_reason = "api_key_missing";
    } else {
      try {
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          timezone,
        });

        const ghlRes = await fetch(
          `${GHL_BASE_URL}/calendars/${GHL_CALENDAR_ID}/free-slots?${params}`,
          {
            headers: {
              Authorization: `Bearer ${ghlApiKey}`,
              Version: "2021-07-28",
            },
          }
        );

        console.log(`[check-availability][${requestId}] GHL status: ${ghlRes.status}`);

        if (ghlRes.ok) {
          const ghlData = await ghlRes.json();
          const dateMap: Record<string, { slots: string[] }> =
            ghlData._dates_ ?? ghlData.data ?? {};

          const allSlots: string[] = [];
          for (const dateKey of Object.keys(dateMap).sort()) {
            allSlots.push(...(dateMap[dateKey]?.slots ?? []));
          }

          slots = allSlots.slice(0, MAX_SLOTS).map((slotStart) => {
            const start = new Date(slotStart);
            const end = new Date(start.getTime() + 30 * 60 * 1000);

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

            return {
              start: start.toISOString(),
              end: end.toISOString(),
              display_time: `${displayDate} · ${displayTime}`,
            };
          });

          source = "ghl_calendar";
          console.log(`[check-availability][${requestId}] ${allSlots.length} total → serving ${slots.length}`);
        } else {
          const errBody = await ghlRes.text().catch(() => "");
          console.error(`[check-availability][${requestId}] GHL ${ghlRes.status}: ${errBody.slice(0, 200)}`);
          fallback_reason = `api_error_${ghlRes.status}`;
        }
      } catch (apiErr) {
        console.error(`[check-availability][${requestId}] Network error:`, apiErr);
        fallback_reason = "network_error";
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        slots,
        source,
        calendar_id: GHL_CALENDAR_ID,
        ...(fallback_reason ? { fallback_reason } : {}),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`[check-availability][${requestId}] Unhandled error:`, error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
