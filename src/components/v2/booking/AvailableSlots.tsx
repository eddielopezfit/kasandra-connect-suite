/**
 * AvailableSlots — Displays real GHL calendar slots.
 * Fetches from check-availability edge function.
 * Passes selected slot to parent for booking via book-appointment.
 */
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CalendarDays, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeSlot {
  start: string;
  end: string;
  display_time: string;
}

interface AvailableSlotsProps {
  leadId: string;
  onSlotSelected: (slot: TimeSlot) => void;
  onBack: () => void;
  userName?: string;
  isBooking?: boolean;
}

type WindowOption = "today" | "tomorrow" | "next_3_days" | "next_7_days";

const AvailableSlots = ({ leadId, onSlotSelected, onBack, userName, isBooking }: AvailableSlotsProps) => {
  const { t } = useLanguage();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [window, setWindow] = useState<WindowOption>("next_3_days");

  const fetchSlots = async (preferred: WindowOption) => {
    setLoading(true);
    setError(false);
    setSelectedSlot(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("check-availability", {
        body: {
          lead_id: leadId,
          channel: "call",
          preferred_window: preferred,
          timezone: "America/Phoenix",
        },
      });
      if (fnErr) throw fnErr;
      if (data?.ok && data.source === "ghl_calendar") {
        setSlots(data.slots ?? []);
        if ((data.slots ?? []).length === 0) setError(true);
      } else {
        setSlots([]);
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots(window);
  }, [window, leadId]);

  const windowLabels: { key: WindowOption; en: string; es: string }[] = [
    { key: "today", en: "Today", es: "Hoy" },
    { key: "tomorrow", en: "Tomorrow", es: "Mañana" },
    { key: "next_3_days", en: "Next 3 Days", es: "Próximos 3 Días" },
    { key: "next_7_days", en: "Next 7 Days", es: "Próximos 7 Días" },
  ];

  // Group slots by date
  const groupedSlots = slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    const date = new Date(slot.start).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      timeZone: "America/Phoenix",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-cc-sand flex items-center justify-center hover:bg-cc-sand-dark transition-colors"
          aria-label="Go back"
          disabled={isBooking}
        >
          <ArrowLeft className="w-4 h-4 text-cc-navy" />
        </button>
        <div>
          <h3 className="font-serif text-lg font-bold text-cc-navy">
            {userName
              ? t(`${userName}, pick a time that works`, `${userName}, elige un horario`)
              : t("Pick a time that works for you", "Elige un horario que te funcione")}
          </h3>
          <p className="text-sm text-cc-slate">
            {t("30-minute conversation · Arizona time (MST)", "Conversación de 30 minutos · Hora de Arizona (MST)")}
          </p>
        </div>
      </div>

      {/* Time window selector */}
      <div className="flex flex-wrap gap-2">
        {windowLabels.map((w) => (
          <button
            key={w.key}
            onClick={() => setWindow(w.key)}
            disabled={isBooking}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              window === w.key
                ? "bg-cc-navy text-white"
                : "bg-cc-sand text-cc-charcoal hover:bg-cc-sand-dark"
            )}
          >
            {t(w.en, w.es)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <div className="w-8 h-8 border-2 border-cc-gold/40 border-t-cc-gold rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-cc-slate">
            {t("Checking Kasandra's calendar...", "Revisando el calendario de Kasandra...")}
          </p>
        </div>
      )}

      {/* Error / No slots — graceful fallback */}
      {!loading && (error || slots.length === 0) && (
        <div className="py-8 text-center bg-cc-sand/50 rounded-xl border border-cc-sand-dark/20">
          <CalendarDays className="w-10 h-10 text-cc-slate/40 mx-auto mb-3" />
          <p className="text-cc-charcoal font-medium mb-1">
            {t("No available times for this window", "No hay horarios disponibles para este periodo")}
          </p>
          <p className="text-sm text-cc-slate mb-4">
            {t(
              "Try a different range above, or reach Kasandra directly:",
              "Prueba otro rango arriba, o contacta a Kasandra directamente:"
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+15203493248"
              className="inline-flex items-center gap-2 bg-cc-navy text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-cc-navy-dark transition-colors"
            >
              📞 {t("Call (520) 349-3248", "Llamar (520) 349-3248")}
            </a>
            <a
              href="mailto:kasandra@cornerconnect.co?subject=Booking%20Request"
              className="inline-flex items-center gap-2 bg-white text-cc-charcoal font-medium text-sm px-5 py-2.5 rounded-xl border border-cc-sand-dark/30 hover:border-cc-gold transition-colors"
            >
              ✉️ {t("Email Kasandra", "Enviar correo a Kasandra")}
            </a>
          </div>
        </div>
      )}

      {/* Slot grid */}
      {!loading && slots.length > 0 && (
        <div className="space-y-5">
          {Object.entries(groupedSlots).map(([date, daySlots]) => (
            <div key={date}>
              <p className="text-sm font-semibold text-cc-navy mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-cc-gold" />
                {date}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {daySlots.map((slot) => {
                  const time = new Date(slot.start).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "America/Phoenix",
                  });
                  const isSelected = selectedSlot?.start === slot.start;
                  return (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={isBooking}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all",
                        isSelected
                          ? "bg-cc-navy text-white border-cc-navy shadow-md"
                          : "bg-white text-cc-charcoal border-cc-sand-dark/30 hover:border-cc-gold hover:bg-cc-sand/50"
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-cc-slate" />
                      )}
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm button */}
      {selectedSlot && (
        <div className="pt-2">
          <Button
            onClick={() => onSlotSelected(selectedSlot)}
            disabled={isBooking}
            className="w-full h-14 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold text-base rounded-xl shadow-gold"
          >
            {isBooking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("Confirming...", "Confirmando...")}
              </span>
            ) : (
              t("Confirm This Time", "Confirmar Este Horario")
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AvailableSlots;
