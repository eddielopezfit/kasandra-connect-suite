/**
 * JourneyRail — Visual 4-stop progression path for hub pages
 * 
 * Shows the user's journey as a horizontal path (desktop) or vertical stepper (mobile).
 * Each stop represents a phase: Understand → Compare → Prepare → Connect.
 * Completed stops dim with ✓, active stop pulses with gold, future stops are muted.
 * 
 * Reads from useJourneyProgress to determine completion state.
 * Only renders for users with intent set (returning/exploring+).
 */

import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useJourneyProgress, type JourneyProgress } from '@/hooks/useJourneyProgress';
import { logCTAClick } from '@/lib/analytics/ctaDefaults';

export interface RailStop {
  id: string;
  step: 1 | 2 | 3 | 4;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
  /** Tool/page destination for this stop */
  destination: string;
  /** Which tools_completed IDs mark this stop as done */
  completionKeys: string[];
  /** Also counts as complete if this journey field is truthy */
  journeyField?: keyof JourneyProgress;
}

// Seller journey stops
const SELL_STOPS: RailStop[] = [
  {
    id: 'understand',
    step: 1,
    labelEn: 'Understand',
    labelEs: 'Entender',
    descEn: 'Know what your home is worth',
    descEs: 'Conoce el valor de tu casa',
    destination: '/home-valuation',
    completionKeys: ['home_valuation'],
    journeyField: 'estimatedValue',
  },
  {
    id: 'compare',
    step: 2,
    labelEn: 'Compare',
    labelEs: 'Comparar',
    descEn: 'Cash vs. traditional — see your numbers',
    descEs: 'Efectivo vs. tradicional — mira tus números',
    destination: '/cash-offer-options',
    completionKeys: ['cash_comparison', 'net_calculator'],
    journeyField: 'hasCalculatorResults',
  },
  {
    id: 'prepare',
    step: 3,
    labelEn: 'Prepare',
    labelEs: 'Prepararte',
    descEn: 'Walk through your selling options',
    descEs: 'Revisa tus opciones de venta',
    destination: '/seller-decision',
    completionKeys: ['seller_decision', 'seller_readiness'],
    journeyField: 'hasSellerDecision',
  },
  {
    id: 'connect',
    step: 4,
    labelEn: 'Connect',
    labelEs: 'Conectar',
    descEn: 'Talk with Kasandra — your path is clear',
    descEs: 'Habla con Kasandra — tu camino está claro',
    destination: '/book?intent=sell&source=journey_rail',
    completionKeys: [],
    journeyField: 'hasBooked',
  },
];

// Buyer journey stops
const BUY_STOPS: RailStop[] = [
  {
    id: 'get-ready',
    step: 1,
    labelEn: 'Get Ready',
    labelEs: 'Prepararte',
    descEn: 'Check your buying power',
    descEs: 'Revisa tu capacidad de compra',
    destination: '/buyer-readiness',
    completionKeys: ['buyer_readiness'],
    journeyField: 'hasReadinessScore',
  },
  {
    id: 'explore',
    step: 2,
    labelEn: 'Explore',
    labelEs: 'Explorar',
    descEn: 'Find the right area for you',
    descEs: 'Encuentra el área ideal para ti',
    destination: '/neighborhoods',
    completionKeys: ['neighborhood_quiz'],
    journeyField: 'hasExploredNeighborhood',
  },
  {
    id: 'plan',
    step: 3,
    labelEn: 'Plan',
    labelEs: 'Planificar',
    descEn: 'Understand costs and programs',
    descEs: 'Entiende costos y programas',
    destination: '/affordability',
    completionKeys: ['affordability', 'buyer_closing_costs'],
  },
  {
    id: 'connect',
    step: 4,
    labelEn: 'Connect',
    labelEs: 'Conectar',
    descEn: 'Ready to see homes? Kasandra will guide you',
    descEs: '¿Listo para ver casas? Kasandra te guiará',
    destination: '/book?intent=buy&source=journey_rail',
    completionKeys: [],
    journeyField: 'hasBooked',
  },
];

function isStopComplete(stop: RailStop, progress: JourneyProgress): boolean {
  // Check completionKeys against tools_completed
  const hasCompletedTool = stop.completionKeys.some(k =>
    progress.toolsCompleted.includes(k)
  );
  if (hasCompletedTool) return true;

  // Check journeyField
  if (stop.journeyField) {
    const val = progress[stop.journeyField];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val > 0;
    if (typeof val === 'string') return val.length > 0;
  }

  return false;
}

