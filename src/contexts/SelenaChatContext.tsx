/**
 * Selena Chat Context
 * Manages chat state across the app with lead identity awareness
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getSessionContext, 
  initSessionContext, 
  updateSessionContext,
  setFieldIfEmpty 
} from '@/lib/analytics/selenaSession';
import {
  logSelenaOpen,
  logSelenaClose,
  logSelenaMessageUser,
  logSelenaMessageAI,
  logChatActionClick,
  logEvent,
} from '@/lib/analytics/logEvent';
import { getGuideById } from '@/lib/guides/guideRegistry';

const CHAT_HISTORY_KEY = 'selena_chat_history';
const LEAD_ID_KEY = 'selena_lead_id';
const MAX_HISTORY = 50;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  suggestedReplies?: string[];
  metadata?: {
    report_id?: string;
    report_type?: string;
  };
}

export interface ChatAction {
  label: string;
  href?: string;
  eventType?: string;
  actionType?: 'generate_report' | 'open_report' | 'priority_call';
  type?: string; // Alternative action type field from AI
  id?: string; // Alternative action identifier from AI
  reportType?: 'net_sheet' | 'buyer_readiness' | 'cash_comparison' | 'home_value_preview';
  reportId?: string; // For open_report action
  context?: Record<string, unknown>;
}

interface ReportState {
  isOpen: boolean;
  isGenerating: boolean;
  title: string;
  markdown: string;
  reportId?: string;
  reportType?: string;
}

interface TimeSlot {
  start: string;
  end: string;
  booking_url: string;
  display_time: string;
}

type HandoffChannel = 'call' | 'zoom';

interface PriorityCallState {
  isOpen: boolean;
  isLoading: boolean;
  bookingUrl: string;
  slots: TimeSlot[];
  onChannelSelect?: (channel: HandoffChannel) => Promise<{ bookingUrl: string; slots: TimeSlot[] }>;
  onRequestCallback?: (channel: HandoffChannel, contactPref?: 'call' | 'text') => void;
}

// Calculator awareness types
export type CalculatorAdvantage = 'cash' | 'traditional' | 'consult';

interface SelenaChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  leadId: string | null;
  hasReports: boolean; // Track if user has generated any reports
  report: ReportState;
  priorityCall: PriorityCallState;
  showLeadCapture: boolean;
  pendingReportId: string | null;
  pendingAction: 'report' | 'priority_call' | null;
  // Calculator awareness (Task 4)
  hasUsedCalculator: boolean;
  lastCalculatorAdvantage: CalculatorAdvantage | null;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  handleActionClick: (action: ChatAction) => void;
  clearHistory: () => void;
  setLeadIdentity: (leadId: string) => void;
  closeReport: () => void;
  openReportById: (reportId: string) => Promise<void>;
  openLastReport: () => Promise<void>;
  closeLeadCapture: () => void;
  onLeadCaptured: (newLeadId: string) => void;
  closePriorityCall: () => void;
  triggerPriorityCall: () => Promise<void>;
  // Calculator awareness setter
  setCalculatorResult: (advantage: CalculatorAdvantage) => void;
}

const SelenaChatContext = createContext<SelenaChatContextType | undefined>(undefined);

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getStoredHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Selena] Failed to load chat history:', e);
  }
  return [];
}

function saveHistory(messages: ChatMessage[]): void {
  try {
    // Keep only last MAX_HISTORY messages
    const trimmed = messages.slice(-MAX_HISTORY);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[Selena] Failed to save chat history:', e);
  }
}

function getStoredLeadId(): string | null {
  try {
    return localStorage.getItem(LEAD_ID_KEY);
  } catch {
    return null;
  }
}

function saveLeadId(leadId: string): void {
  try {
    localStorage.setItem(LEAD_ID_KEY, leadId);
  } catch (e) {
    console.warn('[Selena] Failed to save lead ID:', e);
  }
}

export function SelenaChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [report, setReport] = useState<ReportState>({
    isOpen: false,
    isGenerating: false,
    title: '',
    markdown: '',
  });
  const [priorityCall, setPriorityCall] = useState<PriorityCallState>({
    isOpen: false,
    isLoading: false,
    bookingUrl: '',
    slots: [],
  });
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'report' | 'priority_call' | null>(null);
  
  // Track if user has generated any reports (for "View My Latest Report" visibility)
  const [hasReports, setHasReports] = useState(false);
  
  // Calculator awareness state (Task 4)
  const [hasUsedCalculator, setHasUsedCalculator] = useState(false);
  const [lastCalculatorAdvantage, setLastCalculatorAdvantage] = useState<CalculatorAdvantage | null>(null);
  
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ref to always have current language in async callbacks (prevents stale closures)
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const closeReport = useCallback(() => {
    setReport(prev => ({ ...prev, isOpen: false }));
  }, []);

  const closeLeadCapture = useCallback(() => {
    setShowLeadCapture(false);
    setPendingReportId(null);
    setPendingAction(null);
  }, []);

  const closePriorityCall = useCallback(() => {
    setPriorityCall(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Initialize session, load history and stored lead ID
  useEffect(() => {
    if (!hasInitialized) {
      initSessionContext(language);
      const history = getStoredHistory();
      setMessages(history);
      const storedLeadId = getStoredLeadId();
      if (storedLeadId) {
        setLeadId(storedLeadId);
      }
      setHasInitialized(true);
    }
  }, [hasInitialized, language]);

  // Update context when route changes
  useEffect(() => {
    if (hasInitialized) {
      updateSessionContext({ last_page: location.pathname });
    }
  }, [location.pathname, hasInitialized]);

  // Listen for proactive message events (e.g., loss aversion triggers)
  useEffect(() => {
    const handleProactiveMessage = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      const proactiveMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: customEvent.detail.message,
        timestamp: new Date().toISOString(),
        suggestedReplies: [
          t("Yes, explain the difference", "Sí, explícame la diferencia"),
          t("I'd like to talk to Kasandra", "Me gustaría hablar con Kasandra"),
          t("Not right now", "Ahora no"),
        ],
      };
      setMessages(prev => {
        const updated = [...prev, proactiveMsg];
        saveHistory(updated);
        return updated;
      });
      logEvent('selena_proactive_loss_aversion', { 
        route: location.pathname,
        difference_amount: customEvent.detail.message.match(/\$[\d,]+/)?.[0] || 'unknown'
      });
    };
    
    window.addEventListener('selena-proactive-message', handleProactiveMessage);
    return () => window.removeEventListener('selena-proactive-message', handleProactiveMessage);
  }, [t, location.pathname]);

  // Listen for booking confirmation events (from ConsultationIntakeForm success)
  useEffect(() => {
    const handleBookingConfirmation = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      const confirmMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: customEvent.detail.message,
        timestamp: new Date().toISOString(),
        suggestedReplies: [
          t("What happens after I book?", "¿Qué pasa después de reservar?"),
          t("Can I reschedule if needed?", "¿Puedo reprogramar si es necesario?"),
          t("Thanks, Selena!", "¡Gracias, Selena!"),
        ],
      };
      setMessages(prev => {
        const updated = [...prev, confirmMsg];
        saveHistory(updated);
        return updated;
      });
      logEvent('selena_booking_confirmation', { route: location.pathname });
    };
    
    window.addEventListener('selena-booking-confirmation', handleBookingConfirmation);
    return () => window.removeEventListener('selena-booking-confirmation', handleBookingConfirmation);
  }, [t, location.pathname]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    logSelenaOpen(location.pathname);
    
    // Add greeting if no messages
    if (messages.length === 0) {
      const context = getSessionContext();
      let greetingContent: string;
      let suggestedReplies: string[];
      
      // Check if user is on a guide page
      const guideId = context?.last_guide_id;
      const guideEntry = guideId ? getGuideById(guideId) : null;
      const isOnGuidePage = location.pathname.includes('/v2/guides/');
      
      if (guideEntry && isOnGuidePage) {
        // Guide-aware greeting
        const guideTitle = language === 'es' ? guideEntry.titleEs : guideEntry.titleEn;
        
        greetingContent = t(
          `I see you're reading "${guideTitle}." Would you like a personalized checklist based on this guide?`,
          `Veo que estás leyendo "${guideTitle}." ¿Te gustaría una lista de verificación personalizada basada en esta guía?`
        );
        
        // Contextual suggested replies based on guide category
        if (guideEntry.category === 'buying') {
          suggestedReplies = [
            t("Yes, send me the checklist", "Sí, envíame la lista"),
            t("I have a question about buying", "Tengo una pregunta sobre comprar"),
            t("Not right now", "Ahora no"),
          ];
        } else if (guideEntry.category === 'selling' || guideEntry.category === 'valuation') {
          suggestedReplies = [
            t("Yes, send me the checklist", "Sí, envíame la lista"),
            t("What's my home worth?", "¿Cuánto vale mi casa?"),
            t("Not right now", "Ahora no"),
          ];
        } else {
          // Stories
          suggestedReplies = [
            t("I'd like similar guidance", "Me gustaría orientación similar"),
            t("Tell me more about your services", "Cuéntame más sobre tus servicios"),
            t("Not right now", "Ahora no"),
          ];
        }
      } else {
        // Default greeting
        greetingContent = t(
          "Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?",
          "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarte a explorar tus opciones con calma y sin presión.\n\n¿Estás pensando en comprar, vender, o solo explorar qué es posible?"
        );
        suggestedReplies = [
          t("I'm thinking about selling", "Estoy pensando en vender"),
          t("I'm looking to buy", "Estoy buscando comprar"),
          t("Just exploring for now", "Solo estoy explorando"),
        ];
      }
      
      const greeting: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: greetingContent,
        timestamp: new Date().toISOString(),
        suggestedReplies,
      };
      setMessages([greeting]);
      saveHistory([greeting]);
    }
  }, [messages.length, location.pathname, t, language]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    logSelenaClose(location.pathname);
  }, [location.pathname]);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveHistory(newMessages);
    logSelenaMessageUser(content, location.pathname);

    setIsLoading(true);

    try {
      const context = getSessionContext();
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/selena-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: content,
            context: {
              session_id: context?.session_id || '',
              route: location.pathname,
              language: languageRef.current, // Use ref to always get current language
              utm_source: context?.utm_source,
              utm_campaign: context?.utm_campaign,
              intent: context?.intent,
              last_guide_id: context?.last_guide_id,
              lead_id: leadId, // Pass existing lead_id to maintain identity
            },
            history,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Store lead_id if returned (identity upgraded from anonymous to known)
      if (data.lead_id && data.lead_id !== leadId) {
        setLeadId(data.lead_id);
        saveLeadId(data.lead_id);
        console.log('[Selena] Lead identity captured:', data.lead_id);
      }
      
      // Sync detected intent to SessionContext (Intent-Aware Filtering)
      // Use write-once to respect user-declared intent from quiz/URL
      if (data.detected_intent) {
        const applied = setFieldIfEmpty('intent', data.detected_intent);
        if (applied) {
          console.log('[Selena] Intent set to SessionContext:', data.detected_intent);
        } else {
          console.log('[Selena] Intent detection skipped (already declared):', data.detected_intent);
        }
      }
      
      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.reply || t(
          "I'm here to help! What would you like to know?",
          "¡Estoy aquí para ayudar! ¿Qué te gustaría saber?"
        ),
        timestamp: new Date().toISOString(),
        actions: data.actions || [],
        suggestedReplies: data.suggestedReplies || [],
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
      logSelenaMessageAI(data.reply || '', location.pathname, (data.actions?.length || 0) > 0);

    } catch (error) {
      console.error('[Selena] Chat error:', error);
      
      // Graceful fallback
      const fallbackMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: t(
          "I'm having a moment - but don't worry, I'm still here to help. What would you like to explore?",
          "Estoy teniendo un momento - pero no te preocupes, sigo aquí para ayudarte. ¿Qué te gustaría explorar?"
        ),
        timestamp: new Date().toISOString(),
        suggestedReplies: [
          t("I'm thinking about selling", "Estoy pensando en vender"),
          t("I'm looking to buy", "Estoy buscando comprar"),
          t("Just exploring for now", "Solo estoy explorando"),
        ],
      };
      
      const updatedMessages = [...newMessages, fallbackMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, location.pathname, t, leadId]); // languageRef.current always current, no dep needed

  const generateReport = useCallback(async (action: ChatAction) => {
    if (!action.reportType || !leadId) {
      console.warn('[Selena] Cannot generate report: missing reportType or leadId');
      return;
    }

    logEvent('report_generate_start', {
      report_type: action.reportType,
      lead_id: leadId,
    });

    setReport(prev => ({
      ...prev,
      isGenerating: true,
      title: getReportTitle(action.reportType!, t),
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            lead_id: leadId,
            report_type: action.reportType,
            context: action.context || {},
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      logEvent('report_generate_success', {
        report_id: data.report_id,
        report_type: action.reportType,
      });

      setReport({
        isOpen: true,
        isGenerating: false,
        title: getReportTitle(action.reportType!, t),
        markdown: data.report_markdown,
        reportId: data.report_id,
        reportType: action.reportType,
      });
      
      // Mark that user has generated at least one report
      setHasReports(true);

      // Update the last message with report metadata
      setMessages(prev => {
        const updated = [...prev];
        // Find last assistant message index (compatible alternative to findLastIndex)
        let lastAssistantIdx = -1;
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === 'assistant') {
            lastAssistantIdx = i;
            break;
          }
        }
        if (lastAssistantIdx !== -1) {
          updated[lastAssistantIdx] = {
            ...updated[lastAssistantIdx],
            metadata: {
              report_id: data.report_id,
              report_type: action.reportType,
            },
          };
        }
        return updated;
      });

    } catch (error) {
      console.error('[Selena] Report generation error:', error);
      
      logEvent('report_generate_error', {
        report_type: action.reportType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      setReport(prev => ({ ...prev, isGenerating: false }));
      
      // Add error message to chat - NO BOOKING CTA (Earned Access rule)
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: t(
          "I couldn't generate your report right now. Let me try again, or I can help you explore your options another way.",
          "No pude generar tu reporte en este momento. Déjame intentar de nuevo, o puedo ayudarte a explorar tus opciones de otra manera."
        ),
        timestamp: new Date().toISOString(),
        // No hardcoded booking actions - let Selena AI handle earned access gating
        suggestedReplies: [
          t("Try again", "Intentar de nuevo"),
          t("What are my options?", "¿Cuáles son mis opciones?"),
        ],
      };
      setMessages(prev => [...prev, errorMessage]);
      saveHistory([...messages, errorMessage]);
    }
  }, [leadId, t, messages]);

  // Fetch and open an existing report by ID
  const openReportById = useCallback(async (reportId: string) => {
    // Check if lead identity exists
    if (!leadId) {
      // Store pending report ID and open lead capture
      setPendingReportId(reportId);
      setShowLeadCapture(true);
      return;
    }

    setReport(prev => ({
      ...prev,
      isGenerating: true,
      title: t('Loading Report', 'Cargando Reporte'),
    }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            lead_id: leadId,
            report_id: reportId,
          }),
        }
      );

      const data = await response.json();

      if (!data.ok || !data.report) {
        console.error('[Selena] Report not found:', data.error);
        setReport(prev => ({ ...prev, isGenerating: false }));
        
        // Add error message to chat
        const errorMessage: ChatMessage = {
          id: generateMessageId(),
          role: 'assistant',
          content: t(
            "I couldn't find that report. It may have been created under a different email, or it may no longer exist.",
            "No pude encontrar ese reporte. Puede que haya sido creado con otro correo, o que ya no exista."
          ),
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      logEvent('report_view', {
        report_id: reportId,
        report_type: data.report.report_type,
        source: 'chat_reopen',
      });

      setReport({
        isOpen: true,
        isGenerating: false,
        title: getReportTitle(data.report.report_type, t),
        markdown: data.report.report_markdown,
        reportId: data.report.id,
        reportType: data.report.report_type,
      });

    } catch (error) {
      console.error('[Selena] Error fetching report:', error);
      setReport(prev => ({ ...prev, isGenerating: false }));
    }
  }, [leadId, t]);

  const handleActionClick = useCallback((action: ChatAction) => {
    logChatActionClick(action.label, action.href, location.pathname);
    
    // Handle report generation actions (check multiple possible field names)
    const isReportAction = 
      action.actionType === 'generate_report' || 
      action.type === 'generate_report' || 
      action.id === 'generate_report';
    
    if (isReportAction) {
      generateReport(action);
      return;
    }

    // Handle open existing report actions
    const isOpenReportAction = 
      action.actionType === 'open_report' || 
      action.type === 'open_report' || 
      action.id === 'open_report';
    
    if (isOpenReportAction && action.reportId) {
      openReportById(action.reportId);
      return;
    }

    // Handle priority call actions
    const isPriorityCallAction =
      action.actionType === 'priority_call' ||
      action.type === 'priority_call' ||
      action.id === 'priority_call';
    
    if (isPriorityCallAction) {
      // Trigger priority call - handled inline to avoid circular dependency
      if (!leadId) {
        setPendingAction('priority_call');
        setShowLeadCapture(true);
      } else {
        // Will be handled by triggerPriorityCall after render
        setTimeout(() => {
          const event = new CustomEvent('selena-priority-call');
          window.dispatchEvent(event);
        }, 0);
      }
      return;
    }
    
    if (action.href) {
      closeChat();
      navigate(action.href);
    }
  }, [navigate, closeChat, location.pathname, generateReport, openReportById, leadId]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);

  // Allow external components to set lead identity
  const setLeadIdentity = useCallback((newLeadId: string) => {
    if (newLeadId && newLeadId !== leadId) {
      setLeadId(newLeadId);
      saveLeadId(newLeadId);
      console.log('[Selena] Lead identity set externally:', newLeadId);
    }
  }, [leadId]);

  // Callback when lead is captured via modal - resume pending action
  const onLeadCaptured = useCallback((newLeadId: string) => {
    setLeadIdentity(newLeadId);
    setShowLeadCapture(false);
    
    const currentPendingAction = pendingAction;
    const currentPendingReportId = pendingReportId;
    setPendingAction(null);
    setPendingReportId(null);
    
    // Resume pending action
    setTimeout(() => {
      if (currentPendingAction === 'priority_call') {
        triggerPriorityCall();
      } else if (currentPendingReportId) {
        if (currentPendingReportId === 'LAST') {
          openLastReport();
        } else {
          openReportById(currentPendingReportId);
        }
      }
    }, 100);
  }, [setLeadIdentity, pendingAction, pendingReportId, openReportById]);

  // Open the user's last report (shortcut from UI)
  const openLastReport = useCallback(async () => {
    logEvent('my_report_click', { route: location.pathname });

    // If no lead identity, set pending as LAST and open lead capture
    if (!leadId) {
      setPendingReportId('LAST');
      setPendingAction('report');
      setShowLeadCapture(true);
      return;
    }

    setReport(prev => ({
      ...prev,
      isGenerating: true,
      title: t('Loading Report', 'Cargando Reporte'),
    }));

    try {
      // Fetch the last report ID
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-last-report-id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ lead_id: leadId }),
        }
      );

      const data = await response.json();

      if (!data.ok || !data.report_id) {
        // No reports found - show empty state
        logEvent('report_empty_state_shown', { lead_id: leadId });
        setReport({
          isOpen: true,
          isGenerating: false,
          title: t('My Report', 'Mi Reporte'),
          markdown: '',
          reportId: undefined,
          reportType: 'empty',
        });
        return;
      }

      // Open the report by ID
      setReport(prev => ({ ...prev, isGenerating: false }));
      await openReportById(data.report_id);
    } catch (error) {
      console.error('[Selena] Error fetching last report:', error);
      logEvent('report_error', { stage: 'fetch', message: 'Failed to fetch last report' });
      setReport(prev => ({ ...prev, isGenerating: false }));
    }
  }, [leadId, t, location.pathname, openReportById]);

  // Generate chat summary for handoff
  const generateChatSummary = useCallback((): { markdown: string; json: Record<string, unknown> } => {
    const lastMessages = messages.slice(-8);
    const summaryLines: string[] = [];
    
    // Extract structured data from conversation
    const summaryJson: Record<string, unknown> = {
      intent: null,
      situation: null,
      timeline: null,
      condition: null,
      pain_points: [],
      desired_outcome: null,
      address_if_known: null,
      urgency_level: 'medium',
    };
    
    for (const msg of lastMessages) {
      const role = msg.role === 'user' ? 'User' : 'Selena';
      const content = msg.content.substring(0, 200);
      summaryLines.push(`${role}: ${content}`);
      
      // Try to extract structured data from user messages
      if (msg.role === 'user') {
        const lower = content.toLowerCase();
        if (lower.includes('cash') || lower.includes('offer')) {
          summaryJson.intent = 'cash'; // Canonical value
        }
        if (lower.includes('sell') || lower.includes('selling')) {
          summaryJson.intent = summaryJson.intent || 'sell';
        }
        if (lower.includes('asap') || lower.includes('urgent') || lower.includes('fast')) {
          summaryJson.urgency_level = 'high';
          summaryJson.timeline = 'asap';
        }
        if (lower.includes('inherit') || lower.includes('estate')) {
          summaryJson.situation = 'inherited';
        }
      }
    }
    
    return {
      markdown: summaryLines.join('\n\n'),
      json: summaryJson,
    };
  }, [messages]);

  // Create handoff with channel selection
  const createHandoffWithChannel = useCallback(async (
    channel: HandoffChannel,
    selectedSlot?: { start: string; label: string; booking_url: string } | null,
    contactPref?: 'call' | 'text'
  ): Promise<{ bookingUrl: string; slots: TimeSlot[]; handoffId?: string }> => {
    if (!leadId) {
      throw new Error('No lead_id available');
    }

    const { markdown: summaryMd, json: summaryJson } = generateChatSummary();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-handoff`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          lead_id: leadId,
          channel,
          priority: 'hot',
          reason: 'User requested direct help / urgent situation',
          summary_md: summaryMd,
          summary_json: summaryJson,
          recommended_next_step: 'Book 10-min call',
          selected_slot: selectedSlot || null,
          contact_pref: contactPref || null,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to create handoff');
    }

    logEvent('handoff_create_success', {
      handoff_id: data.handoff_id,
      booking_url: data.booking_url,
      channel,
    });

    return {
      bookingUrl: data.booking_url || '/v2/book',
      slots: data.slots || [],
      handoffId: data.handoff_id,
    };
  }, [leadId, generateChatSummary]);

  // Trigger priority call handoff
  const triggerPriorityCall = useCallback(async () => {
    // If no lead identity, capture first
    if (!leadId) {
      setPendingAction('priority_call');
      setShowLeadCapture(true);
      return;
    }

    logEvent('handoff_create_start', { lead_id: leadId });

    // Open modal immediately in channel selection mode
    setPriorityCall({
      isOpen: true,
      isLoading: false,
      bookingUrl: '/v2/book',
      slots: [],
      onChannelSelect: async (channel: HandoffChannel) => {
        try {
          const result = await createHandoffWithChannel(channel);
          return { bookingUrl: result.bookingUrl, slots: result.slots };
        } catch (error) {
          console.error('[Selena] Error creating handoff:', error);
          logEvent('handoff_create_error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            channel,
          });
          // Return fallback
          return { bookingUrl: `/v2/book?channel=${channel}&callback=true`, slots: [] };
        }
      },
      onRequestCallback: async (channel: HandoffChannel, contactPref?: 'call' | 'text') => {
        try {
          await createHandoffWithChannel(channel, null, contactPref);
          logEvent('handoff_request_callback', { channel, contact_pref: contactPref });
        } catch (error) {
          console.error('[Selena] Error creating callback handoff:', error);
          logEvent('handoff_create_error', {
            error: error instanceof Error ? error.message : 'Unknown error',
            channel,
            contact_pref: contactPref,
          });
        }
      },
    });

  }, [leadId, createHandoffWithChannel]);

  // Listen for priority call events (avoids circular dependency)
  useEffect(() => {
    const handler = () => triggerPriorityCall();
    window.addEventListener('selena-priority-call', handler);
    return () => window.removeEventListener('selena-priority-call', handler);
  }, [triggerPriorityCall]);

  // Set calculator result - for Selena awareness (Task 4)
  const setCalculatorResult = useCallback((advantage: CalculatorAdvantage) => {
    setHasUsedCalculator(true);
    setLastCalculatorAdvantage(advantage);
    console.log('[Selena] Calculator result set:', advantage);
  }, []);

  return (
    <SelenaChatContext.Provider
      value={{
        isOpen,
        messages,
        isLoading,
        leadId,
        hasReports,
        report,
        priorityCall,
        showLeadCapture,
        pendingReportId,
        pendingAction,
        hasUsedCalculator,
        lastCalculatorAdvantage,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        handleActionClick,
        clearHistory,
        setLeadIdentity,
        closeReport,
        openReportById,
        openLastReport,
        closeLeadCapture,
        onLeadCaptured,
        closePriorityCall,
        triggerPriorityCall,
        setCalculatorResult,
      }}
    >
      {children}
    </SelenaChatContext.Provider>
  );
}

function getReportTitle(reportType: string, t: (en: string, es: string) => string): string {
  switch (reportType) {
    case 'net_sheet':
      return t('Your Net Sheet Analysis', 'Análisis de tu Ganancia Neta');
    case 'buyer_readiness':
      return t('Buyer Readiness Report', 'Reporte de Preparación del Comprador');
    case 'cash_comparison':
      return t('Cash vs. Listing Comparison', 'Comparación: Efectivo vs. Listado');
    case 'home_value_preview':
      return t('Your Home Value Preview', 'Vista Previa del Valor de Su Casa');
    default:
      return t('Your Personalized Report', 'Tu Reporte Personalizado');
  }
}

export function useSelenaChat() {
  const context = useContext(SelenaChatContext);
  if (!context) {
    throw new Error('useSelenaChat must be used within SelenaChatProvider');
  }
  return context;
}
