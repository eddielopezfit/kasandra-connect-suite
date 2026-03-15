/**
 * Supabase Edge Function: seo-meta
 * 
 * Serves a lightweight HTML response with correct OG / Twitter / canonical
 * meta tags for social crawlers (Facebook, Twitter/X, Slack, LinkedIn, etc.)
 * that cannot execute JavaScript.
 *
 * Usage:
 *   GET https://sghuhlmsrmqryfvcbqqj.supabase.co/functions/v1/seo-meta?path=/sell
 *
 * The function returns a minimal HTML document whose <head> contains:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - Open Graph tags (og:title, og:description, og:url, og:image)
 *   - Twitter Card tags
 *   - A <meta http-equiv="refresh"> redirect so human visitors land on the
 *     correct SPA URL immediately (bots ignore this)
 *
 * CORS: allow * so it can be called from any origin.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// ---------------------------------------------------------------------------
// Route meta map — keep in sync with src/lib/seo/seoRouteMeta.ts
// ---------------------------------------------------------------------------
interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: "Tucson Real Estate Agent | Kasandra Prieto — Bilingual REALTOR®",
    description: "Kasandra Prieto is Tucson's trusted bilingual REALTOR®. Cash offers, market listings, buyer guidance, and 24/7 AI concierge — all in English and Spanish.",
    canonical: "https://kasandraprietorealtor.com/",
  },
  "/sell": {
    title: "Sell Your Tucson Home | Cash Offer & Traditional Listing — Kasandra Prieto",
    description: "Explore every Tucson home-selling option — cash offer, traditional listing, or sell-and-buy. Bilingual REALTOR® with 20+ years in Pima County.",
    canonical: "https://kasandraprietorealtor.com/sell",
  },
  "/buy": {
    title: "Buy a Home in Tucson, AZ | First-Time Buyer & Relocation Guide — Kasandra Prieto",
    description: "Step-by-step home buying in Tucson. Down payment assistance, bilingual support, off-market access, and a free AI readiness check — no pressure.",
    canonical: "https://kasandraprietorealtor.com/buy",
  },
  "/cash-offer-options": {
    title: "Cash Offer vs. Listing Calculator | Tucson Home Sale — Kasandra Prieto",
    description: "See your real net proceeds from a cash offer vs. traditional listing in Tucson. Honest numbers, no pressure, from a bilingual REALTOR® you can trust.",
    canonical: "https://kasandraprietorealtor.com/cash-offer-options",
  },
  "/seller-decision": {
    title: "Which Selling Path is Right For You? | Tucson Seller Decision Tool",
    description: "Answer 5 questions about your Tucson property and get a personalized selling path — cash offer, traditional listing, or hybrid. Free, no commitment.",
    canonical: "https://kasandraprietorealtor.com/seller-decision",
  },
  "/seller-readiness": {
    title: "Seller Readiness Check | Tucson Home Selling — Kasandra Prieto",
    description: "How ready are you to sell your Tucson home? Take the free 3-minute readiness check and get a personalized score with action steps.",
    canonical: "https://kasandraprietorealtor.com/seller-readiness",
  },
  "/buyer-readiness": {
    title: "Buyer Readiness Quiz | Are You Ready to Buy in Tucson? — Kasandra Prieto",
    description: "Take the free 3-minute buyer readiness quiz. Know exactly where you stand on financing, savings, and timeline before you start house hunting in Tucson.",
    canonical: "https://kasandraprietorealtor.com/buyer-readiness",
  },
  "/market": {
    title: "Tucson Real Estate Market Data 2026 | Live Housing Stats — Kasandra Prieto",
    description: "Live Tucson real estate market intelligence — days on market, sale-to-list ratios, inventory trends, and what it means for buyers and sellers right now.",
    canonical: "https://kasandraprietorealtor.com/market",
  },
  "/book": {
    title: "Schedule a Free Consultation | Kasandra Prieto, Tucson REALTOR®",
    description: "Book a free 20-minute consultation with Kasandra Prieto — bilingual Tucson REALTOR®. No pressure. Buyers, sellers, and investors welcome.",
    canonical: "https://kasandraprietorealtor.com/book",
  },
  "/about": {
    title: "About Kasandra Prieto | Tucson REALTOR®, Radio Host & Community Leader",
    description: "Meet Kasandra Prieto — 20+ year Tucson resident, bilingual REALTOR® at Realty Executives, radio host, and Pima County community advocate.",
    canonical: "https://kasandraprietorealtor.com/about",
  },
  "/guides": {
    title: "Free Tucson Real Estate Guides | Home Buying & Selling Education — Kasandra Prieto",
    description: "38 free bilingual guides on buying, selling, cash offers, Pima County taxes, and Tucson neighborhoods. Learn at your own pace, no pressure, no sign-up.",
    canonical: "https://kasandraprietorealtor.com/guides",
  },
  "/neighborhoods": {
    title: "Tucson Area Neighborhoods 2026 | Find Your Fit — Kasandra Prieto",
    description: "Explore 15 Tucson-area neighborhoods — Marana, Vail, Sahuarita, Foothills, and more. Buyer and seller insights from a local REALTOR® who lives here.",
    canonical: "https://kasandraprietorealtor.com/neighborhoods",
  },
  "/off-market": {
    title: "Off-Market Homes in Tucson | Exclusive Access — Kasandra Prieto",
    description: "Get exclusive off-market property access in Tucson before listings go public. Kasandra's private buyer network built over 20+ years in Pima County.",
    canonical: "https://kasandraprietorealtor.com/off-market",
  },
  "/neighborhood-compare": {
    title: "Compare Tucson Neighborhoods Side by Side | ZIP Code Tool — Kasandra Prieto",
    description: "Compare Marana, Vail, Sahuarita, Foothills and more side by side. Lifestyle, buyer fit, seller insights, and market context for every Tucson ZIP code.",
    canonical: "https://kasandraprietorealtor.com/neighborhood-compare",
  },
  "/seller-timeline": {
    title: "Tucson Home Selling Timeline Planner | 2026 Roadmap — Kasandra Prieto",
    description: "Build a personalized selling timeline for your Tucson home. See every milestone — prep, listing, closing — and when to hit each step to meet your goal.",
    canonical: "https://kasandraprietorealtor.com/seller-timeline",
  },
  "/buyer-closing-costs": {
    title: "Buyer Closing Cost Estimator | Tucson, Arizona 2026 — Kasandra Prieto",
    description: "Estimate your buyer closing costs in Tucson for conventional, FHA, VA, or cash purchases. Understand every line item before you make an offer.",
    canonical: "https://kasandraprietorealtor.com/buyer-closing-costs",
  },
  "/cash-readiness": {
    title: "Cash Offer Readiness Check | Tucson Home Sellers — Kasandra Prieto",
    description: "Is a cash offer the right move for your Tucson home? Answer 4 questions and get a personalized cash-readiness score with an honest recommendation.",
    canonical: "https://kasandraprietorealtor.com/cash-readiness",
  },
  "/selena-ai": {
    title: "Selena AI — 24/7 Real Estate Concierge | Kasandra Prieto Tucson",
    description: "Meet Selena — Kasandra's AI-powered real estate concierge. Ask anything about buying or selling in Tucson, get instant personalized guidance, 24/7.",
    canonical: "https://kasandraprietorealtor.com/selena-ai",
  },
  "/contact": {
    title: "Contact Kasandra Prieto | Tucson REALTOR® — Realty Executives Arizona",
    description: "Reach Kasandra Prieto directly. Bilingual real estate agent serving Tucson and Pima County. Call (520) 349-3248 or send a message.",
    canonical: "https://kasandraprietorealtor.com/contact",
  },
  // Guide routes
  "/guides/first-time-buyer-guide": {
    title: "First-Time Home Buyer Guide in Tucson, AZ (2026) — Kasandra Prieto",
    description: "Everything a first-time buyer in Tucson needs to know — financing, inspections, down payment programs, and Pima County market tips. Free bilingual guide.",
    canonical: "https://kasandraprietorealtor.com/guides/first-time-buyer-guide",
  },
  "/guides/selling-for-top-dollar": {
    title: "How to Sell Your Tucson Home for Top Dollar in 2026 — Kasandra Prieto",
    description: "Proven strategies to maximize your Tucson home sale price — pricing, staging, timing, and negotiation tactics from a local bilingual REALTOR®.",
    canonical: "https://kasandraprietorealtor.com/guides/selling-for-top-dollar",
  },
  "/guides/cash-offer-guide": {
    title: "How to Get a Cash Offer for Your Tucson Home (2026) — Kasandra Prieto",
    description: "Everything you need to know about accepting a cash offer in Tucson — what it includes, what to watch for, and how to compare it against listing.",
    canonical: "https://kasandraprietorealtor.com/guides/cash-offer-guide",
  },
  "/guides/inherited-probate-property": {
    title: "Selling an Inherited Home in Tucson, AZ — Probate & Estate Guide",
    description: "Inherited a home in Tucson? Understand Arizona probate, your selling options, timeline, and how to protect the family's interests. Free guide.",
    canonical: "https://kasandraprietorealtor.com/guides/inherited-probate-property",
  },
  "/guides/understanding-home-valuation": {
    title: "How Tucson Homes Are Valued: CMA & Appraisal Guide 2026 — Kasandra Prieto",
    description: "Understand exactly how your Tucson home's value is determined — CMA, appraisals, price per sq ft, and the factors that really move the number.",
    canonical: "https://kasandraprietorealtor.com/guides/understanding-home-valuation",
  },
  "/guides/sell-now-or-wait": {
    title: "Should You Sell Your Tucson Home Now or Wait? (2026 Analysis)",
    description: "Data-backed analysis of Tucson's 2026 housing market — whether now is the right time to sell, and what waiting actually costs you in Pima County.",
    canonical: "https://kasandraprietorealtor.com/guides/sell-now-or-wait",
  },
  "/guides/life-change-selling": {
    title: "Selling Your Tucson Home After a Major Life Change — Kasandra Prieto",
    description: "Job change, divorce, family loss, or relocation — how to sell your Tucson home during a major life transition. Calm, honest guidance.",
    canonical: "https://kasandraprietorealtor.com/guides/life-change-selling",
  },
  "/guides/tucson-market-update-2026": {
    title: "Tucson Real Estate Market Update 2026 | Buyer & Seller Outlook",
    description: "Comprehensive Tucson real estate market update for 2026 — inventory, price trends, interest rate impact, and what buyers and sellers should know now.",
    canonical: "https://kasandraprietorealtor.com/guides/tucson-market-update-2026",
  },
  "/guides/bad-credit-home-buying-tucson": {
    title: "Buying a Home in Tucson with Bad Credit (2026) — Kasandra Prieto",
    description: "Can you buy a home in Tucson with a low credit score? Yes. Here's how — FHA minimums, credit repair timelines, and local lenders who can help.",
    canonical: "https://kasandraprietorealtor.com/guides/bad-credit-home-buying-tucson",
  },
  "/guides/down-payment-assistance-tucson": {
    title: "Down Payment Assistance Programs in Tucson, AZ (2026) — Kasandra Prieto",
    description: "Up to $20,000 in down payment assistance available to Tucson buyers in 2026. HOME Plus, Pima IDA, and ADOH programs — see if you qualify.",
    canonical: "https://kasandraprietorealtor.com/guides/down-payment-assistance-tucson",
  },
  "/guides/fha-loan-pima-county-2026": {
    title: "FHA Loan Limits & Guide for Pima County, AZ (2026) — Kasandra Prieto",
    description: "FHA loan limits for Pima County in 2026, eligibility requirements, and how first-time buyers in Tucson can use FHA financing to buy their first home.",
    canonical: "https://kasandraprietorealtor.com/guides/fha-loan-pima-county-2026",
  },
  "/guides/itin-loan-guide": {
    title: "ITIN Home Loans in Tucson, Arizona (2026) — Non-SSN Buyer Guide",
    description: "Buy a home in Tucson without a Social Security number using an ITIN loan. Requirements, lenders, and process explained in English and Spanish.",
    canonical: "https://kasandraprietorealtor.com/guides/itin-loan-guide",
  },
  "/guides/divorce-home-sale-arizona": {
    title: "Selling a Home in an Arizona Divorce — Community Property Rules (2026)",
    description: "How Arizona community property law affects your home sale in a divorce. Who gets what, how to split proceeds, and how to sell without court delays.",
    canonical: "https://kasandraprietorealtor.com/guides/divorce-home-sale-arizona",
  },
  "/guides/first-time-buyer-programs-pima-county": {
    title: "First-Time Buyer Programs in Pima County, AZ (2026) — Kasandra Prieto",
    description: "The complete list of first-time buyer programs available in Pima County in 2026 — grants, deferred loans, and below-market mortgages. See what you qualify for.",
    canonical: "https://kasandraprietorealtor.com/guides/first-time-buyer-programs-pima-county",
  },
};

const OG_IMAGE = "https://kasandraprietorealtor.com/og-kasandra.jpg";
const FALLBACK: RouteMeta = {
  title: "Tucson Real Estate Agent | Kasandra Prieto — Bilingual REALTOR®",
  description: "Kasandra Prieto is Tucson's trusted bilingual REALTOR®. Cash offers, market listings, buyer guidance, and 24/7 AI concierge — all in English and Spanish.",
  canonical: "https://kasandraprietorealtor.com/",
};

// ---------------------------------------------------------------------------
// Bot UA detection
// ---------------------------------------------------------------------------
const BOT_UA_PATTERNS = [
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "facebookexternalhit", "twitterbot", "linkedinbot",
  "slackbot", "whatsapp", "telegrambot", "applebot", "discordbot",
  "pinterest", "embedly", "quora", "outbrain", "w3c_validator",
  "ia_archiver", "semrushbot", "ahrefsbot", "mj12bot",
];

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_UA_PATTERNS.some((p) => lower.includes(p));
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------
function buildMetaHtml(meta: RouteMeta): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const c = meta.canonical;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t}</title>
  <meta name="description" content="${d}" />
  <link rel="canonical" href="${c}" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Kasandra Prieto | Corner Connect" />
  <meta property="og:url" content="${c}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:locale:alternate" content="es_MX" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@KasandraPrieto" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />

  <!-- Redirect humans to the SPA (bots follow canonical, not this) -->
  <meta http-equiv="refresh" content="0;url=${c}" />
</head>
<body>
  <a href="${c}">${t}</a>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(req.url);
  const ua = req.headers.get("user-agent") ?? "";

  // Resolve path: accept ?path=/sell or direct path /seo-meta/sell
  let routePath = url.searchParams.get("path") ?? "/";

  // Normalize
  if (!routePath.startsWith("/")) routePath = "/" + routePath;
  // Strip trailing slash (except root)
  if (routePath.length > 1 && routePath.endsWith("/")) {
    routePath = routePath.slice(0, -1);
  }

  const meta = ROUTE_META[routePath] ?? FALLBACK;
  const html = buildMetaHtml(meta);

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
      "X-Robots-Tag": "index, follow",
    },
  });
});
