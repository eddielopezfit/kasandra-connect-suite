/**
 * Situation Lane
 * Cards for specific life circumstances
 */

import { Building, MapPin, UserCheck, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export type Situation = 'inherited' | 'relocating' | 'first_time' | 'spanish_first';

interface SituationLaneProps {
  onSituationClick: (situation: Situation) => void;
  className?: string;
}

const SITUATION_CARDS: {
  id: Situation;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
  icon: typeof Building;
  guideId?: string;
}[] = [
  {
    id: 'inherited',
    labelEn: 'Inherited Property',
    labelEs: 'Propiedad Heredada',
    descEn: 'Guidance for estate situations',
    descEs: 'Orientación para situaciones de herencia',
    icon: Building,
    guideId: 'understanding-home-valuation',
  },
  {
    id: 'relocating',
    labelEn: 'Relocating to Tucson',
    labelEs: 'Mudándome a Tucson',
    descEn: 'Welcome to the desert',
    descEs: 'Bienvenido al desierto',
    icon: MapPin,
    guideId: 'tucson-neighborhood-guide',
  },
  {
    id: 'first_time',
    labelEn: 'First-Time Buyer',
    labelEs: 'Primera Compra',
    descEn: 'Start your journey with confidence',
    descEs: 'Comienza tu camino con confianza',
    icon: UserCheck,
    guideId: 'first-time-buyer-guide',
  },
  {
    id: 'spanish_first',
    labelEn: 'Prefiero Español',
    labelEs: 'Prefiero Español',
    descEn: 'We speak your language',
    descEs: 'Hablamos tu idioma',
    icon: Languages,
    guideId: 'spanish-speaking-client-story',
  },
];

export function SituationLane({ onSituationClick, className }: SituationLaneProps) {
  const { t } = useLanguage();

  return (
    <section className={cn('py-10 bg-cc-sand/50', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-serif text-2xl md:text-3xl text-cc-navy mb-2">
            {t('Your Situation Matters', 'Tu Situación Importa')}
          </h2>
          <p className="text-cc-slate text-sm">
            {t('Find guides tailored to your circumstances', 'Encuentra guías adaptadas a tus circunstancias')}
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {SITUATION_CARDS.map((card) => {
            const Icon = card.icon;
            const content = (
              <>
                <Icon className="w-5 h-5 mr-2 text-cc-gold" />
                <div className="text-left">
                  <span className="font-medium text-cc-charcoal block">
                    {t(card.labelEn, card.labelEs)}
                  </span>
                  <span className="text-xs text-cc-slate">
                    {t(card.descEn, card.descEs)}
                  </span>
                </div>
              </>
            );

            if (card.guideId) {
              return (
                <Link
                  key={card.id}
                  to={`/guides/${card.guideId}`}
                  onClick={() => onSituationClick(card.id)}
                  className={cn(
                    'flex items-center p-4 bg-white rounded-xl border border-cc-sand-dark/50',
                    'hover:border-cc-gold/50 hover:shadow-md transition-all duration-300',
                    'min-w-[200px]'
                  )}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={card.id}
                onClick={() => onSituationClick(card.id)}
                className={cn(
                  'flex items-center p-4 bg-white rounded-xl border border-cc-sand-dark/50',
                  'hover:border-cc-gold/50 hover:shadow-md transition-all duration-300',
                  'min-w-[200px]'
                )}
              >
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
