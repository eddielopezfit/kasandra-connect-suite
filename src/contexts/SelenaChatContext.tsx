import { supabase } from '@/integrations/supabase/client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getSessionContext, 
  initSessionContext, 
  updateSessionContext,
  setFieldIfEmpty,
  getGuidesCompleted,
} from '@/lib/analytics/selenaSession';
import { appendTrail, serializeTrailForSelena } from '@/lib/analytics/sessionTrail';
import {
  logSelenaOpen,
  logSelenaClose,
  logSelenaMessageUser,
  logSelenaMessageAI,
  logChatActionClick,
  logEvent,
} from '@/lib/analytics/logEvent';
import { getGuideById } from '@/lib/guides/guideRegistry';

import { 
  EntryContext, 
  ChatMessage, 
  ChatAction, 
  ReportState, 
  CalculatorAdvantage,
  ChipMeta
} from './selena/types';
import {
  generateMessageId,
  getStoredHistory,
  saveHistory,
  getStoredLeadId,
  saveLeadId,
  LAST_ENTRY_SIG_KEY,
  CHAT_HISTORY_KEY
} from './selena/identityManager';

export * from './selena/types';
import {
  mapChipsToActionSpecs,
  getPhaseAwareChips
} from './selena/chipGovernance';
import { computeGreeting } from './selena/greetingEngine';
import {
  generateReport,
  openReportById,
  openLastReport
} from './selena/reportManager';

const INHERITED_HOME_SIGNAL = /inherited|inheritance|estate|passed away|lost.*(?:grand|parent|mom|dad|father|mother)|(?:grand|parent|mom|dad).*passed|family home|deceased|left me|left us|died|falleci[oó]|herencia|heredé|propiedad.*familia/i;
const TRUST_SIGNAL = /she seems|he seems|looks trustworthy|saw.*social|social media|heard about|referred|recommended|friend said|family said|seems pleasant|seems nice|seems legit|parece confiable|me recomendaron|vi.*redes sociales/i;

interface SelenaChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  leadId: string | null;
  report: ReportState;
  showLeadCapture: boolean;
  pendingReportId: string | null;
  pendingAction: 'report' | null;
  hasUsedCalculator: boolean;
  lastCalculatorAdvantage: CalculatorAdvantage | null;
  openChat: (entryContextOrEvent?: EntryContext | React.MouseEvent) => void;
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
  setCalculatorResult: (advantage: CalculatorAdvantage) => void;
}

