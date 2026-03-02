/**
 * Guard Telemetry Buffer (DEV-only)
 * Captures guard_overlay, containment_active, vulnerability_signal_count,
 * emotional posture, and violations from Selena chat responses.
 * Ring buffer of last 30 entries — metadata only, never PII.
 */

export interface GuardTelemetryEntry {
  timestamp: string;
  turn: number;
  mode: number | null;
  mode_name: string | null;
  guard_overlay: string | null;
  containment_active: boolean;
  vulnerability_signal_count: number;
  emotional_posture: string | null;
  escalation_level: string | null;
  violations: string[];
  chip_count: number;
  reply_length: number;
}

const BUFFER: GuardTelemetryEntry[] = [];
const MAX_SIZE = 30;

/**
 * Push a guard telemetry entry from a chat response.
 * No-op in production.
 */
export function pushGuardTelemetry(data: Record<string, unknown>): void {
  if (!import.meta.env.DEV) return;

  const violations = Array.isArray(data.guard_violations)
    ? (data.guard_violations as Array<{ rule: string; action: string }>).map(
        (v) => `${v.rule}:${v.action}`
      )
    : [];

  BUFFER.push({
    timestamp: new Date().toISOString(),
    turn: typeof data.turn_count === 'number' ? data.turn_count : BUFFER.length + 1,
    mode: typeof data.current_mode === 'number' ? data.current_mode : null,
    mode_name: typeof data.mode_name === 'string' ? data.mode_name : null,
    guard_overlay: typeof data.guard_overlay === 'string' ? data.guard_overlay : null,
    containment_active: data.containment_active === true,
    vulnerability_signal_count:
      typeof data.vulnerability_signal_count === 'number'
        ? data.vulnerability_signal_count
        : 0,
    emotional_posture:
      typeof data.guard_emotional_posture === 'string'
        ? data.guard_emotional_posture
        : null,
    escalation_level:
      typeof data.guard_escalation_level === 'string'
        ? data.guard_escalation_level
        : null,
    violations,
    chip_count: Array.isArray(data.suggestedReplies)
      ? data.suggestedReplies.length
      : 0,
    reply_length: typeof data.reply === 'string' ? data.reply.length : 0,
  });

  if (BUFFER.length > MAX_SIZE) BUFFER.shift();
}

/**
 * Returns a frozen copy of the buffer (newest first).
 * Empty in production.
 */
export function getGuardTelemetryBuffer(): readonly GuardTelemetryEntry[] {
  return Object.freeze([...BUFFER].reverse());
}
