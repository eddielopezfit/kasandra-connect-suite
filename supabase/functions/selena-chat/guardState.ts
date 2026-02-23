/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SELENA AI — CONVERSATION STATE GUARD v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Deterministic governance layer between intent detection and AI generation.
 * Prevents behavioral drift: re-introductions, looping, assumed urgency,
 * guide spam, and premature escalation.
 *
 * This is infrastructure, not prompt tuning.
 *
 * HIERARCHY:
 *   KB-0 (Constitution) > Brokerage Truth Source > Conversational Operating Doctrine
 *   > STATE GUARD (this file) > Mode Instructions
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type EmotionalPosture = 'anxious' | 'overwhelmed' | 'curious' | 'calm' | 'confident';
export type EscalationLevel = 'none' | 'suggest' | 'offer' | 'booked' | 'human_takeover';
export type QuestionType = 'open' | 'clarifying' | 'decision' | 'emotional' | 'none';
export type SystemAction = 'guide' | 'explanation' | 'deferral' | 'booking_offer' | 'tool_rec' | 'none';

export interface ConversationGuardState {
  identity_disclosed: boolean;
  intent: string | null;
  intent_locked: boolean;
  timeline: string | null;
  timeline_locked: boolean;
  emotional_posture: EmotionalPosture;
  escalation_level: EscalationLevel;
  guide_history: string[];
  last_question_type: QuestionType;
  last_system_action: SystemAction;
  reentry_flag: boolean;
  consecutive_similar_turns: number;
}

