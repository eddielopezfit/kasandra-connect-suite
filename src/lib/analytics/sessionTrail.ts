/**
 * Session Trail — Selena Level 2 Intelligence
 *
 * Tracks the user's page/tool journey within the current browser session.
 * Provides Selena with breadcrumb context so she can reference what the
 * user has already explored rather than starting cold.
 *
 * Storage: sessionStorage — scoped to tab, resets on close. Not localStorage.
 * This is intentional: trail is ephemeral and session-specific.
 *
 * Cap: 12 most recent events — keeps edge function payload lean.
 */

export type TrailEventType = 'guide' | 'tool' | 'quiz' | 'page';

export interface TrailEvent {
  path: string;
  label: string;
  type: TrailEventType;
  timestamp: string; // ISO
}

const TRAIL_KEY = 'selena_session_trail';
const MAX_TRAIL = 12;

// ============= ROUTE CLASSIFICATION =============

// Paths that map to human-readable labels and event types.
// Order matters — more specific matches first.
const ROUTE_MAP: Array<{ pattern: RegExp; label: string; type: TrailEventType }> = [
  // Tools
  { pattern: /^\/cash-offer-options/, label: 'Seller Net Calculator', type: 'tool' },
  { pattern: /^\/seller-readiness/,   label: 'Seller Readiness Check', type: 'quiz' },
  { pattern: /^\/buyer-readiness/,    label: 'Buyer Readiness Navigator', type: 'quiz' },
  { pattern: /^\/cash-readiness/,     label: 'Cash Readiness Check', type: 'quiz' },
  { pattern: /^\/seller-decision/,    label: 'Seller Decision Wizard', type: 'tool' },
  { pattern: /^\/market/,             label: 'Tucson Market Intelligence', type: 'tool' },
  { pattern: /^\/neighborhood-compare/, label: 'Neighborhood Comparison Tool', type: 'tool' },
  { pattern: /^\/buyer-closing-costs/,  label: 'Buyer Closing Cost Estimator', type: 'tool' },
  { pattern: /^\/off-market/,         label: 'Off-Market Buyer Registration', type: 'tool' },
  // Neighborhood pages (FIX 1: strong intent signal)
  { pattern: /^\/neighborhoods\/(.+)/, label: 'Neighborhood Profile', type: 'page' },
  { pattern: /^\/neighborhoods$/,     label: 'Neighborhoods Index', type: 'page' },
  // Guide detail (extract guide ID for label lookup)
  { pattern: /^\/guides\/.+/,         label: 'Guide', type: 'guide' },
  // Section pages
  { pattern: /^\/guides$/,            label: 'Guides Library', type: 'page' },
  { pattern: /^\/buy/,               label: 'Buy Overview', type: 'page' },
  { pattern: /^\/sell/,              label: 'Sell Overview', type: 'page' },
  { pattern: /^\/book/,              label: 'Book a Consultation', type: 'page' },
  { pattern: /^\/?$/,               label: 'Home', type: 'page' },
];

// Human-readable labels for known guide IDs
const GUIDE_LABELS: Record<string, string> = {
  'cost-to-sell-tucson':             'Cost to Sell in Tucson Guide',
  'home-prep-staging':               'Home Prep & Staging Guide',
  'pricing-strategy':                'Pricing Strategy Guide',
  'how-long-to-sell-tucson':         'How Long to Sell Guide',
  'cash-vs-traditional-sale':        'Cash vs. Traditional Sale Guide',
  'sell-now-or-wait':                'Sell Now or Wait Guide',
  'sell-or-rent-tucson':             'Sell or Rent Guide',
  'first-time-buyer-guide':          'First-Time Buyer Guide',
  'arizona-first-time-buyer-programs': 'AZ First-Time Buyer Programs Guide',
  'buying-home-noncitizen-arizona':  'Buying as a Non-Citizen Guide',
  'tucson-neighborhoods':            'Tucson Neighborhoods Guide',
  'tucson-suburb-comparison':        'Tucson Suburb Comparison Guide',
  'relocating-to-tucson':            'Relocating to Tucson Guide',
  'military-pcs-guide':              'Military PCS Guide',
  'divorce-selling':                 'Selling During Divorce Guide',
  'senior-downsizing':               'Senior Downsizing Guide',
  'distressed-preforeclosure':       'Pre-Foreclosure Guide',
  'move-up-buyer':                   'Move-Up Buyer Guide',
  'pima-county-property-taxes':      'Pima County Property Taxes Guide',
  'capital-gains-home-sale-arizona': 'Capital Gains Guide',
  'arizona-real-estate-glossary':    'Real Estate Glossary',
  'inherited-probate-property':      'Inherited/Probate Property Guide',
  'life-change-selling':             'Life Change Selling Guide',
  'selling-for-top-dollar':          'Selling for Top Dollar Guide',
  'cash-offer-guide':                'Cash Offer Guide',
  'understanding-home-valuation':    'Home Valuation Guide',
};

