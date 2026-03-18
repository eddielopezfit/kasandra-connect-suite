import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const IMAGE_SLOTS = [
  // TIER 1: 10 guides
  { guideId: "military-pcs-guide", slotName: "hero", variation: "Wide view near Davis-Monthan Air Force Base perimeter, Tucson Catalina Mountains visible in background, desert scrub brush and flat terrain, warm golden light across the landscape, no military vehicles or personnel." },
  { guideId: "divorce-selling", slotName: "hero", variation: "Single-story adobe home with mature desert landscaping, front door closed, porch empty, late afternoon shadows creating stillness and transition, terracotta and sand tones." },
  { guideId: "senior-downsizing", slotName: "hero", variation: "Quiet single-story ranch home in an established Tucson neighborhood, well-maintained front yard with trimmed desert plants, neat walkway, warm amber late-day light, peaceful atmosphere." },
  { guideId: "distressed-preforeclosure", slotName: "hero", variation: "Modest residential home with slightly overgrown desert landscaping, paint slightly faded, mailbox visible, honest documentary style, warm dusty light, no sensationalism." },
  { guideId: "relocating-to-tucson", slotName: "hero", variation: "Aerial-style wide view of Tucson Arizona at golden hour, Santa Catalina Mountains in the background, city grid visible below with warm amber desert light washing across the basin, sense of arrival." },
  { guideId: "tucson-neighborhoods", slotName: "hero", variation: "Wide street-level view of a tree-lined Tucson residential neighborhood, midcentury homes visible on both sides, Catalina Mountains framing the background, warm golden tones, quiet neighborhood feel." },
  { guideId: "cost-to-sell-tucson", slotName: "hero", variation: "Close-up architectural detail of a modern desert home exterior — clean stucco wall, dark window frame, desert landscaping in foreground with backlit saguaro, warm terracotta and gold tones." },
  { guideId: "tucson-suburb-comparison", slotName: "hero", variation: "Wide panoramic view from a Tucson hillside at golden hour, multiple distinct neighborhood clusters visible across the basin, Catalina Mountains backdrop, sense of geography and comparison." },
  { guideId: "arizona-first-time-buyer-programs", slotName: "hero", variation: "Charming small starter home with desert front yard, newly painted front door in navy or teal, clean landscaping with gravel and desert plants, warm welcoming light, sense of new beginning." },
  { guideId: "buying-home-noncitizen-arizona", slotName: "hero", variation: "Welcoming modern Tucson neighborhood street, desert landscaping, warm amber light, sense of belonging and community, quiet residential setting." },

  // TIER 2: 8 guides
  { guideId: "move-up-buyer", slotName: "hero", variation: "Larger two-story Tucson home in a foothills neighborhood, mature saguaro visible in yard, mountain views in background, sense of upgrade and space, clean lines, warm terracotta and desert tones." },
  { guideId: "home-prep-staging", slotName: "hero", variation: "Beautifully prepped home exterior — fresh paint, clean desert landscaping, symmetric entry with potted desert plants, warm late-day light, crisp and polished." },
  { guideId: "pricing-strategy", slotName: "hero", variation: "Two adjacent desert homes on a quiet street, different sizes and conditions visible for comparison, warm amber light, long shadows, documentary and analytical feel." },
  { guideId: "pima-county-property-taxes", slotName: "hero", variation: "Exterior of a Tucson civic or government building, warm afternoon light, clean institutional architecture, factual and authoritative tone." },
  { guideId: "arizona-real-estate-glossary", slotName: "hero", variation: "Wide shot of a classic Tucson neighborhood with mixed housing stock visible, ranch homes, desert landscaping, a quiet intersection, encyclopedic visual feel, warm amber tones." },
  { guideId: "capital-gains-home-sale-arizona", slotName: "hero", variation: "Empty driveway of a well-maintained Tucson home, desert landscaping, late day light casting long shadows suggesting time and transition." },
  { guideId: "sell-or-rent-tucson", slotName: "hero", variation: "Single-family home with a detached casita or guesthouse visible in the background, warm desert light, sense of optionality and decision, well-maintained yard, terracotta and sand palette." },
  { guideId: "how-long-to-sell-tucson", slotName: "hero", variation: "A Tucson residential street at dusk with long shadows stretching across the road, sense of time passing, warm amber and gold tones fading to deep blue at the horizon." },

  // ─── New Guides (Audit 2026-03-15) — 5 SEO + 3 Ghost Guides ─────────────────
  { guideId: "itin-loan-guide", slotName: "hero", variation: "A welcoming Tucson desert neighborhood at golden hour — sun-warmed stucco homes, mature saguaro cactus, clean gravel front yards, warm amber light, quiet residential street, sense of belonging and homeownership aspiration." },
  { guideId: "bad-credit-home-buying-tucson", slotName: "hero", variation: "Front door of a modest well-maintained Tucson home painted in a hopeful warm color — teal or terracotta — desert landscaping, warm afternoon light washing across the entry, sense of a path forward and new beginning." },
  { guideId: "down-payment-assistance-tucson", slotName: "hero", variation: "Close-up of a hand holding a brass house key in front of a blurred Tucson desert home exterior, warm golden light, shallow depth of field, sense of the moment keys are handed over, muted warm tones." },
  { guideId: "fha-loan-pima-county-2026", slotName: "hero", variation: "Quiet Tucson neighborhood street at late afternoon, modest starter homes on both sides, desert landscaping, long shadows stretching across the road, warm amber and gold palette, sense of attainability and community." },
  { guideId: "tucson-market-update-2026", slotName: "hero", variation: "Elevated wide view of the Tucson basin at golden hour looking toward the Santa Catalina Mountains, city grid below with warm amber desert light across the valley, sense of scale and local market perspective." },
  { guideId: "va-home-loan-tucson", slotName: "hero", variation: "Wide view near Davis-Monthan Air Force Base area in Tucson — open desert terrain, Catalina Mountains visible on the horizon, warm military-desert dusk light, no personnel or vehicles, calm and dignified." },
  { guideId: "divorce-home-sale-arizona", slotName: "hero", variation: "Single-story adobe home at dusk — front porch empty, desert plants casting long shadows on the walkway, transitional light between day and evening, warm terracotta and muted sand tones, quiet and dignified, no drama." },
  { guideId: "first-time-buyer-programs-pima-county", slotName: "hero", variation: "A first-time buyer's starter home with a freshly painted front door in a bright hopeful color, neat desert landscaping, clean pathway, warm welcoming afternoon light, sense of accomplishment and new beginnings." },
];

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
          results.push({ guideId: slot.guideId, slotName: slot.slotName, status: "success", publicUrl: data.publicUrl });
        } else {
          results.push({ guideId: slot.guideId, slotName: slot.slotName, status: "failed", error: data.error || "Unknown error" });
        }
      } catch (slotError) {
        results.push({ guideId: slot.guideId, slotName: slot.slotName, status: "failed", error: slotError instanceof Error ? slotError.message : String(slotError) });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({ summary: { total: IMAGE_SLOTS.length, succeeded, failed }, results }),
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
