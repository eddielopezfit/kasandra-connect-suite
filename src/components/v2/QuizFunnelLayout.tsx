import { ReactNode, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelenaChatProvider } from "@/contexts/SelenaChatContext";
import { SelenaFloatingButton, SelenaChatDrawer } from "@/components/selena";
import { logPageView } from "@/lib/analytics/logEvent";
import { Home } from "lucide-react";
import LanguageToggle from "@/components/v2/LanguageToggle";

interface QuizFunnelLayoutProps {
  children: ReactNode;
  /** When true, reveals SelenaFloatingButton + SelenaChatDrawer. Default: false (suppressed during quiz steps). */
  showSelena?: boolean;
}

/**
 * Isolated funnel layout for /v2/quiz (paid traffic).
 * Intentionally suppresses global V2Navigation and V2Footer to remove exit routes.
 * Provides: Selena providers, minimal back-to-home escape link, EN/ES toggle, compliance footer.
 *
 * NOTE: initSessionContext is NOT called here — it is handled by the LanguageProvider
 * upstream (LanguageContext). Calling it again here would cause a redundant state
 * reset on every language change.
 */
const QuizFunnelLayout = ({ children, showSelena = false }: QuizFunnelLayoutProps) => {
  const { t } = useLanguage();
  const location = useLocation();

  // Log page view on route change — no session init duplication
  useEffect(() => {
    logPageView(location.pathname);
  }, [location.pathname]);

  return (
    <SelenaChatProvider>
      <div className="min-h-screen flex flex-col bg-cc-ivory">
        {/* Minimal top bar — back-to-home + language toggle only, zero nav links */}
        <div className="border-b border-cc-sand-dark/30 bg-white/80 backdrop-blur-sm px-4 py-3">
          <div className="container mx-auto max-w-3xl flex items-center justify-between">
            <Link
              to="/v2"
              className="inline-flex items-center gap-1.5 text-sm text-cc-slate hover:text-cc-navy transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t("Back to Home", "Volver al Inicio")}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageToggle variant="light" />
            </div>
          </div>
        </div>

        {/* Quiz content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Minimal compliance footer — no nav links */}
        <footer className="border-t border-cc-sand-dark/20 bg-white/60 py-5 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border border-cc-slate/40 flex items-center justify-center">
                  <Home className="w-3.5 h-3.5 text-cc-slate/60" />
                </div>
                <span className="text-cc-slate/50 text-[10px] tracking-widest uppercase">
                  Equal Housing Opportunity
                </span>
              </div>
              <p className="text-cc-slate/50 text-[10px]">
                Realty Executives Arizona Territory – Corner Connect Team · Kasandra Prieto, REALTOR®
              </p>
            </div>
          </div>
        </footer>

        {/* Selena Chat — revealed only when quiz is complete */}
        {showSelena && <SelenaFloatingButton />}
        {showSelena && <SelenaChatDrawer />}
      </div>
    </SelenaChatProvider>
  );
};

export default QuizFunnelLayout;
