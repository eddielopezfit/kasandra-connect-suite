import { useEffect, useMemo, useState } from "react";
import { X, FlaskConical, Copy, Check } from "lucide-react";
import { clearQaSession, setQaSession, getQaSessionId } from "./qaSession";
import { getOrCreateSessionId } from "@/lib/analytics/selenaSession";

const isDev = import.meta.env.DEV;

export default function QaSessionToggle() {
  const [open, setOpen] = useState(false);
  const [override, setOverride] = useState("");
  const [copied, setCopied] = useState(false);

  const currentSessionId = useMemo(() => getOrCreateSessionId(), []);
  const activeOverride = useMemo(() => getQaSessionId(), [open]);

  useEffect(() => {
    setOverride(activeOverride || currentSessionId);
  }, [activeOverride, currentSessionId]);

  if (!isDev) return null;

  const apply = () => {
    const sid = override.trim();
    if (!sid) return;
    setQaSession(sid);
    window.location.reload();
  };

  const clear = () => {
    clearQaSession();
    window.location.reload();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(activeOverride || currentSessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-cc-navy text-white px-4 py-2 shadow-lg hover:opacity-90 transition-opacity text-sm font-medium"
        >
          <FlaskConical className="w-4 h-4" />
          QA
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-cc-sand-dark/30 p-4 w-80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-cc-navy text-sm">QA Session</h4>
              <p className="text-[10px] text-cc-muted">DEV-only override for deterministic tests</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-cc-sand/40 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-cc-charcoal" />
            </button>
          </div>

          <div className="text-xs text-cc-charcoal mb-2">
            Active:{" "}
            <span className="font-mono text-cc-gold">{activeOverride || "(none)"}</span>
          </div>

          <div className="mb-3">
            <label className="text-xs text-cc-muted">Set override session_id</label>
            <input
              value={override}
              onChange={(e) => setOverride(e.target.value)}
              className="mt-1 w-full rounded-lg border border-cc-sand-dark/30 px-3 py-2 text-sm font-mono text-cc-charcoal focus:outline-none focus:ring-2 focus:ring-cc-gold/40"
              placeholder="test_sid_ui_happy_es_1"
            />
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={apply}
              className="flex-1 rounded-lg bg-cc-navy text-white text-xs py-2 font-medium hover:opacity-90 transition-opacity"
            >
              Apply + Reload
            </button>
            <button
              onClick={copy}
              className="rounded-lg border border-cc-sand-dark/30 p-2 hover:bg-cc-sand/40 transition-colors"
              aria-label="Copy session ID"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-cc-charcoal" />}
            </button>
          </div>

          <button
            onClick={clear}
            className="w-full text-xs text-cc-muted underline hover:text-cc-charcoal transition-colors py-1"
          >
            Clear override + Reload
          </button>

          <p className="text-[10px] text-cc-muted mt-2 font-mono truncate">
            Current: {currentSessionId}
          </p>
        </div>
      )}
    </div>
  );
}
