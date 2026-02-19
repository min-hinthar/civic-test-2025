import { useState, useEffect } from 'react';

/**
 * Extended ScreenOrientation interface including the lock/unlock methods.
 * TypeScript's built-in DOM lib omits `lock()` because it requires user
 * activation and is not universally supported. We type it here for safe usage.
 */
interface ScreenOrientationWithLock extends ScreenOrientation {
  lock(
    orientation:
      | 'portrait'
      | 'landscape'
      | 'any'
      | 'natural'
      | 'portrait-primary'
      | 'portrait-secondary'
      | 'landscape-primary'
      | 'landscape-secondary'
  ): Promise<void>;
  unlock(): void;
}

/** Type guard: checks if `screen.orientation.lock` exists at runtime */
function hasOrientationLock(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    'orientation' in screen &&
    typeof (screen.orientation as ScreenOrientationWithLock).lock === 'function'
  );
}

/** Get the orientation object with the lock/unlock methods typed */
function getOrientation(): ScreenOrientationWithLock {
  return screen.orientation as ScreenOrientationWithLock;
}

interface OrientationLockResult {
  /** Whether the orientation lock is currently active */
  locked: boolean;
  /** Whether the Screen Orientation API lock method is available */
  supported: boolean;
}

/**
 * Attempts to lock the screen to portrait orientation during an active
 * interview session using the Screen Orientation API.
 *
 * On browsers that support `screen.orientation.lock()` (most Android browsers),
 * the lock is applied on activation and released on deactivation/unmount.
 *
 * On unsupported browsers (Safari, some WebViews), the hook gracefully reports
 * `{ locked: false, supported: false }` so the consuming component can render
 * a CSS-based landscape overlay as a fallback (e.g., "Please rotate your device
 * to portrait").
 *
 * @param active - Whether orientation lock should be active
 * @returns Object with `locked` (lock succeeded) and `supported` (API available)
 */
export function useOrientationLock(active: boolean): OrientationLockResult {
  const [locked, setLocked] = useState(false);
  const [supported, setSupported] = useState(hasOrientationLock);

  useEffect(() => {
    if (!active) {
      // Release lock when deactivated
      if (locked) {
        try {
          getOrientation().unlock();
        } catch {
          // Unlock can throw if lock was never acquired
        }
        setLocked(false);
      }
      return;
    }

    // Check support at effect time (SSR-safe)
    const isSupported = hasOrientationLock();
    setSupported(isSupported);

    if (!isSupported) {
      setLocked(false);
      return;
    }

    let cancelled = false;

    // Attempt to lock to portrait
    getOrientation()
      .lock('portrait')
      .then(() => {
        if (!cancelled) {
          setLocked(true);
        }
      })
      .catch(() => {
        // Safari and some WebViews throw on lock() even if the property exists.
        // Also throws if document is not fullscreen on some platforms.
        if (!cancelled) {
          setLocked(false);
          setSupported(false);
        }
      });

    return () => {
      cancelled = true;
      try {
        getOrientation().unlock();
      } catch {
        // Best-effort cleanup
      }
      setLocked(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { locked, supported };
}
