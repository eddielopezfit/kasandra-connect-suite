/**
 * Selena Chat Drawer
 * Slide-in chat panel with message history, actions, suggested replies, and report generation
 * Now with Concierge Tabs for mobile-first intent routing
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, FileText, Loader2, Globe } from 'lucide-react';
import { useSelenaChat, ChatMessage, ChatAction } from '@/contexts/SelenaChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { logEvent } from '@/lib/analytics/logEvent';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReportViewer } from '@/components/v2/ReportViewer';
import LeadCaptureModal from '@/components/v2/LeadCaptureModal';
import { PriorityCallModal } from './PriorityCallModal';
import { ConciergeTabBar, ConciergeTab } from './ConciergeTabBar';
import { ConciergeTabPanels } from './ConciergeTabPanels';

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
  } = useSelenaChat();
  const { t, language } = useLanguage();
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<ConciergeTab | null>(null);
  
  // UI language state - controls ALL UI chrome (tabs, buttons, labels)
  // Initialized from global language context, can be toggled independently
  const [uiLanguage, setUiLanguage] = useState<'en' | 'es'>(language);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync uiLanguage with global language when drawer opens
  useEffect(() => {
    if (isOpen) {
      setUiLanguage(language);
    }
  }, [isOpen, language]);

  // Get suggested replies from the last assistant message
  const lastMessage = messages[messages.length - 1];
  const suggestedReplies = lastMessage?.role === 'assistant' ? lastMessage.suggestedReplies : undefined;

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close tab panel when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab(null);
    }
  }, [isOpen]);

  // UI language toggle handler
  const handleLanguageToggle = useCallback(() => {
    const newLang = uiLanguage === 'en' ? 'es' : 'en';
    setUiLanguage(newLang);
    logEvent('ui_language_toggle', { from: uiLanguage, to: newLang });
  }, [uiLanguage]);

  // UI translation helper
  const tUI = useCallback((en: string, es: string) => uiLanguage === 'es' ? es : en, [uiLanguage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput('');
    setActiveTab(null); // Close any open panel
    await sendMessage(message);
  };

  const handleSuggestedReplyClick = (text: string) => {
    logEvent('suggested_reply_click', { text, route: window.location.pathname });
    setActiveTab(null); // Close any open panel
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
                  {tUI('Digital Concierge', 'Concierge Digital')}
                </span>
              </DrawerTitle>
              
              {/* Language Toggle Button */}
              <button
                onClick={handleLanguageToggle}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                  "bg-muted hover:bg-muted/80 text-foreground",
                  "transition-colors duration-200"
                )}
                aria-label={tUI('Switch to Spanish', 'Cambiar a Inglés')}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{uiLanguage === 'en' ? 'ES' : 'EN'}</span>
              </button>
            </div>
          </DrawerHeader>

          {/* Messages Area - click to close panel */}
          <ScrollArea 
            className="flex-1 p-4" 
            ref={scrollRef}
            onClick={handleMessagesAreaClick}
          >
            <div className="space-y-4 pb-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onActionClick={handleActionClick}
                />
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[85%]">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Suggested Replies Chips - hidden when panel is open */}
          {suggestedReplies && suggestedReplies.length > 0 && !isLoading && !activeTab && (
            <div className="border-t border-border px-4 py-2.5 shrink-0 bg-background/95 backdrop-blur-sm">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full">
                {suggestedReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedReplyClick(reply)}
                    className={cn(
                      "shrink-0 text-xs font-medium px-3 py-2 rounded-full",
                      "bg-cc-sand text-cc-navy border border-cc-navy/20",
                      "hover:bg-cc-navy hover:text-white",
                      "active:scale-95",
                      "transition-all duration-200",
                      "whitespace-nowrap",
                      "max-w-[200px] truncate"
                    )}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Section: Tabs + Input with safe-area support */}
          <div 
            className="shrink-0 relative bg-background"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Tab Panels (slide up above tabs) */}
            <ConciergeTabPanels
              activeTab={activeTab}
              onClose={handleCloseTabPanel}
              onSendMessage={handleSuggestedReplyClick}
              onActionClick={handleActionClick}
              language={uiLanguage}
              leadId={leadId}
              closeDrawer={closeChat}
            />

            {/* Concierge Tab Bar */}
            <ConciergeTabBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              language={uiLanguage}
            />

            {/* Input Area */}
            <form 
              onSubmit={handleSubmit}
              className="border-t border-border p-4 bg-background"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tUI('Type your message...', 'Escribe tu mensaje...')}
                  className={cn(
                    "flex-1 min-w-0 px-4 py-2 rounded-full",
                    "bg-muted border-0",
                    "text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "text-base" // Prevent zoom on iOS
                  )}
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="rounded-full w-10 h-10 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                {tUI(
                  'Selena is an AI assistant. All advice is reviewed by Kasandra Prieto, licensed Realtor®.',
                  'Selena es una asistente de IA. Todo consejo es revisado por Kasandra Prieto, Realtor® licenciada.'
                )}
              </p>
            </form>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Report Viewer Modal */}
      <ReportViewer
        open={report.isOpen}
        onOpenChange={(open) => !open && closeReport()}
        title={report.title}
        markdown={report.markdown}
        reportId={report.reportId}
        reportType={report.reportType}
      />

      {/* Report Generation Overlay */}
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

      {/* Lead Capture Modal for report access */}
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

      {/* Priority Call Modal */}
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

interface MessageBubbleProps {
  message: ChatMessage;
  onActionClick: (action: ChatAction) => void;
}

function MessageBubble({ message, onActionClick }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => onActionClick(action)}
                className={cn(
                  "text-xs font-medium px-3 py-1.5 rounded-full",
                  "bg-background/20 hover:bg-background/30",
                  "transition-colors duration-200",
                  "border border-current/20"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
