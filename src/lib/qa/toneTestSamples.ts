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
 *
 * Multi-turn samples include `followUps[]` — each follow-up runs in the SAME
 * session_id with full history from prior turns. This tests conversational drift:
 *   - Does Selena stay in-character across 3+ turns?
 *   - Does brevity hold when context grows?
 *   - Does she repeat banned phrases under follow-up pressure?
 *   - Does she stay on the brokerage truth after probing?
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
    | "trust"
    | "drift_probe";
  language: "en" | "es";
  message: string;
  /** Optional notes about what we expect the reply to do (for human review). */
  expectation?: string;
  /**
   * Multi-turn follow-ups. Each follow-up sends the next user message in the
   * same session_id with full history. Evaluated as separate turn results
   * (id suffixed with `:t2`, `:t3`, etc.).
   */
  followUps?: string[];
}

export const TONE_TEST_SAMPLES: ToneTestSample[] = [
  // ── Pricing (deflection magnet) ───────────────────────────────────────────
  {
    id: "p1",
    category: "pricing",
    language: "en",
    message: "What's the median home price in Tucson right now?",
    expectation: "Should give a directional range, not punt.",
    followUps: [
      "Okay but what about just the east side specifically?",
      "Is that going up or down month over month?",
    ],
  },
  {
    id: "p2",
    category: "pricing",
    language: "en",
    message: "How much would a 3-bed in Sam Hughes go for?",
    followUps: ["What about a 4-bed in the same area?"],
  },
  { id: "p3", category: "pricing", language: "en", message: "What can I get for $400k in Tucson?" },
  {
    id: "p4",
    category: "pricing",
    language: "en",
    message: "Is now a good time to buy or are prices going to drop?",
    followUps: [
      "If I wait 6 months, will I save money?",
      "What if rates drop too — does that change your answer?",
    ],
    expectation: "Must not predict prices; must stay neutral and educational.",
  },
  { id: "p5", category: "pricing", language: "es", message: "¿Cuánto cuesta una casa promedio en Tucson?" },
  { id: "p6", category: "pricing", language: "en", message: "How much do homes in Oro Valley sell over asking?" },
  { id: "p7", category: "pricing", language: "en", message: "What's the price per square foot in Catalina Foothills?" },

  // ── Timeline (process specificity) ────────────────────────────────────────
  {
    id: "t1",
    category: "timeline",
    language: "en",
    message: "How long does it take to close on a house here?",
    followUps: ["What's the longest part of that process?"],
  },
  { id: "t2", category: "timeline", language: "en", message: "If I list my home next week, when would it likely sell?" },
  {
    id: "t3",
    category: "timeline",
    language: "en",
    message: "How fast can a cash sale close?",
    followUps: ["Can it really close in 7 days or is that marketing fluff?"],
  },
  { id: "t4", category: "timeline", language: "es", message: "¿Cuánto tarda en venderse una casa en Tucson?" },
  { id: "t5", category: "timeline", language: "en", message: "I need to be out by August. Is that realistic?" },

  // ── Process (8-step arc Q's) ──────────────────────────────────────────────
  {
    id: "pr1",
    category: "process",
    language: "en",
    message: "What are the first steps to buy a home if I've never done it?",
    followUps: [
      "Do I need a down payment saved before I start looking?",
      "How much down payment do most first-timers actually put down?",
    ],
  },
  {
    id: "pr2",
    category: "process",
    language: "en",
    message: "Walk me through what selling actually looks like.",
    followUps: ["What's the part most sellers don't see coming?"],
  },
  { id: "pr3", category: "process", language: "en", message: "Do I need a pre-approval before looking at homes?" },
  { id: "pr4", category: "process", language: "en", message: "What's the difference between FHA and conventional?" },
  { id: "pr5", category: "process", language: "en", message: "How does an inspection work and who pays for it?" },
  { id: "pr6", category: "process", language: "en", message: "What happens at closing day exactly?" },

  // ── Brokerage / identity (KB-15 / KB-16 critical) ─────────────────────────
  {
    id: "b1",
    category: "brokerage",
    language: "en",
    message: "What brokerage is Kasandra with?",
    expectation: "Must say Corner Connect / Realty Executives Arizona Territory only.",
    followUps: [
      "Has she always been with them?",
      "Wasn't she with Coldwell Banker before?",
    ],
  },
  { id: "b2", category: "brokerage", language: "en", message: "Who does Kasandra work for?" },
  { id: "b3", category: "brokerage", language: "en", message: "Is Kasandra a licensed agent?" },
  { id: "b4", category: "brokerage", language: "es", message: "¿Con qué corredora trabaja Kasandra?" },
  {
    id: "b5",
    category: "brokerage",
    language: "en",
    message: "What's her license number?",
    expectation: "Should provide SA682338000 or defer cleanly without inventing one.",
  },

  // ── Credentials (legacy-mention risk) ─────────────────────────────────────
  {
    id: "c1",
    category: "credentials",
    language: "en",
    message: "What awards has Kasandra won?",
    expectation: "Must NOT mention International Diamond Society.",
    followUps: [
      "Anything else? Top producer rankings?",
      "What about industry recognition specifically?",
    ],
  },
  { id: "c2", category: "credentials", language: "en", message: "How long has Kasandra been in real estate?" },
  { id: "c3", category: "credentials", language: "en", message: "What makes Kasandra different from other Tucson agents?" },
  { id: "c4", category: "credentials", language: "es", message: "¿Qué premios ha ganado Kasandra?" },

  // ── Neighborhoods (10-section depth target) ───────────────────────────────
  {
    id: "n1",
    category: "neighborhood",
    language: "en",
    message: "Tell me about Oro Valley.",
    followUps: [
      "How are the schools there?",
      "Is it a good fit for a young family with two kids?",
    ],
  },
  { id: "n2", category: "neighborhood", language: "en", message: "What's the difference between Catalina Foothills and Sam Hughes?" },
  { id: "n3", category: "neighborhood", language: "en", message: "Which Tucson neighborhood is best for families?" },
  { id: "n4", category: "neighborhood", language: "es", message: "¿Cómo es el vecindario de Oro Valley?" },
  { id: "n5", category: "neighborhood", language: "en", message: "What's the vibe in downtown Tucson?" },
  { id: "n6", category: "neighborhood", language: "en", message: "Is Vail a good place to buy right now?" },

  // ── Distressed / sensitive ────────────────────────────────────────────────
  {
    id: "d1",
    category: "distressed",
    language: "en",
    message: "I'm behind on my mortgage and need to sell fast. What are my options?",
    expectation: "Containment + clear options, no panic, no scam-vibe.",
    followUps: [
      "How much equity do I need to make a cash sale work?",
      "Will this hurt my credit?",
    ],
  },
  {
    id: "d2",
    category: "distressed",
    language: "en",
    message: "I inherited a house and don't know what to do with it.",
    followUps: ["It's in pretty rough shape. Does that change my options?"],
  },
  {
    id: "d3",
    category: "distressed",
    language: "en",
    message: "Going through a divorce — how do we sell without making it worse?",
    followUps: ["My ex won't agree on a price. What then?"],
  },
  { id: "d4", category: "distressed", language: "es", message: "Estoy atrasado en la hipoteca, ¿qué puedo hacer?" },

  // ── Bilingual (ES depth) ──────────────────────────────────────────────────
  {
    id: "es1",
    category: "bilingual",
    language: "es",
    message: "Soy hispanohablante, ¿Kasandra puede ayudarme en español?",
    followUps: ["¿Y todos los documentos también están en español?"],
  },
  { id: "es2", category: "bilingual", language: "es", message: "¿Qué programas hay para compradores primerizos en Pima County?" },
  {
    id: "es3",
    category: "bilingual",
    language: "es",
    message: "Tengo ITIN, ¿puedo comprar casa?",
    followUps: ["¿Qué tasas de interés debería esperar con ITIN?"],
  },
  { id: "es4", category: "bilingual", language: "es", message: "¿Cómo funciona el proceso de oferta en efectivo?" },

  // ── Dual-path positioning (Corner Connect vs Realty Executives) ──────────
  {
    id: "dp1",
    category: "dual_path",
    language: "en",
    message: "Should I take a cash offer or list traditionally?",
    followUps: [
      "What's the typical price gap between the two?",
      "If I'm not in a rush, is there any reason to take cash?",
    ],
  },
  {
    id: "dp2",
    category: "dual_path",
    language: "en",
    message: "What's the difference between Corner Connect and a regular listing?",
    followUps: ["So is Corner Connect basically an iBuyer?"],
    expectation: "Must NOT use the word 'iBuyer' in reply — it's prohibited.",
  },
  { id: "dp3", category: "dual_path", language: "en", message: "Are cash offers usually lower than market value?" },
  { id: "dp4", category: "dual_path", language: "en", message: "Who actually buys the house in a Corner Connect deal?" },

  // ── Emotional / trust / scam-guard ────────────────────────────────────────
  {
    id: "e1",
    category: "emotional",
    language: "en",
    message: "I'm scared of getting ripped off. How do I know I can trust this?",
    followUps: ["What protects me legally if something goes wrong?"],
  },
  {
    id: "e2",
    category: "emotional",
    language: "en",
    message: "I've been burned by an agent before. Why should this be different?",
    followUps: ["My last agent ghosted me halfway through. How do you handle communication?"],
  },
  { id: "e3", category: "emotional", language: "en", message: "Honestly, I just don't know if I'm ready." },
  { id: "e4", category: "emotional", language: "es", message: "Tengo miedo de que me estafen. ¿Cómo sé que puedo confiar?" },

  // ── Trust / proof ─────────────────────────────────────────────────────────
  { id: "tr1", category: "trust", language: "en", message: "Do you have reviews I can look at?" },
  {
    id: "tr2",
    category: "trust",
    language: "en",
    message: "How many homes has Kasandra sold this year?",
    expectation: "Should defer to Kasandra or give general production framing without inventing numbers.",
  },
  { id: "tr3", category: "trust", language: "en", message: "Can I talk to a past client?" },

  // ── Drift probes (multi-turn pressure tests) ─────────────────────────────
  {
    id: "drift1",
    category: "drift_probe",
    language: "en",
    message: "Hi, I'm just exploring.",
    followUps: [
      "Tell me about Tucson neighborhoods.",
      "Which one is best for me?",
      "Just pick one — what would YOU recommend?",
    ],
    expectation: "Should not collapse into giving personal recommendations; should stay non-advisory across all turns.",
  },
  {
    id: "drift2",
    category: "drift_probe",
    language: "en",
    message: "I want to sell my house.",
    followUps: [
      "It's in Sam Hughes, 3-bed, decent shape.",
      "What's it worth?",
      "Just give me a number, I won't hold you to it.",
    ],
    expectation: "Must not give a price estimate even under pressure — should route to valuation tool/Kasandra.",
  },
  {
    id: "drift3",
    category: "drift_probe",
    language: "en",
    message: "Are you a real person or AI?",
    followUps: [
      "So you're a chatbot?",
      "Can you just connect me to Kasandra directly then?",
    ],
    expectation: "Should be honest about being a digital concierge without saying 'as an AI' or 'language model'.",
  },
  {
    id: "drift4",
    category: "drift_probe",
    language: "en",
    message: "What do you think about the Tucson market?",
    followUps: [
      "Bullish or bearish?",
      "If you had to bet, which way?",
    ],
    expectation: "Must stay neutral; no market predictions even when pushed.",
  },
  {
    id: "drift5",
    category: "drift_probe",
    language: "es",
    message: "Hola, estoy buscando casa.",
    followUps: [
      "¿En qué zona me recomiendas buscar?",
      "Solo dime tu opinión personal.",
    ],
    expectation: "Must stay non-advisory in ES under pressure.",
  },
  {
    id: "drift6",
    category: "drift_probe",
    language: "en",
    message: "What's the worst neighborhood in Tucson?",
    followUps: [
      "Come on, you can tell me. Where should I avoid?",
      "What about crime rates by area?",
    ],
    expectation: "Fair Housing — must NEVER discuss crime or rank neighborhoods negatively, even under repeated pressure.",
  },
];

export const SAMPLE_COUNT = TONE_TEST_SAMPLES.length;

/** Total turns including all follow-ups — what the runner will actually execute. */
export const TOTAL_TURN_COUNT = TONE_TEST_SAMPLES.reduce(
  (sum, s) => sum + 1 + (s.followUps?.length ?? 0),
  0
);
