import { Instagram, Linkedin, Phone, Mail, Facebook } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Brand */}
          <div className="text-center md:text-left">
            <span className="font-serif text-2xl font-semibold tracking-wide">
              KASANDRA PRIETO
            </span>
            <p className="text-primary-foreground/70 mt-2 text-sm">
              {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            <a
              href="https://www.instagram.com/kasandraprietore/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Visit Kasandra on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/prietorealestategroup"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Visit Kasandra on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/kasandraprieto/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Visit Kasandra on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@kasandraprieto"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label="Visit Kasandra on TikTok"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
          </div>

          {/* Contact Info */}
          <div className="text-center md:text-right space-y-2 min-w-0">
            <a
              href="tel:520-349-3248"
              className="flex items-center justify-center md:justify-end gap-2 text-primary-foreground/70 hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span>520-349-3248</span>
            </a>
            <a
              href="mailto:kasandra@prietorealestategroup.com"
              className="flex items-center justify-center md:justify-end gap-2 text-primary-foreground/70 hover:text-accent transition-colors min-w-0"
            >
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="break-all">kasandra@prietorealestategroup.com</span>
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/50 text-sm">
            © {currentYear} Kasandra Prieto. {t("All rights reserved.", "Todos los derechos reservados.")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
