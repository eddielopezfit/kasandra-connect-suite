/**
 * ConsultationFormFields
 *
 * Pure render layer for the consultation intake form.
 * Receives the react-hook-form `form` instance and derived values from
 * useConsultationForm. Has no business logic, no API calls, no state —
 * only markup and field components.
 */

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import type { FormData } from "@/hooks/useConsultationForm";
import {
  INTENT_OPTIONS,
  TIMELINE_OPTIONS,
  PRICE_RANGE_OPTIONS,
  PRE_APPROVED_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/hooks/useConsultationForm";

// ─── ConsentText ──────────────────────────────────────────────────────────────

/**
 * Collapsible consent text for mobile — truncates long legal strings
 * to keep the form scannable on small screens.
 */
const ConsentText = ({
  text,
  isRequired = true,
  t,
}: {
  text: string;
  isRequired?: boolean;
  t: (en: string, es: string) => string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const previewLength = 60;
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ConsultationFormFieldsProps {
  form: UseFormReturn<FormData>;
  isSeller: boolean;
  isBuyer: boolean;
  hasPrePopulatedData: boolean;
  communicationsConsentText: string;
  aiConsentText: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ConsultationFormFields = ({
  form,
  isSeller,
  isBuyer,
  hasPrePopulatedData,
  communicationsConsentText,
  aiConsentText,
}: ConsultationFormFieldsProps) => {
  const { t, language } = useLanguage();

  return (
    <>
      {/* Pre-population indicator */}
      {hasPrePopulatedData && (
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
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-base py-3">
                    {language === "en" ? opt.labelEn : opt.labelEs}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Intent */}
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
                {INTENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-base py-3">
                    {language === "en" ? opt.labelEn : opt.labelEs}
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
                {TIMELINE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-base py-3">
                    {language === "en" ? opt.labelEn : opt.labelEs}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Property Address — conditional on seller intent */}
      {isSeller && (
        <FormField
          control={form.control}
          name="propertyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-cc-navy font-medium text-base">
                {t("Property Address", "Dirección de la Propiedad")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("123 Main St, Tucson, AZ", "123 Calle Principal, Tucson, AZ")}
                  className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Buyer fields — conditional on buyer intent */}
      {isBuyer && (
        <>
          <FormField
            control={form.control}
            name="preApproved"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-navy font-medium text-base">
                  {t("Are you pre-approved for a mortgage?", "¿Está pre-aprobado/a para una hipoteca?")}{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                      <SelectValue placeholder={t("Select an option", "Seleccione una opción")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white z-50">
                    {PRE_APPROVED_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-base py-3">
                        {language === "en" ? opt.labelEn : opt.labelEs}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-navy font-medium text-base">
                  {t("Price Range", "Rango de Precio")}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-cc-sand-dark/50 focus:border-cc-gold bg-white h-12 text-base">
                      <SelectValue placeholder={t("Select a range", "Seleccione un rango")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white z-50">
                    {PRICE_RANGE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-base py-3">
                        {language === "en" ? opt.labelEn : opt.labelEs}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetNeighborhoods"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-cc-navy font-medium text-base">
                  {t("Target Neighborhoods", "Vecindarios de Interés")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t(
                      "e.g. Oro Valley, Marana, Midtown",
                      "p.ej. Oro Valley, Marana, Centro"
                    )}
                    className="border-cc-sand-dark/50 focus:border-cc-gold h-12 text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}

      {/* Notes */}
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-cc-navy font-medium text-base">
              {t("Additional Notes", "Notas Adicionales")}
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

      {/* Communications Consent */}
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
                <ConsentText text={communicationsConsentText} isRequired t={t} />
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      {/* AI Disclosure Consent */}
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
                <ConsentText text={aiConsentText} isRequired t={t} />
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </>
  );
};

export default ConsultationFormFields;
