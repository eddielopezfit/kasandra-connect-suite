import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import V2Navigation from "./V2Navigation";
import V2Footer from "./V2Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelenaChatProvider } from "@/contexts/SelenaChatContext";
import { SelenaFloatingButton, SelenaChatDrawer } from "@/components/selena";
import { logPageView, logEvent } from "@/lib/analytics/logEvent";
import { initSessionContext } from "@/lib/analytics/selenaSession";
import { bridgeAuthToLead } from "@/lib/analytics/bridgeAuthToLead";
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
      <div 
        className="min-h-screen flex flex-col w-full max-w-[100vw] overflow-x-hidden" 
        key={language}
      >
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
