import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_PROMPT = `A calm, authentic photograph of a Tucson-area neighborhood at golden hour.
Neutral tones. No people. No faces. No cars in motion. No sold signs. No staging.
Quiet and grounded. Soft natural light. Documentary-style realism.
Muted warm color palette. Natural shadows. No HDR, no dramatic contrast.
Ultra high resolution. 16:9 aspect ratio landscape photograph.`;

const NEIGHBORHOOD_PROMPTS: Record<string, string> = {
  'tucson': 'Downtown Tucson street with adobe buildings, University of Arizona area, saguaro cacti, historic architecture, urban desert character.',
  'oro-valley': 'Oro Valley Arizona suburban homes with Catalina Mountain views, manicured landscaping, upscale master-planned community.',
  'marana': 'Marana Arizona new construction homes, Dove Mountain area, wide streets, desert subdivision, Tortolita Mountains in background.',
  'catalina': 'Catalina Arizona rural desert property, Oracle Road area, wide open desert landscape, horse property with mountain views.',
  'catalina-foothills': 'Catalina Foothills luxury homes nestled against Santa Catalina Mountains, Sabino Canyon area, upscale desert architecture.',
  'vail': 'Vail Arizona community, Rita Ranch area, saguaro-studded landscape, family neighborhood with Rincon Mountains backdrop.',
  'sahuarita': 'Sahuarita Arizona planned community, Rancho Sahuarita lake area, palm trees, Santa Rita Mountains in distance.',
  'south-tucson': 'South Tucson colorful street, Mexican-American cultural architecture, murals, small businesses, vibrant community character.',
  'green-valley': 'Green Valley Arizona retirement community, golf course with Santa Rita mountain views, mature landscaping, peaceful 55+ living.',
  'corona-de-tucson': 'Corona de Tucson desert horse property, custom home on acreage, Rincon Mountains backdrop, rural Arizona landscape.',
  'sierra-vista': 'Sierra Vista Arizona with Huachuca Mountains, military town feel, San Pedro Valley views, affordable suburban homes.',
  'rio-rico': 'Rio Rico Arizona golf course community, rolling hills, border region landscape, Santa Cruz Valley views.',
  'nogales': 'Nogales Arizona border town, historic downtown, hillside homes, international views, binational character.',
  'red-rock': 'Red Rock Arizona raw desert landscape, remote homestead, off-grid character, vast open desert northwest of Tucson.',
  'picture-rocks': 'Picture Rocks Arizona near Saguaro National Park West, dense saguaro forest, rural homes, desert sunset.',
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
    const { slugs } = await req.json();
    const targetSlugs: string[] = slugs || Object.keys(NEIGHBORHOOD_PROMPTS);

    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const imageModel = "google/gemini-3-pro-image-preview";
    const results: Array<{ slug: string; status: string; publicUrl?: string; error?: string }> = [];

    for (const slug of targetSlugs) {
      const variation = NEIGHBORHOOD_PROMPTS[slug];
      if (!variation) {
        results.push({ slug, status: 'skipped', error: 'No prompt found' });
        continue;
      }

      try {
        const fullPrompt = `${BASE_PROMPT}\n${variation}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: imageModel,
            messages: [{ role: "user", content: fullPrompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!aiResponse.ok) {
          const errText = await aiResponse.text();
          results.push({ slug, status: 'error', error: `AI ${aiResponse.status}: ${errText.slice(0, 200)}` });
          continue;
        }

        const aiData = await aiResponse.json();
        const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!imageUrl) {
          results.push({ slug, status: 'error', error: 'No image returned' });
          continue;
        }

        const base64Match = imageUrl.match(/^data:image\/\w+;base64,(.+)$/);
        if (!base64Match) {
          results.push({ slug, status: 'error', error: 'Unexpected image format' });
          continue;
        }

        const binaryString = atob(base64Match[1]);
        const imageBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          imageBytes[i] = binaryString.charCodeAt(i);
        }

        const storagePath = `neighborhoods/${slug}/hero.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("guide-assets")
          .upload(storagePath, imageBytes, {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) {
          results.push({ slug, status: 'error', error: `Upload: ${uploadError.message}` });
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from("guide-assets")
          .getPublicUrl(storagePath);

        results.push({ slug, status: 'success', publicUrl: publicUrlData.publicUrl });

        // Brief pause between generations to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      } catch (innerErr) {
        results.push({ slug, status: 'error', error: innerErr instanceof Error ? innerErr.message : 'Unknown' });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    return new Response(
      JSON.stringify({ success: true, generated: successCount, total: targetSlugs.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-neighborhood-heroes error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
