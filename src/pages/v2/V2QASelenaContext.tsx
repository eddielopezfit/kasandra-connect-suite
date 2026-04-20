/**
 * /qa/selena-context — DEV-only live inspector for Selena's memory.
 *
 * Shows in real time:
 *  1. SessionContext (the ~30 client-side fields)
 *  2. session_trail (chronological breadcrumb)
 *  3. guides_completed with resolved human titles
 *  4. The exact trailHint string the edge function will assemble
 *  5. Full payload preview (what would POST to selena-chat)
 *
 * Auto-refreshes every 1.5s so you can navigate the site in another tab and
 * watch context populate. Clear button wipes sessionStorage.
 */

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getSessionContext } from '@/lib/analytics/selenaSession';
import { getTrail, serializeTrailForSelena, clearTrail } from '@/lib/analytics/sessionTrail';

// Mirror of GUIDE_TITLE_MAP in supabase/functions/selena-chat/index.ts
const GUIDE_TITLE_MAP: Record<string, string> = {
  'cost-to-sell-tucson': 'Cost to Sell in Tucson',
  'home-prep-staging': 'Home Prep & Staging',
  'pricing-strategy': 'Pricing Strategy',
  'how-long-to-sell-tucson': 'How Long to Sell',
  'cash-vs-traditional-sale': 'Cash vs. Traditional Sale',
  'sell-now-or-wait': 'Sell Now or Wait',
  'sell-or-rent-tucson': 'Sell or Rent',
  'first-time-buyer-guide': 'First-Time Buyer',
  'arizona-first-time-buyer-programs': 'AZ First-Time Buyer Programs',
  'first-time-buyer-programs-pima-county': 'Pima County First-Time Buyer Programs',
  'buying-home-noncitizen-arizona': 'Buying as a Non-Citizen',
  'tucson-neighborhoods': 'Tucson Neighborhoods',
  'tucson-suburb-comparison': 'Tucson Suburb Comparison',
  'relocating-to-tucson': 'Relocating to Tucson',
  'military-pcs-guide': 'Military PCS',
  'va-home-loan-tucson': 'VA Home Loan',
  'fha-loan-pima-county-2026': 'FHA Loan Pima County',
  'down-payment-assistance-tucson': 'Down Payment Assistance',
  'bad-credit-home-buying-tucson': 'Bad Credit Home Buying',
  'itin-loan-guide': 'ITIN Loan',
  'divorce-selling': 'Selling During Divorce',
  'divorce-home-sale-arizona': 'Divorce Home Sale Arizona',
  'senior-downsizing': 'Senior Downsizing',
  'distressed-preforeclosure': 'Pre-Foreclosure',
  'move-up-buyer': 'Move-Up Buyer',
  'pima-county-property-taxes': 'Pima County Property Taxes',
  'capital-gains-home-sale-arizona': 'Capital Gains',
  'arizona-real-estate-glossary': 'Real Estate Glossary',
  'inherited-probate-property': 'Inherited/Probate Property',
  'life-change-selling': 'Life Change Selling',
  'selling-for-top-dollar': 'Selling for Top Dollar',
  'cash-offer-guide': 'Cash Offer',
  'understanding-home-valuation': 'Home Valuation',
  'tucson-market-update-2026': 'Tucson Market Update 2026',
};

// Maps quiz trail paths → canonical tool_id that should appear in tools_completed.
// If a path is in the trail but its tool_id is missing, we have a wiring gap.
const QUIZ_PATH_TO_TOOL_ID: Array<{ pattern: RegExp; toolId: string; label: string }> = [
  { pattern: /^\/buyer-readiness/,  toolId: 'buyer_readiness',  label: 'Buyer Readiness' },
  { pattern: /^\/seller-readiness/, toolId: 'seller_readiness', label: 'Seller Readiness' },
  { pattern: /^\/cash-readiness/,   toolId: 'cash_readiness',   label: 'Cash Readiness' },
];

interface WiringGap {
  toolId: string;
  label: string;
  path: string;
}

function buildTrailHintPreview(
  sessionTrail: ReturnType<typeof serializeTrailForSelena>,
  guidesCompleted: string[],
  language: 'en' | 'es' = 'en',
): string {
  const completedGuideTitles = guidesCompleted
    .map(id => GUIDE_TITLE_MAP[id] ?? id)
    .filter(Boolean);

  if (sessionTrail.length < 2 && completedGuideTitles.length === 0) {
    return '(empty — needs ≥2 trail events OR ≥1 completed guide)';
  }

  const trailSummary = sessionTrail.length >= 2
    ? sessionTrail
        .map(e => {
          const mins = e.minutes_ago;
          const ago = mins < 1 ? 'just now' : mins === 1 ? '1 min ago' : `${mins} min ago`;
          return `${e.label} [${e.type}, ${ago}]`;
        })
        .join(' → ')
    : '';

  const guidesLine = completedGuideTitles.length > 0
    ? (language === 'es'
        ? `\nGUÍAS COMPLETADAS (todas las sesiones): ${completedGuideTitles.join(', ')}`
        : `\nGUIDES COMPLETED (all sessions): ${completedGuideTitles.join(', ')}`)
    : '';

  const trailLine = trailSummary
    ? (language === 'es'
        ? `\nRECORRIDO DE SESIÓN (cronológico): ${trailSummary}`
        : `\nSESSION TRAIL (chronological): ${trailSummary}`)
    : '';

  return language === 'es'
    ? `${trailLine}${guidesLine}\n\nUsa este historial para: mencionar lo que ya exploró, sintetizar entre las guías completadas, y evitar repetir información. No leas las listas — úsalas como contexto implícito.`
    : `${trailLine}${guidesLine}\n\nUse this to: reference what they've already explored, synthesize across completed guides, and avoid repeating information. Do NOT read the lists aloud — use them as implicit context.`;
}

