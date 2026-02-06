'use client';

/**
 * Sync Status Indicator Component
 *
 * Shows a refresh icon with badge for pending offline results.
 * Spins during sync, clickable for manual retry.
 * Hidden when no pending items and not syncing.
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useSyncQueue } from '@/hooks/useSyncQueue';

/**
 * Indicator showing sync status with pending count badge.
 *
 * Features:
 * - Hidden when no pending items
 * - Orange badge shows pending count
 * - Spinning animation during sync
 * - Click to manually trigger sync
 *
 * @example
 * ```tsx
 * // In header/navigation
 * <SyncStatusIndicator />
 * ```
 */
export function SyncStatusIndicator() {
  const { pendingCount, isSyncing, triggerSync } = useSyncQueue();

  // Don't render if nothing pending and not syncing
  if (pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <button
      onClick={() => triggerSync()}
      disabled={isSyncing}
      className="relative flex items-center justify-center p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-wait"
      title={isSyncing ? 'Syncing...' : `${pendingCount} pending`}
      aria-label={
        isSyncing
          ? 'Syncing offline results'
          : `${pendingCount} result${pendingCount !== 1 ? 's' : ''} waiting to sync`
      }
    >
      <RefreshCw
        className={`h-4 w-4 text-muted-foreground ${isSyncing ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      {/* Badge showing pending count */}
      {pendingCount > 0 && !isSyncing && (
        <span
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-medium text-white"
          aria-hidden="true"
        >
          {pendingCount > 9 ? '9+' : pendingCount}
        </span>
      )}
    </button>
  );
}
