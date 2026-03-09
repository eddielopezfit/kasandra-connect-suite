/**
 * /v2/qa-determinism — Internal Diagnostics Route
 * 
 * Read-only observability page for verifying system determinism:
 * - Session context state
 * - Event buffer (DEV only, metadata only)
 * - Guardrail expectations checklist
 * - Guide registry integrity validation
 * - ActionSpec resolution smoke test
 * 
 * Additive only — does not modify any system state or behavior.
 * In production: redirects to /v2 (never renders blank).
 */

import { Navigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import V2Layout from '@/components/v2/V2Layout';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';
import SessionContextPanel from '@/components/v2/qa/SessionContextPanel';
import LastEventsPanel from '@/components/v2/qa/LastEventsPanel';
import GuardrailChecklistPanel from '@/components/v2/qa/GuardrailChecklistPanel';
import GuideRegistryValidationPanel from '@/components/v2/qa/GuideRegistryValidationPanel';
import ActionSpecSmokeTestPanel from '@/components/v2/qa/ActionSpecSmokeTestPanel';
import GuardOverlayPanel from '@/components/v2/qa/GuardOverlayPanel';
import { isQaAccessGranted } from '@/lib/qa/qaAccess';

const V2QADeterminism = () => {
  // All hooks must be called before the gate
  const { language } = useLanguage();

  // Prod gate — redirects cleanly, never renders blank
  if (!isQaAccessGranted()) {
    return <Navigate to="/" replace />;
  }

  return (
    <V2Layout>
      <section className="bg-cc-navy pt-32 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-3xl font-bold text-white">Determinism QA</h1>
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-xs">
              INTERNAL QA
            </Badge>
          </div>
          <p className="text-white/70 text-sm">
            Read-only diagnostics. Session state, guardrails, guide registry integrity, ActionSpec resolution.
            Language: {language}
          </p>
        </div>
      </section>

      <section className="py-8 bg-cc-ivory">
        <div className="container mx-auto px-4">
          <Accordion type="multiple" defaultValue={['session', 'guardrails', 'registry']} className="space-y-4">
            <AccordionItem value="session" className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-base font-semibold">
                Panel A: Session Context Snapshot
              </AccordionTrigger>
              <AccordionContent>
                <SessionContextPanel />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="events" className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-base font-semibold">
                Panel B: Last Events Viewer
              </AccordionTrigger>
              <AccordionContent>
                <LastEventsPanel />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="guardrails" className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-base font-semibold">
                Panel C: Guardrail Expectations Checklist
              </AccordionTrigger>
              <AccordionContent>
                <GuardrailChecklistPanel />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="registry" className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-base font-semibold">
                Panel D: Guide Registry Validation
              </AccordionTrigger>
              <AccordionContent>
                <GuideRegistryValidationPanel />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="actionspec" className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-base font-semibold">
                Panel E: ActionSpec Resolution Smoke Test
              </AccordionTrigger>
              <AccordionContent>
                <ActionSpecSmokeTestPanel />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="guard-overlay" className="rounded-lg border bg-card px-4">
              <AccordionTrigger className="text-base font-semibold">
                Panel F: Guard Overlay Telemetry
              </AccordionTrigger>
              <AccordionContent>
                <GuardOverlayPanel />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </V2Layout>
  );
};

export default V2QADeterminism;
