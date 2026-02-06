import { cn } from "@/lib/utils";
import { Globe, Minus, RotateCcw } from "lucide-react";

export function SelenaDrawerHeaderControls({
  showMinimize,
  messagesLength,
  onClearHistory,
  language,
  onToggleLanguage,
  onMinimize,
  t,
}: {
  showMinimize: boolean;
  messagesLength: number;
  onClearHistory: () => void;
  language: "en" | "es";
  onToggleLanguage: () => void;
  onMinimize: () => void;
  t: (en: string, es: string) => string;
}) {
  return (
    <div className="flex items-center gap-2">
      {messagesLength > 1 && (
        <button
          onClick={onClearHistory}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
            "bg-muted hover:bg-muted/80 text-foreground",
            "transition-colors duration-200"
          )}
          aria-label={t("New chat", "Nuevo chat")}
          title={t("Start new chat", "Iniciar nuevo chat")}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("New", "Nuevo")}</span>
        </button>
      )}

      <button
        onClick={onToggleLanguage}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
          "bg-muted hover:bg-muted/80 text-foreground",
          "transition-colors duration-200"
        )}
        aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="uppercase">{language}</span>
      </button>

      {showMinimize && (
        <button
          onClick={onMinimize}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
          aria-label={t("Minimize", "Minimizar")}
        >
          <Minus className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
