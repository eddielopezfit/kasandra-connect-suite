/**
 * VIPProviderLazy — Defers loading the full VIPContext module + its heavy deps
 * (snapshot writer, CRM sync, selectors) until after first paint.
 *
 * Strategy:
 *  - On mount, render children inside a stub provider (no real context value).
 *    Components that consume VIP via useVIP() fall back gracefully (the hook
 *    already handles missing context with buildVIPFromLocal).
 *  - After idle, dynamically import the real VIPProvider and swap it in.
 *  - This removes ~all VIP code from the homepage critical path.
 */
import { useEffect, useState, startTransition, type ReactNode, type ComponentType } from "react";

type ProviderProps = { children: ReactNode };
type RealProvider = ComponentType<ProviderProps>;

export function VIPProvider({ children }: ProviderProps) {
  const [Real, setReal] = useState<RealProvider | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      import("@/contexts/VIPContext")
        .then((m) => {
          if (!cancelled) {
            startTransition(() => setReal(() => m.VIPProvider));
          }
        })
        .catch(() => {
          /* silent — fallback path in useVIP keeps the app functional */
        });
    };

    // Defer to idle so it never competes with first paint
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    };
    if (typeof w.requestIdleCallback === "function") {
      w.requestIdleCallback(load, { timeout: 2000 });
    } else {
      setTimeout(load, 200);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  if (Real) return <Real>{children}</Real>;
  return <>{children}</>;
}
