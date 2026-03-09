import { MappedReply, normalizeChipLabel, findChipByNormalizedKey } from '@/lib/registry/chipsRegistry';
import { getGuideChips } from '@/lib/registry/guideChipMap';
import { logEvent } from '@/lib/analytics/logEvent';
import { SessionContext } from '@/lib/analytics/selenaSession';

export const CLIENT_TOOL_BLOCKED_CHIPS: Record<string, { en: string; es: string }[]> = {
  buyer_readiness: [
    { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
    { en: 'Take readiness check',     es: 'Tomar evaluación de preparación' },
    { en: 'Check my readiness',       es: 'Verificar mi preparación' },
  ],
  seller_readiness: [
    { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' },
  ],
  cash_readiness: [
    { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' },
  ],
  seller_decision: [
    { en: 'Get my selling options', es: 'Ver mis opciones de venta' },
  ],
  tucson_alpha_calculator: [
    { en: 'Estimate my net proceeds',   es: 'Estimar mis ganancias netas' },
    { en: 'Compare cash vs. listing',   es: 'Comparar efectivo vs. listado' },
  ],
};

export const CLIENT_TOOL_REPLACEMENT: Record<string, { en: string; es: string }> = {
  buyer_readiness:          { en: 'Browse guides',         es: 'Explorar guías' },
  seller_readiness:         { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  cash_readiness:           { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
  seller_decision:          { en: 'Talk with Kasandra',    es: 'Hablar con Kasandra' },
  tucson_alpha_calculator:  { en: 'Talk with Kasandra',    es: 'Hablar con Kasandra' },
};

export function mapChipsToActionSpecs(
  replies: string[],
  opts?: { phase?: number; intent?: string },
): MappedReply[] {
  const phase = opts?.phase;
  const intent = opts?.intent;

  return replies.map((label) => {
    const entry = findChipByNormalizedKey(label);

    if (entry?.actionSpec) {
      return { label, actionSpec: entry.actionSpec };
    }

    logEvent('selena_chip_unmatched', {
      chip_label_raw: label,
      chip_label_normalized: normalizeChipLabel(label),
      phase,
      intent,
    });

    return { label };
  });
}

export function getPhaseAwareChips(
  t: (en: string, es: string) => string,
  ctx?: SessionContext | null,
): MappedReply[] {
  const floor = ctx?.chip_phase_floor ?? 0;
  const intent = ctx?.intent;
  const toolsDone = new Set(ctx?.tools_completed ?? []);
  const lang = (ctx as any)?._lang ?? 'en';

  const blockedLabels = new Set<string>();
  for (const toolId of toolsDone) {
    for (const entry of CLIENT_TOOL_BLOCKED_CHIPS[toolId] ?? []) {
      blockedLabels.add(entry.en.toLowerCase());
      blockedLabels.add(entry.es.toLowerCase());
    }
  }

  function isBlocked(en: string, es: string): boolean {
    return blockedLabels.has(en.toLowerCase()) || blockedLabels.has(es.toLowerCase());
  }

  function pickLabel(en: string, es: string): string {
    return t(en, es);
  }

  function filterAndReplace(candidates: { en: string; es: string }[]): string[] {
    const out: string[] = [];
    const addedDests = new Set<string>();

    for (const c of candidates) {
      if (!isBlocked(c.en, c.es)) {
        out.push(pickLabel(c.en, c.es));
        addedDests.add(c.en);
      }
    }

    for (const toolId of toolsDone) {
      const blocked = CLIENT_TOOL_BLOCKED_CHIPS[toolId] ?? [];
      const wasBlocked = blocked.some(b => candidates.some(c => c.en === b.en));
      if (!wasBlocked) continue;

      const replacement = CLIENT_TOOL_REPLACEMENT[toolId];
      if (!replacement) continue;
      if (addedDests.has(replacement.en)) continue;
      if (isBlocked(replacement.en, replacement.es)) continue;

      out.push(pickLabel(replacement.en, replacement.es));
      addedDests.add(replacement.en);
    }

    return out;
  }

  function prependGuideChip(chipLabels: string[], forIntent?: string): string[] {
    const guideId = ctx?.last_guide_id;
    if (!guideId) return chipLabels;
    const guideChipLabels = getGuideChips(guideId, lang as 'en' | 'es', forIntent);
    if (guideChipLabels.length === 0) return chipLabels;
    const first = guideChipLabels[0];
    if (chipLabels.some(c => c.toLowerCase() === first.toLowerCase())) return chipLabels;
    return [first, ...chipLabels.slice(0, 2)];
  }

  if (floor >= 3) {
    const chips = filterAndReplace([
      { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' },
      { en: 'Talk with Kasandra',       es: 'Hablar con Kasandra' },
    ]);
    return mapChipsToActionSpecs(chips.length ? chips : [t('Talk with Kasandra', 'Hablar con Kasandra')]);
  }
  if (floor >= 2 && (intent === 'sell' || intent === 'cash')) {
    const chips = prependGuideChip(filterAndReplace([
      { en: 'Get my selling options',   es: 'Ver mis opciones de venta' },
      { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' },
    ]), intent === 'sell' ? 'sell' : 'cash');
    return mapChipsToActionSpecs(chips.length ? chips : [t('Talk with Kasandra', 'Hablar con Kasandra')]);
  }
  if (floor >= 2 && intent === 'buy') {
    const chips = prependGuideChip(filterAndReplace([
      { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' },
      { en: 'Browse guides',            es: 'Explorar guías' },
    ]), 'buy');
    return mapChipsToActionSpecs(chips.length ? chips : [t('Browse guides', 'Explorar guías')]);
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
