import { useNavigationGuard } from './useNavigationGuard';

/**
 * Intercepts browser back navigation during an active interview session.
 *
 * Thin wrapper around useNavigationGuard with markerKey 'interviewGuard'.
 * Pushes a marked history state when active, intercepts popstate events,
 * and shows beforeunload warning.
 *
 * @param active - Whether the guard is currently active (true during interview)
 * @param onBackAttempt - Called when user presses back (show exit confirmation)
 */
export function useInterviewGuard(active: boolean, onBackAttempt: () => void): void {
  useNavigationGuard({
    active,
    onBackAttempt,
    markerKey: 'interviewGuard',
  });
}
