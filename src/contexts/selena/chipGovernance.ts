import { MappedReply, normalizeChipLabel, findChipByNormalizedKey, findChipByKey } from '@/lib/registry/chipsRegistry';
import { CHIP_KEYS, type ChipKey } from '@/lib/registry/chipKeys';
import { getGuideChips } from '@/lib/registry/guideChipMap';
import { logEvent } from '@/lib/analytics/logEvent';
import { SessionContext, getGuidesCompleted } from '@/lib/analytics/selenaSession';

// ============= BLOCKED & REPLACEMENT MAPS (Semantic Keys) =============

/** Tool ID → semantic chip keys that should be suppressed when tool is completed */
export const CLIENT_TOOL_BLOCKED_CHIPS: Record<string, ChipKey[]> = {
  buyer_readiness: [
    CHIP_KEYS.BUYER_READINESS,
    CHIP_KEYS.BUYER_READINESS_SHORT,
    CHIP_KEYS.BUYER_READINESS_CHECK,
  ],
  seller_readiness: [
    CHIP_KEYS.SELLER_READINESS,
  ],
  cash_readiness: [
    CHIP_KEYS.CASH_READINESS,
  ],
  seller_decision: [
    CHIP_KEYS.GET_SELLING_OPTIONS,
  ],
  tucson_alpha_calculator: [
    CHIP_KEYS.ESTIMATE_PROCEEDS,
    CHIP_KEYS.COMPARE_CASH_LISTING,
  ],
};

/** Tool ID → semantic chip key to use as replacement when tool is completed */
export const CLIENT_TOOL_REPLACEMENT: Record<string, ChipKey> = {
  buyer_readiness:          CHIP_KEYS.BROWSE_GUIDES,
  seller_readiness:         CHIP_KEYS.ESTIMATE_PROCEEDS,
  cash_readiness:           CHIP_KEYS.ESTIMATE_PROCEEDS,
  seller_decision:          CHIP_KEYS.TALK_WITH_KASANDRA,
  tucson_alpha_calculator:  CHIP_KEYS.TALK_WITH_KASANDRA,
};

// ============= FIX 3: GUIDE CHIP SUPPRESSION =============

/** Maps guide IDs to their chip keys that should be suppressed when guide is completed */
const GUIDE_BLOCKED_CHIPS: Record<string, ChipKey[]> = {
  'first-time-buyer-guide': [CHIP_KEYS.GUIDE_FTB, CHIP_KEYS.GUIDE_FTB_VIEW],
  'cash-vs-traditional-sale': [CHIP_KEYS.GUIDE_CASH_VS_LISTING],
  'selling-for-top-dollar': [CHIP_KEYS.GUIDE_SELLING_TOP_DOLLAR],
  'military-pcs-guide': [CHIP_KEYS.GUIDE_MILITARY],
  'divorce-selling': [CHIP_KEYS.GUIDE_DIVORCE],
  'senior-downsizing': [CHIP_KEYS.GUIDE_SENIOR],
  'tucson-neighborhoods': [CHIP_KEYS.GUIDE_NEIGHBORHOODS],
  'relocating-to-tucson': [CHIP_KEYS.GUIDE_RELOCATION],
  'pricing-strategy': [CHIP_KEYS.GUIDE_PRICING],
  'cost-to-sell-tucson': [CHIP_KEYS.GUIDE_COST_TO_SELL],
  'capital-gains-home-sale-arizona': [CHIP_KEYS.GUIDE_CAPITAL_GAINS],
  'sell-or-rent-tucson': [CHIP_KEYS.GUIDE_SELL_OR_RENT],
  'how-long-to-sell-tucson': [CHIP_KEYS.GUIDE_HOW_LONG],
  'arizona-first-time-buyer-programs': [CHIP_KEYS.GUIDE_FTB_PROGRAMS],
  'tucson-suburb-comparison': [CHIP_KEYS.GUIDE_SUBURB_COMPARE],
  'buying-home-noncitizen-arizona': [CHIP_KEYS.GUIDE_NONCITIZEN],
  'arizona-real-estate-glossary': [CHIP_KEYS.GUIDE_GLOSSARY],

  // New SEO guides (March 2026) — suppress readiness/FTB chips once read
  'itin-loan-guide': [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BUYER_READINESS_SHORT],
  'bad-credit-home-buying-tucson': [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BUYER_READINESS_SHORT],
  'down-payment-assistance-tucson': [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BUYER_READINESS_SHORT],
  'fha-loan-pima-county-2026': [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BUYER_READINESS_SHORT],
  'va-home-loan-tucson': [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BUYER_READINESS_SHORT, CHIP_KEYS.GUIDE_MILITARY],
  'first-time-buyer-programs-pima-county': [CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.GUIDE_FTB_PROGRAMS],
  'divorce-home-sale-arizona': [CHIP_KEYS.GUIDE_DIVORCE],
  'tucson-market-update-2026': [CHIP_KEYS.TUCSON_MARKET_DATA],
};

