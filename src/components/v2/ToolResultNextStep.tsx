/**
 * ToolResultNextStep — Post-tool-completion recommendation card
 * Shows the user what to do next after completing a tool/quiz.
 * Uses useJourneyProgress to determine the contextually correct next action.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { Button } from '@/components/ui/button';

interface ToolResultNextStepProps {
  /** Tool that was just completed — used for contextual copy */
  completedToolLabel: string;
  completedToolLabelEs?: string;
}

export default function ToolResultNextStep({ completedToolLabel, completedToolLabelEs }: ToolResultNextStepProps) {
  const progress = useJourneyProgress();
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const isEs = language === 'es';

  const next = progress.nextRecommendedAction;
  const isChat = next.destination.startsWith('selena:');

  const toolLabel = isEs ? (completedToolLabelEs || completedToolLabel) : completedToolLabel;

  return (
    <div className="border border-accent/20 bg-card rounded-xl shadow-sm p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-accent">
            {isEs
              ? `✓ ${toolLabel} completado`
              : `✓ ${toolLabel} complete`}
          </p>
          <p className="text-sm text-muted-foreground">
            {isEs
              ? 'Basado en tu progreso, aquí está tu próximo paso recomendado:'
              : "Based on your progress, here's your recommended next step:"}
          </p>
          {isChat ? (
            <Button
              size="sm"
              variant="accent"
              className="gap-1.5 mt-1"
              onClick={() => {
                const intent = progress.intent || 'explore';
                openChat({ source: 'tool_result_next_step', intent });
              }}
            >
              {isEs ? next.labelEs : next.labelEn}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" variant="accent" className="gap-1.5 mt-1" asChild>
              <Link to={next.destination}>
                {isEs ? next.labelEs : next.labelEn}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
