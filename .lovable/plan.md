
The user wants a full audit + fix pass: every chip/subchip functional, no dead code, every tool/quiz terminates in a CTA, all wiring correct. This is a system-wide QA + remediation task across chips registry, ActionSpec resolution, tool result CTAs, quiz completion handlers, and orphaned components.

Scope I'll cover:

**1. Chip & ActionSpec wiring audit**
- Walk `chipsRegistry.ts` + `chipKeys.ts` + `guideChipMap.ts` and verify every chip resolves to a valid ActionSpec via `isActionValid()`.
- Cross-check `chipGovernance.ts` (client) and `selena-chat/chipGovernance.ts` (edge) emit only registered chip keys.
- Validate every `destinationsRegistry` key matches an actual route in `App.tsx`.
- Fix any chip that produces a dead-end (no openChat callback, no navigate target, missing guideId).

**2. Tool → CTA terminus audit**
- BuyerReadinessCheck, SellerReadinessCheck, CashReadinessCheck, OffMarketBuyer, TucsonAlphaCalculator, AffordabilityCalculator, BAHCalculator, NetToSeller, HomeValuation, BuyerClosingCosts, SellerTimeline, NeighborhoodQuiz, SellerDecision quiz.
- Each must end on either: (a) `LeadCaptureModal` → `/book` or `/thank-you`, (b) `ToolResultNextStep` with a primary gold CTA, or (c) `NextBestActionCard`.
- Confirm `useEscalationTrigger` and `useRecommendationEngine` fire post-completion.

**3. Quiz funnels**
- `/ad/seller` quiz → result → `/book` handoff.
- `NeighborhoodQuiz` → `QuizResults` → CTA to `/book` or `/neighborhoods/:slug`.
- `SellerDecision` 6-step → `StepReceiptView` → primary CTA.

**4. Dead-code sweep (confirmed orphans + new finds)**
- Delete: `useConsultationForm.ts`, `ConsultationFormFields.tsx` (per CLAUDE.md confirmed orphans).
- Scan for unreferenced exports in `components/v2/`, `lib/`, `hooks/`. Candidates from memory: any component not in an index/import graph.
- Remove unused chip keys, dead route paths in `destinationsRegistry`, orphaned ActionSpec types.

**5. Wiring fixes**
- Verify `LeadCaptureModal` triggers fire after every high-intent tool (per `lead-capture-triggers` mem).
- Verify NBA/predictive engine routes match `readiness-score-routing` mem.
- Confirm `notify-handoff` POSTs after every terminal CTA (book, lead capture, quiz completion).

**6. Validation**
- Run `bun run build` + tsc to catch dead imports.
- Add a dev-only `chipWiringValidator` that boots once and console-warns on any registered chip whose ActionSpec fails `isActionValid()`.
- Add same validator for tool result CTAs.

**Deliverables:**
- Audit report saved to `/mnt/documents/wiring-audit-report.md` listing every chip, every tool terminus, every dead file removed.
- Code fixes for each broken link found.
- New `src/lib/qa/wiringValidator.ts` that runs in DEV and logs gaps.

**Out of scope:** GHL/Comet SOP work (already delivered), redesigns, new features.

Estimated touch surface: ~15-25 files edited, 2-5 deleted, 2 created. One migration not needed.

Approve and I'll execute.
