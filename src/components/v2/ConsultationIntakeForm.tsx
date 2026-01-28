import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, CheckCircle2, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Form schema with conditional validation messages
const createFormSchema = (t: (en: string, es: string) => string) =>
  z.object({
    name: z.string().min(2, t("Name must be at least 2 characters", "El nombre debe tener al menos 2 caracteres")),
    email: z.string().email(t("Please enter a valid email", "Por favor ingrese un correo electrónico válido")),
    phone: z.string().min(7, t("Please enter a valid phone number", "Por favor ingrese un número de teléfono válido")),
    preferredLanguage: z.enum(["en", "es"], {
      required_error: t("Please select a language", "Por favor seleccione un idioma"),
    }),
    intent: z.string().min(1, t("Please select an option", "Por favor seleccione una opción")),
    timeline: z.string().min(1, t("Please select a timeline", "Por favor seleccione un plazo")),
    priceRange: z.string().optional(),
    preApproved: z.string().optional(),
    notes: z.string().optional(),
    consentCommunications: z.literal(true, {
      errorMap: () => ({ message: t("You must consent to receive communications", "Debe dar su consentimiento para recibir comunicaciones") }),
    }),
    consentAI: z.literal(true, {
      errorMap: () => ({ message: t("You must acknowledge the AI disclosure", "Debe reconocer la divulgación de IA") }),
    }),
  });

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface ConsultationIntakeFormProps {
  onSuccess?: (leadId: string) => void;
}

