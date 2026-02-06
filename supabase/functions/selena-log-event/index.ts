/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SELENA LOG EVENT - Telemetry + CRM Notification Edge Function
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Handles all Selena events with special handling for booking intent signals:
 * 
 * SPECIAL EVENTS:
 *   - book_click: Tags contact in GHL + notifies Kasandra (human handoff requested)
 *   - priority_call_click: Similar to book_click, routes to priority queue
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Events that trigger GHL notification (human handoff signal)
const HANDOFF_EVENTS = new Set([
  'book_click',
  'priority_call_click',
  'handoff_channel_select',
  'handoff_booking_click',
]);

interface LogEventRequest {
  sessionId: string;
  eventType: string;
  payload?: Record<string, unknown>;
}

/**
 * Sends a handoff notification to GHL when booking intent is signaled
 */
async function notifyGHLBookingIntent(
  sessionId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; notificationId?: string }> {
  const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
  
  if (!ghlWebhookUrl) {
    console.warn('[selena-log-event] GHL_WEBHOOK_URL not configured - skipping notification');
    return { ok: false };
  }

  try {
    // Build notification payload
    const ghlPayload = {
      // Source identification
      source: 'selena_booking_intent',
      event_type: eventType,
      
      // Session context
      session_id: sessionId,
      page_path: payload.route || payload.page_path || '/unknown',
      language: payload.language || 'en',
      
      // Intent context from payload
      intent: payload.intent || null,
      timeline: payload.timeline || null,
      
      // Tags to apply (for workflow routing)
      tags: [
        'cc | human handoff requested',
        'cc | state | human engaged',
        `event_${eventType}`,
        payload.language === 'es' ? 'spanish_speaker' : 'english_speaker',
      ],
      
      // Custom fields for GHL
      customField: {
        selena_last_event: eventType,
        selena_last_event_at: new Date().toISOString(),
        selena_session_id: sessionId,
        selena_page_path: payload.route || payload.page_path || '/unknown',
        selena_intent_canonical: payload.intent || null,
        selena_handoff_requested: true,
      },
      
      // Internal note for Kasandra
      internalNote: `🔔 BOOKING INTENT SIGNAL

Event: ${eventType}
Session: ${sessionId}
Page: ${payload.route || payload.page_path || '/unknown'}
Intent: ${payload.intent || 'Not declared'}
Language: ${payload.language || 'en'}
Time: ${new Date().toISOString()}

User has clicked a booking CTA. Ready for human follow-up.`,
    };

    console.log('[selena-log-event] Sending booking intent to GHL:', eventType);

    const response = await fetch(ghlWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ghlPayload),
    });

    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      const notificationId = data.id || data.contactId || `ghl_${Date.now()}`;
      console.log('[selena-log-event] GHL notification sent:', notificationId);
      return { ok: true, notificationId };
    } else {
      console.error('[selena-log-event] GHL webhook failed:', response.status);
      return { ok: false };
    }
  } catch (error) {
    console.error('[selena-log-event] GHL notification error:', error);
    return { ok: false };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, eventType, payload = {} }: LogEventRequest = await req.json();
    
    if (!sessionId || !eventType) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId or eventType" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ ok: false, error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log to event_log table
    const { error } = await supabase
      .from("event_log")
      .insert({
        session_id: sessionId,
        event_type: eventType,
        event_payload: {
          ...payload,
          logged_at: new Date().toISOString(),
        },
      });

    if (error) {
      console.error("Failed to insert event:", error.message);
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if this is a handoff event that needs GHL notification
    let ghlNotification = null;
    if (HANDOFF_EVENTS.has(eventType)) {
      ghlNotification = await notifyGHLBookingIntent(sessionId, eventType, payload);
    }

    return new Response(
      JSON.stringify({ 
        ok: true,
        ghl_notified: ghlNotification?.ok || false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("selena-log-event error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});