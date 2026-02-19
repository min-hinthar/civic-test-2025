import { useEffect, useCallback } from 'react';

/**
 * Intercepts browser back navigation during an active interview session.
 *
 * Pushes a dummy history state with an `interviewGuard` marker. When the user
 * presses the browser back button, the popstate handler detects the missing marker
 * and calls `onBackAttempt` (typically shows a confirmation dialog) before
 * re-pushing the guard state to stay on the page.
 *
 * Also adds a `beforeunload` listener to warn on page close/refresh.
 *
 * IMPORTANT: Works alongside hash routing (react-router-dom). The guard checks
 * `event.state` for the marker to distinguish a back press from normal hash
 * navigation — only intercepts when the marker state is missing.
 *
 * @param active - Whether the guard is currently active (true during interview)
 * @param onBackAttempt - Called when user presses back (show exit confirmation)
 */
export function useInterviewGuard(active: boolean, onBackAttempt: () => void): void {
  // Stable reference for the callback to avoid re-subscribing on every render
  const stableOnBackAttempt = useCallback(() => {
    onBackAttempt();
  }, [onBackAttempt]);

  useEffect(() => {
    if (!active) return;

    // Push a guard state onto the history stack
    const guardState = { interviewGuard: true };
    window.history.pushState(guardState, '');

    const handlePopState = (event: PopStateEvent) => {
      // Only intercept when our guard marker is NOT present in the popped state.
      // Hash routing also fires popstate, but with different state objects.
      // If the state has our marker, this is our own re-push — ignore it.
      const state = event.state as Record<string, unknown> | null;
      if (state && state.interviewGuard === true) {
        return;
      }

      // User pressed back (or navigated away from our guard state)
      // Re-push the guard to keep the user on the page
      window.history.pushState(guardState, '');
      stableOnBackAttempt();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Show browser's default "Leave site?" dialog
      event.preventDefault();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Clean up the dummy history entry if our guard state is still on the stack.
      // Check current state before calling history.back() to avoid popping a
      // non-guard entry.
      const currentState = window.history.state as Record<string, unknown> | null;
      if (currentState && currentState.interviewGuard === true) {
        window.history.back();
      }
    };
  }, [active, stableOnBackAttempt]);
}
