import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageToggleProps {
  variant?: "light" | "dark";
}

const LanguageToggle = ({ variant = "light" }: LanguageToggleProps) => {
  const { language, setLanguage } = useLanguage();

  const baseStyles = "px-3 py-2 rounded-md transition-all duration-200 font-medium text-xs tracking-wide min-h-[44px] inline-flex items-center";
  
  const getButtonStyles = (isActive: boolean) => {
    if (variant === "dark") {
      // For dark backgrounds (nav not scrolled)
      return isActive
        ? `${baseStyles} bg-cc-gold text-cc-navy`
        : `${baseStyles} text-white/70 hover:text-white`;
    }
    // For light backgrounds (nav scrolled)
    return isActive
      ? `${baseStyles} bg-cc-navy text-white`
      : `${baseStyles} text-cc-charcoal/60 hover:text-cc-navy`;
  };

  return (
    <div 
      className="flex items-center gap-0.5" 
      role="group" 
      aria-label={language === "en" ? "Language selection" : "Selección de idioma"}
    >
      <button
        onClick={() => setLanguage("en")}
        className={getButtonStyles(language === "en")}
        aria-label="Switch to English"
        aria-pressed={language === "en"}
        lang="en"
      >
        EN
      </button>
      <span className={variant === "dark" ? "text-white/30" : "text-cc-slate/40"}>|</span>
      <button
        onClick={() => setLanguage("es")}
        className={getButtonStyles(language === "es")}
        aria-label="Cambiar a Español"
        aria-pressed={language === "es"}
        lang="es"
      >
        ES
      </button>
    </div>
  );
};

export default LanguageToggle;
