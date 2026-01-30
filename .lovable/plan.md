

# Chat Intelligence Upgrade & Form Submission Fix
## Debug & Verification Plan

---

## ANALYSIS SUMMARY

After thorough code review, I found that **most of the requested features are already implemented**:

| Feature | Status | Location |
|---------|--------|----------|
| Intent-Aware Suggestions | Already Implemented | `selena-chat/index.ts` lines 153-183 |
| Address Collection | Already Implemented | `selena-chat/index.ts` lines 228-258 |
| GHL Semantic Fields | Already Implemented | `submit-consultation-intake/index.ts` lines 318-323 |
| SessionContext Sync | Already Implemented | `SelenaChatContext.tsx` lines 353-355 |
| Native Guide Form | Already Implemented | `NativeGuideLeadCapture.tsx` |

The primary task is to **fix the form submission error** and verify the implementations work correctly.

---

## TASK 1: Fix NativeGuideLeadCapture Submission Error

### Root Cause Analysis

The form logic appears correct, but there are potential issues:

1. **CORS Headers**: The `submit-consultation-intake` CORS headers may be missing some client-sent headers
2. **Undefined Session Values**: `getFullSessionDossier()` may spread undefined fields that cause issues
3. **Error Handling**: The form catches errors but doesn't expose detailed error messages for debugging

### Fixes Required

**File**: `supabase/functions/submit-consultation-intake/index.ts`

Update CORS headers to include all Supabase client headers:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

**File**: `src/hooks/useSessionPrePopulation.ts`

Add null-safety to `getFullSessionDossier()`:

```typescript
export function getFullSessionDossier(): Record<string, unknown> {
  const session = getSessionContext();
  
  if (!session) {
    return {};
  }
  
  // Filter out undefined values to prevent edge function issues
  const dossier: Record<string, unknown> = {};
  
  const fields = {
    session_id: session.session_id,
    session_source: session.landing_path,
    intent: session.intent,
    timeline: session.timeline,
    situation: session.situation,
    condition: session.condition,
    tool_used: session.tool_used,
    last_tool_result: session.last_tool_result,
    quiz_completed: session.quiz_completed || false,
    quiz_result_path: session.quiz_result_path,
    has_viewed_report: session.has_viewed_report || false,
    last_report_id: session.last_report_id,
    has_booked: session.has_booked || false,
    utm_source: session.utm_source,
    utm_campaign: session.utm_campaign,
    utm_medium: session.utm_medium,
    utm_content: session.utm_content,
    referrer: session.referrer,
    ad_funnel_source: session.ad_funnel_source,
    ad_funnel_value_range: session.ad_funnel_value_range,
  };
  
  // Only include defined, non-undefined values
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      dossier[key] = value;
    }
  }
  
  return dossier;
}
```

**File**: `src/components/v2/guides/NativeGuideLeadCapture.tsx`

Add better error logging for debugging:

```typescript
} catch (error) {
  console.error("Submission error:", error);
  console.error("Error details:", error instanceof Error ? error.message : String(error));
  
  toast({
    title: t("Error", "Error"),
    description: t("Something went wrong. Please try again.", "Algo salió mal. Por favor intente de nuevo."),
    variant: "destructive",
  });
}
```

---

## TASK 2: Verify Intent-Aware Suggestions (Already Implemented)

The `getSuggestedReplies()` function in `selena-chat/index.ts` already handles intent-based filtering:

```typescript
function getSuggestedReplies(intent: string | undefined, language: 'en' | 'es'): string[] {
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
  // ...
}
```

**Status**: No changes needed - already filtering correctly.

---

## TASK 3: Verify Address Collection (Already Implemented)

The proactive address collection is already implemented in `selena-chat/index.ts`:

```typescript
// Check if this is the FIRST sell declaration (for address collection)
const isFirstSellDeclaration = 
  (intents.includes('sell') || intents.includes('cash')) && 
  !context.intent; // No prior intent stored in session

// Build system prompt with optional address collection directive
let additionalInstruction = '';
if (isFirstSellDeclaration) {
  additionalInstruction = language === 'es'
    ? `\n\nEl usuario acaba de indicar que quiere vender. Tu respuesta DEBE terminar preguntando la dirección de la propiedad...`
    : `\n\nThe user just indicated they want to sell. Your response MUST end with asking for the property address...`;
}
```

**Status**: No changes needed - already implemented.

---

## TASK 4: Verify GHL Field Enrichment (Already Implemented)

The `submit-consultation-intake` edge function already includes semantic fields:

```typescript
customField: {
  // ... existing fields
  intent_seller: input.intent === 'seller' || input.intent === 'sell' || input.intent === 'cash_offer',
  intent_buyer: input.intent === 'buyer' || input.intent === 'buy',
  intent_cash: input.intent === 'cash_offer',
  pipeline_stage: getPipelineStage(input.intent),
  last_declared_goal: getGoalLabel(input.intent, input.language),
}
```

**Status**: No changes needed - already implemented.

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/submit-consultation-intake/index.ts` | MODIFY | Expand CORS headers |
| `src/hooks/useSessionPrePopulation.ts` | MODIFY | Add null-safety to `getFullSessionDossier()` |
| `src/components/v2/guides/NativeGuideLeadCapture.tsx` | MODIFY | Add detailed error logging |

---

## VERIFICATION PLAN

### Test 1: Native Form Submission
1. Navigate to any guide page (e.g., `/v2/guides/first-time-buyer-guide`)
2. Fill out the NativeGuideLeadCapture form
3. Submit and verify:
   - No "Something went wrong" error
   - Success toast appears
   - Lead is created in database
   - GHL webhook receives data

### Test 2: Intent-Aware Suggestions
1. Open Selena Chat (fresh session)
2. See default pills: "I'm thinking about selling", "I'm looking to buy", "What are my options?"
3. Click "I'm thinking about selling"
4. Verify:
   - "Looking to buy" pill disappears
   - New pills appear: "What's my home worth?", "Compare cash vs. traditional", "Request a net sheet"
   - Selena asks for property address

### Test 3: SessionContext Sync
1. After clicking "I'm thinking about selling"
2. Navigate to `/v2/book`
3. Verify:
   - ConsultationIntakeForm pre-populates with intent="seller"

---

## SUCCESS CRITERIA

1. Native form submissions complete without error
2. "Looking to buy" pill disappears after declaring sell intent
3. Selena proactively asks for property address on first sell declaration
4. GHL receives `intent_seller: true` and `pipeline_stage: "Seller Lead"` tags
5. SessionContext persists intent across pages

