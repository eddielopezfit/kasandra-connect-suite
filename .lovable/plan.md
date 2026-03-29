

# Fact-Check Corrections from Perplexity Deep Research

The research uncovered **9 factual inaccuracies** across the hub and Selena's system prompt. Here's what needs fixing.

---

## Corrections Required

### 1. Birthplace — About page is WRONG
- **V2About.tsx line 50**: Says "Born in Agua Prieta" 
- **Research says**: Born in **Tucson**, raised in **Douglas, AZ** (near Agua Prieta)
- **System prompt line 207**: Already correct ("born in Tucson, AZ and raised in Douglas, AZ")
- **Fix**: Change About hero to "Born in Tucson. Raised in Douglas, AZ. Resident for over 20 years."

### 2. Global Luxury title is WRONG everywhere
- Hub uses: "Certified Global Luxury Property Specialist" (not the real title)
- **Correct title**: **Coldwell Banker Luxury Property Specialist (LPS)**
- Earned at Coldwell Banker, NOT Corner Connect/Realty Executives
- Realty Executives has NO proprietary Global Luxury program
- **Fix**: Change to "Luxury Property Specialist" (drop "Certified Global" and "CB" since she's no longer at CB — the underlying CLHMS component is brokerage-agnostic)
- Affects: V2Home.tsx (2 places), V2About.tsx (2 places), CredentialsBentoGrid.tsx (1 place)

### 3. System prompt line 186 — RE does NOT provide "Global Luxury certification"
- Current: "Provides MLS access, transaction compliance, Global Luxury certification, and traditional listing infrastructure"
- **Fix**: Remove "Global Luxury certification" — add separate line clarifying it's a personal credential earned at Coldwell Banker
- Same fix needed in ES section (line 949)

### 4. Podcast name — System prompt still outdated (ES section)
- **EN line 216**: Still says "Lifting You Up with Kasandra Prieto"
- **ES line 979**: Still says "Lifting You Up with Kasandra Prieto"
- **Fix**: Both → "Lifting You Up: Todo empieza en casita"

### 5. Diaper Bank role title — partially wrong
- Hub says "Former Vice Chair" in some places
- **Research says**: VP of Governing Board + Chair of Ambassador Program (never "Vice Chair")
- **Fix**: Use "Former VP, Governing Board" consistently

### 6. Tony Robbins — overstated
- V2Community.tsx likely says she attended "seminars"
- **Research says**: References are to books/teachings only — no confirmed event attendance
- **Fix**: Change to "influenced by Tony Robbins, Jim Rohn, and Les Brown through their books and teachings"

### 7. Corner Connect context — add founding details
- Research confirms: Founded by Michael D. Rhodes (2009/2015), ~300+ homes/year team
- Not in system prompt — useful for Selena to know
- **Fix**: Add 1 line to KB-8

### 8. Realty Executives institutional facts — still missing from KB
- Founded 1965, first 100% commission concept, ~5,500+ agents globally
- **Fix**: Add to KB-8 EN + ES sections (~4 lines each)

### 9. Cinco Agave description — wrong in system prompt
- Line 210: Says "65+ social club she founded" (reads as 65+ members)
- **Research says**: It's a social club for people **age 65+**
- **Fix**: Clarify "Cinco Agave (social club for adults age 65+ that she founded)"

---

## Files to Change

| File | Changes |
|------|---------|
| `src/pages/v2/V2About.tsx` | Fix birthplace (line 50), fix Global Luxury title (lines 124, 177), fix Diaper Bank title (line 112) |
| `src/pages/v2/V2Home.tsx` | Fix Global Luxury title (lines 256, 338), fix Diaper Bank title (line 244) |
| `src/components/v2/CredentialsBentoGrid.tsx` | Fix Global Luxury title (line 19), fix Diaper Bank title |
| `src/pages/v2/V2Community.tsx` | Fix Tony Robbins framing, fix Diaper Bank title |
| `supabase/functions/selena-chat/systemPromptBuilder.ts` | Fix line 186 (remove Global Luxury from RE), fix line 210 (Cinco Agave), fix lines 216/979 (podcast name), add RE institutional facts to KB-8 EN+ES, add personal credential clarification EN+ES, fix Diaper Bank title |

Total: ~30 line changes across 5 files. No structural changes.

