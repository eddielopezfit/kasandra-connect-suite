import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

Deno.test("generate-daily-guide creates a pending_review row", async () => {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-daily-guide`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "x-admin-secret": Deno.env.get("ADMIN_SECRET") || "",
    },
    body: JSON.stringify({ topic: "Tucson real estate closing costs 2026 complete breakdown" }),
  });

  const body = await res.json();
  console.log("Response status:", res.status);
  console.log("Response body:", JSON.stringify(body, null, 2));

  assertEquals(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(body)}`);
  assertEquals(body.success, true);
  assertEquals(body.status, "pending_review");
  assertEquals(typeof body.guide_id, "string");
  assertEquals(typeof body.word_count, "number");
  console.log(`✅ Guide created: "${body.title}" (${body.word_count} words, ${body.sections} sections, ${body.faq_items} FAQs)`);
});
