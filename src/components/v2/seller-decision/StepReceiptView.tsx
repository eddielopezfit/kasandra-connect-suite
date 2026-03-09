import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSessionId, getSessionContext, updateSessionContext, setFieldIfEmpty } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  RotateCcw,
  MessageCircle,
  Calendar,
  Zap,
  TrendingUp,
  HelpCircle,
  FileText,
  MapPin,
  Clock,
  Target,
  Home,
  CheckCircle,
} from "lucide-react";
import type { RecommendedPath } from "./StepDualPath";

interface ReceiptData {
  situation?: string;
  timeline?: string;
  goal_priority?: string;
  condition?: string;
  property_condition_raw?: string;
  recommended_path?: RecommendedPath;
  property?: {
    beds?: string;
    baths?: string;
    sqft?: string;
    homeEra?: string;
    hasPool?: boolean;
    hasGarage?: boolean;
    zip?: string;
  };
  neighborhood?: {
    zip?: string;
    lifestyle_feel?: string;
    buyer_fit?: string;
  } | null;
}

interface Receipt {
  id: string;
  session_id: string;
  receipt_type: string;
  receipt_data: ReceiptData;
  lead_id: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

interface StepReceiptViewProps {
  onBackToComparison: () => void;
  onRestart: () => void;
}

export default function StepReceiptView({ onBackToComparison, onRestart }: StepReceiptViewProps) {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      setError(false);
      try {
        const sessionId = getOrCreateSessionId();
        const { data, error: fnError } = await supabase.functions.invoke("get-decision-receipt", {
          body: { session_id: sessionId, receipt_type: "seller_decision" },
        });

        if (fnError) throw fnError;
        if (!data?.ok) throw new Error(data?.error || "Receipt not found");

        setReceipt(data.receipt as Receipt);
        logEvent("decision_receipt_viewed", { receipt_id: data.receipt.id });
        logEvent("seller_decision_step_completed", { step: 7, receipt_id: data.receipt.id });

        // Mark seller_decision as completed tool for journey awareness
        const ctx = getSessionContext();
        updateSessionContext({
          tool_used: 'seller_decision',
          last_tool_completed: 'seller_decision',
          tools_completed: [...new Set([...(ctx?.tools_completed ?? []), 'seller_decision'])],
        });
      } catch (e) {
        console.error("[StepReceiptView] Load error:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, []);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Error / not found
  if (error || !receipt) {
    return (
      <div className="text-center py-16 space-y-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-cc-navy">
            {t("Receipt not found", "Recibo no encontrado")}
          </h2>
          <p className="text-cc-text-muted text-sm max-w-md mx-auto">
            {t(
              "We couldn't load your Decision Receipt. You can start fresh or go back.",
              "No pudimos cargar su Recibo de Decisión. Puede empezar de nuevo o regresar."
            )}
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onBackToComparison} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t("Back", "Atrás")}
          </Button>
          <Button onClick={onRestart} className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy rounded-full">
            <RotateCcw className="w-4 h-4 mr-1" />
            {t("Start Over", "Empezar de Nuevo")}
          </Button>
        </div>
      </div>
    );
  }

  const rd = receipt.receipt_data;
  const recommended = rd.recommended_path;
  const conditionKey = rd.property_condition_raw ?? rd.condition ?? null;

  // Label maps
  const situationLabel: Record<string, string> = {
    inherited: t("Inherited property", "Propiedad heredada"),
    divorce: t("Divorce / separation", "Divorcio / separación"),
    tired_landlord: t("Tired landlord", "Propietario cansado"),
    upgrading: t("Upgrading", "Mejorando"),
    relocating: t("Relocating", "Reubicándose"),
    other: t("Other", "Otro"),
  };

  const timelineLabel: Record<string, string> = {
    soon: t("As soon as possible", "Lo antes posible"),
    considering: t("Within 30 days", "Dentro de 30 días"),
    exploring: t("Just exploring", "Solo explorando"),
  };

  const goalLabel: Record<string, string> = {
    speed: t("Speed", "Rapidez"),
    price: t("Highest price", "Mejor precio"),
    least_stress: t("Least stress", "Menos estrés"),
    privacy: t("Privacy", "Privacidad"),
    not_sure: t("Not sure yet", "No estoy seguro/a"),
  };

  const conditionLabel: Record<string, string> = {
    needs_work: t("Needs significant work", "Necesita trabajo significativo"),
    mostly_original: t("Mostly original", "Mayormente original"),
    standard: t("Standard / average", "Estándar / promedio"),
    updated: t("Recently updated", "Recientemente actualizada"),
    like_new: t("Like new / remodeled", "Como nueva / remodelada"),
  };

  const pathIcon = recommended === 'cash'
    ? <Zap className="w-5 h-5 text-cc-gold" />
    : recommended === 'traditional'
    ? <TrendingUp className="w-5 h-5 text-cc-navy" />
    : <HelpCircle className="w-5 h-5 text-cc-gold" />;

  const pathLabel = recommended === 'cash'
    ? t("Certainty Path (Cash Offer)", "Camino de Certeza (Oferta en Efectivo)")
    : recommended === 'traditional'
    ? t("Maximize Value Path (Traditional)", "Camino de Maximizar Valor (Tradicional)")
    : t("Personalized Consultation", "Consulta Personalizada");

  const pathHint = recommended === 'cash'
    ? t(
        "Based on your answers, many sellers in your situation start with the certainty of a cash offer.",
        "Según sus respuestas, muchos vendedores en su situación comienzan con la certeza de una oferta en efectivo."
      )
    : recommended === 'traditional'
    ? t(
        "Based on your answers, many sellers in your situation start with a traditional listing to maximize value.",
        "Según sus respuestas, muchos vendedores en su situación comienzan con una venta tradicional para maximizar valor."
      )
    : t(
        "Your situation has unique factors — a calm conversation can help clarify the best path.",
        "Su situación tiene factores únicos — una conversación tranquila puede ayudar a clarificar el mejor camino."
      );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-cc-gold/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-7 h-7 text-cc-gold" />
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy">
          {t("Your Decision Receipt", "Su Recibo de Decisión")}
        </h2>
        <p className="text-cc-text-muted text-sm max-w-md mx-auto">
          {t(
            "Saved for you — return anytime to review your personalized comparison.",
            "Guardado para usted — regrese cuando quiera para revisar su comparación personalizada."
          )}
        </p>
      </div>

      {/* Your Inputs Snapshot */}
      <div className="bg-white rounded-2xl border border-cc-sand-dark/20 p-5 space-y-4">
        <h3 className="font-serif text-lg font-bold text-cc-navy flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cc-gold" />
          {t("Your Answers", "Sus Respuestas")}
        </h3>
        <div className="grid gap-3 text-sm">
          {rd.situation && (
            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-cc-text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-cc-navy">{t("Situation:", "Situación:")}</span>{" "}
                <span className="text-cc-charcoal">{situationLabel[rd.situation] || rd.situation}</span>
              </div>
            </div>
          )}
          {rd.timeline && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-cc-text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-cc-navy">{t("Timeline:", "Plazo:")}</span>{" "}
                <span className="text-cc-charcoal">{timelineLabel[rd.timeline] || rd.timeline}</span>
              </div>
            </div>
          )}
          {rd.goal_priority && (
            <div className="flex items-start gap-3">
              <Target className="w-4 h-4 text-cc-text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-cc-navy">{t("Priority:", "Prioridad:")}</span>{" "}
                <span className="text-cc-charcoal">{goalLabel[rd.goal_priority] || rd.goal_priority}</span>
              </div>
            </div>
          )}
          {conditionKey && (
            <div className="flex items-start gap-3">
              <Home className="w-4 h-4 text-cc-text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-cc-navy">{t("Condition:", "Condición:")}</span>{" "}
                <span className="text-cc-charcoal">{conditionLabel[conditionKey] || conditionKey}</span>
              </div>
            </div>
          )}
          {rd.property?.zip && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-cc-text-muted flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-cc-navy">{t("ZIP Code:", "Código Postal:")}</span>{" "}
                <span className="text-cc-charcoal">{rd.property.zip}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommended Path */}
      {recommended && (
        <div className="bg-cc-gold/5 border border-cc-gold/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            {pathIcon}
            <h3 className="font-serif text-lg font-bold text-cc-navy">
              {t("Starting Point", "Punto de Partida")}
            </h3>
          </div>
          <p className="text-sm font-semibold text-cc-navy">{pathLabel}</p>
          <p className="text-sm text-cc-charcoal">{pathHint}</p>
        </div>
      )}

