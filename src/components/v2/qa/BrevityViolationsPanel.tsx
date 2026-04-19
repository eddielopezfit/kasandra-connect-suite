/**
 * Brevity Violations Panel — QA dashboard widget that surfaces
 * selena_brevity_truncated events from the last 24h.
 *
 * Calls the qa-brevity-stats edge function (service-role aggregation,
 * since event_log denies public SELECT). No PII is returned.
 */
import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

interface IntentRow {
  intent: string;
  count: number;
  avg_word_delta: number;
}

interface BrevityStats {
  window_hours: number;
  count: number;
  avg_word_delta: number;
  avg_sentence_delta: number;
  by_intent: IntentRow[];
  by_language: Record<string, number>;
  by_route: Record<string, number>;
  last_violation_at: string | null;
}

export const BrevityViolationsPanel = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BrevityStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/qa-brevity-stats`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: "{}",
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as BrevityStats;
      setStats(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const hasViolations = (stats?.count ?? 0) > 0;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-cc-navy flex items-center gap-2">
            {hasViolations ? (
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            Brevity Violations (last 24h)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Tracks <code className="text-[11px]">selena_brevity_truncated</code> events from the
            70-word post-processor cap. High counts may signal prompt drift.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchStats}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-3">
          Failed to load: {error}
        </div>
      )}

      {!error && !stats && !loading && (
        <p className="text-sm text-muted-foreground">No data.</p>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <Stat label="Truncations" value={stats.count} tone={hasViolations ? "warning" : "success"} />
            <Stat label="Avg word Δ" value={stats.avg_word_delta} suffix="w" />
            <Stat label="Avg sentence Δ" value={stats.avg_sentence_delta} suffix="s" />
            <Stat
              label="Last event"
              value={
                stats.last_violation_at
                  ? new Date(stats.last_violation_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"
              }
            />
          </div>

          {stats.by_intent.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                By intent
              </h3>
              <div className="space-y-1.5">
                {stats.by_intent.map((row) => (
                  <div
                    key={row.intent}
                    className="flex items-center justify-between text-sm border-b border-border/50 pb-1.5"
                  >
                    <span className="font-medium text-cc-navy">{row.intent}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>avg −{row.avg_word_delta}w</span>
                      <Badge variant="outline" className="font-mono">
                        {row.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(Object.keys(stats.by_language).length > 0 ||
            Object.keys(stats.by_route).length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {Object.keys(stats.by_language).length > 0 && (
                <div>
                  <h3 className="font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    By language
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(stats.by_language).map(([lang, n]) => (
                      <Badge key={lang} variant="secondary" className="font-mono">
                        {lang}: {n}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {Object.keys(stats.by_route).length > 0 && (
                <div>
                  <h3 className="font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Top routes
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(stats.by_route)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([route, n]) => (
                        <Badge key={route} variant="secondary" className="font-mono">
                          {route}: {n}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

const Stat = ({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  tone?: "success" | "warning" | "destructive";
}) => {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "warning"
        ? "text-amber-700"
        : tone === "destructive"
          ? "text-destructive"
          : "text-cc-navy";
  return (
    <div className="border border-border rounded-md p-3 bg-cc-ivory/50">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold ${toneClass}`}>
        {value}
        {suffix && <span className="text-sm font-normal ml-0.5">{suffix}</span>}
      </div>
    </div>
  );
};
