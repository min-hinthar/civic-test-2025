/**
 * SRS Module
 *
 * Central export for spaced repetition types, FSRS engine, and IndexedDB storage.
 *
 * Usage:
 *   import { createNewSRSCard, gradeCard, getSRSCard } from '@/lib/srs';
 */

// Types and serialization
export {
  cardToRow,
  rowToCard,
} from './srsTypes';
export type {
  SRSCardRecord,
  SupabaseSRSRow,
  ReviewResult,
  SessionPhase,
} from './srsTypes';

// FSRS engine
export {
  createNewSRSCard,
  gradeCard,
  isDue,
  getNextReviewText,
  getCardStatusLabel,
  getIntervalStrengthColor,
} from './fsrsEngine';

// IndexedDB store
export {
  getSRSCard,
  setSRSCard,
  removeSRSCard,
  getAllSRSCards,
  getDueSRSCards,
  getSRSCardCount,
} from './srsStore';

// Supabase sync
export {
  queueSRSSync,
  syncPendingSRSReviews,
  pushSRSCards,
  pullSRSCards,
  mergeSRSDecks,
} from './srsSync';
export type { PendingSRSSync } from './srsSync';
