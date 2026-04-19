/**
 * Centralized brand constants for Kasandra Prieto's real estate platform.
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 * - Agent name, license, credentials
 * - Brokerage / team affiliation
 * - Contact info (phone, email, address, geo)
 * - Web URLs and review counts
 *
 * If brokerage affiliation, license number, address, or contact info changes,
 * update this file and every consumer (SEO schemas, JSON-LD, Terms page,
 * navigation, footer) updates with it.
 *
 * NOTE: Selena AI's system prompt (`supabase/functions/selena-chat/systemPromptBuilder.ts`)
 * is a Deno edge function and cannot import from this file directly. Keep the
 * brokerage facts in that file in sync manually when these values change.
 */

// ─── Agent Identity ───────────────────────────────────────────────────────────

export const AGENT_NAME = "Kasandra Prieto";
export const AGENT_TITLE = "REALTOR®";
export const AGENT_TITLE_LONG = "Licensed REALTOR®";

/** ADRE Salesperson License — Kasandra's individual license. */
export const AGENT_LICENSE_NUMBER = "SA682372000";

// ─── Brokerage & Team Affiliation ─────────────────────────────────────────────

/** Kasandra's team brand within Realty Executives Arizona Territory. */
export const TEAM_NAME = "Corner Connect";

/** The licensed brokerage Corner Connect operates under. */
export const BROKERAGE_NAME = "Realty Executives Arizona Territory";

/** ADRE Brokerage License — Realty Executives Arizona Territory. */
export const BROKERAGE_LICENSE_NUMBER = "LC706691000";

/**
 * Display string used in navigation, footer, and compliance disclosures.
 * Format mandated by ADRE R4-28-502 (broker name visible without scrolling).
 */
export const BROKERAGE_DISPLAY = `${TEAM_NAME} | ${BROKERAGE_NAME}`;

/**
 * Long-form display used in legal copy and SEO.
 * e.g. "Corner Connect, brokered by Realty Executives Arizona Territory"
 */
export const BROKERAGE_LEGAL = `${TEAM_NAME}, brokered by ${BROKERAGE_NAME}`;

// ─── Contact ──────────────────────────────────────────────────────────────────

export const PHONE = "(520) 349-3248";
export const EMAIL = "kasandra@prietorealestategroup.com";
export const WEBSITE = "https://kasandraprietorealtor.com";

// ─── Address & Geo ────────────────────────────────────────────────────────────

export const ADDRESS_STREET = "4007 E Paradise Falls Dr, Suite 125";
export const ADDRESS_CITY = "Tucson";
export const ADDRESS_STATE = "AZ";
export const ADDRESS_ZIP = "85712";
export const ADDRESS_COUNTRY = "US";
export const ADDRESS_FULL = `${ADDRESS_STREET}, ${ADDRESS_CITY}, ${ADDRESS_STATE} ${ADDRESS_ZIP}`;

export const GEO_LAT = 32.2226;
export const GEO_LNG = -110.9747;

// ─── Reviews / Social Proof ───────────────────────────────────────────────────

export const REVIEW_COUNT = 126;
export const REVIEW_RATING = 5.0;

// ─── Languages ────────────────────────────────────────────────────────────────

export const LANGUAGES = ["English", "Spanish"] as const;
