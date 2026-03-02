/**
 * Selena Chat Context
 * Manages chat state across the app with lead identity awareness
 * 
 * ENTRY SOURCE SUPPORT (v2):
 * openChat() now accepts an optional EntryContext parameter for context-aware greetings.
 * Priority order: calculator > guide_handoff > synthesis > hero > floating
 */

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getSessionContext, 
  initSessionContext, 
  updateSessionContext,
  setFieldIfEmpty,
  type SessionContext,
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
import type { ActionSpec } from '@/lib/actions/actionSpec';

// ============= CHIP → ACTIONSPEC MAPPING =============
// Converts known action-bearing string labels to structured ActionSpec objects.
// Uses normalized lowercase matching with whitespace/punctuation tolerance.
type MappedReply = string | { label: string; actionSpec: ActionSpec };

const CHIP_ACTION_MAP: Array<{ pattern: string; actionSpec: ActionSpec }> = [
  {
    pattern: 'estimate my net proceeds',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
  },
  {
    pattern: 'estimar mis ganancias netas',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
  },
  {
    pattern: 'compare cash vs listing',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  {
    pattern: 'comparar efectivo vs listado',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  {
    pattern: 'talk with kasandra',
    actionSpec: { type: 'book', label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
  },
  {
    pattern: 'hablar con kasandra',
    actionSpec: { type: 'book', label: { en: 'Talk with Kasandra', es: 'Hablar con Kasandra' } },
  },
  {
    pattern: 'find a time with kasandra',
    actionSpec: { type: 'book', label: { en: 'Find a time with Kasandra', es: 'Encontrar un horario con Kasandra' } },
  },
  {
    pattern: 'encontrar un horario con kasandra',
    actionSpec: { type: 'book', label: { en: 'Find a time with Kasandra', es: 'Encontrar un horario con Kasandra' } },
  },
  {
    pattern: 'take the readiness check',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },
  {
    pattern: 'tomar la evaluacion de preparacion',
    actionSpec: { type: 'open_tool', toolId: 'buyer-readiness', label: { en: 'Take the readiness check', es: 'Tomar la evaluación de preparación' } },
  },
  {
    pattern: 'take the cash readiness check',
    actionSpec: { type: 'open_tool', toolId: 'cash-readiness', label: { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' } },
  },
  {
    pattern: 'tomar el check de preparacion en efectivo',
    actionSpec: { type: 'open_tool', toolId: 'cash-readiness', label: { en: 'Take the cash readiness check', es: 'Tomar el check de preparación en efectivo' } },
  },
  // Seller decision (primary sell chip — navigate, not tool)
  {
    pattern: 'get my selling options',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },
  {
    pattern: 'ver mis opciones de venta',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },
  // Seller readiness (alternate/Phase 3 chip)
  {
    pattern: 'quick seller readiness check',
    actionSpec: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' } },
  },
  {
    pattern: 'check rapido de preparacion para vender',
    actionSpec: { type: 'open_tool', toolId: 'seller-readiness', label: { en: 'Quick seller readiness check', es: 'Check rápido de preparación para vender' } },
  },
  // Navigate: guides hub
  {
    pattern: 'browse guides',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },
  {
    pattern: 'explorar guias',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },
  // Legacy mapping: "Browse buyer guides" → guides hub
  {
    pattern: 'browse buyer guides',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },
  {
    pattern: 'explorar guias del comprador',
    actionSpec: { type: 'navigate', path: '/v2/guides', label: { en: 'Browse guides', es: 'Explorar guías' } },
  },
  // Legacy safety net: "What's my home worth?" → seller-decision (catch drifted chips)
  {
    pattern: "what's my home worth",
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },
  {
    pattern: 'cuanto vale mi casa',
    actionSpec: { type: 'navigate', path: '/v2/seller-decision', label: { en: 'Get my selling options', es: 'Ver mis opciones de venta' } },
  },
  // Legacy safety net: "Compare cash vs. traditional" → cash-comparison calculator
  {
    pattern: 'compare cash vs traditional',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  {
    pattern: 'comparar efectivo vs tradicional',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  // Legacy: "Comparar efectivo vs. venta tradicional"
  {
    pattern: 'comparar efectivo vs venta tradicional',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Compare cash vs. listing', es: 'Comparar efectivo vs. listado' } },
  },
  // Estimate net proceeds → cash-comparison calculator
  {
    pattern: 'estimate my net proceeds',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
  },
  {
    pattern: 'estimar mis ganancias netas',
    actionSpec: { type: 'run_calculator', calculatorId: 'cash-comparison', label: { en: 'Estimate my net proceeds', es: 'Estimar mis ganancias netas' } },
  },
];

function normalizeChipLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[.,!?¿¡]/g, '')
    .replace(/\s+/g, ' ');
}

function mapChipsToActionSpecs(replies: string[]): MappedReply[] {
  return replies.map((reply) => {
    const normalized = normalizeChipLabel(reply);
    const match = CHIP_ACTION_MAP.find((entry) => normalizeChipLabel(entry.pattern) === normalized);
    if (match) {
      return { label: reply, actionSpec: match.actionSpec };
    }
    return reply; // plain string — stays conversational
  });
}

const CHAT_HISTORY_KEY = 'selena_chat_history';
const LEAD_ID_KEY = 'selena_lead_id';
const LAST_ENTRY_SIG_KEY = 'selena_last_entry_sig';
const MAX_HISTORY = 50;

// ============= PHASE-AWARE HELPERS =============

/**
 * Reads localStorage directly (NOT React state) to determine if stored chat history exists.
 * Must not depend on React state since state may not have hydrated yet.
 */
function hasStoredChatHistory(): boolean {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Derives phase-appropriate fallback chips from chip_phase_floor + intent.
 * Used for error fallback and soft-resume when no chips are available from server.
 */
function getPhaseAwareChips(
  t: (en: string, es: string) => string,
  ctx?: SessionContext | null,
): (string | { label: string; actionSpec: import('@/lib/actions/actionSpec').ActionSpec })[] {
  const floor = ctx?.chip_phase_floor ?? 0;
  const intent = ctx?.intent;

  if (floor >= 3) {
    return mapChipsToActionSpecs([
      t("Estimate my net proceeds", "Estimar mis ganancias netas"),
      t("Talk with Kasandra", "Hablar con Kasandra"),
    ]);
  }
  if (floor >= 2 && (intent === 'sell' || intent === 'cash')) {
    return mapChipsToActionSpecs([
      t("Get my selling options", "Ver mis opciones de venta"),
      t("Compare cash vs. listing", "Comparar efectivo vs. listado"),
    ]);
  }
  if (floor >= 2 && intent === 'buy') {
    return mapChipsToActionSpecs([
      t("Take the readiness check", "Tomar la evaluación de preparación"),
      t("Browse guides", "Explorar guías"),
    ]);
  }
  if (floor >= 2 && intent) {
    // intent is known but not sell/buy/cash — generic Phase 2
    return [
      t("What are my options?", "¿Cuáles son mis opciones?"),
      t("I have a question", "Tengo una pregunta"),
    ];
  }
  // Phase 0/1 — intent unknown
  return [
    t("I'm thinking about selling", "Estoy pensando en vender"),
    t("I'm looking to buy", "Estoy buscando comprar"),
    t("Just exploring for now", "Solo estoy explorando"),
  ];
}

// ============= ENTRY SOURCE TYPES =============
export type EntrySource = 
  | 'calculator' 
  | 'guide_handoff' 
  | 'guide_exit_ramp'
  | 'guide_mid_cta'
  | 'synthesis' 
  | 'hero' 
  | 'floating' 
  | 'footer_nudge'
  | 'proactive'
  | 'question'
  | 'post_booking' // After successful booking - identity reinforcement
  | 'quiz_result' // After completing the path quiz — intent-specific routing
  | 'seller_decision'; // From seller decision wizard consult CTA

export interface EntryContext {
  source: EntrySource;
  // Calculator context
  calculatorAdvantage?: 'cash' | 'traditional' | 'consult';
  calculatorDifference?: number;
  // Guide context
  guideId?: string;
  guideTitle?: string;
  guideCategory?: string;
  // Synthesis context
  guidesReadCount?: number;
  // Post-booking context
  intent?: string;
  userName?: string;
  // Prefill message (for synthesis/question flows)
  prefillMessage?: string;
}

export interface ChipMeta {
  phase: number;
  mode: number;
  containment: boolean;
  bookingCtaShown?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ChatAction[];
  suggestedReplies?: (string | { label: string; actionSpec: import('@/lib/actions/actionSpec').ActionSpec })[];
  chipMeta?: ChipMeta;
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


// Calculator awareness types

// Calculator awareness types
export type CalculatorAdvantage = 'cash' | 'traditional' | 'consult';

interface SelenaChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  leadId: string | null;
  hasReports: boolean; // Track if user has generated any reports
  report: ReportState;
  showLeadCapture: boolean;
  pendingReportId: string | null;
  pendingAction: 'report' | null;
  // Calculator awareness (Task 4)
  hasUsedCalculator: boolean;
  lastCalculatorAdvantage: CalculatorAdvantage | null;
  // Context-aware chat opening (v2) - accepts optional EntryContext or can be used as click handler
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
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<'report' | null>(null);
  
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

  const openChat = useCallback((entryContextOrEvent?: EntryContext | React.MouseEvent) => {
    setIsOpen(true);
    logSelenaOpen(location.pathname);
    
    // Determine if this is an EntryContext or a click event
    const entryContext: EntryContext | undefined = 
      entryContextOrEvent && 'source' in entryContextOrEvent 
        ? entryContextOrEvent 
        : undefined;
    
    // Persist entry context to SessionContext for deterministic greetings
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
      setFieldIfEmpty('intent', entryContext.intent as any);
    }
    updateSessionContext(entryUpdates as any);

    // Emit analytics event
    logEvent('selena_opened', {
      entry_source: entryUpdates.entry_source,
      entry_guide_id: entryUpdates.entry_guide_id || null,
      page_path: pagePath,
    });
    
    // Log entry source for telemetry
    if (entryContext) {
      logEvent('selena_entry', { 
        source: entryContext.source, 
        route: pagePath,
        has_calculator_result: !!entryContext.calculatorAdvantage,
        has_guide_context: !!entryContext.guideId,
      });
    }
    
    // Add greeting if:
    // - No messages exist (first open)
    // - Post-booking (always show identity reinforcement)
    // - Any CTA with meaningful context AND a NEW entry signature (prevents duplicates)
    const isPostBooking = entryContext?.source === 'post_booking';
    const isMeaningfulSource = entryContext && 
      entryContext.source !== 'floating' && 
      entryContext.source !== 'footer_nudge' &&
      entryContext.source !== 'proactive';
    
    // Compute entry signature to prevent duplicate greeting injection
    // For calculator contexts, include calculator_run_id so reruns with new values trigger fresh greetings
    const calcRunId = entryContext?.source === 'calculator' ? (getSessionContext()?.calculator_run_id || '') : '';
    const entrySig = entryContext 
      ? `${entryContext.source}|${entryContext.intent || ''}|${entryContext.guideId || ''}|${pagePath}${calcRunId ? `|${calcRunId}` : ''}`
      : null;
    const lastSig = localStorage.getItem(LAST_ENTRY_SIG_KEY);
    const isNewEntry = entrySig && entrySig !== lastSig;
    if (entrySig && isNewEntry) {
      localStorage.setItem(LAST_ENTRY_SIG_KEY, entrySig);
    }
    
    const hasContextualEntry = isMeaningfulSource && isNewEntry;
    
    // ============= PHASE GOVERNANCE: GREETING INJECTION GUARD =============
    const storedHistoryExists = hasStoredChatHistory();
    
    // Blocked sources: NEVER inject a greeting (even if messages.length===0)
    const isBlockedSource = !entryContext || 
      entryContext.source === 'floating' || 
      entryContext.source === 'footer_nudge' || 
      entryContext.source === 'proactive';
    
    // Allowed greeting sources (can inject if signature is new + phase matches)
    const isAllowedGreetingSource = !!entryContext && [
      'calculator', 'guide_handoff', 'synthesis', 'hero', 'quiz_result', 'post_booking', 'seller_decision'
    ].includes(entryContext.source);

    // Core decision: should we inject a greeting?
    const shouldInjectGreeting = (() => {
      // If stored history exists and source is blocked → silent open
      if (storedHistoryExists && isBlockedSource) return false;
      
      // Post-booking always injects (identity reinforcement)
      if (isPostBooking) return true;
      
      // If stored history exists and source is NOT in allowed set → silent open
      if (storedHistoryExists && !isAllowedGreetingSource) return false;
      
      // If no stored history AND no messages → first contact OR returning visitor
      if (!storedHistoryExists && messages.length === 0) return true;
      
      // SESSION BOUNDARY GUARD: If active conversation (>3 messages), only allow
      // contextual greetings (guide_handoff, calculator, synthesis), NEVER full
      // identity greetings (hero, default). Prevents mid-thread re-introductions.
      if (messages.length > 3 && hasContextualEntry && isAllowedGreetingSource) {
        const contextualSources = ['guide_handoff', 'calculator', 'synthesis', 'quiz_result', 'seller_decision'];
        return contextualSources.includes(entryContext?.source || '');
      }
      
      // Contextual entry with allowed source + new signature
      if (hasContextualEntry && isAllowedGreetingSource) return true;
      
      return false;
    })();
    
    if (shouldInjectGreeting) {
      const sessionContext = getSessionContext();
      const currentFloor = sessionContext?.chip_phase_floor ?? 0;
      let greetingContent: string = '';
      let suggestedReplies: (string | { label: string; actionSpec: import('@/lib/actions/actionSpec').ActionSpec })[];
      
      // Priority 0: Post-booking identity reinforcement (HIGHEST - seals the decision)
      if (isPostBooking) {
        const name = entryContext?.userName ? `${entryContext.userName}, ` : '';
        greetingContent = t(
          `${name}You're all set. You've already done the hard part — thinking this through carefully.\n\nKasandra will personally review what you shared before your call so you get complete clarity in 10 minutes.\n\nIf you'd like, tell me one thing you want to be 100% certain about when you two talk.`,
          `${name}Listo. Usted ya hizo lo más difícil — pensar esto con cuidado.\n\nKasandra revisará personalmente lo que compartió antes de su llamada para que tenga claridad completa en 10 minutos.\n\nSi gusta, dígame una cosa sobre la que quiera estar 100% seguro/a cuando hablen.`
        );
        suggestedReplies = [
          t("What should I prepare for the call?", "¿Qué debo preparar para la llamada?"),
          t("Can I reschedule if needed?", "¿Puedo reprogramar si es necesario?"),
          t("Thanks, Selena", "Gracias, Selena"),
        ];
      }
      // Priority 0.5: Last-Chance Recovery — user was shown booking chips but didn't click
      else if (!entryContext && !sessionContext?.recovery_shown && sessionContext?.booking_chips_shown_at) {
        const shownAt = new Date(sessionContext.booking_chips_shown_at).getTime();
        const now = Date.now();
        const isWithin24h = (now - shownAt) < 24 * 60 * 60 * 1000;
        if (isWithin24h) {
          greetingContent = t(
            "You were close to connecting with Kasandra. Would you like to continue?",
            "Estaba cerca de conectarse con Kasandra. ¿Le gustaría continuar?"
          );
          suggestedReplies = mapChipsToActionSpecs([
            t("Talk with Kasandra", "Hablar con Kasandra"),
          ]);
          // Add a plain-text "keep exploring" chip (not booking)
          suggestedReplies.push(t("Keep exploring", "Seguir explorando"));
          updateSessionContext({ recovery_shown: true });
        }
      }
      // Priority 1: Calculator completion context
      else if (entryContext?.source === 'calculator' && entryContext.calculatorAdvantage) {
        // Pull enriched data from SessionContext for specific numbers
        const calcValue = sessionContext?.estimated_value;
        const calcDiff = sessionContext?.calculator_difference ?? entryContext.calculatorDifference;
        const formattedValue = calcValue ? `$${calcValue.toLocaleString()}` : '';
        const formattedDiff = calcDiff ? `$${calcDiff.toLocaleString()}` : '';
        
        if (entryContext.calculatorAdvantage === 'cash') {
          greetingContent = formattedValue
            ? t(
                `You ran the numbers on a ~${formattedValue} home. Cash looks like a strong option — speed and certainty without the prep costs.${formattedDiff ? ` The difference is about ${formattedDiff}.` : ''}\n\nWant the 30-second breakdown or tell me your timeline?`,
                `Analizó los números de una casa de ~${formattedValue}. El efectivo parece ser una buena opción — velocidad y certeza sin los costos de preparación.${formattedDiff ? ` La diferencia es de unos ${formattedDiff}.` : ''}\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
              )
            : t(
                `Nice work on the analysis. Cash looks like a strong option for you — speed and certainty without the prep costs.\n\nWant the 30-second breakdown or tell me your timeline?`,
                `Excelente trabajo con el análisis. El efectivo parece una buena opción — velocidad y certeza sin los costos de preparación.\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
              );
        } else if (entryContext.calculatorAdvantage === 'traditional') {
          greetingContent = formattedValue
            ? t(
                `You ran the numbers on a ~${formattedValue} home. Listing could net about ${formattedDiff || 'more'} — if you have the time to maximize value.\n\nWant the 30-second breakdown or tell me your timeline?`,
                `Analizó los números de una casa de ~${formattedValue}. Vender de forma tradicional podría darle unos ${formattedDiff || 'más'} — si tiene el tiempo para maximizar el valor.\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
              )
            : t(
                `Great job on the numbers. A traditional sale could net you ${formattedDiff || 'more'} — if you have the time to maximize value.\n\nWant the 30-second breakdown or tell me your timeline?`,
                `Buen trabajo con los números. Una venta tradicional podría darle ${formattedDiff || 'más'} — si tiene el tiempo para maximizar el valor.\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
              );
        } else {
          greetingContent = formattedValue
            ? t(
                `You ran the numbers on a ~${formattedValue} home. The difference is small — which means your timeline matters most.\n\nWant the 30-second breakdown or tell me what you're deciding?`,
                `Analizó los números de una casa de ~${formattedValue}. La diferencia es pequeña — lo cual significa que su plazo importa más.\n\n¿Quiere el resumen de 30 segundos o dígame qué está decidiendo?`
              )
            : t(
                `You've taken a great step by running your numbers. The difference is subtle — which means the right choice depends on your situation.\n\nWant the 30-second breakdown or tell me what you're deciding?`,
                `Ha hecho un gran paso al analizar sus números. La diferencia es sutil — la decisión correcta depende de su situación.\n\n¿Quiere el resumen de 30 segundos o dígame qué está decidiendo?`
              );
        }
        suggestedReplies = [
          t("30-second breakdown", "Resumen de 30 segundos"),
          t("What would my home net?", "¿Cuánto me daría mi casa?"),
          t("I'm deciding: cash vs list", "Estoy decidiendo: efectivo vs venta"),
        ];
      }
      // Priority 1.5: Seller Decision Receipt continuity
      else if (entryContext?.source === 'seller_decision') {
        const ctx = getSessionContext();

        // Bilingual label maps for human-readable greeting values
        const situationLabels: Record<string, { en: string; es: string }> = {
          inherited: { en: 'dealing with an inherited property', es: 'lidiando con una propiedad heredada' },
          divorce: { en: 'going through a life change', es: 'pasando por un cambio de vida' },
          tired_landlord: { en: 'a tired landlord', es: 'un propietario cansado' },
          upgrading: { en: 'upgrading', es: 'buscando mejorar' },
          relocating: { en: 'relocating', es: 'reubicándose' },
          other: { en: 'exploring your options', es: 'explorando sus opciones' },
        };
        const goalLabels: Record<string, { en: string; es: string }> = {
          speed: { en: 'speed', es: 'rapidez' },
          price: { en: 'getting the highest price', es: 'obtener el mejor precio' },
          least_stress: { en: 'least stress', es: 'menos estrés' },
          privacy: { en: 'privacy', es: 'privacidad' },
          not_sure: { en: 'still deciding', es: 'aún decidiendo' },
        };
        const conditionLabels: Record<string, { en: string; es: string }> = {
          needs_work: { en: 'needs work', es: 'necesita trabajo' },
          mostly_original: { en: 'mostly original', es: 'mayormente original' },
          standard: { en: 'standard condition', es: 'condición estándar' },
          updated: { en: 'recently updated', es: 'recientemente actualizada' },
          like_new: { en: 'like new', es: 'como nueva' },
        };

        const rawSituation = ctx?.situation || '';
        const rawGoal = ctx?.seller_goal_priority || '';
        const rawCondition = ctx?.property_condition_raw || '';

        const situation = situationLabels[rawSituation]
          ? t(situationLabels[rawSituation].en, situationLabels[rawSituation].es)
          : rawSituation.replace(/_/g, ' ') || t('your situation', 'su situación');
        const goal = goalLabels[rawGoal]
          ? t(goalLabels[rawGoal].en, goalLabels[rawGoal].es)
          : rawGoal.replace(/_/g, ' ') || t('your priority', 'su prioridad');
        const condition = conditionLabels[rawCondition]
          ? t(conditionLabels[rawCondition].en, conditionLabels[rawCondition].es)
          : rawCondition.replace(/_/g, ' ') || t('the condition', 'la condición');

        const path = ctx?.seller_decision_recommended_path;

        const pathLine = path === 'cash'
          ? t("Based on that, it's worth comparing a cash offer to a traditional listing.",
              "Basado en eso, vale la pena comparar una oferta en efectivo con un listado tradicional.")
          : path === 'traditional'
          ? t("Based on that, many sellers start with the traditional path to maximize value.",
              "Basado en eso, muchos vendedores empiezan con el camino tradicional para maximizar valor.")
          : t("Based on that, we can compare both paths calmly.",
              "Basado en eso, podemos comparar ambos caminos con calma.");

        greetingContent = t(
          `I've reviewed your Seller Decision Receipt. You're ${situation}, your priority is ${goal}, and the home is ${condition}. ${pathLine} What would you like to do next?`,
          `Ya revisé su Recibo de Decisión de Venta. Veo que está ${situation}, su prioridad es ${goal}, y la casa está ${condition}. ${pathLine} ¿Qué le gustaría hacer ahora?`
        );

        suggestedReplies = mapChipsToActionSpecs([
          t("Compare cash vs. listing", "Comparar efectivo vs. listado"),
          t("Get my selling options", "Ver mis opciones de venta"),
          t("Talk with Kasandra", "Hablar con Kasandra"),
        ]);
      }
      // Priority 2: Synthesis footer context
      else if (entryContext?.source === 'synthesis') {
        // Use entryContext.guidesReadCount (passed from the component)
        const guidesCount = entryContext.guidesReadCount || 0;
        greetingContent = guidesCount >= 3
          ? t(
              `You've read ${guidesCount} guides — you're building a clear picture of your options. Let me summarize the key points that matter most for your situation.`,
              `Ha leído ${guidesCount} guías — está construyendo una imagen clara de sus opciones. Permítame resumir los puntos clave que más importan para su situación.`
            )
          : t(
              `You've been exploring your options. Would you like me to summarize what you've learned so far?`,
              `Ha estado explorando sus opciones. ¿Le gustaría que resuma lo que ha aprendido hasta ahora?`
            );
        suggestedReplies = [
          t("Yes, summarize what I've learned", "Sí, resume lo que he aprendido"),
          t("What should my next step be?", "¿Cuál debería ser mi siguiente paso?"),
          t("I have a specific question", "Tengo una pregunta específica"),
        ];
      }
      // Priority 3: Question CTA context — intent-aware, never stacks on top of existing session
      // If messages already exist (drawer has prior context), open without injecting a new greeting.
      // Only inject if this is genuinely the first open with no prior messages.
      else if (entryContext?.source === 'question') {
        if (messages.length === 0) {
          const questionIntent = entryContext?.intent;
          if (questionIntent === 'cash') {
            greetingContent = t(
              `Already received a cash offer? I can help you read it — check for red flags, compare it to what the market might offer, and make sure you understand what you're signing.\n\nTell me about your situation.`,
              `¿Ya recibió una oferta en efectivo? Puedo ayudarle a revisarla — buscar señales de alerta, compararla con lo que el mercado podría ofrecer, y asegurar que entienda lo que está firmando.\n\nCuénteme su situación.`
            );
            suggestedReplies = [
              t("I got a cash offer", "Recibí una oferta en efectivo"),
              t("Is my offer fair?", "¿Es justa mi oferta?"),
              t("What should I watch out for?", "¿Qué debo tener en cuenta?"),
            ];
          } else {
            greetingContent = t(
              `I'm here to help. What question do you have in mind?`,
              `Estoy aquí para ayudarle. ¿Qué pregunta tiene en mente?`
            );
            suggestedReplies = [
              t("Get my selling options", "Ver mis opciones de venta"),
              t("How does the process work?", "¿Cómo funciona el proceso?"),
              t("What are my options?", "¿Cuáles son mis opciones?"),
            ];
          }
        }
        // If messages.length > 0: greetingContent stays '', so the block below creates
        // a greeting with empty content. We handle this by guarding on greetingContent below.
      }
      // Priority 3.5: Quiz result context — intent-specific routing post-quiz
      else if (entryContext?.source === 'quiz_result' && entryContext.intent) {
        const quizIntent = entryContext.intent.toLowerCase();
        if (quizIntent === 'sell' || quizIntent === 'cash') {
          greetingContent = t(
            `You just completed your path — and it looks like ${quizIntent === 'cash' ? 'a cash offer' : 'selling'} is on your mind.\n\nBased on what you shared, here's where I can help most: understanding your home's current value and comparing what cash vs. a traditional listing actually means for your situation.`,
            `Acaba de completar su camino — y parece que ${quizIntent === 'cash' ? 'una oferta en efectivo' : 'vender'} está en su mente.\n\nBasado en lo que compartió, aquí es donde puedo ayudarle más: entender el valor actual de su casa y comparar lo que el efectivo vs. una venta tradicional significa para su situación.`
          );
            suggestedReplies = [
              t("Compare cash vs. listing", "Comparar efectivo vs. listado"),
              t("Get my selling options", "Ver mis opciones de venta"),
              t("Talk with Kasandra", "Hablar con Kasandra"),
            ];
        } else if (quizIntent === 'buy') {
          greetingContent = t(
            `You just completed your path — and you're thinking about buying. That's a great place to start.\n\nThe most useful next step for you right now is the Buyer Readiness Check — it tells you exactly where you stand before committing to anything.`,
            `Acaba de completar su camino — y está pensando en comprar. Es un excelente lugar para comenzar.\n\nEl siguiente paso más útil para usted ahora mismo es la Evaluación de Preparación del Comprador — le dice exactamente dónde está antes de comprometerse con algo.`
          );
          suggestedReplies = [
            t("Take the Buyer Readiness Check", "Tomar la Evaluación de Preparación"),
            t("Browse buyer guides", "Explorar guías de comprador"),
            t("I have a question", "Tengo una pregunta"),
          ];
        } else {
          greetingContent = t(
            `You just completed your path — and it's okay that things aren't fully clear yet. That's more normal than you think.\n\nLet's figure out your most useful next step together.`,
            `Acaba de completar su camino — y está bien que las cosas no estén completamente claras aún. Eso es más normal de lo que piensa.\n\nFigurémonos juntos cuál es su próximo paso más útil.`
          );
          suggestedReplies = [
            t("Help me find my path", "Ayúdame a encontrar mi camino"),
            t("Show me my options", "Muéstrame mis opciones"),
            t("Just exploring for now", "Solo estoy explorando"),
          ];
        }
      }
      // Priority 4: Guide handoff context — check BOTH EntryContext AND SessionContext
      else if (
        entryContext?.source === 'guide_handoff' || 
        entryContext?.guideId ||
        sessionContext?.entry_guide_id ||
        (sessionContext?.last_guide_id && location.pathname.includes('/v2/guides/'))
      ) {
        const guideId = entryContext?.guideId || sessionContext?.entry_guide_id || sessionContext?.last_guide_id;
        const guideEntry = guideId ? getGuideById(guideId) : null;
        
        if (guideEntry) {
          const guideTitle = entryContext?.guideTitle || sessionContext?.entry_guide_title || (language === 'es' ? guideEntry.titleEs : guideEntry.titleEn);
          
          greetingContent = t(
            `I see you're reading "${guideTitle}." Want the 30-second summary or do you have a specific question?`,
            `Veo que está leyendo "${guideTitle}." ¿Quiere un resumen de 30 segundos o tiene una pregunta específica?`
          );

          // Build destination-backed chips from guide registry
          const destinations = guideEntry.destinations;
          const primaryChip = destinations?.primaryAction;
          const actionChip: string | { label: string; actionSpec: import('@/lib/actions/actionSpec').ActionSpec } | undefined = 
            primaryChip ? { label: language === 'es' ? primaryChip.label.es : primaryChip.label.en, actionSpec: primaryChip } : undefined;
          
          suggestedReplies = [
            t("30-second summary", "Resumen de 30 segundos"),
            t("I have a question", "Tengo una pregunta"),
          ];
          if (actionChip) {
            suggestedReplies.push(actionChip);
          }
        } else {
          // Fallback: guide not found. Use phase-aware chips instead of Phase 1 regression
          if (sessionContext?.intent) {
            greetingContent = t(
              "Welcome back — we can pick up where you left off.",
              "Bienvenido/a de vuelta — podemos continuar donde lo dejamos."
            );
            suggestedReplies = getPhaseAwareChips(t, sessionContext);
          } else {
            greetingContent = t(
              "Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?",
              "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión.\n\n¿Está pensando en comprar, vender, o solo explorar qué es posible?"
            );
            suggestedReplies = [
              t("I'm thinking about selling", "Estoy pensando en vender"),
              t("I'm looking to buy", "Estoy buscando comprar"),
              t("Just exploring for now", "Solo estoy explorando"),
            ];
          }
        }
      }
      // Priority 5: Hero CTA context
      else if (entryContext?.source === 'hero') {
        greetingContent = t(
          `Hello, I'm Selena — Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure. Whether you're thinking about buying, selling, or just understanding what's possible — I'm here to help.\n\nWhat brings you here today?`,
          `Hola, soy Selena — la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión. Ya sea que esté pensando en comprar, vender, o simplemente entendiendo lo que es posible — estoy aquí para ayudarle.\n\n¿Qué le trae por aquí hoy?`
        );
        suggestedReplies = [
          t("I'm thinking about selling", "Estoy pensando en vender"),
          t("I'm looking to buy", "Estoy buscando comprar"),
          t("Just exploring for now", "Solo estoy explorando"),
        ];
      }
      // Default greeting — Decision Engine: deterministic bubbles based on SessionContext
      else {
        const sessionCtx = getSessionContext();
        const declaredIntent = sessionCtx?.intent;
        const declaredTimeline = sessionCtx?.timeline;
        const toolUsed = sessionCtx?.tool_used;
        const readinessScore = sessionCtx?.readiness_score;
        const quizDone = sessionCtx?.quiz_completed;

        // If intent is established, skip generic "buy/sell/explore" orientation
        if (declaredIntent === 'sell' || declaredIntent === 'cash') {
          if (declaredTimeline === 'asap') {
            // Seller + ASAP → prioritize Cash Offer Comparison
            greetingContent = t(
              "Welcome back. Since you're on a tight timeline, comparing your cash vs. listing options is the fastest way to see where you stand.",
              "Bienvenido/a de vuelta. Como tiene un cronograma ajustado, comparar sus opciones de efectivo vs. listado es la forma más rápida de ver dónde está."
            );
            suggestedReplies = [
              t("Compare cash vs. listing", "Comparar efectivo vs. listado"),
              t("Get my selling options", "Ver mis opciones de venta"),
              t("I have a question", "Tengo una pregunta"),
            ];
          } else {
            greetingContent = t(
              "Welcome back. I remember you're thinking about selling. How can I help you move forward?",
              "Bienvenido/a de vuelta. Recuerdo que está pensando en vender. ¿Cómo puedo ayudarle a avanzar?"
            );
            suggestedReplies = [
              t("Compare cash vs. listing", "Comparar efectivo vs. listado"),
              t("Read the seller guide", "Leer la guía del vendedor"),
              t("I'm ready to talk to Kasandra", "Estoy listo/a para hablar con Kasandra"),
            ];
          }
        } else if (declaredIntent === 'buy') {
          if (readinessScore !== undefined && readinessScore < 60) {
            // Buyer + low readiness → prioritize Buyer Readiness Guide
            greetingContent = t(
              "Welcome back. Based on your readiness check, there are a few steps that could strengthen your position. Let me help you get there.",
              "Bienvenido/a de vuelta. Según su evaluación de preparación, hay algunos pasos que podrían fortalecer su posición. Permítame ayudarle."
            );
            suggestedReplies = [
              t("What should I work on first?", "¿En qué debería trabajar primero?"),
              t("Review my readiness results", "Revisar mis resultados de preparación"),
              t("I have a question", "Tengo una pregunta"),
            ];
          } else if (toolUsed === 'buyer_readiness') {
            greetingContent = t(
              "Welcome back. You've already completed your readiness check — that's a great step. What would you like to explore next?",
              "Bienvenido/a de vuelta. Ya completó su evaluación de preparación — ese es un gran paso. ¿Qué le gustaría explorar a continuación?"
            );
            suggestedReplies = [
              t("Browse buyer guides", "Explorar guías de comprador"),
              t("I'm ready to talk to Kasandra", "Estoy listo/a para hablar con Kasandra"),
              t("I have a question", "Tengo una pregunta"),
            ];
          } else {
            greetingContent = t(
              "Welcome back. I remember you're looking to buy. The Buyer Readiness Check is a great place to start.",
              "Bienvenido/a de vuelta. Recuerdo que está buscando comprar. La Evaluación de Preparación del Comprador es un buen lugar para comenzar."
            );
            suggestedReplies = [
              t("Take the Buyer Readiness Check", "Tomar la Evaluación de Preparación"),
              t("Browse buyer guides", "Explorar guías de comprador"),
              t("I have a question", "Tengo una pregunta"),
            ];
          }
        } else if (declaredIntent === 'dual') {
          greetingContent = t(
            "Welcome back. Buying and selling at the same time requires careful coordination. Kasandra specializes in exactly this.",
            "Bienvenido/a de vuelta. Comprar y vender al mismo tiempo requiere coordinación cuidadosa. Kasandra se especializa exactamente en esto."
          );
          suggestedReplies = [
            t("How does a dual move work?", "¿Cómo funciona una mudanza dual?"),
            t("I'd like to talk to Kasandra", "Me gustaría hablar con Kasandra"),
            t("I have a question", "Tengo una pregunta"),
          ];
        } else if (quizDone) {
          greetingContent = t(
            "Welcome back. I see you completed the orientation quiz — great start. How can I help you take the next step?",
            "Bienvenido/a de vuelta. Veo que completó el cuestionario de orientación — excelente comienzo. ¿Cómo puedo ayudarle a dar el siguiente paso?"
          );
          suggestedReplies = [
            t("What should I do next?", "¿Qué debería hacer a continuación?"),
            t("Browse guides", "Explorar guías"),
            t("I have a specific question", "Tengo una pregunta específica"),
          ];
        } else if (sessionContext?.intent) {
          // Returning visitor with known intent but no stored history → "Welcome back"
          // NEVER show Phase 0/1 onboarding when intent exists
          greetingContent = t(
            "Welcome back — we can pick up where you left off.",
            "Bienvenido/a de vuelta — podemos continuar donde lo dejamos."
          );
          suggestedReplies = getPhaseAwareChips(t, sessionContext);
        } else {
          // Truly new visitor — orientation mode (Phase 0)
          greetingContent = t(
            "Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?",
            "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión.\n\n¿Está pensando en comprar, vender, o solo explorar qué es posible?"
          );
          suggestedReplies = [
            t("I'm thinking about selling", "Estoy pensando en vender"),
            t("I'm looking to buy", "Estoy buscando comprar"),
            t("Just exploring for now", "Solo estoy explorando"),
          ];
        }
      }
      
      const greeting: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: greetingContent,
        timestamp: new Date().toISOString(),
        suggestedReplies,
      };
      
      // Guard: if greetingContent is empty (e.g., 'question' source on existing session),
      // open the drawer with history intact — no stacking, no empty message.
      if (!greetingContent) {
        // No-op: drawer opens, existing messages remain.
      }
      // If history exists and this is a cross-context injection, APPEND the greeting
      // Otherwise (first open, no history), start fresh with just the greeting
      else if (messages.length > 0 && hasContextualEntry) {
        const updatedMessages = [...messages, greeting];
        setMessages(updatedMessages);
        saveHistory(updatedMessages);
      } else {
        setMessages([greeting]);
        saveHistory([greeting]);
      }
      
      // If there's a prefill message (e.g., from synthesis), store it for later sending
      // We can't call sendMessage here due to callback dependency order
      if (entryContext?.prefillMessage) {
        // Store the prefill in localStorage temporarily for the next render cycle
        localStorage.setItem('selena_prefill_message', entryContext.prefillMessage);
      }
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
      openChat({ source: 'floating' });
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
              // existing fields
              session_id: context?.session_id || '',
              route: location.pathname,
              language: languageRef.current,
              utm_source: context?.utm_source,
              utm_campaign: context?.utm_campaign,
              intent: context?.intent,
              timeline: context?.timeline,
              last_guide_id: context?.last_guide_id,
              lead_id: leadId,
              // mode-progression fields from SessionContext
              tool_used: context?.tool_used,
              last_tool_result: context?.last_tool_result,
              quiz_completed: context?.quiz_completed ?? false,
              guides_read: context?.guides_read ?? (context?.last_guide_id ? 1 : 0),
              situation: context?.situation,
              seller_decision_recommended_path: context?.seller_decision_recommended_path,
              seller_goal_priority: context?.seller_goal_priority,
              property_condition_raw: context?.property_condition_raw,
              // from provider state
              calculator_advantage: lastCalculatorAdvantage ?? undefined,
              // Mode persistence — authoritative server mode signal, survives across turns
              current_mode: context?.current_mode,
              // Phase governance fields
              chip_phase_floor: context?.chip_phase_floor ?? 0,
              greeting_phase_seen: context?.greeting_phase_seen ?? 0,
              timeline_last_asked_turn: context?.timeline_last_asked_turn,
              turn_count: (context?.turn_count ?? 0) + 1,
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

      // Persist server-authoritative mode to SessionContext (monotonic — never downgrade)
      if (data.current_mode) {
        const existingMode = getSessionContext()?.current_mode ?? 0;
        if (data.current_mode >= existingMode) {
          updateSessionContext({ current_mode: data.current_mode as 1 | 2 | 3 | 4 });
        }
      }

      // Persist chip_phase_floor from server response (monotonic — never decrease)
      if (data.chip_phase_floor !== undefined) {
        const existingFloor = getSessionContext()?.chip_phase_floor ?? 0;
        if (data.chip_phase_floor > existingFloor) {
          updateSessionContext({ chip_phase_floor: data.chip_phase_floor });
        }
      }

      // Persist timeline_last_asked_turn if server reports it
      if (data.timeline_last_asked_turn !== undefined) {
        updateSessionContext({ timeline_last_asked_turn: data.timeline_last_asked_turn });
      }

      // Increment turn_count
      const currentTurnCount = getSessionContext()?.turn_count ?? 0;
      updateSessionContext({ turn_count: currentTurnCount + 1 });
      
      // ============= CHIP → ACTIONSPEC MAPPING =============
      // Convert known action-bearing string chips to structured ActionSpec objects.
      // This ensures clicks call resolveAction() (deterministic routing) instead of
      // sending a user message (which would trigger an AI round-trip).
      const mappedReplies = mapChipsToActionSpecs(data.suggestedReplies || []);

      // ============= CHIP META EXTRACTION =============
      // Persist phase/mode/containment from edge function for visual weighting
      const chipMeta: import('./SelenaChatContext').ChipMeta = {
        phase: data.chip_phase ?? data.chip_phase_floor ?? 0,
        mode: data.current_mode ?? 0,
        containment: !!data.containment_active,
        bookingCtaShown: !!data.booking_cta_shown,
      };

      // ============= BOOKING CHIPS SHOWN TRACKING (Feature 3) =============
      const hasBookingChip = mappedReplies.some((r) => 
        typeof r !== 'string' && r.actionSpec.type === 'book'
      );
      if (hasBookingChip && (chipMeta.phase >= 3 || chipMeta.mode >= 4 || data.booking_cta_shown)) {
        updateSessionContext({ booking_chips_shown_at: new Date().toISOString() });
      }

      const assistantMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.reply || t(
          "I'm here to help. What would you like to know?",
          "Estoy aquí para ayudar. ¿Qué te gustaría saber?"
        ),
        timestamp: new Date().toISOString(),
        actions: data.actions || [],
        suggestedReplies: mappedReplies,
        chipMeta,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
      logSelenaMessageAI(data.reply || '', location.pathname, (data.actions?.length || 0) > 0);

      // DEV-only: capture guard telemetry for QA panel
      if (import.meta.env.DEV) {
        import('@/lib/analytics/guardTelemetry').then(({ pushGuardTelemetry }) => {
          pushGuardTelemetry(data);
        }).catch(() => {});
      }

    } catch (error) {
      console.error('[Selena] Chat error:', error);
      
      // Graceful fallback — phase-aware chips (never regress to Phase 1 if intent known)
      const fallbackCtx = getSessionContext();
      const fallbackMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: t(
          "I'm having a moment - but don't worry, I'm still here to help. What would you like to explore?",
          "Estoy teniendo un momento - pero no te preocupes, sigo aquí para ayudarte. ¿Qué te gustaría explorar?"
        ),
        timestamp: new Date().toISOString(),
        suggestedReplies: getPhaseAwareChips(t, fallbackCtx),
      };
      
      const updatedMessages = [...newMessages, fallbackMessage];
      setMessages(updatedMessages);
      saveHistory(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, location.pathname, t, leadId, lastCalculatorAdvantage]); // FM-09: lastCalculatorAdvantage must be in deps to avoid stale closure

  // Handle prefill messages stored by openChat (for synthesis flows)
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const prefill = localStorage.getItem('selena_prefill_message');
      if (prefill) {
        localStorage.removeItem('selena_prefill_message');
        // Delay slightly to let UI stabilize
        setTimeout(() => {
          sendMessage(prefill);
        }, 300);
      }
    }
  }, [messages.length, isLoading, sendMessage]);

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
      // Route directly to booking page — no lead capture gate for booking
      closeChat();
      navigate('/v2/book');
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
    localStorage.removeItem(LAST_ENTRY_SIG_KEY);
    // Reset phase governance fields (conversation state) but keep real user data (intent, timeline, tool_used)
    updateSessionContext({ 
      chip_phase_floor: 0, 
      greeting_phase_seen: 0,
      turn_count: 0,
      timeline_last_asked_turn: undefined,
    });
    // Re-add greeting message — phase-aware
    const ctx = getSessionContext();
    const greeting: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: ctx?.intent
        ? t(
            "Welcome back — we can pick up where you left off.",
            "Bienvenido/a de vuelta — podemos continuar donde lo dejamos."
          )
        : t(
            "Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?",
            "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión.\n\n¿Está pensando en comprar, vender, o solo explorar qué es posible?"
          ),
      timestamp: new Date().toISOString(),
      suggestedReplies: ctx?.intent
        ? getPhaseAwareChips(t, ctx)
        : [
            t("I'm thinking about selling", "Estoy pensando en vender"),
            t("I'm looking to buy", "Estoy buscando comprar"),
            t("Just exploring for now", "Solo estoy explorando"),
          ],
    };
    setMessages([greeting]);
    saveHistory([greeting]);
    logEvent('selena_clear_history', { route: location.pathname });
  }, [t, location.pathname]);

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
    
    const currentPendingReportId = pendingReportId;
    setPendingAction(null);
    setPendingReportId(null);
    
    // Resume pending report action
    setTimeout(() => {
      if (currentPendingReportId) {
        if (currentPendingReportId === 'LAST') {
          openLastReport();
        } else {
          openReportById(currentPendingReportId);
        }
      }
    }, 100);
  }, [setLeadIdentity, pendingReportId, openReportById]);

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
