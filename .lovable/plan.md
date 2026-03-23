

# Route, CTA & Funnel Forensic Audit

---

## 1. Route Inventory (37 canonical + 4 redirects + 2 DEV-only)

### Core Marketing (8 routes)
| Route | Purpose | Funnel Stage | Nav-Reachable | Earns Its Place |
|-------|---------|-------------|---------------|-----------------|
| `/` | Homepage trust hub + intent fork | TOFU | Yes (primary) | Yes — 14-section narrative arc |
| `/buy` | Buyer orientation room | TOFU-MOFU | Yes (primary) | Yes — tools strip, quiz, neighborhood intel |
| `/sell` | Seller orientation room | TOFU-MOFU | Yes (primary) | Yes — dual-path comparison, tools strip |
| `/cash-offer-options` | Cash vs listing education + calculator | MOFU | Yes (primary) | Yes — calculator + education + Google reviews |
| `/about` | Kasandra authority + bio | TOFU | Yes (Explore) | Yes |
| `/contact` | Contact info + form | MOFU | Yes (Explore) | Yes |
| `/community` | Community involvement showcase | TOFU | Yes (Explore) | Marginal — mostly brand trust, low conversion |
| `/podcast` | YouTube podcast embed | TOFU | Yes (Explore) | Marginal — brand trust, low conversion |

### Decision Tools (12 routes)
| Route | Purpose | Nav-Reachable | Linked From | Earns Its Place |
|-------|---------|---------------|-------------|-----------------|
| `/buyer-readiness` | 5Q buyer quiz → score | No | /buy hero secondary, Selena chips | Yes |
| `/seller-readiness` | Seller readiness quiz → score | No | /sell hero secondary, Selena chips | Yes |
| `/cash-readiness` | Cash readiness quiz | No | /cash-offer-options bottom CTA | Yes |
| `/seller-decision` | 6-step seller wizard | No | Selena chips, ReadinessSnapshot | Yes — most sophisticated tool |
| `/seller-timeline` | Selling milestone builder | No | /sell tools strip | Yes |
| `/affordability-calculator` | DTI buying power calc | No | /buy tools strip | Yes |
| `/bah-calculator` | Military BAH → VA loan calc | No | /buy tools strip | Yes — niche differentiator |
| `/buyer-closing-costs` | Closing cost estimator | No | /buy tools strip | Yes |
| `/home-valuation` | CMA request intake | No | /sell tools strip, /net-to-seller CTA | Yes — lead capture |
| `/net-to-seller` | Net proceeds calculator | No | Selena chips | **REDUNDANT** — wraps same TucsonAlphaCalculator as /cash-offer-options |
| `/neighborhood-compare` | Side-by-side ZIP comparison | No | /buy tools strip | Yes |
| `/off-market` | Off-market buyer registration | No | Selena chips, guides | Yes — lead capture |

### Intelligence & Content (5 routes)
| Route | Purpose | Nav-Reachable | Earns Its Place |
|-------|---------|---------------|-----------------|
| `/market` | Market intelligence dashboard | Yes (Explore) | Yes |
| `/neighborhoods` | 15-neighborhood index | Yes (Explore) | Yes |
| `/neighborhoods/:slug` | Individual neighborhood detail | No (linked from index) | Yes |
| `/guides` | Guide library (38+ guides) | Yes (Explore) | Yes |
| `/guides/:guideId` | Individual guide detail | No (linked from library) | Yes |

### Conversion & Booking (5 routes)
| Route | Purpose | Nav-Reachable | Earns Its Place |
|-------|---------|---------------|-----------------|
| `/book` | GHL calendar iframe | Yes (nav CTA button) | Yes — single booking endpoint |
| `/book/confirmed` | Booking confirmation | No (redirect from GHL) | Yes |
| `/thank-you` | Post-submission thanks | No (redirect) | Yes |
| `/private-cash-review` | Phone-gated returning lead page | No (linked from CalculatorNextSteps) | Yes — BOFU conversion |
| `/selena-ai` | Selena AI showcase | Yes (Explore + footer) | Marginal — mostly brand; could merge into /about |

### Ad Funnels (3 routes — isolated via SellerFunnelLayout)
| Route | Purpose | Nav-Reachable | Earns Its Place |
|-------|---------|---------------|-----------------|
| `/ad/seller` | Paid traffic landing | No (ad traffic only) | Yes |
| `/ad/seller-quiz` | 4-step seller quiz | No (linked from ad/seller) | Yes |
| `/ad/seller-result` | Quiz result + lead capture | No (linked from quiz) | Yes — email gate + Selena handoff |

