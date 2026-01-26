/**
 * Start Here Lane
 * Entry points for common user intents
 */

import { Home, TrendingUp, DollarSign, Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export type StartHereIntent = 'buy' | 'sell' | 'cash' | 'explore';

interface StartHereLaneProps {
  onIntentSelect: (intent: StartHereIntent) => void;
  className?: string;
}

const INTENT_CARDS: {
  id: StartHereIntent;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
  icon: typeof Home;
  color: string;
}[] = [
  {
    id: 'buy',
    labelEn: 'I Want to Buy',
    labelEs: 'Quiero Comprar',
    descEn: 'Start your buying journey',
    descEs: 'Comienza tu proceso de compra',
    icon: Home,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400 text-blue-700',
  },
  {
    id: 'sell',
    labelEn: 'I Want to Sell',
    labelEs: 'Quiero Vender',
    descEn: 'Explore your selling options',
    descEs: 'Explora tus opciones de venta',
    icon: TrendingUp,
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 text-emerald-700',
  },
  {
    id: 'cash',
    labelEn: 'Cash Offer',
    labelEs: 'Oferta en Efectivo',
    descEn: 'Learn about quick sales',
    descEs: 'Aprende sobre ventas rápidas',
    icon: DollarSign,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400 text-amber-700',
  },
  {
    id: 'explore',
    labelEn: 'Just Exploring',
    labelEs: 'Solo Explorando',
    descEn: 'No pressure, just learning',
    descEs: 'Sin presión, solo aprendiendo',
    icon: Compass,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400 text-purple-700',
  },
];

export function StartHereLane({ onIntentSelect, className }: StartHereLaneProps) {
  const { t } = useLanguage();

  return (
    <section className={cn('py-10', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl md:text-3xl text-cc-navy mb-2">
            {t('Start Here', 'Comienza Aquí')}
          </h2>
          <p className="text-cc-slate text-sm">
            {t('What brings you here today?', '¿Qué te trae aquí hoy?')}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {INTENT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => onIntentSelect(card.id)}
                className={cn(
                  'group flex flex-col items-center p-5 rounded-xl border-2 transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-1',
                  card.color
                )}
              >
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-sm md:text-base text-center mb-1">
                  {t(card.labelEn, card.labelEs)}
                </h3>
                <p className="text-xs text-center opacity-80">
                  {t(card.descEn, card.descEs)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
