/**
 * useSessionPersistence -- React hook for session snapshot management
 *
 * Wraps sessionStore.ts for use in React components with loading state
 * and auto-expiry. Follows React Compiler safe patterns: no setState
 * directly in effect bodies, uses cancelled-flag async IIFE pattern.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  cleanExpiredSessions,
  deleteSession,
  getAllSessions,
  getSessionsByType,
} from './sessionStore';
import type { SessionSnapshot } from './sessionTypes';

interface UseSessionPersistenceReturn {
  /** Currently loaded sessions (filtered by type if specified) */
  sessions: SessionSnapshot[];
  /** True while initial load is in progress */
  isLoading: boolean;
  /** Re-fetch sessions from IndexedDB (call after save/delete) */
  refresh: () => Promise<void>;
  /** Delete a session by ID and refresh the list */
  removeSession: (id: string) => Promise<void>;
}

/**
 * Load and manage session snapshots from IndexedDB.
 *
 * @param type - Optional session type filter. If omitted, returns all sessions.
 */
export function useSessionPersistence(type?: SessionSnapshot['type']): UseSessionPersistenceReturn {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSessions = useCallback(async () => {
    // Clean expired sessions on every load
    await cleanExpiredSessions();

    const loaded = type ? await getSessionsByType(type) : await getAllSessions();
    return loaded;
  }, [type]);

  // Initial load on mount using cancelled-flag async IIFE pattern
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const loaded = await loadSessions();
      if (!cancelled) {
        setSessions(loaded);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [loadSessions]);

  const refresh = useCallback(async () => {
    const loaded = await loadSessions();
    setSessions(loaded);
  }, [loadSessions]);

  const removeSession = useCallback(
    async (id: string) => {
      await deleteSession(id);
      await refresh();
    },
    [refresh]
  );

  return { sessions, isLoading, refresh, removeSession };
}
