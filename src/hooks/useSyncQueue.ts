/**
 * React hook for managing offline sync queue.
 *
 * Provides sync state, pending count, and auto-sync on reconnection.
 * Uses useOnlineStatus to detect connectivity changes.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { syncAllPendingResults, getPendingSyncCount, type SyncResult } from '@/lib/pwa/syncQueue';
import { toast } from '@/components/ui/use-toast';

/**
 * Return type for useSyncQueue hook
 */
export interface UseSyncQueueResult {
  /** Number of results pending sync */
  pendingCount: number;
  /** Whether sync is currently in progress */
  isSyncing: boolean;
  /** Result of last sync operation */
  lastSyncResult: SyncResult | null;
  /** Manually trigger sync */
  triggerSync: () => Promise<void>;
  /** Refresh pending count from IndexedDB */
  refreshCount: () => Promise<void>;
}

/**
 * Hook for managing offline test result sync queue.
 *
 * Features:
 * - Tracks pending sync count for badge display
 * - Auto-syncs when coming back online
 * - Shows bilingual toast on sync completion
 * - Exposes manual sync trigger
 *
 * @example
 * ```tsx
 * function SyncIndicator() {
 *   const { pendingCount, isSyncing, triggerSync } = useSyncQueue();
 *   return (
 *     <button onClick={triggerSync} disabled={isSyncing}>
 *       {pendingCount} pending
 *     </button>
 *   );
 * }
 * ```
 */
export function useSyncQueue(): UseSyncQueueResult {
  const isOnline = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Track if we were offline to detect coming back online
  const wasOfflineRef = useRef(!isOnline);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    } catch (error) {
      console.error('[useSyncQueue] Failed to refresh pending count:', error);
    }
  }, []);

  const triggerSync = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      const result = await syncAllPendingResults();
      setLastSyncResult(result);
      await refreshCount();

      // Show bilingual toast on completion
      if (result.synced > 0 && result.failed === 0) {
        toast({
          title: `Synced ${result.synced} offline result${result.synced > 1 ? 's' : ''}`,
          description: `အော့ဖ်လိုင်း ရလဒ် ${result.synced} ခု စင့်ခ်လုပ်ပြီးပါပြီ`,
        });
      } else if (result.failed > 0) {
        toast({
          title: `Failed to sync ${result.failed} result${result.failed > 1 ? 's' : ''}. Will retry.`,
          description: `ရလဒ် ${result.failed} ခု စင့်ခ်မလုပ်နိုင်ပါ။ ပြန်လုပ်ပါမည်။`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[useSyncQueue] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline, refreshCount]);

  // Refresh count on mount
  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && wasOfflineRef.current && pendingCount > 0) {
      // We just came back online and have pending items
      triggerSync();
    }
    wasOfflineRef.current = !isOnline;
  }, [isOnline, pendingCount, triggerSync]);

  return {
    pendingCount,
    isSyncing,
    lastSyncResult,
    triggerSync,
    refreshCount,
  };
}
