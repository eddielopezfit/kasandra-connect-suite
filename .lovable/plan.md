
# GHL Integration Finalization Plan

## Summary
This plan implements three critical updates to ensure the website correctly maps form data to GoHighLevel (GHL) custom fields: adding Property Address capture to the Seller funnel, standardizing webhook payloads with `selena_*` prefixed keys, and implementing an access gate on the Private Cash Review page.

---

## Task 1: Add Property Address to Seller Quiz/Result Flow

### Current State
- The `SellerQuiz.tsx` captures: situation, condition, timeline, and value
- The `SellerResult.tsx` captures: name and email (for unlock)
- **Gap**: No property address field exists in this flow

### Changes Required

**1.1 Add Address Step to SellerQuiz.tsx**
Insert a new quiz step (step 5) after "value" that captures the property address as a text input field:

```text
Step 5: "What's the property address?"
- Text input field for address
- Optional autocomplete suggestion (Tucson area hint)
- Skip option: "I'd rather not share yet"
```

**1.2 Pass Address to SellerResult.tsx**
Update the navigation from quiz to result to include `address` in URL params:
- Add `address: newAnswers.address || ''` to the URLSearchParams

**1.3 Update SellerResult.tsx to Send Address**
Modify the form submission to include `propertyAddress` in the edge function payload.

---

## Task 2: Standardize Webhook Payloads for GHL

### Target Payload Structure
Both edge functions must send these **top-level** keys (not nested):

| Key | Source |
|-----|--------|
| `selena_lead_id` | Database-generated lead ID |
| `selena_session_id` | From localStorage/input |
| `selena_intent_canonical` | Normalized intent (buy/sell/cash/dual/explore) |
| `selena_language_raw` | en/es |
| `selena_timeline_raw` | Raw timeline value |
| `selena_budget_raw` | Price range value |
| `selena_target_neighborhoods` | Target areas for buyers |
| `selena_property_address` | Property address for sellers |
| `selena_is_pre_approved` | "Yes" or "No" string |

### 2.1 Update `submit-consultation-intake/index.ts`

**Interface Update:**
- Add `session_id` to input interface (already exists)

**GHL Payload Restructure:**
Replace current top-level keys with `selena_` prefixed versions:

```typescript
const ghlPayload = {
  // Standard contact fields
  email,
  name: input.name.trim(),
  firstName,
  lastName,
  phone: input.phone.trim(),
  tags: allTags,
  
  // STANDARDIZED selena_* top-level keys for GHL workflow
  selena_lead_id: leadId,
  selena_session_id: input.session_id || null,
  selena_intent_canonical: normalizedIntent.canonical,
  selena_language_raw: input.language,
  selena_timeline_raw: normalizedTimeline.raw,
  selena_budget_raw: input.price_range || null,
  selena_target_neighborhoods: input.target_neighborhoods || null,
  selena_property_address: input.property_address || null,
  selena_is_pre_approved: input.pre_approved === 'yes' ? 'Yes' : 'No',
  
  // Keep customField for backward compatibility
  customField: { ... }
};
```

### 2.2 Update `submit-seller/index.ts`

**Interface Update:**
```typescript
interface SellerLeadPayload {
  name: string;
  email: string;
  propertyAddress?: string;  // NEW
  situation?: string;
  condition?: string;
  timeline?: string;
  estimatedValue?: string;
  calculatedCashOffer?: number;
  calculatedListingNet?: number;
  sessionId?: string;        // NEW
  language?: string;         // NEW (default 'en')
}
```

**GHL Payload Restructure:**
```typescript
const ghlPayload = {
  // Standard contact fields
  email: sanitizedPayload.email,
  name: sanitizedPayload.name,
  firstName,
  lastName,
  tags: allTags,
  
  // STANDARDIZED selena_* top-level keys for GHL workflow
  selena_lead_id: leadData.id,
  selena_session_id: payload.sessionId || null,
  selena_intent_canonical: 'sell',
  selena_language_raw: payload.language || 'en',
  selena_timeline_raw: sanitizedPayload.timeline || null,
  selena_budget_raw: sanitizedPayload.estimated_value || null,
  selena_target_neighborhoods: null, // N/A for sellers
  selena_property_address: sanitizedPayload.property_address || null,
  selena_is_pre_approved: 'No', // N/A for sellers
  
  // Keep customField for rich context
  customField: {
    lead_id: leadData.id,
    situation: sanitizedPayload.situation,
    condition: sanitizedPayload.condition,
    timeline: sanitizedPayload.timeline,
    estimated_value: sanitizedPayload.estimated_value,
    property_address: sanitizedPayload.property_address,
    cash_offer: sanitizedPayload.calculated_cash_offer,
    listing_net: sanitizedPayload.calculated_listing_net,
  },
  source: "Seller Funnel - Tucson Inherited Homes"
};
```

