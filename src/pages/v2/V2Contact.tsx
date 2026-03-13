import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Building2, MessageCircle, Instagram, Facebook, Linkedin } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";

const V2ContactContent = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();

  useDocumentHead({
    titleEn: "Contact Kasandra Prieto | Tucson REALTOR®",
    titleEs: "Contactar a Kasandra Prieto | REALTOR® en Tucson",
    descriptionEn: "Get in touch with Kasandra Prieto. Call, email, or visit. No pressure, no obligation.",
    descriptionEs: "Ponte en contacto con Kasandra Prieto. Llama, envía un correo o visita. Sin presión, sin obligación.",
  });

  const socials = [
    { href: "https://www.instagram.com/prietorealestate/", label: "Instagram", icon: Instagram },
    { href: "https://www.facebook.com/prietorealestategroup", label: "Facebook", icon: Facebook },
    { href: "https://www.linkedin.com/in/kasandraprieto/", label: "LinkedIn", icon: Linkedin },
    { href: "https://www.tiktok.com/@kasandraprieto", label: "TikTok", icon: TikTokIcon },
    {
      href: "https://www.youtube.com/@KasandraPrietoTucson",
      label: "YouTube",
      icon: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-cc-navy pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
            {t("Get in Touch", "Ponerse en Contacto")}
          </h1>
          <p className="text-xl text-white/80 max-w-xl mx-auto">
            {t(
              "Ready when you are — no pressure, no obligation.",
              "Lista cuando tú lo estés — sin presión, sin obligación."
            )}
          </p>
        </div>
      </section>

      {/* Contact Card */}
      <section className="bg-cc-ivory py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-soft border border-cc-sand-dark/10 p-8 space-y-6">
            <div className="flex items-start gap-4">
              <Phone className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-cc-blue text-sm">{t("Phone", "Teléfono")}</p>
                <a href="tel:+15203493248" className="text-cc-charcoal hover:text-cc-gold transition-colors">
                  (520) 349-3248
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <MapPin className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-cc-blue text-sm">{t("Office", "Oficina")}</p>
                <p className="text-cc-charcoal text-sm">4007 E Paradise Falls Dr, Suite 125</p>
                <p className="text-cc-charcoal text-sm">Tucson, AZ 85712</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Building2 className="w-5 h-5 text-cc-gold mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-cc-blue text-sm">{t("Brokerage", "Corretaje")}</p>
                <p className="text-cc-charcoal text-sm">Corner Connect</p>
                <p className="text-cc-charcoal text-sm">Realty Executives Arizona Territory</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Row */}
      <section className="bg-cc-sand py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-bold text-cc-blue mb-6">
            {t("Follow Kasandra", "Sigue a Kasandra")}
          </h2>
          <div className="flex justify-center gap-4">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-cc-navy flex items-center justify-center text-white hover:bg-cc-gold transition-colors"
                aria-label={`Visit Kasandra on ${s.label}`}
              >
                <s.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary CTA */}
      <section className="bg-cc-ivory py-14">
        <div className="container mx-auto px-4 text-center">
          <p className="text-cc-text-muted text-lg mb-6">
            {t("Not ready to call? Talk to Selena first.", "¿No estás lista para llamar? Habla con Selena primero.")}
          </p>
          <Button
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
            onClick={() => {
              logCTAClick(CTA_NAMES.TALK_TO_SELENA, { page: 'contact' });
              openChat({ source: 'contact_page' });
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("Talk to Selena First", "Habla con Selena Primero")}
          </Button>
        </div>
      </section>
    </>
  );
};

const V2Contact = () => (
  <V2Layout>
    <V2ContactContent />
  </V2Layout>
);

export default V2Contact;
