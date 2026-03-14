import { getCorsHeaders } from "../_shared/cors.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Priority topics — selected in order, skipping already-generated ones
const PRIORITY_TOPICS = [
  "selling a home in Tucson with tenants in place",
  "probate real estate Pima County Arizona 2026",
  "how to buy a house in Tucson with a felony conviction",
  "new construction homes Tucson vs resale 2026",
  "home inspection Tucson what to expect 2026",
  "Tucson real estate closing costs 2026 complete breakdown",
  "how long does it take to sell a house in Tucson 2026",
  "Tucson neighborhoods best schools families 2026",
  "Arizona property tax Pima County 2026 guide",
  "short sale vs foreclosure Arizona 2026",
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Auth ──────────────────────────────────────────────────────────
  const authHeader = req.headers.get("x-admin-secret");
  if (authHeader !== Deno.env.get("ADMIN_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // ── Parse body ────────────────────────────────────────────────
    let body: { topic?: string } = {};
    try { body = await req.json(); } catch { /* empty body ok */ }

    // ── Topic selection ───────────────────────────────────────────
    let topic = body.topic;
    if (!topic) {
      console.log("[1/8] Selecting topic from priority queue...");
      const { data: existing } = await supabase
        .from("guide_queue")
        .select("topic")
        .neq("status", "rejected");

      const usedTopics = new Set((existing || []).map((r: { topic: string }) => r.topic));
      topic = PRIORITY_TOPICS.find((t) => !usedTopics.has(t));

      if (!topic) {
        const now = new Date();
        const monthYear = now.toLocaleString("en-US", { month: "long", year: "numeric" });
        topic = `Tucson real estate market update ${monthYear}`;
      }
    }
    console.log(`[1/8] Topic selected: "${topic}"`);

    // ── Perplexity research ───────────────────────────────────────
    console.log("[2/8] Calling Perplexity for research...");
    const perplexityKey = Deno.env.get("PERPLEXITY_API_KEY");
    if (!perplexityKey) throw new Error("PERPLEXITY_API_KEY not configured");

    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${perplexityKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: "You are a real estate research assistant. Provide factual, current information about Tucson Arizona real estate. Include specific local data: ZIP codes, program names, income limits, current rates, and Arizona-specific laws. Be concise and factual.",
          },
          {
            role: "user",
            content: `Research this topic for a Tucson real estate guide: "${topic}". Provide:
1. Key facts and statistics specific to Tucson/Pima County
2. Current program names and requirements (if applicable)
3. Arizona-specific laws or regulations
4. 3-5 FAQ questions a buyer/seller would ask
5. 2-3 authoritative source URLs (HUD.gov, VA.gov, AHFA.com, ADRE.az.gov, Redfin, etc.)`,
          },
        ],
      }),
    });

    if (!perplexityRes.ok) {
      const err = await perplexityRes.text();
      throw new Error(`Perplexity API error: ${perplexityRes.status} — ${err}`);
    }

    const perplexityData = await perplexityRes.json();
    const researchContext = perplexityData.choices?.[0]?.message?.content || "";
    console.log(`[2/8] Research complete. Length: ${researchContext.length} chars`);

    // ── Gemini content generation ─────────────────────────────────
    console.log("[3/8] Calling Gemini for content generation...");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are writing a real estate guide for kasandraprietorealtor.com. The guide author is Kasandra Prieto, a bilingual REALTOR® in Tucson, AZ at Corner Connect / Realty Executives Arizona Territory.

VOICE REQUIREMENTS (critical):
- First-person throughout: "I've helped...", "I'm in this market every week...", "Let me walk you through..."
- Warm, personal, non-pressured — she calls herself "your best friend in real estate"
- No corporate language. No "utilize", "leverage", "stakeholders"
- Address reader as "you" throughout
- Final section MUST be "What's Next" with Kasandra's warm offer to help
- Bilingual: every field needs both English (en) and Spanish (es) versions

FORMAT: Return ONLY valid JSON (no markdown, no backticks, no preamble) matching this structure:
{
  "title": "string — EN guide title",
  "titleEs": "string — ES guide title",
  "category": "string — one of: Buying a Home / Selling Your Home / Cash Offers / Understanding Your Value / Hardship & Life Change / Military & VA",
  "categoryEs": "string — Spanish category name",
  "intro": "string — EN intro paragraph in Kasandra first-person voice (2-3 sentences)",
  "introEs": "string — ES intro",
  "sections": [
    {
      "heading": "string — EN section heading",
      "headingEs": "string — ES section heading",
      "content": "string — EN body text (use \\n\\n for paragraphs)",
      "contentEs": "string — ES body text"
    }
  ],
  "faqItems": [
    {
      "question": "string — EN question",
      "questionEs": "string — ES question",
      "answer": "string — EN answer in Kasandra voice",
      "answerEs": "string — ES answer"
    }
  ]
}

