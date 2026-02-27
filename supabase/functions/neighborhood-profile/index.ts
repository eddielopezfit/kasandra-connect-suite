import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_TTL_DAYS = 30;

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const zip_code = (body.zip_code || "").trim();

    // Validate ZIP format
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

    // Cache check
    const { data: cached } = await supabase
      .from("neighborhood_profiles")
      .select("*")
      .eq("zip_code", zip_code)
      .single();

    if (cached) {
      const age = Date.now() - new Date(cached.generated_at).getTime();
      const ttl = CACHE_TTL_DAYS * 24 * 60 * 60 * 1000;
      if (age < ttl) {
        console.log(`[neighborhood-profile] Cache hit for ${zip_code}`);
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

    // Generate with AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const isTucson = isTucsonZip(zip_code);
    const regionContext = isTucson
      ? `This ZIP code (${zip_code}) is in the Tucson, Arizona metropolitan area. Provide detailed, confident local insights.`
      : `This ZIP code (${zip_code}) is outside the Tucson metro area. Provide general insights but note that Kasandra Corner specializes in Tucson. Set confidence_level to "exploratory".`;

    const systemPrompt = `You are a bilingual (English/Spanish) real estate neighborhood intelligence analyst for Tucson, Arizona. You provide lifestyle-oriented neighborhood profiles that help home buyers and sellers make informed decisions. You never use MLS jargon or stat dumps — you write like a thoughtful local friend who knows the area deeply.

${regionContext}

When calling the tool, provide BOTH English and Spanish versions. The Spanish should be a natural translation, not a literal one.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a neighborhood intelligence profile for ZIP code ${zip_code}. Call the generate_neighborhood_profile tool with both English and Spanish profiles.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_neighborhood_profile",
              description:
                "Generate a bilingual neighborhood intelligence profile for a given ZIP code.",
              parameters: {
                type: "object",
                properties: {
                  profile_en: {
                    type: "object",
                    properties: {
                      lifestyle_feel: {
                        type: "string",
                        description:
                          "2-3 sentence description of the neighborhood's lifestyle and vibe.",
                      },
                      buyer_fit: {
                        type: "array",
                        items: { type: "string" },
                        description:
                          "3-5 buyer types this area is ideal for (e.g. 'First-time buyers', 'Military families', 'Retirees').",
                      },
                      seller_context: {
                        type: "string",
                        description:
                          "2-3 sentences about what sellers should know — demand, buyer expectations, pricing dynamics.",
                      },
                      market_framing: {
                        type: "string",
                        description:
                          "2-3 sentences of interpretive market context (not raw stats).",
                      },
                      not_ideal_for: {
                        type: "string",
                        description:
                          "1-2 sentences about who this area may NOT be the best fit for. Be honest but empathetic.",
                      },
                      fun_fact: {
                        type: "string",
                        description:
                          "One interesting, memorable fact about this area.",
                      },
                      confidence_level: {
                        type: "string",
                        enum: ["high", "medium", "exploratory"],
                        description:
                          "high for well-known Tucson neighborhoods, medium for less-known areas, exploratory for outside Tucson.",
                      },
                      source_scope: {
                        type: "array",
                        items: { type: "string" },
                        description:
                          "Data sources used (e.g. 'local trends', 'buyer behavior patterns', 'general market knowledge').",
                      },
                    },
                    required: [
                      "lifestyle_feel",
                      "buyer_fit",
                      "seller_context",
                      "market_framing",
                      "not_ideal_for",
                      "fun_fact",
                      "confidence_level",
                      "source_scope",
                    ],
                    additionalProperties: false,
                  },
                  profile_es: {
                    type: "object",
                    properties: {
                      lifestyle_feel: { type: "string" },
                      buyer_fit: { type: "array", items: { type: "string" } },
                      seller_context: { type: "string" },
                      market_framing: { type: "string" },
                      not_ideal_for: { type: "string" },
                      fun_fact: { type: "string" },
                      confidence_level: {
                        type: "string",
                        enum: ["high", "medium", "exploratory"],
                      },
                      source_scope: { type: "array", items: { type: "string" } },
                    },
                    required: [
                      "lifestyle_feel",
                      "buyer_fit",
                      "seller_context",
                      "market_framing",
                      "not_ideal_for",
                      "fun_fact",
                      "confidence_level",
                      "source_scope",
                    ],
                    additionalProperties: false,
                  },
                },
                required: ["profile_en", "profile_es"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "generate_neighborhood_profile" },
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ ok: false, error: "AI rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ ok: false, error: "AI service payment required." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("[neighborhood-profile] AI error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("[neighborhood-profile] No tool call in AI response:", JSON.stringify(aiResult));
      throw new Error("AI did not return structured profile data");
    }

    const profiles = JSON.parse(toolCall.function.arguments);
    const { profile_en, profile_es } = profiles;
    const hash = simpleHash(JSON.stringify(profiles));

    // Upsert into cache
    const now = new Date().toISOString();
    if (cached) {
      await supabase
        .from("neighborhood_profiles")
        .update({ profile_en, profile_es, profile_hash: hash, generated_at: now })
        .eq("zip_code", zip_code);
    } else {
      await supabase.from("neighborhood_profiles").insert({
        zip_code,
        profile_en,
        profile_es,
        profile_hash: hash,
        generated_at: now,
      });
    }

    console.log(`[neighborhood-profile] Generated profile for ${zip_code}`);

    return new Response(
      JSON.stringify({ ok: true, profile_en, profile_es, zip_code, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[neighborhood-profile] Error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
