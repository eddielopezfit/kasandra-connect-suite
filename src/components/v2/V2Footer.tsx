import { Instagram, Linkedin, Phone, Mail, Home, Facebook, MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSelenaChat } from "@/contexts/SelenaChatContext";

const V2Footer = () => {
  const { t } = useLanguage();
  const { openChat } = useSelenaChat();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cc-blue text-white py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Compliance */}
          <div>
            <span className="font-serif text-xl font-semibold tracking-wide">
              KASANDRA PRIETO
            </span>
            <p className="text-white/70 mt-1 text-sm">REALTOR®</p>
            <div className="mt-3 space-y-1 text-sm text-white/80">
              <p>Corner Connect</p>
              <p>Realty Executives Arizona Territory</p>
            </div>
            {/* Equal Housing */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-8 border border-white/50 flex items-center justify-center text-xs font-bold">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-xs text-white/70">Equal Housing Opportunity</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <h4 className="font-semibold mb-4">{t("Quick Links", "Enlaces Rápidos")}</h4>
            <div className="space-y-2 text-sm text-white/80">
              <a href="/v2/buy" className="block hover:text-white transition-colors">
                {t("Buy a Home", "Comprar una Casa")}
              </a>
              <a href="/v2/sell" className="block hover:text-white transition-colors">
                {t("Sell Your Home", "Vender su Casa")}
              </a>
              <a href="/v2/cash-offer-options" className="block hover:text-white transition-colors">
                {t("Cash Offer Options", "Opciones de Oferta en Efectivo")}
              </a>
              <a href="/v2/podcast" className="block hover:text-white transition-colors">
                {t("Podcast", "Podcast")}
              </a>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="text-center md:text-right min-w-0">
            <h4 className="font-semibold mb-4">{t("Contact", "Contacto")}</h4>
            <div className="space-y-2 min-w-0">
              <a
                href="tel:520-349-3248"
                className="flex items-center justify-center md:justify-end gap-2 text-white/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>520-349-3248</span>
              </a>
              <a
                href="mailto:kasandra@prietorealestategroup.com"
                className="flex items-center justify-center md:justify-end gap-2 text-white/80 hover:text-white transition-colors min-w-0"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="break-all">kasandra@prietorealestategroup.com</span>
              </a>
            </div>
            {/* Social Links */}
            <div className="flex justify-center md:justify-end gap-3 mt-4">
              <a
                href="https://www.instagram.com/kasandraprietore/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cc-gold transition-colors"
                aria-label="Visit Kasandra on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/prietorealestategroup"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cc-gold transition-colors"
                aria-label="Visit Kasandra on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/kasandraprieto/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cc-gold transition-colors"
                aria-label="Visit Kasandra on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@kasandraprieto"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cc-gold transition-colors"
                aria-label="Visit Kasandra on TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.youtube.com/@KasandraPrietoTucson"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-cc-gold transition-colors"
                aria-label="Visit Kasandra on YouTube"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Selena Digital Concierge Nudge */}
        <div className="mb-8">
          <button
            onClick={() => openChat({ source: 'footer_nudge', intent: 'explore' })}
            className="mx-auto flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-left max-w-md w-full group"
            aria-label={t("Chat with Selena, Digital Concierge", "Chatear con Selena, Concierge Digital")}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-cc-gold/20 flex items-center justify-center group-hover:bg-cc-gold/30 transition-colors">
              <MessageCircle className="w-6 h-6 text-cc-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-0.5">
                {t("Selena, Digital Concierge", "Selena, Concierge Digital")}
              </p>
              <p className="text-white/90 text-sm leading-relaxed">
                {t(
                  "Have a question? I'm here 24/7 — no pressure, just clarity.",
                  "¿Tiene una pregunta? Estoy aquí 24/7 — sin presión, solo claridad."
                )}
              </p>
            </div>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-xs text-white/60 max-w-3xl mx-auto mb-4">
            {t(
              "All information is deemed reliable but not guaranteed and should be independently verified. Kasandra Prieto is a licensed REALTOR® with Realty Executives Arizona Territory.",
              "Toda la información se considera confiable pero no está garantizada y debe ser verificada de forma independiente. Kasandra Prieto es una REALTOR® licenciada con Realty Executives Arizona Territory."
            )}
          </p>
          <p className="text-white/50 text-xs">
            © {currentYear} Kasandra Prieto. {t("All rights reserved.", "Todos los derechos reservados.")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default V2Footer;
