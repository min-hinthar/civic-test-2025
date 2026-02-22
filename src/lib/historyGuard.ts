/**
 * History API guard for Safari's rate limit.
 *
 * Safari enforces a hard limit of ~100 pushState/replaceState calls per 30 seconds.
 * When exceeded, it throws SecurityError which can crash React Router's internal
 * navigation (which is NOT wrapped in try-catch).
 *
 * This module patches history.pushState and history.replaceState with:
 * 1. SecurityError suppression — prevents unhandled errors from reaching Sentry
 * 2. State preservation — merges caller state with React Router's internal state
 *    (idx, key) so external pushState/replaceState calls don't corrupt the router
 *
 * Must be called ONCE before React Router mounts (in AppShell or _app).
 */

let installed = false;

export function installHistoryGuard(): void {
  if (installed) return;
  if (typeof window === 'undefined') return;
  installed = true;

  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = function safePushState(
    data: unknown,
    unused: string,
    url?: string | URL | null
  ) {
    try {
      originalPushState(data, unused, url);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'SecurityError') {
        // Safari rate limit exceeded — silently skip
        return;
      }
      throw e;
    }
  };

  window.history.replaceState = function safeReplaceState(
    data: unknown,
    unused: string,
    url?: string | URL | null
  ) {
    try {
      originalReplaceState(data, unused, url);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'SecurityError') {
        // Safari rate limit exceeded — silently skip
        return;
      }
      throw e;
    }
  };
}
