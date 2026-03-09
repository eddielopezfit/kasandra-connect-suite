import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

/**
 * neighborhood-profile
 *
 * Generates bilingual (EN/ES) neighborhood intelligence profiles for any
 * US ZIP code, with deep expertise on Tucson/Pima County.
 *
 * AI: Perplexity Sonar — real-time web search grounded responses.
 * Cache: 7 days, keyed on zip_code + neighborhood_name (composite).
 */

const CACHE_TTL_DAYS = 7;
const TUCSON_PREFIXES = ["856", "857"];

function isTucsonZip(zip: string): boolean {
  return TUCSON_PREFIXES.some((p) => zip.startsWith(p));
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/** The JSON schema shape we require from Perplexity — embedded in the prompt */
const PROFILE_SCHEMA = `{
  "profile_en": {
    "lifestyle_feel": "string (2-3 sentences — neighborhood vibe, feel, day-to-day life)",
    "buyer_fit": ["string array — 3-5 buyer types ideal for this area"],
    "seller_context": "string (2-3 sentences — seller demand, buyer expectations, pricing dynamics)",
    "market_framing": "string (2-3 sentences — interpretive market context, not raw stats)",
    "not_ideal_for": "string (1-2 sentences — honest about who this area may not suit)",
    "fun_fact": "string (one memorable fact about this area)",
    "confidence_level": "high | medium | exploratory",
    "source_scope": ["string array — what current sources informed this profile"]
  },
  "profile_es": {
    // Same fields as profile_en but in natural (not literal) Spanish
  }
}`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const zip_code = (body.zip_code || "").trim();
    const neighborhood_name = (body.neighborhood_name || "").trim();

    if (!/^\d{5}$/.test(zip_code)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid ZIP code. Please enter a 5-digit ZIP." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Rate limit
    const rlKey = extractRateLimitKey(req, body);
    const { allowed } = await checkRateLimit(supabase, rlKey, "neighborhood-profile");
    if (!allowed) return rateLimitResponse(corsHeaders);

    // Cache check — composite key: zip_code + neighborhood_name
    let cacheQuery = supabase
      .from("neighborhood_profiles")
      .select("*")
      .eq("zip_code", zip_code);

    if (neighborhood_name) {
      cacheQuery = cacheQuery.eq("neighborhood_name", neighborhood_name);
    } else {
      cacheQuery = cacheQuery.is("neighborhood_name", null);
    }

    const { data: cached } = await cacheQuery.single();

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime();
      const ttl = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
      if (age < ttl) {
        console.log(`[neighborhood-profile] Cache hit for ${zip_code}/${neighborhood_name || "default"}`);
        return new Response(
          JSON.stringify({
            ok: true,
            profile_en: cached.profile_en,
            profile_es: cached.profile_es,
            zip_code,
            cached: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate with Perplexity Sonar (real-time web search grounded)
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      console.error("[neighborhood-profile] PERPLEXITY_API_KEY not configured");
      return new Response(
        JSON.stringify({ ok: false, error: "api_key_missing", detail: "AI service not configured." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isTucson = isTucsonZip(zip_code);

    const locationString = neighborhood_name
      ? `${neighborhood_name}, Arizona (ZIP code ${zip_code})`
      : `ZIP code ${zip_code}`;

    const regionContext = isTucson
      ? `${locationString} is in the Tucson, Arizona metropolitan area (Pima County). Provide detailed, confident local insights grounded in current data. Search for recent listings, sales activity, school ratings, and community developments specifically for ${neighborhood_name || `ZIP ${zip_code}`}.`
      : `${locationString} is outside the Tucson metro area. Provide general insights based on current web data, but note that Kasandra Prieto specializes in Tucson/Pima County. Set confidence_level to "exploratory".`;

    const systemPrompt = `You are a bilingual (English/Spanish) real estate neighborhood intelligence analyst for Tucson, Arizona, working for Kasandra Prieto at Corner Connect (brokered by Realty Executives Arizona Territory).

Your job: generate accurate, grounded neighborhood profiles backed by current web sources — recent sales, active listings, school ratings, community news, local business presence, and buyer/seller market dynamics.

Write like a thoughtful local friend who knows the area deeply. Never use MLS jargon or raw stat dumps. Surface insights buyers and sellers actually care about — commute feel, community vibe, who thrives here and who doesn't.

${regionContext}

You MUST respond with valid JSON only — no preamble, no markdown, no explanation. The response must match this exact schema:
${PROFILE_SCHEMA}

Both profile_en and profile_es are required. The Spanish version should be a natural, idiomatic translation — not literal. confidence_level must be one of: "high", "medium", or "exploratory".`;

    const userMessage = `Generate a current, web-grounded neighborhood intelligence profile for ${locationString}. Search for recent real estate activity, current listings, school ratings, local news, and community character. Return only the JSON profile.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[neighborhood-profile] Perplexity error:", response.status, errText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ ok: false, error: "rate_limited", detail: "AI rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ ok: false, error: "payment_required", detail: "AI service payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ ok: false, error: "api_error", detail: `Perplexity returned ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error("[neighborhood-profile] No content in Perplexity response:", JSON.stringify(aiResult));
      throw new Error("Perplexity did not return profile content");
    }

    // Strip any accidental markdown fences before parsing
    const cleanContent = rawContent.replace(/```json|```/g, "").trim();
    const profiles = JSON.parse(cleanContent);
    const { profile_en, profile_es } = profiles;

    if (!profile_en || !profile_es) {
      throw new Error("Perplexity response missing profile_en or profile_es");
    }

    const hash = simpleHash(JSON.stringify(profiles));
    const now = new Date().toISOString();

    // Upsert into cache — composite key: zip_code + neighborhood_name
    if (cached) {
      let updateQuery = supabase
        .from("neighborhood_profiles")
        .update({ profile_en, profile_es, profile_hash: hash, generated_at: now, neighborhood_name: neighborhood_name || null })
        .eq("zip_code", zip_code);

      if (neighborhood_name) {
        updateQuery = updateQuery.eq("neighborhood_name", neighborhood_name);
      } else {
        updateQuery = updateQuery.is("neighborhood_name", null);
      }
      await updateQuery;
    } else {
      await supabase.from("neighborhood_profiles").insert({
        zip_code,
        neighborhood_name: neighborhood_name || null,
        profile_en,
        profile_es,
        profile_hash: hash,
        generated_at: now,
      });
    }

    console.log(`[neighborhood-profile] Generated Perplexity profile for ${zip_code}/${neighborhood_name || "default"}`);

    return new Response(
      JSON.stringify({ ok: true, profile_en, profile_es, zip_code, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[neighborhood-profile] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: "network_error", detail: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
