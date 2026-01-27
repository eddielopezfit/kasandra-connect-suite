import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SellerLeadPayload {
  name: string;
  email: string;
  situation?: string;
  condition?: string;
  timeline?: string;
  estimatedValue?: string;
  calculatedCashOffer?: number;
  calculatedListingNet?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: SellerLeadPayload = await req.json();

    // Validate required fields
    if (!payload.name || !payload.email) {
      console.error("Validation failed: Missing name or email");
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      console.error("Validation failed: Invalid email format");
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize and sanitize email
    const normalizedEmail = payload.email.trim().toLowerCase();

    // Sanitize inputs - trim and limit length
    const sanitizedPayload = {
      name: payload.name.trim().slice(0, 100),
      email: normalizedEmail.slice(0, 255),
      situation: payload.situation?.trim().slice(0, 50) || null,
      condition: payload.condition?.trim().slice(0, 50) || null,
      timeline: payload.timeline?.trim().slice(0, 50) || null,
      estimated_value: payload.estimatedValue?.trim().slice(0, 50) || null,
      calculated_cash_offer: payload.calculatedCashOffer || null,
      calculated_listing_net: payload.calculatedListingNet || null,
      source: 'seller_funnel'
    };

    console.log("Processing seller lead submission:", { 
      email: sanitizedPayload.email,
      situation: sanitizedPayload.situation 
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for existing lead by email (dedupe logic)
    const { data: existing } = await supabase
      .from('seller_leads')
      .select('id, name, situation, condition, timeline')
      .eq('email', normalizedEmail)
      .limit(1)
      .maybeSingle();

    let leadData;
    let isNew = true;

    if (existing) {
      // Update existing record - merge new data (preserve non-null existing values)
      isNew = false;
      console.log("Updating existing seller lead:", existing.id);
      
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
        console.error("Database update error:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update lead" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      leadData = data;
    } else {
      // Insert new record
      const { data, error: insertError } = await supabase
        .from('seller_leads')
        .insert(sanitizedPayload)
        .select()
        .single();

      if (insertError) {
        console.error("Database insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to save lead" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      leadData = data;
    }

    console.log("Lead saved to database:", { id: leadData.id, isNew });

    // POST to GoHighLevel webhook
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
    let ghlSynced = false;
    
    if (ghlWebhookUrl) {
      try {
        // Parse name into first/last
        const nameParts = sanitizedPayload.name.split(' ');
        const firstName = nameParts[0] || sanitizedPayload.name;
        const lastName = nameParts.slice(1).join(' ') || '';

        const ghlPayload = {
          email: sanitizedPayload.email,
          name: sanitizedPayload.name,
          firstName,
          lastName,
          tags: ["Seller Funnel", "seller_funnel"],
          customField: {
            lead_id: leadData.id,
            situation: sanitizedPayload.situation,
            condition: sanitizedPayload.condition,
            timeline: sanitizedPayload.timeline,
            estimated_value: sanitizedPayload.estimated_value,
            cash_offer: sanitizedPayload.calculated_cash_offer,
            listing_net: sanitizedPayload.calculated_listing_net,
          },
          source: "Seller Funnel - Tucson Inherited Homes"
        };

        console.log("Sending to GHL webhook...");
        
        const ghlResponse = await fetch(ghlWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(ghlPayload),
        });

        if (!ghlResponse.ok) {
          console.error("GHL webhook failed:", ghlResponse.status);
          
          // Log failure to event_log for monitoring
          await supabase.from('event_log').insert({
            event_type: 'ghl_sync_failed',
            session_id: leadData.id,
            event_payload: {
              lead_id: leadData.id,
              email: sanitizedPayload.email,
              error: `HTTP ${ghlResponse.status}`,
              funnel: 'seller',
              timestamp: new Date().toISOString()
            }
          });
        } else {
          ghlSynced = true;
          console.log("GHL webhook success");
        }
      } catch (ghlError) {
        console.error("GHL webhook error:", ghlError);
        
        // Log exception to event_log
        await supabase.from('event_log').insert({
          event_type: 'ghl_sync_failed',
          session_id: leadData.id,
          event_payload: {
            lead_id: leadData.id,
            email: sanitizedPayload.email,
            error: ghlError instanceof Error ? ghlError.message : 'Unknown error',
            funnel: 'seller',
            timestamp: new Date().toISOString()
          }
        });
      }
    } else {
      console.warn("GHL_WEBHOOK_URL not configured");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead submitted successfully",
        leadId: leadData.id,
        is_new: isNew,
        ghl_synced: ghlSynced
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
