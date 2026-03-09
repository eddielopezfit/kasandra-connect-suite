import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const V2Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/v2", label: t("Home", "Inicio") },
    { href: "/v2/buy", label: t("Buy", "Comprar") },
    { href: "/v2/sell", label: t("Sell", "Vender") },
    { href: "/v2/cash-offer-options", label: t("Cash Options", "Opciones en Efectivo") },
    { href: "/v2/neighborhoods", label: t("Neighborhoods", "Vecindarios") },
    { href: "/v2/guides", label: t("Guides", "Guías") },
    { href: "/v2/podcast", label: t("Podcast", "Podcast") },
    { href: "/v2/community", label: t("Community", "Comunidad") },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-cc-sand/95 backdrop-blur-md shadow-md py-3"
          : "bg-cc-navy py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brokerage */}
          <div className="flex flex-col">
            <Link to="/v2" className={`font-serif text-xl font-semibold tracking-wide ${isScrolled ? "text-cc-navy" : "text-white"}`}>
              KASANDRA PRIETO
            </Link>
            <span className={`text-[10px] tracking-wide ${isScrolled ? "text-cc-slate" : "text-white/70"}`}>
              Corner Connect | Realty Executives Arizona Territory
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? isScrolled ? "text-cc-gold" : "text-cc-gold"
                    : isScrolled ? "text-cc-charcoal hover:text-cc-gold" : "text-white/90 hover:text-cc-gold"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageToggle variant={isScrolled ? "light" : "dark"} />
            <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 shadow-gold">
              <Link to="/v2/book">{t("Book a Consultation", "Agendar una Cita")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`lg:hidden p-2 ${isScrolled ? "text-cc-navy" : "text-white"}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}>
          <div className={`mt-4 pb-4 border-t pt-4 space-y-4 ${isScrolled ? "border-border bg-white" : "border-white/20 bg-cc-navy"}`}>
            <div className="flex justify-center mb-4">
              <LanguageToggle variant={isScrolled ? "light" : "dark"} />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-center py-2 font-medium ${
                  isActive(link.href) 
                    ? "text-cc-gold" 
                    : isScrolled ? "text-cc-charcoal" : "text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full shadow-gold">
              <Link to="/v2/book" onClick={() => setIsMobileMenuOpen(false)}>
                {t("Book a Consultation", "Agendar una Cita")}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default V2Navigation;