// ============= SEMANTIC KEY → LOCALIZED LABEL RESOLUTION =============

/**
 * Resolves a reply (which may be a semantic key, display label, or raw text)
 * into a MappedReply with the correct localized label and ActionSpec.
 *
 * Resolution order:
 * 1. Semantic key lookup (CHIP_KEYS match) → localized label from registry
 * 2. Normalized text lookup → label passthrough with ActionSpec from registry
 * 3. Unmatched → logged as drift, returned as plain text
 */
function resolveReply(
  reply: string,
  language: 'en' | 'es',
  opts?: { phase?: number; intent?: string },
): MappedReply {
  // 1. Try semantic key lookup first
  const byKey = findChipByKey(reply);
  if (byKey) {
    const label = language === 'es' ? byKey.label_es : byKey.label_en;
    return { label, actionSpec: byKey.actionSpec };
  }

  // 2. Try normalized text lookup (fallback for LLM hallucinations / raw labels)
  const byText = findChipByNormalizedKey(reply);
  if (byText) {
    const label = language === 'es' ? byText.label_es : byText.label_en;
    return { label, actionSpec: byText.actionSpec };
  }

  // 3. Unmatched — log drift
  logEvent('selena_chip_unmatched', {
    chip_label_raw: reply,
    chip_label_normalized: normalizeChipLabel(reply),
    phase: opts?.phase,
    intent: opts?.intent,
  });

  return { label: reply };
}

// ============= PUBLIC API =============

/**
 * Maps an array of replies (semantic keys or display strings) to MappedReplies
 * with correct localized labels and ActionSpecs.
 *
 * @param replies - Array of semantic chip keys (preferred) or display strings
 * @param language - REQUIRED. Active language for label resolution.
 * @param opts - Optional phase/intent context for drift logging
 */
export function mapChipsToActionSpecs(
  replies: string[],
  language: 'en' | 'es',
  opts?: { phase?: number; intent?: string },
): MappedReply[] {
  return replies.map((reply) => resolveReply(reply, language, opts));
}

/**
 * Returns phase-aware chips for the current session context.
 * Uses semantic keys internally and resolves to localized labels.
 */
