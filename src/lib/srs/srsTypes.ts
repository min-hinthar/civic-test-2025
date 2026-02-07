/**
 * SRS Types - TypeScript interfaces for the spaced repetition system.
 *
 * Defines the local SRS card record, Supabase row schema,
 * and serialization helpers for FSRS Card date fields.
 */

import type { Card } from 'ts-fsrs';

// ---------------------------------------------------------------------------
// Local record (IndexedDB)
// ---------------------------------------------------------------------------

/** An SRS card record stored in IndexedDB, keyed by questionId */
export interface SRSCardRecord {
  questionId: string; // e.g., 'GOV-P01'
  card: Card; // ts-fsrs Card state
  addedAt: string; // ISO timestamp
  lastReviewedAt?: string; // ISO timestamp
}

// ---------------------------------------------------------------------------
// Supabase row (cloud sync)
// ---------------------------------------------------------------------------

/** Row shape matching the `srs_cards` Supabase table */
export interface SupabaseSRSRow {
  id?: string;
  user_id: string;
  question_id: string;
  due: string;
  stability: number;
  difficulty: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number; // 0=New, 1=Learning, 2=Review, 3=Relearning
  last_review: string | null;
  added_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

/**
 * Serialize an SRSCardRecord into a Supabase row.
 * Card dates are converted to ISO strings.
 */
export function cardToRow(
  userId: string,
  questionId: string,
  record: SRSCardRecord
): SupabaseSRSRow {
  const { card } = record;
  return {
    user_id: userId,
    question_id: questionId,
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state, // numeric enum: 0-3
    last_review: card.last_review?.toISOString() ?? null,
    added_at: record.addedAt,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Deserialize a Supabase row back into an SRSCardRecord.
 * ISO string dates are converted to Date objects for FSRS compatibility.
 */
export function rowToCard(row: SupabaseSRSRow): SRSCardRecord {
  const card: Card = {
    due: new Date(row.due),
    stability: row.stability,
    difficulty: row.difficulty,
    elapsed_days: 0, // deprecated field, required for type compat
    scheduled_days: row.scheduled_days,
    learning_steps: row.learning_steps,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  };

  return {
    questionId: row.question_id,
    card,
    addedAt: row.added_at,
    lastReviewedAt: row.last_review ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Session types
// ---------------------------------------------------------------------------

/** Result of grading a single card in a review session */
export interface ReviewResult {
  questionId: string;
  rating: 'easy' | 'hard';
  newInterval: string; // e.g., "3 days", "1 month"
}

/** Phase of a review session lifecycle */
export type SessionPhase = 'setup' | 'reviewing' | 'summary';
