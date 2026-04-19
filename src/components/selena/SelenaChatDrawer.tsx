/**
 * Selena Chat Drawer
 * Desktop: Right-side Sheet with minimize capability
 * Mobile: Bottom drawer (unchanged)
 * Now with Concierge Tabs for mobile-first intent routing
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, FileText, Loader2, MessageCircle, ArrowLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useKeyboardInset } from '@/hooks/useKeyboardInset';
import { useSelenaChat } from '@/contexts/SelenaChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logEvent } from '@/lib/analytics/logEvent';
import { getSessionContext, updateSessionContext, SessionContext } from '@/lib/analytics/selenaSession';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { ReportViewer } from '@/components/v2/ReportViewer';
import LeadCaptureModal from '@/components/v2/LeadCaptureModal';

import { ConciergeTab, JourneyIntent } from './ConciergeTabBar';
import { SelenaDrawerHeaderControls } from './drawer/SelenaDrawerHeaderControls';
import { SelenaDrawerMessagesArea } from './drawer/SelenaDrawerMessagesArea';
import { SelenaDrawerSuggestedRepliesChips } from './drawer/SelenaDrawerSuggestedRepliesChips';
import { SelenaDrawerBottomSection } from './drawer/SelenaDrawerBottomSection';

/**
 * Compute journey step based on session context
 * Returns step 1-4 based on user progress through funnel
 */
function computeJourneyStep(context: SessionContext | null): number {
  if (!context) return 0;
  
  let step = 1;
  
  // For sellers
  if (context.intent === 'sell' || context.intent === 'cash') {
    if (context.tool_used) step = 2; // Used calculator
    if (context.has_viewed_report) step = 3; // Viewed report
    if (context.has_booked) step = 4; // Booked consultation
  }
  
  // For buyers
  if (context.intent === 'buy') {
    if (context.readiness_score) step = 2; // Took readiness check
    if (context.last_guide_id) step = 3; // Read a guide
    if (context.has_booked) step = 4; // Booked consultation
  }
  
  return step;
}

