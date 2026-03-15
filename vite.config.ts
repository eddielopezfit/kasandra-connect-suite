import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";
import nodePath from "path";

// ---------------------------------------------------------------------------
// SEO PRERENDER DATA
// Inline copy of seoRouteMeta.ts so the Vite plugin can use it at build time
// without importing from src/ (which isn't transpiled yet during config eval).
// Keep in sync with src/lib/seo/seoRouteMeta.ts.
// ---------------------------------------------------------------------------
interface RouteMeta {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  canonical: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
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

// ---------------------------------------------------------------------------
// VITE PRERENDER PLUGIN
// Runs after every build. For each route in ROUTE_META it:
//  1. Reads dist/index.html
//  2. Replaces <title>, <meta name="description">, canonical, OG and Twitter tags
//  3. Writes the patched HTML to dist{route}/index.html
//
// Static file hosts (Lovable/Netlify/Vercel) serve the file at the path
// before falling back to index.html — so Googlebot fetching /sell/ gets the
// /sell/index.html with the correct meta, not the generic fallback.
// ---------------------------------------------------------------------------
function seoPrerender() {
  return {
    name: "seo-prerender",
    apply: "build" as const,
    closeBundle() {
      const distDir = nodePath.resolve(__dirname, "dist");
      const templatePath = nodePath.join(distDir, "index.html");

      if (!fs.existsSync(templatePath)) {
        console.warn("[seo-prerender] dist/index.html not found — skipping prerender.");
        return;
      }

      const template = fs.readFileSync(templatePath, "utf-8");
      let routeCount = 0;

      for (const [route, meta] of Object.entries(ROUTE_META)) {
        const ogTitle = meta.ogTitle ?? meta.title;
        const ogDesc = meta.ogDescription ?? meta.description;
        const canonical = meta.canonical;

        let html = template;

        // --- <title>
        html = html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${escapeHtml(meta.title)}</title>`
        );

        // --- <meta name="description">
        html = html.replace(
          /<meta name="description" content="[^"]*"/,
          `<meta name="description" content="${escapeHtml(meta.description)}"`
        );

        // --- <link rel="canonical">
        html = html.replace(
          /<link rel="canonical" href="[^"]*"/,
          `<link rel="canonical" href="${canonical}"`
        );

        // --- OG url
        html = html.replace(
          /<meta property="og:url" content="[^"]*"/,
          `<meta property="og:url" content="${canonical}"`
        );

        // --- OG title
        html = html.replace(
          /<meta property="og:title" content="[^"]*"/,
          `<meta property="og:title" content="${escapeHtml(ogTitle)}"`
        );

        // --- OG description
        html = html.replace(
          /<meta property="og:description" content="[^"]*"/,
          `<meta property="og:description" content="${escapeHtml(ogDesc)}"`
        );

        // --- Twitter title
        html = html.replace(
          /<meta name="twitter:title" content="[^"]*"/,
          `<meta name="twitter:title" content="${escapeHtml(ogTitle)}"`
        );

        // --- Twitter description
        html = html.replace(
          /<meta name="twitter:description" content="[^"]*"/,
          `<meta name="twitter:description" content="${escapeHtml(ogDesc)}"`
        );

        // Write to dist{route}/index.html
        // route is like "/sell" → dist/sell/index.html
        // route is like "/guides/first-time-buyer-guide" → dist/guides/first-time-buyer-guide/index.html
        const routeDir = nodePath.join(distDir, route.replace(/^\//, ""));
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(nodePath.join(routeDir, "index.html"), html, "utf-8");
        routeCount++;
      }

      console.log(`[seo-prerender] ✓ Generated ${routeCount} route-specific index.html files`);
    },
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------
// VITE CONFIG
// ---------------------------------------------------------------------------
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      isDev && componentTagger(),
      seoPrerender(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    esbuild: {
      drop: isDev ? [] : ["console", "debugger"],
    },
    build: {
      chunkSizeWarningLimit: 800,
      cssCodeSplit: true,
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
              return "react-vendor";
            }
            if (id.includes("node_modules/@supabase/")) {
              return "supabase-vendor";
            }
            if (
              id.includes("node_modules/framer-motion/") ||
              id.includes("node_modules/recharts/")
            ) {
              return "ui-heavy-vendor";
            }
            if (id.includes("node_modules/@radix-ui/")) {
              return "radix-vendor";
            }
          },
        },
      },
    },
  };
});
