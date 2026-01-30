
# Context-Aware Enhancements: Booking Hero, Loss Aversion, & Situation Tagging
## Complete Implementation Plan

---

## SUMMARY

This plan implements three behavioral psychology-driven enhancements:

1. **Context-Aware Booking Hero**: Transform the `/v2/book` headline to maintain the curiosity thread from the FB Ad funnel
2. **Loss Aversion in Selena Chat**: Proactive chat opening after 30 seconds on the result page if form not completed
3. **Situation Tagging**: Pass quiz situation icons as semantic tags to GHL (e.g., "Legacy Property Seller")

---

## TASK 1: Context-Aware Booking Hero

### Current State
The `/v2/book` page always shows a generic headline:
- "Book a Consultation" (English)
- "Agendar una Cita" (Spanish)

### Target State
If the user came from the FB Ad funnel with calculated net sheet data, show a personalized headline that maintains the curiosity thread:
- "Let's Review Your $47,250 Net Sheet Analysis"

### Detection Logic
The ad funnel stores calculated values in `SessionContext`:
- `ad_funnel_source`: 'seller_landing' | 'seller_quiz'
- `ad_funnel_value_range`: e.g., '200-350k'
- `last_tool_result`: 'cash' | 'traditional'

Additionally, the `SellerResult.tsx` page calls `bridgeQuizResultsToV2()` which sets:
- `intent: 'cash_offer'`
- `timeline`, `situation`, `condition`

We can also read `localStorage` for the calculated difference stored during quiz completion.

### Implementation

**File**: `src/pages/v2/V2Book.tsx`

```typescript
// Add imports
import { getSessionContext } from "@/lib/analytics/selenaSession";

// Inside V2BookContent component:
const session = getSessionContext();

// Detect if user came from ad funnel with net sheet data
const isAdFunnelVisitor = session?.ad_funnel_source && session?.intent === 'cash_offer';

// Get stored difference from localStorage (set by SellerResult.tsx)
const storedDifference = localStorage.getItem('cc_net_sheet_difference');
const formattedDifference = storedDifference 
  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(storedDifference))
  : null;

// Dynamic headline logic
const getHeadline = () => {
  if (isAdFunnelVisitor && formattedDifference) {
    return t(
      `Let's Review Your ${formattedDifference} Net Sheet Analysis`,
      `Revisemos su Análisis de Ganancias Netas de ${formattedDifference}`
    );
  }
  return t("Book a Consultation", "Agendar una Cita");
};

// Also update subheadline for ad funnel visitors
const getSubheadline = () => {
  if (isAdFunnelVisitor) {
    return t(
      "Kasandra will personally walk you through your options and answer any questions.",
      "Kasandra le explicará personalmente sus opciones y responderá todas sus preguntas."
    );
  }
  return t(
    "Ready to discuss your real estate goals? Schedule a free, no-obligation consultation with me.",
    "¿Listo para discutir sus metas de bienes raíces? Agende una consulta gratuita, sin obligación, conmigo."
  );
};
```

**File**: `src/pages/ad/SellerResult.tsx`

Add storage of the calculated difference for the booking page:

```typescript
// After calculations are computed, store for booking page continuity:
useEffect(() => {
  if (calculations.difference) {
    localStorage.setItem('cc_net_sheet_difference', String(calculations.difference));
  }
}, [calculations.difference]);
```

---

## TASK 2: Loss Aversion Selena Chat Trigger

### Current State
Selena opens only when the user clicks the floating button.

### Target State
On the `/ad/seller-result` page, if the user has NOT filled out the form within 30 seconds, Selena proactively opens with a loss-aversion-framed message about the calculated difference.

### Implementation

**File**: `src/pages/ad/SellerResult.tsx`

```typescript
// Add imports
import { useSelenaChat } from '@/contexts/SelenaChatContext';

// Inside component:
const { openChat, sendMessage, messages, isOpen } = useSelenaChat();

// Loss aversion timer
useEffect(() => {
  // Only trigger if form not yet submitted and chat not already open
  if (isUnlocked || isOpen) return;
  
  const timer = setTimeout(() => {
    // Open chat with proactive message
    openChat();
    
    // Wait for chat to open, then inject proactive message
    setTimeout(() => {
      const proactiveMessage = `I noticed the ${formatCurrency(calculations.difference)} difference in your report. Would you like me to explain exactly how we calculated the "Cost of Time" for your property?`;
      
      // Trigger a proactive assistant message via custom event
      window.dispatchEvent(new CustomEvent('selena-proactive-message', {
        detail: { message: proactiveMessage }
      }));
    }, 500);
  }, 30000); // 30 seconds
  
  return () => clearTimeout(timer);
}, [isUnlocked, isOpen, calculations.difference]);
```

**File**: `src/contexts/SelenaChatContext.tsx`

Add support for proactive messages:

```typescript
// Listen for proactive message events
useEffect(() => {
  const handleProactiveMessage = (event: CustomEvent<{ message: string }>) => {
    const proactiveMsg: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: event.detail.message,
      timestamp: new Date().toISOString(),
      suggestedReplies: [
        t("Yes, explain the difference", "Sí, explícame la diferencia"),
        t("I'd like to talk to Kasandra", "Me gustaría hablar con Kasandra"),
        t("Not right now", "Ahora no"),
      ],
    };
    setMessages(prev => [...prev, proactiveMsg]);
    saveHistory([...messages, proactiveMsg]);
    logEvent('selena_proactive_loss_aversion', { 
      route: location.pathname,
      difference_amount: event.detail.message.match(/\$[\d,]+/)?.[0] || 'unknown'
    });
  };
  
  window.addEventListener('selena-proactive-message', handleProactiveMessage as EventListener);
  return () => window.removeEventListener('selena-proactive-message', handleProactiveMessage as EventListener);
}, [messages, t, location.pathname]);
```

---

## TASK 3: Situation Tagging to GHL

### Current State
The `submit-seller` edge function sends basic tags like `["Seller Funnel", "seller_funnel"]` but does NOT include semantic situation tags.

### Target State
Add situation-based semantic tags that Kasandra's CRM can use for automation:

| Situation | Tag Added |
|-----------|-----------|
| `inherited` | `Legacy Property Seller`, `situation_inherited` |
| `relocating` | `Relocation Seller`, `situation_relocating` |
| `downsizing` | `Downsizing Seller`, `situation_downsizing` |
| `other` | `situation_other` |

Also add condition and timeline tags for full context.

### Implementation

**File**: `supabase/functions/submit-seller/index.ts`

```typescript
// Build semantic tags based on quiz answers
const situationTagMap: Record<string, string[]> = {
  inherited: ['Legacy Property Seller', 'situation_inherited'],
  relocating: ['Relocation Seller', 'situation_relocating'],
  downsizing: ['Downsizing Seller', 'situation_downsizing'],
  other: ['situation_other'],
};

