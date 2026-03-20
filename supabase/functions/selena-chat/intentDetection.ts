/**
 * Intent Detection & Timeline Classification
 * Extracted from selena-chat/index.ts
 */

import type { CanonicalIntent } from "./types.ts";

// ============= CANONICAL VALUES =============
const INTENT_PRIORITY: Record<string, number> = {
  cash: 1,
  dual: 2,
  sell: 3,
  buy: 4,
  explore: 5,
};

/**
 * Picks the highest-priority intent from detected intents
 */
export function pickPrimaryIntent(intents: string[]): CanonicalIntent {
  const sorted = [...new Set(intents)].sort(
    (a, b) => (INTENT_PRIORITY[a] ?? 99) - (INTENT_PRIORITY[b] ?? 99)
  );
  return (sorted[0] as CanonicalIntent) || "explore";
}

/**
 * Normalizes detected intent to canonical values
 */
export function normalizeIntent(raw: string): CanonicalIntent | null {
  if (!raw) return null;
  const v = raw.toLowerCase().trim();
  if (v === "cash_offer") return "cash";
  if (v === "exploring") return "explore";
  if (v === "ready") return null;
  if (v === "investor" || v === "invest" || v === "rental" || v === "flip") return "invest";
  if (v === "buy" || v === "sell" || v === "cash" || v === "dual" || v === "explore" || v === "invest") return v;
  return null;
}

/**
 * Detects timeline/urgency from message
 */
export function detectTimeline(message: string): "asap" | "30_days" | "60_90" | null {
  const lower = message.toLowerCase();
  if (/\b(asap|now|today|pronto|ahora|hoy|inmediata|urgent)\b/.test(lower)) return "asap";
  if (/\b(month|30\s*days|mes|30\s*dias)\b/.test(lower)) return "30_days";
  if (/\b(60|90)\b|\b(3|6)\s*months?\b|\b1[-_]?3\s*months?\b/.test(lower)) return "60_90";
  return null;
}

/**
 * Detects intent(s) from message and route
 */
export function detectIntent(message: string, route: string = ''): string[] {
  const lower = (message || '').toLowerCase();
  const intents: string[] = [];
  
  if (/buy.*sell|sell.*buy|comprar.*vender|vender.*comprar|buy\s*first|sell\s*first/.test(lower)) {
    intents.push("dual");
  }
  
  if (/cash|efectivo|quick sale|herencia|inherited/.test(lower)) {
    intents.push("cash");
  }
  
  if (/investor|invest|rental property|flip|flipper|cap rate|\broi\b|landlord|airbnb|short.?term rental|investment property|propiedad de inversión|arrendador|renta|flipear|rendimiento/i.test(lower)) {
    intents.push("invest");
  }
  
  if (!intents.includes("dual") && !intents.includes("invest")) {
    if (/buy|comprar|purchase|busco casa|looking for a home/.test(lower)) intents.push("buy");
    if (/sell|vender|selling|list|listar/.test(lower)) intents.push("sell");
    if (/exploring|curious|thinking|quizás|no sé|just looking/.test(lower)) intents.push("explore");
    if (route.includes("cash-offer") || route.includes("seller")) intents.push("sell");
  }

  if (intents.length === 0) {
    if (/cma|comparative market|what.*listing|how.*list|seller|closing cost|days on market|net proceed|staging|home prep|what.*worth|home value|valuation|cuánto vale/i.test(lower)) {
      intents.push("sell");
    }
    else if (/pre.?approv|mortgage|down payment|first.?time buyer|what should i prepare|earnest money|inspection|closing|move.?in|neighborhood|school district|ftb|fha|va loan/i.test(lower)) {
      intents.push("buy");
    }
    else if (/is now a good time|market|interest rate|good time to|when should|right time|should i wait/i.test(lower)) {
      intents.push("explore");
    }
  }
  
  const normalized = intents.map(normalizeIntent).filter((i): i is CanonicalIntent => i !== null);
  return normalized.length > 0 ? [...new Set(normalized)] : ["explore"];
}

// Inherited home / estate detection
export const INHERITED_HOME_PATTERNS = /inherited|inheritance|estate|passed away|lost.*(?:grand|parent|mom|dad|father|mother)|(?:grand|parent|mom|dad).*passed|family home|deceased|left me|left us|died|falleci[oó]|herencia|heredé|propiedad.*familia/i;

// Trust signal detection
export const TRUST_SIGNAL_PATTERNS = /she seems|he seems|looks trustworthy|saw.*social|social media|heard about|referred|recommended|friend said|family said|seems pleasant|seems nice|seems legit|parece confiable|me recomendaron|vi.*redes sociales/i;
