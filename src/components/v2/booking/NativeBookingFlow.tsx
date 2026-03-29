/**
 * NativeBookingFlow — Orchestrates the 3-step native booking:
 * 1. Intake form (capture lead)
 * 2. Slot selection (real GHL slots via check-availability)
 * 3. Confirmation (real GHL appointment via book-appointment)
 *
 * Production GHL Calendar integration — no stubs.
 */
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { bridgeLeadIdToV2, setStoredUserName, setStoredEmail, setStoredPhone } from "@/lib/analytics/bridgeLeadIdToV2";
import { updateSessionContext } from "@/lib/analytics/selenaSession";
import { logEvent } from "@/lib/analytics/logEvent";
import BookingIntakeForm, { type BookingFormData } from "./BookingIntakeForm";
import AvailableSlots from "./AvailableSlots";
import BookingConfirmation from "./BookingConfirmation";
import { toast } from "sonner";

interface TimeSlot {
  start: string;
  end: string;
  display_time: string;
}

type Step = "intake" | "slots" | "confirmed";

interface NativeBookingFlowProps {
  defaultIntent?: string;
}

const NativeBookingFlow = ({ defaultIntent }: NativeBookingFlowProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>("intake");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [selectedSlotDisplay, setSelectedSlotDisplay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData | null>(null);

  /**
   * Step 1: Submit intake form → upsert lead → show slots
   */
  const handleIntakeSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    setFormData(data);
    setUserName(data.name.split(" ")[0]);

    try {
      setStoredUserName(data.name);
      setStoredEmail(data.email);
      setStoredPhone(data.phone);

      const { data: result, error } = await supabase.functions.invoke("upsert-lead-profile", {
        body: {
          email: data.email.trim(),
          name: data.name.trim(),
          phone: data.phone.trim(),
          intent: data.intent,
          source: "native_booking_form",
          tags: ["booking_started"],
          notes: data.message || undefined,
        },
      });

      if (error) throw error;

      const newLeadId = result?.lead_id || result?.id;
      if (!newLeadId) throw new Error("No lead_id returned");

      setLeadId(newLeadId);
      bridgeLeadIdToV2(newLeadId, "native_booking_form");

      updateSessionContext({
        intent: data.intent as "buy" | "sell" | "cash" | "explore",
      });

      logEvent("booking_intake_completed", {
        intent: data.intent,
        source: "native_form",
      });

      setStep("slots");
    } catch (err) {
      console.error("[NativeBookingFlow] Intake error:", err);
      toast.error(
        t(
          "Something went wrong. Please try again or call (520) 349-3248.",
          "Algo salió mal. Intenta de nuevo o llama al (520) 349-3248."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Step 2: Slot selected → book-appointment (validates + creates GHL appointment) → confirmation
   */
  const handleSlotSelected = async (slot: TimeSlot) => {
    if (!leadId || !formData) return;

    setIsSubmitting(true);
    try {
      logEvent("booking_attempt", {
        intent: formData.intent,
        slot_start: slot.start,
      });

      // Call book-appointment: validates slot, creates GHL contact + appointment
      const { data: result, error } = await supabase.functions.invoke("book-appointment", {
        body: {
          lead_id: leadId,
          slot_start: slot.start,
          slot_end: slot.end,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          intent: formData.intent,
          message: formData.message || undefined,
          timezone: "America/Phoenix",
        },
      });

      // Handle slot conflict — prompt reselection
      if (error || !result?.ok) {
        const code = result?.code;

        if (code === "slot_conflict") {
          logEvent("slot_conflict", { slot_start: slot.start });
          toast.error(
            t(
              "That time was just taken! Please pick another slot.",
              "¡Ese horario acaba de ser tomado! Elige otro horario."
            )
          );
          // Stay on slots step — AvailableSlots will auto-refresh
          return;
        }

        throw new Error(result?.error || "Booking failed");
      }

      // Success — set display and advance
      const slotLabel = result.slotLabel || new Date(slot.start).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", timeZone: "America/Phoenix",
      }) + " at " + new Date(slot.start).toLocaleTimeString("en-US", {
        hour: "numeric", minute: "2-digit", hour12: true, timeZone: "America/Phoenix",
      });

      setSelectedSlotDisplay(slotLabel);
      updateSessionContext({ has_booked: true });

      logEvent("booking_success", {
        intent: formData.intent,
        slot_start: slot.start,
        appointment_id: result.appointmentId,
      });

      setStep("confirmed");
    } catch (err) {
      console.error("[NativeBookingFlow] Booking error:", err);
      logEvent("booking_failure", {
        intent: formData?.intent,
        slot_start: slot.start,
        error: String(err),
      });
      toast.error(
        t(
          "Could not confirm your time. Please try again or call (520) 349-3248.",
          "No se pudo confirmar tu horario. Intenta de nuevo o llama al (520) 349-3248."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cc-sand-dark/10 p-6 sm:p-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {["intake", "slots", "confirmed"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                step === s
                  ? "bg-cc-gold"
                  : ["intake", "slots", "confirmed"].indexOf(step) > i
                  ? "bg-cc-navy"
                  : "bg-cc-sand-dark/30"
              }`}
            />
            {i < 2 && (
              <div
                className={`w-8 h-0.5 transition-colors ${
                  ["intake", "slots", "confirmed"].indexOf(step) > i
                    ? "bg-cc-navy"
                    : "bg-cc-sand-dark/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {step === "intake" && (
        <BookingIntakeForm
          onSubmit={handleIntakeSubmit}
          isSubmitting={isSubmitting}
          defaultIntent={defaultIntent}
        />
      )}

      {step === "slots" && leadId && (
        <AvailableSlots
          leadId={leadId}
          onSlotSelected={handleSlotSelected}
          onBack={() => setStep("intake")}
          userName={userName}
          isBooking={isSubmitting}
        />
      )}

      {step === "confirmed" && (
        <BookingConfirmation
          slotDisplay={selectedSlotDisplay}
          userName={userName}
          intent={formData?.intent}
        />
      )}
    </div>
  );
};

export default NativeBookingFlow;
