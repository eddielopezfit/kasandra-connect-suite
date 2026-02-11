/**
 * Selena Chat Drawer
 * Desktop: Right-side Sheet with minimize capability
 * Mobile: Bottom drawer (unchanged)
 * Now with Concierge Tabs for mobile-first intent routing
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, FileText, Loader2, MessageCircle } from 'lucide-react';
import { useSelenaChat, ChatMessage, ChatAction } from '@/contexts/SelenaChatContext';
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
import { PriorityCallModal } from './PriorityCallModal';
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
    priorityCall,
    closePriorityCall,
    showLeadCapture,
    closeLeadCapture,
    onLeadCaptured,
    leadId,
    hasReports,
    clearHistory,
  } = useSelenaChat();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<ConciergeTab | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Compute journey context for tab bar
  const journeyContext = useMemo(() => {
    const ctx = getSessionContext();
    return {
      intent: ctx?.intent as JourneyIntent | undefined,
      step: computeJourneyStep(ctx),
    };
  }, [messages.length]); // Re-compute when messages change (user may have progressed)

  // Get suggested replies from the last assistant message
  const lastMessage = messages[messages.length - 1];
  const suggestedReplies = lastMessage?.role === 'assistant' ? lastMessage.suggestedReplies : undefined;

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    // Use bottomRef for reliable scroll anchoring
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isLoading]);


  // Close tab panel when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(null);
      setIsMinimized(false);
    }
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

  // ========== SHARED CONTENT COMPONENTS ==========

  const MessagesArea = () => (
    <SelenaDrawerMessagesArea
      messages={messages}
      isLoading={isLoading}
      onActionClick={handleActionClick}
      onMessagesAreaClick={handleMessagesAreaClick}
      scrollRef={scrollRef}
      bottomRef={bottomRef}
    />
  );

  const SuggestedRepliesChips = () => (
    <SelenaDrawerSuggestedRepliesChips
      suggestedReplies={suggestedReplies}
      isLoading={isLoading}
      activeTab={activeTab}
      messages={messages}
      onSuggestedReplyClick={handleSuggestedReplyClick}
    />
  );

  const BottomSection = () => (
    <SelenaDrawerBottomSection
      activeTab={activeTab}
      onCloseTabPanel={handleCloseTabPanel}
      onTabChange={handleTabChange}
      onSuggestedReplyClick={handleSuggestedReplyClick}
      onActionClick={handleActionClick}
      language={language}
      leadId={leadId}
      hasReports={hasReports}
      closeDrawer={closeChat}
      currentIntent={journeyContext.intent}
      journeyStep={journeyContext.step}
      isMobile={isMobile}
      onSubmitText={handleSubmitText}
      isLoading={isLoading}
      placeholder={t('Type your message...', 'Escribe tu mensaje...')}
      disclaimer={t(
        'Selena is an AI assistant. All advice is reviewed by Kasandra Prieto, licensed Realtor®.',
        'Selena es una asistente de IA. Todo consejo es revisado por Kasandra Prieto, Realtor® licenciada.'
      )}
    />
  );

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
          title={{
            en: "Access Your Report",
            es: "Accede a Tu Reporte",
          }}
          subtitle={{
            en: "Please provide your email so I can find your personalized report.",
            es: "Por favor proporciona tu correo para encontrar tu reporte personalizado.",
          }}
        />
        <PriorityCallModal
          open={priorityCall.isOpen}
          onClose={closePriorityCall}
          bookingUrl={priorityCall.bookingUrl}
          slots={priorityCall.slots}
          onChannelSelect={priorityCall.onChannelSelect}
          onRequestCallback={priorityCall.onRequestCallback}
        />
      </>
    );
  }

  // ========== MOBILE: Bottom Drawer ==========
  if (isMobile) {
    return (
      <>
        <Drawer open={isOpen} onOpenChange={(open) => !open && closeChat()}>
          <DrawerContent className="h-[85vh] max-h-[700px] flex flex-col">
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
            </DrawerHeader>

            <MessagesArea />
            <SuggestedRepliesChips />
            <BottomSection />
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
          title={{
            en: "Access Your Report",
            es: "Accede a Tu Reporte",
          }}
          subtitle={{
            en: "Please provide your email so I can find your personalized report.",
            es: "Por favor proporciona tu correo para encontrar tu reporte personalizado.",
          }}
        />

        <PriorityCallModal
          open={priorityCall.isOpen}
          onClose={closePriorityCall}
          bookingUrl={priorityCall.bookingUrl}
          slots={priorityCall.slots}
          onChannelSelect={priorityCall.onChannelSelect}
          onRequestCallback={priorityCall.onRequestCallback}
        />
      </>
    );
  }

  // ========== DESKTOP: Right-Side Sheet ==========
  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
        <SheetContent 
          side="right" 
          className="w-[400px] max-w-[35vw] min-w-[320px] p-0 flex flex-col h-full"
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

          <MessagesArea />
          <SuggestedRepliesChips />
          <BottomSection />
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
        title={{
          en: "Access Your Report",
          es: "Accede a Tu Reporte",
        }}
        subtitle={{
          en: "Please provide your email so I can find your personalized report.",
          es: "Por favor proporciona tu correo para encontrar tu reporte personalizado.",
        }}
      />

      <PriorityCallModal
        open={priorityCall.isOpen}
        onClose={closePriorityCall}
        bookingUrl={priorityCall.bookingUrl}
        slots={priorityCall.slots}
        onChannelSelect={priorityCall.onChannelSelect}
        onRequestCallback={priorityCall.onRequestCallback}
      />
    </>
  );
}

