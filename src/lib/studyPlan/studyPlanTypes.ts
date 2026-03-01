/**
 * Study Plan Types
 *
 * Type definitions for the study plan engine that computes daily
 * study targets from learning state and optional test date.
 *
 * Zero React dependencies -- pure data shapes.
 */

/** Pacing status relative to test date readiness target */
export type PaceStatus = 'ahead' | 'on-track' | 'behind';

/** Input to the study plan engine -- assembled by useStudyPlan hook */
export interface StudyPlanInput {
  /** Readiness score 0-100 from calculateReadiness */
  readinessScore: number;
  /** Target readiness score -- fixed at 90 */
  readinessTarget: number;
  /** Number of SRS cards currently due for review */
  srsDueCount: number;
  /** Number of questions never practiced (totalQuestions - uniqueQuestionsPracticed) */
  unpracticedCount: number;
  /** Categories with mastery below 50% threshold */
  weakCategories: { name: string; mastery: number }[];
  /** Test date in YYYY-MM-DD format, or null for no-date mode */
  testDate: string | null;
  /** Date of most recent mock test in YYYY-MM-DD format, or null */
  lastMockTestDate: string | null;
  /** Overall mastery percentage 0-100 from useCategoryMastery */
  overallMastery: number;
  /** Injectable current date for testing (defaults to new Date()) */
  now?: Date;
}

/** Daily study plan output -- computed by computeStudyPlan */
export interface DailyPlan {
  /** Number of SRS cards to review today (capped at 20) */
  srsReviewCount: number;
  /** Number of new questions to practice today */
  newQuestionTarget: number;
  /** Drill recommendation for weakest category, or null if none weak */
  drillRecommendation: { category: string; count: number } | null;
  /** Whether to recommend a mock test today */
  mockTestRecommended: boolean;
  /** Estimated minutes for today's study session */
  estimatedMinutes: number;
  /** Pacing status relative to test date, or null when no test date */
  paceStatus: PaceStatus | null;
  /** Days remaining until test date, or null when no test date */
  daysRemaining: number | null;
}
