/**
 * IntentJourneyMap — The Signature Feature
 *
 * Visual journey map showing the user's path based on their declared intent.
 * NOT a progress bar — a map with 4 steps that shows which guides and tools
 * live at each stage. User's current position is highlighted.
 *
 * Only renders when intent has been set (Decision Lane clicked).
 * Each step shows: position name, 1-2 guide titles, tool if applicable.
 *
 * Architecture: reads from registry — no hardcoded guide lists.
 */

import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { getLiveGuides } from '@/lib/guides/guideRegistry';
import type { DecisionLaneIntent } from './DecisionLane';

interface IntentJourneyMapProps {
  intent: DecisionLaneIntent;
  /** The user's current journey step (1-4), derived from cognitive stage */
  currentStep: 1 | 2 | 3 | 4;
  onStepClick?: (step: number) => void;
  className?: string;
}

interface JourneyStep {
  step: 1 | 2 | 3 | 4;
  labelEn: string;
  labelEs: string;
  descEn: string;
  descEs: string;
  /** Categories that belong in this step */
  categories: string[];
  /** funnelStage filter */
  funnelStage: 'tofu' | 'mofu' | 'bofu' | null;
  tool?: { labelEn: string; labelEs: string };
}

// Intent-aware journey map definitions
const JOURNEY_MAPS: Record<DecisionLaneIntent, JourneyStep[]> = {
  sell: [
    {
      step: 1,
      labelEn: 'Understand',
      labelEs: 'Entender',
      descEn: 'Know what your home is worth and your options',
      descEs: 'Conoce el valor de tu casa y tus opciones',
      categories: ['selling', 'valuation'],
      funnelStage: 'tofu',
      tool: { labelEn: 'Net Calculator', labelEs: 'Calculadora de Neto' },
    },
    {
      step: 2,
      labelEn: 'Compare',
      labelEs: 'Comparar',
      descEn: 'Cash offer vs. traditional — what fits your situation',
      descEs: 'Efectivo vs. tradicional — qué se adapta a ti',
      categories: ['cash', 'selling'],
      funnelStage: 'mofu',
    },
    {
      step: 3,
      labelEn: 'Prepare',
      labelEs: 'Prepararte',
      descEn: 'Price right, prep smart, avoid costly mistakes',
      descEs: 'Precio correcto, preparación inteligente',
      categories: ['selling'],
      funnelStage: null,
      tool: { labelEn: 'Seller Readiness', labelEs: 'Preparación de Vendedor' },
    },
    {
      step: 4,
      labelEn: 'Connect',
      labelEs: 'Conectar',
      descEn: 'Talk with Kasandra — your path is clear',
      descEs: 'Habla con Kasandra — tu camino está claro',
      categories: [],
      funnelStage: 'bofu',
      tool: { labelEn: 'Book Consultation', labelEs: 'Agendar Consulta' },
    },
  ],
  cash: [
    {
      step: 1,
      labelEn: 'Understand',
      labelEs: 'Entender',
      descEn: 'How cash offers work and what to watch out for',
      descEs: 'Cómo funcionan las ofertas en efectivo',
      categories: ['cash'],
      funnelStage: 'tofu',
    },
    {
      step: 2,
      labelEn: 'Compare',
      labelEs: 'Comparar',
      descEn: 'Run the numbers — cash vs. traditional net',
      descEs: 'Calcula los números — efectivo vs. tradicional',
      categories: ['cash', 'valuation'],
      funnelStage: 'mofu',
      tool: { labelEn: 'Net Calculator', labelEs: 'Calculadora de Neto' },
    },
    {
      step: 3,
      labelEn: 'Protect',
      labelEs: 'Protegerte',
      descEn: 'Know your rights and what the contract means',
      descEs: 'Conoce tus derechos y qué significa el contrato',
      categories: ['selling', 'cash'],
      funnelStage: null,
    },
    {
      step: 4,
      labelEn: 'Decide',
      labelEs: 'Decidir',
      descEn: 'Get a real cash offer evaluated by Kasandra',
      descEs: 'Obtén una oferta real evaluada por Kasandra',
      categories: [],
      funnelStage: 'bofu',
      tool: { labelEn: 'Get My Offer Reviewed', labelEs: 'Revisar Mi Oferta' },
    },
  ],
  buy: [
    {
      step: 1,
      labelEn: 'Get Ready',
      labelEs: 'Prepararte',
      descEn: 'Pre-approval, budgets, and what to expect',
      descEs: 'Pre-aprobación, presupuesto y qué esperar',
      categories: ['buying'],
      funnelStage: 'tofu',
      tool: { labelEn: 'Buyer Readiness', labelEs: 'Preparación de Comprador' },
    },
    {
      step: 2,
      labelEn: 'Explore',
      labelEs: 'Explorar',
      descEn: 'Neighborhoods, market conditions, loan types',
      descEs: 'Vecindarios, mercado y tipos de préstamo',
      categories: ['buying'],
      funnelStage: 'mofu',
    },
    {
      step: 3,
      labelEn: 'Shop',
      labelEs: 'Buscar',
      descEn: 'Make offers, negotiate, protect yourself',
      descEs: 'Hacer ofertas, negociar, protegerte',
      categories: ['buying'],
      funnelStage: null,
    },
    {
      step: 4,
      labelEn: 'Connect',
      labelEs: 'Conectar',
      descEn: 'Ready to see homes? Kasandra will guide you',
      descEs: '¿Listo para ver casas? Kasandra te guiará',
      categories: [],
      funnelStage: 'bofu',
      tool: { labelEn: 'Book a Buyer Consult', labelEs: 'Agendar Consulta' },
    },
  ],
};

