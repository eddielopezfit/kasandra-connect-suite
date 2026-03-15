import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeLeadScore, shouldSkipScoreLog } from "../_shared/normalizeLead.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

/**
 * update-lead-score
 * SECURITY: Rate limited to 10 req/min per session/IP.
 * Prevents anonymous callers from bulk-corrupting lead scoring data. [audit CRIT-04]
 */

interface UpdateScoreInput {
  lead_id: string;
  session_id?: string;
  tool_used?: string;
  readiness_score?: number;
  primary_priority?: string;
  has_viewed_report?: boolean;
  quiz_completed?: boolean;
  page_path?: string;
  language?: string;
  intent?: string;
  timeline?: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: UpdateScoreInput = await req.json();

    if (!input.lead_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "lead_id is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: 10 req/min per session/IP — prevents bulk lead score corruption
    const rlKey = extractRateLimitKey(req, input);
    const rl = await checkRateLimit(supabase, rlKey, 'update-lead-score', 10);
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    // Fetch existing lead to merge signals
    const { data: lead, error: fetchError } = await supabase
      .from('lead_profiles')
      .select('id, email, intent, timeline, phone, lead_score, source')
      .eq('id', input.lead_id)
      .maybeSingle();

    if (fetchError || !lead) {
      console.error("[update-lead-score] Lead not found:", input.lead_id, fetchError);
      return new Response(
        JSON.stringify({ ok: false, error: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Merge: incoming signals overlay existing lead data (input wins over stored)
    const mergedIntent = input.intent || lead.intent || null;
    const mergedTimeline = input.timeline || lead.timeline || null;

    const scoreResult = computeLeadScore({
      intent_canonical: mergedIntent,
      timeline_canonical: mergedTimeline,
      quiz_completed: input.quiz_completed || false,
      phone: lead.phone || null,
      property_address: null, // not passed in this lightweight call
      tool_used: input.tool_used || null,
      readiness_score: input.readiness_score || null,
      consent_communications: false,
      has_viewed_report: input.has_viewed_report || false,
    });

    // Scores only go UP — never regress a lead
    const finalScore = Math.max(scoreResult.lead_score, lead.lead_score || 0);
    const finalGrade = finalScore >= 75 ? 'A' : finalScore >= 45 ? 'B' : finalScore >= 25 ? 'C' : 'D';
    const finalBucket = finalScore >= 75 ? 'hot' : finalScore >= 45 ? 'warm' : 'cold';

    // If new signals produced a higher score, use those reasons; otherwise note carried-forward
    const finalReasons = finalScore > scoreResult.lead_score
      ? `carried_forward(${lead.lead_score})|new_signals(${scoreResult.lead_score}):${scoreResult.score_reasons}`
      : scoreResult.score_reasons;

    console.log("[update-lead-score] Computed:", {
      lead_id: lead.id,
      old_score: lead.lead_score,
      computed_score: scoreResult.lead_score,
      final_score: finalScore,
      reasons: finalReasons,
    });

    // Persist score + grade (only if changed)
    if (finalScore !== (lead.lead_score || 0)) {
      await supabase
        .from('lead_profiles')
        .update({ lead_score: finalScore, lead_grade: finalGrade })
        .eq('id', lead.id);
    }

    // Deduped event log (Guardrail 4)
    const skipLog = await shouldSkipScoreLog(supabase, lead.id, finalScore);
    if (!skipLog) {
      await supabase.from('event_log').insert({
        event_type: 'lead_score_computed',
        session_id: lead.id,
        event_payload: {
          lead_id: lead.id,
          session_id: input.session_id || null,
          trigger: 'tool_completion',
          tool_used: input.tool_used || null,
          readiness_score: input.readiness_score || null,
          primary_priority: input.primary_priority || null,
          lead_score: finalScore,
          lead_score_bucket: finalBucket,
          score_reasons: finalReasons,
          page_path: input.page_path || null,
        },
      });
    }

    // Optional GHL score-only update
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
    let ghlSynced = false;

    if (ghlWebhookUrl && finalScore !== (lead.lead_score || 0)) {
      try {
        const ghlPayload = {
          email: lead.email,
          selena_lead_id: lead.id,
          selena_lead_score: finalScore,
          tags: [
            `score_${finalBucket}`,
            input.tool_used ? `tool_${input.tool_used}` : null,
          ].filter(Boolean),
          customField: {
            lead_id: lead.id,
            lead_score: finalScore,
            lead_score_bucket: finalBucket,
            lead_score_reasons: finalReasons,
            tool_used: input.tool_used || null,
            readiness_score: input.readiness_score || null,
          },
        };

        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ghlPayload),
        });

        if (ghlResponse.ok) {
          ghlSynced = true;
          await supabase
            .from('lead_profiles')
            .update({ ghl_synced_at: new Date().toISOString() })
            .eq('id', lead.id);
        } else {
          const errorText = await ghlResponse.text();
          console.error("[update-lead-score] GHL failed:", { status: ghlResponse.status, error: errorText });
          await supabase.from('event_log').insert({
            event_type: 'ghl_sync_failed',
            session_id: input.session_id || lead.id,
            event_payload: {
              lead_id: lead.id,
              funnel: 'update-lead-score',
              error: errorText?.slice(0, 500) || 'unknown',
              status: ghlResponse.status,
            },
          });
        }
      } catch (ghlErr) {
        console.error("[update-lead-score] GHL error:", ghlErr);
        await supabase.from('event_log').insert({
          event_type: 'ghl_sync_failed',
          session_id: input.session_id || lead.id,
          event_payload: {
            lead_id: lead.id,
            funnel: 'update-lead-score',
            error: String((ghlErr as Error)?.message ?? ghlErr),
          },
        });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        lead_id: lead.id,
        lead_score: finalScore,
        lead_score_bucket: finalBucket,
        score_changed: finalScore !== (lead.lead_score || 0),
        ghl_synced: ghlSynced,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[update-lead-score] Unexpected error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