REQUIREMENTS:
- 4-6 sections minimum
- 800-2000 words total in English content
- Mention "Tucson" at least 5 times across all sections
- Mention "Pima County" at least 2 times
- Include specific local data from the research context
- 3-5 FAQ items
- Return ONLY the JSON object. No markdown. No explanation.`;

    const geminiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 8000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Topic: ${topic}\n\nResearch context:\n${researchContext}\n\nWrite a complete guide in Kasandra's voice. Return ONLY valid JSON.`,
          },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini API error: ${geminiRes.status} — ${err}`);
    }

    const geminiData = await geminiRes.json();
    let rawContent = geminiData.choices?.[0]?.message?.content || "";
    console.log(`[3/8] Generation complete. Raw length: ${rawContent.length} chars`);

    // Strip markdown code fences if present
    rawContent = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .replace(/\[\d+\]/g, "")  // Strip any citation markers
      .trim();

    // ── Parse JSON ────────────────────────────────────────────────
    console.log("[4/8] Parsing generated JSON...");
    let guideData: Record<string, unknown>;
    try {
      guideData = JSON.parse(rawContent);
    } catch (e) {
      throw new Error(`Failed to parse Gemini JSON response: ${(e as Error).message}. Raw: ${rawContent.slice(0, 200)}`);
    }

    // ── Quality guardrails ────────────────────────────────────────
    console.log("[5/8] Running quality guardrails...");
    const allEnText = [
      guideData.intro as string,
      ...((guideData.sections as Array<{ content: string }>) || []).map((s) => s.content),
      ...((guideData.faqItems as Array<{ answer: string }>) || []).map((f) => f.answer),
    ].join(" ");

    const checks: Record<string, boolean> = {
      word_count_ok: countWords(allEnText) >= 600,
      tucson_mentions_ok: (allEnText.match(/tucson/gi) || []).length >= 3,
      sections_ok: ((guideData.sections as unknown[]) || []).length >= 3,
      faq_ok: ((guideData.faqItems as unknown[]) || []).length >= 2,
      bilingual_ok: guideData.introEs !== guideData.intro,
      no_placeholders: !allEnText.includes("[topic]") && !allEnText.includes("INSERT") && !allEnText.includes("TODO"),
    };

    const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    if (failed.length > 0) {
      console.error("[5/8] Quality guardrails FAILED:", failed);
      return new Response(JSON.stringify({ error: "Quality guardrails failed", checks, failed }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    console.log("[5/8] All quality checks passed:", checks);

    // ── Generate guide_id ─────────────────────────────────────────
    const guideId = slugify(guideData.title as string) || slugify(topic);
    console.log(`[6/8] Guide ID: ${guideId}`);

    // ── Insert into guide_queue ───────────────────────────────────
    console.log("[7/8] Inserting into guide_queue...");
    const { data: inserted, error: insertError } = await supabase
      .from("guide_queue")
      .insert({
        guide_id: guideId,
        topic,
        title_en: guideData.title as string,
        title_es: guideData.titleEs as string,
        content_json: {
          ...guideData,
          author: "Kasandra Prieto",
        },
        research_context: researchContext,
        status: "pending_review",
      })
      .select()
      .single();

    if (insertError) throw new Error(`DB insert failed: ${insertError.message}`);
    console.log("[7/8] Inserted. Row ID:", inserted.id);

    // ── GHL notification (fire-and-forget) ────────────────────────
    console.log("[8/8] Firing GHL webhook notification...");
    const ghlUrl = Deno.env.get("GHL_WEBHOOK_URL");
    if (ghlUrl) {
      fetch(ghlUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "new_guide_pending_review",
          guide_id: guideId,
          title: guideData.title,
          topic,
          review_url: "https://kasandraprietorealtor.com/admin/guides",
          generated_at: new Date().toISOString(),
        }),
      }).catch((e) => console.error("GHL webhook failed (non-blocking):", e));
    }

    const wordCount = countWords(allEnText);
    const sectionCount = ((guideData.sections as unknown[]) || []).length;
    const faqCount = ((guideData.faqItems as unknown[]) || []).length;

    console.log(`[8/8] Complete. Guide "${guideData.title}" ready for review.`);

    return new Response(
      JSON.stringify({
        success: true,
        guide_id: guideId,
        title: guideData.title,
        topic,
        word_count: wordCount,
        sections: sectionCount,
        faq_items: faqCount,
        status: "pending_review",
        message: "Guide generated and queued for Kasandra's review",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[ERROR]", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
