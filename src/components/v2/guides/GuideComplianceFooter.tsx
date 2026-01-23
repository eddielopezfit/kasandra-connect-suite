import { useLanguage } from "@/contexts/LanguageContext";
import { Info } from "lucide-react";

const GuideComplianceFooter = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-cc-sand-dark/50 py-8 border-t border-cc-sand-dark">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-cc-charcoal/50 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                {t(
                  "Educational information only. This guide provides general information about real estate processes in Arizona and is not intended as legal, tax, or financial advice.",
                  "Información educativa únicamente. Esta guía proporciona información general sobre los procesos inmobiliarios en Arizona y no pretende ser asesoramiento legal, fiscal o financiero."
                )}
              </p>
              <p className="text-sm text-cc-charcoal/70 leading-relaxed">
                {t(
                  "For questions about contracts, tax implications, or other professional matters, please consult with appropriately licensed professionals (attorney, CPA, etc.).",
                  "Para preguntas sobre contratos, implicaciones fiscales u otros asuntos profesionales, consulte con profesionales debidamente licenciados (abogado, contador, etc.)."
                )}
              </p>
              <p className="text-xs text-cc-charcoal/50 mt-4">
                {t(
                  "Kasandra Prieto, REALTOR® | Realty Executives Arizona Territory",
                  "Kasandra Prieto, REALTOR® | Realty Executives Arizona Territory"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuideComplianceFooter;
