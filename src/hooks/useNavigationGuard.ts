import { useEffect, useCallback } from 'react';

interface NavigationGuardOptions {
  /** Whether the guard is currently active */
  active: boolean;
  /** Called when user attempts to navigate back during active session */
  onBackAttempt: () => void;
  /** Unique marker key to identify this guard's history state */
  markerKey: string;
}

/**
 * Unified navigation guard for back-button interception during active sessions.
 * Used by TestPage (markerKey: 'navLock') and InterviewPage (markerKey: 'interviewGuard').
 *
 * Pushes a marked history entry when active, intercepts popstate events,
 * and shows beforeunload warning.
 */
export function useNavigationGuard({ active, onBackAttempt, markerKey }: NavigationGuardOptions) {
  const stableOnBackAttempt = useCallback(() => {
    onBackAttempt();
  }, [onBackAttempt]);

  useEffect(() => {
    if (!active) return;

    const guardState = { [markerKey]: true };
    window.history.pushState(guardState, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as Record<string, unknown> | null;
      if (state && state[markerKey] === true) return;
      window.history.pushState(guardState, '');
      stableOnBackAttempt();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const currentState = window.history.state as Record<string, unknown> | null;
      if (currentState && currentState[markerKey] === true) {
        window.history.back();
      }
    };
  }, [active, stableOnBackAttempt, markerKey]);
}
