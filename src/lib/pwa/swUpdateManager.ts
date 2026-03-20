/**
 * SW Update Manager -- bridges SW lifecycle events to React UI.
 *
 * Detection: updatefound (early toast) + controllerchange (reload trigger).
 * Session lock: module-level ref synced from NavigationProvider via useEffect.
 * Dual lock detection: checks both isLocked (Real Exam) and history.state
 * interviewGuard marker (Realistic Interview).
 *
 * Multi-tab limitation: Tab A in exam while Tab B accepts update may cause
 * issues. Full fix needs BroadcastChannel (Phase 52+).
 */
import { captureError } from '@/lib/sentry';

type UpdateCallback = () => void;

interface SWUpdateManager {
  init: (onUpdateAvailable: UpdateCallback) => void;
  acceptUpdate: () => void;
  setSessionLocked: (locked: boolean) => void;
  getState: () => { updateAvailable: boolean; deferred: boolean; sessionLocked: boolean };
  destroy: () => void;
}

export function createSWUpdateManager(): SWUpdateManager {
  let updateAvailable = false;
  let deferred = false;
  let sessionLocked = false;
  let onUpdateAvailableCb: UpdateCallback | null = null;
  let controllerChangeHandler: (() => void) | null = null;
  let updateFoundHandler: (() => void) | null = null;

  function checkSessionLocked(): boolean {
    if (sessionLocked) return true;
    // Also check history.state for interview guard (uses useNavigationGuard,
    // separate from NavigationProvider.isLocked)
    try {
      const state = window.history.state as Record<string, unknown> | null;
      if (state?.interviewGuard === true) return true;
    } catch {
      // history.state access can throw in some edge cases
    }
    return false;
  }

  function handleUpdateDetected() {
    updateAvailable = true;
    if (checkSessionLocked()) {
      deferred = true;
      return;
    }
    deferred = false;
    onUpdateAvailableCb?.();
  }

  return {
    init(onUpdateAvailable: UpdateCallback) {
      onUpdateAvailableCb = onUpdateAvailable;

      if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;

      // Listen for new SW taking control
      controllerChangeHandler = () => {
        handleUpdateDetected();
      };
      navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

      // Early detection: updatefound on registration
      navigator.serviceWorker
        .getRegistration()
        .then(registration => {
          if (!registration) return;

          // Check if update is already waiting
          if (registration.waiting) {
            handleUpdateDetected();
            return;
          }

          updateFoundHandler = () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New SW installed but waiting (if skipWaiting is removed in future)
                handleUpdateDetected();
              }
            });
          };
          registration.addEventListener('updatefound', updateFoundHandler);
        })
        .catch(err => {
          captureError(err, { operation: 'swUpdateManager.init' });
        });
    },

    acceptUpdate() {
      if (!navigator.onLine) {
        // Defer reload until online
        const onlineHandler = () => {
          window.removeEventListener('online', onlineHandler);
          window.location.reload();
        };
        window.addEventListener('online', onlineHandler);
        return;
      }
      window.location.reload();
    },

    setSessionLocked(locked: boolean) {
      sessionLocked = locked;
      // If unlocking and we have a deferred update, fire it now
      if (!locked && deferred && updateAvailable) {
        deferred = false;
        onUpdateAvailableCb?.();
      }
    },

    getState() {
      return { updateAvailable, deferred, sessionLocked };
    },

    destroy() {
      if (controllerChangeHandler && navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      }
      onUpdateAvailableCb = null;
      controllerChangeHandler = null;
      updateFoundHandler = null;
    },
  };
}

export const swUpdateManager = createSWUpdateManager();
export const setSessionLocked = swUpdateManager.setSessionLocked;
