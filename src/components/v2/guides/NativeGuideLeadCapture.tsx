/**
 * Native Guide Lead Capture Form
 * Replaces GHL iframe with native React Hook Form
 * Features: SessionContext pre-population, edge function submission
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CheckCircle2, Mail, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSessionPrePopulation, getFullSessionDossier } from "@/hooks/useSessionPrePopulation";
import { bridgeLeadIdToV2, setStoredUserName, setStoredEmail, setStoredPhone } from "@/lib/analytics/bridgeLeadIdToV2";
import { logEvent } from "@/lib/analytics/logEvent";

// Simplified schema for guide lead capture
const createFormSchema = (t: (en: string, es: string) => string) =>
  z.object({
    name: z.string().min(2, t("Name must be at least 2 characters", "El nombre debe tener al menos 2 caracteres")),
    email: z.string().email(t("Please enter a valid email", "Por favor ingrese un correo electrónico válido")),
    phone: z.string().min(7, t("Please enter a valid phone number", "Por favor ingrese un número de teléfono válido")),
    consent: z.literal(true, {
      errorMap: () => ({ message: t("You must consent to receive communications", "Debe dar su consentimiento para recibir comunicaciones") }),
    }),
  });

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface NativeGuideLeadCaptureProps {
  variant?: "inline" | "bottom";
  guideId?: string;
  guideTitle?: string;
  source?: string;
}

const NativeGuideLeadCapture = ({ 
  variant = "inline", 
  guideId,
  guideTitle,
  source = "guide_lead_capture" 
}: NativeGuideLeadCaptureProps) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // SessionContext pre-population
  const prePopData = useSessionPrePopulation();

  const formSchema = createFormSchema(t);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      consent: undefined,
    },
  });

  // Pre-populate form from SessionContext
  useEffect(() => {
    if (prePopData.hasPrePopulatedData) {
      if (prePopData.name) form.setValue('name', prePopData.name);
      if (prePopData.email) form.setValue('email', prePopData.email);
      if (prePopData.phone) form.setValue('phone', prePopData.phone);
    }
  }, [prePopData, form]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const sessionId = localStorage.getItem("selena_session_id") || crypto.randomUUID();
      const sessionDossier = getFullSessionDossier();

      // Infer intent from session context or default to guide-based
      const inferredIntent = prePopData.sessionContext?.intent || 'explore';

      const { data: response, error } = await supabase.functions.invoke("submit-consultation-intake", {
        body: {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          language,
          intent: inferredIntent,
          timeline: prePopData.sessionContext?.timeline || null,
          session_id: sessionId,
          source,
          guide_id: guideId,
          guide_title: guideTitle,
          ...sessionDossier,
        },
      });

      if (error) throw new Error(error.message || "Submission failed");
      if (!response?.success) throw new Error(response?.error || "Submission failed");

      // Bridge lead identity
      if (response.lead_id) {
        bridgeLeadIdToV2(response.lead_id, source);
        setStoredUserName(data.name);
        setStoredEmail(data.email);
        setStoredPhone(data.phone);
      }

      // Log event
      logEvent('native_form_submit', {
        source,
        guide_id: guideId,
        lead_id: response.lead_id,
      });

      setIsSuccess(true);

      toast({
        title: t("Success!", "¡Éxito!"),
        description: t("We've received your information. Kasandra will follow up soon.", "Recibimos su información. Kasandra se comunicará pronto."),
      });
    } catch (error) {
      console.error("Submission error:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      
      toast({
        title: t("Error", "Error"),
        description: t("Something went wrong. Please try again.", "Algo salió mal. Por favor intente de nuevo."),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <div className={`${variant === "inline" ? "bg-cc-sand border border-cc-sand-dark" : "bg-white/5 border border-white/10"} rounded-xl p-6`}>
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className={`font-serif text-xl font-bold mb-2 ${variant === "inline" ? "text-cc-navy" : "text-white"}`}>
            {t("Thank You", "Gracias")}
          </h3>
          <p className={`text-sm ${variant === "inline" ? "text-cc-charcoal" : "text-white/80"}`}>
            {t(
              "Kasandra will personally review your information and follow up with you soon.",
              "Kasandra revisará personalmente su información y se comunicará con usted pronto."
            )}
          </p>
        </div>
      </div>
    );
  }

  const isInline = variant === "inline";

  return (
    <div className={`${isInline ? "bg-cc-sand border border-cc-sand-dark" : "bg-white/5 border border-white/10"} rounded-xl p-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`p-2 rounded-full ${isInline ? "bg-cc-gold/10" : "bg-cc-gold/20"}`}>
          <Mail className={`w-5 h-5 ${isInline ? "text-cc-navy" : "text-cc-gold"}`} />
        </div>
        <div>
          <h3 className={`font-serif text-lg ${isInline ? "text-cc-navy" : "text-white"}`}>
            {t("Have questions about your situation?", "¿Tiene preguntas sobre su situación?")}
          </h3>
          <p className={`text-sm ${isInline ? "text-cc-charcoal/70" : "text-white/60"}`}>
            {t("Share your details and Kasandra will follow up personally.", "Comparta sus datos y Kasandra se comunicará personalmente.")}
          </p>
        </div>
      </div>

      {/* Pre-population indicator */}
      {prePopData.hasPrePopulatedData && (
        <div className="flex items-center gap-2 bg-cc-gold/10 border border-cc-gold/30 rounded-lg p-3 mb-4">
          <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
          <p className={`text-xs ${isInline ? "text-cc-charcoal" : "text-white/90"}`}>
            {t(
              "Pre-filled from your earlier answers",
              "Pre-llenado según tus respuestas anteriores"
            )}
          </p>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`text-sm font-medium ${isInline ? "text-cc-navy" : "text-white"}`}>
                  {t("Full Name", "Nombre Completo")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Enter your name", "Ingresa tu nombre")}
                    className={`h-11 ${isInline ? "bg-white border-cc-sand-dark/50" : "bg-white/10 border-white/20 text-white placeholder:text-white/50"}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`text-sm font-medium ${isInline ? "text-cc-navy" : "text-white"}`}>
                  {t("Email", "Correo Electrónico")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("your@email.com", "tu@correo.com")}
                    className={`h-11 ${isInline ? "bg-white border-cc-sand-dark/50" : "bg-white/10 border-white/20 text-white placeholder:text-white/50"}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={`text-sm font-medium ${isInline ? "text-cc-navy" : "text-white"}`}>
                  {t("Phone", "Teléfono")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(520) 555-1234"
                    className={`h-11 ${isInline ? "bg-white border-cc-sand-dark/50" : "bg-white/10 border-white/20 text-white placeholder:text-white/50"}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Consent */}
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="mt-0.5 h-4 w-4"
                  />
                </FormControl>
                <FormLabel className={`text-xs font-normal leading-relaxed ${isInline ? "text-cc-charcoal/80" : "text-white/70"}`}>
                  {t(
                    "I consent to receive communications from Kasandra Prieto regarding my real estate inquiry.",
                    "Doy mi consentimiento para recibir comunicaciones de Kasandra Prieto sobre mi consulta inmobiliaria."
                  )} <span className="text-red-500">*</span>
                </FormLabel>
              </FormItem>
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-12 font-semibold ${
              isInline 
                ? "bg-cc-gold hover:bg-cc-gold/90 text-cc-navy" 
                : "bg-cc-gold hover:bg-cc-gold/90 text-cc-navy"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("Sending...", "Enviando...")}
              </>
            ) : (
              t("Connect with Kasandra", "Conectar con Kasandra")
            )}
          </Button>

          {/* Privacy note */}
          <p className={`text-xs text-center ${isInline ? "text-cc-slate" : "text-white/50"}`}>
            {t(
              "We respect your privacy. No spam, ever.",
              "Respetamos tu privacidad. Sin spam, nunca."
            )}
          </p>
        </form>
      </Form>
    </div>
  );
};

export default NativeGuideLeadCapture;
