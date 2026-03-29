

# Typography Optimization — Responsive Font Size Pass

## Problem
291 instances of `text-sm` (14px) used for body copy. On mobile this is below WCAG readability guidelines (16px). On desktop/iPad it feels cramped for paragraph content.

## Strategy
Upgrade **body-level content** from `text-sm` to `text-sm md:text-base` (or `text-base` outright). Keep `text-sm` for metadata, badges, labels, and navigation items where compact sizing is appropriate.

## Rules for What Changes
| Content Type | Current | Target |
|---|---|---|
| Card body paragraphs | `text-sm` | `text-sm md:text-base` |
| Section description paragraphs | `text-sm` | `text-base` |
| Hero subtitles / intro text | `text-lg` | Keep as-is |
| Testimonial/quote text | `text-sm` | `text-sm md:text-base` |
| Selena banner prompt text | `text-sm` | `text-sm md:text-base` |
| Badges, labels, dates, categories | `text-sm` or `text-xs` | Keep as-is |
| Footer links, nav items | `text-sm` | Keep as-is |
| Form helper text | `text-sm` | Keep as-is |

## Files to Update (body copy upgrades only)

| # | File | Changes |
|---|---|---|
| 1 | `V2Home.tsx` | Intent card descriptions, Kasandra bio paragraph, services descriptions, Corner Connect features |
| 2 | `V2About.tsx` | Bio paragraphs, credential descriptions, personal stories |
| 3 | `V2Buy.tsx` | Feature descriptions, process step details |
| 4 | `V2Sell.tsx` | Feature descriptions, timeline details |
| 5 | `V2CashOfferOptions.tsx` | Feature descriptions, process details |
| 6 | `V2TucsonLiving.tsx` | Lifestyle highlight details, event descriptions, Kasandra's picks blurbs |
| 7 | `V2Contact.tsx` | Contact info descriptions |
| 8 | `V2Community.tsx` | Community impact descriptions |
| 9 | `V2Podcast.tsx` | Episode topic descriptions |
| 10 | `V2TrustedNetwork.tsx` | Partner endorsements, specialty descriptions |
| 11 | `V2Guides.tsx` | Guide card descriptions |
| 12 | `V2Neighborhoods.tsx` | Neighborhood card descriptions |
| 13 | `V2ThankYou.tsx` | Resource descriptions, Selena prompt |
| 14 | `V2SellerTimeline.tsx` | Timeline step descriptions |
| 15 | `V2OffMarketBuyer.tsx` | Feature descriptions |
| 16 | `V2Footer.tsx` | Keep `text-sm` — footer is metadata |
| 17 | `GlassmorphismHero.tsx` | Market pulse insight text |
| 18 | `CredentialsBentoGrid.tsx` | Credential descriptions |
| 19 | `TestimonialCard.tsx` | Quote text |
| 20 | `SelenaShowcase.tsx` | Feature descriptions |

## Approach
Pure find-and-replace within each file — change `text-sm text-cc-charcoal` (and variants like `text-sm text-cc-charcoal/70`, `text-sm text-white/80`) to `text-sm md:text-base text-cc-charcoal` on **paragraph elements only** (not badges, labels, or metadata spans).

No new components. No CSS changes. No structural changes. Just responsive typography scaling.

