/**
 * Sort Mode State Machine Types
 *
 * Defines the type-safe state machine for the flashcard sort mode.
 * SortPhase controls valid transitions — every action is guarded
 * by the current phase in sortReducer.ts.
 *
 * Phase transitions:
 *   idle       -> START_SORT         -> sorting
 *   sorting    -> SORT_CARD          -> animating
 *   animating  -> ANIMATION_COMPLETE -> sorting | round-summary | mastery
 *   sorting    -> UNDO               -> sorting (with card restored)
 *   round-summary -> START_NEXT_ROUND -> sorting
 *   round-summary -> START_COUNTDOWN  -> countdown
 *   countdown  -> CANCEL_COUNTDOWN   -> round-summary
 *   any        -> FINISH_SESSION     -> idle
 *   any        -> RESUME_SESSION     -> sorting
 */

import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum number of drill rounds before forcing session end */
export const MAX_ROUNDS = 10;

// ---------------------------------------------------------------------------
// Phase
// ---------------------------------------------------------------------------

/**
 * Represents the current phase of the sort state machine.
 * Transitions are strictly guarded — see sortReducer.ts for valid transitions.
 */
export type SortPhase =
  | 'idle' // Before first round (landing/setup)
  | 'sorting' // Active card sorting
  | 'animating' // Card fling animation in progress (gates undo)
  | 'round-summary' // End-of-round stats display
  | 'countdown' // Auto-start countdown for next round
  | 'mastery'; // 100% known celebration screen

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

/** Tracks last sort for undo */
export interface UndoEntry {
  questionId: string;
  direction: 'know' | 'dont-know';
  cardIndex: number;
}

/** Stats per completed round */
export interface RoundResult {
  round: number;
  totalCards: number;
  knownCount: number;
  unknownCount: number;
  durationMs: number;
  unknownIds: string[];
}

/** Session initialization config */
export interface SortConfig {
  cards: Question[];
  categoryFilter?: string;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface SortState {
  /** Current phase of the state machine */
  phase: SortPhase;
  /** Current round number (1-based) */
  round: number;
  /** Current round's cards (shuffled) */
  cards: Question[];
  /** Index of the current card being sorted */
  currentIndex: number;
  /** IDs of cards classified as "know" this round */
  knownIds: Set<string>;
  /** IDs of cards classified as "don't know" this round */
  unknownIds: Set<string>;
  /** Cumulative unknown IDs across all rounds */
  allUnknownIds: Set<string>;
  /** Stack of recent sorts for undo */
  undoStack: UndoEntry[];
  /** Stats from completed rounds */
  roundHistory: RoundResult[];
  /** Timestamp when current round started (Date.now()) */
  startTime: number;
  /** Original full card set (unshuffled source of truth) */
  sourceCards: Question[];
  /** Optional category filter applied to the session */
  categoryFilter?: string;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type SortAction =
  | { type: 'START_SORT'; payload: SortConfig }
  | { type: 'SORT_CARD'; payload: { direction: 'know' | 'dont-know' } }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'UNDO' }
  | { type: 'START_NEXT_ROUND' }
  | { type: 'START_COUNTDOWN' }
  | { type: 'CANCEL_COUNTDOWN' }
  | { type: 'FINISH_SESSION' }
  | { type: 'RESUME_SESSION'; payload: Partial<SortState> };
