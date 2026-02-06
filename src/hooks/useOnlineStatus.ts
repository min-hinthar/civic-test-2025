/**
 * React hook for detecting online/offline network status.
 *
 * Uses useSyncExternalStore for proper SSR hydration support.
 * Subscribes to browser online/offline events.
 */

import { useSyncExternalStore } from 'react';

/**
 * Subscribe to online/offline events
 */
function subscribe(callback: () => void): () => void {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * Get current online status (client-side)
 */
function getSnapshot(): boolean {
  return navigator.onLine;
}

/**
 * Get online status for SSR (assume online)
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * Hook to track online/offline network status.
 *
 * @returns boolean - true if online, false if offline
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOnline = useOnlineStatus();
 *   return <div>{isOnline ? 'Online' : 'Offline'}</div>;
 * }
 * ```
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
