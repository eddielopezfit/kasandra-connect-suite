/**
 * Post-processing pipeline for Selena replies.
 *
 * Applied after the AI gateway returns a raw response, in this order:
 *   1. capSentences            — KB-10: max 3 sentences
 *   2. completenessGuard       — drop trailing fragments without terminal punctuation
 *   3. capWords                — KB-16: 70-word hard ceiling (returns telemetry)
 *   4. stripBannedOpener       — strip "I apologize / I'm sorry / Lo siento" openers
 *   5. enforceOnboardingBlock  — replace literal onboarding prompts when intent exists
 *
 * The KB-16 anti-deflection regenerate-once flow stays in index.ts because
 * it requires re-calling the AI gateway. This module exposes the helpers it
 * needs (detectBannedPhrase is re-exported from bannedPhrases.ts).
 *
 * Pure functions only — no I/O, no Supabase calls. Telemetry is returned
 * to the caller so it can decide where/how to log.
 */

export const SENTENCE_BOUNDARY = /(?<=[.?!。])\s+/g;
export const SENTENCE_TERMINATOR = /[.?!。]$/;
export const COMPLETE_SENTENCE_GLOBAL = /[^.?!。]*[.?!。]/g;

export const BANNED_OPENER =
  /^(I apologize[—\-,.]?\s*|I'?m sorry[—\-,.]?\s*|Me disculpo[—\-,.]?\s*|Lo siento[—\-,.]?\s*)/i;

export const ONBOARDING_BLOCK_PATTERNS =
  /are you looking to buy.*sell.*explore|just explore what'?s possible|what brings you here today|what brings you here|qué le trae por aquí|está pensando en comprar.*vender.*explorar|está buscando comprar.*vender.*explorar/i;

export const DEFAULT_WORD_CAP = 70;
export const DEFAULT_SENTENCE_CAP = 3;

// ============= Helpers =============

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function splitSentences(s: string): string[] {
  return s.split(SENTENCE_BOUNDARY).filter((x) => x.trim().length > 0);
}

// ============= Stage 1: Sentence cap =============

export function capSentences(reply: string, max: number = DEFAULT_SENTENCE_CAP): string {
  const sentences = splitSentences(reply);
  if (sentences.length > max) {
    return sentences.slice(0, max).join(" ");
  }
  return reply;
}

// ============= Stage 2: Completeness guard =============

/**
 * If the reply doesn't end with terminal punctuation, drop the trailing
 * incomplete fragment. If the entire reply is one fragment, append "...".
 */
export function completenessGuard(reply: string): string {
  if (reply.length === 0) return reply;
  if (SENTENCE_TERMINATOR.test(reply.trim())) return reply;
  const complete = reply.match(COMPLETE_SENTENCE_GLOBAL);
  if (complete && complete.length > 0) {
    return complete.join(" ").trim();
  }
  return reply.trim() + "...";
}

// ============= Stage 3: Word cap =============

export interface WordCapResult {
  reply: string;
  truncated: boolean;
  originalWords: number;
  truncatedWords: number;
  originalSentences: number;
  truncatedSentences: number;
  wordCap: number;
}

/**
 * Enforce a hard word ceiling by dropping trailing sentences. Always
 * preserves at least one sentence. Once the cap is crossed, no more
 * than 2 sentences are kept regardless of length.
 */
export function capWords(reply: string, wordCap: number = DEFAULT_WORD_CAP): WordCapResult {
  const originalWords = wordCount(reply);
  const sentences = splitSentences(reply);
  const originalSentences = sentences.length;

  if (originalWords <= wordCap) {
    return {
      reply,
      truncated: false,
      originalWords,
      truncatedWords: originalWords,
      originalSentences,
      truncatedSentences: originalSentences,
      wordCap,
    };
  }

  let kept: string[] = [];
  for (const s of sentences) {
    const candidate = [...kept, s].join(" ");
    if (wordCount(candidate) > wordCap && kept.length > 0) break;
    kept.push(s);
    // Hard ceiling: never exceed 2 kept sentences once we've crossed the cap.
    if (kept.length >= 2 && wordCount(candidate) >= wordCap) break;
  }
  if (kept.length === 0 && sentences.length > 0) kept = [sentences[0]];

  const truncated = kept.join(" ").trim();
  return {
    reply: truncated,
    truncated: true,
    originalWords,
    truncatedWords: wordCount(truncated),
    originalSentences,
    truncatedSentences: kept.length,
    wordCap,
  };
}

// ============= Stage 4: Banned-opener strip =============

/**
 * Strip apologetic openers ("I apologize", "I'm sorry", "Lo siento", "Me disculpo")
 * and capitalize the new first letter. If stripping leaves <10 chars, replace
 * with a neutral reframe.
 */
export function stripBannedOpener(reply: string, language: "en" | "es"): string {
  if (!BANNED_OPENER.test(reply)) return reply;
  let out = reply.replace(BANNED_OPENER, "").trim();
  if (out.length < 10) {
    return language === "es"
      ? "Continuemos desde donde estábamos."
      : "Let's pick up where we were.";
  }
  return out.charAt(0).toUpperCase() + out.slice(1);
}

// ============= Stage 5: Onboarding block =============

/**
 * Server-side safety: when intent is established or chip phase ≥2, replace
 * any literal onboarding prompt the model emits with a "welcome back".
 */
export function enforceOnboardingBlock(
  reply: string,
  language: "en" | "es",
  hasIntent: boolean,
): string {
  if (!hasIntent) return reply;
  if (!ONBOARDING_BLOCK_PATTERNS.test(reply)) return reply;
  return language === "es"
    ? "Bienvenido/a de vuelta — podemos continuar donde lo dejamos."
    : "Welcome back — we can pick up where you left off.";
}

// ============= Composed pipeline =============

export interface PostProcessOptions {
  language: "en" | "es";
  hasIntent: boolean;
  wordCap?: number;
  sentenceCap?: number;
}

export interface PostProcessResult {
  reply: string;
  wordCap: WordCapResult;
}

/**
 * Run the full deterministic pipeline (excluding the regenerate-once flow,
 * which lives in index.ts because it needs the AI gateway).
 */
export function runPostProcessor(reply: string, opts: PostProcessOptions): PostProcessResult {
  let out = reply;
  out = capSentences(out, opts.sentenceCap ?? DEFAULT_SENTENCE_CAP);
  out = completenessGuard(out);
  const wc = capWords(out, opts.wordCap ?? DEFAULT_WORD_CAP);
  out = wc.reply;
  out = stripBannedOpener(out, opts.language);
  out = enforceOnboardingBlock(out, opts.language, opts.hasIntent);
  return { reply: out, wordCap: wc };
}
