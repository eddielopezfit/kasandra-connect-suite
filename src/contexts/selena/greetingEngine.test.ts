import { describe, it, expect, vi } from "vitest";

// Make trail/session selectors deterministic
vi.mock("@/lib/analytics/selenaSession", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/analytics/selenaSession")>();
  return {
    ...actual,
    updateSessionContext: () => {},
    getGuidesCompleted: () => [],
  };
});

import { computeGreeting } from "./greetingEngine";
import { findChipByKey } from "@/lib/registry/chipsRegistry";
import { CHIP_KEYS } from "@/lib/registry/chipKeys";
import type { SessionContext } from "@/lib/analytics/selenaSession";
import type { EntryContext } from "./types";

const t = (en: string, _es: string) => en;

const buyerReadinessLabelEn =
  findChipByKey(CHIP_KEYS.BUYER_READINESS)?.label_en ?? "";
const buyerReadinessShortLabelEn =
  findChipByKey(CHIP_KEYS.BUYER_READINESS_SHORT)?.label_en ?? "";

function buildSessionCtx(
  overrides: Partial<SessionContext>,
): SessionContext {
  return {
    intent: "buy",
    tools_completed: ["buyer_readiness"],
    readiness_score: 82,
    chip_phase_floor: 2,
    ...overrides,
  } as unknown as SessionContext;
}

describe("computeGreeting — buy intent + readiness_score=82", () => {
  it("buyer_readiness_capture entry surfaces '82/100' and never offers the buyer readiness chip", () => {
    const entryContext: EntryContext = {
      source: "buyer_readiness_capture",
      readinessData: {
        score: 82,
        primaryPriority: "down payment",
        toolType: "buyer",
      },
    };

    const result = computeGreeting(
      entryContext,
      buildSessionCtx({}),
      [],
      false,
      t,
      "en",
    );

    expect(result).not.toBeNull();
    expect(result!.greetingContent).toContain("82/100");

    const replyLabels = result!.suggestedReplies.map((r) =>
      typeof r === "string" ? r : r.label,
    );
    expect(buyerReadinessLabelEn.length).toBeGreaterThan(0);
    expect(replyLabels).not.toContain(buyerReadinessLabelEn);
    expect(replyLabels).not.toContain(buyerReadinessShortLabelEn);

    const retakeRegex = /readiness check|take.*readiness|take the readiness|buyer readiness/i;
    expect(replyLabels.some((l) => retakeRegex.test(l))).toBe(false);
  });

  it("returning user with readiness_score=82 (no entryContext.readinessData) — if a greeting is produced, it surfaces '82/100' and skips the readiness chip", () => {
    const returningResult = computeGreeting(
      undefined,
      buildSessionCtx({}),
      [],
      true, // storedHistoryExists → returning-user path
      t,
      "en",
    );

    if (returningResult) {
      expect(returningResult.greetingContent).toContain("82/100");
      const labels = returningResult.suggestedReplies.map((r) =>
        typeof r === "string" ? r : r.label,
      );
      expect(labels).not.toContain(buyerReadinessLabelEn);
      expect(labels).not.toContain(buyerReadinessShortLabelEn);
    }
  });
});

const sellerReadinessLabelEn =
  findChipByKey(CHIP_KEYS.SELLER_READINESS)?.label_en ?? "";

describe("computeGreeting — sell intent + seller_readiness_capture + score=42", () => {
  it("surfaces '42/100' in the greeting and never offers the seller readiness chip", () => {
    const entryContext: EntryContext = {
      source: "seller_readiness_capture",
      readinessData: {
        score: 42,
        primaryPriority: "timing",
        toolType: "seller",
      },
    };

    const sellerCtx = {
      intent: "sell",
      tools_completed: ["seller_readiness"],
      readiness_score: 42,
      chip_phase_floor: 2,
    } as unknown as SessionContext;

    const result = computeGreeting(
      entryContext,
      sellerCtx,
      [],
      false,
      t,
      "en",
    );

    expect(result).not.toBeNull();
    expect(result!.greetingContent).toContain("42/100");

    const replyLabels = result!.suggestedReplies.map((r) =>
      typeof r === "string" ? r : r.label,
    );
    // Sanity: registry resolved the canonical label
    expect(sellerReadinessLabelEn.length).toBeGreaterThan(0);
    // Must not re-suggest the readiness check the user just completed
    expect(replyLabels).not.toContain(sellerReadinessLabelEn);

    const retakeRegex = /seller readiness|take.*readiness|readiness check/i;
    expect(replyLabels.some((l) => retakeRegex.test(l))).toBe(false);
  });
});

const buyerReadinessLabelEs =
  findChipByKey(CHIP_KEYS.BUYER_READINESS)?.label_es ?? "";
const buyerReadinessShortLabelEs =
  findChipByKey(CHIP_KEYS.BUYER_READINESS_SHORT)?.label_es ?? "";

describe("computeGreeting (ES) — buy intent + buyer_readiness_capture + score=82", () => {
  it("surfaces '82/100' in the Spanish greeting and never offers the buyer readiness chip", () => {
    const tEs = (_en: string, es: string) => es;

    const entryContext: EntryContext = {
      source: "buyer_readiness_capture",
      readinessData: {
        score: 82,
        primaryPriority: "pago inicial",
        toolType: "buyer",
      },
    };

    const result = computeGreeting(
      entryContext,
      buildSessionCtx({}),
      [],
      false,
      tEs,
      "es",
    );

    expect(result).not.toBeNull();
    // Real ES copy: "Tu puntuación de Preparación del Comprador es 82/100 — ..."
    expect(result!.greetingContent).toContain("82/100");
    expect(result!.greetingContent).toContain("Preparación del Comprador");
    expect(result!.greetingContent).toMatch(/puntuación.*82\/100/);
    // Spanish, not the EN fallback
    expect(result!.greetingContent).not.toContain("Your Buyer Readiness score");

    const replyLabels = result!.suggestedReplies.map((r) =>
      typeof r === "string" ? r : r.label,
    );
    expect(buyerReadinessLabelEs.length).toBeGreaterThan(0);
    expect(replyLabels).not.toContain(buyerReadinessLabelEs);
    expect(replyLabels).not.toContain(buyerReadinessShortLabelEs);
    expect(replyLabels).not.toContain(buyerReadinessLabelEn);

    const retakeRegexEs = /preparación del comprador|evaluación de preparación|hacer.*evaluación/i;
    expect(replyLabels.some((l) => retakeRegexEs.test(l))).toBe(false);
  });
});
