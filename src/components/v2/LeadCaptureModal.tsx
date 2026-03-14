/**
 * LeadCaptureModal - Identity Gateway for Selena-native
 * Captures email (required), name (optional), phone (optional)
 * and binds user to lead_profiles
 */

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { getSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import { bridgeLeadIdToV2 } from "@/lib/analytics/bridgeLeadIdToV2";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Mail, User, Phone, Sparkles } from "lucide-react";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leadId: string) => void;
  source?: string;
  title?: {
    en: string;
    es: string;
  };
  subtitle?: {
    en: string;
    es: string;
  };
}

const LeadCaptureModal = ({
  isOpen,
  onClose,
  onSuccess,
  source = "lead_capture_modal",
  title,
  subtitle,
}: LeadCaptureModalProps) => {
  const [step, setStep] = useState<"email" | "details">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);

  const { t, language } = useLanguage();
  const { setLeadIdentity } = useSelenaChat();
  const isMobile = useIsMobile();

  const defaultTitle = {
    en: "Let's personalize your experience",
    es: "Personalicemos tu experiencia",
  };

  const defaultSubtitle = {
    en: "So I can save your progress and provide tailored guidance, what's the best email to reach you?",
    es: "Para poder guardar tu progreso y brindarte orientación personalizada, ¿cuál es el mejor correo para contactarte?",
  };

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError(t("Please enter your email", "Por favor ingresa tu correo"));
      return;
    }

    if (!validateEmail(email)) {
      setError(t("Please enter a valid email", "Por favor ingresa un correo válido"));
      return;
    }

    setIsLoading(true);

    try {
      const context = getSessionContext();

      const { data, error: fnError } = await supabase.functions.invoke("upsert-lead-profile", {
        body: {
          email: email.trim().toLowerCase(),
          name: name.trim() || null,
          phone: phone.trim() || null,
          language,
          session_id: context?.session_id,
          source,
          page_path: window.location.pathname,
          utm_source: context?.utm_source,
          utm_campaign: context?.utm_campaign,
          intent: context?.intent || null,
          // Phase E: scoring context from SessionContext
          tool_used: context?.tool_used || null,
          readiness_score: context?.readiness_score || null,
          quiz_completed: context?.quiz_completed || false,
          has_viewed_report: context?.has_viewed_report || false,
          timeline: context?.timeline || null,
          consent_communications: consentChecked,
          consent_timestamp: consentChecked ? new Date().toISOString() : null,
        },
      });

      if (fnError) {
        console.error("[LeadCapture] Function error:", fnError);
        setError(t("Something went wrong. Please try again.", "Algo salió mal. Por favor intenta de nuevo."));
        setIsLoading(false);
        return;
      }

      // Edge function returns { ok: true, lead_id, is_new, ghl_synced }
      if (!data?.ok) {
        setError(data?.message || t("Failed to save your info", "No se pudo guardar tu información"));
        setIsLoading(false);
        return;
      }

      // Store lead identity
      const leadId = data.lead_id;
      setLeadIdentity(leadId);
      
      // Bridge lead ID to V2 ecosystem (full dossier sync)
      bridgeLeadIdToV2(leadId, source);

      // Log event
      logEvent("form_submit", {
        form_type: source,
        lead_id: leadId,
        is_new: data.is_new,
      });

      // Fire-and-forget handoff to GHL via notify-handoff edge function
      const handoffContext = getSessionContext();
      const nameParts = name.trim().split(' ');
      supabase.functions.invoke('notify-handoff', {
        body: {
          contact: {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            phone: phone.trim() || '',
            email: email.trim().toLowerCase(),
          },
          context: {
            selena_lead_id: leadId,
            session_id: handoffContext?.session_id ?? '',
            intent: handoffContext?.intent ?? '',
            language,
            journey_state: handoffContext?.journey_state ?? 'explore',
            chip_phase_floor: handoffContext?.chip_phase_floor ?? 0,
            guides_consumed: handoffContext?.guides_completed ?? [],
            tools_completed: handoffContext?.tools_completed ?? [],
            readiness_score: handoffContext?.readiness_score ?? 0,
            inherited_home: handoffContext?.inherited_home ?? false,
            trust_signal_detected: handoffContext?.trust_signal_detected ?? false,
            timeline: handoffContext?.timeline ?? '',
            estimated_value: handoffContext?.estimated_value ?? '',
            property_condition: handoffContext?.property_condition_raw ?? '',
            situation: handoffContext?.situation ?? '',
            entry_source: handoffContext?.entry_source ?? source,
            page_path: window.location.pathname,
            utm_source: handoffContext?.utm_source ?? '',
            utm_campaign: handoffContext?.utm_campaign ?? '',
            quiz_completed: handoffContext?.quiz_completed ?? false,
            quiz_result_path: handoffContext?.quiz_result_path ?? '',
            primary_priority: handoffContext?.primary_priority ?? '',
            sms_consent: consentChecked,
            ai_disclosure_accepted: consentChecked,
            consent_timestamp: consentChecked ? new Date().toISOString() : null,
          },
        },
      }).then(({ error: handoffErr }) => {
        if (handoffErr) console.error('[LeadCapture] Handoff failed:', handoffErr);
        else console.log('[LeadCapture] Handoff successful');
      });

      // Success callback
      onSuccess?.(leadId);
      
      // Reset and close
      setEmail("");
      setName("");
      setPhone("");
      setConsentChecked(false);
      setStep("email");
      onClose();

    } catch (err) {
      console.error("[LeadCapture] Error:", err);
      setError(t("Something went wrong. Please try again.", "Algo salió mal. Por favor intenta de nuevo."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailContinue = () => {
    if (!email.trim()) {
      setError(t("Please enter your email", "Por favor ingresa tu correo"));
      return;
    }
    if (!validateEmail(email)) {
      setError(t("Please enter a valid email", "Por favor ingresa un correo válido"));
      return;
    }
    setError("");
    setStep("details");
  };

  const formContent = (
    <div className="space-y-6">
      {/* Header icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cc-gold/20 to-cc-gold/10 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-cc-gold" />
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-center text-cc-charcoal/70 text-sm leading-relaxed max-w-sm mx-auto">
        {language === "es" ? displaySubtitle.es : displaySubtitle.en}
      </p>

      {step === "email" ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-cc-charcoal font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-cc-gold" />
              {t("Email", "Correo electrónico")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("you@example.com", "tu@ejemplo.com")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmailContinue()}
              className="border-cc-sand-dark focus:border-cc-gold focus:ring-cc-gold/20 bg-white"
              autoComplete="email"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            onClick={handleEmailContinue}
            className="w-full bg-cc-navy hover:bg-cc-navy-dark text-white font-medium py-3"
          >
            {t("Continue", "Continuar")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label className="text-cc-charcoal font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-cc-gold" />
              {t("Email", "Correo electrónico")}
            </Label>
            <div className="px-3 py-2 bg-cc-sand rounded-md text-cc-charcoal/70 text-sm">
              {email}
            </div>
          </div>

          {/* Name (optional) */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-cc-charcoal font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-cc-gold" />
              {t("Name", "Nombre")}
              <span className="text-cc-slate text-xs font-normal">
                ({t("optional", "opcional")})
              </span>
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t("Your name", "Tu nombre")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-cc-sand-dark focus:border-cc-gold focus:ring-cc-gold/20 bg-white"
              autoComplete="name"
              autoFocus
            />
          </div>

          {/* Phone (optional) */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-cc-charcoal font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-cc-gold" />
              {t("Phone", "Teléfono")}
              <span className="text-cc-slate text-xs font-normal">
                ({t("optional", "opcional")})
              </span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("(520) 555-0123", "(520) 555-0123")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-cc-sand-dark focus:border-cc-gold focus:ring-cc-gold/20 bg-white"
              autoComplete="tel"
            />
          </div>

          {/* TCPA Consent */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consentChecked}
              onCheckedChange={(checked) => setConsentChecked(checked === true)}
              className="mt-0.5"
            />
            <label htmlFor="consent" className="text-[12px] leading-[1.4] text-cc-slate cursor-pointer select-none">
              {t(
                "By submitting, I agree to receive communications from Kasandra Prieto / Corner Connect Realty including SMS text messages. Message and data rates may apply. I understand I am communicating with an AI assistant. Reply STOP to opt out.",
                "Al enviar, acepto recibir comunicaciones de Kasandra Prieto / Corner Connect Realty, incluidos mensajes de texto SMS. Se pueden aplicar tarifas de mensajes y datos. Entiendo que me comunico con un asistente de IA. Responde STOP para cancelar."
              )}
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep("email")}
              className="flex-1 border-cc-sand-dark text-cc-charcoal hover:bg-cc-sand"
            >
              {t("Back", "Atrás")}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-medium"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("Save & Continue", "Guardar y Continuar")
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <p className="text-center text-xs text-cc-slate">
        {t(
          "Your info is private. No spam, ever.",
          "Tu información es privada. Sin spam, nunca."
        )}
      </p>
    </div>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="bg-white border-t border-cc-sand-dark">
          <DrawerHeader className="text-center pb-0">
            <DrawerTitle className="font-serif text-xl text-cc-navy">
              {language === "es" ? displayTitle.es : displayTitle.en}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 pb-8 pt-2">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-cc-sand-dark max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-serif text-xl text-cc-navy">
            {language === "es" ? displayTitle.es : displayTitle.en}
          </DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
