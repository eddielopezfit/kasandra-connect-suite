import { useSelenaWidget } from "@/contexts/SelenaWidgetContext";

const SelenaTextTrigger = () => {
  const { handleWidgetClick, isConnecting } = useSelenaWidget();

  return (
    <button 
      onClick={handleWidgetClick}
      disabled={isConnecting}
      className="text-cc-gold hover:text-cc-gold/80 underline underline-offset-2 transition-colors disabled:opacity-50"
    >
      {isConnecting ? "Connecting..." : "Chat with Selena AI"}
    </button>
  );
};

export default SelenaTextTrigger;
