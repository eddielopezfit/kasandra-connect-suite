import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { normalizeIntent, normalizeTimeline, normalizeCondition, normalizeSituation, computeLeadScore, shouldSkipScoreLog } from "../_shared/normalizeLead.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SellerLeadPayload {
  name: string;
  email: string;
  propertyAddress?: string;
  situation?: string;
  condition?: string;
  timeline?: string;
  estimatedValue?: string;
  calculatedCashOffer?: number;
  calculatedListingNet?: number;
  sessionId?: string;
  language?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SellerLeadPayload = await req.json();

    if (!payload.name || !payload.email) {
      console.error("Validation failed: Missing name or email");
      return new Response(
        JSON.stringify({ ok: false, error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      console.error("Validation failed: Invalid email format");
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = payload.email.trim().toLowerCase();

    const sanitizedPayload = {
      name: payload.name.trim().slice(0, 100),
      email: normalizedEmail.slice(0, 255),
      property_address: payload.propertyAddress?.trim().slice(0, 200) || null,
      situation: payload.situation?.trim().slice(0, 50) || null,
      condition: payload.condition?.trim().slice(0, 50) || null,
      timeline: payload.timeline?.trim().slice(0, 50) || null,
      estimated_value: payload.estimatedValue?.trim().slice(0, 50) || null,
      calculated_cash_offer: payload.calculatedCashOffer || null,
      calculated_listing_net: payload.calculatedListingNet || null,
      source: 'seller_funnel'
    };

    console.log("[submit-seller] Processing seller lead:", { 
      email: sanitizedPayload.email,
      situation: sanitizedPayload.situation,
      hasAddress: !!sanitizedPayload.property_address,
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Save to seller_leads (existing behavior) ──
    const { data: existing } = await supabase
      .from('seller_leads')
      .select('id, name, situation, condition, timeline')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    let sellerLeadData;
    let isNew = true;

    if (existing) {
      isNew = false;
      console.log("[submit-seller] Updating existing seller lead:", existing.id);
      
      const { data, error: updateError } = await supabase
        .from('seller_leads')
        .update({
          name: sanitizedPayload.name,
          situation: sanitizedPayload.situation || existing.situation,
          condition: sanitizedPayload.condition || existing.condition,
          timeline: sanitizedPayload.timeline || existing.timeline,
          estimated_value: sanitizedPayload.estimated_value,
          calculated_cash_offer: sanitizedPayload.calculated_cash_offer,
          calculated_listing_net: sanitizedPayload.calculated_listing_net,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("[submit-seller] Database update error:", updateError);
        return new Response(
          JSON.stringify({ ok: false, error: "Failed to update lead" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      sellerLeadData = data;
    } else {
      const { data, error: insertError } = await supabase
        .from('seller_leads')
        .insert(sanitizedPayload)
        .select()
        .single();

      if (insertError) {
        console.error("[submit-seller] Database insert error:", insertError);
        return new Response(
          JSON.stringify({ ok: false, error: "Failed to save lead" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      sellerLeadData = data;
    }

    console.log("[submit-seller] Lead saved to seller_leads:", { id: sellerLeadData.id, isNew });

    // ── Upsert into lead_profiles (Phase E — Guardrail 1: email + session dedup) ──
    const normalizedTimeline = normalizeTimeline(sanitizedPayload.timeline);
    let canonicalLeadId: string;

    // Guardrail 1: Primary match on email, secondary on session_id
    let profileMatch = await supabase
      .from('lead_profiles')
      .select('id, lead_score')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (!profileMatch.data && payload.sessionId) {
      // Secondary: check if session_id maps to an existing lead
      profileMatch = await supabase
        .from('lead_profiles')
        .select('id, lead_score')
        .eq('session_id', payload.sessionId)
        .maybeSingle();
    }

    if (profileMatch.data) {
      // Update existing lead_profiles row
      await supabase
        .from('lead_profiles')
        .update({
          name: sanitizedPayload.name,
          intent: 'sell',
          timeline: normalizedTimeline.canonical,
          situation: normalizeSituation(sanitizedPayload.situation),
          condition: normalizeCondition(sanitizedPayload.condition),
          source: 'seller_funnel',
          session_id: payload.sessionId || null,
        })
        .eq('id', profileMatch.data.id);

      canonicalLeadId = profileMatch.data.id;
    } else {
      // Insert new lead_profiles row
      const { data: newProfile, error: profileInsertErr } = await supabase
        .from('lead_profiles')
        .insert({
          email: normalizedEmail,
          name: sanitizedPayload.name,
          language: payload.language || 'en',
          intent: 'sell',
          timeline: normalizedTimeline.canonical,
          situation: normalizeSituation(sanitizedPayload.situation),
          condition: normalizeCondition(sanitizedPayload.condition),
          source: 'seller_funnel',
          session_id: payload.sessionId || null,
        })
        .select('id')
        .single();

      if (profileInsertErr) {
        console.error("[submit-seller] lead_profiles insert error:", profileInsertErr);
        // Non-fatal — seller_leads was already saved
        canonicalLeadId = sellerLeadData.id;
      } else {
        canonicalLeadId = newProfile.id;
      }
    }

    // ── Lead Scoring (Phase E) ──
    // Guardrail 2: quiz_completed only if at least 3 of 4 quiz fields are non-empty
    const quizFields = [sanitizedPayload.situation, sanitizedPayload.condition, sanitizedPayload.timeline, sanitizedPayload.estimated_value];
    const filledQuizFields = quizFields.filter(f => f && f.trim()).length;
    const quizCompleted = filledQuizFields >= 3;

    const scoreResult = computeLeadScore({
      intent_canonical: 'sell',
      timeline_canonical: normalizedTimeline.canonical,
      quiz_completed: quizCompleted,
      phone: null, // ad funnel doesn't collect phone
      property_address: sanitizedPayload.property_address,
      tool_used: 'seller_quiz',
      readiness_score: null,
      consent_communications: false, // Guardrail 3: no consent checkbox in ad funnel
      has_viewed_report: false,
    });

    console.log("[submit-seller] Lead score computed:", scoreResult);

    // Persist score + grade to lead_profiles
    await supabase
      .from('lead_profiles')
      .update({ lead_score: scoreResult.lead_score, lead_grade: scoreResult.lead_grade })
      .eq('id', canonicalLeadId);

    // Deduped event log (Guardrail 4)
    const skipLog = await shouldSkipScoreLog(supabase, canonicalLeadId, scoreResult.lead_score);
    if (!skipLog) {
      await supabase.from('event_log').insert({
        event_type: 'lead_score_computed',
        session_id: canonicalLeadId,
        event_payload: {
          lead_id: canonicalLeadId,
          seller_lead_id: sellerLeadData.id,
          session_id: payload.sessionId || null,
          lead_score: scoreResult.lead_score,
          lead_score_bucket: scoreResult.lead_score_bucket,
          score_reasons: scoreResult.score_reasons,
          quiz_fields_filled: filledQuizFields,
        },
      });
    }

    // ── GHL Webhook ──
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
    let ghlSynced = false;
    
    if (ghlWebhookUrl) {
      try {
        const nameParts = sanitizedPayload.name.split(' ');
        const firstName = nameParts[0] || sanitizedPayload.name;
        const lastName = nameParts.slice(1).join(' ') || '';

        const situationTagMap: Record<string, string[]> = {
          inherited: ['Legacy Property Seller', 'situation_inherited'],
          relocating: ['Relocation Seller', 'situation_relocating'],
          downsizing: ['Downsizing Seller', 'situation_downsizing'],
          divorce: ['Divorce Situation', 'situation_divorce'],
          tired_landlord: ['Tired Landlord', 'situation_tired_landlord'],
          other: ['situation_other'],
        };
        const conditionTagMap: Record<string, string> = {
          excellent: 'condition_move_in_ready',
          good: 'condition_minor_repairs',
          fair: 'condition_needs_work',
          poor: 'condition_distressed',
        };
        const timelineTagMap: Record<string, string> = {
          asap: 'timeline_urgent',
          soon: 'timeline_30_days',
          flexible: 'timeline_flexible',
          'no-rush': 'timeline_no_rush',
        };

        const baseTags = ["Seller Funnel", "seller_funnel"];
        const situationTags = sanitizedPayload.situation 
          ? (situationTagMap[sanitizedPayload.situation] || [`situation_${sanitizedPayload.situation}`]) 
          : [];
        const conditionTag = sanitizedPayload.condition 
          ? (conditionTagMap[sanitizedPayload.condition] || `condition_${sanitizedPayload.condition}`)
          : null;
        const timelineTag = sanitizedPayload.timeline 
          ? (timelineTagMap[sanitizedPayload.timeline] || `timeline_${sanitizedPayload.timeline}`)
          : null;

        const allTags = [
          ...baseTags,
          ...situationTags,
          conditionTag,
          timelineTag,
          payload.language === 'es' ? 'spanish_speaker' : 'english_speaker',
          quizCompleted ? 'quiz_completed' : null,
        ].filter(Boolean) as string[];

        const ghlPayload = {
          email: sanitizedPayload.email,
          name: sanitizedPayload.name,
          firstName,
          lastName,
          tags: allTags,
          
          // STANDARDIZED selena_* top-level keys
          selena_lead_id: canonicalLeadId,
          selena_session_id: payload.sessionId || null,
          selena_intent_canonical: 'sell',
          selena_language_raw: payload.language || 'en',
          selena_timeline_raw: sanitizedPayload.timeline || null,
          selena_budget_raw: sanitizedPayload.estimated_value || null,
          selena_target_neighborhoods: null,
          selena_property_address: sanitizedPayload.property_address || null,
          selena_is_pre_approved: 'No',
          selena_lead_score: scoreResult.lead_score,
          
          customField: {
            lead_id: canonicalLeadId,
            seller_lead_id: sellerLeadData.id,
            situation: sanitizedPayload.situation,
            condition: sanitizedPayload.condition,
            timeline: sanitizedPayload.timeline,
            estimated_value: sanitizedPayload.estimated_value,
            property_address: sanitizedPayload.property_address,
            cash_offer: sanitizedPayload.calculated_cash_offer,
            listing_net: sanitizedPayload.calculated_listing_net,
            // Phase E scoring
            lead_score: scoreResult.lead_score,
            lead_score_bucket: scoreResult.lead_score_bucket,
            lead_score_reasons: scoreResult.score_reasons,
          },
          source: "Seller Funnel - Tucson Inherited Homes"
        };

        console.log("[submit-seller] Sending to GHL webhook with scoring...");
        
        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ghlPayload),
        });

        if (!ghlResponse.ok) {
          console.error("[submit-seller] GHL webhook failed:", ghlResponse.status);
          await supabase.from('event_log').insert({
            event_type: 'ghl_sync_failed',
            session_id: canonicalLeadId,
            event_payload: { lead_id: canonicalLeadId, error: `HTTP ${ghlResponse.status}`, funnel: 'seller' },
          });
        } else {
          ghlSynced = true;
          console.log("[submit-seller] GHL webhook success");

          // Update ghl_synced_at on lead_profiles
          await supabase
            .from('lead_profiles')
            .update({ ghl_synced_at: new Date().toISOString() })
            .eq('id', canonicalLeadId);
        }
      } catch (ghlError) {
        console.error("[submit-seller] GHL webhook error:", ghlError);
        await supabase.from('event_log').insert({
          event_type: 'ghl_sync_failed',
          session_id: canonicalLeadId,
          event_payload: { lead_id: canonicalLeadId, error: ghlError instanceof Error ? ghlError.message : 'Unknown error', funnel: 'seller' },
        });
      }
    } else {
      console.warn("[submit-seller] GHL_WEBHOOK_URL not configured");
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        message: "Lead submitted successfully",
        lead_id: canonicalLeadId,
        seller_lead_id: sellerLeadData.id,
        is_new: isNew,
        ghl_synced: ghlSynced,
        lead_score: scoreResult.lead_score,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("[submit-seller] Unexpected error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
