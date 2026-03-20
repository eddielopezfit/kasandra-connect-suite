import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";
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

    // Rate limit (5 req/hour per IP)
    const rlKey = extractRateLimitKey(req, { lead_id });
    const { allowed } = await checkRateLimit(supabase, rlKey, 'create-handoff');
    if (!allowed) return rateLimitResponse(corsHeaders);

    // Validate lead_id exists in lead_profiles before creating handoff
    const { data: leadExists } = await supabase
      .from('lead_profiles')
      .select('id')
      .eq('id', lead_id)
      .maybeSingle();

    if (!leadExists) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid lead_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call check-availability to get slots (unless a slot is already selected)
    let slots: TimeSlot[] = [];
    let bookingUrl = '';
    
    if (selected_slot) {
      // Use the pre-selected slot
      bookingUrl = selected_slot.booking_url;
    } else {
      // Fetch real slots from check-availability (GHL Calendar API)
      try {
        const availRes = await fetch(`${supabaseUrl}/functions/v1/check-availability`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            lead_id,
            channel,
            preferred_window: priority === 'hot' ? 'today' : 'next_3_days',
            timezone: 'America/Phoenix',
          }),
        });
        if (availRes.ok) {
          const availData = await availRes.json();
          slots = availData.slots ?? [];
          if (slots.length > 0) bookingUrl = slots[0].booking_url;
        }
      } catch (availErr) {
        console.warn('[create-handoff] check-availability call failed:', availErr);
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
    // ============================================
    // Fetch lead profile for notify-handoff payload
    // ============================================
    const { data: leadProfile } = await supabase
      .from('lead_profiles')
      .select('email, phone, name, intent, language, session_id, lead_score')
      .eq('id', lead_id)
      .maybeSingle();

    // Fetch latest session snapshot for rich context
    let snapshot: Record<string, unknown> | null = null;
    if (leadProfile?.session_id) {
      const { data: snapshotData } = await supabase
        .from('session_snapshots')
        .select('*')
        .eq('session_id', leadProfile.session_id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      snapshot = snapshotData;
    }

    // Unpack JSONB buckets for field access
    const ctxJson = (snapshot?.context_json as Record<string, unknown>) ?? {};
    const calcData = (snapshot?.calculator_data as Record<string, unknown>) ?? {};

    // ============================================
    // Notify Kasandra (background call to notify-handoff)
    // ============================================
    const nameParts = (leadProfile?.name ?? '').trim().split(' ');
    const notifyPayload = {
      contact: {
        email: leadProfile?.email ?? '',
        phone: leadProfile?.phone ?? '',
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') ?? '',
      },
      context: {
        intent: leadProfile?.intent ?? '',
        language: leadProfile?.language ?? 'en',
        selena_lead_id: lead_id,
        session_id: leadProfile?.session_id ?? '',
        // Separate concerns: lead_score = composite behavioral score, readiness_score = seller readiness
        lead_score: leadProfile?.lead_score ?? 0,
        readiness_score: (snapshot?.readiness_score as number) ?? leadProfile?.lead_score ?? 0,
        journey_state: priority === 'hot' ? 'decide' : 'qualify',
        handoff_id: handoff.id,
        priority,
        channel,
        reason: reason ?? '',
        summary_md,
        // Session snapshot enrichment
        tools_completed: (snapshot?.tools_used as string[]) ?? [],
        guides_consumed: (snapshot?.guides_read as string[]) ?? [],
        budget: (calcData.budget as number) ?? null,
        budget_max: (calcData.budget_max as number) ?? null,
        bedrooms: (ctxJson.bedrooms as number) ?? null,
        bathrooms: (ctxJson.bathrooms as number) ?? null,
        timeline: (ctxJson.timeline as string) ?? null,
        pre_approved: (ctxJson.pre_approved as boolean) ?? null,
        property_type: (ctxJson.property_type as string) ?? null,
        target_neighborhoods: (ctxJson.target_neighborhoods as string[]) ?? null,
        quiz_completed: (ctxJson.quiz_completed as boolean) ?? false,
        utm_source: (ctxJson.utm_source as string) ?? null,
        utm_campaign: (ctxJson.utm_campaign as string) ?? null,
        page_path: (snapshot?.last_page as string) ?? null,
      },
    };

    console.log('[create-handoff] 🔔 NOTIFICATION TO KASANDRA:', JSON.stringify(notifyPayload, null, 2));

    // Fire notify-handoff in background — delivery tracking handled by notify-handoff
    fetch(`${supabaseUrl}/functions/v1/notify-handoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify(notifyPayload),
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
        slots: [],
        stub_note: "real availability pending GHL calendar integration",
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

