/**
 * Centralized version constants for all IndexedDB stores.
 * Bump a store's version ONLY when its data structure changes.
 * Per-store isolation: bumping QUESTIONS does NOT invalidate SRS_CARD.
 *
 * Reference: sessionStore.ts validates SESSION_VERSION on every read.
 * This file generalizes that pattern for all stores.
 */
export const STORAGE_VERSIONS = {
  QUESTIONS: 1,
  SESSION: 1, // Canonical source is sessionTypes.ts SESSION_VERSION
  SRS_CARD: 1,
  SRS_SYNC: 1,
  BOOKMARK: 1,
  PENDING_SYNC: 1,
  ANSWER_HISTORY: 1,
  INTERVIEW: 1,
  STREAK: 1,
  BADGE: 1,
} as const;

export type StoreName = keyof typeof STORAGE_VERSIONS;
