import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { JourneyStage } from "@/lib/guides/personalization";

interface JourneyProgressIndicatorProps {
  stage: JourneyStage;
  onBookConsultation: () => void;
}

// Stage labels and microcopy
const stageContent = {
  1: {
    label: "Getting started",
    labelEs: "Comenzando",
    microcopy: "Take your time. Explore at your own pace.",
    microcopyEs: "Tómate tu tiempo. Explora a tu propio ritmo.",
  },
  2: {
    label: "Exploring",
    labelEs: "Explorando",
    microcopy: "You're building a foundation of knowledge.",
    microcopyEs: "Estás construyendo una base de conocimiento.",
  },
  3: {
    label: "Building clarity",
    labelEs: "Ganando claridad",
    microcopy: "You're starting to see what matters most.",
    microcopyEs: "Empiezas a ver lo que más importa.",
  },
  4: {
    label: "Narrowing down",
    labelEs: "Definiendo opciones",
    microcopy: "You know what you want. Let's refine the path.",
    microcopyEs: "Sabes lo que quieres. Refinemos el camino.",
  },
  5: {
    label: "Ready to talk",
    labelEs: "Listo para hablar",
    microcopy: "When you're ready, Kasandra is here to help.",
    microcopyEs: "Cuando estés listo, Kasandra está aquí para ayudar.",
  },
};

export function JourneyProgressIndicator({
  stage,
  onBookConsultation,
}: JourneyProgressIndicatorProps) {
  const { t } = useLanguage();
  
  // Don't show on first visit (stage 1)
  if (stage < 2) return null;
  
  const content = stageContent[stage];
  
  return (
    <section className="bg-white py-8 border-b border-cc-sand-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Progress Bar */}
          <div className="flex items-center gap-1 mb-4 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  s === 1 ? "w-8" : "w-12", // First segment smaller
                  s <= stage
                    ? "bg-cc-gold"
                    : "bg-cc-sand-dark"
                )}
              />
            ))}
          </div>
          
          {/* Stage Label */}
          <p className="text-sm font-medium text-cc-navy mb-1">
            {t(content.label, content.labelEs)}
          </p>
          
          {/* Microcopy */}
          <p className="text-sm text-cc-slate mb-4">
            {t(content.microcopy, content.microcopyEs)}
          </p>
          
          {/* CTA at stage 5 */}
          {stage >= 5 && (
            <Button
              onClick={onBookConsultation}
              variant="outline"
              size="sm"
              className="border-cc-gold text-cc-gold hover:bg-cc-gold/10 rounded-full px-6"
            >
              {t("Book a Consultation", "Agendar una Cita")}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
