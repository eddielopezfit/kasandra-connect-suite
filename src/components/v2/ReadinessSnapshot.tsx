import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, DollarSign, Home, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReadinessSnapshotProps {
  readiness_score: number;
  primary_priority: string;
  intent: "buy" | "sell" | "cash";
}

type ScoreBand = "early" | "building" | "ready";

// ─── Score Band Logic ────────────────────────────────────────────────────────

function getScoreBand(score: number): ScoreBand {
  if (score >= 70) return "ready";
  if (score >= 40) return "building";
  return "early";
}

function useScoreBandLabel(band: ScoreBand) {
  const { t } = useLanguage();
  const labels: Record<ScoreBand, { en: string; es: string }> = {
    early: { en: "Exploring", es: "Explorando" },
    building: { en: "Getting Ready", es: "Preparándose" },
    ready: { en: "Ready to Move", es: "Listo/a para Avanzar" },
  };
  return t(labels[band].en, labels[band].es);
}

function getBandColor(band: ScoreBand): string {
  switch (band) {
    case "ready": return "text-emerald-600";
    case "building": return "text-cc-gold-dark";
    case "early": return "text-cc-slate";
  }
}

function getBadgeRing(band: ScoreBand): string {
  switch (band) {
    case "ready": return "ring-emerald-200 bg-emerald-50";
    case "building": return "ring-cc-gold/30 bg-cc-gold/10";
    case "early": return "ring-cc-sand-dark bg-cc-sand/30";
  }
}

// ─── Dynamic Insights ────────────────────────────────────────────────────────

function useInsights(
  intent: "buy" | "sell" | "cash",
  priority: string,
  band: ScoreBand
) {
  const { t } = useLanguage();

  // Band-level insight (always first)
  const bandInsight: Record<ScoreBand, { en: string; es: string }> = {
    ready: {
      en: "Your readiness is strong — you're closer than most to your next step.",
      es: "Tu preparación es sólida — estás más cerca que la mayoría de tu próximo paso.",
    },
    building: {
      en: "You're building momentum — a few key moves will get you there.",
      es: "Estás ganando impulso — algunos pasos clave te llevarán ahí.",
    },
    early: {
      en: "You're in exploration mode — that's exactly the right place to start.",
      es: "Estás en modo exploración — ese es exactamente el lugar correcto para comenzar.",
    },
  };

  // Priority-level insight (second)
  const priorityInsights: Record<string, { en: string; es: string }> = {
    // Buyer priorities
    monthly_payment: {
      en: "Payment clarity is your focus — a lender conversation is your power move.",
      es: "La claridad del pago es tu enfoque — hablar con un prestamista es tu mejor jugada.",
    },
    neighborhoods: {
      en: "Neighborhood fit matters to you — explore our local area guides.",
      es: "El vecindario ideal importa para ti — explora nuestras guías de áreas locales.",
    },
    affordability: {
      en: "Understanding your budget is key — pre-approval will give you confidence.",
      es: "Entender tu presupuesto es clave — la pre-aprobación te dará confianza.",
    },
    timing: {
      en: "Market timing matters — let's look at current Tucson trends together.",
      es: "El momento del mercado importa — veamos juntos las tendencias actuales de Tucson.",
    },
    // Seller priorities
    speed: {
      en: "You want to move fast — a cash offer comparison could save you weeks.",
      es: "Quieres moverte rápido — comparar ofertas en efectivo podría ahorrarte semanas.",
    },
    maximize_value: {
      en: "Top dollar is your goal — strategic prep and pricing will get you there.",
      es: "Obtener el mejor precio es tu meta — preparación estratégica y precio te llevarán ahí.",
    },
    simplicity: {
      en: "You want it simple — we'll handle the complexity so you don't have to.",
      es: "Lo quieres simple — nosotros manejamos la complejidad para que tú no tengas que hacerlo.",
    },
    flexibility: {
      en: "Keeping options open is smart — let's explore all your paths.",
      es: "Mantener opciones abiertas es inteligente — exploremos todos tus caminos.",
    },
    // Cash priorities
    certainty: {
      en: "A guaranteed close matters most — cash offers remove the uncertainty.",
      es: "Un cierre garantizado es lo más importante — las ofertas en efectivo eliminan la incertidumbre.",
    },
    no_repairs: {
      en: "Selling as-is is your priority — no showings, no fix-up costs.",
      es: "Vender como está es tu prioridad — sin visitas, sin costos de reparación.",
    },
  };

  const insights: string[] = [];
  insights.push(t(bandInsight[band].en, bandInsight[band].es));

  const pi = priorityInsights[priority];
  if (pi) {
    insights.push(t(pi.en, pi.es));
  }

  return insights;
}

