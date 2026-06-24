import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";
import { BROKERAGE_DISPLAY } from "@/lib/brand";

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

  const primaryLinks = [
    { href: "/", label: t("Home", "Inicio") },
    { href: "/buy", label: t("Buy", "Comprar") },
    { href: "/sell", label: t("Sell", "Vender") },
    { href: "/about", label: t("About", "Sobre Mí") },
  ];

  const isActive = (href: string) => location.pathname === href;

  const linkClass = (active: boolean) =>
    `relative text-sm font-medium transition-all duration-200 pb-1 ${
      active
        ? "text-cc-gold"
        : isScrolled
          ? "text-cc-charcoal/70 hover:text-cc-charcoal"
          : "text-white/70 hover:text-white"
    }`;

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Branding / Compliance Strip */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-cc-sand-dark/20 overflow-hidden">
        <div className="flex items-center justify-center py-2 px-4 h-9 md:h-10">
          <img
            src="/images/kasandra-brand-lockup.jpg"
            alt="Kasandra Prieto — REALTOR®, Equal Housing Opportunity"
            width={400}
            height={32}
            fetchPriority="high"
            decoding="async"
            className="h-5 md:h-6 w-auto object-contain max-w-full"
          />
        </div>
      </div>

      <nav
        className={`fixed top-[36px] md:top-[40px] left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-cc-sand/95 backdrop-blur-md shadow-md border-b border-white/[0.08] py-3"
            : "bg-cc-navy py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo & Brokerage */}
            <div className="flex flex-col">
              <Link to="/" className={`font-serif text-xl font-bold tracking-wide ${isScrolled ? "text-cc-navy" : "text-white"}`}>
                KASANDRA PRIETO
              </Link>
              <span className={`text-xs tracking-wider ${isScrolled ? "text-cc-slate/80" : "text-white/80"}`}>
                {BROKERAGE_DISPLAY}
              </span>
              <span className="hidden lg:block text-[13px] text-cc-gold font-medium tracking-wide">
                {t("Your Best Friend in Real Estate", "Tu Mejor Amiga en Bienes Raíces")}
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={linkClass(isActive(link.href))}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cc-gold rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-4">
              <LanguageToggle variant={isScrolled ? "light" : "dark"} />
              <Button asChild className="bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full px-6 shadow-gold">
                <Link to="/book">{t("Book a Consultation", "Agendar una Cita")}</Link>
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
          <div className={`lg:hidden overflow-y-auto transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? "max-h-[calc(100vh-120px)] opacity-100" : "max-h-0 opacity-0"
            }`}>
            <div className={`mt-4 pb-4 border-t pt-4 space-y-0 ${isScrolled ? "bg-cc-sand border-cc-sand-dark/30" : "bg-cc-navy border-white/20"}`}>
              <div className="flex justify-center mb-4">
                <LanguageToggle variant={isScrolled ? "light" : "dark"} />
              </div>
              {primaryLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-center py-3 text-base font-medium border-b last:border-b-0 ${
                    isScrolled
                      ? `border-cc-sand-dark/20 ${isActive(link.href) ? "text-cc-gold" : "text-cc-navy/80 hover:text-cc-navy"}`
                      : `border-white/10 ${isActive(link.href) ? "text-cc-gold" : "text-white/80 hover:text-white"}`
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button asChild className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full shadow-gold mt-4">
                <Link to="/book" onClick={() => setIsMobileMenuOpen(false)}>
                  {t("Book a Consultation", "Agendar una Cita")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default V2Navigation;
