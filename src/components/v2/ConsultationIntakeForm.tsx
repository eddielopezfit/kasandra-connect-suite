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
import { Loader2, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSessionPrePopulation, getFullSessionDossier } from "@/hooks/useSessionPrePopulation";
import { bridgeLeadIdToV2, setStoredUserName, setStoredEmail, setStoredPhone } from "@/lib/analytics/bridgeLeadIdToV2";
import GHLCalendarEmbed from "./GHLCalendarEmbed";

// Intents that require property address (form values, normalized on submit)
const SELLER_INTENTS = ["cash", "cash_offer", "seller", "buy_and_sell"];
const BUYER_INTENTS = ["buyer", "buy_and_sell"];

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
    // Conditional: Required for seller intents
    propertyAddress: z.string().optional(),
    // Conditional: Required for buyer intents
    preApproved: z.string().optional(),
    // Optional: For buyer flow nurturing
    targetNeighborhoods: z.string().optional(),
    priceRange: z.string().optional(),
    notes: z.string().optional(),
    consentCommunications: z.literal(true, {
      errorMap: () => ({ message: t("You must consent to receive communications", "Debe dar su consentimiento para recibir comunicaciones") }),
    }),
    consentAI: z.literal(true, {
      errorMap: () => ({ message: t("You must acknowledge the AI disclosure", "Debe reconocer la divulgación de IA") }),
    }),
  }).refine(
    (data) => {
      // Property address required for seller intents
      if (SELLER_INTENTS.includes(data.intent)) {
        return data.propertyAddress && data.propertyAddress.trim().length >= 5;
      }
      return true;
    },
    {
      message: t("Property address is required", "La dirección de la propiedad es requerida"),
      path: ["propertyAddress"],
    }
  ).refine(
    (data) => {
      // Pre-approved required for buyer intents
      if (BUYER_INTENTS.includes(data.intent)) {
        return data.preApproved && data.preApproved.length > 0;
      }
      return true;
    },
    {
      message: t("Please indicate your pre-approval status", "Por favor indique su estado de pre-aprobación"),
      path: ["preApproved"],
    }
  );

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


