/**
 * Quiz State Machine Types
 *
 * Defines the type-safe state machine for both Mock Test and Practice quiz modes.
 * QuizPhase enum prevents invalid state combinations — every action is guarded
 * by the current phase in quizReducer.ts.
 */

import type { Answer, QuestionResult } from '@/types';

// ---------------------------------------------------------------------------
// Phase & Mode
// ---------------------------------------------------------------------------

/**
 * Represents the current phase of the quiz state machine.
 * Transitions are strictly guarded — see quizReducer.ts for valid transitions.
 */
export type QuizPhase =
  | 'answering' // User selecting an answer
  | 'checked' // Check pressed, showing intentional delay (200-300ms)
  | 'feedback' // Feedback panel visible, waiting for Continue
  | 'transitioning' // Slide-left animation to next question
  | 'skipped-review' // Reviewing skipped questions (Practice only)
  | 'finished'; // All questions answered, show results

/**
 * Quiz mode determines which features are available.
 * - mock-test: realistic USCIS simulation (no explanations, no skip review)
 * - practice: educational mode (explanations, live score, skip review)
 */
export type QuizMode = 'mock-test' | 'practice';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface QuizState {
  /** Current phase of the state machine */
  phase: QuizPhase;
  /** Quiz mode (mock-test or practice) */
  mode: QuizMode;
  /** Index of the current question in the questions array */
  currentIndex: number;
  /** Currently selected answer (null if none selected) */
  selectedAnswer: Answer | null;
  /** Accumulated results for answered questions */
  results: QuestionResult[];
  /** Indices of skipped questions (for review in Practice mode) */
  skippedIndices: number[];
  /** Consecutive correct answer count (resets on incorrect) */
  streakCount: number;
  /** Whether the current answer is correct (null = not yet checked) */
  isCorrect: boolean | null;
  /** Total number of questions in this quiz */
  questionCount: number;
  /** Index into skippedIndices during skipped-review phase */
  reviewingSkippedIndex: number;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type QuizAction =
  | { type: 'SELECT_ANSWER'; answer: Answer }
  | { type: 'DESELECT_ANSWER' }
  | { type: 'CHECK' }
  | { type: 'SHOW_FEEDBACK'; result: QuestionResult; isCorrect: boolean }
  | { type: 'CONTINUE' }
  | { type: 'SKIP' }
  | { type: 'TRANSITION_COMPLETE' }
  | { type: 'START_SKIPPED_REVIEW' }
  | { type: 'FINISH' }
  | { type: 'RESUME_SESSION'; currentIndex: number; results: QuestionResult[] };

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface QuizConfig {
  /** Quiz mode */
  mode: QuizMode;
  /** Number of questions to present */
  questionCount: number;
  /** Number of correct answers to pass (Mock test: 12) */
  passThreshold?: number;
  /** Number of incorrect answers to fail (Mock test: 9) */
  failThreshold?: number;
  /** Allow reviewing skipped questions at end (Practice only) */
  allowSkipReview?: boolean;
  /** Allow tapping progress bar segments to review (Practice only) */
  allowSegmentTap?: boolean;
  /** Show live score tally (Practice only) */
  showLiveScore?: boolean;
  /** Show explanation in feedback panel (Practice only, not mock test) */
  showExplanation?: boolean;
}