### Legal (2 routes)
| `/privacy`, `/terms` | Legal compliance | Footer links | Yes |

### DEV-only (2 routes — redirect to / in production)
| `/qa-cta`, `/qa-determinism` | Internal QA panels | No | Correct behavior |

### Redirects (4)
| `/v2/*` → strip prefix | `/cash-offer` → `/cash-offer-options` | `/podcast/episodes` → `/podcast` | `/v2` → `/` |

---

## 2. Route Redundancy Map

| Issue | Routes | Verdict |
|-------|--------|---------|
| **Duplicate calculator** | `/net-to-seller` and `/cash-offer-options` both render `TucsonAlphaCalculator` | `/net-to-seller` is a lighter wrapper with seller-focused framing. The calculator is identical. **Consider**: keep both but differentiate the framing — `/net-to-seller` should be "How much will I walk away with?" (no education), `/cash-offer-options` should be "Cash vs Traditional education + calculator." Currently the differentiation is weak. |
| **Selena showcase vs About** | `/selena-ai` and `/about` | `/selena-ai` is a standalone page that could be a section on `/about`. Low traffic expected. Keep for SEO but don't promote in nav. |
| **Community + Podcast** | `/community` and `/podcast` | Both are brand-trust pages with low conversion. Could merge into a single "Kasandra's World" page. Keep separate for now — each serves distinct SEO keywords. |

---

## 3. CTA Inventory

### Global CTAs (present on all pages via layout)
| CTA | Location | Target | Strength |
|-----|----------|--------|----------|
| "Book a Consultation" (gold button) | Nav bar (desktop + mobile) | `/book` | Elite — persistent, premium-styled |
| "Chat with Selena" (gold button) | Footer CTA strip | `openChat()` | Strong |
| "Book a Consultation" (outline button) | Footer CTA strip | `/book` | Good secondary |
| Selena floating bubble | Bottom-right corner | `openChat()` | Elite — always available |
| Sticky mobile book bar | Mobile only, after scroll | `/book?intent=X` | Strong — appears after engagement |
| "Powered by Selena AI" | Footer bottom | `/selena-ai` | Weak — brand attribution, not conversion |

### Homepage CTAs
| CTA Text | Section | Target | Quality |
|----------|---------|--------|---------|
| "I'm looking to buy" | Intent fork card | `/buy` + sets intent | Elite — calms, sorts |
| "I'm looking to sell" | Intent fork card | `/sell` + sets intent | Elite |
| "I want a cash offer" | Intent fork card | `/cash-offer-options` + sets intent | Elite |
| "Ask Selena →" | Selena banner | `openChat()` | Strong |
| "Book a Strategy Call" / "Talk to Selena" | Hero (GlassmorphismHero) | `/book` / `openChat()` | Strong — returning visitor gets contextual copy |
| "Learn More" (×3) | Services cards | `/buy`, `/sell`, `/cash-offer-options` | Generic — text is weak. Should be intent-specific: "Start buying" / "Explore selling" |
| "Talk to Selena Now" | Selena AI section | `openChat()` | Strong |
| "Explore Podcast" | Podcast section | `/podcast` | Acceptable |
| "Book a Consultation" / "Or talk to Selena first" | CTASection (bottom) | `/book` / `openChat()` | Strong dual-CTA |

### /buy CTAs
| CTA Text | Section | Target | Quality |
|----------|---------|--------|---------|
| "Talk to Selena" (hero primary) | Hero | `openChat({intent:'buy'})` | **Inconsistent** — homepage hero primary is "Book a Strategy Call" but /buy hero primary is "Talk to Selena". This is intentional (concierge-first for orientation rooms) but may confuse users who expect the gold button to book. |
| "Buyer Readiness Quiz" (hero secondary) | Hero | `/buyer-readiness` | Strong |
| "Estimate Closing Costs" | Sub-hero tools | `/buyer-closing-costs` | Strong |
| "Compare Neighborhoods" | Sub-hero tools | `/neighborhood-compare` | Strong |
| "Check Buying Power" | Sub-hero tools | `/affordability-calculator` | Strong |
| "BAH Calculator" | Sub-hero tools | `/bah-calculator` | Strong — niche |
| "Book a Strategy Call" | Bottom CTA | `/book?intent=buy` | Strong |
| "Not ready? Talk to Selena first" | Below bottom CTA | `openChat()` | Elite — calms pressure |

