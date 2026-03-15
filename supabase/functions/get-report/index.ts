import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

interface GetReportRequest {
  lead_id: string;
  report_id: string;
  /**
   * session_id: Optional session ownership token.
   * When provided, we cross-check it against the session_id stored in lead_profiles
   * to prevent UUID-based unauthorized access. [audit SEC-05]
   * Not required for backward compat but logged when missing.
   */
  session_id?: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead_id, report_id, session_id }: GetReportRequest = await req.json();

    // Validate required fields
    if (!lead_id || !report_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing lead_id or report_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate UUID format
    if (!isValidUUID(lead_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid lead_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!isValidUUID(report_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid report_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for privileged access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit (30 req/hour per IP)
    const rlKey = extractRateLimitKey(req, { lead_id, session_id } as Record<string, unknown>);
    const { allowed } = await checkRateLimit(supabase, rlKey, 'get-report');
    if (!allowed) return rateLimitResponse(corsHeaders);

    // Session ownership verification [audit SEC-05]
    // When session_id is provided, verify it matches the stored session for this lead
    if (session_id) {
      const { data: leadCheck } = await supabase
        .from("lead_profiles")
        .select("session_id")
        .eq("id", lead_id)
        .maybeSingle();

      if (leadCheck && leadCheck.session_id && leadCheck.session_id !== session_id) {
        console.warn("[get-report] Session mismatch for lead_id:", lead_id);
        return new Response(
          JSON.stringify({ ok: false, error: "Report not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.warn("[get-report] No session_id provided for lead_id:", lead_id, "— access without session verification");
    }

    // Query the report with both id and lead_id for security
    const { data: report, error } = await supabase
      .from("lead_reports")
      .select("id, lead_id, report_type, report_markdown, requires_verification, unlocked_at, created_at")
      .eq("id", report_id)
      .eq("lead_id", lead_id)
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ ok: false, error: "Database query failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!report) {
      return new Response(
        JSON.stringify({ ok: false, error: "Report not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        report: {
          id: report.id,
          lead_id: report.lead_id,
          report_type: report.report_type,
          report_markdown: report.report_markdown,
          requires_verification: report.requires_verification,
          unlocked_at: report.unlocked_at,
          created_at: report.created_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("get-report error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
