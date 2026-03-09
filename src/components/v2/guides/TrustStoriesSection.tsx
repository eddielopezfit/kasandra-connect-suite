/**
 * TrustStoriesSection - Phase 3: Stories separated from main grid
 * 
 * Renders Tier 3 story guides in their own section below educational guides.
 * Reduces cognitive load in the main grid while keeping stories accessible.
 */

import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { getCategoryColor } from "@/lib/guides/categoryColors";
import type { Guide } from "@/lib/guides/personalization";

interface TrustStoriesSectionProps {
  stories: Guide[];
  onStoryClick: (guideId: string) => void;
}

const TrustStoriesSection = ({ stories, onStoryClick }: TrustStoriesSectionProps) => {
  const { t } = useLanguage();

  if (stories.length === 0) return null;

  return (
    <section className="bg-cc-sand py-14 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <Heart className="w-5 h-5 text-cc-gold" />
          <h2 className="font-serif text-2xl md:text-3xl text-cc-navy text-center">
            {t("Real Stories, Real People", "Historias Reales, Personas Reales")}
          </h2>
        </div>
        <p className="text-cc-slate text-center mb-8 max-w-lg mx-auto">
          {t(
            "See how others navigated their journey — in their own words.",
            "Mira cómo otros navegaron su camino — en sus propias palabras."
          )}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {stories.map((story) => {
            const colors = getCategoryColor(story.category);
            return (
              <Link
                key={story.id}
                to={`/guides/${story.id}`}
                onClick={() => onStoryClick(story.id)}
                className={cn(
                  "group bg-white rounded-xl p-5 shadow-soft hover:shadow-elevated transition-all duration-300 border border-cc-sand-dark/50 hover:border-cc-gold/30",
                  colors.accent
                )}
              >
                <span className={cn("px-3 py-1 rounded-full text-xs font-medium border inline-block mb-3", colors.subtle)}>
                  {t("Client Story", "Historia de Cliente")}
                </span>
                <h3 className="font-serif text-lg text-cc-charcoal mb-2 group-hover:text-cc-navy transition-colors leading-snug">
                  {t(story.title, story.titleEs)}
                </h3>
                <p className="text-cc-slate text-sm leading-relaxed mb-3 line-clamp-2">
                  {t(story.description, story.descriptionEs)}
                </p>
                <div className="flex items-center text-cc-gold font-medium text-sm group-hover:gap-2 transition-all">
                  {t("Read Story", "Leer Historia")}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustStoriesSection;
