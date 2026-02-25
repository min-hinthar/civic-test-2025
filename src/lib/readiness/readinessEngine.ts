/**
 * Readiness Engine
 *
 * Pure-function module that computes a 0-100 test readiness score from
 * three dimensions: accuracy, coverage, and consistency (FSRS retrievability).
 *
 * Scoring formula:
 *   uncapped = round(accuracy * 0.4 + coverage * 0.3 + consistency * 0.3)
 *
 * 60% cap rule:
 *   If any of the 3 main USCIS categories (American Government, American History,
 *   Integrated Civics) has zero coverage (no questions attempted from that
 *   category's question pool), the score is capped at min(uncapped, 60).
 *
 * Tier labels (bilingual):
 *   0-25:  "Getting Started" / "စတင်နေပါသည်"
 *   26-50: "Building Up"     / "တည်ဆောက်နေပါသည်"
 *   51-75: "Almost Ready"    / "အဆင်သင့်နီးပါပြီ"
 *   76-100: "Test Ready"     / "စာမေးပွဲ အဆင်သင့်!"
 */

import { fsrsInstance } from '@/lib/srs/fsrsEngine';
import type { ReadinessInput, ReadinessResult, TierLabel } from './types';

// ---------------------------------------------------------------------------
// Dimension weights
// ---------------------------------------------------------------------------

const ACCURACY_WEIGHT = 0.4;
const COVERAGE_WEIGHT = 0.3;
const CONSISTENCY_WEIGHT = 0.3;

/** Score cap applied when any main USCIS category has zero coverage */
const ZERO_COVERAGE_CAP = 60;

// ---------------------------------------------------------------------------
// Question counts per sub-category (from the USCIS 128-question set)
// Used for weighted accuracy averaging when per-sub-category mastery is provided.
// ---------------------------------------------------------------------------

const SUB_CATEGORY_QUESTION_COUNTS: Record<string, number> = {
  'Principles of American Democracy': 12,
  'System of Government': 35,
  'Rights and Responsibilities': 10,
  'American History: Colonial Period and Independence': 15,
  'American History: 1800s': 10,
  'Recent American History and Other Important Historical Information': 16,
  'Civics: Symbols and Holidays': 30,
};

// ---------------------------------------------------------------------------
// Dimension calculations
// ---------------------------------------------------------------------------

/**
 * Calculate accuracy dimension (0-100).
 * Weighted average of per-sub-category mastery percentages,
 * weighted by question count in each sub-category.
 */
export function calculateAccuracy(categoryMasteries: Record<string, number>): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [category, mastery] of Object.entries(categoryMasteries)) {
    const questionCount = SUB_CATEGORY_QUESTION_COUNTS[category] ?? 0;
    totalWeight += questionCount;
    weightedSum += mastery * questionCount;
  }

  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
}

/**
 * Calculate coverage dimension (0-100).
 * Percentage of total questions that have been attempted.
 */
export function calculateCoverage(attemptedCount: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.min((attemptedCount / totalQuestions) * 100, 100);
}

/**
 * Calculate consistency dimension (0-100).
 * Average FSRS retrievability across reviewed cards (reps > 0).
 * Returns 0 if no reviewed cards exist.
 *
 * Note: card.due may be a string after IndexedDB roundtrip -- coerce to Date.
 */
export function calculateConsistency(srsCards: ReadinessInput['srsCards']): number {
  const reviewed = srsCards.filter(c => c.card.reps > 0);
  if (reviewed.length === 0) return 0;

  const now = new Date();
  let totalRetrievability = 0;

  for (const { card } of reviewed) {
    // Coerce dates that may have been serialized to strings by IndexedDB
    const coercedCard = {
      ...card,
      due: card.due instanceof Date ? card.due : new Date(card.due),
      last_review:
        card.last_review instanceof Date
          ? card.last_review
          : card.last_review
            ? new Date(card.last_review)
            : undefined,
    };

    const retrievability = fsrsInstance.get_retrievability(coercedCard, now, false) as number;
    totalRetrievability += retrievability;
  }

  return (totalRetrievability / reviewed.length) * 100;
}

// ---------------------------------------------------------------------------
// Zero-coverage detection
// ---------------------------------------------------------------------------

/**
 * Find main USCIS categories with zero coverage.
 * A main category has zero coverage if NONE of its question IDs
 * appear in the set of attempted question IDs.
 */
export function findZeroCoverageCategories(
  attemptedQuestionIds: Set<string>,
  categoryQuestionMap: Record<string, string[]>
): string[] {
  const zeroCoverage: string[] = [];

  for (const [category, questionIds] of Object.entries(categoryQuestionMap)) {
    const hasAny = questionIds.some(id => attemptedQuestionIds.has(id));
    if (!hasAny) {
      zeroCoverage.push(category);
    }
  }

  return zeroCoverage;
}

// ---------------------------------------------------------------------------
// Tier labels
// ---------------------------------------------------------------------------

/**
 * Get bilingual tier label based on readiness score.
 *
 * 0-25:  "Getting Started" / "စတင်နေပါသည်"
 * 26-50: "Building Up"     / "တည်ဆောက်နေပါသည်"
 * 51-75: "Almost Ready"    / "အဆင်သင့်နီးပါပြီ"
 * 76-100: "Test Ready"     / "စာမေးပွဲ အဆင်သင့်!"
 */
export function getTierLabel(score: number): TierLabel {
  if (score <= 25) {
    return {
      en: 'Getting Started',
      my: '\u1005\u1010\u1004\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
    };
  }
  if (score <= 50) {
    return {
      en: 'Building Up',
      my: '\u1010\u100A\u103A\u1006\u1031\u102C\u1000\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
    };
  }
  if (score <= 75) {
    return {
      en: 'Almost Ready',
      my: '\u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037\u1014\u102E\u1038\u1015\u102B\u1015\u103C\u102E',
    };
  }
  return {
    en: 'Test Ready',
    my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037!',
  };
}

// ---------------------------------------------------------------------------
// Main calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the complete test readiness result.
 *
 * @param input - All data needed for calculation
 * @returns Complete readiness result with score, dimensions, tier, and cap info
 */
export function calculateReadiness(input: ReadinessInput): ReadinessResult {
  const { categoryMasteries, totalQuestions, attemptedQuestionIds, srsCards, categoryQuestionMap } =
    input;

  // Calculate individual dimensions
  const accuracyValue = calculateAccuracy(categoryMasteries);
  const coverageValue = calculateCoverage(attemptedQuestionIds.size, totalQuestions);
  const consistencyValue = calculateConsistency(srsCards);

  // Weighted sum
  const uncapped = Math.round(
    accuracyValue * ACCURACY_WEIGHT +
      coverageValue * COVERAGE_WEIGHT +
      consistencyValue * CONSISTENCY_WEIGHT
  );

  // 60% cap check: find zero-coverage main USCIS categories
  const cappedCategories = findZeroCoverageCategories(attemptedQuestionIds, categoryQuestionMap);
  const isCapped = cappedCategories.length > 0;
  const score = isCapped ? Math.min(uncapped, ZERO_COVERAGE_CAP) : uncapped;

  // Tier label based on final (potentially capped) score
  const tierLabel = getTierLabel(score);

  return {
    score,
    uncapped,
    isCapped,
    cappedCategories,
    dimensions: {
      accuracy: { value: Math.round(accuracyValue), weight: ACCURACY_WEIGHT },
      coverage: { value: Math.round(coverageValue), weight: COVERAGE_WEIGHT },
      consistency: { value: Math.round(consistencyValue), weight: CONSISTENCY_WEIGHT },
    },
    tierLabel,
  };
}
