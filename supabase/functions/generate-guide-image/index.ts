import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Base prompt: calm Tucson documentary-style, per visual governance
const BASE_PROMPT = `A calm Tucson residential neighborhood at golden hour.
Neutral tones. No people. No faces. No cars in motion. No sold signs. No staging.
Quiet and grounded. Soft natural light.
Documentary-style realism. Not promotional.
Designed to feel safe, patient, and unhurried.
Muted warm color palette. Natural shadows. No HDR, no dramatic contrast.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { variation, guideId, slotName } = await req.json();

    if (!variation || !guideId || !slotName) {
      return new Response(
        JSON.stringify({ error: "Missing variation, guideId, or slotName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPrompt = `${BASE_PROMPT}\n${variation}\nUltra high resolution. 16:9 aspect ratio.`;

    // Use Lovable AI gateway for image generation
    const imageModel = Deno.env.get("IMAGE_MODEL") || "google/gemini-3-pro-image-preview";
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai-gateway.lovable.dev/imagine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: imageModel,
        prompt: fullPrompt,
        width: 1920,
        height: 1080,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      throw new Error(`AI gateway error (${aiResponse.status}): ${errText}`);
    }

    const imageData = await aiResponse.arrayBuffer();
    const imageBytes = new Uint8Array(imageData);

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

    await supabase.storage
      .from("guide-assets")
      .upload(metadataPath, JSON.stringify(metadata, null, 2), {
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
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
