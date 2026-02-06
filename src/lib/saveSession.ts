import { Mutex } from 'async-mutex';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface SaveSessionGuard {
  getState: () => SaveState;
  save: <T>(operation: () => Promise<T>) => Promise<T>;
  reset: () => void;
  onStateChange: (callback: (state: SaveState) => void) => () => void;
}

/**
 * Creates a save session guard that provides mutex-protected save operations.
 * Prevents concurrent saves and tracks the save state (idle/saving/saved/error).
 *
 * @returns A SaveSessionGuard instance
 */
export function createSaveSessionGuard(): SaveSessionGuard {
  const mutex = new Mutex();
  let state: SaveState = 'idle';
  const listeners = new Set<(state: SaveState) => void>();

  const setState = (newState: SaveState) => {
    state = newState;
    listeners.forEach(cb => cb(newState));
  };

  return {
    getState: () => state,

    save: async <T>(operation: () => Promise<T>): Promise<T> => {
      // If already saving or saved, skip the duplicate save
      if (state === 'saving' || state === 'saved') {
        return undefined as T;
      }

      const release = await mutex.acquire();
      try {
        // Double-check after acquiring lock (state may have changed while waiting)
        if ((state as SaveState) === 'saving' || (state as SaveState) === 'saved') {
          return undefined as T;
        }

        setState('saving');
        const result = await operation();
        setState('saved');
        return result;
      } catch (error) {
        setState('error');
        throw error;
      } finally {
        release();
      }
    },

    reset: () => {
      setState('idle');
    },

    onStateChange: (callback: (state: SaveState) => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}
