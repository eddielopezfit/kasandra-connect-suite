import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";

const V2PrivacyContent = () => {
  const { t } = useLanguage();

  useDocumentHead({
    titleEn: "Privacy Policy | Kasandra Prieto REALTOR®",
    titleEs: "Política de Privacidad | Kasandra Prieto REALTOR®",
    descriptionEn: "Privacy Policy for kasandraprietorealtor.com — how we collect, use, and protect your information.",
    descriptionEs: "Política de Privacidad de kasandraprietorealtor.com — cómo recopilamos, usamos y protegemos su información.",
  });

  return (
    <div className="min-h-screen bg-cc-ivory">
      <section className="bg-cc-navy pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-serif text-4xl font-bold text-white">
            {t("Privacy Policy", "Política de Privacidad")}
          </h1>
          <p className="text-cc-ivory/60 mt-2 text-sm">
            {t("Last updated: March 2026", "Última actualización: Marzo 2026")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl prose prose-neutral">
          <div className="bg-white rounded-2xl p-8 shadow-soft border border-cc-sand-dark/20 space-y-8 text-cc-charcoal">
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Information We Collect</h2>
              <p className="leading-relaxed">When you use this website, we may collect information you provide directly — including your name, email address, phone number, and real estate interests — when you submit forms, use tools, or communicate through Selena AI. We also collect usage data such as pages visited, tools used, and session activity to improve your experience.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">How We Use Your Information</h2>
              <p className="leading-relaxed">Information you provide is used to respond to your inquiries, connect you with Kasandra Prieto, personalize your experience on this site, and send relevant real estate information if you have opted in. We do not sell your personal information to third parties.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">SMS and Communications</h2>
              <p className="leading-relaxed">By providing your phone number and checking the consent box on our booking form, you agree to receive text messages from Kasandra Prieto related to your real estate inquiry. Message and data rates may apply. You may opt out at any time by replying STOP.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Cookies and Analytics</h2>
              <p className="leading-relaxed">This site uses cookies and similar technologies to remember your preferences, track session activity, and improve functionality. Session data is stored locally in your browser and is not transmitted to third parties except as described in this policy.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Third-Party Services</h2>
              <p className="leading-relaxed">This site uses GoHighLevel for booking and CRM, Supabase for data storage, and Google Analytics for usage analytics. Each service has its own privacy policy governing their handling of data.</p>
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-cc-navy mb-3">Contact</h2>
              <p className="leading-relaxed">If you have questions about this Privacy Policy, please contact us at: <a href="tel:5203493248" className="text-cc-gold hover:underline">(520) 349-3248</a> or visit our <a href="/contact" className="text-cc-gold hover:underline">contact page</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const V2Privacy = () => (
  <V2Layout>
    <V2PrivacyContent />
  </V2Layout>
);

export default V2Privacy;
