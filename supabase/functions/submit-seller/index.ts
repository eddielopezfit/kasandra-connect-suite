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

    // Sanitize inputs - trim and limit length
    const sanitizedPayload = {
      name: payload.name.trim().slice(0, 100),
      email: payload.email.trim().toLowerCase().slice(0, 255),
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

    // Save to Supabase
    const { data: leadData, error: dbError } = await supabase
      .from('seller_leads')
      .insert(sanitizedPayload)
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save lead" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Lead saved to database:", leadData.id);

    // POST to GoHighLevel webhook
    const ghlWebhookUrl = Deno.env.get('GHL_WEBHOOK_URL');
    
    if (ghlWebhookUrl) {
      try {
        const ghlPayload = {
          name: sanitizedPayload.name,
          email: sanitizedPayload.email,
          tags: ["Seller Funnel"],
          customField: {
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
          // Don't fail the whole request if GHL fails - lead is already saved
        } else {
          console.log("GHL webhook success");
        }
      } catch (ghlError) {
        console.error("GHL webhook error:", ghlError);
        // Continue even if GHL fails - lead is saved in DB
      }
    } else {
      console.warn("GHL_WEBHOOK_URL not configured");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Lead submitted successfully",
        leadId: leadData.id 
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
