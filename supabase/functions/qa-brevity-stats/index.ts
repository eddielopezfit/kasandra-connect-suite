// QA-only: aggregates selena_brevity_truncated events from the last 24h.
// Reads via service role since event_log denies public SELECT.
// No PII is returned — only counts, deltas, and intent buckets.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

interface BrevityPayload {
  original_words?: number;
  truncated_words?: number;
  original_sentences?: number;
  truncated_sentences?: number;
  language?: string;
  route?: string;
  intent?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("event_log")
      .select("event_payload, created_at")
      .eq("event_type", "selena_brevity_truncated")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    const rows = (data ?? []) as Array<{ event_payload: BrevityPayload | null; created_at: string }>;
    const count = rows.length;

    let wordDeltaSum = 0;
    let wordDeltaN = 0;
    let sentDeltaSum = 0;
    let sentDeltaN = 0;
    const byIntent: Record<string, { count: number; avgWordDelta: number; _sum: number; _n: number }> = {};
    const byLanguage: Record<string, number> = {};
    const byRoute: Record<string, number> = {};

    for (const r of rows) {
      const p = r.event_payload ?? {};
      if (typeof p.original_words === "number" && typeof p.truncated_words === "number") {
        wordDeltaSum += p.original_words - p.truncated_words;
        wordDeltaN += 1;
      }
      if (typeof p.original_sentences === "number" && typeof p.truncated_sentences === "number") {
        sentDeltaSum += p.original_sentences - p.truncated_sentences;
        sentDeltaN += 1;
      }
      const intent = p.intent || "unknown";
      const bucket = (byIntent[intent] ||= { count: 0, avgWordDelta: 0, _sum: 0, _n: 0 });
      bucket.count += 1;
      if (typeof p.original_words === "number" && typeof p.truncated_words === "number") {
        bucket._sum += p.original_words - p.truncated_words;
        bucket._n += 1;
      }
      const lang = p.language || "unknown";
      byLanguage[lang] = (byLanguage[lang] ?? 0) + 1;
      const route = p.route || "unknown";
      byRoute[route] = (byRoute[route] ?? 0) + 1;
    }

    const intentBreakdown = Object.entries(byIntent)
      .map(([intent, b]) => ({
        intent,
        count: b.count,
        avg_word_delta: b._n > 0 ? Math.round((b._sum / b._n) * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    const lastViolation = rows[0]?.created_at ?? null;

    return new Response(
      JSON.stringify({
        window_hours: 24,
        count,
        avg_word_delta: wordDeltaN > 0 ? Math.round((wordDeltaSum / wordDeltaN) * 10) / 10 : 0,
        avg_sentence_delta: sentDeltaN > 0 ? Math.round((sentDeltaSum / sentDeltaN) * 10) / 10 : 0,
        by_intent: intentBreakdown,
        by_language: byLanguage,
        by_route: byRoute,
        last_violation_at: lastViolation,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