const ConsultationIntakeForm = ({ onSuccess }: ConsultationIntakeFormProps) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [submittedName, setSubmittedName] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  
  // SessionContext pre-population
  const prePopData = useSessionPrePopulation();

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

  // Pre-populate form from SessionContext on mount
  useEffect(() => {
    if (prePopData.hasPrePopulatedData) {
      if (prePopData.name) form.setValue('name', prePopData.name);
      if (prePopData.email) form.setValue('email', prePopData.email);
      if (prePopData.phone) form.setValue('phone', prePopData.phone);
      if (prePopData.preferredLanguage) form.setValue('preferredLanguage', prePopData.preferredLanguage);
      if (prePopData.intent) form.setValue('intent', prePopData.intent);
      if (prePopData.timeline) form.setValue('timeline', prePopData.timeline);
      if (prePopData.priceRange) form.setValue('priceRange', prePopData.priceRange);
      if (prePopData.preApproved) form.setValue('preApproved', prePopData.preApproved);
    }
  }, [prePopData, form]);

  // Intent options per requirements - matches GHL workflow lanes
  const intentOptions = [
    { value: "buyer", labelEn: "Buy a home", labelEs: "Comprar una casa" },
    { value: "seller", labelEn: "Sell a home", labelEs: "Vender una casa" },
    { value: "cash", labelEn: "Get a cash offer", labelEs: "Obtener una oferta en efectivo" },
    { value: "buy_and_sell", labelEn: "Buy & Sell (Trade Up/Down)", labelEs: "Comprar y Vender (Cambiar de casa)" },
    { value: "browsing", labelEn: "Just browsing", labelEs: "Solo explorando" },
  ];

  // Watch intent for conditional fields
  const watchedIntent = form.watch("intent");

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
      
      // Get full session dossier for GHL
      const sessionDossier = getFullSessionDossier();

      // Generate submission timestamp
      const submittedAt = new Date().toISOString();

      // Call edge function with full session context + consent + timestamp
      const { data: response, error } = await supabase.functions.invoke("submit-consultation-intake", {
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
          // Consent fields (required by Zod, always true when form is valid)
          consent_communications: data.consentCommunications === true,
          consent_ai: data.consentAI === true,
          // Submission timestamp for audit trail
          submitted_at: submittedAt,
          // Full Session Dossier for GHL
          ...sessionDossier,
        },
      });

      if (error) {
        throw new Error(error.message || "Submission failed");
      }

      if (!response?.ok) {
        throw new Error(response?.message || "Submission failed");
      }

      // Bridge lead_id to V2 ecosystem and store contact info
      if (response.lead_id) {
        bridgeLeadIdToV2(response.lead_id, 'consultation_intake');
        setStoredUserName(data.name);
        setStoredEmail(data.email);
        setStoredPhone(data.phone);
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

      // Store submitted data for calendar pre-fill
      setSubmittedName(data.name);
      setSubmittedEmail(data.email);
      setSubmittedPhone(data.phone);
      setIsSuccess(true);
      onSuccess?.(response.lead_id);

      // Dispatch Selena booking confirmation event
      window.dispatchEvent(new CustomEvent('selena-booking-confirmation', {
        detail: { 
          message: language === 'es' 
            ? `¡Excelente trabajo, ${data.name.split(' ')[0]}! He enviado tus datos a Kasandra. Por favor selecciona un horario en el calendario.`
            : `Great job, ${data.name.split(' ')[0]}! I've sent your details to Kasandra. Please pick a time that works for you on the calendar.`
        }
      }));

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

  // Success state with calendar embed - immediate calendar display
  if (isSuccess) {
    return (
      <div className="py-6 px-4 sm:py-8 sm:px-6">
        {/* Confirmation Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-cc-navy mb-2">
            {t("You're Almost There!", "¡Ya Casi Está!")}
          </h3>
          <p className="text-cc-charcoal text-base">
            {t(
              "Select a time below to complete your booking.",
              "Seleccione un horario abajo para completar su reservación."
            )}
          </p>
          <p className="text-sm text-cc-slate mt-1">
            {t(
              `Confirmation sent to ${submittedEmail}`,
              `Confirmación enviada a ${submittedEmail}`
            )}
          </p>
        </div>

        {/* Calendar Embed - Immediate with data pass-through */}
        <GHLCalendarEmbed 
          name={submittedName}
          email={submittedEmail}
          phone={submittedPhone}
        />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-4 sm:p-6">
        {/* Pre-population indicator */}
        {prePopData.hasPrePopulatedData && (
          <div className="flex items-center gap-2 bg-cc-gold/10 border border-cc-gold/30 rounded-lg p-3 mb-4">
            <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
            <p className="text-sm text-cc-charcoal">
              {t(
                "Some fields are pre-filled based on your earlier answers.",
                "Algunos campos están pre-llenados según sus respuestas anteriores."
              )}
            </p>
          </div>
        )}
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

        {/* Conditional: Property Address (Required for Seller Intents) */}
        {SELLER_INTENTS.includes(watchedIntent) && (
          <FormField
            control={form.control}
            name="propertyAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-navy font-medium text-base">
                  {t("Property Address", "Dirección de la Propiedad")} <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("123 Main St, Tucson, AZ 85701", "123 Calle Principal, Tucson, AZ 85701")}
                    className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Conditional: Target Neighborhoods (Optional for Buyer Intents) */}
        {BUYER_INTENTS.includes(watchedIntent) && (
          <FormField
            control={form.control}
            name="targetNeighborhoods"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-navy font-medium text-base">
                  {t("Target Neighborhoods/Areas", "Vecindarios/Áreas de Interés")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("e.g., Catalina Foothills, Oro Valley", "ej., Catalina Foothills, Oro Valley")}
                    className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

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

        {/* Pre-Approved (Required for Buyer Intents) */}
        {BUYER_INTENTS.includes(watchedIntent) && (
          <FormField
            control={form.control}
            name="preApproved"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-navy font-medium text-base">
                  {t("Are you pre-approved?", "¿Está pre-aprobado/a?")} <span className="text-red-500">*</span>
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
        )}

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
