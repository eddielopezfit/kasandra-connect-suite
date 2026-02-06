

# Selena Digital Concierge Communication Audit
## Complete Documentation of Patterns, Misalignments & Recommendations

---

## 1. Executive Summary

This audit documents Selena's communication patterns, CTA exposure, and escalation behavior against the **"Digital Concierge / Earned Access"** philosophy.

### Core Finding
**Selena's voice and persona are correctly calibrated, but her structural behavior creates a "High-Pressure Sales Bot" experience that conflicts with the "Calm Concierge" design intent.**

---

## 2. Communication Intent Analysis

### What Selena is Currently Trying to Do

| Dimension | Observed Behavior | Alignment |
|-----------|-------------------|-----------|
| **Educate** | Guides users to relevant resources, provides guide-aware greetings | ✅ Aligned |
| **Qualify** | Demands property address immediately upon sell intent declaration | ⚠️ Premature |
| **Reassure** | "No pressure" language in system prompts | ✅ Aligned |
| **Push Booking** | Every AI response includes a hardcoded "Schedule with Kasandra" CTA | ❌ Misaligned |

### Evidence: Hardcoded Booking CTA

**Location:** `supabase/functions/selena-chat/index.ts` (Lines 385-391)

```text
actions: [
  {
    label: "Schedule with Kasandra" / "Agenda con Kasandra",
    href: "/v2/book",
    eventType: "book_click",
  },
]
```

**Impact:** Even a user's first message ("Hi, just exploring") triggers a booking button. This violates the "earned access" model.

---

## 3. Commitment Ladder Analysis

### Current Micro-Commitments (In Order)

| Step | Micro-Commitment | Trigger | Assessment |
|------|------------------|---------|------------|
| 1 | Open Selena chat | User clicks FAB | ✅ Appropriate |
| 2 | Declare intent (Buy/Sell/Explore) | First suggested reply | ✅ Appropriate |
| 3 | **Property Address Request** | Immediately after sell intent | ❌ Too Early |
| 4 | Booking CTA exposure | Every single message | ❌ Too Frequent |
| 5 | Priority Call Modal | User requests or high-intent signal | ⚠️ Conditional |
| 6 | Lead capture (email) | Before report access or booking | ✅ Appropriate |

### Misalignments Identified

**A. Premature Address Collection**
- Location: `selena-chat/index.ts` Lines 353-359
- Behavior: System prompt forces AI to ask for property address immediately after user says "I'm thinking about selling"
- Problem: Requests PII before providing any value

**B. SelenaHandoff Forces 3 Sequential Questions**
- Location: `SelenaHandoff.tsx` Lines 32-63
- Questions: Timeline → Neighborhoods → Discussion Topics
- Problem: No skip option; feels like form-filling, not conversation

---

## 4. Authority Positioning Analysis

### How Kasandra is Currently Positioned

| Context | Positioning | Assessment |
|---------|-------------|------------|
| System Prompts | "Kasandra will personally reach out" | ✅ Solo Expert |
| Cognitive Stage 5-6 | "Kasandra is here to guide you personally" | ✅ Premium Access |
| Error Fallbacks | "You can book a free consultation anytime!" | ⚠️ Dilutes scarcity |
| Calculator Results | "schedule a free consultation with Kasandra" | ⚠️ Transactional |
| AuthorityCTABlock | "Strategy Session" (no "free") | ✅ High authority |

### Language Inconsistency Map

| Component | Language Used | Authority Level |
|-----------|---------------|-----------------|
| Guide CTAs | "Strategy Session", "Review" | High |
| Calculator Results | "Free Consultation" | Low |
| Fallback Messages | "Free consultation anytime!" | Low |
| Ad Funnels | "100% free" | Intentionally Low |

**Impact:** Split messaging creates cognitive dissonance between educational content (high authority) and conversion paths (transactional).

---

## 5. CTA Behavior Audit

### When "Schedule with Kasandra" Appears

| Trigger | Appropriate? | Notes |
|---------|--------------|-------|
| Every AI response | ❌ No | Hardcoded in edge function |
| After quiz completion | ✅ Yes | Earned through engagement |
| After calculator use | ✅ Yes | Tool completion = commitment |
| On guide completion | ✅ Yes | AuthorityCTABlock respects this |
| Cognitive Stage 5+ | ✅ Yes | Progression-based (but bypassed) |
| Error/Fallback | ⚠️ Acceptable | But poorly framed |

### CTA Overexposure Problem

**Current State:**
- User sends 5 messages → sees 5 booking CTAs
- No threshold required to reveal booking
- Contradicts Cognitive Stage model (which gates booking to Stages 5-6)

