/**
 * JourneyBreadcrumb — Surfaces accumulated journey state to returning users
 * Invisible to first-time visitors. Renders completed milestones + next action.
 */

import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { Button } from '@/components/ui/button';

/** Convert tool ID to human-readable label */
function formatToolName(toolId: string): string {
  return toolId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface CompletedItem {
  labelEn: string;
  labelEs: string;
}

export default function JourneyBreadcrumb() {
  const progress = useJourneyProgress();
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const isEs = language === 'es';

  if (!progress.isReturningUser) return null;

  // Build completed items list
  const items: CompletedItem[] = [];

  for (const toolId of progress.toolsCompleted) {
    const name = formatToolName(toolId);
    const suffix =
      (toolId.includes('readiness') || toolId === 'buyer_readiness' || toolId === 'seller_readiness' || toolId === 'cash_readiness')
      && progress.hasReadinessScore
        ? ` (Score: ${progress.readinessScore})`
        : '';
    items.push({ labelEn: `${name}${suffix}`, labelEs: `${name}${suffix}` });
  }

  if (progress.guideCount > 0) {
    items.push({
      labelEn: `${progress.guideCount} Guide${progress.guideCount > 1 ? 's' : ''} Read`,
      labelEs: `${progress.guideCount} Guía${progress.guideCount > 1 ? 's' : ''} Leída${progress.guideCount > 1 ? 's' : ''}`,
    });
  }

  if (progress.hasExploredNeighborhood && progress.lastNeighborhoodZip) {
    items.push({
      labelEn: `Explored ${progress.lastNeighborhoodZip}`,
      labelEs: `Exploró ${progress.lastNeighborhoodZip}`,
    });
  }

  if (progress.hasCalculatorResults && progress.calculatorAdvantage) {
    const advLabel = progress.calculatorAdvantage === 'cash' ? 'Cash Advantage' : progress.calculatorAdvantage === 'traditional' ? 'Traditional Advantage' : 'Consult Recommended';
    items.push({ labelEn: advLabel, labelEs: advLabel });
  }

  if (progress.hasSellerDecision && progress.sellerDecisionPath) {
    const pathLabel = formatToolName(progress.sellerDecisionPath);
    items.push({
      labelEn: `Decision: ${pathLabel}`,
      labelEs: `Decisión: ${pathLabel}`,
    });
  }

  if (items.length === 0) return null;

  const next = progress.nextRecommendedAction;
  const isChat = next.destination.startsWith('selena:');

  return (
    <div className="border border-accent/20 bg-card rounded-xl shadow-sm p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">
          {isEs ? 'Tu Camino Hasta Ahora' : 'Your Journey So Far'}
        </span>
      </div>

      {/* Completed items */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
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