/** Get the 1-2 most relevant guide titles for a step */
function getStepGuides(
  step: JourneyStep,
  intent: DecisionLaneIntent
): Array<{ titleEn: string; titleEs: string }> {
  const allGuides = getLiveGuides().filter(g => g.tier !== 3);

  const matches = allGuides.filter(g => {
    const inCategory = step.categories.includes(g.category);
    if (!inCategory) return false;
    if (step.funnelStage && g.funnelStage !== step.funnelStage) return false;
    return true;
  });

  // Sort by tier (1 first) then sortOrder
  const sorted = matches.sort((a, b) =>
    a.tier !== b.tier ? a.tier - b.tier : a.sortOrder - b.sortOrder
  );

  return sorted.slice(0, 2).map(g => ({ titleEn: g.labelEn, titleEs: g.labelEs }));
}

export function IntentJourneyMap({
  intent,
  currentStep,
  onStepClick,
  className,
}: IntentJourneyMapProps) {
  const { t } = useLanguage();
  const steps = JOURNEY_MAPS[intent];

  return (
    <section className={cn('bg-white py-8 border-b border-cc-sand-dark', className)}>
      <div className='container mx-auto px-4'>
        <p className='text-center text-xs font-medium text-cc-slate/60 uppercase tracking-wider mb-6'>
          {t('Your path forward', 'Tu camino a seguir')}
        </p>

        {/* Desktop: horizontal steps */}
        <div className='hidden md:flex items-start gap-0 max-w-4xl mx-auto'>
          {steps.map((step, idx) => {
            const isCompleted = step.step < currentStep;
            const isActive = step.step === currentStep;
            const isFuture = step.step > currentStep;
            const guides = getStepGuides(step, intent);

            return (
              <div key={step.step} className='flex items-start flex-1'>
                {/* Step card */}
                <button
                  onClick={() => onStepClick?.(step.step)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-center',
                    isActive
                      ? 'border-cc-gold bg-cc-gold/5 shadow-soft'
                      : isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-cc-sand-dark/50 bg-white hover:border-cc-sand-dark',
                    onStepClick ? 'cursor-pointer' : 'cursor-default'
                  )}
                >
                  {/* Step number + icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      isActive
                        ? 'bg-cc-gold text-cc-navy'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-cc-sand text-cc-slate/60'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className='w-5 h-5' />
                    ) : (
                      <span className='text-sm font-bold'>{step.step}</span>
                    )}
                  </div>

                  {/* Label */}
                  <div>
                    <p
                      className={cn(
                        'font-semibold text-sm',
                        isActive ? 'text-cc-navy' : isCompleted ? 'text-emerald-700' : 'text-cc-slate'
                      )}
                    >
                      {t(step.labelEn, step.labelEs)}
                    </p>
                    <p className='text-xs text-cc-slate/70 mt-0.5 leading-tight'>
                      {t(step.descEn, step.descEs)}
                    </p>
                  </div>

                  {/* Guide pills */}
                  {guides.length > 0 && (
                    <div className='flex flex-col gap-1 w-full mt-1'>
                      {guides.map((g, i) => (
                        <span
                          key={i}
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full text-left truncate',
                            isActive
                              ? 'bg-cc-gold/15 text-cc-navy/80'
                              : isCompleted
                              ? 'bg-emerald-100/60 text-emerald-700/80'
                              : 'bg-cc-sand text-cc-slate/60'
                          )}
                        >
                          {t(g.titleEn, g.titleEs)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tool pill */}
                  {step.tool && (
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full border w-full text-center',
                        isActive
                          ? 'border-cc-gold/40 text-cc-gold bg-cc-gold/5'
                          : isFuture
                          ? 'border-cc-sand-dark/50 text-cc-slate/50'
                          : 'border-emerald-200 text-emerald-600'
                      )}
                    >
                      {t(step.tool.labelEn, step.tool.labelEs)}
                    </span>
                  )}
                </button>

                {/* Connector arrow */}
                {idx < steps.length - 1 && (
                  <div className='flex items-start pt-6 px-1 flex-shrink-0'>
                    <ArrowRight
                      className={cn(
                        'w-4 h-4',
                        currentStep > idx + 1 ? 'text-emerald-400' : 'text-cc-sand-dark'
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: vertical stepper */}
        <div className='md:hidden max-w-sm mx-auto space-y-3'>
          {steps.map((step) => {
            const isCompleted = step.step < currentStep;
            const isActive = step.step === currentStep;
            const guides = getStepGuides(step, intent);

            return (
              <div
                key={step.step}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                  isActive
                    ? 'border-cc-gold bg-cc-gold/5'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-cc-sand-dark/30 opacity-70'
                )}
              >
                {/* Step icon */}
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    isActive
                      ? 'bg-cc-gold text-cc-navy'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-cc-sand text-cc-slate/50'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className='w-4 h-4' />
                  ) : (
                    <span className='text-xs font-bold'>{step.step}</span>
                  )}
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <p
                    className={cn(
                      'font-semibold text-sm',
                      isActive ? 'text-cc-navy' : isCompleted ? 'text-emerald-700' : 'text-cc-slate'
                    )}
                  >
                    {t(step.labelEn, step.labelEs)}
                  </p>
                  {isActive && (
                    <>
                      <p className='text-xs text-cc-slate/70 mt-0.5'>
                        {t(step.descEn, step.descEs)}
                      </p>
                      {guides.length > 0 && (
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {guides.map((g, i) => (
                            <span
                              key={i}
                              className='text-xs px-2 py-0.5 rounded-full bg-cc-gold/15 text-cc-navy/80'
                            >
                              {t(g.titleEn, g.titleEs)}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
