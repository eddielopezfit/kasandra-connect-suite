/**
 * selena-memory — Persistent memory store/recall for Selena AI Concierge
 * 
 * Actions:
 *   "store"  — Extract key facts from conversation, upsert into conversation_memory
 *   "recall" — Return summarized memory string for a session/lead
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkRateLimit, extractRateLimitKey, rateLimitResponse } from "../_shared/rateLimit.ts";

const MEMORY_CATEGORIES = ["preference", "fact", "intent", "interaction"] as const;

interface StoreRequest {
  action: "store";
  session_id: string;
  lead_id?: string;
  message: string;
  assistant_reply: string;
  context?: Record<string, unknown>;
}

interface RecallRequest {
  action: "recall";
  session_id?: string;
  lead_id?: string;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();

    const rlKey = extractRateLimitKey(req, body);
    const rl = await checkRateLimit(supabase, rlKey, 'selena-memory');
    if (!rl.allowed) return rateLimitResponse(corsHeaders);

    const { action } = body;

    // ==================== STORE ====================
    if (action === "store") {
      const { session_id, lead_id, message, assistant_reply, context } = body as StoreRequest;

      if (!session_id || !message) {
        return new Response(
          JSON.stringify({ ok: false, error: "session_id and message required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const memories = extractMemories(message, assistant_reply, context);

      if (memories.length === 0) {
        return new Response(
          JSON.stringify({ ok: true, stored: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Upsert each memory (session_id + memory_key is the natural key)
      let stored = 0;
      for (const mem of memories) {
        const { error } = await supabase
          .from("conversation_memory")
          .upsert(
            {
              session_id,
              lead_id: lead_id || null,
              memory_key: mem.key,
              memory_value: mem.value,
              category: mem.category,
            },
            { onConflict: "session_id,memory_key", ignoreDuplicates: false }
          );

        if (!error) stored++;
        else console.error(`[selena-memory] Upsert error for ${mem.key}:`, error.message);
      }

      console.log(`[selena-memory] Stored ${stored}/${memories.length} memories for session ${session_id}`);

      return new Response(
        JSON.stringify({ ok: true, stored }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== RECALL ====================
    if (action === "recall") {
      const { session_id, lead_id } = body as RecallRequest;

      if (!session_id && !lead_id) {
        return new Response(
          JSON.stringify({ ok: false, error: "session_id or lead_id required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Query by lead_id first (cross-session), fallback to session_id
      let query = supabase
        .from("conversation_memory")
        .select("memory_key, memory_value, category, created_at")
        .order("created_at", { ascending: false })
        .limit(30);

      if (lead_id) {
        query = query.eq("lead_id", lead_id);
      } else {
        query = query.eq("session_id", session_id!);
      }

      const { data: rows, error } = await query;

      if (error) {
        console.error("[selena-memory] Recall error:", error.message);
        return new Response(
          JSON.stringify({ ok: false, error: "Failed to recall memories" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!rows || rows.length === 0) {
        return new Response(
          JSON.stringify({ ok: true, memory_summary: "", memory_count: 0 }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const summary = buildMemorySummary(rows);

      return new Response(
        JSON.stringify({ ok: true, memory_summary: summary, memory_count: rows.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: "Unknown action. Use 'store' or 'recall'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[selena-memory] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ==================== EXTRACTION LOGIC ====================

interface ExtractedMemory {
  key: string;
  value: Record<string, unknown>;
  category: string;
}

function extractMemories(
  message: string,
  assistantReply: string,
  context?: Record<string, unknown>
): ExtractedMemory[] {
  const memories: ExtractedMemory[] = [];
  const lower = message.toLowerCase();

  // --- Name detection ---
  const nameMatch = message.match(
    /(?:(?:my name is|i'm|i am|me llamo|soy)\s+)([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)?)(?:\s|[.,!?]|$)/i
  );
  if (nameMatch) {
    memories.push({
      key: "user_name",
      value: { name: nameMatch[1].trim() },
      category: "fact",
    });
  }

  // --- Intent from context ---
  if (context?.intent && context.intent !== "explore") {
    memories.push({
      key: "intent",
      value: { intent: context.intent },
      category: "intent",
    });
  }

  // --- Budget detection ---
  const budgetMatch = lower.match(
    /(?:budget|afford|price range|looking around|rango|presupuesto)\s*(?:is|of|around|about|de|:)?\s*\$?([\d,]+(?:k)?)/i
  );
  if (budgetMatch) {
    let amount = budgetMatch[1].replace(/,/g, "");
    if (amount.toLowerCase().endsWith("k")) {
      amount = String(parseInt(amount) * 1000);
    }
    memories.push({
      key: "budget",
      value: { amount: parseInt(amount), raw: budgetMatch[0] },
      category: "preference",
    });
  }

  // --- Budget from context ---
  if (context?.estimated_budget && !budgetMatch) {
    memories.push({
      key: "budget",
      value: { amount: context.estimated_budget, source: "calculator" },
      category: "preference",
    });
  }

  // --- Neighborhood/area detection ---
  const areaPatterns = [
    /(?:interested in|looking at|love|like|prefer|considering|want to live in|near|around)\s+(marana|oro valley|vail|sahuarita|tucson|rita ranch|dove mountain|tanque verde|catalina foothills|midtown|downtown|sam hughes|barrio viejo)/gi,
    /(?:me interesa|buscando en|cerca de|en)\s+(marana|oro valley|vail|sahuarita|tucson|rita ranch|dove mountain|tanque verde|catalina foothills|midtown|downtown)/gi,
  ];
  for (const pattern of areaPatterns) {
    const matches = [...message.matchAll(pattern)];
    if (matches.length > 0) {
      const areas = [...new Set(matches.map((m) => m[1].trim()))];
      memories.push({
        key: "neighborhoods",
        value: { areas },
        category: "preference",
      });
      break;
    }
  }

  // --- Timeline detection ---
  const timelineMatch = lower.match(
    /(?:within|in about|next|en los próximos|dentro de)\s*([\d]+)\s*(days?|weeks?|months?|días?|semanas?|meses?)/i
  );
  if (timelineMatch) {
    memories.push({
      key: "timeline",
      value: { amount: parseInt(timelineMatch[1]), unit: timelineMatch[2], raw: timelineMatch[0] },
      category: "preference",
    });
  } else if (context?.timeline) {
    memories.push({
      key: "timeline",
      value: { timeline: context.timeline, source: "context" },
      category: "preference",
    });
  }

  // --- Family situation detection ---
  const familyPatterns = [
    /(?:family of|(\d+)\s*(?:kids?|children|niños|hijos)|growing family|downsizing|retiring|jubilando|divorc)/i,
  ];
  for (const pattern of familyPatterns) {
    const match = lower.match(pattern);
    if (match) {
      memories.push({
        key: "family_situation",
        value: { raw: match[0], detected: true },
        category: "fact",
      });
      break;
    }
  }

  // --- Property value from context ---
  if (context?.estimated_value) {
    memories.push({
      key: "property_value",
      value: { amount: context.estimated_value, source: "context" },
      category: "fact",
    });
  }

  return memories;
}

// ==================== SUMMARY BUILDER ====================

function buildMemorySummary(
  rows: Array<{ memory_key: string; memory_value: unknown; category: string; created_at: string }>
): string {
  // Deduplicate by key (most recent wins since ordered desc)
  const byKey = new Map<string, { memory_value: unknown; category: string }>();
  for (const row of rows) {
    if (!byKey.has(row.memory_key)) {
      byKey.set(row.memory_key, { memory_value: row.memory_value, category: row.category });
    }
  }

  const parts: string[] = [];
  const val = (key: string) => byKey.get(key)?.memory_value as Record<string, unknown> | undefined;

  const name = val("user_name");
  if (name?.name) parts.push(`Name: ${name.name}`);

  const intent = val("intent");
  if (intent?.intent) parts.push(`Intent: ${intent.intent}`);

  const budget = val("budget");
  if (budget?.amount) parts.push(`Budget: $${Number(budget.amount).toLocaleString()}`);

  const neighborhoods = val("neighborhoods");
  if (neighborhoods?.areas) {
    const areas = neighborhoods.areas as string[];
    parts.push(`Areas: ${areas.join(", ")}`);
  }

  const timeline = val("timeline");
  if (timeline?.amount && timeline?.unit) {
    parts.push(`Timeline: ${timeline.amount} ${timeline.unit}`);
  } else if (timeline?.timeline) {
    parts.push(`Timeline: ${timeline.timeline}`);
  }

  const family = val("family_situation");
  if (family?.raw) parts.push(`Family: ${family.raw}`);

  const propValue = val("property_value");
  if (propValue?.amount) parts.push(`Property: $${Number(propValue.amount).toLocaleString()}`);

  if (parts.length === 0) return "";

  return `User profile: ${parts.join(" | ")}`;
}
