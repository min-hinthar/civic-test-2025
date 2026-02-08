'use client';

/**
 * Offline Context Provider
 *
 * Provides offline status, question caching, and sync queue state to the application.
 * Consolidates PWA-related state for consistent access across components.
 *
 * Features:
 * - Questions cached in IndexedDB on first load
 * - Cached questions load instantly on subsequent visits
 * - Sync queue management for offline test results
 * - Auto-sync when coming back online
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { cacheQuestions, getCachedQuestions, hasQuestionsCache } from '@/lib/pwa/offlineDb';
import { syncAllPendingResults, getPendingSyncCount, type SyncResult } from '@/lib/pwa/syncQueue';
import { allQuestions } from '@/constants/questions';
import { useToast } from '@/components/BilingualToast';
import type { Question } from '@/types';

/**
 * Context value interface
 */
interface OfflineContextValue {
  /** Whether the device is currently online */
  isOnline: boolean;
  /** All civics questions (from cache or constants) */
  questions: Question[];
  /** Whether questions have finished loading */
  isQuestionsLoaded: boolean;
  /** Whether questions are cached in IndexedDB */
  isCached: boolean;
  /** Number of test results pending sync */
  pendingSyncCount: number;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** Refresh the questions cache from constants */
  refreshCache: () => Promise<void>;
  /** Refresh the pending sync count from IndexedDB */
  refreshPendingCount: () => Promise<void>;
  /** Whether the last sync attempt had failures */
  syncFailed: boolean;
  /** Manually trigger sync of pending results */
  triggerSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextValue | null>(null);

/**
 * Props for OfflineProvider
 */
interface OfflineProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for offline state management.
 *
 * Features:
 * - Caches questions in IndexedDB on first load
 * - Loads from cache on subsequent visits for instant display
 * - Tracks online/offline status
 * - Exposes pending sync count for UI badges
 * - Auto-syncs when coming back online
 * - Provides manual sync trigger
 *
 * @example
 * ```tsx
 * // In _app.tsx or layout
 * <OfflineProvider>
 *   <App />
 * </OfflineProvider>
 * ```
 */
export function OfflineProvider({ children }: OfflineProviderProps) {
  const isOnline = useOnlineStatus();
  const { showSuccess, showWarning } = useToast();
  const [questions, setQuestions] = useState<Question[]>(allQuestions);
  const [isQuestionsLoaded, setIsQuestionsLoaded] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Load questions from cache or cache them on first load
  useEffect(() => {
    async function initQuestions() {
      try {
        const hasCached = await hasQuestionsCache();
        if (hasCached) {
          // Load from cache for instant display
          const cached = await getCachedQuestions();
          if (cached && cached.length > 0) {
            setQuestions(cached);
            setIsCached(true);
          }
        } else {
          // First visit - cache questions for future offline use
          await cacheQuestions(allQuestions);
          setIsCached(true);
        }
      } catch (error) {
        console.error('[OfflineContext] Failed to initialize questions:', error);
        // Fallback to in-memory questions (already set as default)
      }
      setIsQuestionsLoaded(true);
    }

    initQuestions();
  }, []);

  const refreshCache = useCallback(async () => {
    try {
      await cacheQuestions(allQuestions);
      setQuestions(allQuestions);
      setIsCached(true);
    } catch (error) {
      console.error('[OfflineContext] Failed to refresh cache:', error);
    }
  }, []);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error('[OfflineContext] Failed to refresh pending count:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    setSyncFailed(false);
    try {
      const result: SyncResult = await syncAllPendingResults();
      await refreshPendingCount();

      // Show bilingual toast on completion
      if (result.synced > 0 && result.failed === 0) {
        showSuccess({
          en: `Synced ${result.synced} offline result${result.synced > 1 ? 's' : ''}`,
          my: `အော့ဖ်လိုင်း ရလဒ် ${result.synced} ခု စင့်ခ်လုပ်ပြီးပါပြီ`,
        });
      } else if (result.failed > 0) {
        setSyncFailed(true);
        showWarning({
          en: `Failed to sync ${result.failed} result${result.failed > 1 ? 's' : ''} — will retry`,
          my: `ရလဒ် ${result.failed} ခု စင့်ခ်မလုပ်နိုင်ပါ။ ပြန်လုပ်ပါမည်။`,
        });
      }
    } catch (error) {
      console.error('[OfflineContext] Sync failed:', error);
      setSyncFailed(true);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, refreshPendingCount, showSuccess, showWarning]);

  // Refresh sync count on mount
  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  // Track offline state transitions
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    }
  }, [isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && pendingSyncCount > 0) {
      setWasOffline(false);
      triggerSync();
    }
  }, [isOnline, wasOffline, pendingSyncCount, triggerSync]);

  const value: OfflineContextValue = {
    isOnline,
    questions,
    isQuestionsLoaded,
    isCached,
    pendingSyncCount,
    isSyncing,
    syncFailed,
    refreshCache,
    refreshPendingCount,
    triggerSync,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

/**
 * Hook to access offline context.
 *
 * @throws Error if used outside OfflineProvider
 * @returns OfflineContextValue
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline, questions, isQuestionsLoaded, isCached } = useOffline();
 *   if (!isQuestionsLoaded) return <Loading />;
 *   return <QuestionList questions={questions} />;
 * }
 * ```
 */
export function useOffline(): OfflineContextValue {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