export function getPhaseAwareChips(
  t: (en: string, es: string) => string,
  ctx?: SessionContext | null,
): MappedReply[] {
  let floor = ctx?.chip_phase_floor ?? 0;
  const intent = ctx?.intent;
  const toolsDone = new Set(ctx?.tools_completed ?? []);
  const lang = (ctx as any)?._lang ?? 'en';
  
  // FIX 3: Get completed guides for chip suppression
  const guidesCompleted = new Set(getGuidesCompleted());
  
  // FIX 4: Auto-escalate phase floor based on guide depth
  const guidesReadCount = guidesCompleted.size;
  if (guidesReadCount >= 8 && floor < 3) {
    floor = 3; // Synthesis — only booking + high-value tools
  } else if (guidesReadCount >= 5 && floor < 2) {
    floor = 2; // Confidence — skip foundational education
  }

  // Build set of blocked semantic keys from completed tools
  const blockedKeys = new Set<ChipKey>();
  for (const toolId of toolsDone) {
    for (const key of CLIENT_TOOL_BLOCKED_CHIPS[toolId] ?? []) {
      blockedKeys.add(key);
    }
  }
  
  // Add blocked keys from completed guides
  for (const guideId of guidesCompleted) {
    for (const key of GUIDE_BLOCKED_CHIPS[guideId] ?? []) {
      blockedKeys.add(key);
    }
  }

  /** Check if a semantic key is blocked */
  function isBlocked(key: ChipKey): boolean {
    return blockedKeys.has(key);
  }

  /** Resolve a semantic key to its localized label */
  function resolveLabel(key: ChipKey): string {
    const entry = findChipByKey(key);
    if (entry) return lang === 'es' ? entry.label_es : entry.label_en;
    // Fallback: should never happen if registry is complete
    return key;
  }

  /** Filter candidates, replace blocked ones, return semantic keys */
  function filterAndReplace(candidates: ChipKey[]): ChipKey[] {
    const out: ChipKey[] = [];
    const addedKeys = new Set<ChipKey>();

    for (const key of candidates) {
      if (!isBlocked(key)) {
        out.push(key);
        addedKeys.add(key);
      }
    }

    // Add replacements for completed tools
    for (const toolId of toolsDone) {
      const blocked = CLIENT_TOOL_BLOCKED_CHIPS[toolId] ?? [];
      const wasBlocked = blocked.some(b => candidates.includes(b));
      if (!wasBlocked) continue;

      const replacement = CLIENT_TOOL_REPLACEMENT[toolId];
      if (!replacement) continue;
      if (addedKeys.has(replacement)) continue;
      if (isBlocked(replacement)) continue;

      out.push(replacement);
      addedKeys.add(replacement);
    }

    return out;
  }

  function prependGuideChip(chipKeys: ChipKey[], forIntent?: string): string[] {
    const labels = chipKeys.map(resolveLabel);
    const guideId = ctx?.last_guide_id;
    if (!guideId) return labels;
    const guideChipLabels = getGuideChips(guideId, lang as 'en' | 'es', forIntent);
    if (guideChipLabels.length === 0) return labels;
    const first = guideChipLabels[0];
    if (labels.some(l => l.toLowerCase() === first.toLowerCase())) return labels;
    return [first, ...labels.slice(0, 2)];
  }

  if (floor >= 3) {
    const keys = filterAndReplace([CHIP_KEYS.ESTIMATE_PROCEEDS, CHIP_KEYS.TALK_WITH_KASANDRA]);
    const labels = keys.map(resolveLabel);
    return mapChipsToActionSpecs(
      labels.length ? labels : [resolveLabel(CHIP_KEYS.TALK_WITH_KASANDRA)],
      lang as 'en' | 'es',
    );
  }
  if (floor >= 2 && (intent === 'sell' || intent === 'cash')) {
    const keys = filterAndReplace([CHIP_KEYS.GET_SELLING_OPTIONS, CHIP_KEYS.COMPARE_CASH_LISTING]);
    const labels = prependGuideChip(keys, intent === 'sell' ? 'sell' : 'cash');
    return mapChipsToActionSpecs(
      labels.length ? labels : [resolveLabel(CHIP_KEYS.TALK_WITH_KASANDRA)],
      lang as 'en' | 'es',
    );
  }
  if (floor >= 2 && intent === 'buy') {
    const keys = filterAndReplace([CHIP_KEYS.BUYER_READINESS, CHIP_KEYS.BROWSE_GUIDES]);
    const labels = prependGuideChip(keys, 'buy');
    return mapChipsToActionSpecs(
      labels.length ? labels : [resolveLabel(CHIP_KEYS.BROWSE_GUIDES)],
      lang as 'en' | 'es',
    );
  }
  if (floor >= 2 && intent) {
    return [
      { label: t("What are my options?", "¿Cuáles son mis opciones?") },
      { label: t("I have a question", "Tengo una pregunta") },
    ];
  }
  return [
    { label: t("I'm thinking about selling", "Estoy pensando en vender") },
    { label: t("I'm looking to buy", "Estoy buscando comprar") },
    { label: t("Just exploring for now", "Solo estoy explorando") },
  ];
}
