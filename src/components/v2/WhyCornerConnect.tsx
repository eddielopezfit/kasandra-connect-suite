import { useLanguage } from "@/contexts/LanguageContext";
import { Shield, Award, Users, Globe, CheckCircle } from "lucide-react";

interface TrustPoint {
  icon: React.ReactNode;
  titleEn: string;
  titleEs: string;
  descEn: string;
  descEs: string;
}

const TRUST_POINTS: TrustPoint[] = [
  {
    icon: <Shield className="w-8 h-8 text-cc-gold" />,
    titleEn: "6,000+ Transactions",
    titleEs: "6,000+ Transacciones",
    descEn: "Pima County residential sales since our founding — proven, repeatable results.",
    descEs: "Ventas residenciales en el Condado Pima desde nuestra fundación — resultados probados y consistentes.",
  },
  {
    icon: <Award className="w-8 h-8 text-cc-gold" />,
    titleEn: "Realty Executives Backed",
    titleEs: "Respaldado por Realty Executives",
    descEn: "Part of Realty Executives Arizona Territory — one of Arizona's most trusted brokerages.",
    descEs: "Parte de Realty Executives Arizona Territory — una de las corredurías más confiables de Arizona.",
  },
  {
    icon: <CheckCircle className="w-8 h-8 text-cc-gold" />,
    titleEn: "A+ BBB Rating",
    titleEs: "Calificación A+ del BBB",
    descEn: "Accredited with the Better Business Bureau — verified trust and accountability.",
    descEs: "Acreditado por el Better Business Bureau — confianza y responsabilidad verificadas.",
  },
  {
    icon: <Globe className="w-8 h-8 text-cc-gold" />,
    titleEn: "Multi-Language Team",
    titleEs: "Equipo Multilingüe",
    descEn: "English, Spanish, and beyond — we serve every family in their preferred language.",
    descEs: "Inglés, español y más — servimos a cada familia en su idioma preferido.",
  },
];

const WhyCornerConnect = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 lg:py-20 bg-cc-ivory">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-cc-gold font-semibold text-[13px] tracking-wider uppercase">
            {t("The Brokerage Behind Kasandra", "La Correduría Detrás de Kasandra")}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cc-navy mt-2">
            {t("Why Corner Connect", "Por Qué Corner Connect")}
          </h2>
          <p className="text-cc-charcoal/60 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            {t(
              "When you work with Kasandra, you get the backing of Corner Connect's full infrastructure — 9 years of market leadership in Southern Arizona.",
              "Cuando trabajas con Kasandra, obtienes el respaldo de toda la infraestructura de Corner Connect — 9 años de liderazgo en el mercado del sur de Arizona."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TRUST_POINTS.map((point) => (
            <div
              key={point.titleEn}
              className="flex items-start gap-4 bg-white rounded-xl p-6 border border-cc-sand-dark/20 shadow-sm"
            >
              <div className="flex-shrink-0 mt-1">{point.icon}</div>
              <div>
                <p className="font-semibold text-cc-navy text-base">
                  {t(point.titleEn, point.titleEs)}
                </p>
                <p className="text-sm text-cc-charcoal/60 mt-1 leading-relaxed">
                  {t(point.descEn, point.descEs)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCornerConnect;
