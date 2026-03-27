import { useLanguage } from '@/contexts/LanguageContext';
import { DollarSign, TrendingUp, Clock, Home } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import AreaMotionWrapper from './AreaMotionWrapper';

interface AreaIntelligenceCardProps {
  areaIntelligence: {
    priceRange: { en: string; es: string };
    demandLevel: 'low' | 'moderate' | 'high';
    marketSpeed: 'slow' | 'average' | 'fast';
    propertyTypes: { en: string[]; es: string[] };
  };
}

const demandConfig = {
  low: { label: { en: 'Low Demand', es: 'Demanda Baja' }, color: 'bg-cc-slate/10 text-cc-slate border-cc-slate/20' },
  moderate: { label: { en: 'Moderate Demand', es: 'Demanda Moderada' }, color: 'bg-cc-gold/10 text-cc-gold-dark border-cc-gold/20' },
  high: { label: { en: 'High Demand', es: 'Demanda Alta' }, color: 'bg-green-50 text-green-700 border-green-200' },
};

const speedConfig = {
  slow: { label: { en: 'Slow Market', es: 'Mercado Lento' }, color: 'bg-cc-slate/10 text-cc-slate border-cc-slate/20' },
  average: { label: { en: 'Average Pace', es: 'Ritmo Promedio' }, color: 'bg-cc-gold/10 text-cc-gold-dark border-cc-gold/20' },
  fast: { label: { en: 'Fast-Moving', es: 'Movimiento Rápido' }, color: 'bg-green-50 text-green-700 border-green-200' },
};

const AreaIntelligenceCard = ({ areaIntelligence }: AreaIntelligenceCardProps) => {
  const { t, language } = useLanguage();

  const demand = demandConfig[areaIntelligence.demandLevel];
  const speed = speedConfig[areaIntelligence.marketSpeed];
  const propertyTypes = language === 'es' ? areaIntelligence.propertyTypes.es : areaIntelligence.propertyTypes.en;
  const priceRange = language === 'es' ? areaIntelligence.priceRange.es : areaIntelligence.priceRange.en;

  const stats = [
    {
      icon: DollarSign,
      label: t('Typical Price Range', 'Rango de Precios Típico'),
      value: priceRange,
      badge: null,
    },
    {
      icon: TrendingUp,
      label: t('Area Demand', 'Demanda del Área'),
      value: null,
      badge: { text: language === 'es' ? demand.label.es : demand.label.en, color: demand.color },
    },
    {
      icon: Clock,
      label: t('Market Speed', 'Velocidad del Mercado'),
      value: null,
      badge: { text: language === 'es' ? speed.label.es : speed.label.en, color: speed.color },
    },
    {
      icon: Home,
      label: t('Property Types', 'Tipos de Propiedad'),
      value: propertyTypes.join(' · '),
      badge: null,
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4">
        <AreaMotionWrapper className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mb-3">
              {t('Area Intelligence', 'Inteligencia del Área')}
            </h2>
            <p className="text-cc-text-muted">
              {t('Market data at a glance — no listings, no gated forms.', 'Datos del mercado de un vistazo — sin listados, sin formularios.')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                className="bg-cc-ivory rounded-2xl p-6 text-center border border-cc-sand-dark/10"
                whileHover={{ y: -4, boxShadow: '0 16px 48px -16px rgba(31,42,68,0.12)' }}
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-cc-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-5 h-5 text-cc-gold" />
                </div>
                <p className="text-xs text-cc-text-muted uppercase tracking-wider mb-2 font-medium">{stat.label}</p>
                {stat.badge ? (
                  <Badge className={`${stat.badge.color} border text-sm px-3 py-1`}>
                    {stat.badge.text}
                  </Badge>
                ) : (
                  <p className="font-serif text-lg font-bold text-cc-navy">{stat.value}</p>
                )}
              </motion.div>
            ))}
          </div>
        </AreaMotionWrapper>
      </div>
    </section>
  );
};

export default AreaIntelligenceCard;
