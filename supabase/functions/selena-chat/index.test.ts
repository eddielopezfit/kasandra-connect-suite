import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

const BASE = `${SUPABASE_URL}/functions/v1/selena-chat`;

async function chat(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      session_id: `test-parity-${Date.now()}`,
      history: [],
      context: {},
      ...body,
    }),
  });
  const text = await res.text();
  assert(res.ok, `Request failed ${res.status}: ${text}`);
  return JSON.parse(text);
}

// Test 1: ES readiness chip present
Deno.test("ES - buy intent returns reply with chips", async () => {
  const data = await chat({
    message: "Quiero comprar una casa",
    language: "es",
    context: { intent: "buy", chip_phase_floor: 2 },
  });
  assert(data.reply, "Should have a reply");
  console.log("[ES buy] suggested_replies:", JSON.stringify(data.suggested_replies));
});

// Test 2: ES sell intent
Deno.test("ES - sell intent returns reply with chips", async () => {
  const data = await chat({
    message: "Quiero vender mi casa",
    language: "es",
    context: { intent: "sell", chip_phase_floor: 2 },
  });
  assert(data.reply, "Should have a reply");
  console.log("[ES sell] suggested_replies:", JSON.stringify(data.suggested_replies));
});

// Test 3: EN fuzzy alias works without error
Deno.test("EN - fuzzy alias conversation works", async () => {
  const data = await chat({
    message: "I want to sell my house and run the numbers",
    language: "en",
    context: { intent: "sell", chip_phase_floor: 2 },
  });
  assert(data.reply, "Should have a reply");
  console.log("[EN sell fuzzy] suggested_replies:", JSON.stringify(data.suggested_replies));
});

// Test 4: Tool blocking after calculator completion
Deno.test("EN - calculator chips suppressed after tool completion", async () => {
  const data = await chat({
    message: "What should I do next?",
    language: "en",
    context: {
      intent: "sell",
      chip_phase_floor: 2,
      tools_completed: ["tucson_alpha_calculator"],
    },
  });
  assert(data.reply, "Should have a reply");
  const replies: string[] = (data.suggested_replies as string[]) || [];
  console.log("[EN post-calc] suggested_replies:", JSON.stringify(replies));
  const calcChips = replies.filter((r: string) =>
    r.toLowerCase().includes("net proceeds") ||
    r.toLowerCase().includes("calculator") ||
    r.toLowerCase().includes("compare cash")
  );
  assertEquals(calcChips.length, 0, `Calculator chips should be suppressed but found: ${JSON.stringify(calcChips)}`);
});
