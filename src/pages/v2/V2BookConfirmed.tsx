import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, Calendar, MessageCircle } from "lucide-react";
import { logEvent } from "@/lib/analytics/logEvent";

// ============= SAFE DATETIME PARSING =============

interface ParsedBooking {
  date: string | null;   // e.g. "Saturday, March 15, 2026"
  time: string | null;   // e.g. "2:00 PM"
  timezone: string;      // default "MST (America/Phoenix)"
  duration: string;      // default "30 minutes"
  calendarUrl: string | null; // Google Calendar link, only when start+end computable
}

/**
 * Defensively parses booking details from query params.
 * Never throws — returns nulls for anything unparseable.
 */
function parseBookingFromParams(params: URLSearchParams): ParsedBooking {
  const result: ParsedBooking = {
    date: null,
    time: null,
    timezone: "MST (America/Phoenix)",
    duration: "30 minutes",
    calendarUrl: null,
  };

  try {
    // Try multiple known param names for datetime
    const raw =
      params.get("datetime") ||
      params.get("start_time") ||
      params.get("slot_time") ||
      params.get("date") ||
      params.get("startTime") ||
      params.get("slot") ||
      null;

    if (!raw) return result;

    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return result;

    // Format date and time for display
    result.date = parsed.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Phoenix",
    });

    result.time = parsed.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Phoenix",
    });

    // Override timezone if provided
    const tz = params.get("timezone") || params.get("tz");
    if (tz) result.timezone = tz;

    // Build Google Calendar link only if we have a real start + can compute end
    const startMs = parsed.getTime();
    const endMs = startMs + 30 * 60 * 1000; // 30 min
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const start = fmt(new Date(startMs));
    const end = fmt(new Date(endMs));

    result.calendarUrl =
      `https://calendar.google.com/calendar/render?action=TEMPLATE` +
      `&text=${encodeURIComponent("Consultation with Kasandra Prieto")}` +
      `&dates=${start}/${end}` +
      `&details=${encodeURIComponent("Real estate consultation — bilingual service available.")}` +
      `&location=${encodeURIComponent("Phone Call")}`;
  } catch {
    // Silent fail — return defaults with nulls
  }

  return result;
}

// ============= PAGE COMPONENT =============

const V2BookConfirmedContent = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { openChat } = useSelenaChat();

  useDocumentHead({
    titleEn: "Booking Confirmed | Kasandra Prieto, Tucson Realtor",
    titleEs: "Reserva Confirmada | Kasandra Prieto, Realtor en Tucson",
    descriptionEn: "Your consultation with Kasandra Prieto is scheduled. Bilingual real estate service in Tucson.",
    descriptionEs: "Su consulta con Kasandra Prieto está agendada. Servicio bilingüe de bienes raíces en Tucson.",
    noindex: true,
  });

  const booking = useMemo(
    () => parseBookingFromParams(searchParams),
    [searchParams]
  );

  const intent = searchParams.get("intent") || undefined;
  const userName = searchParams.get("name") || undefined;

  // Analytics: fire booking_completed on mount
  useEffect(() => {
    logEvent("booking_completed", {
      intent: intent || "unknown",
      has_datetime: !!booking.date,
      source: searchParams.get("utm_source") || "direct",
      name: userName,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleContinueWithSelena = () => {
    openChat({ source: "post_booking", intent, userName });
  };

  return (
    <>
      {/* Section 1 — Hero */}
      <section className="bg-cc-navy pt-32 pb-12 w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <CalendarCheck className="w-14 h-14 text-cc-gold mx-auto mb-6" />
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white">
              {t(
                "Your conversation with Kasandra is scheduled",
                "Su conversación con Kasandra está agendada"
              )}
            </h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto">
              {t(
                "Kasandra personally reviews each situation before your call. You'll receive confirmation details shortly.",
                "Kasandra revisa personalmente cada situación antes de su llamada. Recibirá los detalles de confirmación en breve."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Appointment Summary Card */}
      <section className="py-8 md:py-12 bg-cc-ivory w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <Card className="border-cc-gold/20">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-cc-gold" />
                  <span className="font-semibold text-foreground">
                    {t("Appointment Details", "Detalles de la Cita")}
                  </span>
                </div>

                {booking.date ? (
                  <>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                      <span className="text-muted-foreground">{t("Date", "Fecha")}</span>
                      <span className="text-foreground">{booking.date}</span>
                      <span className="text-muted-foreground">{t("Time", "Hora")}</span>
                      <span className="text-foreground">{booking.time}</span>
                      <span className="text-muted-foreground">{t("Duration", "Duración")}</span>
                      <span className="text-foreground">{booking.duration}</span>
                      <span className="text-muted-foreground">{t("Timezone", "Zona horaria")}</span>
                      <span className="text-foreground">{booking.timezone}</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t(
                      "Confirmation details will arrive via email shortly.",
                      "Los detalles de confirmación llegarán por correo electrónico en breve."
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section 3 — Calendar Export (Phase 1: Google only, only when datetime available) */}
      {booking.calendarUrl && (
        <section className="pb-8 bg-cc-ivory w-full">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center">
              <a
                href={booking.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {t("Add to Google Calendar", "Agregar a Google Calendar")}
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Section 4 — Concierge Continuity Block */}
      <section className="py-10 bg-cc-navy w-full">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center space-y-4">
            <p className="text-white/90 text-lg">
              {t(
                "Questions before your conversation? Selena is here anytime — no pressure, just clarity.",
                "¿Preguntas antes de su conversación? Selena está aquí en cualquier momento — sin presión, solo claridad."
              )}
            </p>
            {/* V2: Profile review confirmation */}
            <p className="text-sm text-cc-charcoal/60 mb-4 max-w-sm mx-auto">
              {t(
                "Kasandra will personally review your profile before your call — so you start from a real place.",
                "Kasandra revisará su perfil personalmente antes de su llamada — para que comiencen desde un lugar real."
              )}
            </p>
            <Button
              onClick={handleContinueWithSelena}
              className="bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              {t("Continue with Selena", "Continuar con Selena")}
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5 — Secondary Action */}
      <section className="py-6 bg-cc-ivory w-full">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/book"
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors"
          >
            {t(
              "Reschedule or cancel your appointment",
              "Reprogramar o cancelar su cita"
            )}
          </Link>
        </div>
      </section>
    </>
  );
};

/**
 * /v2/book/confirmed — Calendar-confirmation only.
 * /v2/thank-you remains intake-form confirmation.
 */
const V2BookConfirmed = () => (
  <V2Layout>
    <V2BookConfirmedContent />
  </V2Layout>
);

export default V2BookConfirmed;
