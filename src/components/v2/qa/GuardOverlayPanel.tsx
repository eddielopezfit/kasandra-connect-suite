/**
 * Panel F: Guard Overlay Telemetry
 * Shows recent guard_overlay values from Selena chat responses.
 * DEV-only — reads from in-memory ring buffer.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';
import { getGuardTelemetryBuffer } from '@/lib/analytics/guardTelemetry';
import { isQaAccessGranted } from '@/lib/qa/qaAccess';

const GuardOverlayPanel = () => {
  const [entries, setEntries] = useState(() => [...getGuardTelemetryBuffer()]);

  const refresh = useCallback(() => {
    setEntries([...getGuardTelemetryBuffer()]);
  }, []);

  const containmentCount = entries.filter((e) => e.containment_active).length;

  // Gate AFTER hooks to preserve React hook order.
  if (!isQaAccessGranted()) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {entries.length} responses captured
          </p>
          {containmentCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              <ShieldAlert className="h-3 w-3 mr-1" />
              {containmentCount} containment
            </Badge>
          )}
          {containmentCount === 0 && entries.length > 0 && (
            <Badge variant="outline" className="text-xs text-green-700 border-green-300">
              <ShieldCheck className="h-3 w-3 mr-1" />
              No containment triggered
            </Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={refresh} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No chat responses captured yet. Open Selena and send a message to generate data.
        </p>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-16">Turn</TableHead>
                <TableHead className="text-xs w-20">Mode</TableHead>
                <TableHead className="text-xs w-28">Overlay</TableHead>
                <TableHead className="text-xs w-24">Posture</TableHead>
                <TableHead className="text-xs w-16">Vuln#</TableHead>
                <TableHead className="text-xs w-20">Reply len</TableHead>
                <TableHead className="text-xs">Violations</TableHead>
                <TableHead className="text-xs w-24">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, i) => (
                <TableRow
                  key={`${entry.timestamp}-${i}`}
                  className={entry.containment_active ? 'bg-destructive/5' : ''}
                >
                  <TableCell className="text-xs font-mono py-1.5">
                    {entry.turn}
                  </TableCell>
                  <TableCell className="text-xs py-1.5">
                    {entry.mode_name ? (
                      <Badge variant="outline" className="text-xs">
                        {entry.mode}:{entry.mode_name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs py-1.5">
                    {entry.guard_overlay ? (
                      <Badge variant="destructive" className="text-xs">
                        {entry.guard_overlay}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                        none
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono py-1.5">
                    {entry.emotional_posture ?? '—'}
                  </TableCell>
                  <TableCell className="text-xs font-mono py-1.5">
                    {entry.vulnerability_signal_count}
                  </TableCell>
                  <TableCell className="text-xs font-mono py-1.5">
                    {entry.reply_length}
                  </TableCell>
                  <TableCell className="text-xs font-mono py-1.5">
                    {entry.violations.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {entry.violations.map((v, vi) => (
                          <Badge key={vi} variant="secondary" className="text-[10px]">
                            {v}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-1.5">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default GuardOverlayPanel;
