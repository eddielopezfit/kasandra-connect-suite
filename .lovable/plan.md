
# Dynamic Suggestion Progress & Conversational Deduplication
## Eliminating Pill Redundancy with Progressive Suggestions

---

## PROBLEM ANALYSIS

When a user clicks "Schedule a tour," the next response from Selena still shows "Schedule a tour" in the pills. This creates:

1. **Cognitive Dissonance**: The user already took that action; seeing it again suggests the system didn't register their choice
2. **Wasted Real Estate**: The pill space could show the logical *next* step instead of redundant options
3. **Broken Flow**: The conversation should *progress*, not loop

**Root Cause**: The `getSuggestedReplies()` function in `selena-chat/index.ts` (lines 156-183) returns static lists based on intent without considering the user's last message or conversation history.

---

## ARCHITECTURE: Progressive Suggestion Engine

### Phase 1: Deduplication Filter (Backend)
Filter out any suggestion that matches (or is semantically similar to) the user's last message.

### Phase 2: Next-Best-Step Mapping (Backend)
Define progression paths that map user selections to logical next steps.

### Phase 3: Frontend Fallback Filter (UI)
Add client-side deduplication as a safety net in case backend returns duplicates.

### Phase 4: Intent-Specific Progress in Tab Bar (UI)
Update the "Start Here" tab to show journey progress for users deep in a path.

---

## TASK 1: Backend Deduplication & Progression Map

### File: `supabase/functions/selena-chat/index.ts`

#### 1.1 Add Similarity Matching Helper

```typescript
/**
 * Fuzzy match check - returns true if strings are 80%+ similar
 * Uses normalized Levenshtein distance
 */
function isSimilar(str1: string, str2: string, threshold = 0.8): boolean {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return true;
  if (s1.length === 0 || s2.length === 0) return false;
  
  // Simple word overlap check for performance
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return (intersection / union) >= threshold;
}
```

#### 1.2 Create Progression Map

```typescript
/**
 * Progression Map: Maps user selection to next-best-step suggestions
 * Format: { triggerPattern: { en: [...], es: [...] } }
 */
const PROGRESSION_MAP: Record<string, { en: string[]; es: string[] }> = {
  // Buyer path progressions
  'schedule a tour': {
    en: ["What should I prepare?", "View buyer guide", "Talk to Kasandra now"],
    es: ["¿Qué debo preparar?", "Ver guía del comprador", "Hablar con Kasandra ahora"]
  },
  'take readiness check': {
    en: ["How long does it take?", "Start now", "What does this check?"],
    es: ["¿Cuánto tiempo toma?", "Comenzar ahora", "¿Qué verifica este análisis?"]
  },
  'view first-time buyer guide': {
    en: ["Schedule a tour", "Ask about financing", "Check my readiness"],
    es: ["Programar un recorrido", "Preguntar sobre financiamiento", "Verificar mi preparación"]
  },
  
  // Seller path progressions
  'what\'s my home worth': {
    en: ["Get a detailed estimate", "Compare cash vs. listing", "Schedule a walkthrough"],
    es: ["Obtener estimación detallada", "Comparar efectivo vs. listado", "Agendar una visita"]
  },
  'compare cash vs. traditional': {
    en: ["Request my net sheet", "Talk to Kasandra", "See cash timeline"],
    es: ["Solicitar mi análisis", "Hablar con Kasandra", "Ver línea de tiempo en efectivo"]
  },
  'request a net sheet': {
    en: ["Review my estimate", "Schedule a consultation", "Ask a question"],
    es: ["Revisar mi estimación", "Agendar una consulta", "Hacer una pregunta"]
  },
  'request a cash offer': {
    en: ["How fast can I close?", "What's the process?", "Talk to Kasandra"],
    es: ["¿Qué tan rápido puedo cerrar?", "¿Cuál es el proceso?", "Hablar con Kasandra"]
  },
  
  // First intent declarations (special handling)
  'i\'m thinking about selling': {
    en: ["What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"],
    es: ["¿Cuánto vale mi casa?", "Comparar efectivo vs. tradicional", "Solicitar análisis de ganancias"]
  },
  'i\'m looking to buy': {
    en: ["Take readiness check", "View first-time buyer guide", "Schedule a tour"],
    es: ["Tomar evaluación de preparación", "Ver guía para compradores", "Programar un recorrido"]
  },
  'just exploring': {
    en: ["Tell me about selling", "Tell me about buying", "What are my options?"],
    es: ["Cuéntame sobre vender", "Cuéntame sobre comprar", "¿Cuáles son mis opciones?"]
  }
};
```

