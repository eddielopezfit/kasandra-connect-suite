import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Users, Shield, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface TrustedPartner {
  name: string;
  specialty: { en: string; es: string };
  description: { en: string; es: string };
  yearsWorked: string;
}

const TRUSTED_PARTNERS: TrustedPartner[] = [
  {
    name: "Coming Soon",
    specialty: { en: "Preferred Lender", es: "Prestamista Preferido" },
    description: {
      en: "Kasandra is building her verified partner list. Check back soon.",
      es: "Kasandra está construyendo su lista de socios verificados. Vuelve pronto.",
    },
    yearsWorked: "",
  },
];

const V2TrustedNetworkContent = () => {
  const { t, language } = useLanguage();

  useDocumentHead({
    titleEn: "Kasandra's Trusted Network | Contractors, Lenders & Inspectors — Tucson",
    titleEs: "Red de Confianza de Kasandra | Contratistas, Prestamistas e Inspectores — Tucson",
    descriptionEn:
      "Kasandra's personally vetted network of Tucson professionals — lenders, inspectors, contractors, and more. Only people she's actually worked with.",
    descriptionEs:
      "La red personalmente verificada de Kasandra — prestamistas, inspectores, contratistas y más. Solo personas con las que ha trabajado.",
  });

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

      {/* Partners Grid */}
      <section className="bg-cc-sand py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {TRUSTED_PARTNERS.map((partner, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 shadow-soft border border-cc-sand-dark/20"
              >
                <h3 className="font-serif text-xl font-bold text-cc-navy mb-1">{partner.name}</h3>
                <p className="text-sm text-cc-gold font-medium mb-3">
                  {language === "es" ? partner.specialty.es : partner.specialty.en}
                </p>
                <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                  {language === "es" ? partner.description.es : partner.description.en}
                </p>
                {partner.yearsWorked && (
                  <p className="text-xs text-cc-charcoal/50 mt-3">
                    {t(
                      `Working together: ${partner.yearsWorked}`,
                      `Trabajando juntos: ${partner.yearsWorked}`
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-cc-charcoal/60 text-sm mb-4">
              {t(
                "This page is growing. Kasandra is personally vetting each recommendation.",
                "Esta página está creciendo. Kasandra está verificando personalmente cada recomendación."
              )}
            </p>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/contact">
                {t("Suggest a Partner", "Sugerir un Socio")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

const V2TrustedNetwork = () => (
  <V2Layout suppressCTA>
    <V2TrustedNetworkContent />
  </V2Layout>
);

export default V2TrustedNetwork;
