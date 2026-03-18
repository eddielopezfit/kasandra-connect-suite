import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Base prompt: calm Tucson documentary-style, per visual governance
const BASE_PROMPT = `A calm Tucson residential neighborhood at golden hour.
Neutral tones. No people. No faces. No cars in motion. No sold signs. No staging.
Quiet and grounded. Soft natural light.
Documentary-style realism. Not promotional.
Designed to feel safe, patient, and unhurried.
Muted warm color palette. Natural shadows. No HDR, no dramatic contrast.`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // JWT auth guard — prevents unauthorized calls to cost-bearing external APIs
  const authHeader = req.headers.get('Authorization') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || (token !== anonKey && token !== serviceKey)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }


  // Admin-only: require x-admin-secret header
  const authHeader = req.headers.get('x-admin-secret');
  if (authHeader !== Deno.env.get('ADMIN_SECRET')) {
    return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { variation, guideId, slotName } = await req.json();

    if (!variation || !guideId || !slotName) {
      return new Response(
        JSON.stringify({ error: "Missing variation, guideId, or slotName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPrompt = `${BASE_PROMPT}\n${variation}\nUltra high resolution. 16:9 aspect ratio photograph.`;

    const imageModel = Deno.env.get("IMAGE_MODEL") || "google/gemini-3-pro-image-preview";
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Use Lovable AI gateway chat completions endpoint with image modality
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: imageModel,
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI gateway error (${aiResponse.status}): ${errText}`);
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image returned from AI gateway");
    }

    // Extract base64 data from data URL
    const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
    if (!base64Match) {
      throw new Error("Unexpected image format from AI gateway");
    }

    // Decode base64 to bytes
    const binaryString = atob(base64Match[1]);
    const imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to guide-assets bucket via service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const storagePath = `guides/${guideId}/${slotName}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("guide-assets")
      .upload(storagePath, imageBytes, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("guide-assets")
      .getPublicUrl(storagePath);

    // Save metadata alongside
    const metadataPath = `guides/${guideId}/${slotName}.meta.json`;
    const metadata = {
      prompt_used: fullPrompt,
      variation,
      model: imageModel,
      generated_at: new Date().toISOString(),
      guide_id: guideId,
      slot_name: slotName,
    };

    const metaBytes = new TextEncoder().encode(JSON.stringify(metadata, null, 2));
    await supabase.storage
      .from("guide-assets")
      .upload(metadataPath, metaBytes, {
        contentType: "application/json",
        upsert: true,
      });

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: publicUrlData.publicUrl,
        storagePath,
        metadata,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-guide-image error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
