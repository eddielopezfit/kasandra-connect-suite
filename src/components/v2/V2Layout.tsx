import { ReactNode, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import V2Navigation from "./V2Navigation";
import V2Footer from "./V2Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelenaChatProvider } from "@/contexts/SelenaChatContext";
import { SelenaFloatingButton, SelenaChatDrawer } from "@/components/selena";
import { ChatErrorBoundary } from "@/components/selena/ChatErrorBoundary";
import { logPageView, logEvent } from "@/lib/analytics/logEvent";
import { initSessionContext, getSessionContext, updateSessionContext } from "@/lib/analytics/selenaSession";
import { bridgeAuthToLead } from "@/lib/analytics/bridgeAuthToLead";
import { restoreSnapshot } from "@/lib/analytics/sessionSnapshot";
import { supabase } from "@/integrations/supabase/client";

interface V2LayoutProps {
  children: ReactNode;
}

const V2Layout = ({ children }: V2LayoutProps) => {
  // Use language from global context to force re-render on language change
  const { language, t } = useLanguage();
  const location = useLocation();
  
  // Initialize session on mount and log page views
  useEffect(() => {
    initSessionContext(language);
  }, [language]);

  // P1.1: Restore from snapshot if localStorage context is missing or uninitialized (Guard 3)
  useEffect(() => {
    const CONTEXT_KEY = 'selena_context_v2';
    const stored = localStorage.getItem(CONTEXT_KEY);

    // Determine if context is "uninitialized" — either missing or has no meaningful data
    let isUninitialized = !stored;
    if (stored && !isUninitialized) {
      try {
        const parsed = JSON.parse(stored);
        // Context exists but is effectively empty — no tool usage, no last_page, intent is default/missing
        const hasNoMeaningfulData =
          !parsed.last_page &&
          !parsed.tool_used &&
          (!parsed.intent || parsed.intent === 'explore') &&
          !parsed.readiness_score &&
          !parsed.estimated_value;
        isUninitialized = hasNoMeaningfulData;
      } catch {
        isUninitialized = true; // Corrupted JSON → treat as missing
      }
    }

    if (!isUninitialized) return;

    const ctx = getSessionContext();
    if (!ctx?.session_id) return;

    restoreSnapshot(ctx.session_id).then((snapshot) => {
      if (!snapshot) return;
      const merged: Record<string, unknown> = { restored_from_snapshot: true };
      if (snapshot.intent) merged.intent = snapshot.intent;
      if (snapshot.last_page) merged.last_page = snapshot.last_page;
      if (typeof snapshot.readiness_score === 'number') merged.readiness_score = snapshot.readiness_score;
      if (snapshot.primary_priority) merged.primary_priority = snapshot.primary_priority;
      if (snapshot.tools_used?.length) merged.tool_used = snapshot.tools_used[snapshot.tools_used.length - 1];
      if (snapshot.guides_read?.length) merged.last_guide_id = snapshot.guides_read[snapshot.guides_read.length - 1];
      // Unpack calculator_data
      const calc = snapshot.calculator_data;
      if (calc) {
        if (calc.estimated_value) merged.estimated_value = calc.estimated_value;
        if (calc.calculator_difference) merged.calculator_difference = calc.calculator_difference;
        if (calc.calculator_advantage) merged.calculator_advantage = calc.calculator_advantage;
        if (calc.calculator_motivation) merged.calculator_motivation = calc.calculator_motivation;
      }
      // Unpack context_json
      const cj = snapshot.context_json;
      if (cj) {
        if (cj.timeline) merged.timeline = cj.timeline;
        if (cj.situation) merged.situation = cj.situation;
        if (cj.condition) merged.condition = cj.condition;
        if (cj.chip_phase_floor) merged.chip_phase_floor = cj.chip_phase_floor;
        if (cj.has_booked) merged.has_booked = cj.has_booked;
        if (cj.quiz_completed) merged.quiz_completed = cj.quiz_completed;
        if (cj.seller_decision_recommended_path) merged.seller_decision_recommended_path = cj.seller_decision_recommended_path;
        if (cj.seller_goal_priority) merged.seller_goal_priority = cj.seller_goal_priority;
        if (cj.property_condition_raw) merged.property_condition_raw = cj.property_condition_raw;
      }
      updateSessionContext(merged as any);
      logEvent('session_snapshot_restored', {
        intent: snapshot.intent,
        has_score: typeof snapshot.readiness_score === 'number',
        last_page: snapshot.last_page,
      });
      if (import.meta.env.DEV) console.log('[P1.1] Session restored from snapshot');
    }).catch(() => {});
  }, []); // Run once on mount
  
  useEffect(() => {
    logPageView(location.pathname);
  }, [location.pathname]);
  
  // Auth state listener for identity bridging
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await bridgeAuthToLead(session.user);
          logEvent('google_auth_complete', { 
            email: session.user.email,
            provider: session.user.app_metadata?.provider || 'unknown',
          });
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);
  
  // Pages where the sticky book bar should be suppressed —
  // the booking CTA is already the primary action on these pages.
  const SUPPRESS_STICKY_BOOK = ['/book', '/thank-you', '/book/confirmed', '/ad/'];
  const showStickyBook = !SUPPRESS_STICKY_BOOK.some(p => location.pathname.startsWith(p));

  return (
    <SelenaChatProvider>
      {/* IMPORTANT: Do NOT add key={language} here - it causes full tree remount */}
      {/* which resets input state and breaks chat. Language changes are handled by React state */}
      <div className="min-h-[100dvh] flex flex-col w-full max-w-[100vw] overflow-x-hidden">
        <V2Navigation />
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden bg-cc-navy">{children}</main>
        <V2Footer />
        
        {/* Selena Chat - Site Wide */}
        <ChatErrorBoundary>
          <SelenaFloatingButton />
          <SelenaChatDrawer />
        </ChatErrorBoundary>

        {/* Sticky mobile Book CTA — lg:hidden so desktop nav button handles it */}
        {showStickyBook && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
            {/* Gradient fade so content beneath isn't hard-cut */}
            <div className="h-6 bg-gradient-to-t from-white/60 to-transparent" />
            <div className="bg-white/95 backdrop-blur-sm border-t border-cc-sand-dark/30 px-4 py-3 pointer-events-auto
                            pb-[max(12px,env(safe-area-inset-bottom))]">
              <Link
                to="/book"
                className="flex items-center justify-center gap-2 w-full bg-cc-gold hover:bg-cc-gold-dark
                           text-cc-navy font-semibold rounded-full py-3 text-sm shadow-gold
                           transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                {t("Book a Strategy Session", "Agendar una Sesión de Estrategia")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </SelenaChatProvider>
  );
};

export default V2Layout;
