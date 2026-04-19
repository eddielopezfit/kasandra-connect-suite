/**
 * Tone Test Suite — sample message bank for selena-chat regression.
 *
 * Each sample is a real-world question Selena should handle without:
 *  - emitting a banned phrase (KB-16 deflection patterns)
 *  - exceeding 70 words / 3 sentences (Luna brevity rule)
 *  - mentioning a legacy brokerage (Coldwell, MoxiWorks, International Diamond Society)
 *
 * Categories cover the 8-step consultative arc and high-risk deflection territory:
 *   pricing, timeline, process, brokerage, credentials, neighborhoods, distressed,
 *   bilingual, dual-path, and emotional/edge cases.
 */

export interface ToneTestSample {
  id: string;
  category:
    | "pricing"
    | "timeline"
    | "process"
    | "brokerage"
    | "credentials"
    | "neighborhood"
    | "distressed"
    | "bilingual"
    | "dual_path"
    | "emotional"
    | "trust";
  language: "en" | "es";
  message: string;
  /** Optional notes about what we expect the reply to do (for human review). */
  expectation?: string;
}

export const TONE_TEST_SAMPLES: ToneTestSample[] = [
  // ── Pricing (deflection magnet) ───────────────────────────────────────────
  { id: "p1", category: "pricing", language: "en", message: "What's the median home price in Tucson right now?", expectation: "Should give a directional range, not punt." },
  { id: "p2", category: "pricing", language: "en", message: "How much would a 3-bed in Sam Hughes go for?" },
  { id: "p3", category: "pricing", language: "en", message: "What can I get for $400k in Tucson?" },
  { id: "p4", category: "pricing", language: "en", message: "Is now a good time to buy or are prices going to drop?" },
  { id: "p5", category: "pricing", language: "es", message: "¿Cuánto cuesta una casa promedio en Tucson?" },

  // ── Timeline (process specificity) ────────────────────────────────────────
  { id: "t1", category: "timeline", language: "en", message: "How long does it take to close on a house here?" },
  { id: "t2", category: "timeline", language: "en", message: "If I list my home next week, when would it likely sell?" },
  { id: "t3", category: "timeline", language: "en", message: "How fast can a cash sale close?" },
  { id: "t4", category: "timeline", language: "es", message: "¿Cuánto tarda en venderse una casa en Tucson?" },

  // ── Process (8-step arc Q's) ──────────────────────────────────────────────
  { id: "pr1", category: "process", language: "en", message: "What are the first steps to buy a home if I've never done it?" },
  { id: "pr2", category: "process", language: "en", message: "Walk me through what selling actually looks like." },
  { id: "pr3", category: "process", language: "en", message: "Do I need a pre-approval before looking at homes?" },
  { id: "pr4", category: "process", language: "en", message: "What's the difference between FHA and conventional?" },

  // ── Brokerage / identity (KB-15 / KB-16 critical) ─────────────────────────
  { id: "b1", category: "brokerage", language: "en", message: "What brokerage is Kasandra with?", expectation: "Must say Corner Connect / Realty Executives Arizona Territory only." },
  { id: "b2", category: "brokerage", language: "en", message: "Who does Kasandra work for?" },
  { id: "b3", category: "brokerage", language: "en", message: "Is Kasandra a licensed agent?" },
  { id: "b4", category: "brokerage", language: "es", message: "¿Con qué corredora trabaja Kasandra?" },

  // ── Credentials (legacy-mention risk) ─────────────────────────────────────
  { id: "c1", category: "credentials", language: "en", message: "What awards has Kasandra won?", expectation: "Must NOT mention International Diamond Society." },
  { id: "c2", category: "credentials", language: "en", message: "How long has Kasandra been in real estate?" },
  { id: "c3", category: "credentials", language: "en", message: "What makes Kasandra different from other Tucson agents?" },

  // ── Neighborhoods (10-section depth target) ───────────────────────────────
  { id: "n1", category: "neighborhood", language: "en", message: "Tell me about Oro Valley." },
  { id: "n2", category: "neighborhood", language: "en", message: "What's the difference between Catalina Foothills and Sam Hughes?" },
  { id: "n3", category: "neighborhood", language: "en", message: "Which Tucson neighborhood is best for families?" },
  { id: "n4", category: "neighborhood", language: "es", message: "¿Cómo es el vecindario de Oro Valley?" },

  // ── Distressed / sensitive ────────────────────────────────────────────────
  { id: "d1", category: "distressed", language: "en", message: "I'm behind on my mortgage and need to sell fast. What are my options?", expectation: "Containment + clear options, no panic, no scam-vibe." },
  { id: "d2", category: "distressed", language: "en", message: "I inherited a house and don't know what to do with it." },
  { id: "d3", category: "distressed", language: "en", message: "Going through a divorce — how do we sell without making it worse?" },

  // ── Bilingual (ES depth) ──────────────────────────────────────────────────
  { id: "es1", category: "bilingual", language: "es", message: "Soy hispanohablante, ¿Kasandra puede ayudarme en español?" },
  { id: "es2", category: "bilingual", language: "es", message: "¿Qué programas hay para compradores primerizos en Pima County?" },
  { id: "es3", category: "bilingual", language: "es", message: "Tengo ITIN, ¿puedo comprar casa?" },

  // ── Dual-path positioning (Corner Connect vs Realty Executives) ──────────
  { id: "dp1", category: "dual_path", language: "en", message: "Should I take a cash offer or list traditionally?" },
  { id: "dp2", category: "dual_path", language: "en", message: "What's the difference between Corner Connect and a regular listing?" },
  { id: "dp3", category: "dual_path", language: "en", message: "Are cash offers usually lower than market value?" },

  // ── Emotional / trust / scam-guard ────────────────────────────────────────
  { id: "e1", category: "emotional", language: "en", message: "I'm scared of getting ripped off. How do I know I can trust this?" },
  { id: "e2", category: "emotional", language: "en", message: "I've been burned by an agent before. Why should this be different?" },
  { id: "e3", category: "emotional", language: "en", message: "Honestly, I just don't know if I'm ready." },

  // ── Trust / proof ─────────────────────────────────────────────────────────
  { id: "tr1", category: "trust", language: "en", message: "Do you have reviews I can look at?" },
  { id: "tr2", category: "trust", language: "en", message: "How many homes has Kasandra sold this year?" },
  { id: "tr3", category: "trust", language: "en", message: "Can I talk to a past client?" },
];

export const SAMPLE_COUNT = TONE_TEST_SAMPLES.length;