// Collapsible consent text component for mobile
const ConsentText = ({ 
  text, 
  isRequired = true,
  t 
}: { 
  text: string; 
  isRequired?: boolean;
  t: (en: string, es: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const previewLength = 60; // Shorter preview for mobile
  const needsCollapse = text.length > previewLength;

  if (!needsCollapse) {
    return (
      <span className="text-sm text-cc-charcoal leading-relaxed">
        {text} {isRequired && <span className="text-red-500">*</span>}
      </span>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="text-sm text-cc-charcoal leading-relaxed">
        {!isOpen ? (
          <>
            <span>{text.slice(0, previewLength)}...</span>
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
            <CollapsibleTrigger asChild>
              <button 
                type="button"
                className="text-cc-gold hover:text-cc-gold/80 font-medium ml-1 inline-flex items-center whitespace-nowrap"
              >
                {t("Read more", "Leer más")}
                <ChevronDown className="w-3 h-3 ml-0.5 flex-shrink-0" />
              </button>
            </CollapsibleTrigger>
          </>
        ) : (
          <CollapsibleContent forceMount>
            <span>{text}</span>
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
            <CollapsibleTrigger asChild>
              <button 
                type="button"
                className="text-cc-gold hover:text-cc-gold/80 font-medium ml-1 inline-flex items-center whitespace-nowrap"
              >
                {t("Show less", "Mostrar menos")}
                <ChevronUp className="w-3 h-3 ml-0.5 flex-shrink-0" />
              </button>
            </CollapsibleTrigger>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
};

// GHL Calendar Widget Component
const GHLCalendarWidget = () => {
  useEffect(() => {
    // Load the GoHighLevel calendar embed script
    const existingScript = document.querySelector('script[src="https://link.msgsndr.com/js/form_embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://link.msgsndr.com/js/form_embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full mt-6">
      <iframe
        src="https://api.leadconnectorhq.com/widget/booking/CY3PNu8yhtEuNMWH5e1x"
        style={{ 
          width: "100%", 
          height: "700px",
          border: "none", 
          borderRadius: "8px",
        }}
        id="inline-CY3PNu8yhtEuNMWH5e1x"
        title="Schedule a Consultation"
      />
    </div>
  );
};

const ConsultationIntakeForm = ({ onSuccess }: ConsultationIntakeFormProps) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

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
      priceRange: "",
      preApproved: "",
      notes: "",
      consentCommunications: undefined,
      consentAI: undefined,
    },
  });

  // Intent options per requirements
  const intentOptions = [
    { value: "buyer", labelEn: "Buy a home", labelEs: "Comprar una casa" },
    { value: "seller", labelEn: "Sell a home", labelEs: "Vender una casa" },
    { value: "cash_offer", labelEn: "Explore a cash offer", labelEs: "Explorar una oferta en efectivo" },
    { value: "unknown", labelEn: "Not sure yet", labelEs: "Aún no estoy seguro/a" },
  ];

  // Timeline options per requirements
  const timelineOptions = [
    { value: "immediately", labelEn: "Immediately (0–30 days)", labelEs: "Inmediatamente (0–30 días)" },
    { value: "1_3_months", labelEn: "1–3 months", labelEs: "1–3 meses" },
    { value: "3_6_months", labelEn: "3–6 months", labelEs: "3–6 meses" },
    { value: "6_plus_months", labelEn: "6+ months", labelEs: "6+ meses" },
    { value: "researching", labelEn: "Just researching", labelEs: "Solo investigando" },
  ];

  // Price range options
  const priceRangeOptions = [
    { value: "under_250k", labelEn: "Under $250k", labelEs: "Menos de $250k" },
    { value: "250k_400k", labelEn: "$250k–$400k", labelEs: "$250k–$400k" },
    { value: "400k_600k", labelEn: "$400k–$600k", labelEs: "$400k–$600k" },
    { value: "600k_plus", labelEn: "$600k+", labelEs: "$600k+" },
  ];

  // Pre-approved options
  const preApprovedOptions = [
    { value: "yes", labelEn: "Yes", labelEs: "Sí" },
    { value: "not_yet", labelEn: "Not yet", labelEs: "Todavía no" },
  ];

  // Language options
  const languageOptions = [
    { value: "en", labelEn: "English", labelEs: "Inglés" },
    { value: "es", labelEn: "Español", labelEs: "Español" },
  ];

  // Consent text per requirements - using "Usted" formality
  const communicationsConsentText = t(
    "I consent to receive communications from Kasandra Prieto and Corner Connect regarding my real estate inquiry, including automated text messages and emails. Message and data rates may apply.",
    "Doy mi consentimiento para recibir comunicaciones de Kasandra Prieto y Corner Connect sobre mi consulta inmobiliaria, incluyendo mensajes de texto y correos electrónicos automatizados. Pueden aplicarse tarifas de mensajes y datos."
  );

  const aiConsentText = t(
    "I understand that Selena AI, an AI-powered assistant, may assist with initial communications and automated messages. All advice, recommendations, and decisions are reviewed and finalized by Kasandra Prieto, licensed REALTOR®.",
    "Entiendo que Selena AI, un asistente impulsado por inteligencia artificial, puede ayudar con comunicaciones iniciales y mensajes automatizados. Toda orientación, recomendaciones y decisiones son revisadas y finalizadas por Kasandra Prieto, REALTOR® con licencia."
  );

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Get session ID from localStorage
      const sessionId = localStorage.getItem("selena_session_id") || crypto.randomUUID();

      // Call edge function
      const { data: response, error } = await supabase.functions.invoke("submit-consultation-intake", {
        body: {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          language: data.preferredLanguage,
          intent: data.intent,
          timeline: data.timeline,
          price_range: data.priceRange || null,
          pre_approved: data.preApproved || null,
          notes: data.notes?.trim() || null,
          session_id: sessionId,
          source: "consultation_intake",
        },
      });

      if (error) {
        throw new Error(error.message || "Submission failed");
      }

      if (!response?.success) {
        throw new Error(response?.error || "Submission failed");
      }

      // Store lead_id in localStorage
      if (response.lead_id) {
        localStorage.setItem("selena_lead_id", response.lead_id);
      }

      // Log event
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

      setSubmittedEmail(data.email);
      setIsSuccess(true);
      onSuccess?.(response.lead_id);

      toast({
        title: t("Success!", "¡Éxito!"),
        description: t(
          "Your consultation request has been received.",
          "Su solicitud de consulta ha sido recibida."
        ),
      });
    } catch (error) {
      console.error("Submission error:", error);
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

  // Success state with calendar embed
  if (isSuccess) {
    return (
      <div className="py-6 px-4 sm:py-8 sm:px-6">
        {/* Confirmation */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-cc-navy mb-4">
            {t("Thank You!", "¡Gracias!")}
          </h3>
          <p className="text-cc-charcoal text-base sm:text-lg mb-2">
            {t(
              "Your consultation request has been received.",
              "Su solicitud de consulta ha sido recibida."
            )}
          </p>
          <p className="text-sm sm:text-base text-cc-slate mb-6">
            {t(
              `A confirmation has been sent to ${submittedEmail}. Kasandra will personally reach out shortly.`,
              `Se ha enviado una confirmación a ${submittedEmail}. Kasandra se comunicará personalmente pronto.`
            )}
          </p>
        </div>

        {/* Calendar section */}
        {!showCalendar ? (
          <div className="text-center">
            <p className="text-cc-charcoal mb-4">
              {t(
                "Want to schedule your consultation right now?",
                "¿Desea programar su consulta ahora mismo?"
              )}
            </p>
            <Button
              onClick={() => setShowCalendar(true)}
              className="bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold text-base py-6 px-8"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {t("Schedule Your Consultation", "Agendar Su Consulta")}
            </Button>
            <p className="text-xs text-cc-slate mt-4">
              {t(
                "Or wait for Kasandra to reach out to you directly.",
                "O espere a que Kasandra se comunique con usted directamente."
              )}
            </p>
          </div>
        ) : (
          <div>
            <h4 className="font-serif text-xl font-bold text-cc-navy text-center mb-4">
              {t("Select a Time", "Seleccione un Horario")}
            </h4>
            <GHLCalendarWidget />
          </div>
        )}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-4 sm:p-6">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Full Name", "Nombre Completo")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Enter your full name", "Ingrese su nombre completo")}
                  className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
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
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Email", "Correo Electrónico")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("your@email.com", "su@correo.com")}
                  className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
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
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Phone Number", "Número de Teléfono")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="(520) 555-1234"
                  className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preferred Language */}
        <FormField
          control={form.control}
          name="preferredLanguage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Preferred Language", "Idioma Preferido")} <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                    <SelectValue placeholder={t("Select language", "Seleccione idioma")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {language === "en" ? option.labelEn : option.labelEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* I am looking to */}
        <FormField
          control={form.control}
          name="intent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("I am looking to", "Estoy buscando")} <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                    <SelectValue placeholder={t("Select an option", "Seleccione una opción")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {intentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {language === "en" ? option.labelEn : option.labelEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Timeline */}
        <FormField
          control={form.control}
          name="timeline"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Timeline", "Plazo")} <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                    <SelectValue placeholder={t("Select timeline", "Seleccione plazo")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {timelineOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {language === "en" ? option.labelEn : option.labelEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Range (Optional) */}
        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Price Range", "Rango de Precio")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                    <SelectValue placeholder={t("Select price range", "Seleccione rango de precio")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {priceRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {language === "en" ? option.labelEn : option.labelEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pre-Approved (Optional) */}
        <FormField
          control={form.control}
          name="preApproved"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Pre-Approved?", "¿Pre-Aprobado?")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                    <SelectValue placeholder={t("Select option", "Seleccione opción")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {preApprovedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-base py-3">
                      {language === "en" ? option.labelEn : option.labelEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes (Optional) */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Notes / What can I help with?", "Notas / ¿En qué puedo ayudarle?")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "Tell me a bit about your situation...",
                    "Cuénteme un poco sobre su situación..."
                  )}
                  className="border-cc-sand-dark/50 focus:border-cc-gold min-h-[100px] text-base resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Communications Consent Checkbox - REQUIRED */}
        <FormField
          control={form.control}
          name="consentCommunications"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-cc-sand-dark/30 p-4 bg-cc-sand/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                />
              </FormControl>
              <div className="space-y-1 leading-none flex-1 min-w-0">
                <FormLabel className="font-normal cursor-pointer">
                  <ConsentText text={communicationsConsentText} isRequired={true} t={t} />
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* AI Disclosure Consent Checkbox - REQUIRED */}
        <FormField
          control={form.control}
          name="consentAI"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-cc-slate/20 p-4 bg-cc-ivory/50">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                />
              </FormControl>
              <div className="space-y-1 leading-none flex-1 min-w-0">
                <FormLabel className="font-normal cursor-pointer">
                  <ConsentText text={aiConsentText} isRequired={true} t={t} />
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button - Always visible, large touch target */}
        <div className="pt-4 pb-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold py-7 text-lg rounded-lg shadow-md"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t("Submitting...", "Enviando...")}
              </>
            ) : (
              t("Submit Consultation Request", "Enviar Solicitud de Consulta")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConsultationIntakeForm;
