/**
 * RelatedGuides — UX-06
 *
 * Shows 2–3 related guides at the bottom of each guide detail page.
 * Sourced from the registry entry's `destinations.relatedGuideIds` array,
 * filtered to guides that share the same category — ensuring topical relevance.
 *
 * Keeps users inside the hub by surfacing the logical next read.
 */

import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getGuideById, GUIDE_REGISTRY, type GuideCategory } from "@/lib/guides/guideRegistry";

interface RelatedGuidesProps {
  currentGuideId: string;
  currentCategory: GuideCategory;
  /** Max guides to show. Defaults to 3. */
  maxGuides?: number;
}

export function RelatedGuides({
  currentGuideId,
  currentCategory,
  maxGuides = 3,
}: RelatedGuidesProps) {
  const { t, language } = useLanguage();

  const currentEntry = getGuideById(currentGuideId);
  if (!currentEntry) return null;

  // Step 1: Prefer relatedGuideIds from registry destinations
  const relatedIds = currentEntry.destinations?.relatedGuideIds ?? [];

  // Step 2: Resolve each ID → registry entry, filter to same category + live status
  let relatedEntries = relatedIds
    .map((id) => getGuideById(id))
    .filter(
      (entry): entry is NonNullable<typeof entry> =>
        !!entry &&
        entry.id !== currentGuideId &&
        entry.status === 'live' &&
        entry.category === currentCategory
    )
    .slice(0, maxGuides);

  // Step 3: Fallback — if we don't have enough from relatedGuideIds,
  // fill from the full registry (same category, live, not current)
  if (relatedEntries.length < 2) {
    const fallback = GUIDE_REGISTRY.filter(
      (entry) =>
        entry.id !== currentGuideId &&
        entry.status === 'live' &&
        entry.category === currentCategory &&
        !relatedEntries.some((r) => r.id === entry.id)
    )
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, maxGuides - relatedEntries.length);

    relatedEntries = [...relatedEntries, ...fallback];
  }

  // Step 4: Cross-category fallback — if still under 2, pull from any live guides
  if (relatedEntries.length < 2) {
    const crossCategory = GUIDE_REGISTRY.filter(
      (entry) =>
        entry.id !== currentGuideId &&
        entry.status === 'live' &&
        !relatedEntries.some((r) => r.id === entry.id)
    )
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, maxGuides - relatedEntries.length);

    relatedEntries = [...relatedEntries, ...crossCategory];
  }

  if (relatedEntries.length === 0) return null;

  const headingEn = "Keep Reading";
  const headingEs = "Sigue Leyendo";
  const subheadEn = "Guides that go well with this one";
  const subheadEs = "Guías que complementan esta lectura";

  return (
    <section className="bg-cc-sand border-t border-cc-sand-dark/40 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="mb-8">
            <h3 className="font-serif text-2xl text-cc-navy mb-1">
              {t(headingEn, headingEs)}
            </h3>
            <p className="text-sm text-cc-charcoal/60">
              {t(subheadEn, subheadEs)}
            </p>
          </div>

          {/* Guide Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedEntries.map((entry) => {
              const title = language === 'es' ? entry.titleEs : entry.titleEn;
              const description =
                language === 'es' ? entry.descriptionEs : entry.descriptionEn;
              const readTime =
                language === 'es' ? entry.readTimeEs : entry.readTime;

              return (
                <Link
                  key={entry.id}
                  to={entry.path}
                  className="group flex flex-col justify-between rounded-2xl bg-white border border-cc-sand-dark/30 p-5 hover:border-cc-gold/50 hover:shadow-soft transition-all duration-200"
                  aria-label={title}
                >
                  {/* Category pill */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-cc-gold/80 bg-cc-gold/10 rounded-full px-2.5 py-0.5">
                      {entry.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-base text-cc-navy leading-snug mb-2 group-hover:text-cc-gold transition-colors">
                    {title}
                  </h4>

                  {/* Description — clamped to 2 lines */}
                  <p className="text-sm text-cc-charcoal/70 leading-relaxed line-clamp-2 mb-4">
                    {description}
                  </p>

                  {/* Footer: read time + arrow */}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-cc-sand-dark/20">
                    <span className="flex items-center gap-1.5 text-xs text-cc-charcoal/50">
                      <Clock className="w-3.5 h-3.5" />
                      {readTime}
                    </span>
                    <ArrowRight className="w-4 h-4 text-cc-gold/60 group-hover:text-cc-gold group-hover:translate-x-0.5 transition-all duration-150" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default RelatedGuides;
