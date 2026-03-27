

# Selena KB & System Prompt Optimization — Title Correction, Legal Compliance, Platform Awareness

## Critical Corrections Found

### 1. TITLE ERROR — "Associate Broker" → "REALTOR®" / "Real Estate Agent"
Kasandra is a **real estate agent (REALTOR®)**, NOT an Associate Broker. This incorrect title appears in:

**System Prompt (3 locations):**
- `systemPromptBuilder.ts` line 549: EN — "Kasandra Prieto is an Associate Broker operating within..."
- `systemPromptBuilder.ts` line 1248: ES — "Kasandra Prieto es Associate Broker operando dentro de..."
- Both need → "Kasandra Prieto is a licensed REALTOR® and real estate agent operating within..."

**Frontend (4 locations):**
- `KasandraPresenceCard.tsx` lines 44, 77, 110 — all three variants show "Associate Broker"
- `V2PrivateCashReview.tsx` lines 182-183 — "Associate Broker | Tucson"

### 2. FAIR HOUSING & ARIZONA LAW COMPLIANCE
The footer already has an Equal Housing Opportunity badge (line 56-61 of V2Footer.tsx). However, the system prompt has **zero explicit Fair Housing Act compliance rules**. Arizona ADRE and federal HUD require:

**Missing from KB — must add:**
- Fair Housing Act compliance block (no discrimination based on race, color, religion, sex, handicap, familial status, national origin)
- Arizona-specific: ARS §41-1491 (state-level fair housing)
- ADRE R4-28-301 through R4-28-1101 compliance awareness
- Selena must never steer, redline, or make statements about neighborhood demographics, crime, school quality rankings, or property value predictions based on protected classes

**Where to add:** New KB-13 block in both EN and ES prompts, subordinate to KB-0.

### 3. SELENA'S PLATFORM KNOWLEDGE GAPS
The system prompt references Corner Connect and basic tools, but does NOT explicitly teach Selena about the **full hub inventory**. Adding a concise platform awareness block:

**Hub Tools Selena should reference via chips (not describe in text):**
- Affordability Calculator (`/affordability-calculator`)
- BAH Calculator (`/bah-calculator`) — military buyers
- Seller Net Calculator (`/net-to-seller`)
- Buyer Closing Costs Estimator (`/buyer-closing-costs`)
- Buyer Readiness Check (`/buyer-readiness`)
- Seller Readiness Check (`/seller-readiness`)
- Cash Readiness Check (`/cash-readiness`)
- Seller Decision Guide (`/seller-decision`) — 6-step wizard
- Home Valuation Request (`/home-valuation`)
- Off-Market Buyer Registry (`/off-market`)
- Neighborhood Explorer (`/neighborhoods`) — 15 areas
- Neighborhood Quiz (`/neighborhoods` quiz tab)
- Neighborhood Compare (`/neighborhood-compare`)

**Guides Hub:** 30+ bilingual guides across 10 categories (buying, selling, valuation, cash, stories, probate, divorce, distressed, military, senior)

**Neighborhoods:** 15 registered areas (Central Tucson, Catalina Foothills, Oro Valley, Marana, Sahuarita, Vail, Green Valley, Rita Ranch, Sam Hughes, Civano, Rincon/Pantano, Corona de Tucson, Picture Rocks, Tanque Verde, Flowing Wells)

### 4. KASANDRA BIO ENRICHMENT
Current bio is good but missing some verified facts. Adding to Community Context:
- Construction course: 6-month course building 15 tiny homes (verified in project knowledge)
- Greater Tucson Leadership: Class of 2026
- International Diamond Society recognition (2024)
- 126+ five-star reviews (verified in project knowledge)
- Life insurance background → "listen first, educate always" protection-based approach

---

## Implementation Plan

### Step 1: Fix title in systemPromptBuilder.ts (EN + ES)
- Line 549: "Associate Broker" → "licensed REALTOR® and real estate agent"
- Line 1248: Same fix in Spanish — "agente de bienes raíces licenciada y REALTOR®"

### Step 2: Add KB-13 — Fair Housing & Arizona Law Compliance (EN + ES)
Insert after KB-12 in both prompts. Content:

```
KB-13 — FAIR HOUSING & ARIZONA LAW COMPLIANCE (Non-Negotiable · Subordinate to KB-0)

FEDERAL FAIR HOUSING ACT:
Selena must never make statements that discriminate or steer based on: race, color, religion, sex, handicap/disability, familial status, or national origin.

ARIZONA STATE LAW (ARS §41-1491):
Arizona extends protections to all federally protected classes. Additionally, ADRE-licensed agents must comply with R4-28-502 (brokerage disclosure) and R4-28-801 (advertising standards).

PROHIBITED BEHAVIORS:
- Never describe neighborhoods in terms of racial, ethnic, or religious composition
- Never rank neighborhoods by "safety" or "crime" (steering risk)
- Never suggest a neighborhood is "better for families" vs singles (familial status steering)
- Never imply property values are affected by the demographics of an area
- Never use language that could be interpreted as blockbusting, steering, or redlining
- Never recommend against or toward a neighborhood based on school district demographics

REQUIRED BEHAVIOR:
- When asked about neighborhood safety, schools, or demographics: defer to Kasandra and provide only general geographic/lifestyle context
- Include Equal Housing Opportunity awareness in Selena's identity

EQUAL HOUSING OPPORTUNITY STATEMENT:
Kasandra Prieto and Corner Connect are committed to Equal Housing Opportunity. All real estate services are provided without regard to race, color, religion, sex, handicap, familial status, or national origin.
```

### Step 3: Add Platform Awareness block to system prompt
Insert concise hub inventory list into KB-8 (both EN + ES) so Selena knows what tools/guides/neighborhoods exist and can route via chips.

### Step 4: Enrich Kasandra's Community Context
Add verified bio facts (construction course, GTL Class 2026, Diamond Society 2024, 126+ reviews, life insurance background) to lines 207-214 (EN) and 916-923 (ES).

### Step 5: Fix frontend "Associate Broker" references
- `KasandraPresenceCard.tsx` — change all 3 instances to "REALTOR®"
- `V2PrivateCashReview.tsx` — change to "REALTOR® | Tucson"

### Files Modified
- `supabase/functions/selena-chat/systemPromptBuilder.ts` — title fix, KB-13, platform awareness, bio enrichment (EN + ES)
- `src/components/v2/KasandraPresenceCard.tsx` — title fix (3 instances)
- `src/pages/v2/V2PrivateCashReview.tsx` — title fix (1 instance)

### NOT Changed (Already Correct)
- V2Footer.tsx — already shows "REALTOR®" and Equal Housing badge
- V2About.tsx — already shows "REALTOR®" in document head
- GuideComplianceFooter.tsx — already shows "REALTOR®"
- Guide data files — already use "REALTOR®"

**Estimated scope**: 2 implementation messages. First message handles systemPromptBuilder.ts (largest file). Second handles the 2 frontend files.

