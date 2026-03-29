/**
 * BookingHydrationPanel — "What Kasandra Already Knows"
 * Pulls from VIP (Visitor Intelligence Profile) to show the visitor
 * a trust-building summary of everything the system has learned.
 * Reduces friction by proving the call will be personalized.
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { useVIP } from "@/hooks/useVIP";
import {
  CheckCircle,
  Target,
  BookOpen,
  DollarSign,
  MapPin,
  Clock,
  Home,
  User,
  Shield,
  TrendingUp,
} from "lucide-react";

interface InsightItem {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "highlight" | "special";
}

const BookingHydrationPanel = () => {
  const { t } = useLanguage();
  const { vip } = useVIP({ localOnly: true });

  const { identity, intent: vipIntent, financial, journey } = vip;
  const insights: InsightItem[] = [];

  // Intent
  if (vipIntent.intent && vipIntent.intent !== "explore") {
    const intentLabels: Record<string, { en: string; es: string }> = {
      buy: { en: "Looking to buy a home", es: "Interesado en comprar" },
      sell: { en: "Considering selling", es: "Considerando vender" },
      cash: { en: "Exploring cash offers", es: "Explorando ofertas en efectivo" },
      dual: { en: "Buying and selling", es: "Comprando y vendiendo" },
      investor: { en: "Investment opportunity", es: "Oportunidad de inversión" },
    };
    const label = intentLabels[vipIntent.intent];
    if (label) {
      insights.push({
        icon: <Home className="w-3.5 h-3.5" />,
        label: t(label.en, label.es),
      });
    }
  }

  // Timeline
  if (vipIntent.timeline) {
    const timelineLabels: Record<string, { en: string; es: string }> = {
      asap: { en: "Timeline: ASAP (0–30 days)", es: "Plazo: Lo antes posible (0–30 días)" },
      "30_days": { en: "Timeline: Next 30 days", es: "Plazo: Próximos 30 días" },
      "60_90": { en: "Timeline: 2–3 months", es: "Plazo: 2–3 meses" },
      exploring: { en: "Timeline: Exploring options", es: "Plazo: Explorando opciones" },
    };
    const label = timelineLabels[vipIntent.timeline];
    if (label) {
      insights.push({
        icon: <Clock className="w-3.5 h-3.5" />,
        label: t(label.en, label.es),
      });
    }
  }

  // Readiness score
  if (vipIntent.readinessScore && vipIntent.readinessScore > 0) {
    insights.push({
      icon: <Target className="w-3.5 h-3.5" />,
      label: t(
        `Readiness score: ${vipIntent.readinessScore}/100`,
        `Preparación: ${vipIntent.readinessScore}/100`
      ),
      variant: vipIntent.readinessScore >= 75 ? "highlight" : "default",
    });
  }

  // Budget (buyer)
  if (financial.estimatedBudget) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(financial.estimatedBudget);
    insights.push({
      icon: <DollarSign className="w-3.5 h-3.5" />,
      label: t(`Estimated budget: ${formatted}`, `Presupuesto estimado: ${formatted}`),
    });
  }

  // Estimated value (seller)
  if (financial.estimatedValue && !financial.estimatedBudget) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(financial.estimatedValue);
    insights.push({
      icon: <DollarSign className="w-3.5 h-3.5" />,
      label: t(`Estimated home value: ${formatted}`, `Valor estimado: ${formatted}`),
    });
  }

  // Calculator advantage
  if (financial.calculatorAdvantage && financial.calculatorDifference) {
    const diff = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.abs(financial.calculatorDifference));
    const advantageLabels: Record<string, { en: string; es: string }> = {
      traditional: {
        en: `Traditional listing nets ~${diff} more`,
        es: `Venta tradicional genera ~${diff} más`,
      },
      cash: {
        en: `Cash offer advantage: ~${diff} faster close`,
        es: `Ventaja de oferta en efectivo: ~${diff} cierre más rápido`,
      },
      consult: {
        en: "Paths are close — consultation recommended",
        es: "Los caminos están cerca — consulta recomendada",
      },
    };
    const label = advantageLabels[financial.calculatorAdvantage];
    if (label) {
      insights.push({
        icon: <TrendingUp className="w-3.5 h-3.5" />,
        label: t(label.en, label.es),
        variant: "highlight",
      });
    }
  }

  // Tools completed
  if (journey.toolsCompleted.length > 0) {
    const count = journey.toolsCompleted.length;
    insights.push({
      icon: <BookOpen className="w-3.5 h-3.5" />,
      label: t(
        `${count} tool${count > 1 ? "s" : ""} completed`,
        `${count} herramienta${count > 1 ? "s" : ""} completada${count > 1 ? "s" : ""}`
      ),
    });
  }

  // Guides read
  if (journey.guidesCompleted.length > 0) {
    const count = journey.guidesCompleted.length;
    insights.push({
      icon: <User className="w-3.5 h-3.5" />,
      label: t(
        `${count} guide${count > 1 ? "s" : ""} read`,
        `${count} guía${count > 1 ? "s" : ""} leída${count > 1 ? "s" : ""}`
      ),
    });
  }

  // Neighborhood interest
  if (journey.lastNeighborhoodZip) {
    insights.push({
      icon: <MapPin className="w-3.5 h-3.5" />,
      label: t(
        `Area interest: ${journey.lastNeighborhoodZip}`,
        `Área de interés: ${journey.lastNeighborhoodZip}`
      ),
    });
  }

  // Seller decision path
  if (vipIntent.sellerDecisionPath) {
    const pathLabels: Record<string, { en: string; es: string }> = {
      cash: { en: "Recommended: Cash offer path", es: "Recomendado: Camino de oferta en efectivo" },
      traditional: { en: "Recommended: Traditional listing", es: "Recomendado: Venta tradicional" },
      consult: { en: "Recommended: Strategy consultation", es: "Recomendado: Consulta estratégica" },
    };
    const label = pathLabels[vipIntent.sellerDecisionPath];
    if (label) {
      insights.push({
        icon: <Shield className="w-3.5 h-3.5" />,
        label: t(label.en, label.es),
        variant: "highlight",
      });
    }
  }

  // If no insights, don't render
  if (insights.length === 0) return null;

  const greeting = userName
    ? t(
        `${userName}, here's what Kasandra already knows about you:`,
        `${userName}, esto es lo que Kasandra ya sabe sobre ti:`
      )
    : t(
        "Here's what Kasandra already knows about you:",
        "Esto es lo que Kasandra ya sabe sobre ti:"
      );

  return (
    <div className="bg-white border border-cc-gold/30 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
        <p className="text-sm font-semibold text-cc-navy">{greeting}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {insights.map((insight, i) => (
          <div
            key={i}
            className={`flex items-center gap-2.5 text-xs rounded-lg px-3 py-2 ${
              insight.variant === "highlight"
                ? "bg-cc-gold/10 text-cc-navy font-medium border border-cc-gold/20"
                : insight.variant === "special"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-cc-sand text-cc-charcoal"
            }`}
          >
            <span className="flex-shrink-0 text-cc-slate">{insight.icon}</span>
            {insight.label}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-cc-slate/60 mt-3 text-center">
        {t(
          "This means your call starts where your research left off — not from scratch.",
          "Esto significa que su llamada comienza donde terminó su investigación — no desde cero."
        )}
      </p>
    </div>
  );
};

export default BookingHydrationPanel;