// Human-readable labels for neighborhood slugs
const NEIGHBORHOOD_LABELS: Record<string, string> = {
  'catalina-foothills':    'Catalina Foothills',
  'oro-valley':            'Oro Valley',
  'marana':                'Marana',
  'sahuarita':             'Sahuarita',
  'rita-ranch':            'Rita Ranch',
  'vail':                  'Vail',
  'sam-hughes':            'Sam Hughes',
  'downtown-tucson':       'Downtown Tucson',
  'tanque-verde':          'Tanque Verde',
  'dove-mountain':         'Dove Mountain',
  'casas-adobes':          'Casas Adobes',
  'picture-rocks':         'Picture Rocks',
  'midtown':               'Midtown',
  'east-side':             'East Side',
  'foothills':             'Foothills',
};

/**
 * Classifies a path into a TrailEvent label and type.
 */
export function classifyPath(path: string): { label: string; type: TrailEventType } {
  for (const route of ROUTE_MAP) {
    if (route.pattern.test(path)) {
      // For guide detail pages, extract the guide ID for a specific label
      if (route.type === 'guide') {
        const guideId = path.replace('/guides/', '').split('?')[0];
        const label = GUIDE_LABELS[guideId] ?? `Guide: ${guideId}`;
        return { label, type: 'guide' };
      }
      // For neighborhood detail pages, extract slug for specific label
      if (route.label === 'Neighborhood Profile') {
        const slug = path.replace('/neighborhoods/', '').split('?')[0];
        const label = NEIGHBORHOOD_LABELS[slug] ?? `Neighborhood: ${slug}`;
        return { label, type: 'page' };
      }
      return { label: route.label, type: route.type };
    }
  }
  // Unclassified path — still track it
  return { label: path, type: 'page' };
}

// ============= STORAGE HELPERS =============

export function getTrail(): TrailEvent[] {
  try {
    const stored = sessionStorage.getItem(TRAIL_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as TrailEvent[];
  } catch {
    return [];
  }
}

function saveTrail(trail: TrailEvent[]): void {
  try {
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify(trail));
  } catch {
    // sessionStorage unavailable (private mode edge case) — silent fail
  }
}

// ============= TRAIL MUTATION =============

/**
 * Appends a path to the session trail.
 * Deduplicates consecutive identical paths (no double-counting on re-render).
 * Caps at MAX_TRAIL entries (newest preserved).
 */
export function appendTrail(path: string): void {
  const trail = getTrail();
  const classified = classifyPath(path);

  // Skip uninteresting paths
  if (shouldSkipPath(path)) return;

  // Dedup: skip if last event was same path
  const last = trail[trail.length - 1];
  if (last?.path === path) return;

  const event: TrailEvent = {
    path,
    label: classified.label,
    type: classified.type,
    timestamp: new Date().toISOString(),
  };

  const updated = [...trail, event].slice(-MAX_TRAIL);
  saveTrail(updated);
}

/**
 * Paths that add no signal — skip tracking these.
 * NOTE: Neighborhood pages are NOT skipped — they carry strong intent signal.
 */
function shouldSkipPath(path: string): boolean {
  const SKIP = [
    /^\/guides\/?$/,  // guides index — too generic
    /^\/$/,           // home page — too generic
  ];
  return SKIP.some(p => p.test(path));
}

export function clearTrail(): void {
  try {
    sessionStorage.removeItem(TRAIL_KEY);
  } catch {
    // silent
  }
}

// ============= EDGE FUNCTION SERIALIZATION =============

/**
 * Returns the trail formatted for the Selena edge function context payload.
 * Lightweight — only path, label, type, and relative time.
 */
export function serializeTrailForSelena(): Array<{
  label: string;
  type: TrailEventType;
  minutes_ago: number;
}> {
  const trail = getTrail();
  const now = Date.now();

  return trail.map(event => ({
    label: event.label,
    type: event.type,
    minutes_ago: Math.round((now - new Date(event.timestamp).getTime()) / 60000),
  }));
}