const SelenaChatContext = createContext<SelenaChatContextType | undefined>(undefined);

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
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'report' | null>(null);
  const [hasUsedCalculator, setHasUsedCalculator] = useState(false);
  const [lastCalculatorAdvantage, setLastCalculatorAdvantage] = useState<CalculatorAdvantage | null>(null);
  
  const { language, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
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

  // P1.1: Session snapshot restoration handled by V2Layout — removed duplicate call here

  useEffect(() => {
    if (hasInitialized) {
      updateSessionContext({ last_page: location.pathname });
      appendTrail(location.pathname);
    }
  }, [location.pathname, hasInitialized]);

  // Issue #1 fix: Detect language change and refresh greeting if stored history
  // contains a greeting in the wrong language (prevents stale EN greeting in ES mode)
  useEffect(() => {
    if (!hasInitialized || isOpen || messages.length === 0) return;
    const firstMsg = messages[0];
    if (firstMsg?.role !== 'assistant') return;
    const greetingLang = firstMsg.metadata?.greeting_language;
    if (!greetingLang || greetingLang === language) return;
    
    // Language mismatch detected — only user has the initial greeting (no user messages yet)
    const hasUserMessages = messages.some(m => m.role === 'user');
    if (hasUserMessages) return; // Don't wipe mid-conversation
    
    // Re-compute greeting in new language
    const sessionContext = getSessionContext();
    const result = computeGreeting(undefined, sessionContext, [], false, t, language, serializeTrailForSelena());
    if (result && result.greetingContent) {
      const freshGreeting: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: result.greetingContent,
        timestamp: new Date().toISOString(),
        suggestedReplies: result.suggestedReplies,
        metadata: { greeting_language: language as 'en' | 'es' },
      };
      setMessages([freshGreeting]);
      saveHistory([freshGreeting]);
    }
    // Initialization effect — must only run on language/init/open changes,
    // NOT on every message append or `t` re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, hasInitialized, isOpen]);

  useEffect(() => {
    const handleProactiveMessage = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      const proactiveMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: customEvent.detail.message,
        timestamp: new Date().toISOString(),
        suggestedReplies: [
          { label: t("Yes, explain the difference", "Sí, explícame la diferencia") },
          { label: t("I'd like to talk to Kasandra", "Me gustaría hablar con Kasandra") },
          { label: t("Not right now", "Ahora no") },
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

  useEffect(() => {
    const handleBookingConfirmation = (event: Event) => {
      const customEvent = event as CustomEvent<{ message: string }>;
      const confirmMsg: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: customEvent.detail.message,
        timestamp: new Date().toISOString(),
        suggestedReplies: [
          { label: t("What happens after I book?", "¿Qué pasa después de reservar?") },
          { label: t("Can I reschedule if needed?", "¿Puedo reprogramar si es necesario?") },
          { label: t("Thanks, Selena!", "¡Gracias, Selena!") },
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

  const openChat = useCallback((entryContextOrEvent?: EntryContext | React.MouseEvent) => {
    setIsOpen(true);
    logSelenaOpen(location.pathname);
    
    const entryContext: EntryContext | undefined = 
      entryContextOrEvent && 'source' in entryContextOrEvent 
        ? entryContextOrEvent 
        : undefined;
    
    const pagePath = location.pathname;
    const isGuidePage = /^\/v2\/guides\/.+$/.test(pagePath);
    const entryUpdates: Record<string, unknown> = {
      entry_source: entryContext?.source || (isGuidePage ? 'guide_fab' : 'fab'),
      last_seen_page_path: pagePath,
      last_seen_page_type: isGuidePage ? 'guide' : pagePath.includes('/quiz') ? 'quiz' : pagePath.includes('/readiness') || pagePath.includes('/cash-offer') ? 'tool' : 'page',
      last_opened_at: new Date().toISOString(),
    };
    if (entryContext?.guideId) {
      entryUpdates.entry_guide_id = entryContext.guideId;
      entryUpdates.entry_guide_title = entryContext.guideTitle || null;
      entryUpdates.entry_guide_category = entryContext.guideCategory || null;
      entryUpdates.last_guide_id = entryContext.guideId;
    } else if (isGuidePage) {
      const guideMatch = pagePath.match(/^\/v2\/guides\/(.+)$/);
      if (guideMatch) {
        const gId = guideMatch[1];
        const entry = getGuideById(gId);
        if (entry) {
          entryUpdates.entry_guide_id = gId;
          entryUpdates.entry_guide_title = languageRef.current === 'es' ? entry.titleEs : entry.titleEn;
          entryUpdates.entry_guide_category = entry.category;
          entryUpdates.last_guide_id = gId;
        }
      }
    }
    if (entryContext?.intent) {
      setFieldIfEmpty('intent', entryContext.intent as import('@/lib/analytics/selenaSession').Intent);
    }
    if (entryContext?.closingCostData) {
      updateSessionContext({ closing_cost_data: entryContext.closingCostData });
    }
    if (entryContext?.sellerCalcData) {
      updateSessionContext({ seller_calc_data: entryContext.sellerCalcData });
    }
    if (entryContext?.readinessData) {
      updateSessionContext({ readiness_entry_data: entryContext.readinessData });
    }
    if (entryContext?.offMarketData) {
      updateSessionContext({ off_market_data: entryContext.offMarketData });
    }
    if (entryContext?.neighborhoodCompareData) {
      updateSessionContext({ neighborhood_compare_data: entryContext.neighborhoodCompareData });
    }
    if (entryContext?.marketIntelData) {
      updateSessionContext({ market_intel_data: entryContext.marketIntelData });
    }
    updateSessionContext(entryUpdates);

    logEvent('selena_opened', {
      entry_source: entryUpdates.entry_source,
      entry_guide_id: entryUpdates.entry_guide_id || null,
      page_path: pagePath,
    });
    
    if (entryContext) {
      logEvent('selena_entry', { 
        source: entryContext.source, 
        route: pagePath,
        has_calculator_result: !!entryContext.calculatorAdvantage,
        has_guide_context: !!entryContext.guideId,
      });
    }

    const calcRunId = entryContext?.source === 'calculator' ? (getSessionContext()?.calculator_run_id || '') : '';
    const entrySig = entryContext 
      ? `${entryContext.source}|${entryContext.intent || ''}|${entryContext.guideId || ''}|${pagePath}${calcRunId ? `|${calcRunId}` : ''}`
      : null;
    const lastSig = localStorage.getItem(LAST_ENTRY_SIG_KEY);
    const isNewEntry = entrySig && entrySig !== lastSig;
    if (entrySig && isNewEntry) {
      localStorage.setItem(LAST_ENTRY_SIG_KEY, entrySig);
    }

    const sessionContext = getSessionContext();
    const isMeaningfulSource = entryContext && entryContext.source !== 'floating' && entryContext.source !== 'proactive';
    // Fork sources always start fresh — clear localStorage synchronously before greeting computation
    const isForkSource = entryContext?.source === 'buyer_fork' || entryContext?.source === 'seller_fork';
    if (isForkSource) {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    }
    const storedHistoryExists = isForkSource ? false : (messages.length > 0 || !!localStorage.getItem(CHAT_HISTORY_KEY));
    const hasContextualEntry = isMeaningfulSource && isNewEntry;

    // FIX 5: Pass session trail to greeting engine for trail-aware greetings
    const result = computeGreeting(entryContext, sessionContext, messages, storedHistoryExists, t, language, serializeTrailForSelena());

    if (result) {
      const greeting: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: result.greetingContent,
        timestamp: new Date().toISOString(),
        suggestedReplies: result.suggestedReplies,
        metadata: { greeting_language: language as 'en' | 'es' },
      };

      if (!result.greetingContent) {
        // No-op
      } else if (!isForkSource && messages.length > 0 && hasContextualEntry) {
        const updatedMessages = [...messages, greeting];
        setMessages(updatedMessages);
        saveHistory(updatedMessages);
      } else {
        setMessages([greeting]);
        saveHistory([greeting]);
      }

      if (entryContext?.prefillMessage) {
        localStorage.setItem('selena_prefill_message', entryContext.prefillMessage);
      }
    }
  }, [messages, location.pathname, t, language]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    logSelenaClose(location.pathname);
  }, [location.pathname]);

  const toggleChat = useCallback(() => {
    if (isOpen) closeChat();
    else openChat({ source: 'floating' });
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
      // V2: Server-side conversation persistence for cross-device memory
      if (leadId) {
        supabase.functions.invoke('upsert-conversation', {
          body: {
            session_id: getSessionContext()?.session_id || '',
            lead_id: leadId,
            messages: newMessages,
            turn_count: newMessages.filter((m: { role: string }) => m.role === 'user').length,
            language: languageRef.current,
          },
        }).catch(() => {}); // Non-blocking, fail silently
      }
    logSelenaMessageUser(content, location.pathname);

    setIsLoading(true);

    const normalizedMessage = content.trim().toLowerCase();
    const detectedInheritedHome = INHERITED_HOME_SIGNAL.test(normalizedMessage);
    const detectedTrustSignal = TRUST_SIGNAL.test(normalizedMessage);

    if (detectedInheritedHome || detectedTrustSignal) {
      updateSessionContext({
        ...(detectedInheritedHome ? { inherited_home: true } : {}),
        ...(detectedTrustSignal ? { trust_signal_detected: true } : {}),
      });
    }

    try {
      // FIX: Refresh tools_completed at every message send to prevent stale chip loops
      const freshContext = getSessionContext();
      const context = freshContext;
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
              language: languageRef.current,
              utm_source: context?.utm_source,
              utm_campaign: context?.utm_campaign,
              intent: context?.intent,
              timeline: context?.timeline,
              last_guide_id: context?.last_guide_id,
              lead_id: leadId,
              inherited_home: context?.inherited_home ?? false,
              trust_signal_detected: context?.trust_signal_detected ?? false,
              // FIX 6: Renamed from tool_used
              last_tool_completed: context?.last_tool_completed,
              last_tool_result: context?.last_tool_result,
              quiz_completed: context?.quiz_completed ?? false,
              guides_read: context?.guides_read ?? (context?.last_guide_id ? 1 : 0),
              situation: context?.situation,
              seller_decision_recommended_path: context?.seller_decision_recommended_path,
              seller_goal_priority: context?.seller_goal_priority,
              property_condition_raw: context?.property_condition_raw,
              tools_completed: context?.tools_completed ?? [],
              // FIX 2: Pass completed guides for server-side filtering
              guides_completed: getGuidesCompleted(),
              calculator_advantage: lastCalculatorAdvantage ?? undefined,
              estimated_value: context?.estimated_value,
              estimated_budget: context?.estimated_budget,
              calculator_difference: context?.calculator_difference,
              mortgage_balance: context?.mortgage_balance,
              current_mode: context?.current_mode,
              chip_phase_floor: context?.chip_phase_floor ?? 0,
              greeting_phase_seen: context?.greeting_phase_seen ?? 0,
              timeline_last_asked_turn: context?.timeline_last_asked_turn,
              turn_count: (context?.turn_count ?? 0) + 1,
              readiness_score: Number.isFinite(context?.readiness_score) ? context!.readiness_score : 0,
              primary_priority: context?.primary_priority,
              quiz_result_path: context?.quiz_result_path,
              calculator_motivation: context?.calculator_motivation,
              last_neighborhood_zip: context?.last_neighborhood_zip,
              session_trail: serializeTrailForSelena(),
              // FIX 4: Persist entry context across all turns
              entry_source: context?.entry_source ?? 'unknown',
              entry_guide_id: context?.entry_guide_id ?? null,
              entry_guide_title: context?.entry_guide_title ?? null,
              closing_cost_data: context?.closing_cost_data ?? null,
              seller_calc_data: context?.seller_calc_data ?? null,
              readiness_entry_data: context?.readiness_entry_data ?? null,
              off_market_data: context?.off_market_data ?? null,
              neighborhood_compare_data: context?.neighborhood_compare_data ?? null,
              market_intel_data: context?.market_intel_data ?? null,
            },
            history,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      
      if (data.lead_id && data.lead_id !== leadId) {
        setLeadId(data.lead_id);
        saveLeadId(data.lead_id);
      }
      
      if (data.detected_intent) setFieldIfEmpty('intent', data.detected_intent);
      
      if (data.current_mode) {
        const existingMode = getSessionContext()?.current_mode ?? 0;
        if (data.current_mode >= existingMode) updateSessionContext({ current_mode: data.current_mode as 1 | 2 | 3 | 4 });
      }

      if (data.chip_phase_floor !== undefined) {
        const existingFloor = getSessionContext()?.chip_phase_floor ?? 0;
        if (data.chip_phase_floor > existingFloor) updateSessionContext({ chip_phase_floor: data.chip_phase_floor });
      }

      if (data.timeline_last_asked_turn !== undefined) updateSessionContext({ timeline_last_asked_turn: data.timeline_last_asked_turn });
      if (data.journey_state) updateSessionContext({ journey_state: data.journey_state });
      
      const currentTurnCount = getSessionContext()?.turn_count ?? 0;
      updateSessionContext({ turn_count: currentTurnCount + 1 });
      
      // Use edge function detected language for chip resolution — respects auto-detected Spanish
      const chipLanguage = (data.language === 'es' || data.language === 'en') ? data.language : languageRef.current;
      const mappedReplies = mapChipsToActionSpecs(data.suggestedReplies || [], chipLanguage);

      const chipMeta: ChipMeta = {
        phase: data.chip_phase ?? data.chip_phase_floor ?? 0,
        mode: data.current_mode ?? 0,
        containment: !!data.containment_active,
        bookingCtaShown: !!data.booking_cta_shown,
      };

      const hasBookingChip = mappedReplies.some((r) => typeof r !== 'string' && r.actionSpec?.type === 'book');
      if (hasBookingChip && (chipMeta.phase >= 3 || chipMeta.mode >= 4 || data.booking_cta_shown)) {
        updateSessionContext({ booking_chips_shown_at: new Date().toISOString() });
      }

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.reply || t("I'm here to help. What would you like to know?", "Estoy aquí para ayudar. ¿Qué te gustaría saber?"),
        timestamp: new Date().toISOString(),
        actions: data.actions || [],
        suggestedReplies: mappedReplies,
        chipMeta,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
      
      import('@/lib/analytics/sessionSnapshot').then(({ saveSnapshot }) => saveSnapshot()).catch(() => {});
      // P8: Track last active timestamp for time-based return greeter
      localStorage.setItem('selena_last_active_at', new Date().toISOString());
      logSelenaMessageAI(data.reply || '', location.pathname, (data.actions?.length || 0) > 0);

      if (import.meta.env.DEV) {
        import('@/lib/analytics/guardTelemetry').then(({ pushGuardTelemetry }) => pushGuardTelemetry(data));
      }

    } catch (error) {
      console.error('[Selena] Message error:', error);
      const ctx = getSessionContext();
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: t("I'm having trouble connecting right now. Here are some quick options:", "Tengo problemas para conectarme ahora. Aquí tienes unas opciones rápidas:"),
        timestamp: new Date().toISOString(),
        suggestedReplies: getPhaseAwareChips(t, ctx),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, leadId, location.pathname, lastCalculatorAdvantage, t]);

  const handleOpenReportById = useCallback(async (reportId: string) => {
    if (!leadId) {
      setPendingReportId(reportId);
      setShowLeadCapture(true);
      return;
    }
    
    setReport(prev => ({ ...prev, isGenerating: true, title: t('Loading Report', 'Cargando Reporte') }));
    const result = await openReportById(reportId, leadId, t);
    
    if (result.reportState) setReport(prev => ({ ...prev, ...result.reportState }));
    if (result.messagesToAdd) {
      setMessages(prev => {
        const updated = [...prev, ...result.messagesToAdd!];
        saveHistory(updated);
        return updated;
      });
    }
  }, [leadId, t]);

  const handleOpenLastReport = useCallback(async () => {
    logEvent('my_report_click', { route: location.pathname });
    if (!leadId) {
      setPendingReportId('LAST');
      setPendingAction('report');
      setShowLeadCapture(true);
      return;
    }

    setReport(prev => ({ ...prev, isGenerating: true, title: t('Loading Report', 'Cargando Reporte') }));
    const result = await openLastReport(leadId, t);
    
    if (result.reportState) setReport(prev => ({ ...prev, ...result.reportState }));
    if (result.messagesToAdd) {
      setMessages(prev => {
        const updated = [...prev, ...result.messagesToAdd!];
        saveHistory(updated);
        return updated;
      });
    }
  }, [leadId, t, location.pathname]);

  const handleActionClick = useCallback(async (action: ChatAction) => {
    logChatActionClick(action.label, action.href, location.pathname);
    
    const isReportAction = action.actionType === 'generate_report' || action.type === 'generate_report' || action.id === 'generate_report';
    if (isReportAction) {
      if (!leadId) {
        setPendingAction('report');
        setShowLeadCapture(true);
        // Save report action somewhere if needed, but standard flow triggers via completion
        return;
      }
      
      setReport(prev => ({ ...prev, isGenerating: true, title: t('Generating Your Report', 'Generando Tu Reporte') }));
      const result = await generateReport(action, leadId, t, languageRef.current as 'en' | 'es');
      
      if (result.reportState) setReport(prev => ({ ...prev, ...result.reportState }));
      if (result.messagesToAdd) {
        setMessages(prev => {
          const updated = [...prev, ...result.messagesToAdd!];
          saveHistory(updated);
          return updated;
        });
      }
      return;
    }

    const isOpenReportAction = action.actionType === 'open_report' || action.type === 'open_report' || action.id === 'open_report';
    if (isOpenReportAction && action.reportId) {
      handleOpenReportById(action.reportId);
      return;
    }

    const isPriorityCallAction = action.actionType === 'priority_call' || action.type === 'priority_call' || action.id === 'priority_call';
    if (isPriorityCallAction) {
      closeChat();
      navigate('/book');
      return;
    }
    
    if (action.href) {
      closeChat();
      navigate(action.href);
    }
  }, [navigate, closeChat, location.pathname, handleOpenReportById, leadId, t]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
    localStorage.removeItem(LAST_ENTRY_SIG_KEY);
    updateSessionContext({ 
      chip_phase_floor: 0, 
      greeting_phase_seen: 0,
      turn_count: 0,
      timeline_last_asked_turn: undefined,
    });
    
    // Read context AFTER updateSessionContext so intent override is reflected
    getSessionContext();
    const greeting: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: t("Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?", "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión.\n\n¿Está pensando en comprar, vender, o solo explorar qué es posible?"),
      timestamp: new Date().toISOString(),
      suggestedReplies: [
        { label: t("I'm thinking about selling", "Estoy pensando en vender") },
        { label: t("I'm looking to buy", "Estoy buscando comprar") },
        { label: t("Just exploring for now", "Solo estoy explorando") },
      ],
      metadata: { greeting_language: language as 'en' | 'es' },
    };
    setMessages([greeting]);
    saveHistory([greeting]);
    logEvent('selena_clear_history', { route: location.pathname });
  }, [t, location.pathname, language]);

  const setLeadIdentity = useCallback((newLeadId: string) => {
    if (newLeadId && newLeadId !== leadId) {
      setLeadId(newLeadId);
      saveLeadId(newLeadId);
    }
  }, [leadId]);

  const onLeadCaptured = useCallback((newLeadId: string) => {
    setLeadIdentity(newLeadId);
    setShowLeadCapture(false);
    
    const currentPendingReportId = pendingReportId;
    setPendingAction(null);
    setPendingReportId(null);
    
    setTimeout(() => {
      if (currentPendingReportId) {
        if (currentPendingReportId === 'LAST') handleOpenLastReport();
        else handleOpenReportById(currentPendingReportId);
      }
    }, 100);
  }, [setLeadIdentity, pendingReportId, handleOpenReportById, handleOpenLastReport]);

  const setCalculatorResult = useCallback((advantage: CalculatorAdvantage) => {
    setHasUsedCalculator(true);
    setLastCalculatorAdvantage(advantage);
  }, []);

  return (
    <SelenaChatContext.Provider
      value={{
        isOpen,
        messages,
        isLoading,
        leadId,
        report,
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
        openReportById: handleOpenReportById,
        openLastReport: handleOpenLastReport,
        closeLeadCapture,
        onLeadCaptured,
        setCalculatorResult,
      }}
    >
      {children}
    </SelenaChatContext.Provider>
  );
}

export function useSelenaChat() {
  const context = useContext(SelenaChatContext);
  if (!context) {
    throw new Error('useSelenaChat must be used within SelenaChatProvider');
  }
  return context;
}

/**
 * useSelenaChatOptional — non-throwing variant for components that may render
 * during HMR transients or outside the provider tree (e.g., top-level banners).
 * Returns null when no provider is mounted; consumers should null-check.
 */
export function useSelenaChatOptional(): SelenaChatContextType | null {
  return useContext(SelenaChatContext) ?? null;
}
