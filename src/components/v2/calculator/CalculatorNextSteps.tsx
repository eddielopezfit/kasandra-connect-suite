/**
 * CalculatorNextSteps - CTA fork after seeing results
 * Routes to Private Cash Review, Selena chat, or booking
 * Includes contextual guide suggestions based on recommendation
 */

import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Calendar, FileText } from "lucide-react";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import GuideSuggestionCard from "@/components/v2/shared/GuideSuggestionCard";

type CalculatorRecommendation = 'cash' | 'traditional' | 'consult' | 'cash_advantage' | 'listing_advantage';

interface CalculatorNextStepsProps {
  onAskSelena: () => void;
  onSaveResults?: () => void;
  showSaveResults?: boolean;
  recommendation?: CalculatorRecommendation;
}

const CalculatorNextSteps = ({
  onAskSelena,
  onSaveResults,
  showSaveResults = false,
  recommendation,
}: CalculatorNextStepsProps) => {
  const { t } = useLanguage();

  const handleCTAClick = (ctaName: string, destination: string) => {
    logCTAClick({
      cta_name: ctaName,
      destination,
      page_path: window.location.pathname,
      intent: 'cash', // Normalized intent value
      recommendation,
    });
  };

  // Get contextual guide based on recommendation
  const getGuideContent = () => {
    if (recommendation === 'cash_advantage') {
      return {
        guideId: 'cash-offer-guide',
        titleEn: 'How Cash Offers Work',
        titleEs: 'Cómo Funcionan las Ofertas en Efectivo',
        descriptionEn: 'Understand the process, timeline, and what to expect.',
        descriptionEs: 'Entienda el proceso, cronograma, y qué esperar.',
      };
    } else if (recommendation === 'listing_advantage') {
      return {
        guideId: 'selling-for-top-dollar',
        titleEn: 'Selling for Top Dollar',
        titleEs: 'Vender al Mejor Precio',
        descriptionEn: 'Strategies to maximize your traditional sale.',
        descriptionEs: 'Estrategias para maximizar su venta tradicional.',
      };
    } else {
      return {
        guideId: 'understanding-home-valuation',
        titleEn: 'Understanding Home Valuation',
        titleEs: 'Entendiendo la Valuación de Su Casa',
        descriptionEn: 'Learn what factors affect your home\'s value.',
        descriptionEs: 'Aprenda qué factores afectan el valor de su casa.',
      };
    }
  };

  const guideContent = getGuideContent();

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-center text-cc-charcoal mb-6">
        {t(
          "What would you like to do next?",
          "¿Qué te gustaría hacer ahora?"
        )}
      </p>

      {/* Primary CTA: Private Cash Review */}
      <Link 
        to="/v2/private-cash-review" 
        className="block"
        onClick={() => handleCTAClick(CTA_NAMES.TOOL_PRIVATE_CASH_REVIEW, '/v2/private-cash-review')}
      >
        <Button
          className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-xl py-6 text-base shadow-gold group"
        >
          <FileText className="w-5 h-5 mr-2" />
          {t("Start My Private Cash Review", "Comenzar Mi Revisión Privada de Efectivo")}
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
      <p className="text-center text-xs text-cc-slate -mt-2">
        {t(
          "Get a deeper analysis with your specific property details",
          "Obtén un análisis más profundo con los detalles de tu propiedad"
        )}
      </p>

      {/* Secondary CTA: Ask Selena */}
      <button
        onClick={() => {
          handleCTAClick(CTA_NAMES.TOOL_ASK_SELENA, 'selena_chat');
          onAskSelena();
        }}
        className="w-full p-4 text-left rounded-xl border-2 border-cc-gold/50 bg-white hover:border-cc-gold hover:bg-cc-gold/5 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cc-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-cc-gold" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-cc-navy text-sm">
              {t("Ask Selena About My Situation", "Pregunta a Selena Sobre Mi Situación")}
            </h4>
            <p className="text-xs text-cc-slate mt-0.5">
              {t("Get instant answers to your questions", "Obtén respuestas instantáneas a tus preguntas")}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-cc-gold opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      {/* Tertiary CTA: Book Consultation → Routes through Selena */}
      <button
        onClick={() => {
          handleCTAClick(CTA_NAMES.TOOL_BOOK_CONSULTATION, 'selena_chat');
          onAskSelena();
        }}
        className="w-full p-4 text-left rounded-xl border-2 border-cc-sand-dark bg-white hover:border-cc-gold/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cc-navy/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-cc-navy" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-cc-navy text-sm">
              {t("Book a Free Consultation", "Agendar una Consulta Gratuita")}
            </h4>
            <p className="text-xs text-cc-slate mt-0.5">
              {t("Talk directly with Kasandra", "Habla directamente con Kasandra")}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-cc-slate opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>

      {/* Contextual Guide Suggestion */}
      <div className="pt-4 border-t border-cc-sand-dark/30">
        <p className="text-xs text-cc-slate mb-3 text-center">
          {t("Want to learn more?", "¿Quiere saber más?")}
        </p>
        <GuideSuggestionCard
          guideId={guideContent.guideId}
          titleEn={guideContent.titleEn}
          titleEs={guideContent.titleEs}
          descriptionEn={guideContent.descriptionEn}
          descriptionEs={guideContent.descriptionEs}
          ctaSource="calculator_results"
          variant="compact"
        />
      </div>

      {/* Optional: Save Results */}
      {showSaveResults && onSaveResults && (
        <button
          onClick={() => {
            handleCTAClick(CTA_NAMES.TOOL_SAVE_RESULTS, 'save_results');
            onSaveResults();
          }}
          className="w-full text-center text-sm text-cc-gold hover:text-cc-gold-dark underline underline-offset-2"
        >
          {t("Save my results for later", "Guardar mis resultados para después")}
        </button>
      )}
    </div>
  );
};

export default CalculatorNextSteps;