### /sell CTAs
| CTA Text | Section | Target | Quality |
|----------|---------|--------|---------|
| "Talk to Selena" (hero primary) | Hero | `openChat({intent:'sell'})` | Same inconsistency as /buy |
| "Seller Readiness Quiz" | Hero secondary | `/seller-readiness` | Strong |
| "Market Data" / "Selling Timeline" / "Cash vs. Listing" / "Home Valuation" | Tools strip | Various | Strong strip |
| "Ask Selena about listing" | Traditional comparison card | `openChat()` | **Weak** — underlink on the text trigger. Should be a proper button. |
| "See My Cash Options" | Cash comparison card | `/cash-offer-options` | Strong |
| "Get Kasandra's Recommendation" | Undecided callout | `openChat()` | Elite — perfect for undecided sellers |
| "Book a Strategy Call" | Bottom CTA | `/book?intent=sell` | Strong |

### /cash-offer-options CTAs
| CTA Text | Section | Target | Quality |
|----------|---------|--------|---------|
| "Run My Numbers" (hero primary) | Hero | Scroll to calculator | Strong |
| "Or ask Selena a question" | Hero secondary | `openChat({intent:'cash'})` | Good |
| "Start My Private Cash Review" | CalculatorNextSteps | `/private-cash-review` | Strong — primary post-calc CTA |
| "Ask Selena About My Situation" | CalculatorNextSteps | `openChat()` | Strong |
| "Review Strategy with Kasandra" | CalculatorNextSteps | `/book?intent=cash` | Strong |
| "Take the Cash Readiness Check" | Mid-page CTA | `/cash-readiness` | Strong |
| "Book a Strategy Call" | Bottom CTA | `/book?intent=sell` | Strong |
| "View Seller Services" | Back link | `/sell` | Good cross-link |

### Readiness Quiz Result CTAs (ReadinessSnapshot)
| Score Band | Intent | CTA | Target |
|------------|--------|-----|--------|
| ≥70 (Ready) | buy | "Book a Strategy Call" | `/book?intent=buy&source=readiness` |
| ≥70 (Ready) | sell | "Book Your Seller Strategy Session" | `/book?intent=sell&source=readiness` |
| ≥70 (Ready) | cash | "Book Your Cash Offer Review" | `/book?intent=cash&source=readiness` |
| 40-69 (Building) | sell + speed/simplicity | "Compare Your Options" | `/cash-offer-options` |
| 40-69 (Building) | sell + maximize_value | "Read the Selling Guide" | `/guides/selling-for-top-dollar` |
| <40 (Early) | sell | "Explore Your Paths" | `/seller-decision` |
| 40-69 (Building) | buy + neighborhoods | "Explore Neighborhoods" | `/community` ⚠️ |
| <70 | buy (default) | "Read the Buyer's Guide" | `/guides/first-time-buyer-guide` |
| All bands | fallback | "Browse all guides" | `/guides` |

### Ad Funnel CTAs
| CTA | Route | Target | Quality |
|-----|-------|--------|---------|
| "Get My Free Net Sheet" | `/ad/seller` | `/ad/seller-quiz` | Strong — clear value prop |
| "Chat with Selena AI" | `/ad/seller` | `openChat({intent:'sell'})` | Good fallback |
| Name/email gate | `/ad/seller-result` | Unlocks full results | Strong — email capture |
| "Talk to Selena About My Results" | `/ad/seller-result` (post-unlock) | `openChat({intent:'sell'})` | Strong handoff |

---

## 4. Funnel Map

```text
TOFU (Awareness)
  / ─── Intent Fork ─── /buy ── /sell ── /cash-offer-options
  |                      |        |              |
  ├─ /guides (38+)      |        |              |
  ├─ /neighborhoods      |        |              |
  ├─ /market             |        |              |
  ├─ /podcast            |        |              |
  └─ /community          |        |              |

MOFU (Evaluation)
  /buyer-readiness ──────┘        |              |
  /affordability-calculator       |              |
  /bah-calculator                 |              |
  /buyer-closing-costs            |              |
  /neighborhood-compare           |              |
                        /seller-readiness         |
                        /seller-decision          |
                        /seller-timeline          |
                        /home-valuation           |
                        /net-to-seller            |
                                         /cash-readiness
                                         /private-cash-review

BOFU (Decision)
  ALL PATHS ──→ /book ──→ /book/confirmed ──→ /thank-you
                  ↑
  /off-market ────┘ (buyer lead capture)

AD FUNNEL (Isolated)
  /ad/seller → /ad/seller-quiz → /ad/seller-result → Selena → /book
```

