import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: t("About", "Acerca de") },
    { href: "#services", label: t("Real Estate", "Bienes Raíces") },
    { href: "#podcast", label: "Podcast" },
    { href: "#community", label: t("Community", "Comunidad") },
  ];

  const getHref = (hash: string) => isHomePage ? hash : `/${hash}`;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="font-serif text-xl md:text-2xl font-semibold tracking-wide text-primary">
            KASANDRA PRIETO
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={getHref(link.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            
            {/* Language Toggle */}
            <div className="flex items-center gap-1 text-sm font-medium">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded transition-colors ${
                  language === "en"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                EN
              </button>
              <span className="text-foreground/40">|</span>
              <button
                onClick={() => setLanguage("es")}
                className={`px-2 py-1 rounded transition-colors ${
                  language === "es"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                ES
              </button>
            </div>
            
            <Button
              variant="accent"
              size="lg"
              className="rounded-full"
              asChild
            >
              <a href={getHref("#contact")}>{t("Book a Consultation", "Agendar Consulta")}</a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={getHref(link.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            
            {/* Mobile Language Toggle */}
            <div className="flex items-center gap-2 py-2">
              <span className="text-sm text-foreground/70">{t("Language:", "Idioma:")}</span>
              <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === "en"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("es")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  language === "es"
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:text-primary"
                }`}
              >
                ES
              </button>
            </div>
            
            <Button
              variant="accent"
              className="rounded-full w-full"
              asChild
            >
              <a href={getHref("#contact")} onClick={() => setIsMobileMenuOpen(false)}>
                {t("Book a Consultation", "Agendar Consulta")}
              </a>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
