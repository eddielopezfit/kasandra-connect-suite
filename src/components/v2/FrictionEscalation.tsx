/**
 * FrictionEscalation — surfaces a stronger CTA when frictionScore is high.
 * Appears as a calm but assertive banner for visitors showing decision paralysis.
 */

import { Link } from 'react-router-dom';
import { Calendar, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useVIP } from '@/hooks/useVIP';
import { logEvent } from '@/lib/analytics/logEvent';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback } from 'react';

interface FrictionEscalationProps {
  /** Minimum friction score to show this component (default 50) */
  threshold?: number;
  className?: string;
}

export default function FrictionEscalation({
  threshold = 50,
  className = '',
}: FrictionEscalationProps) {
  const { language } = useLanguage();
  const { openChat } = useSelenaChat();
  const { frictionScore, bookingReadiness, vip } = useVIP({ localOnly: true });
  const isEs = language === 'es';

  // Only show when friction is above threshold and user hasn't booked
  if (frictionScore < threshold || vip.journey.hasBooked) return null;

  const handleBookClick = useCallback(() => {
    logEvent('friction_escalation_clicked' as any, {
      friction_score: frictionScore,
      booking_readiness: bookingReadiness,
      action: 'book',
    });
  }, [frictionScore, bookingReadiness]);

  const handleChatClick = useCallback(() => {
    logEvent('friction_escalation_clicked' as any, {
      friction_score: frictionScore,
      booking_readiness: bookingReadiness,
      action: 'chat',
    });
    openChat({
      source: 'predictive_guidance',
      prefillMessage: isEs
        ? 'Quiero hablar sobre mis opciones'
        : 'I want to talk about my options',
    });
  }, [frictionScore, bookingReadiness, openChat, isEs]);

  const isOverdue = bookingReadiness === 'overdue';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl border ${isOverdue ? 'border-cc-gold/40 bg-cc-gold/5' : 'border-cc-navy/10 bg-white'} shadow-sm ${className}`}
      >
        <div className="p-5 sm:p-6">
          <p className="text-sm font-semibold text-cc-navy mb-1">
            {isOverdue
              ? isEs
                ? 'Ya has investigado bastante — una conversación rápida puede aclarar todo.'
                : "You've done the research — a quick conversation can clarify everything."
              : isEs
                ? '¿Necesitas ayuda para decidir? Una llamada de 15 minutos puede ayudar.'
                : 'Need help deciding? A 15-minute call can help.'}
          </p>
          <p className="text-xs text-cc-charcoal/50 mb-4">
            {isEs
              ? 'Sin presión. Solo claridad sobre tus opciones.'
              : 'No pressure. Just clarity on your options.'}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/book"
              onClick={handleBookClick}
              className="inline-flex items-center gap-2 bg-cc-gold hover:bg-cc-gold/90 text-cc-navy font-semibold rounded-full px-5 py-2.5 text-sm transition-all active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              {isEs ? 'Agenda una llamada' : 'Schedule a call'}
            </Link>
            <button
              onClick={handleChatClick}
              className="inline-flex items-center gap-2 border border-cc-navy/15 text-cc-navy/70 hover:text-cc-navy font-medium rounded-full px-4 py-2.5 text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {isEs ? 'Hablar con Selena' : 'Talk to Selena'}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
