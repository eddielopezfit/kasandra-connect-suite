/**
 * Panel D: GUIDE_REGISTRY Validation
 * Pure read-only validation over the guide registry.
 * Checks: duplicates, missing fields, invalid ActionSpecs, broken refs.
 * Also warns about AuthorityCTABlock category-level override gap.
 */

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import {
  GUIDE_REGISTRY,
  getGuideById,
} from '@/lib/guides/guideRegistry';
import { isActionValid, KNOWN_TOOLS } from '@/lib/actions/actionSpec';

interface ValidationIssue {
  guideId: string;
  rule: string;
  detail: string;
  severity: 'error' | 'warning';
}

function runValidation(): { issues: ValidationIssue[]; passed: number; total: number } {
  const issues: ValidationIssue[] = [];
  let checksRun = 0;

  // 1. Duplicate IDs
  const ids = GUIDE_REGISTRY.map(g => g.id);
  const seen = new Set<string>();
  for (const id of ids) {
    checksRun++;
    if (seen.has(id)) {
      issues.push({ guideId: id, rule: 'duplicate_id', detail: `ID "${id}" appears more than once`, severity: 'error' });
    }
    seen.add(id);
  }

  for (const guide of GUIDE_REGISTRY) {
    // 2. Missing path
    checksRun++;
    if (!guide.path || guide.path.trim() === '') {
      issues.push({ guideId: guide.id, rule: 'missing_path', detail: 'Path is empty or missing', severity: 'error' });
    }

    // 3. Missing primaryAction
    checksRun++;
    if (!guide.destinations?.primaryAction) {
      issues.push({ guideId: guide.id, rule: 'missing_primary_action', detail: 'destinations.primaryAction is undefined', severity: 'error' });
    } else {
      // 4. Invalid primaryAction ActionSpec
      checksRun++;
      if (!isActionValid(guide.destinations.primaryAction)) {
        issues.push({
          guideId: guide.id,
          rule: 'invalid_primary_action',
          detail: `primaryAction type="${guide.destinations.primaryAction.type}" failed isActionValid()`,
          severity: 'error',
        });
      }

      // 4b. open_guide pointing to missing guide
      if (guide.destinations.primaryAction.type === 'open_guide') {
        checksRun++;
        const target = (guide.destinations.primaryAction as { guideId: string }).guideId;
        if (!getGuideById(target)) {
          issues.push({
            guideId: guide.id,
            rule: 'open_guide_missing_target',
            detail: `primaryAction open_guide targets "${target}" which doesn't exist in registry`,
            severity: 'error',
          });
        }
      }

      // 4c. open_tool pointing to unknown tool
      if (guide.destinations.primaryAction.type === 'open_tool') {
        checksRun++;
        const toolId = (guide.destinations.primaryAction as { toolId: string }).toolId;
        if (!(KNOWN_TOOLS as readonly string[]).includes(toolId)) {
          issues.push({
            guideId: guide.id,
            rule: 'open_tool_unknown',
            detail: `primaryAction open_tool targets "${toolId}" which is not in KNOWN_TOOLS`,
            severity: 'error',
          });
        }
      }

      // 4d. external_link not https
      if (guide.destinations.primaryAction.type === 'external_link') {
        checksRun++;
        const url = (guide.destinations.primaryAction as { url: string }).url;
        if (!url.startsWith('https://')) {
          issues.push({
            guideId: guide.id,
            rule: 'external_link_not_https',
            detail: `primaryAction external_link URL does not start with https://`,
            severity: 'error',
          });
        }
      }
    }

    // 5. Validate secondaryActions
    for (let i = 0; i < (guide.destinations?.secondaryActions?.length ?? 0); i++) {
      const action = guide.destinations.secondaryActions[i];
      checksRun++;
      if (!isActionValid(action)) {
        issues.push({
          guideId: guide.id,
          rule: 'invalid_secondary_action',
          detail: `secondaryActions[${i}] type="${action.type}" failed isActionValid()`,
          severity: 'error',
        });
      }
    }

    // 6. Related guide ID validity
    for (const relId of guide.destinations?.relatedGuideIds ?? []) {
      checksRun++;
      if (!getGuideById(relId)) {
        issues.push({
          guideId: guide.id,
          rule: 'related_guide_missing',
          detail: `relatedGuideIds references "${relId}" which doesn't exist in registry`,
          severity: 'error',
        });
      }
    }

    // 7. AuthorityCTABlock category-level override warning
    checksRun++;
    if (guide.destinations?.primaryAction) {
      const actionType = guide.destinations.primaryAction.type;
      // Check if registry says open_tool/run_calculator but category might override
      if (actionType === 'open_tool' || actionType === 'run_calculator') {
        issues.push({
          guideId: guide.id,
          rule: 'authority_cta_override_risk',
          detail: `Guide has ${actionType} in registry but AuthorityCTABlock may override based on category "${guide.category}" defaults`,
          severity: 'warning',
        });
      }
    }
  }

  const passed = checksRun - issues.filter(i => i.severity === 'error').length;
  return { issues, passed, total: checksRun };
}

const GuideRegistryValidationPanel = () => {
  const [result] = useState(runValidation);

  const errors = result.issues.filter(i => i.severity === 'error');
  const warnings = result.issues.filter(i => i.severity === 'warning');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {GUIDE_REGISTRY.length} guides registered
        </Badge>
        <Badge variant="outline" className="text-xs">
          {result.total} checks run
        </Badge>
        {errors.length === 0 ? (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
            <CheckCircle2 className="h-3 w-3 mr-1" /> {result.passed} passed
          </Badge>
        ) : (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="h-3 w-3 mr-1" /> {errors.length} errors
          </Badge>
        )}
        {warnings.length > 0 && (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" /> {warnings.length} warnings
          </Badge>
        )}
      </div>

      {/* Issues table */}
      {result.issues.length > 0 ? (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Severity</TableHead>
                <TableHead className="text-xs">Guide ID</TableHead>
                <TableHead className="text-xs">Rule</TableHead>
                <TableHead className="text-xs">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.issues.map((issue, i) => (
                <TableRow key={`${issue.guideId}-${issue.rule}-${i}`}>
                  <TableCell className="py-1.5">
                    {issue.severity === 'error' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-xs font-mono py-1.5">{issue.guideId}</TableCell>
                  <TableCell className="text-xs py-1.5">
                    <Badge variant="outline" className="text-[10px]">{issue.rule}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground py-1.5 max-w-xs">{issue.detail}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-sm text-green-700 py-4 text-center">
          All registry checks passed. No issues found.
        </p>
      )}
    </div>
  );
};

export default GuideRegistryValidationPanel;