const Section = ({ title, children, count }: { title: string; children: React.ReactNode; count?: number }) => (
  <Card className="border-border/60">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-semibold flex items-center justify-between">
        <span>{title}</span>
        {typeof count === 'number' && (
          <Badge variant="secondary" className="text-xs">{count}</Badge>
        )}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export default function V2QASelenaContext() {
  const [, setTick] = useState(0);
  const [lang, setLang] = useState<'en' | 'es'>('en');

  // Auto-refresh every 1.5s — cheap reads from sessionStorage/localStorage
  useEffect(() => {
    const id = window.setInterval(() => setTick(t => t + 1), 1500);
    return () => window.clearInterval(id);
  }, []);

  // Production guard (after hooks per Rules of Hooks)
  if (!import.meta.env.DEV) {
    return <Navigate to="/" replace />;
  }

  const ctx = getSessionContext();
  const trail = getTrail();
  const trailSerialized = serializeTrailForSelena();
  const guidesCompleted = (ctx?.guides_completed as string[] | undefined) ?? [];
  const toolsCompleted = (ctx?.tools_completed as string[] | undefined) ?? [];
  const trailHintPreview = buildTrailHintPreview(trailSerialized, guidesCompleted, lang);

  const ctxFieldCount = ctx ? Object.keys(ctx).length : 0;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">DEV ONLY</Badge>
            <Badge variant="secondary" className="text-xs">Auto-refresh 1.5s</Badge>
            <div className="ml-auto flex items-center gap-1 rounded-md border border-border/60 p-0.5">
              <Button
                variant={lang === 'en' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setLang('en')}
              >
                EN
              </Button>
              <Button
                variant={lang === 'es' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setLang('es')}
              >
                ES
              </Button>
            </div>
          </div>
          <h1 className="text-2xl font-serif">Selena Context Inspector</h1>
          <p className="text-sm text-muted-foreground">
            Live view of what Selena's edge function sees on every chat turn. Open this in one tab,
            navigate the site in another, and watch context populate in real time.
          </p>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearTrail();
                setTick(t => t + 1);
              }}
            >
              Clear session trail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  sessionStorage.clear();
                  localStorage.removeItem('selena_session_context');
                  setTick(t => t + 1);
                } catch { /* noop */ }
              }}
            >
              Wipe all session storage
            </Button>
          </div>
        </header>

        <Separator />

        {/* trailHint preview — most important block for synthesis QA */}
        <Section title={`trailHint preview — ${lang.toUpperCase()} (what Selena receives)`}>
          <pre className="text-xs bg-muted/50 p-3 rounded whitespace-pre-wrap font-mono text-foreground">
{trailHintPreview}
          </pre>
        </Section>

        {/* Guides completed with title resolution */}
        <Section title="Completed guides (cross-session)" count={guidesCompleted.length}>
          {guidesCompleted.length === 0 ? (
            <p className="text-xs text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-1">
              {guidesCompleted.map(id => (
                <li key={id} className="text-xs flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{id}</Badge>
                  <span className="text-foreground">→</span>
                  <span className={GUIDE_TITLE_MAP[id] ? 'text-foreground' : 'text-destructive'}>
                    {GUIDE_TITLE_MAP[id] ?? '⚠ no title in GUIDE_TITLE_MAP'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Tools completed */}
        <Section title="Tools completed (this session)" count={toolsCompleted.length}>
          {toolsCompleted.length === 0 ? (
            <p className="text-xs text-muted-foreground">None yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {toolsCompleted.map(t => (
                <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}
        </Section>

        {/* Session trail */}
        <Section title="Session trail (chronological)" count={trail.length}>
          {trail.length === 0 ? (
            <p className="text-xs text-muted-foreground">No pages tracked yet. Navigate the site to populate.</p>
          ) : (
            <ol className="space-y-1.5">
              {trail.map((e, i) => (
                <li key={`${e.path}-${i}`} className="text-xs flex items-center gap-2">
                  <span className="text-muted-foreground tabular-nums w-6">{i + 1}.</span>
                  <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                  <span className="text-foreground font-medium">{e.label}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground font-mono text-[10px]">{e.path}</span>
                </li>
              ))}
            </ol>
          )}
        </Section>

        {/* Full SessionContext dump */}
        <Section title="SessionContext (full dump)" count={ctxFieldCount}>
          {!ctx ? (
            <p className="text-xs text-muted-foreground">No SessionContext yet — open Selena once to initialize.</p>
          ) : (
            <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-96 font-mono">
{JSON.stringify(ctx, null, 2)}
            </pre>
          )}
        </Section>

        {/* Edge payload preview */}
        <Section title="Payload preview (POST to selena-chat)">
          <pre className="text-xs bg-muted/50 p-3 rounded overflow-auto max-h-96 font-mono">
{JSON.stringify(
  {
    message: '<user message>',
    context: {
      ...(ctx ?? {}),
      session_trail: trailSerialized,
    },
    history: '<last 6 turns>',
  },
  null,
  2,
)}
          </pre>
        </Section>
      </div>
    </div>
  );
}
