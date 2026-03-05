/**
 * ContinueReadingCard
 * 
 * Netflix-style "Continue Where You Left Off" card.
 * Appears above the guide grid when a user has opened a guide before.
 * Full-width, visually distinct from grid cards.
 * 
 * Uses orientation image from GUIDE_MEDIA_SLOTS if available.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { GUIDE_REGISTRY } from '@/lib/guides/guideRegistry';
import { getGovernedMediaSlots } from '@/lib/guides/guideMediaSlots';

interface ContinueReadingCardProps {
  guideId: string;
  onClick: (guideId: string) => void;
  className?: string;
}

export function ContinueReadingCard({ guideId, onClick, className }: ContinueReadingCardProps) {
  const { t } = useLanguage();

  const entry = GUIDE_REGISTRY.find(g => g.id === guideId);
  if (!entry || entry.status !== 'live') return null;

  // Get orientation image if available
  const slots = getGovernedMediaSlots(guideId);
  const orientationSlot = slots.find(s => s.variant === 'orientation' && s.src);
  const thumbnailSrc = orientationSlot?.src;

  return (
    <section className={cn('bg-cc-ivory py-4 border-b border-cc-sand-dark/50', className)}>
      <div className='container mx-auto px-4'>
        <p className='text-xs font-medium text-cc-slate/60 uppercase tracking-wider mb-3'>
          {t('Continue where you left off', 'Continúa donde lo dejaste')}
        </p>
        <Link
          to={entry.path}
          onClick={() => onClick(guideId)}
          className='group flex items-center gap-4 bg-white rounded-xl border border-cc-sand-dark/50 hover:border-cc-gold/40 hover:shadow-elevated transition-all duration-200 p-4 md:p-5'
        >
          {/* Thumbnail */}
          {thumbnailSrc ? (
            <div className='w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-cc-sand'>
              <img
                src={thumbnailSrc}
                alt={t(entry.titleEn, entry.titleEs)}
                loading='lazy'
                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
              />
            </div>
          ) : (
            <div className='w-16 h-16 md:w-20 md:h-20 rounded-lg flex-shrink-0 bg-cc-navy/10 flex items-center justify-center'>
              <BookOpen className='w-7 h-7 text-cc-navy/40' />
            </div>
          )}

          {/* Text */}
          <div className='flex-1 min-w-0'>
            <h3 className='font-serif text-lg md:text-xl text-cc-charcoal group-hover:text-cc-navy transition-colors truncate'>
              {t(entry.titleEn, entry.titleEs)}
            </h3>
            <p className='text-sm text-cc-slate line-clamp-1 mt-0.5'>
              {t(entry.descriptionEn, entry.descriptionEs)}
            </p>
            <div className='flex items-center gap-3 mt-2'>
              <span className='flex items-center gap-1 text-xs text-cc-slate/60'>
                <Clock className='w-3 h-3' />
                {t(entry.readTime, entry.readTimeEs)}
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className='flex items-center gap-2 text-cc-gold font-medium text-sm flex-shrink-0'>
            <span className='hidden sm:inline'>{t('Continue', 'Continuar')}</span>
            <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
          </div>
        </Link>
      </div>
    </section>
  );
}
