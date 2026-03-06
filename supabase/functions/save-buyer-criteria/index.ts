/**
 * save-buyer-criteria
 *
 * Upserts a lead profile with off-market buyer search criteria.
 * Called from V2OffMarketBuyer after the 3-step form.
 *
 * Flow:
 *   1. Validate email + required criteria fields
 *   2. Rate limit (same pattern as upsert-lead-profile)
 *   3. Upsert lead_profiles (email as natural key)
 *      – sets intent: 'buy', source: 'off_market_capture'
 *      – writes buyer_criteria JSONB
 *   4. Tag the lead: ['off_market_buyer']
 *   5. Log to selena-log-event
 *   6. Return { ok: true, lead_id }
 */

import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

interface BuyerCriteria {
  areas: string[];
  budget_min: number;
  budget_max: number;
  bedrooms_min: number;
  property_type: string;
  timeline: string;
  must_haves: string[];
  additional_notes?: string;
}

interface SaveBuyerCriteriaInput {
  email: string;
  name?: string;
  phone?: string;
  language?: string;
  session_id?: string;
  source?: string;
  buyer_criteria: BuyerCriteria;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Rate limit
    const body: SaveBuyerCriteriaInput = await req.json();
    const rlKey = extractRateLimitKey(req, body as Record<string, unknown>);
    const { allowed } = await checkRateLimit(supabase, rlKey, "save-buyer-criteria");
    if (!allowed) return rateLimitResponse(corsHeaders);

    // Validate
    const email = (body.email || "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Valid email required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.buyer_criteria?.areas?.length) {
      return new Response(
        JSON.stringify({ ok: false, error: "At least one area is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    // Check existing lead first (to handle tag merging)
    const { data: existing } = await supabase
      .from("lead_profiles")
      .select("id, tags, intent")
      .eq("email", email)
      .single();

    let leadId: string;

    if (existing) {
      leadId = existing.id;
      const currentTags: string[] = existing.tags || [];
      const newTags = currentTags.includes("off_market_buyer")
        ? currentTags
        : [...currentTags, "off_market_buyer"];

      await supabase
        .from("lead_profiles")
        .update({
          intent: existing.intent || "buy",
          buyer_criteria: body.buyer_criteria,
          tags: newTags,
          language: body.language || "en",
        })
        .eq("id", leadId);

    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("lead_profiles")
        .insert({
          email,
          name: body.name?.trim() || null,
          phone: body.phone?.trim() || null,
          language: body.language || "en",
          intent: "buy",
          source: body.source || "off_market_capture",
          session_id: body.session_id || null,
          buyer_criteria: body.buyer_criteria,
          tags: ["off_market_buyer"],
          lead_score: 55,
          lead_grade: "B",
          created_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("[save-buyer-criteria] Insert error:", insertError);
        throw new Error("Failed to create lead profile");
      }

      leadId = inserted.id;
    }

    // Log event (non-fatal)
    try {
      await supabase.functions.invoke("selena-log-event", {
        body: {
          event_type: "lead_capture",
          lead_id: leadId,
          session_id: body.session_id,
          properties: {
            source: "off_market_capture",
            tool_used: "off_market_buyer",
            areas: body.buyer_criteria.areas,
            budget_max: body.buyer_criteria.budget_max,
            timeline: body.buyer_criteria.timeline,
          },
        },
      });
    } catch (_logErr) { /* non-fatal */ }

    console.log(`[save-buyer-criteria] Saved for ${email} (lead: ${leadId})`);

    return new Response(
      JSON.stringify({ ok: true, lead_id: leadId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[save-buyer-criteria] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
