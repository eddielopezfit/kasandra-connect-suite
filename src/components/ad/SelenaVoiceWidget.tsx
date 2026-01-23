import { Mic, MicOff, X } from "lucide-react";
import { useSelenaWidget } from "@/contexts/SelenaWidgetContext";

const SelenaVoiceWidget = () => {
  const {
    isOpen,
    isConnecting,
    isConnected,
    isSpeaking,
    stopConversation,
    handleWidgetClick,
  } = useSelenaWidget();

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Expanded modal when connected */}
      {isOpen && isConnected && (
        <div className="absolute bottom-20 left-0 w-72 bg-cc-navy border border-cc-gold/30 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-cc-gold/10 border-b border-cc-gold/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-green-500 animate-pulse" : "bg-cc-gold"}`} />
              <span className="text-white font-medium text-sm">Selena AI</span>
            </div>
            <button
              onClick={stopConversation}
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Close Selena AI"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            {/* Status indicator */}
            <div className="flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isSpeaking 
                  ? "bg-cc-gold/20 ring-4 ring-cc-gold/30 animate-pulse" 
                  : "bg-white/10"
              }`}>
                {isSpeaking ? (
                  <Mic className="w-8 h-8 text-cc-gold animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8 text-white/60" />
                )}
              </div>
            </div>

            <p className="text-center text-white/80 text-sm">
              {isSpeaking 
                ? "Selena is speaking..." 
                : "Listening... Start talking!"}
            </p>

            <p className="text-center text-white/40 text-xs">
              AI-powered assistant. All advice reviewed by Kasandra Prieto.
            </p>
          </div>

          {/* End call button */}
          <div className="px-4 pb-4">
            <button
              onClick={stopConversation}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              End Conversation
            </button>
          </div>
        </div>
      )}

      {/* Floating button - Gold circle with white mic icon and pulse animation */}
      <div className="group">
        <button
          onClick={handleWidgetClick}
          disabled={isConnecting}
          className={`relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 ${
            isConnected
              ? "bg-green-500 hover:bg-green-600"
              : isConnecting
              ? "bg-cc-gold/70 cursor-wait"
              : "bg-cc-gold hover:bg-cc-gold/90"
          }`}
          aria-label={isConnected ? "End Selena AI conversation" : "Ask Selena AI"}
        >
          {/* Pulse animation ring - only when idle */}
          {!isConnected && !isConnecting && (
            <span className="absolute inset-0 rounded-full bg-cc-gold/40 animate-ping" />
          )}
          
          {isConnecting ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isConnected ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Tooltip - only show when not connected */}
        {!isConnected && !isConnecting && (
          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-white text-cc-navy text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              Ask Selena AI
              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelenaVoiceWidget;