---

## Task 3: Implement Access Gate on V2PrivateCashReview

### Current State
- Page checks for `selena_lead_id` in localStorage
- Shows personalized hero for returning leads
- **Gap**: No actual restriction for anonymous visitors

### Changes Required

**3.1 Create Phone Verification Component**
New component: `src/components/v2/PhoneVerificationGate.tsx`

Features:
- Phone number input with validation
- Submit button to verify access
- Calls edge function to lookup lead by phone
- On success: stores `selena_lead_id` in localStorage and reveals content

**3.2 Update V2PrivateCashReview.tsx**

Add state machine:
```typescript
type GateState = 'checking' | 'locked' | 'unlocked';

const [gateState, setGateState] = useState<GateState>('checking');

useEffect(() => {
  const leadId = getLeadId();
  if (leadId) {
    setGateState('unlocked');
  } else {
    setGateState('locked');
  }
}, []);
```

Render logic:
- If `gateState === 'checking'`: Show loading skeleton
- If `gateState === 'locked'`: Show `PhoneVerificationGate` component
- If `gateState === 'unlocked'`: Show full `PrivateCashReviewContent`

**3.3 Create Edge Function for Phone Lookup**
New function: `supabase/functions/verify-lead-phone/index.ts`

Logic:
1. Accept phone number
2. Query `lead_profiles` table for matching phone
3. If found: Return `{ ok: true, lead_id: '...' }`
4. If not found: Return `{ ok: false, error: 'No record found' }`

---

## Technical Details

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ad/SellerQuiz.tsx` | Add address step (step 5) |
| `src/pages/ad/SellerResult.tsx` | Read address from URL, pass to edge function |
| `supabase/functions/submit-seller/index.ts` | Add property_address, standardize GHL payload |
| `supabase/functions/submit-consultation-intake/index.ts` | Standardize GHL payload with selena_* prefix |
| `src/pages/v2/V2PrivateCashReview.tsx` | Implement gate state machine |

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/v2/PhoneVerificationGate.tsx` | Phone input gate component |
| `supabase/functions/verify-lead-phone/index.ts` | Phone lookup edge function |

### Database Impact
- No schema changes required
- Uses existing `lead_profiles` table with `phone` column for verification

### GHL Custom Field Mapping Reference
After implementation, the GHL workflow can map these webhook keys directly:

| GHL Custom Field | Webhook Key |
|------------------|-------------|
| `selena_lead_id` | `{{inboundWebhookRequest.selena_lead_id}}` |
| `selena_session_id` | `{{inboundWebhookRequest.selena_session_id}}` |
| `selena_intent_canonical` | `{{inboundWebhookRequest.selena_intent_canonical}}` |
| `selena_language_raw` | `{{inboundWebhookRequest.selena_language_raw}}` |
| `selena_timeline_raw` | `{{inboundWebhookRequest.selena_timeline_raw}}` |
| `selena_budget_raw` | `{{inboundWebhookRequest.selena_budget_raw}}` |
| `selena_target_neighborhoods` | `{{inboundWebhookRequest.selena_target_neighborhoods}}` |
| `selena_property_address` | `{{inboundWebhookRequest.selena_property_address}}` |
| `selena_is_pre_approved` | `{{inboundWebhookRequest.selena_is_pre_approved}}` |

---

## Testing Checklist

1. **Seller Quiz Flow**
   - Complete quiz with all steps including address
   - Verify address appears in URL params on result page
   - Submit lead capture form and verify GHL receives `selena_property_address`

2. **Consultation Intake Flow**
   - Submit form with cash_offer intent
   - Verify all `selena_*` keys appear at top level in edge function logs
   - Confirm GHL workflow can read values directly

3. **Private Cash Review Gate**
   - Visit page without `selena_lead_id` in localStorage
   - Verify "Restricted Access" state appears
   - Enter valid phone number and verify unlock
   - Refresh page and verify content remains accessible

---

## Rollout Sequence
1. Deploy edge function updates (submit-seller, submit-consultation-intake)
2. Deploy verify-lead-phone edge function
3. Update SellerQuiz with address step
4. Update SellerResult to pass address
5. Update V2PrivateCashReview with gate logic
6. Test end-to-end across all funnels
