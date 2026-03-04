import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import V2Navigation from "./V2Navigation";
import V2Footer from "./V2Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelenaChatProvider } from "@/contexts/SelenaChatContext";
import { SelenaFloatingButton, SelenaChatDrawer } from "@/components/selena";
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
  const { language } = useLanguage();
  const location = useLocation();
  
  // Initialize session on mount and log page views
  useEffect(() => {
    initSessionContext(language);
  }, [language]);

  // P1.1: Restore from snapshot if localStorage context is missing/empty (Guard 3)
  useEffect(() => {
    const CONTEXT_KEY = 'selena_context_v2';
    const stored = localStorage.getItem(CONTEXT_KEY);
    // Only restore when localStorage context is completely missing or empty
    if (stored) return;

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
      console.log('[P1.1] Session restored from snapshot');
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
  
  return (
    <SelenaChatProvider>
      {/* IMPORTANT: Do NOT add key={language} here - it causes full tree remount */}
      {/* which resets input state and breaks chat. Language changes are handled by React state */}
      <div className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden">
        <V2Navigation />
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden">{children}</main>
        <V2Footer />
        
        {/* Selena Chat - Site Wide */}
        <SelenaFloatingButton />
        <SelenaChatDrawer />
      </div>
    </SelenaChatProvider>
  );
};

export default V2Layout;
