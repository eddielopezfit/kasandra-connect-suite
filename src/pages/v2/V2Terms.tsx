import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { AGENT_NAME, BROKERAGE_LEGAL, AGENT_LICENSE_NUMBER } from "@/lib/brand";

const V2TermsContent = () => {
  const { t } = useLanguage();

  useDocumentHead({
    titleEn: "Terms of Service | Kasandra Prieto REALTOR®",
    titleEs: "Términos de Servicio | Kasandra Prieto REALTOR®",
    descriptionEn: "Terms of Service for kasandraprietorealtor.com",
    descriptionEs: "Términos de Servicio de kasandraprietorealtor.com",
  });

  return (
    <div className="min-h-screen bg-cc-ivory">
      <section className="bg-cc-navy pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-white">
            {t("Terms of Service", "Términos de Servicio")}
          </h1>
          <p className="text-cc-ivory/60 mt-2 text-sm">
            {t("Last updated: April 2026", "Última actualización: Abril 2026")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-neutral">
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-cc-sand-dark/20 space-y-8 text-cc-charcoal">
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Use of This Website</h2>
              <p className="leading-relaxed">This website is operated by {AGENT_NAME}, a licensed REALTOR® with {BROKERAGE_LEGAL} (License #{AGENT_LICENSE_NUMBER}). By using this website, you agree to these terms. The content provided is for informational purposes only and does not constitute legal, financial, or real estate advice.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Selena AI Disclaimer</h2>
              <p className="leading-relaxed">Selena is an AI-powered digital concierge designed to assist with general real estate questions and connect you with Kasandra Prieto. Selena's responses are for informational purposes only. Conversations may be reviewed for quality and compliance. Selena is not a licensed real estate agent and does not provide legal or financial advice. Standard TCPA consent applies for SMS communications.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Market Data and Estimates</h2>
              <p className="leading-relaxed">Market data, home value estimates, and affordability calculations provided on this site are estimates only and are not appraisals. All information is deemed reliable but not guaranteed and should be independently verified. Real estate market conditions change frequently.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Intellectual Property</h2>
              <p className="leading-relaxed">All content on this website including guides, tools, and design elements is the property of Kasandra Prieto and Performance Systems Group LLC. Reproduction without permission is prohibited.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Limitation of Liability</h2>
              <p className="leading-relaxed">Kasandra Prieto and affiliated parties are not liable for any damages arising from use of this website or reliance on its content. Use of this site is at your own risk.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Contact</h2>
              <p className="leading-relaxed">Questions about these terms? Contact us at <a href="tel:5203493248" className="text-cc-gold hover:underline">(520) 349-3248</a> or visit our <a href="/contact" className="text-cc-gold hover:underline">contact page</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const V2Terms = () => (
  <V2Layout>
    <V2TermsContent />
  </V2Layout>
);

export default V2Terms;
