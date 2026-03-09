/**
 * Panel A: Session Context Snapshot
 * Reads localStorage keys and displays session state.
 * Privacy banding: sensitive numeric fields shown as ranges.
 */

import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { isQaAccessGranted } from '@/lib/qa/qaAccess';

const CONTEXT_KEY = 'selena_context_v2';
const SESSION_KEY = 'selena_session_id';
const LEAD_KEY = 'selena_lead_id';
const LANG_KEY = 'kasandra-language';

/** Band a number into a privacy-safe range string */
function bandValue(val: number | undefined | null): string {
  if (val == null) return '—';
  if (val < 100_000) return '<$100k';
  if (val < 200_000) return '$100k–$200k';
  if (val < 300_000) return '$200k–$300k';
  if (val < 500_000) return '$300k–$500k';
  if (val < 750_000) return '$500k–$750k';
  return '$750k+';
}

// Fields to display, with optional privacy banding
const DISPLAY_FIELDS: Array<{
  key: string;
  label: string;
  band?: boolean;
}> = [
  { key: 'chip_phase_floor', label: 'Chip Phase Floor' },
  { key: 'greeting_phase_seen', label: 'Greeting Phase Seen' },
  { key: 'intent', label: 'Intent' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'situation', label: 'Situation' },
  { key: 'condition', label: 'Condition' },
  { key: 'current_mode', label: 'Current Mode' },
  { key: 'tool_used', label: 'Tool Used' },
  { key: 'last_tool_result', label: 'Last Tool Result' },
  { key: 'last_guide_id', label: 'Last Guide ID' },
  { key: 'guides_read', label: 'Guides Read' },
  { key: 'quiz_completed', label: 'Quiz Completed' },
  { key: 'quiz_result_path', label: 'Quiz Result Path' },
  { key: 'has_booked', label: 'Has Booked' },
  { key: 'has_viewed_report', label: 'Has Viewed Report' },
  { key: 'turn_count', label: 'Turn Count' },
  { key: 'entry_source', label: 'Entry Source' },
  { key: 'entry_guide_id', label: 'Entry Guide ID' },
  { key: 'estimated_value', label: 'Estimated Value', band: true },
  { key: 'calculator_difference', label: 'Calculator Difference', band: true },
  { key: 'calculator_advantage', label: 'Calculator Advantage' },
  { key: 'readiness_score', label: 'Readiness Score' },
  { key: 'ad_funnel_source', label: 'Ad Funnel Source' },
  { key: 'timeline_confidence', label: 'Timeline Confidence' },
];

function readSnapshot() {
  try {
    const raw = localStorage.getItem(CONTEXT_KEY);
    const ctx = raw ? JSON.parse(raw) : {};
    return {
      sessionId: localStorage.getItem(SESSION_KEY) ?? '—',
      leadId: localStorage.getItem(LEAD_KEY) ?? '—',
      language: localStorage.getItem(LANG_KEY) ?? '—',
      context: ctx,
    };
  } catch {
    return { sessionId: '—', leadId: '—', language: '—', context: {} };
  }
}

const SessionContextPanel = () => {
  const [data, setData] = useState(readSnapshot);

  const refresh = useCallback(() => setData(readSnapshot()), []);

  // Gate AFTER hooks to preserve React hook order.
  if (!isQaAccessGranted()) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Identity Keys</h3>
        <Button size="sm" variant="outline" onClick={refresh} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded border p-2">
          <span className="text-muted-foreground">session_id</span>
          <p className="font-mono truncate">{data.sessionId}</p>
        </div>
        <div className="rounded border p-2">
          <span className="text-muted-foreground">lead_id</span>
          <p className="font-mono truncate">{data.leadId}</p>
        </div>
        <div className="rounded border p-2">
          <span className="text-muted-foreground">language</span>
          <p className="font-mono">{data.language}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Field</TableHead>
              <TableHead className="text-xs">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DISPLAY_FIELDS.map(({ key, label, band }) => {
              const val = data.context[key];
              const display = band
                ? bandValue(typeof val === 'number' ? val : undefined)
                : val === undefined || val === null
                  ? '—'
                  : String(val);
              return (
                <TableRow key={key}>
                  <TableCell className="text-xs font-medium py-1.5">{label}</TableCell>
                  <TableCell className="text-xs font-mono py-1.5">
                    {display === '—' ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <Badge variant="outline" className="text-xs font-mono">{display}</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SessionContextPanel;