// ─── Recommended Next Step ───────────────────────────────────────────────────

interface NextStep {
  label: { en: string; es: string };
  path: string;
  icon: typeof ArrowRight;
}

function getNextStep(intent: "buy" | "sell" | "cash", priority: string, band: ScoreBand): NextStep {
  if (intent === "cash") {
    if (band === "ready") {
      return {
        label: { en: "Get Your Cash Offer", es: "Obtén Tu Oferta en Efectivo" },
        path: "/private-cash-review",
        icon: DollarSign,
      };
    }
    return {
      label: { en: "Compare Cash vs. Listing", es: "Compara Efectivo vs. Listado" },
      path: "/cash-offer-options",
      icon: DollarSign,
    };
  }

  if (intent === "sell") {
    if (priority === "speed" || priority === "simplicity") {
      return {
        label: { en: "Compare Your Options", es: "Compara Tus Opciones" },
        path: "/cash-offer-options",
        icon: DollarSign,
      };
    }
    if (priority === "maximize_value") {
      return {
        label: { en: "Read the Selling Guide", es: "Lee la Guía de Venta" },
        path: "/guides/selling-for-top-dollar",
        icon: BookOpen,
      };
    }
    return {
      label: { en: "Explore Your Paths", es: "Explora Tus Caminos" },
      path: "/seller-decision",
      icon: MapPin,
    };
  }

  // Buyer
  if (band === "ready") {
    return {
      label: { en: "Book a Strategy Call", es: "Agenda una Llamada Estratégica" },
      path: "/book?intent=buy&source=readiness",
      icon: ArrowRight,
    };
  }
  if (priority === "neighborhoods") {
    return {
      label: { en: "Explore Neighborhoods", es: "Explora Vecindarios" },
      path: "/community",
      icon: Home,
    };
  }
  return {
    label: { en: "Read the Buyer's Guide", es: "Lee la Guía del Comprador" },
    path: "/guides/first-time-buyer-guide",
    icon: BookOpen,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

const ReadinessSnapshot = ({
  readiness_score,
  primary_priority,
  intent,
}: ReadinessSnapshotProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const band = getScoreBand(readiness_score);
  const bandLabel = useScoreBandLabel(band);
  const insights = useInsights(intent, primary_priority, band);
  const nextStep = getNextStep(intent, primary_priority, band);
  const NextIcon = nextStep.icon;

  return (
    <div className="text-center">
      {/* Score Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6"
      >
        <div
          className={`w-24 h-24 rounded-full ring-4 ${getBadgeRing(band)} flex flex-col items-center justify-center mx-auto`}
        >
          <span className="font-serif text-3xl font-bold text-cc-navy leading-none">
            {readiness_score}
          </span>
          <span className="text-[10px] text-cc-slate uppercase tracking-wider mt-0.5">
            /100
          </span>
        </div>
        <p className={`text-sm font-semibold mt-3 ${getBandColor(band)}`}>
          {bandLabel}
        </p>
      </motion.div>

      {/* Insight Bullets */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
        className="space-y-3 max-w-sm mx-auto mb-8 text-left"
      >
        {insights.map((insight, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="w-1.5 h-1.5 rounded-full bg-cc-gold mt-2 shrink-0" />
            <p className="text-sm text-cc-charcoal leading-relaxed">{insight}</p>
          </div>
        ))}
      </motion.div>

      {/* Recommended Next Step */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.65, ease: "easeOut" }}
      >
        <Button
          onClick={() => navigate(nextStep.path)}
          className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-8 shadow-gold text-sm sm:text-base min-h-[44px] active:scale-[0.98] transition-all"
        >
          {t(nextStep.label.en, nextStep.label.es)}
          <NextIcon className="w-4 h-4 ml-2" />
        </Button>

        {/* Browse guides fallback */}
        <div className="mt-4">
          <button
            onClick={() => navigate("/v2/guides")}
            className="text-xs text-cc-slate hover:text-cc-navy transition-colors underline underline-offset-4 min-h-[44px] inline-flex items-center"
          >
            {t("Browse all guides", "Ver todas las guías")}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ReadinessSnapshot;
