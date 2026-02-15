/**
 * Session Persistence Types
 *
 * Typed snapshot interfaces for each session type (mock test, practice, interview).
 * Used by sessionStore.ts for IndexedDB persistence and useSessionPersistence.ts
 * for React integration.
 *
 * Each snapshot captures the minimum state needed to restore a session:
 * - Shuffled question set (order preserved)
 * - Answers given so far
 * - Current position
 * - Session-specific metadata (timer, config, mode)
 */

import type { InterviewMode, InterviewResult, Question, QuestionResult } from '@/types';

/** Schema version for migration safety. Bump when snapshot shape changes. */
export const SESSION_VERSION = 1;

/**
 * Base fields shared by all session snapshot types.
 */
export interface BaseSessionSnapshot {
  /** Unique ID in format: `session-{type}-{timestamp}` */
  id: string;
  /** Discriminant for the union type */
  type: 'mock-test' | 'practice' | 'interview';
  /** ISO timestamp when session was last saved */
  savedAt: string;
  /** Schema version -- mismatched versions are discarded on load */
  version: number;
}

/**
 * Mock Test session snapshot.
 * Captures the timed 10/20-question test with multiple-choice answers.
 */
export interface MockTestSnapshot extends BaseSessionSnapshot {
  type: 'mock-test';
  /** Shuffled question set with shuffled answer options */
  questions: Question[];
  /** Answers given so far */
  results: QuestionResult[];
  /** Index of the question user was on */
  currentIndex: number;
  /** Seconds remaining -- for display only, timer resets to full on resume */
  timeLeft: number;
}

/**
 * Practice session snapshot.
 * Captures a category-filtered practice session with optional timer.
 */
export interface PracticeSnapshot extends BaseSessionSnapshot {
  type: 'practice';
  /** Selected + shuffled practice questions */
  questions: Question[];
  /** Answers given so far */
  results: QuestionResult[];
  /** Index of the question user was on */
  currentIndex: number;
  /** Whether the timer was enabled for this session */
  timerEnabled: boolean;
  /** Seconds remaining -- for display only */
  timeLeft: number;
  /** Practice configuration for display on resume card */
  config: {
    category: string;
    categoryName: { en: string; my: string };
    count: number;
  };
}

/**
 * Interview simulation session snapshot.
 * Captures the spoken-answer interview with self-grading.
 */
export interface InterviewSnapshot extends BaseSessionSnapshot {
  type: 'interview';
  /** Shuffled question set */
  questions: Question[];
  /** Self-graded results so far */
  results: InterviewResult[];
  /** Index of the question user was on */
  currentIndex: number;
  /** Running count of correct self-grades */
  correctCount: number;
  /** Running count of incorrect self-grades */
  incorrectCount: number;
  /** Interview mode: 'realistic' or 'practice' */
  mode: InterviewMode;
  /** Date.now() of original session start, for duration calculation */
  startTime: number;
}

/**
 * Discriminated union of all session snapshot types.
 * Use `snapshot.type` to narrow to a specific type.
 */
export type SessionSnapshot = MockTestSnapshot | PracticeSnapshot | InterviewSnapshot;
