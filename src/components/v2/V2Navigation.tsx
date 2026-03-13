import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "./LanguageToggle";

const V2Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setIsExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primaryLinks = [
    { href: "/", label: t("Home", "Inicio") },
    { href: "/buy", label: t("Buy", "Comprar") },
    { href: "/sell", label: t("Sell", "Vender") },
    { href: "/cash-offer-options", label: t("Cash Options", "Opciones en Efectivo") },
  ];

  const exploreLinks = [
    { href: "/neighborhoods", label: t("Neighborhoods", "Vecindarios") },
    { href: "/guides", label: t("Guides", "Guías") },
    { href: "/podcast", label: t("Podcast", "Podcast") },
    { href: "/community", label: t("Community", "Comunidad") },
    { href: "/about", label: t("About", "Sobre Mí") },
    { href: "/contact", label: t("Contact", "Contacto") },
  ];

  const allLinks = [...primaryLinks, ...exploreLinks];

  const isActive = (href: string) => location.pathname === href;
  const isExploreActive = exploreLinks.some((l) => isActive(l.href));

  const linkClass = (active: boolean) =>
    `relative text-sm font-medium transition-all duration-200 pb-1 ${
      active
        ? "text-cc-gold"
        : isScrolled
          ? "text-cc-charcoal/70 hover:text-cc-charcoal hover:opacity-100"
          : "text-white/70 hover:text-white hover:opacity-100"
    }`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
              Corner Connect | Realty Executives Arizona Territory
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {primaryLinks.map((link) => (
              <Link key={link.href} to={link.href} className={linkClass(isActive(link.href))}>
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cc-gold rounded-full" />
                )}
              </Link>
            ))}

            {/* Explore Dropdown */}
            <div ref={exploreRef} className="relative">
              <button
                onClick={() => setIsExploreOpen(!isExploreOpen)}
                className={`${linkClass(isExploreActive)} inline-flex items-center gap-1`}
              >
                {t("Explore", "Explorar")}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExploreOpen ? "rotate-180" : ""}`} />
              </button>
              {isExploreOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-xl shadow-xl shadow-black/40 border border-cc-gold/20 py-2 z-50">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsExploreOpen(false)}
                      className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-cc-gold bg-cc-sand/50"
                          : "text-cc-charcoal hover:text-cc-gold hover:bg-cc-navy/[0.06]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}>
          <div className={`mt-4 pb-4 border-t pt-4 space-y-0 bg-cc-navy ${isScrolled ? "border-white/10" : "border-white/20"}`}>
            <div className="flex justify-center mb-4">
              <LanguageToggle variant="dark" />
            </div>
            {allLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-center py-3 text-base font-medium border-b border-white/10 last:border-b-0 ${
                  isActive(link.href)
                    ? "text-cc-gold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-center py-3 text-base font-semibold text-cc-gold border-b border-white/10"
            >
              {t("Contact", "Contacto")}
            </Link>
            <Button asChild className="w-full bg-cc-gold hover:bg-cc-gold-dark text-cc-navy font-semibold rounded-full shadow-gold">
              <Link to="/book" onClick={() => setIsMobileMenuOpen(false)}>
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
