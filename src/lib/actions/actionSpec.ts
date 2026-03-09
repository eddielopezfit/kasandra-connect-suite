/**
 * ActionSpec — Semantic Action Model
 * 
 * All actions in the system (chips, cards, buttons) must be backed by an ActionSpec.
 * Types are purely semantic — resolution logic is hidden inside resolveAction().
 * No route paths, no implementation details leak into the registry or UI.
 */

import { getGuideById } from '@/lib/guides/guideRegistry';

// Known tools and calculators — semantic IDs only
export const KNOWN_TOOLS = ['buyer-readiness', 'cash-readiness', 'seller-readiness', 'off-market-buyer'] as const;
export const KNOWN_CALCULATORS = ['cash-comparison'] as const;

// Whitelisted hub paths for the 'navigate' ActionSpec type
const NAVIGATE_WHITELIST = [
  '/guides', '/community', '/podcast',
  '/buy', '/sell', '/book',
  '/seller-decision', '/cash-offer-options',
  '/market', '/neighborhood-compare', '/buyer-closing-costs',
  '/seller-timeline',
] as const;

// Valid entry sources for open_chat
const VALID_ENTRY_SOURCES = [
  'calculator', 'guide_handoff', 'guide', 'synthesis', 'hero', 'floating',
  'proactive', 'question', 'post_booking', 'quiz_result',
  'earned_access',
] as const;

export type ToolId = typeof KNOWN_TOOLS[number];
export type CalculatorId = typeof KNOWN_CALCULATORS[number];

export type ActionSpec =
  | { type: 'open_guide'; guideId: string; label: { en: string; es: string } }
  | { type: 'open_tool'; toolId: ToolId; label: { en: string; es: string } }
  | { type: 'run_calculator'; calculatorId: CalculatorId; label: { en: string; es: string } }
  | { type: 'open_chat'; payload: { source: string; guideId?: string; lifeEvent?: string; calculatorId?: string }; label: { en: string; es: string } }
  | { type: 'navigate'; path: string; label: { en: string; es: string } }
  | { type: 'book'; label: { en: string; es: string } }
  | { type: 'call_contact'; phone: string; label: { en: string; es: string } }
  | { type: 'external_link'; url: string; label: { en: string; es: string } };

// Internal route maps — never exposed outside this module
const TOOL_ROUTES: Record<ToolId, string> = {
  'buyer-readiness': '/v2/buyer-readiness',
  'cash-readiness': '/v2/cash-readiness',
  'seller-readiness': '/v2/seller-readiness',
  'off-market-buyer': '/v2/off-market',
};

const CALC_ROUTES: Record<CalculatorId, string> = {
  'cash-comparison': '/v2/cash-offer-options',
};

/**
 * Semantic validation — checks meaning, not paths.
 */
export function isActionValid(spec: ActionSpec): boolean {
  switch (spec.type) {
    case 'open_guide':
      return !!getGuideById(spec.guideId);
    case 'open_tool':
      return (KNOWN_TOOLS as readonly string[]).includes(spec.toolId);
    case 'run_calculator':
      return (KNOWN_CALCULATORS as readonly string[]).includes(spec.calculatorId);
    case 'open_chat':
      return (VALID_ENTRY_SOURCES as readonly string[]).includes(spec.payload.source);
    case 'navigate':
      return (NAVIGATE_WHITELIST as readonly string[]).includes(spec.path);
    case 'book':
      return true;
    case 'call_contact':
      return /^\+?[\d\s()-]{7,}$/.test(spec.phone);
    case 'external_link':
      return spec.url.startsWith('https://');
    default:
      return false;
  }
}

/**
 * Callback type for opening chat from an ActionSpec.
 * Intentionally loose to bridge ActionSpec payloads → EntryContext.
 */
export type OpenChatFn = (payload: Record<string, unknown>) => void;

/**
 * Resolves an ActionSpec to its side-effect.
 * Implementation details (paths, window.open) are encapsulated here.
 */
export function resolveAction(
  spec: ActionSpec,
  navigate: (path: string) => void,
  openChat?: OpenChatFn,
): void {
  switch (spec.type) {
    case 'open_guide':
      navigate(`/v2/guides/${spec.guideId}`);
      break;
    case 'open_tool':
      navigate(TOOL_ROUTES[spec.toolId]);
      break;
    case 'run_calculator':
      navigate(CALC_ROUTES[spec.calculatorId]);
      break;
    case 'open_chat':
      openChat?.(spec.payload);
      break;
    case 'navigate':
      navigate(spec.path);
      break;
    case 'book':
      navigate('/v2/book');
      break;
    case 'call_contact':
      window.open(`tel:${spec.phone}`, '_self');
      break;
    case 'external_link':
      window.open(spec.url, '_blank', 'noopener,noreferrer');
      break;
  }
}
