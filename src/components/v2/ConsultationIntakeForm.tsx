/**
 * ConsultationIntakeForm
 *
 * Thin orchestrator — composes the hook + field layer.
 * Owns only:
 *   - Success state (post-submit calendar embed)
 *   - Submit button render + loading state
 *   - Form wrapper (react-hook-form <Form>)
 *
 * Business logic → useConsultationForm
 * Field rendering  → ConsultationFormFields
 */

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useConsultationForm } from "@/hooks/useConsultationForm";
import ConsultationFormFields from "./ConsultationFormFields";
import GHLCalendarEmbed from "./GHLCalendarEmbed";

interface ConsultationIntakeFormProps {
  onSuccess?: (leadId: string) => void;
}

const ConsultationIntakeForm = ({ onSuccess }: ConsultationIntakeFormProps) => {
  const { t } = useLanguage();

  const {
    form,
    isSubmitting,
    isSuccess,
    submittedName,
    submittedEmail,
    submittedPhone,
    isSeller,
    isBuyer,
    hasPrePopulatedData,
    communicationsConsentText,
    aiConsentText,
    onSubmit,
  } = useConsultationForm({ onSuccess });

  // Success state — calendar embed
  if (isSuccess) {
    return (
      <div className="py-6 px-4 sm:py-8 sm:px-6">
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
        <ConsultationFormFields
          form={form}
          isSeller={isSeller}
          isBuyer={isBuyer}
          hasPrePopulatedData={hasPrePopulatedData}
          communicationsConsentText={communicationsConsentText}
          aiConsentText={aiConsentText}
        />

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
