

# Brand Voice Copy Optimization — All Pages

## Kasandra's Voice Rules
- First person ("I walk through..." not "Kasandra reviews...")
- Warm, direct, personal — like a best friend who happens to be an expert
- No generic CTA language ("Learn More", "Get Started", "Ready to...")
- Insight-driven labels, not button-speak
- Emotional reassurance at decision points
- Spanish uses informal "tu" (best friend register)

---

## Pages & Copy Changes

### 1. Homepage (`V2Home.tsx`)

**Services Section — 3x "Learn More" links (lines 518, 537, 556)**
- "Learn More" / "Mas Informacion" is prohibited per Advisory Copy Standards
- Change to: "See how I help buyers" / "See how I protect sellers" / "Understand your options"

**About Section heading (line 280)**
- "Your Trusted Tucson REALTOR®" → "Your Best Friend in Real Estate"
- (Matches the About page H1 and brand identity)

**About Section bio (line 284)**
- "I serve my community not just as a licensed REALTOR®, but as a leader, advocate, and trusted voice" → "I didn't get into real estate to sell houses — I got in to help families make one of the biggest decisions of their lives with someone they actually trust."

**Community section (line 749)**
- "Real estate is about more than transactions—it's about building stronger communities" → "This work has never been just about houses for me. It's about the families inside them and the neighborhoods that hold them together."
- "Learn More" → "See how I give back"

**Corner Connect CTA (line 646)**
- "Ask About Off-Market Properties" → "See what's available off-market"

### 2. Sell Page (`V2Sell.tsx`)

**Hero headline (line 81)**
- "Tucson Home Selling: Know Your Worth. Sell on Your Terms." → "Selling Your Home? I'll Make Sure You Know Exactly Where You Stand."

**Hero subtext (line 83)**
- "Kasandra helps Tucson sellers..." (third person) → "I help Tucson sellers price right, time the market, and close with confidence — plus you get a 24/7 AI concierge that works while you sleep."

**"How I Protect Your Interests" subtext (line 196)**
- "My approach is centered on your protection and informed decision-making at every stage." → "I come from life insurance — protection is in my DNA. Every decision we make together starts with what's best for you."

**Cash Offer section (line 146)**
- "Need to Sell Fast? Get a Cash Offer." → "Need to sell fast? Let me show you what a real cash offer looks like."

**Cash Offer CTA (line 177)**
- "Request a Cash Offer" → "See your cash offer options" (semantic honesty — the page educates, doesn't deliver an offer)

**Bottom CTA (line 519)**
- "Ready to Sell?" → "Let's figure out your best move."
- "Let's discuss your home and create a selling strategy..." → "I sit down with every seller and walk through both paths — cash and traditional. You decide with the full picture."

**"Not ready?" link (line 545)**
- "Not ready? Talk to Selena first" → "Still thinking it over? Selena can help you sort it out"

**Back-link (line 324 in CashOffer)**
- "Prefer a traditional sale? Learn more about how I work with sellers." → "Thinking a traditional sale might be the move? Let me show you how I help sellers get there."

### 3. Buy Page (`V2Buy.tsx`)

**Hero headline (line 89)**
- "Buy a Home in Tucson with Confidence." → "Buying a Home in Tucson? I'll Walk You Through Every Step."

**Hero subtext (line 91)**
- "Kasandra guides buyers through every step..." (third person) → "I guide buyers through every step — from first search to closed door — with honesty, local expertise, and an AI concierge built just for you."

**"Why Work With Me?" benefits (lines 197-239)**
- "Communicate comfortably in English or Spanish throughout your entire journey." → "I speak your language — literally. English or Spanish, you'll always feel at home."
- "I'll help you understand your options, including down payment assistance programs." → "Down payment programs, closing cost grants, VA benefits — I'll make sure you know every dollar available to you."
- "Over two decades in Tucson means I know this community inside and out." → "20+ years in Tucson. I don't just know the neighborhoods — I know which streets flood, which schools are rising, and where the best tamales are."
- "Selena AI is available around the clock to answer questions and schedule appointments." → "Can't sleep because you're thinking about your offer? Selena's up too. She'll answer your questions at 2 AM so you wake up clear-headed."

**Bottom CTA (line 267)**
- "Ready to Get Started?" → "Let's find your place in Tucson."
- "Let's discuss your home buying goals and create a plan that works for you." → "I'll sit down with you, understand what you're really looking for, and build a game plan that fits your life — not just your budget."
- "Not ready? Talk to Selena first" → "Still exploring? Let Selena help you get your bearings"

### 4. Cash Offer Options (`V2CashOfferOptions.tsx`)

**Terminal CTA (line 283)**
- "Want Expert Guidance on Your Options?" → "Getting clearer on your home's value?"
- "Kasandra reviews both cash and traditional paths with every seller — you decide with full information." → "I walk through both paths with every seller I work with — no pressure, just the full picture so you can decide what actually fits your life."

**Back-link (line 324)**
- "Prefer a traditional sale? Learn more about how I work with sellers." → "Thinking a traditional sale might be the move? Let me show you how I help sellers get there."
- "View Seller Services" → "See how I help sellers"

### 5. Contact Page (`V2Contact.tsx`)

**Hero subtext (line 152)**
- "Ready when you are — no pressure, no obligation." → "I'm here when you're ready. No pitch, no pressure — just a real conversation."

### 6. Global CTA Section (`CTASection.tsx`)

**"Or let Selena guide you through this" (line 172)**
- Keep as-is — already good voice.

**Early-stage sell copy (line 95)**
- "Get a personalized market analysis from Kasandra — not an algorithm, a real strategy session." → "Not an algorithm — a real conversation about your home, your timeline, and your options."

---

## Files Modified
- `src/pages/v2/V2Home.tsx` — ~12 copy strings
- `src/pages/v2/V2Sell.tsx` — ~8 copy strings
- `src/pages/v2/V2Buy.tsx` — ~10 copy strings
- `src/pages/v2/V2CashOfferOptions.tsx` — ~4 copy strings
- `src/pages/v2/V2Contact.tsx` — ~1 copy string
- `src/components/v2/CTASection.tsx` — ~1 copy string

All changes are copy-only (EN + ES pairs). No structural or logic changes.

**Estimated scope**: 2-3 implementation messages (grouped by page).

