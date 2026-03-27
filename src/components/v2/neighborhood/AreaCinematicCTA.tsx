import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { Calendar, MapPin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AreaCinematicCTAProps {
  slug: string;
  areaName: string;
  areaNameEs: string;
  onOpenSelena: () => void;
}

const AreaCinematicCTA = ({ slug, areaName, areaNameEs, onOpenSelena }: AreaCinematicCTAProps) => {
  const { t } = useLanguage();
  const { journeyDepth } = useJourneyProgress();

  const ctaConfig = {
    new: {
      headline: { en: 'Explore More Areas', es: 'Explora Más Áreas' },
      label: { en: 'Browse All Areas', es: 'Ver Todas las Áreas' },
      path: '/neighborhoods',
      icon: MapPin,
    },
    exploring: {
      headline: { en: 'Compare Before You Decide', es: 'Compara Antes de Decidir' },
      label: { en: 'Compare Neighborhoods', es: 'Comparar Vecindarios' },
      path: `/neighborhood-compare?areas=${slug}`,
      icon: MapPin,
    },
    engaged: {
      headline: { en: 'Ready to Go Deeper?', es: '¿Listo/a para Profundizar?' },
      label: { en: 'Ask Selena', es: 'Pregunta a Selena' },
      path: '',
      icon: MessageCircle,
    },
    ready: {
      headline: { en: 'Let\'s Make It Happen', es: 'Hagámoslo Realidad' },
      label: { en: 'Book a Strategy Call', es: 'Agenda una Llamada' },
      path: `/book?intent=buy&source=neighborhood_detail&neighborhood=${slug}`,
      icon: Calendar,
    },
  };

  const config = ctaConfig[journeyDepth];

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cc-navy via-cc-navy-dark to-cc-charcoal" />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <motion.div
        className="container mx-auto px-4 relative z-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t(config.headline.en, config.headline.es)}
          </h2>
          <div className="w-16 h-px bg-cc-gold mx-auto mb-6" />
          <p className="text-white/60 text-lg mb-10">
            {t(
              `Your ${areaName} decision starts with the right conversation.`,
              `Tu decisión sobre ${areaNameEs} comienza con la conversación correcta.`
            )}
          </p>

          {journeyDepth === 'engaged' ? (
            <button
              onClick={onOpenSelena}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-lg shadow-lg hover:bg-cc-gold-dark hover:scale-[1.02] transition-all"
            >
              <config.icon className="w-5 h-5" />
              {t(config.label.en, config.label.es)}
            </button>
          ) : (
            <Link
              to={config.path}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-cc-gold text-cc-navy font-semibold text-lg shadow-lg hover:bg-cc-gold-dark hover:scale-[1.02] transition-all"
            >
              <config.icon className="w-5 h-5" />
              {t(config.label.en, config.label.es)}
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default AreaCinematicCTA;
