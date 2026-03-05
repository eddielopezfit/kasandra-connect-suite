/**
 * DecisionLane - Phase 3: Intent Selection Above Guide Grid
 * 
 * 3 large cards that set intent + category and scroll to the guide grid.
 * Always visible (not gated by first-visit). Replaces StartHereLane
 * for cognitive load reduction.
 * 
 * Click-First philosophy: no typing, instant routing.
 * Enriched: shows live guide count + top guide preview on selection.
 */

import { Home, TrendingUp, DollarSign, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { getLiveGuides } from "@/lib/guides/guideRegistry";

export type DecisionLaneIntent = 'sell' | 'cash' | 'buy';

interface DecisionLaneProps {
  activeIntent: DecisionLaneIntent | null;
  onIntentSelect: (intent: DecisionLaneIntent) => void;
}

// Category maps for each intent — what to count
const INTENT_CATEGORIES: Record<DecisionLaneIntent, string[]> = {
  sell: ['selling', 'valuation'],
  cash: ['cash'],
  buy: ['buying'],
};

/** Get guide count + top guide title for an intent */
function getIntentMeta(intent: DecisionLaneIntent): { count: number; topTitleEn: string; topTitleEs: string } {
  const categories = INTENT_CATEGORIES[intent];
  const guides = getLiveGuides().filter(g =>
    g.tier !== 3 && categories.includes(g.category)
  ).sort((a, b) => a.tier !== b.tier ? a.tier - b.tier : a.sortOrder - b.sortOrder);

  return {
    count: guides.length,
    topTitleEn: guides[0]?.labelEn ?? '',
    topTitleEs: guides[0]?.labelEs ?? '',
  };
}

const LANES: {
  intent: DecisionLaneIntent;
  icon: typeof Home;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
  accentClass: string;
  activeClass: string;
  countColor: string;
}[] = [
  {
    intent: 'sell',
    icon: TrendingUp,
    labelEn: "I'm thinking about selling",
    labelEs: "Estoy pensando en vender",
    descEn: "Timing, pricing, and your best path forward",
    descEs: "Tiempo, precio y tu mejor camino",
    accentClass: "border-emerald-200 hover:border-emerald-400",
    activeClass: "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200",
    countColor: "bg-emerald-100 text-emerald-700",
  },
  {
    intent: 'cash',
    icon: DollarSign,
    labelEn: "I want a cash offer",
    labelEs: "Quiero una oferta en efectivo",
    descEn: "Compare cash vs. traditional and protect yourself",
    descEs: "Compara efectivo vs. tradicional y protégete",
    accentClass: "border-amber-200 hover:border-amber-400",
    activeClass: "border-amber-500 bg-amber-50 ring-2 ring-amber-200",
    countColor: "bg-amber-100 text-amber-700",
  },
  {
    intent: 'buy',
    icon: Home,
    labelEn: "I'm buying",
    labelEs: "Estoy comprando",
    descEn: "From pre-approval to keys in hand",
    descEs: "Desde pre-aprobación hasta llaves en mano",
    accentClass: "border-sky-200 hover:border-sky-400",
    activeClass: "border-sky-500 bg-sky-50 ring-2 ring-sky-200",
    countColor: "bg-sky-100 text-sky-700",
  },
];

const DecisionLane = ({ activeIntent, onIntentSelect }: DecisionLaneProps) => {
  const { t } = useLanguage();

  return (
    <section className="bg-cc-ivory py-10 md:py-14">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl text-cc-navy text-center mb-2">
          {t("What brings you here?", "¿Qué te trae aquí?")}
        </h2>
        <p className="text-cc-slate text-center mb-8 max-w-lg mx-auto">
          {t(
            "Choose your path and we'll show you the most relevant guides.",
            "Elige tu camino y te mostraremos las guías más relevantes."
          )}
        </p>
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {LANES.map(({ intent, icon: Icon, labelEn, labelEs, descEn, descEs, accentClass, activeClass, countColor }) => {
            const isActive = activeIntent === intent;
            const meta = getIntentMeta(intent);

            return (
              <button
                key={intent}
                onClick={() => onIntentSelect(intent)}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl bg-white border-2 transition-all duration-200 cursor-pointer text-center",
                  isActive ? activeClass : accentClass
                )}
              >
                <Icon className={cn(
                  "w-8 h-8 transition-colors",
                  isActive ? "text-cc-navy" : "text-cc-slate"
                )} />
                <span className={cn(
                  "font-semibold text-base leading-tight",
                  isActive ? "text-cc-navy" : "text-cc-charcoal"
                )}>
                  {t(labelEn, labelEs)}
                </span>
                <span className="text-xs text-cc-slate leading-snug">
                  {t(descEn, descEs)}
                </span>

                {/* Guide count badge — always visible */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                    isActive ? countColor : "bg-cc-sand text-cc-slate/70"
                  )}>
                    <BookOpen className="w-3 h-3" />
                    {meta.count} {t("guides", "guías")}
                  </span>
                </div>

                {/* Top guide preview — only when active */}
                {isActive && meta.topTitleEn && (
                  <div className="w-full mt-1 pt-2 border-t border-current/10">
                    <p className="text-xs text-cc-slate/70 truncate">
                      {t("Start with:", "Empieza con:")} {t(meta.topTitleEn, meta.topTitleEs)}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DecisionLane;
