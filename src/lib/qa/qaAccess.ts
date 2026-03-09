/**
 * Internal QA access helper.
 *
 * Grants QA route/panel access in DEV, or in production when the URL contains
 * the secured query param `?qa=PSG2026`.
 *
 * The param is checked once on app mount and persisted in sessionStorage so
 * navigation doesn't require the param on every route.
 *
 * No UI surfaces this mechanism; we also remove the param from the URL after capture.
 */

const QA_PARAM_NAME = 'qa';
const QA_PARAM_VALUE = 'PSG2026';
const QA_SESSION_KEY = 'selena_qa_access';

function canUseBrowserApis(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

export function initQaAccess(): void {
  if (!canUseBrowserApis()) return;

  // DEV always allowed; don't mutate URL/session.
  if (import.meta.env.DEV) return;

  try {
    if (sessionStorage.getItem(QA_SESSION_KEY) === '1') return;

    const url = new URL(window.location.href);
    const token = url.searchParams.get(QA_PARAM_NAME);
    if (token !== QA_PARAM_VALUE) return;

    // Persist for this tab/session.
    sessionStorage.setItem(QA_SESSION_KEY, '1');

    // Strip the param so we don't leave an obvious breadcrumb in the address bar/history.
    url.searchParams.delete(QA_PARAM_NAME);
    const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
    window.history.replaceState({}, '', next);
  } catch {
    // noop
  }
}

export function isQaAccessGranted(): boolean {
  if (import.meta.env.DEV) return true;
  if (!canUseBrowserApis()) return false;
  return sessionStorage.getItem(QA_SESSION_KEY) === '1';
}
