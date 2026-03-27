/**
 * BookingIntakeForm — Native lead capture form (Step 1 of booking flow)
 * Replaces GHL iframe. Captures name, email, phone, intent, and optional message.
 * Uses React Hook Form + Zod validation.
 * Pre-populates from localStorage identity bridge.
 */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Shield } from "lucide-react";
import { getStoredUserName, getStoredEmail, getStoredPhone } from "@/lib/analytics/bridgeLeadIdToV2";
import { getSessionContext } from "@/lib/analytics/selenaSession";
import { Link } from "react-router-dom";

const bookingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().min(7, "Please enter a valid phone number").max(20),
  intent: z.enum(["buy", "sell", "cash", "explore"]),
  referralSource: z.string().optional(),
  message: z.string().trim().max(500).optional(),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingIntakeFormProps {
  onSubmit: (data: BookingFormData) => void;
  isSubmitting?: boolean;
  defaultIntent?: string;
}

const BookingIntakeForm = ({ onSubmit, isSubmitting, defaultIntent }: BookingIntakeFormProps) => {
  const { t } = useLanguage();
  const ctx = getSessionContext();

  // Derive initial intent from props > session > default
  const initialIntent = (["buy", "sell", "cash", "explore"].includes(defaultIntent || "")
    ? defaultIntent
    : ctx?.intent && ["buy", "sell", "cash", "explore"].includes(ctx.intent)
    ? ctx.intent
    : "explore") as "buy" | "sell" | "cash" | "explore";

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: getStoredUserName() || "",
      email: getStoredEmail() || "",
      phone: getStoredPhone() || "",
      intent: initialIntent,
      message: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-charcoal font-medium">
                {t("Full Name", "Nombre Completo")} *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Your name", "Tu nombre")}
                  className="border-cc-sand-dark/40 bg-white focus:border-cc-gold h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-charcoal font-medium">
                  {t("Email", "Correo Electrónico")} *
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="border-cc-sand-dark/40 bg-white focus:border-cc-gold h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-charcoal font-medium">
                  {t("Phone", "Teléfono")} *
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="(520) 000-0000"
                    className="border-cc-sand-dark/40 bg-white focus:border-cc-gold h-12"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="intent"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-charcoal font-medium">
                {t("What brings you here?", "¿Qué te trae por aquí?")}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-cc-sand-dark/40 bg-white h-12">
                    <SelectValue placeholder={t("Select one", "Seleccionar")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buy">{t("I'm looking to buy", "Quiero comprar")}</SelectItem>
                  <SelectItem value="sell">{t("I'm thinking about selling", "Estoy pensando en vender")}</SelectItem>
                  <SelectItem value="cash">{t("I want to explore cash offers", "Quiero explorar ofertas en efectivo")}</SelectItem>
                  <SelectItem value="explore">{t("Just exploring my options", "Solo explorando mis opciones")}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-charcoal font-medium">
                {t("Anything Kasandra should know? (optional)", "¿Algo que Kasandra deba saber? (opcional)")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t(
                    "Timeline, budget, specific questions...",
                    "Plazo, presupuesto, preguntas específicas..."
                  )}
                  rows={3}
                  className="border-cc-sand-dark/40 bg-white focus:border-cc-gold resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold text-base rounded-xl shadow-gold transition-all"
        >
          {isSubmitting
            ? t("Checking availability...", "Verificando disponibilidad...")
            : t("See Available Times", "Ver Horarios Disponibles")}
          {!isSubmitting && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        <div className="flex items-start gap-2 pt-1">
          <Shield className="w-4 h-4 text-cc-slate/60 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-cc-slate/70 leading-relaxed">
            {t(
              "Your information is only shared with Kasandra. By scheduling, you agree to our ",
              "Tu información solo se comparte con Kasandra. Al agendar, aceptas nuestra "
            )}
            <Link to="/privacy" className="underline hover:text-cc-navy transition-colors">
              {t("Privacy Policy", "Política de Privacidad")}
            </Link>
            {t(" and ", " y ")}
            <Link to="/terms" className="underline hover:text-cc-navy transition-colors">
              {t("Terms of Service", "Términos de Servicio")}
            </Link>.
          </p>
        </div>
      </form>
    </Form>
  );
};

export default BookingIntakeForm;