export function SelenaChatDrawer() {
  const { 
    isOpen, 
    closeChat, 
    messages, 
    isLoading, 
    sendMessage, 
    handleActionClick, 
    report, 
    closeReport,
    
    showLeadCapture,
    closeLeadCapture,
    onLeadCaptured,
    leadId,
    pendingAction: _pendingAction,
    clearHistory,
  } = useSelenaChat();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<ConciergeTab | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { keyboardInset, isKeyboardOpen } = useKeyboardInset();
  
  // Compute journey context for tab bar
  // Re-compute when messages change (user may have progressed through journey)
  const journeyContext = useMemo(() => {
    const ctx = getSessionContext();
    return {
      intent: ctx?.intent as JourneyIntent | undefined,
      step: computeJourneyStep(ctx),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Get suggested replies from the last assistant message
  const lastMessage = messages[messages.length - 1];
  const suggestedReplies = lastMessage?.role === 'assistant' ? lastMessage.suggestedReplies : undefined;

  // Scroll to bottom when messages change, loading state changes, or keyboard opens
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading, isKeyboardOpen]);


  // Show onboarding on first open (P3)
  useEffect(() => {
    if (isOpen && !localStorage.getItem('selena_onboarded')) {
      setShowOnboarding(true);
    }
  }, [isOpen]);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('selena_onboarded', '1');
  }, []);

  // Compute source page for "Return to" link (P6)
  const sourcePage = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '') return null;
    const segments: Record<string, { en: string; es: string }> = {
      '/buy': { en: 'Buy', es: 'Comprar' },
      '/sell': { en: 'Sell', es: 'Vender' },
      '/cash-offer-options': { en: 'Cash Offers', es: 'Ofertas en Efectivo' },
      '/guides': { en: 'Guides', es: 'Guías' },
      '/book': { en: 'Book', es: 'Reservar' },
      '/about': { en: 'About', es: 'Acerca de' },
      '/contact': { en: 'Contact', es: 'Contacto' },
      '/podcast': { en: 'Podcast', es: 'Podcast' },
      '/community': { en: 'Community', es: 'Comunidad' },
      '/neighborhoods': { en: 'Neighborhoods', es: 'Vecindarios' },
    };
    // Match exact or prefix (for guide detail pages)
    if (path.startsWith('/guides/')) return { path, label: { en: 'Guide', es: 'Guía' } };
    if (path.startsWith('/neighborhoods/')) return { path, label: { en: 'Neighborhood', es: 'Vecindario' } };
    const match = segments[path];
    if (match) return { path, label: match };
    return null;
  }, [location.pathname]);

  // Close tab panel when drawer closes & remove body scroll lock
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(null);
      setIsMinimized(false);
      document.body.classList.remove('selena-open');
    }
    return () => {
      document.body.classList.remove('selena-open');
    };
  }, [isOpen]);

  // Global language toggle handler - changes site-wide language
  const handleLanguageToggle = useCallback(() => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    logEvent('ui_language_toggle', { from: language, to: newLang, source: 'selena_drawer' });
  }, [language, setLanguage]);

  // Minimize handler (desktop only)
  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
    logEvent('selena_minimized', { route: window.location.pathname });
  }, []);

  // Restore from minimized
  const handleRestore = useCallback(() => {
    setIsMinimized(false);
    logEvent('selena_restored', { route: window.location.pathname });
  }, []);

  // Handle submit from uncontrolled input
  const handleSubmitText = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setActiveTab(null); // Close any open panel
    await sendMessage(text);
  }, [isLoading, sendMessage]);

  // Seller timeline bubble → SessionContext.timeline mapping (Step 2, Behavioral Spec Section 5)
  const TIMELINE_BUBBLE_MAP: Record<string, string | null> = {
    'ASAP (0–30 days)': 'asap',
    'ASAP (0-30 days)': 'asap',
    'Lo antes posible (0-30 dias)': 'asap',
    'Lo antes posible (0–30 días)': 'asap',
    '1-3 months': '60_90',
    '1-3 meses': '60_90',
    '3-6 months': '60_90',
    '3-6 meses': '60_90',
    'Just exploring': null,
    'Solo explorando': null,
  };

  const handleSuggestedReplyClick = (text: string) => {
    logEvent('suggested_reply_click', { text, route: window.location.pathname });
    setActiveTab(null); // Close any open panel

    // Set timeline in SessionContext BEFORE sending to selena-chat
    if (text in TIMELINE_BUBBLE_MAP) {
      const canonical = TIMELINE_BUBBLE_MAP[text];
      if (canonical === null) {
        // "Just exploring" → clear timeline
        updateSessionContext({ timeline: undefined });
      } else {
        updateSessionContext({ timeline: canonical as SessionContext['timeline'] });
      }
    }

    sendMessage(text);
  };

  const handleTabChange = (tab: ConciergeTab | null) => {
    if (tab && tab !== activeTab) {
      logEvent('concierge_tab_open', { tab, route: window.location.pathname });
    }
    // Toggle: if same tab, close; otherwise open the new tab
    setActiveTab(prev => prev === tab ? null : tab);
  };

  const handleCloseTabPanel = useCallback(() => {
    setActiveTab(null);
  }, []);

  // Close panel when clicking outside (on messages area)
  const handleMessagesAreaClick = useCallback(() => {
    if (activeTab) {
      setActiveTab(null);
    }
  }, [activeTab]);

  // Shared content rendered directly (no inline wrappers to prevent subtree unmount/remount)
  const sharedMessagesProps = {
    messages,
    isLoading,
    onActionClick: handleActionClick,
    onMessagesAreaClick: handleMessagesAreaClick,
    onSendMessage: handleSubmitText,
    scrollRef,
    bottomRef,
  };

  // Only show chips from the most recent assistant message — never resurrect stale chips from prior context
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const currentChips = lastAssistantMessage?.suggestedReplies?.length
    ? lastAssistantMessage.suggestedReplies
    : undefined;

  const sharedChipsProps = {
    suggestedReplies: currentChips ?? suggestedReplies,
    isLoading,
    activeTab,
    messages,
    onSuggestedReplyClick: handleSuggestedReplyClick,
    chipMeta: lastAssistantMessage?.chipMeta,
  };

  const sharedBottomProps = {
    activeTab,
    onCloseTabPanel: handleCloseTabPanel,
    onTabChange: handleTabChange,
    onSuggestedReplyClick: handleSuggestedReplyClick,
    onActionClick: handleActionClick,
    language,
    leadId,
    closeDrawer: closeChat,
    currentIntent: journeyContext.intent,
    journeyStep: journeyContext.step,
    isMobile,
    onSubmitText: handleSubmitText,
    isLoading,
    placeholder: t('Type your message...', 'Escribe tu mensaje...'),
    disclaimer: t(
      'Selena is an AI assistant. All advice is reviewed by Kasandra Prieto, licensed Realtor®.',
      'Selena es una asistente de IA. Todo consejo es revisado por Kasandra Prieto, Realtor® licenciada.'
    ),
  };

  // ========== MINIMIZED STATE (Desktop only) ==========
  if (!isMobile && isMinimized && isOpen) {
    return (
      <>
        <div 
          className={cn(
            "fixed bottom-4 right-4 z-50",
            "bg-primary text-primary-foreground",
            "px-4 py-2.5 rounded-full shadow-lg cursor-pointer",
            "flex items-center gap-2",
            "hover:scale-105 active:scale-95",
            "transition-transform duration-200"
          )}
          onClick={handleRestore}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleRestore()}
          aria-label={t('Restore Selena chat', 'Restaurar chat de Selena')}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('Selena is active', 'Selena está activa')}
          </span>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
        </div>

        {/* Keep modals available even when minimized */}
        <ReportViewer
          open={report.isOpen}
          onOpenChange={(open) => !open && closeReport()}
          title={report.title}
          markdown={report.markdown}
          reportId={report.reportId}
          reportType={report.reportType}
        />
        <LeadCaptureModal
          isOpen={showLeadCapture}
          onClose={closeLeadCapture}
          onSuccess={onLeadCaptured}
          source="selena_report_access"
          title={{ en: 'Access Your Report', es: 'Accede a Tu Reporte' }}
          subtitle={{ en: 'Please provide your email so I can find your personalized report.', es: 'Por favor proporciona tu correo para encontrar tu reporte personalizado.' }}
        />
      </>
    );
  }

  // ========== MOBILE: Bottom Drawer ==========
  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={(open) => {
          if (!open) {
            document.body.classList.remove('selena-open');
            closeChat();
          } else {
            document.body.classList.add('selena-open');
          }
        }}>
          <DrawerContent 
            className="h-[85dvh] max-h-[700px] flex flex-col overflow-hidden"
            style={{ paddingBottom: keyboardInset > 0 ? `${keyboardInset}px` : undefined }}
          >
            {/* FIX 15 — Swipe drag handle indicator */}
            <div className="mx-auto w-8 h-1 rounded-full bg-muted-foreground/30 mt-2 mb-1 shrink-0" />
            <DrawerHeader className="border-b border-border px-4 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <DrawerTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Selena</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {t('Digital Concierge', 'Concierge Digital')}
                  </span>
                </DrawerTitle>
                
                <SelenaDrawerHeaderControls
                  showMinimize={false}
                  messagesLength={messages.length}
                  onClearHistory={clearHistory}
                  language={language}
                  onToggleLanguage={handleLanguageToggle}
                  onMinimize={handleMinimize}
                  t={t}
                />
              </div>
              {sourcePage && (
                <div className="px-4 py-1.5 border-b border-border/50 shrink-0">
                  <button
                    onClick={closeChat}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    {t(`Back to ${sourcePage.label.en}`, `Volver a ${sourcePage.label.es}`)}
                  </button>
                </div>
              )}
            </DrawerHeader>

            {/* First-open onboarding overlay (P3) */}
            {showOnboarding && (
              <div className="absolute inset-0 z-10 bg-background/95 flex items-center justify-center p-6" onClick={dismissOnboarding}>
                <div className="bg-card rounded-2xl p-6 shadow-lg max-w-xs text-center space-y-4 border border-border">
                  <Sparkles className="w-8 h-8 text-primary mx-auto" />
                  <h3 className="font-serif text-lg font-semibold text-foreground">
                    {t("Hi, I'm Selena!", "¡Hola, soy Selena!")}
                  </h3>
                  <ul className="text-sm text-muted-foreground text-left space-y-3">
                    <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary shrink-0" /> {t("Explore neighborhoods & market data", "Explora vecindarios y datos del mercado")}</li>
                    <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary shrink-0" /> {t("Run the numbers on your home", "Calcula los números de tu casa")}</li>
                    <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary shrink-0" /> {t("Connect you with Kasandra when you're ready", "Conectarte con Kasandra cuando estés lista/o")}</li>
                  </ul>
                  <p className="text-xs text-muted-foreground/70">
                    {t("Tap anywhere to start", "Toca en cualquier lugar para comenzar")}
                  </p>
                </div>
              </div>
            )}

            <SelenaDrawerMessagesArea {...sharedMessagesProps} />
            <SelenaDrawerSuggestedRepliesChips {...sharedChipsProps} />
            <SelenaDrawerBottomSection {...sharedBottomProps} />
          </DrawerContent>
        </Drawer>

        {/* Modals */}
        <ReportViewer
          open={report.isOpen}
          onOpenChange={(open) => !open && closeReport()}
          title={report.title}
          markdown={report.markdown}
          reportId={report.reportId}
          reportType={report.reportType}
        />

        {report.isGenerating && (
          <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-card p-6 rounded-xl shadow-luxury flex flex-col items-center gap-4 max-w-xs text-center">
              <div className="w-12 h-12 rounded-full bg-cc-navy/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-cc-navy animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-cc-navy font-semibold">
                  {t('Generating Your Report', 'Generando Tu Reporte')}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('This may take a moment...', 'Esto puede tardar un momento...')}
                </p>
              </div>
              <Loader2 className="w-6 h-6 text-cc-gold animate-spin" />
            </div>
          </div>
        )}

        <LeadCaptureModal
          isOpen={showLeadCapture}
          onClose={closeLeadCapture}
          onSuccess={onLeadCaptured}
          source="selena_report_access"
          title={{ en: 'Access Your Report', es: 'Accede a Tu Reporte' }}
          subtitle={{ en: 'Please provide your email so I can find your personalized report.', es: 'Por favor proporciona tu correo para encontrar tu reporte personalizado.' }}
        />

      </>
    );
  }

  // ========== DESKTOP: Right-Side Sheet ==========
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => {
        if (!open) closeChat();
      }}>
        <SheetContent 
          side="right" 
          className="w-[460px] max-w-[40vw] min-w-[320px] p-0 flex flex-col h-full"
        >
          <SheetHeader className="border-b border-border px-4 py-3 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Selena</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {t('Digital Concierge', 'Concierge Digital')}
                </span>
              </SheetTitle>
              
              <SelenaDrawerHeaderControls
                showMinimize={true}
                messagesLength={messages.length}
                onClearHistory={clearHistory}
                language={language}
                onToggleLanguage={handleLanguageToggle}
                onMinimize={handleMinimize}
                t={t}
              />
            </div>
          </SheetHeader>
          {sourcePage && (
            <div className="px-4 py-1.5 border-b border-border/50 shrink-0">
              <button
                onClick={closeChat}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                {t(`Back to ${sourcePage.label.en}`, `Volver a ${sourcePage.label.es}`)}
              </button>
            </div>
          )}

          {/* First-open onboarding overlay (P3) */}
          {showOnboarding && (
            <div className="absolute inset-0 z-10 bg-background/95 flex items-center justify-center p-6" onClick={dismissOnboarding}>
              <div className="bg-card rounded-2xl p-6 shadow-lg max-w-xs text-center space-y-4 border border-border">
                <Sparkles className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {t("Hi, I'm Selena!", "¡Hola, soy Selena!")}
                </h3>
                <ul className="text-sm text-muted-foreground text-left space-y-3">
                  <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary shrink-0" /> {t("Explore neighborhoods & market data", "Explora vecindarios y datos del mercado")}</li>
                  <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-primary shrink-0" /> {t("Run the numbers on your home", "Calcula los números de tu casa")}</li>
                  <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-primary shrink-0" /> {t("Connect you with Kasandra when you're ready", "Conectarte con Kasandra cuando estés lista/o")}</li>
                </ul>
                <p className="text-xs text-muted-foreground/70">
                  {t("Click anywhere to start", "Haz clic en cualquier lugar para comenzar")}
                </p>
              </div>
            </div>
          )}

          <SelenaDrawerMessagesArea {...sharedMessagesProps} />
          <SelenaDrawerSuggestedRepliesChips {...sharedChipsProps} />
          <SelenaDrawerBottomSection {...sharedBottomProps} />
        </SheetContent>
      </Sheet>

      {/* Modals */}
      <ReportViewer
        open={report.isOpen}
        onOpenChange={(open) => !open && closeReport()}
        title={report.title}
        markdown={report.markdown}
        reportId={report.reportId}
        reportType={report.reportType}
      />

      {report.isGenerating && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card p-6 rounded-xl shadow-luxury flex flex-col items-center gap-4 max-w-xs text-center">
            <div className="w-12 h-12 rounded-full bg-cc-navy/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-cc-navy animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-cc-navy font-semibold">
                {t('Generating Your Report', 'Generando Tu Reporte')}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t('This may take a moment...', 'Esto puede tardar un momento...')}
              </p>
            </div>
            <Loader2 className="w-6 h-6 text-cc-gold animate-spin" />
          </div>
        </div>
      )}

      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={closeLeadCapture}
        onSuccess={onLeadCaptured}
        source="selena_report_access"
        title={{ en: 'Access Your Report', es: 'Accede a Tu Reporte' }}
        subtitle={{ en: 'Please provide your email so I can find your personalized report.', es: 'Por favor proporciona tu correo para encontrar tu reporte personalizado.' }}
      />

    </>
  );
}

