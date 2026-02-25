/**
 * Panel B: Last Events Viewer
 * Reads from DEV-only in-memory ring buffer.
 * Shows event_type + timestamp + payload key names only (never values).
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import { getDevEventBuffer } from '@/lib/analytics/logEvent';

const LastEventsPanel = () => {
  const [events, setEvents] = useState(() => [...getDevEventBuffer()].reverse());

  const refresh = useCallback(() => {
    setEvents([...getDevEventBuffer()].reverse());
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {events.length} events buffered (DEV only, metadata + key names only)
        </p>
        <Button size="sm" variant="outline" onClick={refresh} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No events captured yet. Navigate around the site to generate events.
        </p>
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs w-48">Event Type</TableHead>
                <TableHead className="text-xs w-44">Timestamp</TableHead>
                <TableHead className="text-xs">Payload Keys</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((evt, i) => (
                <TableRow key={`${evt.timestamp}-${i}`}>
                  <TableCell className="text-xs font-mono py-1.5">
                    <Badge variant="outline" className="text-xs">{evt.event_type}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-1.5">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="text-xs font-mono py-1.5 text-muted-foreground">
                    {evt.payload_keys.length > 0 ? evt.payload_keys.join(', ') : '—'}
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

export default LastEventsPanel;
