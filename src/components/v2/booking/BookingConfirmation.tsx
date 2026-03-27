/**
 * BookingConfirmation — Inline confirmation after slot selection + handoff creation.
 * Shows appointment details and next steps.
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Phone, BookOpen, MessageCircle } from "lucide-react";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { Link } from "react-router-dom";

interface BookingConfirmationProps {
  slotDisplay: string;
  userName: string;
  intent?: string;
}

const BookingConfirmation = ({ slotDisplay, userName, intent }: BookingConfirmationProps) => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  const guides = intent === "sell" || intent === "cash"
    ? [
        { href: "/guides/selling-for-top-dollar", en: "Selling for Top Dollar", es: "Vender al Mejor Precio" },
        { href: "/guides/cost-to-sell-tucson", en: "Cost to Sell in Tucson", es: "Costo de Vender en Tucson" },
      ]
    : [
        { href: "/guides/first-time-buyer-guide", en: "First-Time Buyer Guide", es: "Guía para Compradores" },
        { href: "/guides/down-payment-assistance-tucson", en: "Down Payment Assistance", es: "Asistencia de Pago Inicial" },
      ];

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
          <CalendarCheck className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-cc-navy mb-2">
          {t(
            `${userName}, you're all set`,
            `${userName}, todo listo`
          )}
        </h3>
        <p className="text-cc-slate text-sm max-w-md mx-auto">
          {t(
            "Kasandra will personally review your profile before your conversation.",
            "Kasandra revisará personalmente su perfil antes de su conversación."
          )}
        </p>
      </div>

      {/* Appointment card */}
      <div className="bg-cc-sand rounded-xl border border-cc-sand-dark/20 p-5">
        <div className="flex items-start gap-3">
          <Phone className="w-5 h-5 text-cc-gold mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-cc-navy text-sm">{t("Your Conversation", "Su Conversación")}</p>
            <p className="text-cc-charcoal text-sm mt-1">{slotDisplay}</p>
            <p className="text-cc-slate text-xs mt-1">
              {t("30 minutes · Arizona time (MST)", "30 minutos · Hora de Arizona (MST)")}
            </p>
          </div>
        </div>
      </div>

      {/* Prepare section */}
      <div>
        <p className="text-sm font-medium text-cc-navy mb-3">
          {t("Prepare for your conversation:", "Prepárese para su conversación:")}
        </p>
        <div className="space-y-2">
          {guides.map((g) => (
            <Link
              key={g.href}
              to={g.href}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-cc-sand-dark/20 hover:border-cc-gold/40 transition-colors group"
            >
              <BookOpen className="w-4 h-4 text-cc-gold flex-shrink-0" />
              <span className="text-sm text-cc-charcoal group-hover:text-cc-navy">
                {t(g.en, g.es)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Selena CTA */}
      <div className="text-center pt-2">
        <p className="text-sm text-cc-slate mb-3">
          {t(
            "Questions before your call? Selena can help anytime.",
            "¿Preguntas antes de su llamada? Selena puede ayudar en cualquier momento."
          )}
        </p>
        <Button
          variant="outline"
          onClick={() => openChat({ source: "post_booking", intent })}
          className="gap-2 rounded-full border-cc-navy/20 text-cc-navy hover:bg-cc-sand"
        >
          <MessageCircle className="w-4 h-4" />
          {t("Continue with Selena", "Continuar con Selena")}
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