function deriveActiveStep(stops: RailStop[], progress: JourneyProgress): number {
  for (let i = 0; i < stops.length; i++) {
    if (!isStopComplete(stops[i], progress)) return i + 1;
  }
  return stops.length; // All complete
}

interface JourneyRailProps {
  intent: 'sell' | 'buy';
  className?: string;
}

export default function JourneyRail({ intent, className }: JourneyRailProps) {
  const { t } = useLanguage();
  const progress = useJourneyProgress();

  // Don't render for brand-new users
  if (progress.journeyDepth === 'new') return null;

  const stops = intent === 'sell' ? SELL_STOPS : BUY_STOPS;
  const activeStep = deriveActiveStep(stops, progress);

  return (
    <section className={cn('bg-white py-6 border-b border-border/30', className)}>
      <div className="container mx-auto px-4">
        <p className="text-center text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-5">
          {t('Your path forward', 'Tu camino a seguir')}
        </p>

        {/* Desktop: horizontal */}
        <div className="hidden md:flex items-start gap-0 max-w-3xl mx-auto">
          {stops.map((stop, idx) => {
            const completed = isStopComplete(stop, progress);
            const isActive = idx + 1 === activeStep && !completed;

            return (
              <div key={stop.id} className="flex items-start flex-1">
                <Link
                  to={stop.destination}
                  onClick={() => logCTAClick({
                    cta_name: `journey_rail_${stop.id}`,
                    destination: stop.destination,
                    page_path: `/${intent === 'sell' ? 'sell' : 'buy'}`,
                    intent,
                  })}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 text-center group',
                    isActive
                      ? 'border-cc-gold bg-cc-gold/5 shadow-soft'
                      : completed
                      ? 'border-emerald-200/60 bg-emerald-50/30'
                      : 'border-border/40 bg-background hover:border-border',
                  )}
                >
                  {/* Step circle */}
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
                      isActive
                        ? 'bg-cc-gold text-cc-navy shadow-[0_0_12px_rgba(225,181,74,0.3)]'
                        : completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-bold">{stop.step}</span>
                    )}
                  </div>

                  {/* Label */}
                  <p
                    className={cn(
                      'font-semibold text-sm transition-colors',
                      isActive ? 'text-cc-navy' : completed ? 'text-emerald-700' : 'text-muted-foreground',
                    )}
                  >
                    {t(stop.labelEn, stop.labelEs)}
                  </p>

                  {/* Description — show on active, hide on completed */}
                  <p
                    className={cn(
                      'text-xs leading-tight transition-opacity',
                      isActive ? 'text-foreground/70' : completed ? 'text-emerald-600/60' : 'text-muted-foreground/60',
                    )}
                  >
                    {completed
                      ? t('✓ Done', '✓ Listo')
                      : t(stop.descEn, stop.descEs)}
                  </p>
                </Link>

                {/* Connector */}
                {idx < stops.length - 1 && (
                  <div className="flex items-start pt-7 px-1.5 shrink-0">
                    <ArrowRight
                      className={cn(
                        'w-4 h-4',
                        completed ? 'text-emerald-400' : 'text-border',
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: compact vertical */}
        <div className="md:hidden max-w-sm mx-auto space-y-2">
          {stops.map((stop, idx) => {
            const completed = isStopComplete(stop, progress);
            const isActive = idx + 1 === activeStep && !completed;

            return (
              <Link
                key={stop.id}
                to={stop.destination}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200',
                  isActive
                    ? 'border-cc-gold bg-cc-gold/5'
                    : completed
                    ? 'border-emerald-200/60 bg-emerald-50/30'
                    : 'border-border/30 opacity-60',
                )}
              >
                {/* Circle */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
                    isActive
                      ? 'bg-cc-gold text-cc-navy'
                      : completed
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-muted text-muted-foreground/50',
                  )}
                >
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{stop.step}</span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      isActive ? 'text-cc-navy' : completed ? 'text-emerald-700' : 'text-muted-foreground',
                    )}
                  >
                    {t(stop.labelEn, stop.labelEs)}
                  </p>
                  {isActive && (
                    <p className="text-xs text-foreground/60 mt-0.5">
                      {t(stop.descEn, stop.descEs)}
                    </p>
                  )}
                  {completed && (
                    <p className="text-xs text-emerald-600/60">{t('✓ Done', '✓ Listo')}</p>
                  )}
                </div>

                {isActive && <ArrowRight className="w-4 h-4 text-cc-gold shrink-0" />}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
