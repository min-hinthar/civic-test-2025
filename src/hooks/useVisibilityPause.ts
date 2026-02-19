import { useEffect } from 'react';

/**
 * Monitors document visibility changes to auto-pause/resume during
 * an active interview session.
 *
 * When the user switches tabs or backgrounds the app, `onHidden` is called
 * (pause audio, timer, etc.). When the tab becomes visible again, `onVisible`
 * is called (show "Resuming..." toast, restart playback).
 *
 * Only subscribes to the `visibilitychange` event when `active` is true.
 * Consumers should provide stable callback references (via `useCallback`)
 * to avoid unnecessary re-subscriptions.
 *
 * @param active - Whether visibility monitoring is active
 * @param onHidden - Called when tab becomes hidden (pause audio, timer)
 * @param onVisible - Called when tab becomes visible again (resume)
 */
export function useVisibilityPause(
  active: boolean,
  onHidden: () => void,
  onVisible: () => void
): void {
  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onHidden();
      } else {
        onVisible();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [active, onHidden, onVisible]);
}
