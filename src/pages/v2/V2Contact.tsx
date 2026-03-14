import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useSelenaChat } from "@/contexts/SelenaChatContext";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, Building2, MessageCircle, Instagram, Facebook, Linkedin, Clock, Calendar } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { logCTAClick, CTA_NAMES } from "@/lib/analytics/ctaDefaults";
import { Link } from "react-router-dom";
import kasandraPortrait from "@/assets/kasandra-portrait.jpg";

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
          <p className="text-xl text-white/80 max-w-xl mx-auto mb-6">
            {t(
              "Ready when you are — no pressure, no obligation.",
              "Lista cuando tú lo estés — sin presión, sin obligación."
            )}
          </p>
          <span className="inline-flex items-center gap-2 bg-cc-gold/15 text-cc-gold rounded-full px-4 py-1.5 text-sm font-medium">
            <Clock className="w-4 h-4" />
            {t("Typically responds within 2 hours", "Responde en menos de 2 horas")}
          </span>
        </div>
      </section>

      {/* Two-Column Contact */}
      <section className="bg-cc-ivory py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
            {/* Left — Portrait */}
            <div className="rounded-2xl overflow-hidden ring-4 ring-cc-gold/20 shadow-elevated">
              <img
                src={kasandraPortrait}
                alt="Kasandra Prieto — Tucson REALTOR®"
                className="w-full h-full object-cover aspect-[3/4]"
                loading="lazy"
              />
            </div>

            {/* Right — Contact Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-soft border border-cc-sand-dark/10 p-8 space-y-6">
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

              {/* Personal note */}
              <p className="text-cc-text-muted italic text-sm px-1">
                {t(
                  "Whether you prefer a call, a text, or meeting Selena first — I'm here.",
                  "Ya sea que prefieras llamar, enviar un mensaje o conocer a Selena primero — aquí estoy."
                )}
              </p>

              {/* Social icons */}
              <div className="flex gap-3 px-1">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-cc-navy flex items-center justify-center text-white hover:bg-cc-gold transition-colors"
                    aria-label={`Visit Kasandra on ${s.label}`}
                  >
                    <s.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-cc-sand py-14">
        <div className="container mx-auto px-4 text-center flex flex-col items-center gap-3">
          <Button
            asChild
            className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-8 shadow-gold"
            size="lg"
          >
            <Link to="/book">
              <Calendar className="w-4 h-4 mr-2" />
              {t("Book a Call with Kasandra", "Agenda una Llamada con Kasandra")}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="text-cc-navy hover:text-cc-gold font-medium rounded-full px-8"
            onClick={() => {
              logCTAClick({ cta_name: CTA_NAMES.RESULT_CHAT_SELENA, destination: 'selena_drawer', page_path: '/contact', intent: 'neutral' });
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
