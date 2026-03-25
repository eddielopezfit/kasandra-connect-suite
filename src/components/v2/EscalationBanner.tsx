/**
 * EscalationBanner — Proactive booking nudge based on behavioral signals.
 * Appears below navigation. Dismissible. Shows max once per session.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { useEscalationTrigger, dismissEscalation } from '@/hooks/useEscalationTrigger';
import { useLanguage } from '@/contexts/LanguageContext';
import { logEvent } from '@/lib/analytics/logEvent';

export default function EscalationBanner() {
  const escalation = useEscalationTrigger();
  const { language } = useLanguage();
  const isEs = language === 'es';
  const [dismissed, setDismissed] = useState(false);

  if (!escalation.shouldShow || dismissed) return null;

  const handleDismiss = () => {
    dismissEscalation();
    setDismissed(true);
    logEvent('escalation_dismissed', { reason: escalation.reason });
  };

  const handleClick = () => {
    logEvent('escalation_clicked', { reason: escalation.reason });
  };

  return (
    <div className="bg-gradient-to-r from-cc-gold/15 to-cc-gold/5 border-b border-cc-gold/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles className="w-4 h-4 text-cc-gold flex-shrink-0" />
            <p className="text-sm text-cc-navy truncate sm:whitespace-normal">
              {isEs ? escalation.messageEs : escalation.messageEn}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/book"
              onClick={handleClick}
              className="inline-flex items-center gap-1.5 bg-cc-gold hover:bg-cc-gold-dark text-cc-navy text-sm font-semibold rounded-full px-4 py-1.5 transition-colors shadow-sm"
            >
              {isEs ? escalation.ctaLabelEs : escalation.ctaLabelEn}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-cc-navy/10 transition-colors text-cc-navy/50 hover:text-cc-navy"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