export interface GuardRulesResult {
  guardHints: string;
  chipOverrides: string[] | null;
  maxTokensOverride: number | null;
  blockGeneration: boolean;
  violations: Array<{ rule: string; action: 'blocked' | 'modified' }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface GuardContext {
  intent?: string;
  timeline?: string;
  tool_used?: string;
  quiz_completed?: boolean;
  last_guide_id?: string;
  last_guide_title?: string;
  chip_phase_floor?: number;
  current_mode?: number;
  turn_count?: number;
  entry_source?: string;
}

// ─── Detection Patterns ──────────────────────────────────────────────────────

/** Identity phrases (EN + ES) — if any appear in assistant history, identity is disclosed */
const IDENTITY_PATTERNS = /i'm selena|i am selena|soy selena|my name is selena|me llamo selena/i;

/** Distress / overwhelm signals */
const OVERWHELM_PATTERNS = /panic|panicking|scared|terrified|desperate|helpless|don't know what to do|no sé qué hacer|overwhelm|abrumad|evict|desahucio|foreclos|ejecución hipotecaria|crisis|emergency|emergencia|losing my home|perder mi casa|can't breathe|dying|suicid/i;

/** Anxiety signals (less severe than overwhelm) */
const ANXIETY_PATTERNS = /nervous|worried|anxious|stressed|confused|lost|uncertain|afraid|fear|concern|preocupad|nervios|ansiedad|estrés|confundid|miedo|temor|insegur/i;

/** Confidence signals */
const CONFIDENCE_PATTERNS = /ready|i've decided|let's do|i want to move forward|clear now|makes sense|understand|list[eo]|listo|entiendo|decidido|quiero avanzar|vamos/i;

/** Booking confirmation signals */
const BOOKING_CONFIRMED_PATTERNS = /booked|scheduled|confirmed|appointment set|reservado|confirmado|agendado|cita programada/i;

/** Guide reference patterns in assistant messages */
const GUIDE_REFERENCE_PATTERN = /guide(?:\s+on)?\s+[""]([^""]+)[""]|guía\s+(?:sobre\s+)?[""]([^""]+)[""]|guide.*?[""]([^""]+)[""]|guía.*?[""]([^""]+)[""]|guide titled\s+[""]?([^"".\n]+)/gi;

/** Urgency assumption words — blocked when timeline is unknown */
const URGENCY_WORDS = /\b(tight timeline|quickly|fast|soon|urgent|right away|immediately|asap|pronto|rápido|urgente|inmediato|de inmediato|cuanto antes)\b/i;

// ─── Guard State Builder ─────────────────────────────────────────────────────

/**
 * Reconstructs the guard state deterministically from conversation history,
 * context payload, and current message. No persistence — no drift.
 */
export function buildGuardState(
  history: ChatMessage[],
  context: GuardContext,
  message: string
): ConversationGuardState {
  const assistantMessages = history.filter(m => m.role === 'assistant');
  const userMessages = history.filter(m => m.role === 'user');

  // ── Identity Disclosed ──
  const identity_disclosed = assistantMessages.some(m => IDENTITY_PATTERNS.test(m.content));

  // ── Intent Lock ──
  const intent = context.intent || null;
  const intent_locked = !!intent && intent !== 'explore';

  // ── Timeline Lock ──
  const timeline = context.timeline || null;
  const timeline_locked = !!timeline;

  // ── Emotional Posture (from current message + recent history) ──
  const emotional_posture = detectEmotionalPosture(message, userMessages);

  // ── Escalation Level ──
  const escalation_level = deriveEscalationLevel(context, history, message);

  // ── Guide History (scan assistant messages for guide references) ──
  const guide_history = extractGuideHistory(assistantMessages, context);

  // ── Last Question Type (from last assistant message) ──
  const last_question_type = detectQuestionType(assistantMessages);

  // ── Last System Action (from last assistant message) ──
  const last_system_action = detectSystemAction(assistantMessages);

  // ── Reentry Flag ──
  const reentry_flag = history.length > 0;

  // ── Consecutive Similar Turns ──
  const consecutive_similar_turns = countSimilarTurns(userMessages, message);

  return {
    identity_disclosed,
    intent,
    intent_locked,
    timeline,
    timeline_locked,
    emotional_posture,
    escalation_level,
    guide_history,
    last_question_type,
    last_system_action,
    reentry_flag,
    consecutive_similar_turns,
  };
}

// ─── Guard Rules Engine ──────────────────────────────────────────────────────

/**
 * Applies hard guard rules against the constructed state.
 * Returns generation hints, chip overrides, and violation log.
 */
export function applyGuardRules(
  state: ConversationGuardState,
  language: 'en' | 'es'
): GuardRulesResult {
  const hints: string[] = [];
  const violations: GuardRulesResult['violations'] = [];
  let chipOverrides: string[] | null = null;
  let maxTokensOverride: number | null = null;
  let blockGeneration = false;

  // ── RULE 1: IDENTITY ONCE ──
  if (state.identity_disclosed) {
    hints.push(language === 'es'
      ? 'GUARDIA: Ya te presentaste. NO te vuelvas a presentar. No digas "Soy Selena" ni "Me llamo Selena".'
      : 'GUARD: You have already introduced yourself. Do NOT re-introduce yourself. Do not say "I\'m Selena" or "My name is Selena".');
  }

  // ── RULE 2: NO BOOKING WITHOUT GATE ──
  if (state.escalation_level === 'none') {
    hints.push(language === 'es'
      ? 'GUARDIA: NO menciones reservas, llamadas, citas, agendamiento, ni disponibilidad de Kasandra.'
      : 'GUARD: Do NOT mention booking, calls, scheduling, appointments, or Kasandra\'s availability.');
  }

  // ── RULE 3: NO REPEAT GUIDES ──
  if (state.guide_history.length > 0) {
    const guideList = state.guide_history.join(', ');
    hints.push(language === 'es'
      ? `GUARDIA: Guías ya mencionadas: [${guideList}]. NO las repitas ni las vuelvas a sugerir.`
      : `GUARD: Guides already surfaced: [${guideList}]. Do NOT repeat or re-suggest these.`);
  }

  // ── RULE 4: NO URGENCY ASSUMPTION ──
  if (!state.timeline_locked) {
    hints.push(language === 'es'
      ? 'GUARDIA: La línea de tiempo es desconocida. NO asumas urgencia. NO uses "rápido", "pronto", "urgente", "inmediato", "cuanto antes".'
      : 'GUARD: Timeline is unknown. Do NOT assume urgency. Do NOT use "quickly", "fast", "soon", "urgent", "immediately", "tight timeline", "ASAP".');
  }

  // ── RULE 5: NO RE-ASK ──
  if (state.intent_locked) {
    hints.push(language === 'es'
      ? 'GUARDIA: La intención ya fue declarada. NO preguntes "¿está pensando en comprar, vender o explorar?".'
      : 'GUARD: Intent is already declared. Do NOT ask "are you looking to buy, sell, or explore?".');
  }
  if (state.timeline_locked) {
    hints.push(language === 'es'
      ? 'GUARDIA: La línea de tiempo ya fue capturada. NO preguntes sobre plazo o urgencia.'
      : 'GUARD: Timeline is already captured. Do NOT ask about timeline or urgency.');
  }

  // ── RULE 6: ONE QUESTION RULE ──
  if (state.last_question_type !== 'none') {
    hints.push(language === 'es'
      ? `GUARDIA: Tu última respuesta contenía una pregunta (${state.last_question_type}). Reconoce antes de preguntar otra vez.`
      : `GUARD: Your last response contained a question (${state.last_question_type}). Acknowledge before asking another.`);
  }

  // ── RULE 7: OVERWHELM GATE ──
  if (state.emotional_posture === 'overwhelmed') {
    hints.push(language === 'es'
      ? 'GUARDIA CRITICA: El usuario está abrumado. NO recomiendes herramientas, guías, ni preguntas de calificación. Solo empatía + oferta de conexión humana con Kasandra.'
      : 'GUARD CRITICAL: User is overwhelmed. Do NOT recommend tools, guides, or qualification questions. Empathy only + offer human connection with Kasandra.');
    // Override chips to human handoff only
    chipOverrides = language === 'es'
      ? ['Conectar con Kasandra', 'Seguir conversando']
      : ['Connect with Kasandra', 'Keep chatting'];
    violations.push({ rule: 'overwhelm_gate', action: 'modified' });
  }

  // ── RULE 7b: ANXIETY GATE (surgical note #2) ──
  // If anxious + anti-loop triggers, escalation must be human_takeover only
  if (state.emotional_posture === 'anxious' && state.consecutive_similar_turns >= 2) {
    hints.push(language === 'es'
      ? 'GUARDIA: Usuario ansioso en bucle. Escalación solo a conexión humana, nunca a herramientas ni reservas.'
      : 'GUARD: Anxious user looping. Escalation must be human connection only, never tools or booking.');
    chipOverrides = language === 'es'
      ? ['Hablar con Kasandra', 'Seguir conversando con Selena']
      : ['Talk with Kasandra', 'Keep chatting with Selena'];
    violations.push({ rule: 'anxiety_loop_gate', action: 'modified' });
  }

  // ── RULE 8: POST-BOOKING SILENCE ──
  if (state.escalation_level === 'booked') {
    hints.push(language === 'es'
      ? 'GUARDIA ABSOLUTA: La reserva está confirmada. Responde con EXACTAMENTE una oración de confirmación. NO guíes. NO hagas preguntas de seguimiento. Termina tu turno.'
      : 'GUARD ABSOLUTE: Booking is confirmed. Respond with EXACTLY one confirmation sentence. Do NOT guide. Do NOT ask follow-up questions. End your turn.');
    maxTokensOverride = 60;
    chipOverrides = language === 'es'
      ? ['¿Qué pasa después de reservar?']
      : ['What happens after I book?'];
    violations.push({ rule: 'post_booking_silence', action: 'modified' });
  }

  // ── RULE 9: HUMAN TAKEOVER ABSOLUTE ──
  if (state.escalation_level === 'human_takeover') {
    blockGeneration = true;
    violations.push({ rule: 'human_takeover', action: 'blocked' });
  }

  // ── RULE 10: ANTI-LOOP ──
  if (state.consecutive_similar_turns >= 2 && state.emotional_posture !== 'overwhelmed' && state.emotional_posture !== 'anxious') {
    hints.push(language === 'es'
      ? 'GUARDIA ANTI-LOOP: El usuario ha repetido el mismo tema. NO repitas tu respuesta anterior. Ofrece un paso diferente o conexión humana.'
      : 'GUARD ANTI-LOOP: User has repeated the same topic. Do NOT repeat your previous response. Offer a different step or human connection.');
    violations.push({ rule: 'anti_loop', action: 'modified' });
  }

  // ── RULE 11: REENTRY — NO FRESH INTRO ──
  if (state.reentry_flag && state.identity_disclosed) {
    hints.push(language === 'es'
      ? 'GUARDIA: Este es un usuario que regresa. NO hagas una introducción nueva. Continúa naturalmente.'
      : 'GUARD: This is a returning user. Do NOT give a fresh introduction. Continue naturally.');
  }

  // ── RULE 12: GUIDE LOOP ESCALATION ──
  // If 2+ guides have been surfaced AND the last system action was a guide,
  // force escalation to a decisive action (calculator/booking) instead of another guide.
  // Aligns with: "If a user repeats the same choice twice, she must escalate."
  if (state.guide_history.length >= 2 && state.last_system_action === 'guide') {
    const ACCEPTANCE_PATTERNS = /^(yes|yeah|sure|ok|guide|show me|send it|sí|si|claro|muéstrame|muestrame|envía|envia|dale)/i;
    // Only trigger if current turn looks like an acceptance (checked upstream via message param)
    hints.push(language === 'es'
      ? 'GUARDIA ESCALACIÓN: Ya se han sugerido 2+ guías. NO ofrezcas otra guía. Recomienda una acción decisiva: la calculadora de ganancias netas o una conversación con Kasandra.'
      : 'GUARD ESCALATION: 2+ guides have been surfaced. Do NOT offer another guide. Recommend a decisive action: the net proceeds estimator or a conversation with Kasandra.');
    violations.push({ rule: 'guide_loop_escalation', action: 'modified' });
  }

  return {
    guardHints: hints.length > 0 ? '\n\n' + hints.join('\n') : '',
    chipOverrides,
    maxTokensOverride,
    blockGeneration,
    violations,
  };
}

// ─── Internal Helpers ────────────────────────────────────────────────────────

function detectEmotionalPosture(message: string, userHistory: ChatMessage[]): EmotionalPosture {
  // Check current message first (most authoritative signal)
  if (OVERWHELM_PATTERNS.test(message)) return 'overwhelmed';

  // Check recent history for overwhelm
  const recentUser = userHistory.slice(-3);
  if (recentUser.some(m => OVERWHELM_PATTERNS.test(m.content))) return 'overwhelmed';

  // Anxiety detection
  if (ANXIETY_PATTERNS.test(message)) return 'anxious';
  if (recentUser.some(m => ANXIETY_PATTERNS.test(m.content))) return 'anxious';

  // Confidence detection
  if (CONFIDENCE_PATTERNS.test(message)) return 'confident';

  // Default: curious (neutral forward state)
  return 'curious';
}

function deriveEscalationLevel(
  context: GuardContext,
  history: ChatMessage[],
  message: string
): EscalationLevel {
  // Check for booking confirmation in assistant history
  const assistantMessages = history.filter(m => m.role === 'assistant');
  if (assistantMessages.some(m => BOOKING_CONFIRMED_PATTERNS.test(m.content))) {
    return 'booked';
  }

  // Mode 4 = handoff level
  if (context.current_mode === 4) return 'offer';

  // Tool completion or quiz = suggest level
  if (context.tool_used || context.quiz_completed) return 'suggest';

  // Engaged with guides = suggest level
  if (context.last_guide_id && (context.chip_phase_floor ?? 0) >= 2) return 'suggest';

  return 'none';
}

function extractGuideHistory(assistantMessages: ChatMessage[], context: GuardContext): string[] {
  const guides: Set<string> = new Set();

  // From context
  if (context.last_guide_id) guides.add(context.last_guide_id);

  // From assistant message content
  for (const msg of assistantMessages) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(GUIDE_REFERENCE_PATTERN.source, 'gi');
    while ((match = regex.exec(msg.content)) !== null) {
      // Find the first non-undefined capture group
      const guideTitle = match[1] || match[2] || match[3] || match[4] || match[5];
      if (guideTitle) guides.add(guideTitle.trim().toLowerCase());
    }
  }

