import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface NotifyHandoffRequest {
  lead_id: string;
  handoff_id: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead_id, handoff_id }: NotifyHandoffRequest = await req.json();

    // Validate inputs
    if (!lead_id || !handoff_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: lead_id, handoff_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lead_id) || !uuidRegex.test(handoff_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid UUID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch lead profile
    const { data: lead, error: leadError } = await supabase
      .from('lead_profiles')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      console.error('[notify-handoff] Lead not found:', leadError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch handoff record
    const { data: handoff, error: handoffError } = await supabase
      .from('lead_handoffs')
      .select('*')
      .eq('id', handoff_id)
      .single();

    if (handoffError || !handoff) {
      console.error('[notify-handoff] Handoff not found:', handoffError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Handoff not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compose notification message for Kasandra
    const slotLabel = handoff.requested_slot_label || 'Not specified';
    const summaryTrimmed = (handoff.summary_md || '').substring(0, 500);
    const channelLabel = handoff.channel === 'zoom' ? '🎥 Zoom' : '📞 Phone Call';
    const priorityEmoji = handoff.priority === 'hot' ? '🔥' : '🌡️';

    const notificationMessage = `
${priorityEmoji} PRIORITY HANDOFF - ${handoff.priority.toUpperCase()}

👤 Lead: ${lead.name || 'Unknown'}
📧 Email: ${lead.email}
📱 Phone: ${lead.phone || 'Not provided'}
🌐 Language: ${lead.language || 'en'}

📊 Lead Score: ${lead.lead_score || 0}
🎯 Intent: ${lead.intent || 'Not specified'}
⏰ Timeline: ${lead.timeline || 'Not specified'}
🏠 Situation: ${lead.situation || 'Not specified'}
🔧 Condition: ${lead.condition || 'Not specified'}
🏷️ Tags: ${(lead.tags || []).join(', ') || 'None'}

${channelLabel} | Requested Slot: ${slotLabel}

📝 Summary:
${summaryTrimmed}

🔗 Booking URL: ${handoff.booking_url || 'Not available'}
${handoff.reason ? `\n💬 Reason: ${handoff.reason}` : ''}
    `.trim();

    // Get GHL webhook URL from secrets
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
    
    let notificationSuccess = false;
    let notificationId: string | null = null;

    if (ghlWebhookUrl) {
      try {
        // Prepare GHL/LeadConnector payload
        const ghlPayload = {
          // Contact info for upsert
          email: lead.email,
          phone: lead.phone,
          name: lead.name,
          firstName: lead.name?.split(' ')[0] || '',
          lastName: lead.name?.split(' ').slice(1).join(' ') || '',
          
          // Custom fields
          customField: {
            lead_id: lead_id,
            handoff_id: handoff_id,
            priority: handoff.priority,
            channel: handoff.channel,
            timeline: lead.timeline,
            situation: lead.situation,
            condition: lead.condition,
            intent: lead.intent,
            lead_score: lead.lead_score,
            language: lead.language,
            booking_url: handoff.booking_url,
            requested_slot: slotLabel,
            summary: summaryTrimmed,
          },
          
          // Tags to apply
          tags: [
            'handoff_pending',
            `channel_${handoff.channel}`,
            `priority_${handoff.priority}`,
            lead.language === 'es' ? 'spanish_speaker' : 'english_speaker',
          ],
          
          // Source tracking
          source: 'selena_handoff',
          
          // Internal note for Kasandra
          internalNote: notificationMessage,
        };

        console.log('[notify-handoff] Sending to GHL:', ghlWebhookUrl);
        
        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ghlPayload),
        });

        if (ghlResponse.ok) {
          notificationSuccess = true;
          const ghlData = await ghlResponse.json().catch(() => ({}));
          notificationId = ghlData.id || ghlData.contactId || `ghl_${Date.now()}`;
          console.log('[notify-handoff] GHL notification sent successfully:', notificationId);
        } else {
          console.error('[notify-handoff] GHL webhook failed:', ghlResponse.status, await ghlResponse.text());
        }
      } catch (ghlError) {
        console.error('[notify-handoff] GHL webhook error:', ghlError);
      }
    } else {
      console.warn('[notify-handoff] GHL_WEBHOOK_URL not configured - logging only');
      // Still log the notification for debugging
      console.log('[notify-handoff] Would send notification:', notificationMessage);
    }

    // Update handoff status
    const updatePayload: Record<string, unknown> = {
      status: notificationSuccess ? 'notified' : 'failed',
      notified_at: notificationSuccess ? new Date().toISOString() : null,
      notification_provider: 'leadconnector',
      notification_id: notificationId,
    };

    const { error: updateError } = await supabase
      .from('lead_handoffs')
      .update(updatePayload)
      .eq('id', handoff_id);

    if (updateError) {
      console.error('[notify-handoff] Failed to update handoff status:', updateError);
    }

    console.log(`[notify-handoff] Completed for handoff ${handoff_id}: success=${notificationSuccess}`);

    return new Response(
      JSON.stringify({
        ok: true,
        notified: notificationSuccess,
        notification_id: notificationId,
        status: notificationSuccess ? 'notified' : 'failed',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[notify-handoff] Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
