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
import {
  TONE_TEST_SAMPLES,
  TOTAL_TURN_COUNT,
  type ToneTestSample,
} from "@/lib/qa/toneTestSamples";
import {
  evaluateReply,
  type EvaluationResult,
  type Violation,
} from "@/lib/qa/toneEvaluator";
import { BrevityViolationsPanel } from "@/components/v2/qa/BrevityViolationsPanel";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface RunResult {
  /** Per-turn unique id, e.g. "p1" or "p1:t2" */
  turnId: string;
  sample: ToneTestSample;
  /** 1 = cold-start; 2+ = follow-up turn */
  turnIndex: number;
  /** The actual user message for this turn */
  userMessage: string;
  evaluation?: EvaluationResult;
  error?: string;
  durationMs: number;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type RunStatus = "idle" | "running" | "complete";

const VIOLATION_LABELS: Record<Violation["type"], { label: string; tone: "destructive" | "warning" }> = {
  banned_phrase: { label: "Banned phrase", tone: "destructive" },
  legacy_brokerage: { label: "Legacy brokerage", tone: "destructive" },
  exceeds_word_limit: { label: "Over 70 words", tone: "warning" },
  exceeds_sentence_limit: { label: "Over 3 sentences", tone: "warning" },
};

async function callSelena(
  sample: ToneTestSample,
  userMessage: string,
  sessionId: string,
  history: ChatMessage[],
  turnIndex: number
): Promise<{ reply: string; durationMs: number }> {
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
        message: userMessage,
        context: {
          session_id: sessionId,
          route: "/qa-tone-suite",
          language: sample.language,
          turn_count: turnIndex,
          current_mode: 1,
          chip_phase_floor: 0,
          greeting_phase_seen: 0,
          tools_completed: [],
          guides_completed: [],
          readiness_score: 0,
        },
        history,
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
  const [filter, setFilter] = useState<"all" | "fail" | "pass" | "followups">("all");

  const runSuite = useCallback(async () => {
    setStatus("running");
    setResults([]);
    setProgress(0);
    const collected: RunResult[] = [];
    let turnsCompleted = 0;

    for (let i = 0; i < TONE_TEST_SAMPLES.length; i++) {
      const sample = TONE_TEST_SAMPLES[i];
      // One stable session id per sample so follow-ups share context.
      const sessionId = `qa-tone-${sample.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      // Build the full turn list: cold-start + each follow-up.
      const turns = [sample.message, ...(sample.followUps ?? [])];
      const history: ChatMessage[] = [];

      for (let t = 0; t < turns.length; t++) {
        const userMessage = turns[t];
        const turnIndex = t + 1;
        const turnId = t === 0 ? sample.id : `${sample.id}:t${turnIndex}`;

        try {
          const { reply, durationMs } = await callSelena(
            sample,
            userMessage,
            sessionId,
            history,
            turnIndex
          );
          const evaluation = evaluateReply(reply, sample.language);
          collected.push({
            turnId,
            sample,
            turnIndex,
            userMessage,
            evaluation,
            durationMs,
          });
          history.push({ role: "user", content: userMessage });
          history.push({ role: "assistant", content: reply });
        } catch (err) {
          collected.push({
            turnId,
            sample,
            turnIndex,
            userMessage,
            error: err instanceof Error ? err.message : String(err),
            durationMs: 0,
          });
          // Stop the chain for this sample if a turn errors out.
          break;
        }

        turnsCompleted++;
        setResults([...collected]);
        setProgress(Math.round((turnsCompleted / TOTAL_TURN_COUNT) * 100));
        await new Promise((r) => setTimeout(r, 250));
      }
    }

    setStatus("complete");
  }, []);

  const summary = useMemo(() => {
    const total = results.length;
    const passed = results.filter((r) => r.evaluation?.passed).length;
    const failed = results.filter((r) => r.evaluation && !r.evaluation.passed).length;
    const errored = results.filter((r) => r.error).length;
    const followUpTurns = results.filter((r) => r.turnIndex > 1).length;
    const followUpFailed = results.filter(
      (r) => r.turnIndex > 1 && r.evaluation && !r.evaluation.passed
    ).length;
    const avgWords =
      results.length > 0
        ? Math.round(
            results.reduce((sum, r) => sum + (r.evaluation?.wordCount ?? 0), 0) /
              Math.max(results.length, 1)
          )
        : 0;
    return { total, passed, failed, errored, avgWords, followUpTurns, followUpFailed };
  }, [results]);

  const visibleResults = useMemo(() => {
    if (filter === "all") return results;
    if (filter === "fail")
      return results.filter((r) => r.error || (r.evaluation && !r.evaluation.passed));
    if (filter === "followups") return results.filter((r) => r.turnIndex > 1);
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
            Fires {TONE_TEST_SAMPLES.length} scenarios ({TOTAL_TURN_COUNT} total turns including
            multi-turn follow-ups) at selena-chat. Flags replies with KB-16 banned phrases, brevity
            violations (over 70 words or 3 sentences), or legacy brokerage mentions (Coldwell,
            MoxiWorks, Diamond Society). Follow-ups share session_id + history to test
            conversational drift. Language: {language}
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
                  `Run ${TONE_TEST_SAMPLES.length} scenarios (${TOTAL_TURN_COUNT} turns)`
                )}
              </Button>

              {status !== "idle" && (
                <div className="flex-1 min-w-[200px]">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {results.length} / {TOTAL_TURN_COUNT} turns complete
                  </p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-6 gap-3 text-sm">
                <SummaryStat label="Total turns" value={summary.total} />
                <SummaryStat label="Passed" value={summary.passed} tone="success" />
                <SummaryStat label="Failed" value={summary.failed} tone="destructive" />
                <SummaryStat label="Errored" value={summary.errored} tone="warning" />
                <SummaryStat
                  label="Follow-up fails"
                  value={`${summary.followUpFailed}/${summary.followUpTurns}`}
                  tone={summary.followUpFailed > 0 ? "destructive" : "success"}
                />
                <SummaryStat label="Avg words" value={summary.avgWords} />
              </div>
            )}

            {results.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <FilterButton current={filter} value="all" onClick={setFilter}>All</FilterButton>
                <FilterButton current={filter} value="fail" onClick={setFilter}>Failures only</FilterButton>
                <FilterButton current={filter} value="pass" onClick={setFilter}>Passes only</FilterButton>
                <FilterButton current={filter} value="followups" onClick={setFilter}>Follow-ups only</FilterButton>
              </div>
            )}
          </Card>

          {/* Results */}
          {visibleResults.length > 0 && (
            <Accordion type="multiple" className="space-y-3">
              {visibleResults.map((result) => {
                const failed = !!result.error || (result.evaluation && !result.evaluation.passed);
                const isFollowUp = result.turnIndex > 1;
                return (
                  <AccordionItem
                    key={result.turnId}
                    value={result.turnId}
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
                            {isFollowUp && (
                              <Badge className="bg-cc-navy text-white text-xs hover:bg-cc-navy">
                                Turn {result.turnIndex}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              #{result.turnId} · {Math.round(result.durationMs)}ms
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {result.userMessage}
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
                          {isFollowUp && (
                            <p className="text-xs text-muted-foreground">
                              Cold-start was: <span className="italic">"{result.sample.message}"</span>
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
                Click <strong>Run {TONE_TEST_SAMPLES.length} scenarios</strong> to start the regression.
                Total turns: {TOTAL_TURN_COUNT}. Expected runtime: ~{Math.ceil(TOTAL_TURN_COUNT * 2.5)}s.
              </p>
            </Card>
          )}
        </div>
      </section>
    </V2Layout>
  );
};

type FilterValue = "all" | "fail" | "pass" | "followups";

const SummaryStat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
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
  value: FilterValue;
  onClick: (v: FilterValue) => void;
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
