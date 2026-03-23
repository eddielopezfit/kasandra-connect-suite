/**
 * receive-elevenlabs-webhook
 * Selena OS V2 — Priority 9: Voice/Web Bridge Foundation
 * 
 * Accepts ElevenLabs post-call webhook payload.
 * Bridges voice Selena identity with web Selena session.
 * 
 * To configure in ElevenLabs:
 *   Post-call webhook URL: https://sghuhlmsrmqryfvcbqqj.supabase.co/functions/v1/receive-elevenlabs-webhook
 *   Method: POST
 *   Secret header: x-elevenlabs-secret: <ELEVENLABS_WEBHOOK_SECRET>
 * 
 * Supabase secret required: ELEVENLABS_WEBHOOK_SECRET
 */
import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GHL_WEBHOOK_URL = Deno.env.get("GHL_WEBHOOK_URL") ?? "";

interface ElevenLabsWebhookPayload {
  // ElevenLabs standard post-call webhook shape
  conversation_id?: string;
  agent_id?: string;
  status?: string;
  metadata?: {
    phone?: string;
    caller_id?: string;
    call_duration?: number;
  };
  conversation_initiation_client_data?: {
    dynamic_variables?: Record<string, string>;
  };
  analysis?: {
    transcript_summary?: string;
    data_collection_results?: Record<string, { value?: string | boolean }>;
    call_successful?: string;
  };
  transcript?: Array<{ role: string; message: string; time_in_call_secs?: number }>;
}

function extractPhone(payload: ElevenLabsWebhookPayload): string | null {
  const raw = payload.metadata?.phone || payload.metadata?.caller_id || null;
  if (!raw) return null;
  return raw.replace(/\D/g, "").replace(/^1(\d{10})$/, "$1");
}

function buildTranscriptText(transcript?: Array<{ role: string; message: string }>): string {
  if (!transcript?.length) return "";
  return transcript.map(t => `${t.role === "user" ? "Caller" : "Selena"}: ${t.message}`).join("\n");
}

function extractDataField(
  results: Record<string, { value?: string | boolean }>,
  key: string
): string | null {
  const val = results[key]?.value;
  return val != null ? String(val) : null;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Validate webhook secret
  const secret = req.headers.get("x-elevenlabs-secret") || req.headers.get("xi-elevenlabs-secret");
  const expectedSecret = Deno.env.get("ELEVENLABS_WEBHOOK_SECRET");
  if (expectedSecret && secret !== expectedSecret) {
    console.warn("[receive-elevenlabs-webhook] Invalid webhook secret");
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const payload: ElevenLabsWebhookPayload = await req.json();
    console.log("[receive-elevenlabs-webhook] Received:", JSON.stringify(payload).slice(0, 500));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const phone = extractPhone(payload);
    const transcriptText = buildTranscriptText(payload.transcript);
    const summary = payload.analysis?.transcript_summary || "";
    const dataResults = payload.analysis?.data_collection_results || {};

    // Extract intent, name, address from ElevenLabs data collection
    const extractedName = extractDataField(dataResults, "caller_name") ||
      extractDataField(dataResults, "name") || null;
    const extractedIntent = extractDataField(dataResults, "intent") ||
      extractDataField(dataResults, "caller_intent") || null;
    const extractedSituation = extractDataField(dataResults, "situation") || null;
    const extractedAddress = extractDataField(dataResults, "property_address") ||
      extractDataField(dataResults, "address") || null;

    // Store voice session
    const { data: voiceSession } = await supabase
      .from("voice_sessions")
      .insert({
        phone,
        agent_id: payload.agent_id,
        call_duration_seconds: payload.metadata?.call_duration || null,
        conversation_summary: summary,
        extracted_intent: extractedIntent,
        extracted_situation: extractedSituation,
        extracted_address: extractedAddress,
        extracted_name: extractedName,
        raw_transcript: transcriptText,
        webhook_payload: payload as unknown as Record<string, unknown>,
      })
      .select("id")
      .single();

    // Try to match to existing lead by phone number
    let leadId: string | null = null;
    if (phone) {
      const { data: lead } = await supabase
        .from("lead_profiles")
        .select("id, ghl_contact_id, name")
        .eq("phone", phone)
        .maybeSingle();

      if (lead) {
        leadId = lead.id;
        // Update voice session with lead_id
        if (voiceSession?.id) {
          await supabase
            .from("voice_sessions")
            .update({ lead_id: leadId, ghl_synced: false })
            .eq("id", voiceSession.id);
        }
        // Update lead_profiles with voice summary
        await supabase
          .from("lead_profiles")
          .update({
            voice_session_summary: summary,
            last_voice_call_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", leadId);
      }
    }

    // Push to GHL webhook for contact creation/update
    if (GHL_WEBHOOK_URL) {
      const ghlPayload = {
        type: "voice_lead_completed",
        source: "elevenlabs_selena",
        phone,
        name: extractedName,
        intent: extractedIntent,
        situation: extractedSituation,
        property_address: extractedAddress,
        call_summary: summary,
        transcript_preview: transcriptText.slice(0, 1000),
        call_duration_seconds: payload.metadata?.call_duration || 0,
        lead_id: leadId,
        tags: [
          "voice_lead_completed",
          "selena_voice_call",
          extractedIntent === "sell" ? "selena - intent seller" : null,
          extractedIntent === "buy" ? "selena - intent buyer" : null,
          extractedIntent === "cash" ? "selena - intent cash" : null,
        ].filter(Boolean),
      };

      fetch(GHL_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ghlPayload),
      }).catch(e => console.warn("[receive-elevenlabs-webhook] GHL webhook failed:", e.message));
    }

    return new Response(JSON.stringify({ ok: true, lead_id: leadId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[receive-elevenlabs-webhook] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
