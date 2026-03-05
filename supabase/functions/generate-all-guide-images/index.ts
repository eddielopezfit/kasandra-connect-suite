import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Image inventory: Tier 1 + Tier 2 only.
 * Tier 3 stories = text-only per governance. No images generated.
 * Tier 2 = orientation only (max 1 image).
 */
const IMAGE_SLOTS = [
  // Tier 1: first-time-buyer-guide
  { guideId: "first-time-buyer-guide", slotName: "orientation", variation: "A welcoming single-story home exterior with desert landscaping." },
  { guideId: "first-time-buyer-guide", slotName: "checklist", variation: "A shaded porch in soft light with desert plants beside the entryway." },

  // Tier 1: selling-for-top-dollar
  { guideId: "selling-for-top-dollar", slotName: "orientation", variation: "A well-maintained Tucson home with desert landscaping and a tidy yard." },
  { guideId: "selling-for-top-dollar", slotName: "clarity", variation: "A quiet central Tucson residential street with mature trees." },

  // Tier 1: cash-offer-guide
  { guideId: "cash-offer-guide", slotName: "orientation", variation: "Desert foothills in the background behind a residential street." },
  { guideId: "cash-offer-guide", slotName: "checklist", variation: "A modest single-story home with a tidy yard and stucco facade." },

  // Tier 1: inherited-probate-property
  { guideId: "inherited-probate-property", slotName: "orientation", variation: "A quiet Tucson neighborhood at golden hour with long shadows." },
  { guideId: "inherited-probate-property", slotName: "checklist", variation: "A single-story home with mature trees and a shaded yard." },

  // Tier 2: understanding-home-valuation (orientation only — governance: max 1 image)
  { guideId: "understanding-home-valuation", slotName: "orientation", variation: "A Tucson neighborhood street view with foothills visible in the distance." },
];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const results: Array<{ guideId: string; slotName: string; status: string; publicUrl?: string; error?: string }> = [];

    for (const slot of IMAGE_SLOTS) {
      try {
        console.log(`Generating: ${slot.guideId}/${slot.slotName}`);

        const response = await fetch(
          `${supabaseUrl}/functions/v1/generate-guide-image`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${serviceRoleKey}`,
            },
            body: JSON.stringify({
              variation: slot.variation,
              guideId: slot.guideId,
              slotName: slot.slotName,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          results.push({
            guideId: slot.guideId,
            slotName: slot.slotName,
            status: "success",
            publicUrl: data.publicUrl,
          });
        } else {
          results.push({
            guideId: slot.guideId,
            slotName: slot.slotName,
            status: "failed",
            error: data.error || "Unknown error",
          });
        }
      } catch (slotError) {
        results.push({
          guideId: slot.guideId,
          slotName: slot.slotName,
          status: "failed",
          error: slotError instanceof Error ? slotError.message : String(slotError),
        });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({
        summary: { total: IMAGE_SLOTS.length, succeeded, failed },
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("generate-all-guide-images error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
