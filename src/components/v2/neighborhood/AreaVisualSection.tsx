import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { Utensils, TreePine, Sun } from 'lucide-react';
import AreaMotionWrapper from './AreaMotionWrapper';

interface AreaVisualSectionProps {
  lifestyleHighlights: {
    dining: { en: string; es: string };
    outdoor: { en: string; es: string };
    dailyRhythm: { en: string; es: string };
  };
  imageUrl?: string;
  areaName: string;
}

const AreaVisualSection = ({ lifestyleHighlights, imageUrl, areaName }: AreaVisualSectionProps) => {
  const { t, language } = useLanguage();

  const highlights = [
    {
      icon: Utensils,
      label: t('Dining & Culture', 'Gastronomía y Cultura'),
      text: language === 'es' ? lifestyleHighlights.dining.es : lifestyleHighlights.dining.en,
    },
    {
      icon: TreePine,
      label: t('Outdoor Lifestyle', 'Estilo de Vida al Aire Libre'),
      text: language === 'es' ? lifestyleHighlights.outdoor.es : lifestyleHighlights.outdoor.en,
    },
    {
      icon: Sun,
      label: t('Daily Rhythm', 'Ritmo Diario'),
      text: language === 'es' ? lifestyleHighlights.dailyRhythm.es : lifestyleHighlights.dailyRhythm.en,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-cc-ivory">
      <div className="container mx-auto px-4">
        <AreaMotionWrapper className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Image side */}
            <motion.div
              className="relative rounded-2xl overflow-hidden aspect-[4/3]"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${areaName} lifestyle`}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cc-navy via-cc-navy-dark to-cc-charcoal flex items-center justify-center">
                  <div className="text-center">
                    <Sun className="w-12 h-12 text-cc-gold/40 mx-auto mb-3" />
                    <p className="text-white/30 font-serif text-lg">{areaName}</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </motion.div>

            {/* Text side */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-8">
                {t(`Life in ${areaName}`, `Vida en ${areaName}`)}
              </h2>

              <div className="space-y-6">
                {highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                  >
                    <div className="w-10 h-10 bg-cc-gold/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <h.icon className="w-5 h-5 text-cc-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cc-navy mb-1">{h.label}</h3>
                      <p className="text-cc-text-muted text-sm leading-relaxed">{h.text}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Continuity nudge */}
              <p className="text-cc-text-muted text-sm italic mt-8">
                {t(
                  'Want to compare this with another area? Keep scrolling for tools.',
                  '¿Quieres comparar con otra área? Sigue bajando para ver herramientas.'
                )}
              </p>
            </div>
          </div>
        </AreaMotionWrapper>
      </div>
    </section>
  );
};

export default AreaVisualSection;
