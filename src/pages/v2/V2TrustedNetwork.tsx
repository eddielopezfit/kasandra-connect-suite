import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Users, Shield, Star, ArrowRight, Award, Wrench, Search, Home, Briefcase, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TRUSTED_PARTNERS,
  CATEGORY_LABELS,
  getPartnerOfTheWeek,
  type PartnerCategory,
} from "@/data/trustedPartners";
import { FIELD_STORIES } from "@/data/fieldStories";

const CATEGORY_ICONS: Record<PartnerCategory, typeof Users> = {
  lender: Briefcase,
  inspector: Search,
  contractor: Wrench,
  title_escrow: Home,
  other: Star,
};

const ALL_CATEGORIES: PartnerCategory[] = ['lender', 'inspector', 'contractor', 'title_escrow', 'other'];

const V2TrustedNetworkContent = () => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<PartnerCategory | 'all'>('all');
  const spotlight = getPartnerOfTheWeek();

  useDocumentHead({
    titleEn: "Kasandra's Trusted Network | Contractors, Lenders & Inspectors — Tucson",
    titleEs: "Red de Confianza de Kasandra | Contratistas, Prestamistas e Inspectores — Tucson",
    descriptionEn:
      "Kasandra's personally vetted network of Tucson professionals — lenders, inspectors, contractors, and more. Only people she's actually worked with.",
    descriptionEs:
      "La red personalmente verificada de Kasandra — prestamistas, inspectores, contratistas y más. Solo personas con las que ha trabajado.",
  });

  const filteredPartners = activeCategory === 'all'
    ? TRUSTED_PARTNERS
    : TRUSTED_PARTNERS.filter(p => p.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative bg-cc-navy pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cc-navy via-cc-navy-dark to-cc-navy opacity-95" />
        <div className="container mx-auto px-4 relative z-10 max-w-3xl">
          <Users className="w-10 h-10 text-cc-gold mb-4" />
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t("Kasandra's Trusted Network", "La Red de Confianza de Kasandra")}
          </h1>
          <p className="text-lg text-white/80 leading-relaxed">
            {t(
              "I only recommend people I've personally worked with. No paid placements, no sponsorships — just professionals I trust with my clients.",
              "Solo recomiendo personas con las que he trabajado personalmente. Sin colocaciones pagadas, sin patrocinios — solo profesionales en los que confío para mis clientes."
            )}
          </p>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-cc-ivory py-8 border-b border-cc-sand-dark/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-cc-charcoal/70">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cc-gold" />
              {t("Personally vetted", "Verificados personalmente")}
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-cc-gold" />
              {t("Worked with directly", "Trabajo directo")}
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cc-gold" />
              {t("Bilingual service available", "Servicio bilingüe disponible")}
            </span>
          </div>
        </div>
      </section>

      {/* Partner of the Week Spotlight */}
      {spotlight && (
        <section className="bg-cc-sand py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-cc-gold" />
              <h2 className="font-serif text-2xl font-bold text-cc-navy">
                {t("Partner Spotlight", "Socio Destacado")}
              </h2>
            </div>
            <Card className="border-2 border-cc-gold/40 bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-cc-gold/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-cc-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-serif text-xl font-bold text-cc-navy">{spotlight.name}</h3>
                      {spotlight.isSponsor && (
                        <span className="text-xs bg-cc-gold/10 text-cc-gold-dark px-2.5 py-0.5 rounded-full font-medium">
                          {t("Hub Sponsor", "Patrocinador")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-cc-gold font-medium mt-1">
                      {language === "es" ? spotlight.company.es : spotlight.company.en}
                      {' · '}
                      {language === "es" ? spotlight.specialty.es : spotlight.specialty.en}
                    </p>
                    <p className="text-cc-charcoal/80 mt-4 leading-relaxed italic">
                      "{language === "es" ? spotlight.endorsement.es : spotlight.endorsement.en}"
                    </p>
                    {spotlight.yearsWorking && (
                      <p className="text-xs text-cc-charcoal/50 mt-3">
                        {t(`Working together: ${spotlight.yearsWorking}`, `Trabajando juntos: ${spotlight.yearsWorking}`)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Category Filter + Partners Grid */}
      <section className="bg-cc-sand py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-serif text-3xl font-bold text-cc-navy mb-8 text-center">
            {t("The Network", "La Red")}
          </h2>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === 'all'
                  ? 'bg-cc-navy text-white'
                  : 'bg-white text-cc-charcoal/70 hover:bg-cc-navy/10'
              }`}
            >
              {t("All", "Todos")}
            </button>
            {ALL_CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              const hasPartners = TRUSTED_PARTNERS.some(p => p.category === cat);
              if (!hasPartners) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-cc-navy text-white'
                      : 'bg-white text-cc-charcoal/70 hover:bg-cc-navy/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {language === 'es' ? CATEGORY_LABELS[cat].es : CATEGORY_LABELS[cat].en}
                </button>
              );
            })}
          </div>

          {/* Partner Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPartners.map(partner => {
              const Icon = CATEGORY_ICONS[partner.category];
              return (
                <Card key={partner.id} className={`bg-white shadow-soft border ${partner.isPlaceholder ? 'border-cc-sand-dark/20 opacity-75' : 'border-cc-sand-dark/20'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cc-navy/5 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-cc-navy/60" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif text-lg font-bold text-cc-navy">{partner.name}</h3>
                          {partner.isSponsor && (
                            <span className="text-[10px] bg-cc-gold/10 text-cc-gold-dark px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                              {t("Sponsor", "Patrocinador")}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-cc-gold font-medium mt-0.5">
                          {language === "es" ? partner.company.es : partner.company.en}
                        </p>
                        <p className="text-xs text-cc-charcoal/50 mt-1">
                          {language === "es" ? partner.specialty.es : partner.specialty.en}
                        </p>
                        <p className="text-sm text-cc-charcoal/70 leading-relaxed mt-3 italic">
                          "{language === "es" ? partner.endorsement.es : partner.endorsement.en}"
                        </p>
                        {partner.yearsWorking && (
                          <p className="text-xs text-cc-charcoal/40 mt-3">
                            {t(`Working together: ${partner.yearsWorking}`, `Trabajando juntos: ${partner.yearsWorking}`)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* From the Field — Real Stories */}
      <section className="bg-cc-ivory py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-3xl font-bold text-cc-navy mb-3 text-center">
            {t("From the Field", "Desde el Campo")}
          </h2>
          <p className="text-center text-cc-charcoal/60 mb-10 max-w-xl mx-auto">
            {t(
              "Real situations where having the right partner made all the difference.",
              "Situaciones reales donde tener el socio correcto hizo toda la diferencia."
            )}
          </p>

          <div className="space-y-6">
            {FIELD_STORIES.map(story => (
              <Card key={story.id} className="bg-white border-cc-sand-dark/20 shadow-soft overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-cc-navy/5 text-cc-navy/70 px-2.5 py-1 rounded-full font-medium">
                      {language === 'es' ? CATEGORY_LABELS[story.category].es : CATEGORY_LABELS[story.category].en}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-cc-navy mb-3">
                    {language === 'es' ? story.title.es : story.title.en}
                  </h3>
                  <p className="text-cc-charcoal/70 leading-relaxed mb-3">
                    {language === 'es' ? story.situation.es : story.situation.en}
                  </p>
                  <p className="text-cc-charcoal/80 leading-relaxed font-medium mb-4">
                    {language === 'es' ? story.outcome.es : story.outcome.en}
                  </p>
                  <div className="border-t border-cc-sand-dark/20 pt-4">
                    <p className="text-sm text-cc-gold-dark italic">
                      {language === 'es' ? story.lesson.es : story.lesson.en}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cc-sand py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <p className="text-cc-charcoal/60 text-sm mb-2">
            {t(
              "This page is growing. Kasandra is personally vetting each recommendation.",
              "Esta página está creciendo. Kasandra está verificando personalmente cada recomendación."
            )}
          </p>
          <p className="font-serif text-xl text-cc-navy font-bold mb-6">
            {t(
              "Know someone Kasandra should meet?",
              "¿Conoces a alguien que Kasandra debería conocer?"
            )}
          </p>
          <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold">
            <Link to="/contact">
              {t("Suggest a Partner", "Sugerir un Socio")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
};

const V2TrustedNetwork = () => (
  <V2Layout>
    <V2TrustedNetworkContent />
  </V2Layout>
);

export default V2TrustedNetwork;
