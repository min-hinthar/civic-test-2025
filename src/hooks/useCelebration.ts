'use client';

import { useEffect } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CelebrationLevel = 'sparkle' | 'burst' | 'celebration' | 'ultimate';

export interface CelebrationDetail {
  level: CelebrationLevel;
  /** Identifies the celebration source, e.g. "streak-5", "test-pass", "badge-earned" */
  source: string;
  /** First occurrence gets an elevated celebration tier */
  isFirstTime?: boolean;
  /** For color palette selection in confetti */
  isDarkMode?: boolean;
  /** Extra data (category for star burst, etc.) */
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Event constant
// ---------------------------------------------------------------------------

const CELEBRATION_EVENT = 'civic:celebrate';

// ---------------------------------------------------------------------------
// celebrate() - module-level function (not a hook)
// ---------------------------------------------------------------------------

/**
 * Dispatch a celebration event that the CelebrationOverlay will pick up.
 *
 * This is NOT a hook -- it's a plain function that can be called from anywhere:
 * event handlers, effects, callbacks, non-React code, etc.
 *
 * Usage:
 * ```ts
 * celebrate({ level: 'burst', source: 'test-pass' });
 * celebrate({ level: 'ultimate', source: '100-percent', isDarkMode: true });
 * ```
 */
export function celebrate(detail: CelebrationDetail): void {
  window.dispatchEvent(new CustomEvent(CELEBRATION_EVENT, { detail }));
}

// ---------------------------------------------------------------------------
// useCelebrationListener hook
// ---------------------------------------------------------------------------

/**
 * Subscribe to celebration events dispatched via `celebrate()`.
 *
 * Used by the CelebrationOverlay to listen for incoming celebrations.
 * The callback should be wrapped in `useCallback` by the consumer to
 * avoid re-subscribing on every render.
 *
 * @param callback - Called with the CelebrationDetail when a celebration fires
 */
export function useCelebrationListener(callback: (detail: CelebrationDetail) => void): void {
  useEffect(() => {
    const handler = (e: Event) => {
      callback((e as CustomEvent<CelebrationDetail>).detail);
    };
    window.addEventListener(CELEBRATION_EVENT, handler);
    return () => window.removeEventListener(CELEBRATION_EVENT, handler);
  }, [callback]);
}

// ---------------------------------------------------------------------------
// First-time tracking
// ---------------------------------------------------------------------------

const FIRST_TIME_KEY = 'civic-first-celebrations';

/**
 * Check if this is the first time a celebration source has been triggered.
 * Records the source in localStorage so subsequent calls return false.
 *
 * First-time celebrations get an elevated tier (sparkle->burst, burst->celebration).
 *
 * @param source - The celebration source identifier (e.g. "streak-5", "test-pass")
 * @returns true if this is the first occurrence
 */
export function isFirstTimeCelebration(source: string): boolean {
  try {
    const stored: Record<string, boolean> = JSON.parse(
      localStorage.getItem(FIRST_TIME_KEY) ?? '{}'
    );
    if (stored[source]) return false;
    stored[source] = true;
    localStorage.setItem(FIRST_TIME_KEY, JSON.stringify(stored));
    return true;
  } catch {
    return false;
  }
}
