/**
 * NBA (Next Best Action) Type System
 *
 * Discriminated union for 8 recommendation states the dashboard can show.
 * Each state carries contextual data, bilingual copy, gradient, icon, and CTA info.
 *
 * Pure data types -- no React dependencies.
 */

import type { BilingualString } from '@/lib/i18n/strings';

/** All possible NBA state identifiers */
export type NBAStateType =
  | 'new-user'
  | 'returning-user'
  | 'streak-at-risk'
  | 'srs-due'
  | 'weak-category'
  | 'no-recent-test'
  | 'test-ready'
  | 'celebration';

/** Lucide icon names used across NBA states */
export type NBAIcon = 'sparkles' | 'heart' | 'flame' | 'brain' | 'book-open' | 'target' | 'trophy';

/** Base interface shared by all NBA states */
interface NBABase {
  /** Discriminant for the union */
  type: NBAStateType;
  /** Primary recommendation text (bilingual) */
  title: BilingualString;
  /** One-liner reasoning hint (bilingual) */
  hint: BilingualString;
  /** Primary CTA button */
  cta: { label: BilingualString; to: string };
  /** Secondary contextual alternative link */
  skip: { label: BilingualString; to: string };
  /** Tailwind gradient classes for card overlay */
  gradient: string;
  /** Lucide icon name */
  icon: NBAIcon;
  /** Whether icon should pulse (time-sensitive states) */
  urgent: boolean;
  /** Optional estimated time in minutes */
  estimatedMinutes?: number;
}

/** Brand new user -- no activity data at all */
export interface NewUserNBA extends NBABase {
  type: 'new-user';
}

/** Returning after 7+ day absence */
export interface ReturningUserNBA extends NBABase {
  type: 'returning-user';
  daysSinceActivity: number;
}

/** Active streak that will break if user doesn't study today */
export interface StreakAtRiskNBA extends NBABase {
  type: 'streak-at-risk';
  currentStreak: number;
}

/** Spaced repetition cards due for review */
export interface SRSDueNBA extends NBABase {
  type: 'srs-due';
  dueCount: number;
}

/** Weakest category below 50% mastery */
export interface WeakCategoryNBA extends NBABase {
  type: 'weak-category';
  categoryName: BilingualString;
  mastery: number;
}

/** No mock test taken in 7+ days */
export interface NoRecentTestNBA extends NBABase {
  type: 'no-recent-test';
  daysSinceTest: number;
}

/** High mastery -- ready for the civics test or interview */
export interface TestReadyNBA extends NBABase {
  type: 'test-ready';
  readinessScore: number;
  suggestInterview: boolean;
}

/** Everything is going well -- celebrate and suggest next step */
export interface CelebrationNBA extends NBABase {
  type: 'celebration';
  streak: number;
  mastery: number;
  suggestInterview: boolean;
}

/** Discriminated union of all 8 NBA states */
export type NBAState =
  | NewUserNBA
  | ReturningUserNBA
  | StreakAtRiskNBA
  | SRSDueNBA
  | WeakCategoryNBA
  | NoRecentTestNBA
  | TestReadyNBA
  | CelebrationNBA;

/**
 * Input data required by the NBA determination function.
 * Assembled from existing hooks (useStreak, useSRSWidget, useCategoryMastery, useAuth).
 */
export interface NBAInput {
  /** Current streak count (from useStreak) */
  currentStreak: number;
  /** Array of YYYY-MM-DD date strings when user was active (from useStreak) */
  activityDates: string[];
  /** Number of SRS cards due for review (from useSRSWidget) */
  srsDueCount: number;
  /** Overall mastery percentage 0-100 (from useCategoryMastery) */
  overallMastery: number;
  /** Per-USCIS-category mastery keyed by category name (from useCategoryMastery) */
  categoryMasteries: Record<string, number>;
  /** Simplified test history (from TestSession in useAuth) */
  testHistory: { date: string; score: number; totalQuestions: number }[];
  /** Simplified interview history (from InterviewSession) */
  interviewHistory: { date: string; passed: boolean }[];
  /** Number of unique questions the user has practiced */
  uniqueQuestionsPracticed: number;
  /** Total number of questions available in the bank */
  totalQuestions: number;
}
