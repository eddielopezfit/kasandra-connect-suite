/**
 * useConsultationForm
 *
 * Owns all state, validation, option arrays, and submit logic for the
 * ConsultationIntakeForm. Extracted from the monolithic component to keep
 * form rendering concerns and business logic in separate files.
 *
 * Returns everything the field layer and orchestrator need — no props drilling.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useSessionPrePopulation, getFullSessionDossier } from "@/hooks/useSessionPrePopulation";
import {
  bridgeLeadIdToV2,
  setStoredUserName,
  setStoredEmail,
  setStoredPhone,
} from "@/lib/analytics/bridgeLeadIdToV2";

// ─── Constants ────────────────────────────────────────────────────────────────

// Intents that require a property address / pre-approval answer
export const SELLER_INTENTS = ["cash", "cash_offer", "seller", "buy_and_sell"];
export const BUYER_INTENTS = ["buyer", "buy_and_sell"];

// ─── Schema ───────────────────────────────────────────────────────────────────

export const createFormSchema = (t: (en: string, es: string) => string) =>
  z
    .object({
      name: z
        .string()
        .min(2, t("Name must be at least 2 characters", "El nombre debe tener al menos 2 caracteres")),
      email: z.string().email(t("Please enter a valid email", "Por favor ingrese un correo electrónico válido")),
      phone: z
        .string()
        .min(7, t("Please enter a valid phone number", "Por favor ingrese un número de teléfono válido")),
      preferredLanguage: z.enum(["en", "es"], {
        required_error: t("Please select a language", "Por favor seleccione un idioma"),
      }),
      intent: z.string().min(1, t("Please select an option", "Por favor seleccione una opción")),
      timeline: z.string().min(1, t("Please select a timeline", "Por favor seleccione un plazo")),
      propertyAddress: z.string().optional(),
      preApproved: z.string().optional(),
      targetNeighborhoods: z.string().optional(),
      priceRange: z.string().optional(),
      notes: z.string().optional(),
      consentCommunications: z.literal(true, {
        errorMap: () => ({
          message: t(
            "You must consent to receive communications",
            "Debe dar su consentimiento para recibir comunicaciones"
          ),
        }),
      }),
      consentAI: z.literal(true, {
        errorMap: () => ({
          message: t(
            "You must acknowledge the AI disclosure",
            "Debe reconocer la divulgación de IA"
          ),
        }),
      }),
    })
    .refine(
      (data) => {
        if (SELLER_INTENTS.includes(data.intent)) {
          return data.propertyAddress && data.propertyAddress.trim().length >= 5;
        }
        return true;
      },
      {
        message: t("Property address is required", "La dirección de la propiedad es requerida"),
        path: ["propertyAddress"],
      }
    )
    .refine(
      (data) => {
        if (BUYER_INTENTS.includes(data.intent)) {
          return data.preApproved && data.preApproved.length > 0;
        }
        return true;
      },
      {
        message: t(
          "Please indicate your pre-approval status",
          "Por favor indique su estado de pre-aprobación"
        ),
        path: ["preApproved"],
      }
    );

export type FormData = z.infer<ReturnType<typeof createFormSchema>>;

// ─── Option arrays ────────────────────────────────────────────────────────────

export const INTENT_OPTIONS = [
  { value: "buyer", labelEn: "Buy a home", labelEs: "Comprar una casa" },
  { value: "seller", labelEn: "Sell a home", labelEs: "Vender una casa" },
  { value: "cash", labelEn: "Get a cash offer", labelEs: "Obtener una oferta en efectivo" },
  { value: "buy_and_sell", labelEn: "Buy & Sell (Trade Up/Down)", labelEs: "Comprar y Vender (Cambiar de casa)" },
  { value: "browsing", labelEn: "Just browsing", labelEs: "Solo explorando" },
];

export const TIMELINE_OPTIONS = [
  { value: "immediately", labelEn: "Immediately (0–30 days)", labelEs: "Inmediatamente (0–30 días)" },
  { value: "1_3_months", labelEn: "1–3 months", labelEs: "1–3 meses" },
  { value: "3_6_months", labelEn: "3–6 months", labelEs: "3–6 meses" },
  { value: "6_plus_months", labelEn: "6+ months", labelEs: "6+ meses" },
  { value: "researching", labelEn: "Just researching", labelEs: "Solo investigando" },
];

export const PRICE_RANGE_OPTIONS = [
  { value: "under_250k", labelEn: "Under $250k", labelEs: "Menos de $250k" },
  { value: "250k_400k", labelEn: "$250k–$400k", labelEs: "$250k–$400k" },
  { value: "400k_600k", labelEn: "$400k–$600k", labelEs: "$400k–$600k" },
  { value: "600k_plus", labelEn: "$600k+", labelEs: "$600k+" },
];

export const PRE_APPROVED_OPTIONS = [
  { value: "yes", labelEn: "Yes", labelEs: "Sí" },
  { value: "not_yet", labelEn: "Not yet", labelEs: "Todavía no" },
];

export const LANGUAGE_OPTIONS = [
  { value: "en", labelEn: "English", labelEs: "Inglés" },
  { value: "es", labelEn: "Español", labelEs: "Español" },
];

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseConsultationFormOptions {
  onSuccess?: (leadId: string) => void;
}

export function useConsultationForm({ onSuccess }: UseConsultationFormOptions = {}) {
  const { t, language } = useLanguage();

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedNameState] = useState("");
  const [submittedEmail, setSubmittedEmailState] = useState("");
  const [submittedPhone, setSubmittedPhoneState] = useState("");

  // Session pre-population
  const prePopData = useSessionPrePopulation();

  // Consent text — lives here so it's i18n-aware and colocated with schema
  const communicationsConsentText = t(
    "I consent to receive communications from Kasandra Prieto and Corner Connect regarding my real estate inquiry, including automated text messages and emails. Message and data rates may apply.",
    "Doy mi consentimiento para recibir comunicaciones de Kasandra Prieto y Corner Connect sobre mi consulta inmobiliaria, incluyendo mensajes de texto y correos electrónicos automatizados. Pueden aplicarse tarifas de mensajes y datos."
  );

  const aiConsentText = t(
    "I understand that Selena AI, an AI-powered assistant, may assist with initial communications and automated messages. All advice, recommendations, and decisions are reviewed and finalized by Kasandra Prieto, licensed REALTOR®.",
    "Entiendo que Selena AI, un asistente impulsado por inteligencia artificial, puede ayudar con comunicaciones iniciales y mensajes automatizados. Toda orientación, recomendaciones y decisiones son revisadas y finalizadas por Kasandra Prieto, REALTOR® con licencia."
  );

  // Form setup
  const formSchema = createFormSchema(t);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      preferredLanguage: language as "en" | "es",
      intent: "",
      timeline: "",
      propertyAddress: "",
      targetNeighborhoods: "",
      priceRange: "",
      preApproved: "",
      notes: "",
      consentCommunications: undefined,
      consentAI: undefined,
    },
  });

  // Pre-populate from SessionContext on mount
  useEffect(() => {
    if (prePopData.hasPrePopulatedData) {
      if (prePopData.name) form.setValue("name", prePopData.name);
      if (prePopData.email) form.setValue("email", prePopData.email);
      if (prePopData.phone) form.setValue("phone", prePopData.phone);
      if (prePopData.preferredLanguage) form.setValue("preferredLanguage", prePopData.preferredLanguage);
      if (prePopData.intent) form.setValue("intent", prePopData.intent);
      if (prePopData.timeline) form.setValue("timeline", prePopData.timeline);
      if (prePopData.priceRange) form.setValue("priceRange", prePopData.priceRange);
      if (prePopData.preApproved) form.setValue("preApproved", prePopData.preApproved);
    }
  }, [prePopData, form]);

  // Derived intent watchers
  const watchedIntent = form.watch("intent");
  const isSeller = SELLER_INTENTS.includes(watchedIntent);
  const isBuyer = BUYER_INTENTS.includes(watchedIntent);

  // Submit handler
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const sessionId = localStorage.getItem("selena_session_id") || crypto.randomUUID();
      const sessionDossier = getFullSessionDossier();
      const submittedAt = new Date().toISOString();

      const { data: response, error } = await supabase.functions.invoke(
        "submit-consultation-intake",
        {
          body: {
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            phone: data.phone.trim(),
            language: data.preferredLanguage,
            intent: data.intent,
            timeline: data.timeline,
            property_address: data.propertyAddress?.trim() || null,
            target_neighborhoods: data.targetNeighborhoods?.trim() || null,
            price_range: data.priceRange || null,
            pre_approved: data.preApproved || null,
            notes: data.notes?.trim() || null,
            session_id: sessionId,
            source: "lovable_native_form",
            page_path: window.location.pathname,
            consent_communications: data.consentCommunications === true,
            consent_ai: data.consentAI === true,
            submitted_at: submittedAt,
            ...sessionDossier,
          },
        }
      );

      if (error) throw new Error(error.message || "Submission failed");
      if (!response?.ok) throw new Error(response?.message || "Submission failed");

      if (response.lead_id) {
        bridgeLeadIdToV2(response.lead_id, "consultation_intake");
        setStoredUserName(data.name);
        setStoredEmail(data.email);
        setStoredPhone(data.phone);
      }

      await supabase.functions.invoke("selena-log-event", {
        body: {
          sessionId,
          eventType: "consultation_intake_submitted",
          payload: {
            lead_id: response.lead_id,
            intent: data.intent,
            timeline: data.timeline,
            language: data.preferredLanguage,
            ghl_synced: response.ghl_synced,
          },
        },
      });

      setSubmittedNameState(data.name);
      setSubmittedEmailState(data.email);
      setSubmittedPhoneState(data.phone);
      setIsSuccess(true);
      onSuccess?.(response.lead_id);

      window.dispatchEvent(
        new CustomEvent("selena-booking-confirmation", {
          detail: {
            message:
              language === "es"
                ? `¡Excelente trabajo, ${data.name.split(" ")[0]}! He enviado tus datos a Kasandra. Por favor selecciona un horario en el calendario.`
                : `Great job, ${data.name.split(" ")[0]}! I've sent your details to Kasandra. Please pick a time that works for you on the calendar.`,
          },
        })
      );

      toast({
        title: t("Success!", "¡Éxito!"),
        description: t(
          "Your consultation request has been received.",
          "Su solicitud de consulta ha sido recibida."
        ),
      });
    } catch (err) {
      if (import.meta.env.DEV) console.error("Submission error:", err);
      toast({
        title: t("Error", "Error"),
        description: t(
          "Something went wrong. Please try again.",
          "Algo salió mal. Por favor intente de nuevo."
        ),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    // Form instance
    form,
    // State
    isSubmitting,
    isSuccess,
    submittedName,
    submittedEmail,
    submittedPhone,
    // Derived
    watchedIntent,
    isSeller,
    isBuyer,
    // Pre-pop indicator
    hasPrePopulatedData: prePopData.hasPrePopulatedData,
    // Consent strings
    communicationsConsentText,
    aiConsentText,
    // Submit
    onSubmit,
  };
}
