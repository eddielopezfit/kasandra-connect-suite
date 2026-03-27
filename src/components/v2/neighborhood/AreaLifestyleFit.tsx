import { useLanguage } from '@/contexts/LanguageContext';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import AreaMotionWrapper from './AreaMotionWrapper';

interface AreaLifestyleFitProps {
  lifestyleFit: {
    strongMatch: { en: string[]; es: string[] };
    considerCarefully: { en: string[]; es: string[] };
  };
}

const AreaLifestyleFit = ({ lifestyleFit }: AreaLifestyleFitProps) => {
  const { t, language } = useLanguage();

  const strongItems = language === 'es' ? lifestyleFit.strongMatch.es : lifestyleFit.strongMatch.en;
  const considerItems = language === 'es' ? lifestyleFit.considerCarefully.es : lifestyleFit.considerCarefully.en;

  return (
    <section className="py-16 lg:py-24 bg-cc-ivory">
      <div className="container mx-auto px-4">
        <AreaMotionWrapper className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-3">
              {t('Is This Area Right for You?', '¿Es Esta Área Adecuada para Ti?')}
            </h2>
            <p className="text-cc-text-muted max-w-2xl mx-auto">
              {t(
                'A breakdown of what living here actually feels like — so you can decide with clarity.',
                'Un desglose de cómo se siente realmente vivir aquí — para que puedas decidir con claridad.'
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Strong Match */}
            <motion.div
              className="bg-white rounded-2xl p-8 border-2 border-green-200/60 shadow-sm"
              whileHover={{ y: -2, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-cc-navy">
                  {t('Strong match if you value', 'Fuerte coincidencia si valoras')}
                </h3>
              </div>
              <ul className="space-y-3">
                {strongItems.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                    <span className="text-cc-charcoal">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Consider Carefully */}
            <motion.div
              className="bg-white rounded-2xl p-8 border-2 border-cc-gold/30 shadow-sm"
              whileHover={{ y: -2, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cc-gold/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-cc-gold-dark" />
                </div>
                <h3 className="font-serif text-xl font-bold text-cc-navy">
                  {t('Consider carefully if you prefer', 'Considera cuidadosamente si prefieres')}
                </h3>
              </div>
              <ul className="space-y-3">
                {considerItems.map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                  >
                    <AlertTriangle className="w-4 h-4 text-cc-gold mt-1 shrink-0" />
                    <span className="text-cc-charcoal">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Continuity nudge */}
          <div className="text-center mt-8">
            <p className="text-cc-text-muted text-sm italic">
              {t(
                'Not sure if this fits? Keep scrolling — we\'ll help you compare with tools and data.',
                'No estás seguro/a si es para ti? Sigue bajando — te ayudaremos a comparar con herramientas y datos.'
              )}
            </p>
          </div>
        </AreaMotionWrapper>
      </div>
    </section>
  );
};

export default AreaLifestyleFit;