      {/* Next Steps CTAs */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-bold text-cc-navy">
          {t("Your Next Steps", "Sus Próximos Pasos")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => {
              logEvent("cta_click", { cta: "receipt_talk_to_selena", source: "decision_receipt" });

              const timelineCanonical =
                rd.timeline === "soon" ? ("asap" as const) :
                rd.timeline === "considering" ? ("30_days" as const) :
                undefined;

              // Write-once intent guard
              setFieldIfEmpty('intent', 'sell');

              // Merge receipt fields into session context BEFORE opening chat
              const situationSafe = rd.situation ?? undefined;
              const conditionSafe = conditionKey ?? undefined;
              updateSessionContext({
                tool_used: 'seller_decision',
                seller_decision_step: 7,
                seller_decision_recommended_path: rd.recommended_path,
                seller_goal_priority: rd.goal_priority as any,
                ...(situationSafe ? { situation: situationSafe as any } : {}),
                ...(conditionSafe ? { property_condition_raw: conditionSafe as any } : {}),
                ...(timelineCanonical ? { timeline: timelineCanonical } : {}),
              });
              // P1.1: Persist snapshot after seller decision completion
              import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});

              openChat({ source: "seller_decision", intent: "sell" });
            }}
            className="flex items-center gap-3 bg-cc-navy text-white rounded-xl px-5 py-4 text-left hover:bg-cc-navy-dark transition-colors"
          >
            <MessageCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{t("Talk to Selena", "Hablar con Selena")}</p>
              <p className="text-xs opacity-80">{t("Get personalized guidance", "Obtenga orientación personalizada")}</p>
            </div>
          </button>

          <a
            href="/book"
            onClick={() => logEvent("cta_click", { cta: "receipt_book", source: "decision_receipt" })}
            className="flex items-center gap-3 bg-cc-gold text-cc-navy rounded-xl px-5 py-4 text-left hover:bg-cc-gold-dark transition-colors"
          >
            <Calendar className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{t("Book a Consultation", "Agendar una Consulta")}</p>
              <p className="text-xs opacity-80">{t("With Kasandra, no pressure", "Con Kasandra, sin presión")}</p>
            </div>
          </a>

          {recommended === 'cash' && (
            <a
              href="/v2/cash-offer-options"
              onClick={() => logEvent("cta_click", { cta: "receipt_cash_offer", source: "decision_receipt" })}
              className="flex items-center gap-3 border border-cc-sand-dark/30 rounded-xl px-5 py-4 text-left hover:bg-cc-sand/30 transition-colors"
            >
              <Zap className="w-5 h-5 text-cc-gold flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-cc-navy">{t("Explore Cash Offers", "Explorar Ofertas en Efectivo")}</p>
                <p className="text-xs text-cc-text-muted">{t("See your options", "Vea sus opciones")}</p>
              </div>
            </a>
          )}

          {recommended === 'traditional' && (
            <a
              href="/v2/sell"
              onClick={() => logEvent("cta_click", { cta: "receipt_traditional", source: "decision_receipt" })}
              className="flex items-center gap-3 border border-cc-sand-dark/30 rounded-xl px-5 py-4 text-left hover:bg-cc-sand/30 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-cc-navy flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-cc-navy">{t("Learn About Listings", "Aprenda Sobre Ventas")}</p>
                <p className="text-xs text-cc-text-muted">{t("Full market exposure", "Máxima exposición")}</p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Secondary actions */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-cc-sand-dark/10">
        <Button variant="ghost" onClick={onBackToComparison} className="text-cc-text-muted rounded-full text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back to comparison", "Volver a la comparación")}
        </Button>
        <Button variant="ghost" onClick={onRestart} className="text-cc-text-muted rounded-full text-sm">
          <RotateCcw className="w-4 h-4 mr-1" />
          {t("Update my answers", "Actualizar mis respuestas")}
        </Button>
      </div>
    </div>
  );
}
