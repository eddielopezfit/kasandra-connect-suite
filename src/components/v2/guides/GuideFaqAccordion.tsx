/**
 * GuideFaqAccordion
 * 
 * Renders FAQ section as an accessible accordion.
 * Data in faqItems is also injected into FAQPage JSON-LD schema
 * by V2GuideDetail — making every Q&A eligible for:
 *  - Google AI Overviews
 *  - People Also Ask (PAA) boxes
 *  - Perplexity / ChatGPT answer extraction
 *  - Traditional featured snippets
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FaqItem } from '@/data/guides/types';

interface GuideFaqAccordionProps {
  items: FaqItem[];
  /** Section intro text shown above the accordion (optional) */
  intro?: string;
  introEs?: string;
}

export default function GuideFaqAccordion({ items, intro, introEs }: GuideFaqAccordionProps) {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="space-y-4">
      {(intro || introEs) && (
        <p className="text-cc-charcoal leading-relaxed text-lg mb-6">
          {t(intro ?? '', introEs ?? '')}
        </p>
      )}

      <div
        className="divide-y divide-cc-sand-dark/30 rounded-xl border border-cc-sand-dark/30 overflow-hidden"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        {items.map((item, i) => {
          const q = language === 'es' ? item.questionEs : item.question;
          const a = language === 'es' ? item.answerEs : item.answer;
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <button
                onClick={() => toggle(i)}
                aria-expanded={isOpen}
                className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors
                  ${isOpen ? 'bg-cc-gold/8' : 'bg-white hover:bg-cc-sand/50'}`}
              >
                <h3
                  itemProp="name"
                  className="font-serif text-base md:text-lg font-semibold text-cc-navy leading-snug"
                >
                  {q}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-cc-gold flex-shrink-0 transition-transform duration-200
                    ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isOpen && (
                <div
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                  className="px-6 pb-6 pt-2 bg-white border-t border-cc-sand-dark/20"
                >
                  <p
                    itemProp="text"
                    className="text-cc-charcoal leading-relaxed text-base whitespace-pre-line"
                  >
                    {a}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
