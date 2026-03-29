import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { getCorsHeaders, isPreflightRequest } from "../_shared/cors.ts";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (isPreflightRequest(req)) {
    return new Response("ok", { headers: corsHeaders });
  }

  // Cost-bearing function — require admin auth
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== Deno.env.get("ADMIN_SECRET")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!firecrawlKey) throw new Error("FIRECRAWL_API_KEY not configured");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, serviceKey);

    // Step 1: Scrape VisitTucson.org events page
    console.log("Scraping visittucson.org/events...");
    const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.visittucson.org/events",
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeRes.json();
    if (!scrapeRes.ok) {
      console.error("Firecrawl error:", scrapeData);
      throw new Error(`Firecrawl failed: ${scrapeData.error || scrapeRes.status}`);
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
    if (!markdown || markdown.length < 100) {
      throw new Error("Scraped content too short — site may have changed structure");
    }

    console.log(`Scraped ${markdown.length} chars. Sending to AI for curation...`);

    // Step 2: Send to Gemini for curation + translation
    const now = new Date();
    const currentMonth = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const aiRes = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        tools: [
          {
            type: "function",
            function: {
              name: "curate_events",
              description: "Return curated Tucson events from scraped content",
              parameters: {
                type: "object",
                properties: {
                  events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name_en: { type: "string", description: "Event name in English" },
                        name_es: { type: "string", description: "Event name in Spanish" },
                        description_en: { type: "string", description: "1-2 sentence description in English" },
                        description_es: { type: "string", description: "1-2 sentence description in Spanish" },
                        month: { type: "string", description: "Month or date range, e.g. 'March' or 'January–February'" },
                        season: { type: "string", enum: ["winter", "spring", "summer", "fall"] },
                        category: { type: "string", enum: ["culture", "food", "outdoors", "family", "community"] },
                        event_date: { type: "string", description: "ISO date if known (YYYY-MM-DD), null if unknown" },
                        source_url: { type: "string", description: "URL to event details if available" },
                      },
                      required: ["name_en", "name_es", "description_en", "description_es", "month", "season", "category"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["events"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "curate_events" } },
        messages: [
          {
            role: "system",
            content: `You are a Tucson lifestyle curator for a real estate website. Extract the 8-10 most significant, family-friendly, community-oriented events from the scraped content below. Focus on signature events that would help relocators and homebuyers understand Tucson's culture and lifestyle. Translate all content to Spanish. Categorize each event by season and type. Current month: ${currentMonth}.`,
          },
          {
            role: "user",
            content: `Here is the scraped events page from VisitTucson.org. Extract and curate the top events:\n\n${markdown.slice(0, 15000)}`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI Gateway error:", aiRes.status, errText);
      if (aiRes.status === 429) throw new Error("Rate limited by AI Gateway");
      if (aiRes.status === 402) throw new Error("AI Gateway credits exhausted");
      throw new Error(`AI Gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const parsed = JSON.parse(toolCall.function.arguments);
    const events = parsed.events;

    if (!Array.isArray(events) || events.length === 0) {
      throw new Error("AI returned no events");
    }

    console.log(`AI curated ${events.length} events. Writing to DB...`);

    // Step 3: Delete old events for this month and insert new ones
    const scrapedMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    await supabase.from("tucson_events").delete().eq("scraped_month", scrapedMonth);

    const rows = events.map((e: any) => ({
      name_en: e.name_en,
      name_es: e.name_es,
      description_en: e.description_en,
      description_es: e.description_es,
      month: e.month,
      season: e.season,
      category: e.category,
      event_date: e.event_date || null,
      source_url: e.source_url || null,
      scraped_month: scrapedMonth,
    }));

    const { error: insertError } = await supabase.from("tucson_events").insert(rows);
    if (insertError) throw new Error(`DB insert error: ${insertError.message}`);

    console.log(`Successfully inserted ${rows.length} events for ${scrapedMonth}`);

    return new Response(
      JSON.stringify({ success: true, events_count: rows.length, scraped_month: scrapedMonth }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("refresh-tucson-events error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
