import { useSelenaChat } from "@/contexts/SelenaChatContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SelenaTextTrigger = () => {
  const { openChat } = useSelenaChat();
  const { t } = useLanguage();

  return (
    <button
      onClick={() => openChat({ source: "ad_funnel_text_trigger", intent: "sell" })}
      className="text-cc-gold hover:text-cc-gold/80 underline underline-offset-2 transition-colors"
    >
      {t("Chat with Selena AI", "Chatea con Selena AI")}
    </button>
  );
};

export default SelenaTextTrigger;
