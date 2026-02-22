import { useSelenaWidget } from "@/contexts/SelenaWidgetContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SelenaTextTrigger = () => {
  const { handleWidgetClick, isConnecting } = useSelenaWidget();
  const { t } = useLanguage();

  return (
    <button 
      onClick={handleWidgetClick}
      disabled={isConnecting}
      className="text-cc-gold hover:text-cc-gold/80 underline underline-offset-2 transition-colors disabled:opacity-50"
    >
      {isConnecting
        ? t("Connecting...", "Conectando...")
        : t("Chat with Selena AI", "Chatea con Selena AI")}
    </button>
  );
};

export default SelenaTextTrigger;
