
# Intent-Aware Suggestion Filtering & GHL Field Mapping
## Eliminating the "Consistency Leak" in Selena Chat

---

## PROBLEM ANALYSIS

The current implementation has a **Consistency Principle violation**: when a user declares "I'm thinking about selling," Selena still shows:
- "What's my home worth?" (seller-relevant)
- "Looking to buy" (WRONG - buyer option)
- "Just exploring" (WRONG - exploratory option)

This breaks the psychological contract. Once intent is declared, the UI should narrow to that path only.

**Root Cause**: The `selena-chat` edge function returns **static suggested replies** regardless of detected intent (lines 228-231).

---

## TASK 1: Intent-Aware Suggestion Filtering

### Current Code (selena-chat/index.ts, lines 225-241)
```typescript
return new Response(
  JSON.stringify({
    reply,
    suggestedReplies:
      language === "es"
        ? ["¿Cuánto vale mi casa?", "Busco comprar", "Solo exploro"]
        : ["What's my home worth?", "Looking to buy", "Just exploring"],
    // ...
  })
);
```

### Target Implementation

Replace static array with intent-aware filtering logic:

```typescript
// Intent-aware suggested replies
function getSuggestedReplies(
  intent: string | undefined, 
  language: 'en' | 'es'
): string[] {
  const replies = {
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
  
  // Default to exploring if no intent
  const intentKey = intent === 'cash_offer' ? 'cash_offer' 
                  : intent === 'sell' ? 'sell'
                  : intent === 'buy' ? 'buy'
                  : 'exploring';
  
  return replies[intentKey][language];
}
```

### Detection & Storage

The edge function already detects intent from the message. We need to:
1. Also check `context.intent` (SessionContext) for previously declared intent
2. Update SessionContext when intent is detected
3. Return filtered suggestions based on the current/detected intent

---

## TASK 2: Linear Conversion Path (Address Collection)

When intent is "sell", Selena should proactively ask for the property address to deepen engagement.

### Implementation

Add to the `selena-chat` edge function after intent detection:

```typescript
// Check if this is the first "sell" declaration
const isFirstSellDeclaration = 
  intents.includes('sell') && 
  !context.intent; // No prior intent stored

// Modify AI prompt to include address collection directive
let additionalInstruction = '';
if (isFirstSellDeclaration) {
  additionalInstruction = `
The user just indicated they want to sell. Your response MUST end with asking for the property address.
Example: "That's an exciting next step! To give you the most accurate market analysis, what is the address of the property you're thinking about selling?"
`;
}

// Append to system prompt when calling AI
const systemPrompt = (language === "es" ? SYSTEM_PROMPT_ES : SYSTEM_PROMPT_EN) 
  + additionalInstruction;
```

---

## TASK 3: GHL Custom Field Mapping

Enhance the `submit-consultation-intake` and `upsert-lead-profile` edge functions to include semantic seller fields.

### New Fields to Support

```typescript
interface LeadSemanticFields {
  // Intent declaration
  intent_seller: boolean;
  intent_buyer: boolean;
  intent_cash: boolean;
  
  // Pipeline routing
  pipeline_stage: 'Seller Lead' | 'Buyer Lead' | 'Cash Offer Lead' | 'Exploring';
  
  // Declaration tracking
  last_declared_goal: string;  // e.g., "Thinking about selling"
  
  // Property context (future)
  property_address?: string;
}
```

### GHL Payload Enhancement

In `submit-consultation-intake` GHL webhook:

```typescript
const ghlPayload = {
  // ... existing fields
  customField: {
    // ... existing fields
    
    // NEW: Semantic intent fields
    intent_seller: input.intent === 'seller' || input.intent === 'cash_offer',
    intent_buyer: input.intent === 'buyer',
    intent_cash: input.intent === 'cash_offer',
    pipeline_stage: getPipelineStage(input.intent),
    last_declared_goal: getGoalLabel(input.intent, input.language),
    property_address: input.property_address || null,
  }
};

function getPipelineStage(intent: string): string {
  switch (intent) {
    case 'seller': return 'Seller Lead';
    case 'cash_offer': return 'Cash Offer Lead';
    case 'buyer': return 'Buyer Lead';
    default: return 'Exploring';
  }
}

function getGoalLabel(intent: string, language: string): string {
  const labels = {
    seller: { en: 'Thinking about selling', es: 'Pensando en vender' },
    cash_offer: { en: 'Interested in cash offer', es: 'Interesado en oferta en efectivo' },
    buyer: { en: 'Looking to buy', es: 'Buscando comprar' },
    explore: { en: 'Just exploring', es: 'Solo explorando' }
  };
  return labels[intent]?.[language] || labels.explore[language];
}
```

---

## TASK 4: Frontend SessionContext Update

When the user selects "I'm thinking about selling" in chat, immediately update `SessionContext` so future interactions remember this.

### Implementation in SelenaChatContext.tsx

After receiving a response with detected intent:

```typescript
// In sendMessage callback, after receiving response
const data = await response.json();

// If backend detected intent, update SessionContext
if (data.detected_intent) {
  updateSessionContext({ intent: data.detected_intent });
}
```

This ensures the frontend also knows the intent for:
- Form pre-population
- Dynamic hero headlines
- Concierge tab filtering

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/selena-chat/index.ts` | MODIFY | Add `getSuggestedReplies()` with intent filtering, return `detected_intent` |
| `src/contexts/SelenaChatContext.tsx` | MODIFY | Update SessionContext when backend returns `detected_intent` |
| `supabase/functions/submit-consultation-intake/index.ts` | MODIFY | Add `intent_seller`, `pipeline_stage`, `last_declared_goal` to GHL payload |
| `supabase/functions/upsert-lead-profile/index.ts` | MODIFY | Accept and store `property_address` field |

---

## VERIFICATION FLOW

1. **Open Selena Chat** (fresh session)
2. **See default pills**: "I'm thinking about selling", "I'm looking to buy", "Just exploring"
3. **Click "I'm thinking about selling"**
4. **Selena responds**: "That's an exciting next step! To give you the most accurate market analysis, what is the address of the property you're thinking about selling?"
5. **Pills update to**: "What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"
6. **"Looking to buy" pill is GONE** (Consistency Principle maintained)
7. **User provides email** → GHL receives: `intent_seller: true`, `pipeline_stage: "Seller Lead"`

---

## EXPECTED BEHAVIOR

### Before (Current)
```
User: "I'm thinking about selling"
Selena: "I can help with that..."
Pills: [What's my home worth?] [Looking to buy] [Just exploring]  ← LEAK
```

### After (Target)
```
User: "I'm thinking about selling"
Selena: "That's an exciting next step! What is the address of the property?"
Pills: [What's my home worth?] [Compare cash vs. traditional] [Request a net sheet]  ← FOCUSED
```

---

## SUCCESS CRITERIA

1. After declaring seller intent, buyer-related pills disappear instantly
2. Selena proactively asks for property address on first sell declaration
3. GHL receives `pipeline_stage: "Seller Lead"` for all seller intent submissions
4. SessionContext stores intent so other pages can personalize accordingly
5. Browser test confirms pills filter correctly in real-time
