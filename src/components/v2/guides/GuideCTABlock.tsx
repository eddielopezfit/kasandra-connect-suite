import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Home, DollarSign, BookOpen } from "lucide-react";

interface GuideCTABlockProps {
  category: string;
}

// Category-specific CTA routing - ONE primary CTA per category
const getCTAConfig = (category: string) => {
  // Buyer-focused categories
  if (category.includes("Buying") || category === "Financial Guidance") {
    return {
      link: "/v2/buyer-readiness",
      textEn: "Start Buyer Readiness Check",
      textEs: "Iniciar Evaluación de Preparación",
      subtextEn: "A quick self-assessment to understand where you stand",
      subtextEs: "Una autoevaluación rápida para entender dónde está",
      icon: BookOpen,
    };
  }
  
  // Seller-focused categories (including Valuation)
  if (category.includes("Selling") || category.includes("Valuation")) {
    return {
      link: "/v2/book",
      textEn: "Request a Home Value Review",
      textEs: "Solicitar Revisión de Valor",
      subtextEn: "Understand what your home might be worth today",
      subtextEs: "Entienda cuánto podría valer su casa hoy",
      icon: Home,
    };
  }
  
  // Cash offer category
  if (category.includes("Cash")) {
    return {
      link: "/v2/cash-offer-options",
      textEn: "Explore Cash Offer Options",
      textEs: "Explorar Opciones de Oferta en Efectivo",
      subtextEn: "See if a cash offer makes sense for your situation",
      subtextEs: "Vea si una oferta en efectivo tiene sentido para su situación",
      icon: DollarSign,
    };
  }
  
  // Default for neighborhoods, tips, stories, early-stage readers
  return {
    link: "/v2/guides",
    textEn: "Explore More Resources",
    textEs: "Explorar Más Recursos",
    subtextEn: "Continue learning at your own pace",
    subtextEs: "Continúe aprendiendo a su propio ritmo",
    icon: BookOpen,
  };
};

const GuideCTABlock = ({ category }: GuideCTABlockProps) => {
  const { t } = useLanguage();
  const config = getCTAConfig(category);

  return (
    <section className="bg-cc-navy py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-3">
            {t("Ready for Your Next Step?", "¿Listo para Su Próximo Paso?")}
          </h2>
          <p className="text-white/70 text-base mb-8">
            {t(
              "No pressure. Just support when you're ready.",
              "Sin presión. Solo apoyo cuando esté listo."
            )}
          </p>
          
          {/* Single Primary CTA */}
          <Button 
            asChild 
            size="lg" 
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 sm:px-10 py-6 text-base sm:text-lg shadow-gold max-w-full"
          >
            <Link to={config.link} className="inline-flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <config.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-center">{t(config.textEn, config.textEs)}</span>
            </Link>
          </Button>
          
          {/* Subtext */}
          <p className="text-white/50 text-sm mt-4">
            {t(config.subtextEn, config.subtextEs)}
          </p>
        </div>
      </div>
    </section>
  );
};

export default GuideCTABlock;
