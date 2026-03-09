/**
 * Panel E: ActionSpec Resolution Smoke Test
 * Select a guide → see its resolved ActionSpecs + validity.
 * "Simulate Click" shows what would happen without executing navigation.
 */

import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, AlertTriangle, Play } from 'lucide-react';
import { GUIDE_REGISTRY, getGuideById } from '@/lib/guides/guideRegistry';
import { isActionValid, type ActionSpec } from '@/lib/actions/actionSpec';
import { isQaAccessGranted } from '@/lib/qa/qaAccess';

// Internal route maps (duplicated read-only for display — no behavior change)
const TOOL_ROUTES: Record<string, string> = { 'buyer-readiness': '/buyer-readiness', 'cash-readiness': '/cash-readiness', 'seller-readiness': '/seller-readiness' };
const CALC_ROUTES: Record<string, string> = { 'cash-comparison': '/cash-offer-options' };

/** Describe what resolveAction would do — without executing it */
function describeResolution(spec: ActionSpec): string {
  switch (spec.type) {
    case 'open_guide': return `Navigate to /v2/guides/${spec.guideId}`;
    case 'open_tool': return `Navigate to ${TOOL_ROUTES[spec.toolId] ?? `[unknown tool: ${spec.toolId}]`}`;
    case 'run_calculator': return `Navigate to ${CALC_ROUTES[spec.calculatorId] ?? `[unknown calc: ${spec.calculatorId}]`}`;
    case 'open_chat': return `Open Selena chat (source: ${spec.payload.source})`;
    case 'navigate': return `Navigate to ${spec.path}`;
    case 'book': return 'Navigate to /v2/book';
    case 'call_contact': return `Open tel:${spec.phone}`;
    case 'external_link': return `Open ${spec.url} (new tab)`;
    default: return 'Unknown action type';
  }
}

const ActionSpecCard = ({ spec, label }: { spec: ActionSpec; label: string }) => {
  const [showSimulation, setShowSimulation] = useState(false);
  const valid = isActionValid(spec);

  return (
    <div className="rounded-lg border p-3 bg-card space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium">{label}</span>
        {valid ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px]">
            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Valid
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-[10px]">
            <XCircle className="h-3 w-3 mr-0.5" /> Invalid — Would be omitted (No-Action-No-Render)
          </Badge>
        )}
      </div>

      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto font-mono">
        {JSON.stringify(spec, null, 2)}
      </pre>

      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => setShowSimulation(!showSimulation)}
      >
        <Play className="h-3 w-3 mr-1" /> {showSimulation ? 'Hide' : 'Simulate Click'}
      </Button>

      {showSimulation && (
        <div className="rounded border p-2 bg-muted/50 text-xs">
          <span className="text-muted-foreground">Would execute: </span>
          <span className="font-mono">
            {valid ? describeResolution(spec) : '⛔ Action omitted — failed validation'}
          </span>
        </div>
      )}
    </div>
  );
};

const ActionSpecSmokeTestPanel = () => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>('');
  const [manualGuideId, setManualGuideId] = useState('');

  const selectedGuide = useMemo(
    () => selectedGuideId ? getGuideById(selectedGuideId) : undefined,
    [selectedGuideId]
  );

  const manualGuideExists = useMemo(
    () => manualGuideId ? getGuideById(manualGuideId) : undefined,
    [manualGuideId]
  );

  const manualActionSpec: ActionSpec | null = useMemo(() => {
    if (!manualGuideId) return null;
    return {
      type: 'open_guide' as const,
      guideId: manualGuideId,
      label: { en: 'Test', es: 'Prueba' },
    };
  }, [manualGuideId]);

  // Gate AFTER hooks to preserve React hook order.
  if (!isQaAccessGranted()) return null;

  return (
    <div className="space-y-6">
      {/* Guide selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select a guide from registry</label>
        <Select value={selectedGuideId} onValueChange={setSelectedGuideId}>
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Choose a guide..." />
          </SelectTrigger>
          <SelectContent>
            {GUIDE_REGISTRY.map(g => (
              <SelectItem key={g.id} value={g.id}>
                {g.id} — {g.labelEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected guide details */}
      {selectedGuide && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            {selectedGuide.labelEn}
            <Badge variant="outline" className="ml-2 text-[10px]">
              {selectedGuide.category} / tier {selectedGuide.tier}
            </Badge>
          </h4>

          <ActionSpecCard
            spec={selectedGuide.destinations.primaryAction}
            label="Primary Action"
          />

          {selectedGuide.destinations.secondaryActions.map((action, i) => (
            <ActionSpecCard
              key={i}
              spec={action}
              label={`Secondary Action ${i + 1}`}
            />
          ))}

          {selectedGuide.destinations.relatedGuideIds.length > 0 && (
            <div className="rounded-lg border p-3 bg-card">
              <span className="text-sm font-medium">Related Guide IDs</span>
              <div className="flex gap-1.5 flex-wrap mt-2">
                {selectedGuide.destinations.relatedGuideIds.map(id => {
                  const exists = !!getGuideById(id);
                  return (
                    <Badge
                      key={id}
                      variant={exists ? 'outline' : 'destructive'}
                      className="text-xs font-mono"
                    >
                      {id} {exists ? '✓' : '✗ missing'}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual guide ID test */}
      <div className="border-t pt-4 space-y-2">
        <label className="text-sm font-medium">Manual Guide ID Test</label>
        <p className="text-xs text-muted-foreground">
          Type any guide ID to test if open_guide ActionSpec would be valid.
        </p>
        <input
          type="text"
          value={manualGuideId}
          onChange={e => setManualGuideId(e.target.value)}
          placeholder="e.g. first-time-buyer-guide"
          className="flex h-9 w-full max-w-md rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {manualGuideId && manualActionSpec && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs">getGuideById("{manualGuideId}"):</span>
              {manualGuideExists ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px]">
                  Found — {manualGuideExists.labelEn}
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px]">
                  Not found in registry
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">isActionValid(open_guide):</span>
              {isActionValid(manualActionSpec) ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" /> Would render
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-[10px]">
                  <AlertTriangle className="h-3 w-3 mr-0.5" /> Would be omitted (No-Action-No-Render)
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionSpecSmokeTestPanel;
