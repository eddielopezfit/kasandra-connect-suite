import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "es";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, es: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "kasandra-language";

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "es" ? "es" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Synchronous initialization — guarantees first paint uses stored value.
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);

  // Re-sync once after mount in case localStorage was modified between module load
  // and provider mount (e.g., another tab, ?lang= URL param handler, deferred hydration).
  useEffect(() => {
    const fresh = readStoredLanguage();
    if (fresh !== language) {
      setLanguageState(fresh);
    }
    // intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cross-tab + cross-iframe sync: if another instance changes the language,
  // mirror it here so the entire app stays in lockstep.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = e.newValue === "es" ? "es" : "en";
      setLanguageState((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Stable setter — prevents downstream `useEffect([..., setLanguage])` re-fires.
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        /* storage may be blocked (Safari private mode) — UI state still updates */
      }
    }
  }, []);

  // Keep <html lang="..."> in sync for SEO/accessibility
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = language;
    document.documentElement.setAttribute("dir", "ltr");
  }, [language]);

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      setLanguage,
      t: (en: string, es: string) => (language === "en" ? en : es),
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
