import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail, User, Phone, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateSessionId } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import { getStoredUserName, getStoredEmail, getStoredPhone } from "@/lib/analytics/bridgeLeadIdToV2";
import type { RecommendedPath } from "./StepDualPath";
import type { ConditionTier } from "./conditionInsights";
import type { Situation, Timeline, GoalPriority } from "./StepSituation";
import type { PropertySnapshotData } from "./StepPropertySnapshot";
import { toast } from "sonner";

// ============= Schemas =============

const fullSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  consent: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

const emailOnlySchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  consent: z.literal(true, { errorMap: () => ({ message: "Required" }) }),
});

type FullFormData = z.infer<typeof fullSchema>;
type EmailOnlyFormData = z.infer<typeof emailOnlySchema>;

// ============= Types =============

export interface ContactResult {
  leadId: string;
  email: string;
  name?: string;
  variant: "full" | "email_only";
}

interface StepContactProps {
  receiptId: string | null;
  recommendedPath: RecommendedPath;
  situation?: Situation;
  timeline?: Timeline;
  goalPriority?: GoalPriority;
  property?: PropertySnapshotData;
  condition?: ConditionTier;
  onNext: (result: ContactResult) => void;
  onBack: () => void;
}

const StepContact = ({
  receiptId,
  recommendedPath,
  situation,
  timeline,
  goalPriority,
  property,
  condition,
  onNext,
  onBack,
}: StepContactProps) => {
  const { t, language } = useLanguage();
  const [variant, setVariant] = useState<"full" | "email_only">("full");
  const [submitting, setSubmitting] = useState(false);

  // Full form
  const fullForm = useForm<FullFormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: { name: "", email: "", phone: "", consent: false as unknown as boolean },
  });

  // Email-only form
  const emailForm = useForm<EmailOnlyFormData>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "", consent: false as unknown as boolean },
  });

  // Pre-populate from session
  useEffect(() => {
    const storedName = getStoredUserName();
    const storedEmail = getStoredEmail();
    const storedPhone = getStoredPhone();

    if (storedName) fullForm.setValue("name", storedName);
    if (storedEmail) {
      fullForm.setValue("email", storedEmail);
      emailForm.setValue("email", storedEmail);
    }
    if (storedPhone) fullForm.setValue("phone", storedPhone);
  }, []);

  const submitLead = async (data: { name?: string; email: string; phone?: string }) => {
    setSubmitting(true);

    try {
      const sessionId = getOrCreateSessionId();

      // 1. Submit to seller edge function (enriched payload for GHL segmentation)
      const { data: result, error } = await supabase.functions.invoke("submit-seller", {
        body: {
          source: "seller_decision",
          sessionId,
          language,
          name: data.name || "Decision Path Lead",
          email: data.email,
          situation: situation || null,
          condition: condition || null,
          timeline: timeline || null,
          // Enrichment fields for GHL nurture segmentation
          goal_priority: goalPriority || null,
          recommended_path: recommendedPath,
          property_condition_raw: condition || null,
          zip: property?.zip || null,
          receipt_id: receiptId || null,
        },
      });

      if (error) throw error;
      if (!result?.ok) throw new Error(result?.error || "Submission failed");

      const leadId = result.lead_id;

      // 2. Attach receipt to lead (if receiptId exists)
      if (receiptId) {
        try {
          await supabase.functions.invoke("save-decision-receipt", {
            body: {
              session_id: sessionId,
              receipt_id: receiptId,
              lead_id: leadId,
            },
          });
        } catch (attachErr) {
          console.warn("[StepContact] Receipt attach failed (non-blocking):", attachErr);
        }
      }

      // 3. Log
      logEvent("seller_decision_contact_submitted", {
        lead_id: leadId,
        cta_variant: variant,
        receipt_id: receiptId || null,
        recommended_path: recommendedPath,
        is_new: result.is_new,
      });

      logEvent("seller_decision_step_completed", {
        step: 6,
        lead_id: leadId,
        cta_variant: variant,
      });

      onNext({
        leadId,
        email: data.email,
        name: data.name,
        variant,
      });
    } catch (err: unknown) {
      console.error("[StepContact] Submit error:", err);
      toast.error(
        t("Something went wrong. Please try again.", "Algo salió mal. Intente de nuevo.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onFullSubmit = (data: FullFormData) => {
    submitLead({ name: data.name, email: data.email, phone: data.phone || undefined });
  };

  const onEmailSubmit = (data: EmailOnlyFormData) => {
    submitLead({ email: data.email });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-cc-navy mb-2">
          {t("Save Your Decision Receipt", "Guarde Su Recibo de Decisión")}
        </h2>
        <p className="text-cc-text-muted text-sm">
          {t(
            "We'll send you a copy of your personalized comparison so you can review it anytime.",
            "Le enviaremos una copia de su comparación personalizada para que pueda revisarla en cualquier momento."
          )}
        </p>
      </div>

      {/* Trust signal */}
      <div className="flex items-start gap-3 bg-cc-sand/30 rounded-xl p-4 border border-cc-sand-dark/20">
        <Shield className="w-5 h-5 text-cc-navy flex-shrink-0 mt-0.5" />
        <p className="text-xs text-cc-text-muted">
          {t(
            "Your information is private. We never share or sell your data. This is only used to save your receipt and connect you with Kasandra if you choose.",
            "Su información es privada. Nunca compartimos ni vendemos sus datos. Esto solo se usa para guardar su recibo y conectarlo con Kasandra si usted lo elige."
          )}
        </p>
      </div>

      {/* Variant toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setVariant("full")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            variant === "full"
              ? "bg-cc-navy text-white"
              : "bg-cc-sand/50 text-cc-text-muted hover:bg-cc-sand"
          }`}
        >
          {t("Full Details", "Detalles Completos")}
        </button>
        <button
          type="button"
          onClick={() => setVariant("email_only")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            variant === "email_only"
              ? "bg-cc-navy text-white"
              : "bg-cc-sand/50 text-cc-text-muted hover:bg-cc-sand"
          }`}
        >
          {t("Just Email", "Solo Email")}
        </button>
      </div>

      {/* Full form */}
      {variant === "full" && (
        <form onSubmit={fullForm.handleSubmit(onFullSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-cc-navy font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {t("Name", "Nombre")}
            </Label>
            <Input
              id="name"
              {...fullForm.register("name")}
              placeholder={t("Your name", "Su nombre")}
              className="border-cc-sand-dark/40 focus-visible:ring-cc-gold"
            />
            {fullForm.formState.errors.name && (
              <p className="text-xs text-red-500">{fullForm.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-cc-navy font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {t("Email", "Correo electrónico")}
            </Label>
            <Input
              id="email"
              type="email"
              {...fullForm.register("email")}
              placeholder={t("you@example.com", "usted@ejemplo.com")}
              className="border-cc-sand-dark/40 focus-visible:ring-cc-gold"
            />
            {fullForm.formState.errors.email && (
              <p className="text-xs text-red-500">{fullForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-cc-navy font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              {t("Phone (optional)", "Teléfono (opcional)")}
            </Label>
            <Input
              id="phone"
              type="tel"
              {...fullForm.register("phone")}
              placeholder={t("(520) 555-0123", "(520) 555-0123")}
              className="border-cc-sand-dark/40 focus-visible:ring-cc-gold"
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent-full"
              checked={fullForm.watch("consent") === true}
              onCheckedChange={(checked) => fullForm.setValue("consent", checked === true ? true : undefined as unknown as boolean, { shouldValidate: true })}
              className="mt-0.5"
            />
            <Label htmlFor="consent-full" className="text-xs text-cc-text-muted leading-relaxed cursor-pointer">
              {t(
                "I agree to receive my Decision Receipt and potential follow-up from Kasandra's team. I can unsubscribe anytime.",
                "Acepto recibir mi Recibo de Decisión y posible seguimiento del equipo de Kasandra. Puedo cancelar en cualquier momento."
              )}
            </Label>
          </div>
          {fullForm.formState.errors.consent && (
            <p className="text-xs text-red-500">{t("Please agree to continue.", "Por favor acepte para continuar.")}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-6 shadow-gold"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Saving…", "Guardando…")}
              </span>
            ) : (
              t("Save & Send My Receipt", "Guardar y Enviar Mi Recibo")
            )}
          </Button>
        </form>
      )}

      {/* Email-only form */}
      {variant === "email_only" && (
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email-only" className="text-cc-navy font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {t("Email", "Correo electrónico")}
            </Label>
            <Input
              id="email-only"
              type="email"
              {...emailForm.register("email")}
              placeholder={t("you@example.com", "usted@ejemplo.com")}
              className="border-cc-sand-dark/40 focus-visible:ring-cc-gold"
            />
            {emailForm.formState.errors.email && (
              <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="consent-email"
              checked={emailForm.watch("consent") === true}
              onCheckedChange={(checked) => emailForm.setValue("consent", checked === true ? true : undefined as unknown as boolean, { shouldValidate: true })}
              className="mt-0.5"
            />
            <Label htmlFor="consent-email" className="text-xs text-cc-text-muted leading-relaxed cursor-pointer">
              {t(
                "I agree to receive my Decision Receipt via email.",
                "Acepto recibir mi Recibo de Decisión por correo electrónico."
              )}
            </Label>
          </div>
          {emailForm.formState.errors.consent && (
            <p className="text-xs text-red-500">{t("Please agree to continue.", "Por favor acepte para continuar.")}</p>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full py-6 shadow-gold"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("Saving…", "Guardando…")}
              </span>
            ) : (
              t("Send My Receipt", "Enviar Mi Recibo")
            )}
          </Button>
        </form>
      )}

      {/* Back */}
      <div>
        <Button variant="ghost" type="button" onClick={onBack} className="text-cc-text-muted rounded-full">
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t("Back", "Atrás")}
        </Button>
      </div>
    </div>
  );
};

export default StepContact;
