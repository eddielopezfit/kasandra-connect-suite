import { useLanguage } from "@/contexts/LanguageContext";
import { Gem, Users, Award, Radio, Star, Trophy } from "lucide-react";
import diaperBankLogo from "@/assets/arizona-diaper-bank-logo.jpg";

interface BentoCell {
  icon: React.ElementType;
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
  span?: "large" | "normal";
  image?: string;
  imageAlt?: string;
}

const cells: BentoCell[] = [
  {
    icon: Gem,
    titleEn: "Certified Global Luxury Property Specialist",
    titleEs: "Especialista Certificada en Propiedades de Lujo Global",
    descEn: "Elevated expertise for premium properties and discerning clients across Tucson's finest corridors.",
    descEs: "Experiencia elevada para propiedades premium y clientes exigentes en los mejores corredores de Tucson.",
    span: "large",
  },
  {
    icon: Users,
    titleEn: "Arizona Diaper Bank",
    titleEs: "Arizona Diaper Bank",
    descEn: "Vice President, Governing Board",
    descEs: "Vicepresidenta, Junta Directiva",
    image: diaperBankLogo,
    imageAlt: "Arizona Diaper Bank logo",
  },
  {
    icon: Award,
    titleEn: "Greater Tucson Leadership",
    titleEs: "Greater Tucson Leadership",
    descEn: "Class of 2026",
    descEs: "Promoción 2026",
  },
  {
    icon: Radio,
    titleEn: "Urbana 92.5 FM",
    titleEs: "Urbana 92.5 FM",
    descEn: "\"Lifting You Up: Todo empieza en casita\" — Every Saturday 9:30 AM",
    descEs: "\"Lifting You Up: Todo empieza en casita\" — Cada sábado 9:30 AM",
  },
  {
    icon: Trophy,
    titleEn: "Rising Stars & Premios OZEA",
    titleEs: "Rising Stars y Premios OZEA",
    descEn: "Tucson Real Producers Rising Stars (Oct 2025) · Premios OZEA Award (Oct 2025)",
    descEs: "Tucson Real Producers Rising Stars (Oct 2025) · Premios OZEA Award (Oct 2025)",
  },
  {
    icon: Star,
    titleEn: "Diamond Society & 126+ Reviews",
    titleEs: "Diamond Society y 126+ Reseñas",
    descEn: "Coldwell Banker International Diamond Society (2024) · 126+ five-star reviews on Birdeye",
    descEs: "Coldwell Banker International Diamond Society (2024) · 126+ reseñas de cinco estrellas en Birdeye",
  },
];

export default function CredentialsBentoGrid() {
  const { t } = useLanguage();

  return (
    <section className="bg-cc-ivory py-16 md:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block font-sans text-xs font-semibold uppercase tracking-[0.2em] text-cc-gold">
            {t("Leadership & Credentials", "Liderazgo y Credenciales")}
          </span>
          <h2 className="font-serif text-3xl font-bold text-cc-navy md:text-4xl">
            {t("Built on Trust, Service & Expertise", "Construido con Confianza, Servicio y Experiencia")}
          </h2>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cells.map((cell, i) => {
            const isLarge = cell.span === "large";
            return (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 ${
                  isLarge
                    ? "sm:col-span-2 border-2 border-cc-gold bg-cc-navy text-white"
                    : "border border-cc-sand-dark/20 bg-white hover:shadow-[0_0_20px_rgba(225,181,74,0.12)]"
                }`}
              >
                {/* Gold shimmer on hover for large cell */}
                {isLarge && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cc-gold/10 via-transparent to-cc-gold/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                )}

                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
                      isLarge ? "bg-cc-gold/20" : "bg-cc-navy/5"
                    }`}
                  >
                    <cell.icon
                      className={`h-6 w-6 ${isLarge ? "text-cc-gold" : "text-cc-gold"}`}
                    />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`font-semibold leading-snug ${
                        isLarge
                          ? "font-serif text-lg text-white md:text-xl"
                          : "text-sm text-cc-navy"
                      }`}
                    >
                      {t(cell.titleEn, cell.titleEs)}
                    </h3>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        isLarge ? "text-white/70" : "text-cc-text-muted"
                      }`}
                    >
                      {t(cell.descEn, cell.descEs)}
                    </p>
                  </div>

                  {/* Optional logo image */}
                  {cell.image && (
                    <img
                      src={cell.image}
                      alt={cell.imageAlt || ""}
                      className="h-12 w-12 flex-shrink-0 rounded-lg object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
