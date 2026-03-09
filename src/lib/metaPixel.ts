import { logger } from "@/lib/logger";

/**
 * Meta Pixel utility — lazy init, PII-safe, debug/suppress modes.
 *
 * Env vars:
 *   VITE_META_PIXEL_ID     — Pixel ID (publishable, required to fire)
 *   VITE_PIXEL_DEBUG        — "true" → console.log all events (AND still fire)
 *   VITE_PIXEL_SUPPRESS     — "true" → console.log only, suppress fbq calls
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    fbq: (type: string, name: string, params?: Record<string, unknown>) => void;
    _fbq: unknown;
  }
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
const DEBUG = import.meta.env.VITE_PIXEL_DEBUG === "true";
const SUPPRESS = import.meta.env.VITE_PIXEL_SUPPRESS === "true";

let initialized = false;

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(label: string, ...args: unknown[]) {
  if (DEBUG || SUPPRESS) {
    logger.log(`[MetaPixel:${label}]`, ...args);
  }
}

function fbq(...args: unknown[]) {
  if (!SUPPRESS && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

// ── Safe param builder ───────────────────────────────────────────────────────

export function getPixelSafeParams(): Record<string, string> {
  const params: Record<string, string> = {};

  const sessionId = localStorage.getItem("selena_session_id");
  if (sessionId) params.session_id = sessionId;

  const leadId = localStorage.getItem("selena_lead_id");
  if (leadId) params.lead_id = leadId;

  const lang = localStorage.getItem("kasandra-language");
  if (lang) params.language = lang;

  params.page_path = window.location.pathname;

  return params;
}

/** Bucket a dollar difference into a safe band string */
export function getDifferenceBand(difference: number): string {
  if (difference < 10000) return "0-10k";
  if (difference < 25000) return "10-25k";
  if (difference < 50000) return "25-50k";
  return "50k+";
}

/** Bucket readiness score into a band */
export function getScoreBand(score: number): string {
  if (score < 40) return "0-39";
  if (score < 60) return "40-59";
  if (score < 80) return "60-79";
  return "80-100";
}

// ── Core API ─────────────────────────────────────────────────────────────────

/** Inject fbq script + init pixel. Safe to call multiple times. */
export function init() {
  if (initialized || !PIXEL_ID) return;

  const f = window as any;
  const b = document;

  // If fbq already exists (e.g. injected by GTM), just init the pixel ID
  if (typeof f.fbq === "function") {
    f.fbq("init", PIXEL_ID);
    initialized = true;
    log("init(existing)", PIXEL_ID);
    return;
  }

  // Otherwise inject the standard snippet + script tag
  const n: any = (f.fbq = function (...args: any[]) {
    n.callMethod ? n.callMethod.apply(n, args) : n.queue.push(args);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];

  const s = b.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  const firstScript = b.getElementsByTagName("script")[0];
  firstScript?.parentNode?.insertBefore(s, firstScript);

  f.fbq("init", PIXEL_ID);
  initialized = true;
  log("init", PIXEL_ID);
}

/** Fire standard PageView. */
export function pageView() {
  log("pageView", window.location.pathname);
  fbq("track", "PageView");
}

/** Fire a standard Meta event (ViewContent, Lead, etc.) */
export function track(
  eventName: string,
  params?: Record<string, any>,
) {
  const merged = { ...getPixelSafeParams(), ...params };
  log("track", eventName, merged);
  fbq("track", eventName, merged);
}

/** Fire a custom event (SellerQuizCompleted, etc.) */
export function trackCustom(
  eventName: string,
  params?: Record<string, any>,
) {
  const merged = { ...getPixelSafeParams(), ...params };
  log("trackCustom", eventName, merged);
  fbq("trackCustom", eventName, merged);
}
