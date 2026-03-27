/**
 * JourneyBreadcrumb — Surfaces accumulated journey state to returning users
 * Invisible to first-time visitors. Renders insight-driven milestones + next action.
 * All labels are compliant reflections of user actions (KB-0/KB-4 safe).
 */

import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { Button } from '@/components/ui/button';

interface InsightItem {
  labelEn: string;
  labelEs: string;
}

/** Map readiness score to an insight label */
function readinessInsight(score: number): InsightItem {
  if (score >= 70) {
    return {
      labelEn: "You're closer to ready than you think",
      labelEs: 'Estás más cerca de lo que crees',
    };
  }
  if (score >= 50) {
    return {
      labelEn: "You're making progress — keep going",
      labelEs: 'Vas avanzando — sigue así',
    };
  }
  return {
    labelEn: "A few things to sort out first — that's normal",
    labelEs: 'Algunas cosas por resolver — es normal',
  };
}

/** Map guide count to an insight label */
function guideInsight(count: number): InsightItem | null {
  if (count <= 0) return null;
  if (count <= 2) {
    return {
      labelEn: "You're getting oriented",
      labelEs: 'Te estás orientando',
    };
  }
  if (count <= 5) {
    return {
      labelEn: "You're building a solid picture",
      labelEs: 'Estás construyendo una imagen clara',
    };
  }
  return {
    labelEn: "You've done more research than most",
    labelEs: 'Has investigado más que la mayoría',
  };
}

/** Dynamic header based on journey depth */
function headerCopy(depth: string, isEs: boolean): string {
  switch (depth) {
    case 'ready':
      return isEs ? 'Hiciste la tarea — esto es lo que sigue' : "You've done the work — here's what's next";
    case 'engaged':
      return isEs ? 'Cada vez más claro lo que necesitas' : "You're getting clearer on what you need";
    default:
      return isEs ? 'Vas por buen camino' : "You're off to a great start";
  }
}

export default function JourneyBreadcrumb() {
  const progress = useJourneyProgress();
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const isEs = language === 'es';

  if (!progress.isReturningUser) return null;

  // Build insight items
  const items: InsightItem[] = [];

  // Readiness score insight
  if (progress.hasReadinessScore && typeof progress.readinessScore === 'number') {
    items.push(readinessInsight(progress.readinessScore));
  }

  // Seller decision — neutral reflection
  if (progress.hasSellerDecision && progress.sellerDecisionPath) {
    if (progress.sellerDecisionPath.includes('cash')) {
      items.push({
        labelEn: 'You explored the cash offer path',
        labelEs: 'Exploraste la ruta de oferta en efectivo',
      });
    } else if (progress.sellerDecisionPath.includes('traditional') || progress.sellerDecisionPath.includes('listing')) {
      items.push({
        labelEn: 'You explored the traditional listing path',
        labelEs: 'Exploraste la ruta de venta tradicional',
      });
    } else {
      items.push({
        labelEn: 'You reviewed your selling options',
        labelEs: 'Revisaste tus opciones de venta',
      });
    }
  }

  // Calculator — neutral reflection
  if (progress.hasCalculatorResults) {
    items.push({
      labelEn: 'You compared cash vs. traditional numbers',
      labelEs: 'Comparaste números: efectivo vs. tradicional',
    });
  }

  // Neighborhood — neutral reflection
  if (progress.hasExploredNeighborhood) {
    items.push({
      labelEn: "You've started exploring areas",
      labelEs: 'Ya empezaste a explorar áreas',
    });
  }

  // Guide insight (not a raw count)
  const gi = guideInsight(progress.guideCount);
  if (gi) items.push(gi);

  if (items.length === 0) return null;

  const next = progress.nextRecommendedAction;
  const isChat = next.destination.startsWith('selena:');

  return (
    <div className="border border-cc-gold/20 bg-gradient-to-r from-cc-sand to-cc-ivory rounded-xl shadow-sm p-4 sm:p-5">
      {/* Dynamic header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-cc-gold" />
        <span className="text-sm font-semibold text-foreground">
          {headerCopy(progress.journeyDepth, isEs)}
        </span>
      </div>

      {/* Insight items */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-cc-gold shrink-0" />
            <span>{isEs ? item.labelEs : item.labelEn}</span>
          </div>
        ))}
      </div>

      {/* Next step */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {isEs ? 'Tu Próximo Paso' : 'Your Next Step'}
        </span>
        {isChat ? (
          <Button
            size="sm"
            variant="accent"
            className="gap-1.5"
            onClick={() => {
              const intent = progress.intent || 'explore';
              if (next.destination === 'selena:neighborhood') {
                openChat({ source: 'journey_breadcrumb', intent });
              } else {
                openChat({ source: 'journey_breadcrumb' });
              }
            }}
          >
            {isEs ? next.labelEs : next.labelEn}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button size="sm" variant="accent" className="gap-1.5" asChild>
            <Link to={next.destination}>
              {isEs ? next.labelEs : next.labelEn}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
