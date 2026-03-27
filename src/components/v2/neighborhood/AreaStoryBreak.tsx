import { useLanguage } from '@/contexts/LanguageContext';
import AreaMotionWrapper from './AreaMotionWrapper';

interface AreaStoryBreakProps {
  headline?: { en: string; es: string };
  body?: { en: string; es: string };
  fallbackTagline?: { en: string; es: string };
}

const AreaStoryBreak = ({ headline, body, fallbackTagline }: AreaStoryBreakProps) => {
  const { t, language } = useLanguage();

  const displayHeadline = headline
    ? (language === 'es' ? headline.es : headline.en)
    : t('A Different Pace of Living', 'Un Ritmo de Vida Diferente');

  const displayBody = body
    ? (language === 'es' ? body.es : body.en)
    : fallbackTagline
      ? (language === 'es' ? fallbackTagline.es : fallbackTagline.en)
      : t(
          'Every area has its own rhythm. Understanding it is the first step to knowing if it fits yours.',
          'Cada área tiene su propio ritmo. Entenderlo es el primer paso para saber si se adapta al tuyo.'
        );

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-b from-cc-navy via-cc-navy-dark to-cc-charcoal overflow-hidden">
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <AreaMotionWrapper className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {displayHeadline}
          </h2>
          <div className="w-16 h-px bg-cc-gold mx-auto mb-6" />
          <p className="text-lg md:text-xl text-white/70 leading-relaxed italic">
            {displayBody}
          </p>
        </div>
      </AreaMotionWrapper>
    </section>
  );
};

export default AreaStoryBreak;
