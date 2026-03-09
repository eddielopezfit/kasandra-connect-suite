import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface SelectedSlot {
  start: string;
  label: string;
  booking_url: string;
}

interface SummaryJson {
  intent?: string;
  situation?: string;
  timeline?: string;
  condition?: string;
  pain_points?: string[];
  desired_outcome?: string;
  address_if_known?: string;
  urgency_level?: string;
}

interface HandoffRequest {
  lead_id: string;
  channel: 'call' | 'zoom';
  priority: 'hot' | 'warm';
  reason?: string;
  summary_md: string;
  summary_json?: SummaryJson;
  recommended_next_step?: string;
  selected_slot?: SelectedSlot | null;
  contact_pref?: 'call' | 'text' | 'zoom';
}

interface TimeSlot {
  start: string;
  end: string;
  booking_url: string;
  display_time: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      lead_id, 
      channel, 
      priority, 
      reason, 
      summary_md, 
      summary_json,
      recommended_next_step,
      selected_slot,
      contact_pref,
    }: HandoffRequest = await req.json();

    // If lead_id is missing, return requires_identity
    if (!lead_id) {
      return new Response(
        JSON.stringify({ ok: false, requires_identity: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!channel || !priority || !summary_md) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: channel, priority, summary_md' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(lead_id)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid lead_id format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for database writes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call check-availability to get slots (unless a slot is already selected)
    let slots: TimeSlot[] = [];
    let bookingUrl = '';
    
    if (selected_slot) {
      // Use the pre-selected slot
      bookingUrl = selected_slot.booking_url;
    } else {
      // Fetch available slots
      try {
        const availabilityResponse = await fetch(`${supabaseUrl}/functions/v1/check-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            lead_id,
            channel,
            preferred_window: 'today',
          }),
        });

        const availabilityData = await availabilityResponse.json();
        if (availabilityData.ok && availabilityData.slots?.length > 0) {
          slots = availabilityData.slots;
          // Use the first available slot as primary booking URL
          bookingUrl = slots[0].booking_url;
        }
      } catch (availabilityError) {
        console.warn('[create-handoff] Could not fetch availability:', availabilityError);
        // Continue without slots - fallback flow will handle this
      }
    }

    // If no slots available and no pre-selected slot, use generic booking URL
    if (!bookingUrl) {
      bookingUrl = `/book?lead_id=${lead_id}&channel=${channel}&priority=${priority}&callback=true`;
    }

    // Build handoff record
    const handoffRecord: Record<string, unknown> = {
      lead_id,
      channel,
      priority,
      reason: reason || null,
      summary_md,
      recommended_next_step: recommended_next_step || 'Book 10-min call',
      booking_url: bookingUrl,
      status: 'pending',
      contact_pref: contact_pref || null,
      convo_summary_json: summary_json || null,
    };

    // Add slot info if a slot was selected
    if (selected_slot) {
      handoffRecord.requested_slot_start = selected_slot.start;
      handoffRecord.requested_slot_label = selected_slot.label;
    }

    // Insert handoff record
    const { data: handoff, error: insertError } = await supabase
      .from('lead_handoffs')
      .insert(handoffRecord)
      .select('id')
      .single();

    if (insertError) {
      console.error('[create-handoff] Insert error:', insertError);
      return new Response(
        JSON.stringify({ ok: false, error: 'Failed to create handoff record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // Notify Kasandra (background call to notify-handoff)
    // ============================================
    const notificationPayload = {
      type: 'PRIORITY_HANDOFF',
      timestamp: new Date().toISOString(),
      lead_id,
      handoff_id: handoff.id,
      priority,
      channel,
      reason,
      summary_md,
      summary_json,
      recommended_next_step,
      booking_url: bookingUrl,
      slots_available: slots.length,
      selected_slot: selected_slot || null,
    };
    
    console.log('[create-handoff] 🔔 NOTIFICATION TO KASANDRA:', JSON.stringify(notificationPayload, null, 2));
    
    // Fire notify-handoff in background (don't await)
    fetch(`${supabaseUrl}/functions/v1/notify-handoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({
        lead_id,
        handoff_id: handoff.id,
      }),
    }).catch(err => {
      console.error('[create-handoff] Failed to trigger notify-handoff:', err);
    });
    // ============================================

    console.log(`[create-handoff] Created handoff ${handoff.id} for lead ${lead_id}, priority: ${priority}, channel: ${channel}, slots: ${slots.length}`);

    return new Response(
      JSON.stringify({
        ok: true,
        handoff_id: handoff.id,
        booking_url: bookingUrl,
        slots,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[create-handoff] Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