**Cognitive Stage Model (Correctly Designed):**
- Stage 5 (Deciding): intent declared + 4+ guides read
- Stage 6 (Confident): booking clicked
- Only these stages should show "Book a Consultation"

**But:** The edge function bypasses this by returning booking CTA unconditionally.

---

## 6. "Lovable Hub" Alignment Assessment

### Where Selena Aligns with Digital Concierge Philosophy

| Behavior | Implementation | Status |
|----------|----------------|--------|
| Guide-aware greetings | Detects `last_guide_id` and personalizes | ✅ |
| Intent-aware suggested replies | Filters by user intent | ✅ |
| Session continuity | LocalStorage persistence | ✅ |
| Progressive profiling | Only updates null DB fields | ✅ |
| Language governance | Single source of truth | ✅ |

### Where Selena Conflicts with Hub Intent

| Behavior | Problem |
|----------|---------|
| Omnipresent booking CTA | Feels like sales bot, not concierge |
| Immediate address demand | Qualifies before educating |
| Fallback to "free consultation" | Dilutes authority positioning |
| SelenaHandoff question sequence | Feels like form, not conversation |

---

## 7. Complete Misalignment Registry

### Critical Issues (Must Fix)

| Issue | Location | Severity |
|-------|----------|----------|
| Hardcoded Booking CTA | `selena-chat/index.ts:385-391` | 🔴 Critical |
| Premature Address Request | `selena-chat/index.ts:353-359` | 🟠 High |

### Moderate Issues (Should Fix)

| Issue | Location | Severity |
|-------|----------|----------|
| "Free consultation" Fallback | `SelenaChatContext.tsx:462-463` | 🟡 Medium |
| "Free" in CalculatorResults | `CalculatorResults.tsx:241-242` | 🟡 Medium |
| "Free" in CalculatorNextSteps | `CalculatorNextSteps.tsx:140` | 🟡 Medium |
| Forced Question Sequence | `SelenaHandoff.tsx:32-63` | 🟡 Medium |

### Full "Free Consultation" Occurrence List

| File | Line | Context |
|------|------|---------|
| `CalculatorNextSteps.tsx` | 140 | "Book a Free Consultation" |
| `CalculatorResults.tsx` | 241-242 | "schedule a free consultation" |
| `V2CashOfferOptions.tsx` | 235 | "Free Cash Offer Review" |
| `SelenaChatContext.tsx` | 462-463 | Error fallback |
| `V2GuideDetail.tsx` | 148, 205, 424 | Spanish guide content |
| `IntentHeader.tsx` | 69-70 | Booking page header |
| `SellerLanding.tsx` | 21, 44, 67 | Ad funnel (intentional) |

---

## 8. Diagnostic Recommendations

### Should Selena...

| Behavior | Recommendation | Rationale |
|----------|----------------|-----------|
| Slow down | ✅ Yes | Delay booking CTA until engagement threshold |
| Ask fewer questions | ✅ Yes | Make SelenaHandoff questions optional |
| Ask better questions | ✅ Yes | Prioritize value over data capture |
| Delay booking CTAs | ✅ Yes (Critical) | Remove hardcoded CTA; make conditional |
| Reframe booking language | ✅ Yes | Replace "Schedule" with "Review Strategy" |

### Specific Behavioral Fixes Required

1. **Make booking CTA conditional** in edge function
   - Only include if user meets engagement threshold
   - Respect Cognitive Stage model

2. **Defer address collection**
   - Move to after calculator use or guide completion
   - Provide value first, then request PII

3. **Eliminate "free consultation" language**
   - Replace with "Strategy Session" or "Review"
   - Maintain authority framing

4. **Add skip options to SelenaHandoff**
   - Make follow-up questions optional
   - Allow "I'll share this later" escape

5. **Unify CTA language**
   - Standard: "Review Strategy with Kasandra"
   - Never: "Free", "Anytime", "Book now"

---

## 9. Conclusion

**Selena's personality is correct. Her behavior is not.**

The system prompt establishes a calm, high-trust concierge voice, but the structural implementation creates a fundamentally different experience:

- Hardcoded CTAs bypass the earned-access model
- Premature qualification violates the education-first promise
- Transactional language ("free") undermines premium positioning

**The gap between design intent and implementation creates user friction that undermines the "earned commitment" philosophy.**

---

## Next Steps

This audit is diagnostic only. No code changes were made.

If approved, remediation would involve:
1. Refactoring edge function to make booking CTA conditional
2. Updating fallback messaging to maintain authority
3. Adding skip options to SelenaHandoff
4. Standardizing CTA language across all surfaces

