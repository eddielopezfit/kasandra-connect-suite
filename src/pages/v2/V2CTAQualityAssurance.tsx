import { useState, useCallback, useEffect } from "react";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useLanguage } from "@/contexts/LanguageContext";
import V2Layout from "@/components/v2/V2Layout";
import { ctaRegistry, type CTATestEntry } from "@/lib/qa/ctaRegistry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { CheckCircle2, XCircle, Clock, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { isQaAccessGranted } from "@/lib/qa/qaAccess";

// Guardrail 3: module-level comment — runtime gate is inside component (after hooks)

type TestResult = {
  status: 'untested' | 'pass' | 'fail';
  timestamp?: string;
  actual?: string;
};

const STORAGE_KEY = 'cta_qa_results';

const loadResults = (): Record<string, TestResult> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveResults = (results: Record<string, TestResult>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
};

const V2CTAQualityAssurance = () => {
  const { t } = useLanguage();
  useDocumentHead({
    titleEn: "CTA Quality Assurance | Internal",
    titleEs: "QA de CTAs | Interno",
    descriptionEn: "Internal CTA testing dashboard for quality assurance.",
    descriptionEs: "Panel interno de pruebas de CTAs para aseguramiento de calidad.",
  });
  const [results, setResults] = useState<Record<string, TestResult>>(loadResults);

  useEffect(() => { saveResults(results); }, [results]);

  const setResult = useCallback((id: string, status: 'pass' | 'fail', actual?: string) => {
    const ts = new Date().toISOString();
    const label = ctaRegistry.find(c => c.id === id)?.labelEn ?? id;
    const entry = ctaRegistry.find(c => c.id === id);
    const expected = entry?.expectedTarget ?? '?';

    console.info(`[CTA-QA] ${id} ${label} expected=${expected} actual=${actual ?? 'manual'} result=${status.toUpperCase()}`);

    setResults(prev => ({
      ...prev,
      [id]: { status, timestamp: ts, actual: actual ?? 'manual' },
    }));
  }, []);

  const runNavigationTest = useCallback((entry: CTATestEntry) => {
    window.open(entry.expectedTarget, '_blank');
    console.info(`[CTA-QA] ${entry.id} ${entry.labelEn} — opened ${entry.expectedTarget} in new tab for verification`);
    toast.info(`Opened ${entry.expectedTarget} in new tab. Mark pass/fail after verifying.`);
  }, []);

  const clearResults = useCallback(() => {
    setResults({});
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Results cleared');
  }, []);

  const exportResults = useCallback(() => {
    const exportData = ctaRegistry.map(entry => ({
      id: entry.id,
      group: entry.group,
      label: entry.labelEn,
      expected: entry.expectedTarget,
      ...(results[entry.id] ?? { status: 'untested' }),
    }));
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    toast.success('Results copied to clipboard');
  }, [results]);

  // Guardrail 3: hard gate AFTER all hooks
  if (!isQaAccessGranted()) {
    return null;
  }

  // Group by page
  const groups = ctaRegistry.reduce<Record<string, CTATestEntry[]>>((acc, entry) => {
    (acc[entry.group] ??= []).push(entry);
    return acc;
  }, {});

  const sorted = Object.entries(groups).sort(([, a], [, b]) =>
    (a[0]?.priority ?? 99) - (b[0]?.priority ?? 99)
  );

  const StatusIcon = ({ status }: { status: TestResult['status'] }) => {
    if (status === 'pass') return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (status === 'fail') return <XCircle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const passCount = Object.values(results).filter(r => r.status === 'pass').length;
  const failCount = Object.values(results).filter(r => r.status === 'fail').length;
  const total = ctaRegistry.length;

  return (
    <V2Layout>
      <section className="bg-cc-navy pt-32 pb-8">
        <div className="container mx-auto px-4">
          <h1 className="font-serif text-3xl font-bold text-white mb-2">CTA QA Runner</h1>
          <p className="text-white/70 text-sm">Dev-only. {total} CTAs registered. {passCount} pass, {failCount} fail, {total - passCount - failCount} untested.</p>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={exportResults} className="text-white border-white/30">
              <Copy className="h-3 w-3 mr-1" /> Export JSON
            </Button>
            <Button size="sm" variant="outline" onClick={clearResults} className="text-white border-white/30">
              Clear All
            </Button>
          </div>
        </div>
      </section>

      <section className="py-8 bg-cc-ivory">
        <div className="container mx-auto px-4">
          {sorted.map(([group, entries]) => (
            <div key={group} className="mb-8">
              <h2 className="font-serif text-xl font-bold text-cc-navy mb-3">{group}</h2>
              <div className="rounded-lg border bg-white overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">ID</TableHead>
                      <TableHead>Label</TableHead>
                      <TableHead className="hidden md:table-cell">Component</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-48">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map(entry => {
                      const r = results[entry.id] ?? { status: 'untested' as const };
                      return (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">{entry.labelEn}</div>
                            <div className="text-xs text-muted-foreground">{entry.labelEs}</div>
                            {entry.notes && (
                              <div className="text-xs text-amber-600 mt-0.5">⚠ {entry.notes}</div>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <code className="text-xs text-muted-foreground">{entry.component.replace('src/', '')}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {entry.expectedBehavior} → {entry.expectedTarget}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <StatusIcon status={r.status} />
                              <span className="text-xs">{r.status}</span>
                            </div>
                            {r.timestamp && (
                              <div className="text-[10px] text-muted-foreground mt-0.5">
                                {new Date(r.timestamp).toLocaleTimeString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {entry.automatable ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => runNavigationTest(entry)}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" /> Open
                                </Button>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">Manual</Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 text-green-700 hover:text-green-800"
                                onClick={() => setResult(entry.id, 'pass')}
                              >
                                ✓ Pass
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs h-7 text-red-700 hover:text-red-800"
                                onClick={() => setResult(entry.id, 'fail')}
                              >
                                ✗ Fail
                              </Button>
                            </div>
                            {entry.manualSteps && (
                              <p className="text-[10px] text-muted-foreground mt-1 max-w-[220px]">{entry.manualSteps}</p>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </V2Layout>
  );
};

export default V2CTAQualityAssurance;
