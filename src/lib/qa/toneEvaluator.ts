/**
 * Tone Test evaluator — runs a Selena reply through the same checks
 * the post-processor enforces, plus legacy-brokerage detection.
 *
 * Returns an array of violations. Empty array == clean.
 */

// Mirror of supabase/functions/selena-chat/bannedPhrases.ts
// (Frontend can't import Deno files directly — keep these in sync.)
const BANNED_PHRASES_EN: RegExp[] = [
  /\bI'?d\s+recommend\s+(speaking|talking|reaching out)\s+(with|to)\s+Kasandra\s+directly\b/i,
  /\bfor\s+accurate\s+(pricing|information|details),?\s+please\s+contact\b/i,
  /\bI\s+want\s+to\s+make\s+sure\s+I\s+give\s+you\s+accurate\s+information\b/i,
  /\bevery\s+home\s+is\s+different\b/i,
  /\bit\s+depends\s+on\s+many\s+factors\b/i,
  /\bI\s+can'?t\s+speak\s+to\s+that\b/i,
  /\bI'?m\s+not\s+able\s+to\s+provide\s+that\b/i,
  /\bas\s+an\s+AI\b/i,
  /\blanguage\s+model\b/i,
];

const BANNED_PHRASES_ES: RegExp[] = [
  /\bte\s+recomiendo\s+hablar\s+(directamente\s+)?con\s+Kasandra\b/i,
  /\bpara\s+(precios|información)\s+precisos?,?\s+contacta\b/i,
  /\bquiero\s+asegurarme\s+de\s+darte\s+información\s+precisa\b/i,
  /\bcada\s+casa\s+es\s+diferente\b/i,
  /\bdepende\s+de\s+muchos\s+factores\b/i,
  /\bno\s+puedo\s+hablar\s+de\s+eso\b/i,
  /\bno\s+puedo\s+proporcionar\s+esa\s+información\b/i,
  /\bcomo\s+(una?\s+)?IA\b/i,
  /\bmodelo\s+de\s+lenguaje\b/i,
];

// Legacy brokerage / credential mentions — must never appear in a reply.
const LEGACY_BROKERAGE_PATTERNS: RegExp[] = [
  /\bColdwell\b/i,
  /\bMoxi\s*Works?\b/i,
  /\bInternational\s+Diamond\s+Society\b/i,
  /\bDiamond\s+Society\b/i,
];

export const BREVITY_WORD_LIMIT = 70;
export const BREVITY_SENTENCE_LIMIT = 3;

export type ViolationType =
  | "banned_phrase"
  | "exceeds_word_limit"
  | "exceeds_sentence_limit"
  | "legacy_brokerage";

export interface Violation {
  type: ViolationType;
  detail: string;
}

export interface EvaluationResult {
  reply: string;
  wordCount: number;
  sentenceCount: number;
  violations: Violation[];
  passed: boolean;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  const matches = text.trim().match(/[.!?]+(?=\s|$)/g);
  return matches ? matches.length : text.trim().length > 0 ? 1 : 0;
}

export function evaluateReply(reply: string, language: "en" | "es"): EvaluationResult {
  const violations: Violation[] = [];
  const text = reply ?? "";

  // 1. Banned phrases (KB-16)
  const bannedList = language === "es" ? BANNED_PHRASES_ES : BANNED_PHRASES_EN;
  for (const rx of bannedList) {
    const m = text.match(rx);
    if (m) {
      violations.push({ type: "banned_phrase", detail: m[0] });
    }
  }

  // 2. Legacy brokerage mentions
  for (const rx of LEGACY_BROKERAGE_PATTERNS) {
    const m = text.match(rx);
    if (m) {
      violations.push({ type: "legacy_brokerage", detail: m[0] });
    }
  }

  // 3. Word count
  const wordCount = countWords(text);
  if (wordCount > BREVITY_WORD_LIMIT) {
    violations.push({
      type: "exceeds_word_limit",
      detail: `${wordCount} words (limit ${BREVITY_WORD_LIMIT})`,
    });
  }

  // 4. Sentence count
  const sentenceCount = countSentences(text);
  if (sentenceCount > BREVITY_SENTENCE_LIMIT) {
    violations.push({
      type: "exceeds_sentence_limit",
      detail: `${sentenceCount} sentences (limit ${BREVITY_SENTENCE_LIMIT})`,
    });
  }

  return {
    reply: text,
    wordCount,
    sentenceCount,
    violations,
    passed: violations.length === 0,
  };
}
