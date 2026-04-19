/**
 * Tone Test Suite — fires sample messages at selena-chat and flags any reply
 * that contains a banned phrase, exceeds 70 words / 3 sentences, or mentions
 * a legacy brokerage (Coldwell, MoxiWorks, International Diamond Society).
 *
 * Internal QA only. Production access via ?qa=PSG2026 token.
 *
 * Each sample runs in isolation — fresh session_id, no history — so we test
 * Selena's cold-start response to common questions, not multi-turn drift.
 */

import { useState, useCallback, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import V2Layout from "@/components/v2/V2Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isQaAccessGranted } from "@/lib/qa/qaAccess";
import { TONE_TEST_SAMPLES, type ToneTestSample } from "@/lib/qa/toneTestSamples";
import {
  evaluateReply,
  type EvaluationResult,
  type Violation,
} from "@/lib/qa/toneEvaluator";
import { BrevityViolationsPanel } from "@/components/v2/qa/BrevityViolationsPanel";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface RunResult {
  sample: ToneTestSample;
  evaluation?: EvaluationResult;
  error?: string;
  durationMs: number;
}

type RunStatus = "idle" | "running" | "complete";

const VIOLATION_LABELS: Record<Violation["type"], { label: string; tone: "destructive" | "warning" }> = {
  banned_phrase: { label: "Banned phrase", tone: "destructive" },
  legacy_brokerage: { label: "Legacy brokerage", tone: "destructive" },
  exceeds_word_limit: { label: "Over 70 words", tone: "warning" },
  exceeds_sentence_limit: { label: "Over 3 sentences", tone: "warning" },
};

async function callSelena(sample: ToneTestSample): Promise<{ reply: string; durationMs: number }> {
  const sessionId = `qa-tone-${sample.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const start = performance.now();

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/selena-chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        message: sample.message,
        context: {
          session_id: sessionId,
          route: "/qa-tone-suite",
          language: sample.language,
          turn_count: 1,
          current_mode: 1,
          chip_phase_floor: 0,
          greeting_phase_seen: 0,
          tools_completed: [],
          guides_completed: [],
          readiness_score: 0,
        },
        history: [],
      }),
    }
  );

  const durationMs = performance.now() - start;
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  const reply = typeof data?.reply === "string" ? data.reply : "";
  return { reply, durationMs };
}

const V2QAToneSuite = () => {
  const { language } = useLanguage();
  useDocumentHead({
    titleEn: "Tone Test Suite | Internal",
    titleEs: "Suite de Pruebas de Tono | Interno",
    descriptionEn: "Regression harness for selena-chat replies — banned phrases, brevity, legacy brokerage.",
    descriptionEs: "Suite de regresión para selena-chat — frases prohibidas, brevedad, corredora legada.",
  });

  const [status, setStatus] = useState<RunStatus>("idle");
  const [results, setResults] = useState<RunResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState<"all" | "fail" | "pass">("all");

  const runSuite = useCallback(async () => {
    setStatus("running");
    setResults([]);
    setProgress(0);
    const collected: RunResult[] = [];

    for (let i = 0; i < TONE_TEST_SAMPLES.length; i++) {
      const sample = TONE_TEST_SAMPLES[i];
      try {
        const { reply, durationMs } = await callSelena(sample);
        const evaluation = evaluateReply(reply, sample.language);
        collected.push({ sample, evaluation, durationMs });
      } catch (err) {
        collected.push({
          sample,
          error: err instanceof Error ? err.message : String(err),
          durationMs: 0,
        });
      }
      setResults([...collected]);
      setProgress(Math.round(((i + 1) / TONE_TEST_SAMPLES.length) * 100));
      // Light delay between calls — keep edge function happy.
      await new Promise((r) => setTimeout(r, 250));
    }

    setStatus("complete");
  }, []);

  const summary = useMemo(() => {
    const total = results.length;
    const passed = results.filter((r) => r.evaluation?.passed).length;
    const failed = results.filter((r) => r.evaluation && !r.evaluation.passed).length;
    const errored = results.filter((r) => r.error).length;
    const avgWords =
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + (r.evaluation?.wordCount ?? 0), 0) /
              Math.max(results.length, 1)
          )
        : 0;
    return { total, passed, failed, errored, avgWords };
  }, [results]);

  const visibleResults = useMemo(() => {
    if (filter === "all") return results;
    if (filter === "fail") return results.filter((r) => r.error || (r.evaluation && !r.evaluation.passed));
    return results.filter((r) => r.evaluation?.passed);
  }, [results, filter]);

  // Prod gate — runs after all hooks
  if (!isQaAccessGranted()) {
    return <Navigate to="/" replace />;
  }

  return (
    <V2Layout>
      <section className="bg-cc-navy pt-32 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif text-3xl font-bold text-white">Tone Test Suite</h1>
            <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-xs">
              INTERNAL QA
            </Badge>
          </div>
          <p className="text-white/70 text-sm max-w-2xl">
            Fires {TONE_TEST_SAMPLES.length} sample messages at selena-chat. Flags replies with KB-16
            banned phrases, brevity violations (over 70 words or 3 sentences), or legacy brokerage
            mentions (Coldwell, MoxiWorks, Diamond Society). Each sample runs in a fresh session.
            Language: {language}
          </p>
        </div>
      </section>

      <section className="py-8 bg-cc-ivory">
        <div className="container mx-auto px-4 space-y-6">
          {/* Brevity Violations telemetry */}
          <BrevityViolationsPanel />

          {/* Controls */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button
                onClick={runSuite}
                disabled={status === "running"}
                className="bg-cc-navy text-white hover:bg-cc-navy-dark"
              >
                {status === "running" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running…
                  </>
                ) : status === "complete" ? (
                  "Run again"
                ) : (
                  `Run ${TONE_TEST_SAMPLES.length} samples`
                )}
              </Button>

              {status !== "idle" && (
                <div className="flex-1 min-w-[200px]">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.length} / {TONE_TEST_SAMPLES.length} complete
                  </p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <SummaryStat label="Total" value={summary.total} />
                <SummaryStat label="Passed" value={summary.passed} tone="success" />
                <SummaryStat label="Failed" value={summary.failed} tone="destructive" />
                <SummaryStat label="Errored" value={summary.errored} tone="warning" />
                <SummaryStat label="Avg words" value={summary.avgWords} />
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-4 flex gap-2">
                <FilterButton current={filter} value="all" onClick={setFilter}>All</FilterButton>
                <FilterButton current={filter} value="fail" onClick={setFilter}>Failures only</FilterButton>
                <FilterButton current={filter} value="pass" onClick={setFilter}>Passes only</FilterButton>
              </div>
            )}
          </Card>

          {/* Results */}
          {visibleResults.length > 0 && (
            <Accordion type="multiple" className="space-y-3">
              {visibleResults.map((result) => {
                const failed = !!result.error || (result.evaluation && !result.evaluation.passed);
                return (
                  <AccordionItem
                    key={result.sample.id}
                    value={result.sample.id}
                    className="border rounded-lg bg-card px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-start gap-3 text-left flex-1 pr-4">
                        {result.error ? (
                          <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                        ) : failed ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Badge variant="outline" className="text-xs uppercase">
                              {result.sample.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {result.sample.language}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              #{result.sample.id} · {Math.round(result.durationMs)}ms
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {result.sample.message}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {result.error ? (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded">
                          Error: {result.error}
                        </div>
                      ) : result.evaluation ? (
                        <div className="space-y-3">
                          {result.sample.expectation && (
                            <p className="text-xs italic text-muted-foreground">
                              Expectation: {result.sample.expectation}
                            </p>
                          )}
                          <div className="bg-muted/50 p-3 rounded text-sm whitespace-pre-wrap">
                            {result.evaluation.reply || <em className="text-muted-foreground">(empty reply)</em>}
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>{result.evaluation.wordCount} words</span>
                            <span>·</span>
                            <span>{result.evaluation.sentenceCount} sentences</span>
                          </div>
                          {result.evaluation.violations.length > 0 && (
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase text-destructive">
                                Violations
                              </p>
                              {result.evaluation.violations.map((v, i) => {
                                const meta = VIOLATION_LABELS[v.type];
                                return (
                                  <div
                                    key={i}
                                    className={`text-xs p-2 rounded border ${
                                      meta.tone === "destructive"
                                        ? "bg-destructive/10 border-destructive/30 text-destructive"
                                        : "bg-amber-50 border-amber-300 text-amber-900"
                                    }`}
                                  >
                                    <strong>{meta.label}:</strong> {v.detail}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {status === "idle" && (
            <Card className="p-8 text-center text-muted-foreground">
              <p className="text-sm">
                Click <strong>Run {TONE_TEST_SAMPLES.length} samples</strong> to start the regression.
                Expected runtime: ~{Math.ceil(TONE_TEST_SAMPLES.length * 2.5)}s.
              </p>
            </Card>
          )}
        </div>
      </section>
    </V2Layout>
  );
};

const SummaryStat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "destructive" | "warning";
}) => {
  const colorClass =
    tone === "success"
      ? "text-green-600"
      : tone === "destructive"
        ? "text-destructive"
        : tone === "warning"
          ? "text-amber-600"
          : "text-foreground";
  return (
    <div className="rounded-lg border p-3 bg-background">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
};

const FilterButton = ({
  current,
  value,
  onClick,
  children,
}: {
  current: string;
  value: "all" | "fail" | "pass";
  onClick: (v: "all" | "fail" | "pass") => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
      current === value
        ? "bg-cc-navy text-white border-cc-navy"
        : "bg-background text-muted-foreground border-border hover:border-cc-navy/50"
    }`}
  >
    {children}
  </button>
);

export default V2QAToneSuite;
