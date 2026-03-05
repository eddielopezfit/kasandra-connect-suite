import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AvailabilityRequest {
  lead_id: string;
  channel: 'call' | 'zoom';
  preferred_window?: 'today' | 'tomorrow' | 'next_3_days';
  timezone?: string;
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
    const { lead_id, channel, preferred_window, timezone }: AvailabilityRequest = await req.json();

    // Validate inputs
    if (!lead_id || !channel) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing required fields: lead_id, channel' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate channel
    if (!['call', 'zoom'].includes(channel)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid channel. Must be "call" or "zoom"' }),
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

    // TODO: Integrate with real calendar provider (Calendly, Cal.com, Google Calendar API)
    // For now, generate stub slots for demo purposes

    const slots: TimeSlot[] = [];
    const now = new Date();
    
    // Round up to next 30-minute mark
    const startMinutes = Math.ceil(now.getMinutes() / 30) * 30;
    const startTime = new Date(now);
    startTime.setMinutes(startMinutes, 0, 0);
    
    // Add buffer (start 30 minutes from now minimum)
    startTime.setMinutes(startTime.getMinutes() + 30);

    // Generate 6 slots, every 30 minutes
    for (let i = 0; i < 6; i++) {
      const slotStart = new Date(startTime);
      slotStart.setMinutes(slotStart.getMinutes() + (i * 30));
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 10); // 10-minute call

      // Format display time (e.g., "2:30 PM")
      const displayTime = slotStart.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone || 'America/Phoenix', // Default to Arizona timezone
      });

      // Build channel-aware booking URL with all context
      const bookingUrl = `/v2/book?channel=${channel}&slot=${encodeURIComponent(slotStart.toISOString())}&lead_id=${lead_id}&priority=hot`;

      slots.push({
        start: slotStart.toISOString(),
        end: slotEnd.toISOString(),
        booking_url: bookingUrl,
        display_time: displayTime,
      });
    }

    console.log(`[check-availability] Generated ${slots.length} slots for lead ${lead_id}, channel: ${channel}, window: ${preferred_window || 'today'}, tz: ${timezone || 'America/Phoenix'}`);

    return new Response(
      JSON.stringify({ ok: true, slots }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[check-availability] Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
