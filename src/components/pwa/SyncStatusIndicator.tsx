'use client';

/**
 * Sync Status Indicator Component
 *
 * Floating bottom-center toast-like indicator showing pending sync count.
 * Appears only when items are pending sync, with animated tick-down
 * and slide-away when count reaches zero.
 *
 * Informational only -- no tap-to-sync action.
 * Uses bottom-20 offset to clear mobile bottom tab bar.
 */

import { Cloud, CloudOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useOffline } from '@/contexts/OfflineContext';

/**
 * Floating sync status indicator with AnimatePresence slide animation.
 *
 * States:
 * - Normal syncing: Cloud icon with pulse animation + count
 * - Sync failure: CloudOff icon in warning-500 (orange)
 *
 * @example
 * ```tsx
 * // In AppShell, inside Router
 * <SyncStatusIndicator />
 * ```
 */
export function SyncStatusIndicator() {
  const { pendingSyncCount, isSyncing, syncFailed } = useOffline();

  const isVisible = pendingSyncCount > 0 || isSyncing;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed left-1/2 z-50 -translate-x-1/2"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5rem)' }}
          role="status"
          aria-label={
            syncFailed
              ? `${pendingSyncCount} items failed to sync`
              : `${pendingSyncCount} items syncing`
          }
        >
          <div className="flex items-center gap-2 rounded-full bg-card/95 px-4 py-2 shadow-lg backdrop-blur-lg border border-border/40">
            {syncFailed ? (
              <CloudOff className="h-4 w-4 text-warning" aria-hidden="true" />
            ) : (
              <Cloud className="h-4 w-4 text-primary animate-pulse" aria-hidden="true" />
            )}
            <motion.span
              key={pendingSyncCount}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className={`text-sm font-semibold tabular-nums ${
                syncFailed ? 'text-warning' : 'text-foreground'
              }`}
            >
              {pendingSyncCount}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
