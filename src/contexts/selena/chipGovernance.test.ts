import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock guides-completed (FIX 3/4) so tests are deterministic regardless of localStorage
vi.mock("@/lib/analytics/selenaSession", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics/selenaSession")>();
  return {
    ...actual,
    getGuidesCompleted: () => [],
  };
});

import { getPhaseAwareChips } from "./chipGovernance";
import { CHIP_KEYS } from "@/lib/registry/chipKeys";
import { findChipByKey } from "@/lib/registry/chipsRegistry";
import type { SessionContext } from "@/lib/analytics/selenaSession";

const t = (en: string, _es: string) => en;

function labelOf(key: string): string {
  return findChipByKey(key)?.label_en ?? "";
}

function buildCtx(overrides: Partial<SessionContext> & { _lang?: "en" | "es" }): SessionContext {
  return {
    chip_phase_floor: 2,
    tools_completed: [],
    ...overrides,
  } as unknown as SessionContext;
}

describe("getPhaseAwareChips — tools_completed suppression", () => {
  beforeEach(() => {
    // localStorage is jsdom-backed; ensure clean slate
    if (typeof localStorage !== "undefined") localStorage.clear();
  });

  it("buy intent + buyer_readiness completed → never returns BUYER_READINESS chip", () => {
    const ctx = buildCtx({
      intent: "buy",
      chip_phase_floor: 2,
      tools_completed: ["buyer_readiness"],
      _lang: "en",
    });

    const chips = getPhaseAwareChips(t, ctx);
    const labels = chips.map((c) => c.label);

    const buyerReadinessLabel = labelOf(CHIP_KEYS.BUYER_READINESS);
    expect(buyerReadinessLabel.length).toBeGreaterThan(0);
    expect(labels).not.toContain(buyerReadinessLabel);

    // Should still surface forward momentum (BROWSE_LISTINGS is the candidate that survives,
    // and CLIENT_TOOL_REPLACEMENT[buyer_readiness] = BROWSE_GUIDES is added)
    expect(chips.length).toBeGreaterThanOrEqual(1);
  });

  it("sell intent + seller_readiness + tucson_alpha_calculator completed → 2 distinct chips via fallback", () => {
    const ctx = buildCtx({
      intent: "sell",
      chip_phase_floor: 2,
      tools_completed: ["seller_readiness", "tucson_alpha_calculator"],
      _lang: "en",
    });

    const chips = getPhaseAwareChips(t, ctx);
    const labels = chips.map((c) => c.label);

    // Must not re-suggest the completed readiness check
    expect(labels).not.toContain(labelOf(CHIP_KEYS.SELLER_READINESS));

    // Must not re-suggest the completed calculator chips
    expect(labels).not.toContain(labelOf(CHIP_KEYS.ESTIMATE_PROCEEDS));
    expect(labels).not.toContain(labelOf(CHIP_KEYS.COMPARE_CASH_LISTING));

    // Two distinct chips (no single-chip dead end, no duplicates)
    expect(chips.length).toBeGreaterThanOrEqual(2);
    expect(new Set(labels).size).toBe(labels.length);

    // Fallback path: TALK_WITH_KASANDRA must be surfaced (replacement fallback for tucson_alpha_calculator
    // since primary ESTIMATE_PROCEEDS is blocked)
    expect(labels).toContain(labelOf(CHIP_KEYS.TALK_WITH_KASANDRA));
  });
});
