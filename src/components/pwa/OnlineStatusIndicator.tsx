'use client';

/**
 * Online Status Indicator Component
 *
 * Displays a simple colored dot indicating online/offline network status.
 * - Green dot: Online
 * - Orange dot: Offline
 *
 * Icon-only design (no text label) per user decision.
 * Accessible with aria-label for screen readers.
 */

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Online/offline status indicator for the header.
 *
 * Shows a small colored dot:
 * - bg-green-500 when online
 * - bg-orange-500 when offline
 *
 * @example
 * ```tsx
 * // In header/navigation
 * <OnlineStatusIndicator />
 * ```
 */
export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div
      className="relative flex items-center justify-center"
      title={isOnline ? 'Online' : 'Offline'}
      aria-label={isOnline ? 'Online' : 'Offline'}
      role="status"
    >
      {/* Status dot */}
      <span
        className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'}`}
        aria-hidden="true"
      />
    </div>
  );
}
