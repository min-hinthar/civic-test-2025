/**
 * Readiness Engine Types
 *
 * Type definitions for the test readiness scoring system.
 * The readiness score (0-100) is computed from three dimensions:
 * accuracy, coverage, and consistency (FSRS retrievability).
 */

import type { Card } from 'ts-fsrs';

/** Input data for readiness calculation */
export interface ReadinessInput {
  /** Per-category mastery percentages (0-100) keyed by sub-category name */
  categoryMasteries: Record<string, number>;
  /** Total question count (128 for USCIS civics test) */
  totalQuestions: number;
  /** Set of question IDs the user has attempted */
  attemptedQuestionIds: Set<string>;
  /** SRS card records for consistency calculation */
  srsCards: Array<{ questionId: string; card: Card }>;
  /**
   * Map of main USCIS category name -> array of question IDs in that category.
   * Used for the 60% cap zero-coverage check.
   */
  categoryQuestionMap: Record<string, string[]>;
}

/** Score for a single dimension (accuracy, coverage, or consistency) */
export interface DimensionScore {
  /** Raw percentage value (0-100) */
  value: number;
  /** Weight applied in overall calculation */
  weight: number;
}

/** Bilingual tier label */
export interface TierLabel {
  en: string;
  my: string;
}

/** Complete result from readiness calculation */
export interface ReadinessResult {
  /** Final score (0-100), after 60% cap if applicable */
  score: number;
  /** Uncapped score (0-100), before any cap */
  uncapped: number;
  /** Whether the score was capped due to zero-coverage categories */
  isCapped: boolean;
  /** Names of main USCIS categories with zero coverage (empty if not capped) */
  cappedCategories: string[];
  /** Per-dimension breakdown */
  dimensions: {
    accuracy: DimensionScore;
    coverage: DimensionScore;
    consistency: DimensionScore;
  };
  /** Bilingual tier label based on score */
  tierLabel: TierLabel;
}

/** Configuration for a drill session */
export interface DrillConfig {
  /** Number of questions to drill (5, 10, or 20) */
  count: number;
  /** Optional category filter (main USCIS category name) */
  category?: string;
}
