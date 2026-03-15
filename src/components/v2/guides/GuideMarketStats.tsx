import { TrendingUp, Clock, DollarSign, BarChart2, Signal, SignalZero } from "lucide-react";
import { useMarketPulse } from "@/hooks/useMarketPulse";
import { useLanguage } from "@/contexts/LanguageContext";

type StatVariant = 
  | 'seller-full'        // All 4 stats — for cost-to-sell, pricing, home-prep guides
  | 'dom-only'           // Days on market only — for how-long-to-sell
  | 'sale-to-list-only'  // Sale-to-list ratio only — for pricing strategy
  | 'holding-cost-only'; // Holding cost only — for cost-to-sell inline callout

interface GuideMarketStatsProps {
  variant?: StatVariant;
}

/**
 * GuideMarketStats
 *
 * Drops live Tucson market data inline into any guide section.
 * Automatically shows "Live" or "Estimated" badge based on data freshness.
 * Graceful fallback — never shows broken state.
 *
 * Usage in guide registry media slots or directly in guide content:
 *   <GuideMarketStats variant="seller-full" />
 */
export function GuideMarketStats({ variant = 'seller-full' }: GuideMarketStatsProps) {
  const { t, language } = useLanguage();
  const { stats, isLive, loading } = useMarketPulse(language);

  const liveLabel = isLive
    ? t("Live Tucson Data", "Datos en Vivo de Tucson")
    : t("Estimated — Verify with Kasandra", "Estimado — Verifica con Kasandra");

  const verifiedLabel = stats.month
    ? stats.month
    : t("Data sourced from Pima County MLS", "Datos del MLS del Condado de Pima");

  const statCards = [
    {
      id: 'dom',
      icon: Clock,
      value: loading ? "—" : `${stats.daysOnMarket}`,
      unit: t("days", "días"),
      label: t("Median days on market", "Días promedio en el mercado"),
      show: ['seller-full', 'dom-only'],
    },
    {
      id: 'stl',
      icon: TrendingUp,
      value: loading ? "—" : stats.saleToListRatio,
      unit: "",
      label: t("Sale-to-list ratio", "Proporción precio de venta vs. lista"),
      show: ['seller-full', 'sale-to-list-only'],
    },
    {
      id: 'hold',
      icon: DollarSign,
      value: loading ? "—" : `$${stats.holdingCostPerDay}`,
      unit: t("/day", "/día"),
      label: t("Estimated holding cost", "Costo estimado de tenencia"),
      show: ['seller-full', 'holding-cost-only'],
    },
    {
      id: 'prep',
      icon: BarChart2,
      value: loading ? "—" : `$${stats.prepAvg.toLocaleString()}`,
      unit: "",
      label: t("Avg pre-sale prep spend", "Gasto promedio de preparación"),
      show: ['seller-full'],
    },
  ].filter(s => s.show.includes(variant));

  return (
    <div className="my-8 rounded-xl border border-cc-navy/10 overflow-hidden">
      {/* Header bar */}
      <div className="bg-cc-navy px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive
            ? <Signal className="w-4 h-4 text-cc-gold" />
            : <SignalZero className="w-4 h-4 text-white/40" />
          }
          <span className="text-sm font-medium text-white">{liveLabel}</span>
        </div>
        <span className="text-xs text-white/50">{verifiedLabel}</span>
      </div>

      {/* Stat grid */}
      <div className={`grid gap-px bg-cc-navy/10 ${statCards.length === 1 ? 'grid-cols-1' : statCards.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="bg-white px-5 py-5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-cc-navy/40 mb-1">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-2xl font-semibold text-cc-navy">
                  {stat.value}
                </span>
                {stat.unit && (
                  <span className="text-sm text-cc-charcoal/60">{stat.unit}</span>
                )}
              </div>
              <p className="text-xs text-cc-charcoal/60 leading-tight">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
