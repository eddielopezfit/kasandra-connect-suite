import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  filterChipsForCompletedTools,
  CHIP_KEYS,
  CHIP_KEY_DESTINATION,
} from "./chipGovernance.ts";

Deno.test(
  "filterChipsForCompletedTools — sell + seller_readiness + tucson_alpha_calculator → fallback path surfaces /book",
  () => {
    // Candidate chips a sell-intent Phase 2 LLM might emit
    const candidates = [
      CHIP_KEYS.SELLER_READINESS,       // → /seller-readiness (BLOCKED by seller_readiness)
      CHIP_KEYS.ESTIMATE_PROCEEDS,      // → /cash-offer-options (BLOCKED by tucson_alpha_calculator)
      CHIP_KEYS.COMPARE_CASH_LISTING,   // → /cash-offer-options (BLOCKED by tucson_alpha_calculator)
      CHIP_KEYS.GET_SELLING_OPTIONS,    // → /seller-decision (allowed)
    ];

    const { filtered, suppressions } = filterChipsForCompletedTools(
      candidates,
      ["seller_readiness", "tucson_alpha_calculator"],
      "en",
      true, // hasEarnedBooking — required for /book replacement
    );

    // Suppressions recorded for blocked chips
    assert(suppressions.length >= 2, "expected at least 2 suppressions");

    // Must not re-suggest the completed readiness check or calculator chips
    assertEquals(filtered.includes(CHIP_KEYS.SELLER_READINESS), false);
    assertEquals(filtered.includes(CHIP_KEYS.ESTIMATE_PROCEEDS), false);
    assertEquals(filtered.includes(CHIP_KEYS.COMPARE_CASH_LISTING), false);

    // Replacement loop: seller_readiness primary (/cash-offer-options) is blocked,
    // so falls back to /book → TALK_WITH_KASANDRA. tucson_alpha_calculator primary
    // is /book — already added, so its fallback (/guides → BROWSE_GUIDES) is added.
    assert(
      filtered.includes(CHIP_KEYS.TALK_WITH_KASANDRA),
      `expected fallback TALK_WITH_KASANDRA in [${filtered.join(", ")}]`,
    );

    // No single-chip dead end and no duplicates
    assert(filtered.length >= 2, `expected ≥2 chips, got ${filtered.length}`);
    assertEquals(new Set(filtered).size, filtered.length, "duplicates emitted");
  },
);

Deno.test(
  "filterChipsForCompletedTools — buy + buyer_readiness completed → never returns BUYER_READINESS",
  () => {
    const candidates = [
      CHIP_KEYS.BUYER_READINESS,        // → /buyer-readiness (BLOCKED)
      CHIP_KEYS.AFFORDABILITY_CALCULATOR,
      CHIP_KEYS.BROWSE_GUIDES,
    ];

    const { filtered } = filterChipsForCompletedTools(
      candidates,
      ["buyer_readiness"],
      "en",
      false,
    );

    assertEquals(filtered.includes(CHIP_KEYS.BUYER_READINESS), false);
    assert(filtered.length >= 1);
    // BROWSE_GUIDES is the primary replacement for buyer_readiness — but it's
    // already in candidates so it's preserved (not re-added).
    assert(filtered.includes(CHIP_KEYS.BROWSE_GUIDES));
  },
);

Deno.test(
  "filterChipsForCompletedTools — fallback skipped when booking not earned, picks /listings instead",
  () => {
    // buyer_readiness completed; primary replacement /guides is in candidates already → fallback /listings
    const candidates = [
      CHIP_KEYS.BUYER_READINESS, // BLOCKED
      CHIP_KEYS.BROWSE_GUIDES,   // already present → primary replacement deduped
    ];

    const { filtered } = filterChipsForCompletedTools(
      candidates,
      ["buyer_readiness"],
      "en",
      false,
    );

    // Fallback for buyer_readiness is /listings → BROWSE_LISTINGS
    assert(
      filtered.includes(CHIP_KEYS.BROWSE_LISTINGS),
      `expected BROWSE_LISTINGS fallback in [${filtered.join(", ")}]`,
    );
    // Sanity: destination map wired
    assertEquals(CHIP_KEY_DESTINATION[CHIP_KEYS.BROWSE_LISTINGS], "/listings");
  },
);
