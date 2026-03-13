import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";
import LanguageToggle from "@/components/v2/LanguageToggle";
import type { Intent, JourneyStage } from "@/lib/guides/personalization";
import downtownHeroImage from "@/assets/hero-guides-desert-home.png";

interface PersonalizedHeroProps {
  isReturning: boolean;
  intent: Intent;
  journeyStage: JourneyStage;
  onStartSelena: () => void;
  onContinue: () => void;
  onBrowse: () => void;
}

// Dynamic headlines based on user state
const getHeadline = (
  isReturning: boolean,
  intent: Intent,
  journeyStage: JourneyStage,
  t: (en: string, es: string) => string
) => {
  // Returning visitors
  if (isReturning) {
    if (journeyStage >= 4) {
      return t(
        "You're Getting Closer to Your Goal.",
        "Estás Cada Vez Más Cerca de Tu Meta."
      );
    }
    return t(
      "Welcome Back. Let's Keep Going.",
      "Bienvenido de Nuevo. Sigamos Adelante."
    );
  }
  
  // First-time visitors with intent
  if (intent === 'buy') {
    return t(
      "Thinking About Buying a Home?",
      "¿Pensando en Comprar una Casa?"
    );
  }
  if (intent === 'sell' || intent === 'cash') {
    return t(
      "Ready to Explore Selling Options?",
      "¿Listo para Explorar Opciones de Venta?"
    );
  }
  
  // Default first-time visitor — neutral framing
  return t(
    "Your Tucson Real Estate Playbook",
    "Tu Guía de Bienes Raíces en Tucson"
  );
};

// Dynamic badge text
const getBadge = (
  isReturning: boolean,
  t: (en: string, es: string) => string
) => {
  if (isReturning) {
    return t("Welcome Back", "Bienvenido de Nuevo");
  }
  return t("Your Starting Point", "Tu Punto de Partida");
};

// Dynamic subheadline
const getSubheadline = (
  isReturning: boolean,
  intent: Intent,
  t: (en: string, es: string) => string
) => {
  if (isReturning) {
    return t(
      "Pick up where you left off, or let Selena guide you to what's next.",
      "Continúa donde lo dejaste, o deja que Selena te guíe hacia lo siguiente."
    );
  }
  
  if (intent === 'buy') {
    return t(
      "Find the right guides and resources to start your buying journey with confidence.",
      "Encuentra las guías y recursos adecuados para comenzar tu proceso de compra con confianza."
    );
  }
  
  if (intent === 'sell' || intent === 'cash') {
    return t(
      "Explore guides tailored to help you sell on your terms—no pressure.",
      "Explora guías diseñadas para ayudarte a vender en tus términos—sin presión."
    );
  }
  
  return t(
    "Whether you're buying, selling, or just exploring — you don't have to figure it all out alone. Start with what feels right for you.",
    "Ya sea que quieras comprar, vender, o simplemente explorar — no tienes que resolverlo todo solo. Empieza con lo que te haga sentido."
  );
};

export function PersonalizedHero({
  isReturning,
  intent,
  journeyStage,
  onStartSelena,
  onContinue,
  onBrowse,
}: PersonalizedHeroProps) {
  const { t } = useLanguage();
  
  const headline = getHeadline(isReturning, intent, journeyStage, t);
  const badge = getBadge(isReturning, t);
  const subheadline = getSubheadline(isReturning, intent, t);
  
  return (
    <section className="relative bg-cc-navy pt-32 pb-20 w-full max-w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${downtownHeroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-cc-navy/85 via-cc-navy/75 to-cc-navy/90" />
      <div className="container mx-auto px-4 relative z-10 w-full max-w-full">
        
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <span className="inline-block px-4 py-1.5 bg-cc-gold/20 text-cc-gold rounded-full text-sm font-medium mb-6 animate-fade-in">
            {badge}
          </span>
          
          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight animate-fade-up">
            {headline}
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-white/80 mb-10 leading-relaxed animate-fade-up animation-delay-100">
            {subheadline}
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animation-delay-200">
            {/* Primary: Start with Selena */}
            <Button
              onClick={onStartSelena}
              size="lg"
              className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold group"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              {t("Start with Selena", "Comenzar con Selena")}
            </Button>
            
            {/* Secondary: Continue (only for returning) or disabled */}
            {isReturning ? (
              <Button
                onClick={onContinue}
                variant="outline"
                size="lg"
                className="bg-white/15 border-white/40 text-white hover:bg-white/20 hover:border-white/50 rounded-full px-8"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                {t("Continue Your Journey", "Continúa Tu Camino")}
              </Button>
            ) : null}
            
            {/* Ghost: Browse Freely */}
            <Button
              onClick={onBrowse}
              variant="ghost"
              size="lg"
              className="text-white/70 hover:text-white hover:bg-white/5 rounded-full px-8"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t("Browse Freely", "Explorar Libremente")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