#### 1.3 Modify getSuggestedReplies to Accept User Message

```typescript
/**
 * Progressive suggested replies with deduplication
 * @param intent - Current user intent (sell, buy, exploring, etc.)
 * @param language - 'en' or 'es'
 * @param lastUserMessage - The user's most recent message (for deduplication + progression)
 */
function getSuggestedReplies(
  intent: string | undefined, 
  language: 'en' | 'es',
  lastUserMessage?: string
): string[] {
  // Step 1: Check progression map for specific next steps
  if (lastUserMessage) {
    const normalized = lastUserMessage.toLowerCase().trim();
    
    for (const [trigger, responses] of Object.entries(PROGRESSION_MAP)) {
      if (isSimilar(normalized, trigger) || normalized.includes(trigger)) {
        return responses[language];
      }
    }
  }
  
  // Step 2: Fall back to intent-based static replies
  const staticReplies: Record<IntentKey, { en: string[]; es: string[] }> = {
    sell: {
      en: ["What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"],
      es: ["¿Cuánto vale mi casa?", "Comparar efectivo vs. tradicional", "Solicitar análisis de ganancias"]
    },
    cash_offer: {
      en: ["What's my home worth?", "How fast can I close?", "Request a cash offer"],
      es: ["¿Cuánto vale mi casa?", "¿Qué tan rápido puedo cerrar?", "Solicitar oferta en efectivo"]
    },
    buy: {
      en: ["Take readiness check", "View first-time buyer guide", "Schedule a tour"],
      es: ["Tomar evaluación de preparación", "Ver guía para compradores", "Programar un recorrido"]
    },
    exploring: {
      en: ["I'm thinking about selling", "I'm looking to buy", "What are my options?"],
      es: ["Estoy pensando en vender", "Estoy buscando comprar", "¿Cuáles son mis opciones?"]
    }
  };
  
  const intentKey: IntentKey = intent === 'cash_offer' ? 'cash_offer'
                             : intent === 'sell' ? 'sell'
                             : intent === 'buy' ? 'buy'
                             : 'exploring';
  
  let suggestions = [...staticReplies[intentKey][language]];
  
  // Step 3: Filter out any suggestion similar to user's last message
  if (lastUserMessage) {
    suggestions = suggestions.filter(s => !isSimilar(s, lastUserMessage, 0.7));
  }
  
  return suggestions;
}
```

#### 1.4 Update Main Handler to Pass User Message

```typescript
// In the main handler, around line 277:
const suggestedReplies = getSuggestedReplies(effectiveIntent, language, message);
```

---

## TASK 2: Frontend Fallback Deduplication

### File: `src/components/selena/SelenaChatDrawer.tsx`

Add a filtering step in `SuggestedRepliesChips` to remove any pill that matches the user's last message:

```typescript
const SuggestedRepliesChips = () => {
  if (!suggestedReplies || suggestedReplies.length === 0 || isLoading || activeTab) {
    return null;
  }
  
  // Get the last user message for deduplication
  const lastUserMessage = [...messages]
    .reverse()
    .find(m => m.role === 'user')?.content?.toLowerCase().trim();
  
  // Filter out any pill that matches (or is very similar to) the last user message
  const filteredReplies = suggestedReplies.filter(reply => {
    if (!lastUserMessage) return true;
    const normalized = reply.toLowerCase().trim();
    // Exact match check
    if (normalized === lastUserMessage) return false;
    // Fuzzy match: check if 80%+ of words overlap
    const replyWords = new Set(normalized.split(/\s+/));
    const userWords = new Set(lastUserMessage.split(/\s+/));
    const intersection = [...replyWords].filter(w => userWords.has(w)).length;
    const union = new Set([...replyWords, ...userWords]).size;
    if (union > 0 && (intersection / union) >= 0.8) return false;
    return true;
  });
  
  if (filteredReplies.length === 0) return null;
  
  return (
    <div className="border-t border-border px-4 py-2.5 shrink-0 bg-background/95 backdrop-blur-sm">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide max-w-full">
        {filteredReplies.map((reply, index) => (
          // ... existing button markup
        ))}
      </div>
    </div>
  );
};
```

---

## TASK 3: Intent-Specific Progress in Tab Bar

### File: `src/components/selena/ConciergeTabBar.tsx`

Enhance the "Start Here" tab to show journey progress when a user is deep in a path.

#### 3.1 Accept Intent and Journey Step Props

