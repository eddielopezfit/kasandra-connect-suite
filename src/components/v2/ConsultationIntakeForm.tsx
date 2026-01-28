import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Loader2, CheckCircle2, Calendar } from "lucide-react";
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
    consent: z.literal(true, {
      errorMap: () => ({ message: t("You must consent to receive communications", "Debe dar su consentimiento para recibir comunicaciones") }),
    }),
  });

type FormData = z.infer<ReturnType<typeof createFormSchema>>;

interface ConsultationIntakeFormProps {
  onSuccess?: (leadId: string) => void;
}

const ConsultationIntakeForm = ({ onSuccess }: ConsultationIntakeFormProps) => {
  const { t, language } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

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
      consent: undefined,
    },
  });

  // Intent options
  const intentOptions = [
    { value: "buyer", labelEn: "Buy a home", labelEs: "Comprar una casa" },
    { value: "seller", labelEn: "Sell a home", labelEs: "Vender una casa" },
    { value: "cash_offer", labelEn: "Explore a cash offer", labelEs: "Explorar una oferta en efectivo" },
    { value: "unknown", labelEn: "Not sure yet", labelEs: "Aún no estoy seguro/a" },
  ];

  // Timeline options
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

  // Success state
  if (isSuccess) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-cc-navy mb-4">
          {t("Thank You!", "¡Gracias!")}
        </h3>
        <p className="text-cc-charcoal mb-2">
          {t(
            "Your consultation request has been received.",
            "Su solicitud de consulta ha sido recibida."
          )}
        </p>
        <p className="text-sm text-cc-slate mb-8">
          {t(
            `A confirmation has been sent to ${submittedEmail}. Kasandra will personally reach out shortly.`,
            `Se ha enviado una confirmación a ${submittedEmail}. Kasandra se comunicará personalmente pronto.`
          )}
        </p>
        <Button
          onClick={() => window.open("https://api.leadconnectorhq.com/widget/booking/CY3PNu8yhtEuNMWH5e1x", "_blank")}
          className="bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {t("Schedule Your Consultation", "Agendar Su Consulta")}
        </Button>
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Full Name", "Nombre Completo")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Enter your full name", "Ingrese su nombre completo")}
                  className="border-cc-sand-dark/50 focus:border-cc-gold"
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Email", "Correo Electrónico")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("your@email.com", "su@correo.com")}
                  className="border-cc-sand-dark/50 focus:border-cc-gold"
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Phone Number", "Número de Teléfono")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="(520) 555-1234"
                  className="border-cc-sand-dark/50 focus:border-cc-gold"
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Preferred Language", "Idioma Preferido")} <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white">
                    <SelectValue placeholder={t("Select language", "Seleccione idioma")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              <FormLabel className="text-cc-navy font-medium">
                {t("I am looking to", "Estoy buscando")} <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white">
                    <SelectValue placeholder={t("Select an option", "Seleccione una opción")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {intentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Timeline", "Plazo")} <span className="text-red-500">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white">
                    <SelectValue placeholder={t("Select timeline", "Seleccione plazo")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {timelineOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Price Range", "Rango de Precio")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white">
                    <SelectValue placeholder={t("Select price range", "Seleccione rango de precio")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {priceRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Pre-Approved?", "¿Pre-Aprobado?")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white">
                    <SelectValue placeholder={t("Select option", "Seleccione opción")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white z-50">
                  {preApprovedOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              <FormLabel className="text-cc-navy font-medium">
                {t("Notes / What can I help with?", "Notas / ¿En qué puedo ayudarle?")} <span className="text-cc-slate text-sm">({t("Optional", "Opcional")})</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "Tell me a bit about your situation...",
                    "Cuénteme un poco sobre su situación..."
                  )}
                  className="border-cc-sand-dark/50 focus:border-cc-gold min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Consent Checkbox */}
        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-cc-sand-dark/30 p-4 bg-cc-sand/30">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-1"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm text-cc-charcoal font-normal cursor-pointer">
                  {t(
                    "I consent to receive communications from Kasandra Prieto and Corner Connect regarding my real estate inquiry, including automated text messages and emails. Message and data rates may apply.",
                    "Doy mi consentimiento para recibir comunicaciones de Kasandra Prieto y Corner Connect sobre mi consulta inmobiliaria, incluyendo mensajes de texto automatizados y correos electrónicos. Pueden aplicarse tarifas de mensajes y datos."
                  )} <span className="text-red-500">*</span>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* AI Disclosure (Informational - No Checkbox) */}
        <div className="rounded-lg border border-cc-slate/20 p-4 bg-cc-ivory/50">
          <p className="text-xs text-cc-slate leading-relaxed">
            {t(
              "I understand that Selena AI, an AI-powered assistant, may assist with initial communications and automated messages. All advice, recommendations, and decisions are reviewed and finalized by Kasandra Prieto, licensed REALTOR®.",
              "Entiendo que Selena AI, una asistente impulsada por IA, puede ayudar con comunicaciones iniciales y mensajes automatizados. Toda orientación, recomendación y decisión es revisada y finalizada por Kasandra Prieto, REALTOR® con licencia."
            )}
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold py-6 text-base"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("Submitting...", "Enviando...")}
            </>
          ) : (
            t("Submit Consultation Request", "Enviar Solicitud de Consulta")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ConsultationIntakeForm;
