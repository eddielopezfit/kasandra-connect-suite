/**
 * Unit tests for postProcessor.ts — pure functions, no network/Supabase.
 * Run with: deno test supabase/functions/selena-chat/postProcessor.test.ts
 */
import {
  assert,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

import {
  capSentences,
  capWords,
  completenessGuard,
  enforceOnboardingBlock,
  runPostProcessor,
  splitSentences,
  stripBannedOpener,
  wordCount,
} from "./postProcessor.ts";

// ============= helpers =============

Deno.test("wordCount handles empty / whitespace / multi-space", () => {
  assertEquals(wordCount(""), 0);
  assertEquals(wordCount("   "), 0);
  assertEquals(wordCount("one"), 1);
  assertEquals(wordCount("one  two   three"), 3);
  assertEquals(wordCount("  leading and trailing  "), 3);
});

Deno.test("splitSentences splits on ./?/! and CJK 。 boundaries", () => {
  assertEquals(splitSentences("First. Second? Third!"), ["First.", "Second?", "Third!"]);
  assertEquals(splitSentences("Solo sentence"), ["Solo sentence"]);
  assertEquals(splitSentences(""), []);
  assertEquals(splitSentences("一。二。"), ["一。二。"]); // no space → not split
});

// ============= capSentences =============

Deno.test("capSentences truncates over the limit", () => {
  const r = capSentences("A. B. C. D. E.", 3);
  assertEquals(r, "A. B. C.");
});

Deno.test("capSentences leaves short replies untouched", () => {
  assertEquals(capSentences("A. B.", 3), "A. B.");
  assertEquals(capSentences("Just one.", 3), "Just one.");
});

// ============= completenessGuard =============

Deno.test("completenessGuard drops trailing fragment", () => {
  const r = completenessGuard("Complete one. Complete two. Trailing fragmen");
  assertEquals(r, "Complete one. Complete two.");
});

Deno.test("completenessGuard appends ellipsis when entire reply is fragment", () => {
  assertEquals(completenessGuard("Just a fragment"), "Just a fragment...");
});

Deno.test("completenessGuard leaves complete reply alone", () => {
  assertEquals(completenessGuard("This is fine."), "This is fine.");
  assertEquals(completenessGuard("Question?"), "Question?");
});

Deno.test("completenessGuard handles empty string", () => {
  assertEquals(completenessGuard(""), "");
});

// ============= capWords =============

Deno.test("capWords reports no truncation when under cap", () => {
  const result = capWords("Short reply with five words.", 70);
  assertEquals(result.truncated, false);
  assertEquals(result.reply, "Short reply with five words.");
  assertEquals(result.originalWords, 5);
  assertEquals(result.truncatedWords, 5);
});

Deno.test("capWords truncates when over cap, keeps at least one sentence", () => {
  // 80 words across 3 sentences
  const long = `${"word ".repeat(30).trim()}. ${"word ".repeat(30).trim()}. ${"word ".repeat(20).trim()}.`;
  const result = capWords(long, 70);
  assert(result.truncated, "should be truncated");
  assert(result.truncatedWords <= 70, `truncated=${result.truncatedWords} should be ≤70`);
  assert(result.truncatedSentences >= 1, "should preserve ≥1 sentence");
  assert(result.truncatedSentences <= 2, "hard ceiling: ≤2 sentences post-cap");
});

Deno.test("capWords preserves single-sentence reply even if it exceeds cap", () => {
  const long = "word ".repeat(100).trim() + ".";
  const result = capWords(long, 70);
  assert(result.truncated);
  // Only one sentence available — must keep it (no second to pivot to).
  assertEquals(result.truncatedSentences, 1);
  assertEquals(result.originalSentences, 1);
});

Deno.test("capWords telemetry shape is complete", () => {
  const r = capWords("A. B. C.", 70);
  assertEquals(typeof r.originalWords, "number");
  assertEquals(typeof r.truncatedWords, "number");
  assertEquals(typeof r.originalSentences, "number");
  assertEquals(typeof r.truncatedSentences, "number");
  assertEquals(r.wordCap, 70);
});

// ============= stripBannedOpener =============

Deno.test("stripBannedOpener removes 'I apologize' and capitalizes", () => {
  const r = stripBannedOpener("I apologize, here is the answer.", "en");
  assertEquals(r, "Here is the answer.");
});

Deno.test("stripBannedOpener removes 'I'm sorry'", () => {
  const r = stripBannedOpener("I'm sorry — let me clarify that.", "en");
  assertStringIncludes(r.toLowerCase(), "let me clarify");
  assert(!r.toLowerCase().startsWith("i'm sorry"));
});

Deno.test("stripBannedOpener removes Spanish 'Lo siento'", () => {
  const r = stripBannedOpener("Lo siento, podemos seguir adelante.", "es");
  assertStringIncludes(r, "Podemos seguir adelante");
});

Deno.test("stripBannedOpener falls back to neutral reframe when nothing meaningful remains", () => {
  const r = stripBannedOpener("I apologize.", "en");
  assertEquals(r, "Let's pick up where we were.");

  const rEs = stripBannedOpener("Lo siento.", "es");
  assertEquals(rEs, "Continuemos desde donde estábamos.");
});

Deno.test("stripBannedOpener leaves reply alone when no banned opener", () => {
  const reply = "Here is a normal response.";
  assertEquals(stripBannedOpener(reply, "en"), reply);
});

// ============= enforceOnboardingBlock =============

Deno.test("enforceOnboardingBlock replaces onboarding prompt when intent exists (EN)", () => {
  const r = enforceOnboardingBlock("Are you looking to buy, sell, or just explore what's possible?", "en", true);
  assertStringIncludes(r, "Welcome back");
});

Deno.test("enforceOnboardingBlock replaces onboarding prompt when intent exists (ES)", () => {
  const r = enforceOnboardingBlock("¿Qué le trae por aquí hoy?", "es", true);
  assertStringIncludes(r, "Bienvenido");
});

Deno.test("enforceOnboardingBlock leaves prompt alone when no intent", () => {
  const original = "What brings you here today?";
  assertEquals(enforceOnboardingBlock(original, "en", false), original);
});

Deno.test("enforceOnboardingBlock leaves non-onboarding text alone", () => {
  const r = "Here are three guides for first-time buyers.";
  assertEquals(enforceOnboardingBlock(r, "en", true), r);
});

// ============= runPostProcessor (composed pipeline) =============

Deno.test("runPostProcessor: short clean reply passes through unchanged", () => {
  const { reply, wordCap } = runPostProcessor("All good here.", { language: "en", hasIntent: true });
  assertEquals(reply, "All good here.");
  assertEquals(wordCap.truncated, false);
});

Deno.test("runPostProcessor: 4-sentence reply gets capped to 3", () => {
  const { reply } = runPostProcessor("One. Two. Three. Four.", { language: "en", hasIntent: false });
  assertEquals(reply, "One. Two. Three.");
});

Deno.test("runPostProcessor: 110-word 'awards' style reply gets word-capped + telemetry", () => {
  const long = `${"word ".repeat(35).trim()}. ${"word ".repeat(40).trim()}. ${"word ".repeat(35).trim()}.`;
  const { reply, wordCap } = runPostProcessor(long, { language: "en", hasIntent: true });
  assert(wordCap.truncated, "should report truncated=true");
  assert(wordCount(reply) <= 70, `final reply ${wordCount(reply)}w must be ≤70`);
  assertEquals(wordCap.originalWords > 70, true);
});

Deno.test("runPostProcessor: apologetic + onboarding leak both get fixed", () => {
  const { reply } = runPostProcessor(
    "I apologize. Are you looking to buy, sell, or just explore what's possible?",
    { language: "en", hasIntent: true },
  );
  // After strip + onboarding block, we expect a "Welcome back" or capitalized reframe.
  assert(
    reply.includes("Welcome back") || reply.includes("Let's pick up"),
    `expected reframe, got: ${reply}`,
  );
});

Deno.test("runPostProcessor: trailing fragment gets dropped before word cap", () => {
  const { reply } = runPostProcessor("First sentence done. Second is trailing fragmen", {
    language: "en",
    hasIntent: false,
  });
  assertEquals(reply, "First sentence done.");
});

Deno.test("runPostProcessor: empty reply doesn't crash", () => {
  const { reply, wordCap } = runPostProcessor("", { language: "en", hasIntent: false });
  assertEquals(reply, "");
  assertEquals(wordCap.truncated, false);
});