const conditionTagMap: Record<string, string> = {
  excellent: 'condition_move_in_ready',
  good: 'condition_minor_repairs',
  fair: 'condition_needs_work',
  poor: 'condition_distressed',
};

const timelineTagMap: Record<string, string> = {
  asap: 'timeline_urgent',
  soon: 'timeline_30_days',
  flexible: 'timeline_flexible',
  'no-rush': 'timeline_no_rush',
};

// Build tags array with semantic situation tags
const baseTags = ["Seller Funnel", "seller_funnel"];
const situationTags = sanitizedPayload.situation 
  ? (situationTagMap[sanitizedPayload.situation] || []) 
  : [];
const conditionTag = sanitizedPayload.condition 
  ? conditionTagMap[sanitizedPayload.condition] 
  : null;
const timelineTag = sanitizedPayload.timeline 
  ? timelineTagMap[sanitizedPayload.timeline] 
  : null;

const allTags = [
  ...baseTags,
  ...situationTags,
  conditionTag,
  timelineTag,
].filter(Boolean);

// Update GHL payload
const ghlPayload = {
  // ... existing fields
  tags: allTags,
  // ... rest of payload
};
```

**File**: `supabase/functions/submit-consultation-intake/index.ts`

Apply same logic to the consultation intake function:

```typescript
// Add situation-based tags to GHL sync
const situationTagMap: Record<string, string[]> = {
  inherited: ['Legacy Property Seller', 'situation_inherited'],
  relocating: ['Relocation Seller', 'situation_relocating'],
  divorce: ['Divorce Situation', 'situation_divorce'],
  tired_landlord: ['Tired Landlord', 'situation_tired_landlord'],
  upgrading: ['Upgrader', 'situation_upgrading'],
  other: ['situation_other'],
};

// In the GHL payload tags array, add:
input.situation ? (situationTagMap[input.situation] || [`situation_${input.situation}`]) : [],
```

---

## FILE CHANGES SUMMARY

| File | Action | Description |
|------|--------|-------------|
| `src/pages/v2/V2Book.tsx` | MODIFY | Add context-aware headline based on ad funnel data |
| `src/pages/ad/SellerResult.tsx` | MODIFY | Store difference in localStorage + add loss aversion timer |
| `src/contexts/SelenaChatContext.tsx` | MODIFY | Add proactive message event listener |
| `supabase/functions/submit-seller/index.ts` | MODIFY | Add semantic situation tags to GHL payload |
| `supabase/functions/submit-consultation-intake/index.ts` | MODIFY | Add semantic situation tags to GHL payload |

---

## EXPECTED BEHAVIOR

### User Journey: FB Ad to Booking

```text
1. User clicks FB ad → /ad/seller
2. Takes quiz → /ad/seller-quiz
3. Sees result → /ad/seller-result (sees $47,250 difference)
4. Doesn't fill form...
5. 30 seconds pass → Selena opens proactively
   "I noticed the $47,250 difference in your report..."
6. User engages or fills form
7. Navigates to → /v2/book
8. Hero shows: "Let's Review Your $47,250 Net Sheet Analysis"
9. Form submitted → GHL receives tags: ["Legacy Property Seller", "timeline_urgent"]
```

### GHL Tag Examples

For a user who:
- Selected "Inherited Property"
- Condition: "Needs Work"
- Timeline: "ASAP"

GHL will receive:
```json
{
  "tags": [
    "Seller Funnel",
    "seller_funnel",
    "Legacy Property Seller",
    "situation_inherited",
    "condition_needs_work",
    "timeline_urgent"
  ]
}
```

---

## SUCCESS CRITERIA

1. `/v2/book` shows personalized headline when user comes from ad funnel with net sheet data
2. Selena opens proactively after 30 seconds on result page with loss-aversion message
3. GHL receives semantic situation tags (e.g., "Legacy Property Seller") for all quiz submissions
4. Standard `/v2/book` visitors see the default "Book a Consultation" headline
5. Timer does NOT fire if user has already completed the form

---

## VERIFICATION TESTS

1. **Ad Funnel to Booking Flow**:
   - Complete seller quiz → See result → Navigate to `/v2/book`
   - Verify headline shows personalized "$X Net Sheet" message

2. **Loss Aversion Timer**:
   - Go to `/ad/seller-result` with quiz params
   - Wait 30 seconds without filling form
   - Verify Selena opens with proactive message

3. **GHL Tagging**:
   - Submit form with "inherited" situation
   - Check edge function logs for "Legacy Property Seller" tag in payload
