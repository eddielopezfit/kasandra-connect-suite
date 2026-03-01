import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight } from "lucide-react";

interface NextStep {
  en: string;
  es: string;
}

interface GuideNextStepsProps {
  category: string;
  customSteps?: NextStep[];
}

// Category-specific next steps (max 3 bullets, plain language)
const getNextSteps = (category: string): NextStep[] => {
  // Buyer-focused
  if (category.includes("Buying") || category === "Financial Guidance") {
    return [
      { en: "Get pre-approved for a mortgage", es: "Obtén pre-aprobación para una hipoteca" },
      { en: "Define your must-haves and nice-to-haves", es: "Define tus imprescindibles y deseables" },
      { en: "Schedule your buyer strategy session", es: "Agenda tu sesión de estrategia de compra" },
    ];
  }
  
  // Seller-focused
  if (category.includes("Selling") || category.includes("Valuation")) {
    return [
      { en: "Review your home's current condition", es: "Revisa la condición actual de tu casa" },
      { en: "Understand your timeline and priorities", es: "Comprende tu cronograma y prioridades" },
      { en: "Request a home value review", es: "Solicita una revisión de valor de tu casa" },
    ];
  }
  
  // Cash offers
  if (category.includes("Cash")) {
    return [
      { en: "Take the Cash Offer Readiness Check (~1 min)", es: "Toma el Check de Preparación para Oferta en Efectivo (~1 min)" },
      { en: "Compare cash vs. traditional net proceeds", es: "Compara ganancias netas en efectivo vs. tradicional" },
      { en: "Review your options with Kasandra", es: "Revisa tus opciones con Kasandra" },
    ];
  }
  
  // Neighborhoods
  if (category.includes("Neighborhood")) {
    return [
      { en: "Visit the area at different times of day", es: "Visita el área en diferentes momentos del día" },
      { en: "Research local schools and amenities", es: "Investiga escuelas locales y amenidades" },
      { en: "Connect with a local real estate professional", es: "Conecta con un profesional inmobiliario local" },
    ];
  }
  
  // Default
  return [
    { en: "Review what you've learned", es: "Revisa lo que has aprendido" },
    { en: "Identify your questions and priorities", es: "Identifica tus preguntas y prioridades" },
    { en: "Schedule a conversation when you're ready", es: "Agenda una conversación cuando estés listo" },
  ];
};

const GuideNextSteps = ({ category, customSteps }: GuideNextStepsProps) => {
  const { t } = useLanguage();
  const steps = customSteps || getNextSteps(category);

  return (
    <div className="bg-cc-sand border border-cc-sand-dark rounded-xl p-6 md:p-8">
      <h3 className="font-serif text-xl text-cc-navy mb-4">
        {t("Your Next Steps", "Tus Próximos Pasos")}
      </h3>
      <ul className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cc-gold/20 flex items-center justify-center mt-0.5">
              <span className="text-sm font-semibold text-cc-navy">{index + 1}</span>
            </div>
            <span className="text-cc-charcoal">{t(step.en, step.es)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-cc-sand-dark">
        <p className="text-sm text-cc-charcoal/70 flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-cc-gold" />
          {t(
            "When you're ready, Kasandra is here to help.",
            "Cuando estés listo, Kasandra está aquí para ayudar."
          )}
        </p>
      </div>
    </div>
  );
};

export default GuideNextSteps;