  return [...guides];
}

function detectQuestionType(assistantMessages: ChatMessage[]): QuestionType {
  if (assistantMessages.length === 0) return 'none';
  const last = assistantMessages[assistantMessages.length - 1].content;

  if (!last.includes('?')) return 'none';

  // Emotional questions
  if (/how.*feel|what.*worry|cómo.*sient|qué.*preocupa/i.test(last)) return 'emotional';
  // Decision questions
  if (/would you|prefer|ready to|which|qué prefier|cuál|le gustaría/i.test(last)) return 'decision';
  // Clarifying questions
  if (/can you tell|what.*looking|could you share|me puede|qué busca|podría/i.test(last)) return 'clarifying';

  return 'open';
}

function detectSystemAction(assistantMessages: ChatMessage[]): SystemAction {
  if (assistantMessages.length === 0) return 'none';
  const last = assistantMessages[assistantMessages.length - 1].content;

  if (/guide|guía/i.test(last) && /read|explore|check out|leer|explorar|revisar/i.test(last)) return 'guide';
  if (/estimat|calculat|tool|herramienta|calcul/i.test(last)) return 'tool_rec';
  if (/book|schedule|kasandra.*call|reserv|agend|cita/i.test(last)) return 'booking_offer';
  if (/kasandra.*can|kasandra.*will|kasandra puede|kasandra va/i.test(last)) return 'deferral';

  return 'explanation';
}

function countSimilarTurns(userHistory: ChatMessage[], currentMessage: string): number {
  if (userHistory.length === 0) return 0;

  const current = currentMessage.toLowerCase().trim();
  const currentWords = new Set(current.split(/\s+/).filter(w => w.length > 2));
  let count = 0;

  // Check last 3 user messages for similarity
  const recent = userHistory.slice(-3);
  for (let i = recent.length - 1; i >= 0; i--) {
    const prev = recent[i].content.toLowerCase().trim();
    const prevWords = new Set(prev.split(/\s+/).filter(w => w.length > 2));
    const intersection = [...currentWords].filter(w => prevWords.has(w)).length;
    const union = new Set([...currentWords, ...prevWords]).size;

    if (union > 0 && (intersection / union) >= 0.5) {
      count++;
    } else {
      break; // Stop counting at first non-similar turn
    }
  }

  return count;
}
