import { Instagram, Linkedin, Phone, Mail, Home, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { TEAM_NAME, BROKERAGE_NAME } from "@/lib/brand";

const V2Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cc-blue text-white py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Compliance */}
          <div>
            <span className="font-serif text-xl font-semibold tracking-wide">
              KASANDRA PRIETO
            </span>
            <p className="text-white/70 mt-1 text-sm">REALTOR®</p>
            <div className="mt-3 space-y-1 text-sm text-white/80">
              <p>{TEAM_NAME}</p>
              <p>{BROKERAGE_NAME}</p>
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
              <Link to="/buy" className="block hover:text-white transition-colors">
                {t("Buy a Home", "Comprar una Casa")}
              </Link>
              <Link to="/sell" className="block hover:text-white transition-colors">
                {t("Sell Your Home", "Vender su Casa")}
              </Link>
              <Link to="/cash-offer-options" className="block hover:text-white transition-colors">
                {t("Cash Offer Options", "Opciones de Oferta en Efectivo")}
              </Link>
              <Link to="/guides" className="block hover:text-white transition-colors">
                {t("Guides", "Guías")}
              </Link>
              <Link to="/neighborhoods" className="block hover:text-white transition-colors">
                {t("Neighborhoods", "Vecindarios")}
              </Link>
              <Link to="/listings" className="block hover:text-white transition-colors">
                {t("Listings", "Propiedades")}
              </Link>
              <Link to="/podcast" className="block hover:text-white transition-colors">
                {t("Podcast", "Podcast")}
              </Link>
              <Link to="/about" className="block hover:text-white transition-colors">
                {t("About", "Sobre Mí")}
              </Link>
              <Link to="/contact" className="block hover:text-white transition-colors">
                {t("Contact", "Contacto")}
              </Link>
              <Link to="/market" className="block hover:text-white transition-colors">
                {t("Market Intelligence", "Inteligencia de Mercado")}
              </Link>
              <Link to="/selena-ai" className="block hover:text-white transition-colors">
                {t("Meet Selena AI", "Conoce a Selena AI")}
              </Link>
            </div>
          </div>

          {/* Why Corner Connect */}
          <div>
            <h4 className="font-semibold text-sm mb-4">
              {t("Why Corner Connect", "Por Qué Corner Connect")}
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>{t("Off-market inventory access", "Acceso a inventario fuera del mercado")}</li>
              <li>{t("Cash offer program", "Programa de oferta en efectivo")}</li>
              <li>{t("Distressed property solutions", "Soluciones para propiedades en dificultad")}</li>
              <li>{t("Bilingual service", "Servicio bilingüe")}</li>
              <li>{t("126+ five-star reviews", "126+ reseñas de cinco estrellas")}</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="text-center md:text-right min-w-0">
            <h4 className="font-semibold mb-4">{t("Contact", "Contacto")}</h4>
            <div className="space-y-2 min-w-0">
              <a
                href="tel:+15203493248"
                className="flex items-center justify-center md:justify-end gap-2 text-white/80 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>520-349-3248</span>
              </a>
              <a
                href="mailto:kasandra@prietorealestategroup.com"
                className="flex items-center justify-center md:justify-end gap-2 text-white/80 hover:text-white transition-colors min-w-0 max-w-full"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm break-all truncate">kasandra@prietorealestategroup.com</span>
              </a>
            </div>
            {/* Social Links */}
            <div className="flex justify-center md:justify-end gap-3 mt-4">
              <a
                href="https://www.instagram.com/prietorealestate/"
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

        {/* Disclaimer */}
        <div className="border-t border-white/20 pt-6 text-center">
          <p className="text-[13px] text-white/80 max-w-3xl mx-auto mb-4">
            {t(
              "All information is deemed reliable but not guaranteed and should be independently verified. Kasandra Prieto is a licensed REALTOR® with Realty Executives Arizona Territory.",
              "Toda la información se considera confiable pero no está garantizada y debe ser verificada de forma independiente. Kasandra Prieto es una REALTOR® licenciada con Realty Executives Arizona Territory."
            )}
          </p>
          <p className="text-white/70 text-[12px]">
            © {currentYear} Kasandra Prieto. {t("All rights reserved.", "Todos los derechos reservados.")}
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <Link to="/privacy" className="text-[12px] text-white/40 hover:text-cc-gold transition-colors">
              {t("Privacy Policy", "Política de Privacidad")}
            </Link>
            <span className="text-white/20 text-xs">·</span>
            <Link to="/terms" className="text-xs text-white/40 hover:text-cc-gold transition-colors">
              {t("Terms of Service", "Términos de Servicio")}
            </Link>
            <span className="text-white/20 text-xs">·</span>
            <Link to="/selena-ai" className="text-xs text-white/40 hover:text-cc-gold transition-colors">
              Powered by Selena AI
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default V2Footer;
