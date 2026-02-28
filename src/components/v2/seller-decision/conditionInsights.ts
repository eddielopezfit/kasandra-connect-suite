/**
 * Bilingual condition interpretation data for the Seller Decision Path.
 * Deterministic — no AI variance. Each tier maps to buyer type, speed, and prep expectations.
 * 
 * Canonical tiers (worst → best): needs_work, mostly_original, standard, updated, like_new
 */

export type ConditionTier = 'needs_work' | 'mostly_original' | 'standard' | 'updated' | 'like_new';

export interface ConditionInsight {
  tier: ConditionTier;
  labelEn: string;
  labelEs: string;
  descriptionEn: string;
  descriptionEs: string;
  buyerTypeEn: string;
  buyerTypeEs: string;
  speedEn: string;
  speedEs: string;
  prepEn: string;
  prepEs: string;
  /** Visual hint color token (maps to design system) */
  accentColor: string;
}

export const conditionInsights: Record<ConditionTier, ConditionInsight> = {
  needs_work: {
    tier: 'needs_work',
    labelEn: 'Needs Work',
    labelEs: 'Necesita Trabajo',
    descriptionEn: 'Major repairs needed — structural, roof, plumbing, or foundation issues.',
    descriptionEs: 'Reparaciones mayores necesarias — problemas estructurales, techo, plomería o cimientos.',
    buyerTypeEn: 'Cash investors and flippers are your most likely buyers.',
    buyerTypeEs: 'Inversionistas en efectivo y "flippers" son los compradores más probables.',
    speedEn: 'Fastest path to close — often 7–21 days.',
    speedEs: 'Camino más rápido al cierre — frecuentemente 7–21 días.',
    prepEn: 'Minimal prep needed. Sell as-is.',
    prepEs: 'Preparación mínima necesaria. Venda como está.',
    accentColor: 'destructive',
  },
  mostly_original: {
    tier: 'mostly_original',
    labelEn: 'Mostly Original',
    labelEs: 'Mayormente Original',
    descriptionEn: 'Livable but dated — cosmetic updates, older systems, some deferred maintenance.',
    descriptionEs: 'Habitable pero anticuada — actualizaciones cosméticas, sistemas antiguos, algo de mantenimiento diferido.',
    buyerTypeEn: 'Budget-conscious buyers or investors seeking value-add deals.',
    buyerTypeEs: 'Compradores conscientes de presupuesto o inversionistas buscando oportunidades.',
    speedEn: 'Moderate timeline — 30–60 days typical.',
    speedEs: 'Plazo moderado — 30–60 días típico.',
    prepEn: 'Light cleaning and decluttering recommended. Major repairs optional.',
    prepEs: 'Limpieza ligera y orden recomendados. Reparaciones mayores opcionales.',
    accentColor: 'accent',
  },
  standard: {
    tier: 'standard',
    labelEn: 'Standard Condition',
    labelEs: 'Condición Estándar',
    descriptionEn: 'Well-maintained with minor cosmetic needs — paint, landscaping touch-ups.',
    descriptionEs: 'Bien mantenida con necesidades cosméticas menores — pintura, retoques de jardinería.',
    buyerTypeEn: 'Traditional buyers including families and first-time homebuyers.',
    buyerTypeEs: 'Compradores tradicionales incluyendo familias y compradores primerizos.',
    speedEn: 'Standard timeline — 30–90 days depending on market.',
    speedEs: 'Plazo estándar — 30–90 días dependiendo del mercado.',
    prepEn: 'Some staging and minor cosmetic work can boost your price.',
    prepEs: 'Algo de preparación y trabajo cosmético menor puede aumentar su precio.',
    accentColor: 'primary',
  },
  updated: {
    tier: 'updated',
    labelEn: 'Updated / Move-In Ready',
    labelEs: 'Actualizada / Lista para Mudarse',
    descriptionEn: 'Updated finishes, modern systems, no immediate repairs needed.',
    descriptionEs: 'Acabados actualizados, sistemas modernos, sin reparaciones inmediatas necesarias.',
    buyerTypeEn: 'Broadest buyer pool — families, professionals, relocators.',
    buyerTypeEs: 'Mayor grupo de compradores — familias, profesionales, personas reubicándose.',
    speedEn: 'Strong demand — often under 30 days in active markets.',
    speedEs: 'Demanda fuerte — frecuentemente menos de 30 días en mercados activos.',
    prepEn: 'Professional photos and staging maximize your premium.',
    prepEs: 'Fotos profesionales y preparación maximizan su precio premium.',
    accentColor: 'primary',
  },
  like_new: {
    tier: 'like_new',
    labelEn: 'Like New / Recently Renovated',
    labelEs: 'Como Nueva / Recientemente Renovada',
    descriptionEn: 'Recently remodeled or built — premium finishes, modern everything.',
    descriptionEs: 'Recientemente remodelada o construida — acabados premium, todo moderno.',
    buyerTypeEn: 'Premium buyers willing to pay top dollar for turnkey homes.',
    buyerTypeEs: 'Compradores premium dispuestos a pagar el mejor precio por casas listas.',
    speedEn: 'Fastest traditional sale — high demand, competitive offers.',
    speedEs: 'Venta tradicional más rápida — alta demanda, ofertas competitivas.',
    prepEn: 'Minimal prep. Your investment in renovation pays off at listing.',
    prepEs: 'Preparación mínima. Su inversión en renovación se paga al listar.',
    accentColor: 'primary',
  },
};

/** Ordered tiers for rendering (worst → best) */
export const conditionTierOrder: ConditionTier[] = [
  'needs_work', 'mostly_original', 'standard', 'updated', 'like_new',
];