---

## 5. Dead-End Map

| Location | Issue | Impact |
|----------|-------|--------|
| `/community` | No CTA other than global nav/footer. Page ends with stat cards. | Low — brand page, not conversion page |
| `/podcast` | YouTube embed grid. Only CTA is "Subscribe" (external). No internal next-step. | Low — entertainment page |
| `/selena-ai` | Showcase page. CTA is "Try Selena Now" (opens chat). No booking pathway visible. | Low — informational |
| ReadinessSnapshot `buy + neighborhoods` priority | Routes to `/community` instead of `/neighborhoods` | **BUG** — `/community` is the community involvement page, not neighborhoods. Should be `/neighborhoods`. |

---

## 6. Missing CTA Opportunities

| Where | What's Missing | Impact |
|-------|---------------|--------|
| `/community` bottom | "Ready to work with someone who cares?" → `/book` | Low priority |
| `/podcast` bottom | "Have questions about what you heard?" → `openChat()` | Low priority |
| `/market` | No "Talk to Kasandra about these numbers" booking CTA | Medium — high-intent visitors checking market data |
| `/neighborhoods/:slug` | Missing "Ready to explore this area?" → `/book?intent=buy` CTA | Medium — visitors deep in neighborhood research are warm |
| Guide detail pages bottom | Some guides end without a clear next-action beyond "Ask Selena" | Medium — should have intent-specific tool CTA |
| `/home-valuation` confirmation | After submitting CMA request, no "While you wait, explore guides" | Low |

---

## 7. Highest-Leverage Funnel Fixes

| Priority | Fix | Impact | Effort |
|----------|-----|--------|--------|
| **1** | **Fix ReadinessSnapshot bug**: `buy + neighborhoods` routes to `/community` instead of `/neighborhoods` | Buyer funnel integrity | 5 min |
| **2** | **Differentiate `/net-to-seller` from `/cash-offer-options`**: The net-to-seller page should emphasize "What will I walk away with?" and suppress the education sections. Currently both render identical TucsonAlphaCalculator with different wrappers. Consider: `/net-to-seller` shows ONLY the calculator + "Get a CMA" CTA, while `/cash-offer-options` keeps the full education + warning + comparison sections. This already exists — the differentiation is just thin. | User clarity | 30 min |
| **3** | **Standardize hero CTA hierarchy**: Homepage hero primary = "Book a Strategy Call", but /buy and /sell hero primary = "Talk to Selena". This is an intentional concierge-first design, but the visual hierarchy (gold button = primary action) creates inconsistency. Consider: make all hero gold buttons = "Book" and demote Selena to secondary on all pages, or make all hero gold buttons = "Talk to Selena" and demote booking. Don't mix. | Conversion clarity | 30 min |
| **4** | **Upgrade "Learn More" CTAs on homepage services cards**: Replace generic "Learn More" with intent-specific: "Start Your Buying Plan" / "Explore Selling Options" / "Compare Cash Options" | Homepage conversion | 15 min |
| **5** | **Add booking CTA to `/market`**: Users checking market intelligence are high-intent. Add "Discuss these numbers with Kasandra" → `/book?intent=explore&source=market` at bottom. | Lead capture | 15 min |
| **6** | **Add neighborhood detail booking pivot**: At bottom of `/neighborhoods/:slug`, add "Ready to explore [neighborhood]?" → `/book?intent=buy&source=neighborhood_detail` | Lead capture | 15 min |
| **7** | **Strengthen "Ask Selena about listing" on /sell**: Currently a text-link trigger. Make it a proper secondary button with icon to match the visual weight of "See My Cash Options" on the adjacent card. | Sell funnel balance | 10 min |
| **8** | **Add `/market` link to /sell tools strip**: Market intelligence is already linked but would benefit from being in the tools strip. It already is — confirmed present. No action needed. | — | — |
| **9** | **Audit `/private-cash-review` gate**: Phone verification gate (`PhoneVerificationGate`) checks for existing `lead_id` in localStorage. If a user clears their browser data, they lose access. The gate state check is client-side only — no server validation. | Trust risk for returning leads | 1 hour |
| **10** | **Ad funnel → main site bridge**: After `/ad/seller-result` email capture and Selena handoff, users who explore the main site lose ad funnel context. The `bridgeQuizResultsToV2` function exists but only bridges localStorage — Selena's server-side session may not have the quiz results. | Attribution quality | 1 hour |