```typescript
interface ConciergeTabBarProps {
  activeTab: ConciergeTab | null;
  onTabChange: (tab: ConciergeTab) => void;
  language: 'en' | 'es';
  // New props for journey awareness
  currentIntent?: 'sell' | 'buy' | 'cash_offer' | 'exploring';
  journeyStep?: number; // 1, 2, 3, etc.
}
```

#### 3.2 Update Tab Config for Dynamic Labels

```typescript
function getTabLabel(
  tab: ConciergeTab, 
  language: 'en' | 'es', 
  intent?: string, 
  step?: number
): string {
  // Special case: show journey progress on 'start' tab
  if (tab === 'start' && intent && intent !== 'exploring' && step) {
    const stepLabels: Record<string, { en: string; es: string }[]> = {
      sell: [
        { en: 'Step 1: Valuation', es: 'Paso 1: Valuación' },
        { en: 'Step 2: Analysis', es: 'Paso 2: Análisis' },
        { en: 'Step 3: Decision', es: 'Paso 3: Decisión' },
        { en: 'Step 4: Action', es: 'Paso 4: Acción' },
      ],
      buy: [
        { en: 'Step 1: Readiness', es: 'Paso 1: Preparación' },
        { en: 'Step 2: Discovery', es: 'Paso 2: Exploración' },
        { en: 'Step 3: Touring', es: 'Paso 3: Recorridos' },
        { en: 'Step 4: Offer', es: 'Paso 4: Oferta' },
      ],
      cash_offer: [
        { en: 'Step 1: Estimate', es: 'Paso 1: Estimación' },
        { en: 'Step 2: Compare', es: 'Paso 2: Comparar' },
        { en: 'Step 3: Review', es: 'Paso 3: Revisar' },
        { en: 'Step 4: Close', es: 'Paso 4: Cerrar' },
      ],
    };
    
    const steps = stepLabels[intent];
    if (steps && step <= steps.length) {
      return steps[step - 1][language];
    }
  }
  
  // Default labels
  const config = TAB_CONFIG[tab];
  return language === 'es' ? config.labelEs : config.labelEn;
}
```

#### 3.3 Compute Journey Step from Session Context

In `SelenaChatDrawer.tsx`, derive journey step from SessionContext:

```typescript
// Add helper to compute journey step
function computeJourneyStep(context: SessionContext | null): number {
  if (!context) return 0;
  
  let step = 1;
  
  // For sellers
  if (context.intent === 'sell' || context.intent === 'cash_offer') {
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

// In component, pass to ConciergeTabBar:
const sessionContext = getSessionContext();
const journeyStep = computeJourneyStep(sessionContext);

<ConciergeTabBar
  activeTab={activeTab}
  onTabChange={handleTabChange}
  language={uiLanguage}
  currentIntent={sessionContext?.intent}
  journeyStep={journeyStep}
/>
```

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/selena-chat/index.ts` | MODIFY | Add `isSimilar()`, `PROGRESSION_MAP`, update `getSuggestedReplies()` |
| `src/components/selena/SelenaChatDrawer.tsx` | MODIFY | Add client-side deduplication in `SuggestedRepliesChips`, pass journey context |
| `src/components/selena/ConciergeTabBar.tsx` | MODIFY | Accept intent/step props, dynamic label for "Start Here" tab |
| `src/lib/analytics/logEvent.ts` | MODIFY | Add `suggestion_dedup_filtered` event type |

---

## VERIFICATION FLOW

### Test 1: Deduplication
1. Open Selena Chat
2. See pills: "I'm thinking about selling", "I'm looking to buy", "What are my options?"
3. Click "I'm thinking about selling"
4. **Verify**: Next pills do NOT include "I'm thinking about selling"
5. **Verify**: Pills show seller progression: "What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"

### Test 2: Progression
1. After declaring seller intent
2. Click "What's my home worth?"
3. **Verify**: Pills progress to: "Get a detailed estimate", "Compare cash vs. listing", "Schedule a walkthrough"
4. **Not**: "What's my home worth?" (already clicked)

### Test 3: Journey Progress Tab
1. After using calculator (tool_used set)
2. Open Selena Chat
3. **Verify**: "Start Here" tab shows "Step 2: Analysis" instead of "Start Here"

---

## SUCCESS CRITERIA

1. No suggested reply matches the user's previous message
2. Pills progress logically through the conversion funnel
3. "Start Here" tab shows journey progress for users with declared intent
4. Frontend fallback filter catches any edge cases the backend misses
5. Seller path never shows buyer pills; buyer path never shows seller pills
