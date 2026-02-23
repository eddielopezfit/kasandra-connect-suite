

# Verified Biography Integration — Multi-Layer KB Update

## What You Provided (Now Verified Facts)

These are no longer "unverifiable biographical claims" — they are sourced and confirmed:

1. **Born in Tucson, AZ; raised in Douglas, AZ** (border town near Agua Prieta, Sonora, Mexico)
2. **Raised by a single, hardworking Hispanic mother**
3. **Returned to Tucson at 18; rooted there 20+ years**
4. **Joined Corner Connect in January 2026**, led by Michael Gebhart
5. **Corner Connect brokered by Realty Executives Arizona Territory**
6. **Previously at Coldwell Banker Realty (~3 years)** — this is history, not current affiliation
7. **Radio show: "Lifting You Up" on Urbana 92.5 FM**
8. **Tucson Appliance Hispanic Spokeswoman**
9. **Rumbo al Exito** (60+ members, 700+ referrals/year)
10. **Arizona Diaper Bank** (board position)
11. **Cinco Agave** (65+ member social club she founded)
12. **Corner Connect differentiators**: commission-free cash offers, multilingual, hybrid buyer/seller model, Paul Volpe lender partnership

## What Changes (4 Targeted Updates)

All changes in one file: `supabase/functions/selena-chat/index.ts`

---

### Update 1: Community Context Block (EN, ~line 798-801)

**Current** (too thin):
```
COMMUNITY CONTEXT:
- Kasandra is deeply rooted in Tucson ("Somos de aqui") — not an outside or speculative practitioner.
- Active in local philanthropy: Arizona Diaper Bank, Rumbo al Exito.
- Brand identity: "Your Best Friend in Real Estate."
```

**Updated** (enriched with verified facts):
```
COMMUNITY CONTEXT (verified):
- Kasandra was born in Tucson, AZ and raised in Douglas, AZ — a border town near Agua Prieta, Sonora. She returned to Tucson at 18 and has been rooted here for over 20 years. "Somos de aqui" is literal, not aspirational.
- Raised by a single, hardworking Hispanic mother. This background grounds her relational approach to clients.
- Active community leadership: Arizona Diaper Bank (board), Rumbo al Exito (60+ member Hispanic business network), Cinco Agave (65+ member social club she founded).
- Tucson Appliance Hispanic Spokeswoman.
- Bilingual media presence: "Lifting You Up" radio show on Urbana 92.5 FM.
- Brand identity: "Your Best Friend in Real Estate."
```

### Update 2: Community Context Block (ES, ~line 1229-1232)

Same enrichment in natural Spanish with "tu" register.

### Update 3: KB-7 Micro-Guard B Update (EN, ~line 838)

**Current**:
```
- Do not claim: "she grew up in Tucson," "multi-generational roots," or similar unless verified in approved KB sources.
```

**Updated** (these facts are now verified):
```
- Verified biographical facts (approved for use): Born in Tucson, raised in Douglas AZ, returned at 18, 20+ years in Tucson, raised by a single Hispanic mother. These may be referenced naturally when relevant.
- Still prohibited: "multi-generational roots," invented timelines, or any biographical detail not listed in Community Context.
```

### Update 4: KB-7 Micro-Guard B Update (ES, ~line 1269)

Same update in Spanish.

---

### What Does NOT Change

- KB-0, Doctrine, KB-1 through KB-6: untouched
- Brokerage Truth Source: already correct (Corner Connect / Realty Executives AZ Territory)
- Guard State, mode detection, entry greetings, frontend: untouched
- KB-7 voice rules, brand pillars, anti-drift, platform divergence: untouched
- The Coldwell Banker reference stays blocked by Brokerage Truth Source (it is acknowledged as history but never surfaced to users)

### Corner Connect Differentiators — Handling Decision

The blue ocean analysis and Corner Connect team details (cash offers, Paul Volpe partnership, volume stats) are valuable context but belong in a **future KB-8 (Practice & Team Context)**, not in KB-7 (voice) or Community Context (personal roots). For now, these facts are noted but not injected — they require their own scoping to avoid turning Selena into a Corner Connect marketing channel.

---

## Post-Change Verification

Re-run acceptance tests 1-2 with updated expectations:

1. **EN trust**: "Why should I trust her?" -- Selena can now reference Tucson roots, Douglas upbringing, 20+ years, community leadership. Still no superlatives or sales pitch.
2. **ES trust**: Same in Spanish with verified biographical details in "tu" register.
3. **Biographical accuracy**: Ask "Where is Kasandra from?" -- should answer "born in Tucson, raised in Douglas" (verified), not "grew up in Tucson" (imprecise).
4. **Community depth**: Ask "Is she involved in the community?" -- should reference Arizona Diaper Bank, Rumbo al Exito, Cinco Agave, radio show by name.
5. **Boundary hold**: Ask "How many transactions has her team done?" -- should defer (Corner Connect volume stats not yet in approved KB).
