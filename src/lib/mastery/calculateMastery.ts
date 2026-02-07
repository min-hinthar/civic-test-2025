/**
 * Mastery Calculation Engine
 *
 * Provides recency-weighted mastery calculation with exponential decay.
 * Recent answers matter more than old ones, and test answers carry
 * more weight than practice answers.
 *
 * Core formula:
 *   weight = sessionMultiplier * Math.pow(0.5, ageDays / DECAY_HALF_LIFE_DAYS)
 *   mastery = sum(correctWeights) / sum(allWeights) * 100
 *
 * Session multipliers:
 *   - test: 1.0 (full weight)
 *   - practice: 0.7 (reduced weight)
 */

import type { StoredAnswer } from './masteryStore';

/** Weight halves every 14 days */
export const DECAY_HALF_LIFE_DAYS = 14;

/** Weight multiplier for test session answers */
export const TEST_WEIGHT = 1.0;

/** Weight multiplier for practice session answers (lower confidence signal) */
export const PRACTICE_WEIGHT = 0.7;

/** Session type weight multipliers */
const SESSION_MULTIPLIERS: Record<StoredAnswer['sessionType'], number> = {
  test: TEST_WEIGHT,
  practice: PRACTICE_WEIGHT,
};

/** Milliseconds in one day */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate the recency weight for an answer.
 * Uses exponential decay with a 14-day half-life,
 * multiplied by the session type weight.
 */
function calculateWeight(answer: StoredAnswer, now: number): number {
  const ageDays = (now - answer.timestamp) / MS_PER_DAY;
  const decayWeight = Math.pow(0.5, ageDays / DECAY_HALF_LIFE_DAYS);
  const sessionMultiplier = SESSION_MULTIPLIERS[answer.sessionType];
  return decayWeight * sessionMultiplier;
}

/**
 * Calculate mastery for a specific category (set of question IDs).
 *
 * Filters answers to only include those for the given question IDs,
 * then computes a weighted average where:
 * - Recent answers weigh more (exponential decay, 14-day half-life)
 * - Test answers weigh more than practice answers (1.0x vs 0.7x)
 *
 * @param answers - All stored answers (will be filtered by questionIds)
 * @param questionIds - The question IDs belonging to this category
 * @returns Mastery percentage (0-100), rounded to nearest integer
 */
export function calculateCategoryMastery(
  answers: StoredAnswer[],
  questionIds: string[]
): number {
  // Use Set for O(1) lookups when filtering answers by category
  const questionIdSet = new Set(questionIds);
  const categoryAnswers = answers.filter(a =>
    questionIdSet.has(a.questionId)
  );

  if (categoryAnswers.length === 0) {
    return 0;
  }

  const now = Date.now();
  let totalWeight = 0;
  let correctWeight = 0;

  for (const answer of categoryAnswers) {
    const weight = calculateWeight(answer, now);
    totalWeight += weight;
    if (answer.isCorrect) {
      correctWeight += weight;
    }
  }

  if (totalWeight === 0) {
    return 0;
  }

  return Math.round((correctWeight / totalWeight) * 100);
}

/**
 * Calculate simple accuracy for a specific question.
 *
 * Uses plain ratio (no decay) for per-question display.
 * This is simpler than category mastery since it's meant
 * for showing "you got this right 3/5 times" type info.
 *
 * @param answers - All stored answers (will be filtered by questionId)
 * @param questionId - The specific question to calculate accuracy for
 * @returns Object with correct count, total count, and accuracy percentage
 */
export function calculateQuestionAccuracy(
  answers: StoredAnswer[],
  questionId: string
): { correct: number; total: number; accuracy: number } {
  const questionAnswers = answers.filter(a => a.questionId === questionId);

  if (questionAnswers.length === 0) {
    return { correct: 0, total: 0, accuracy: 0 };
  }

  const correct = questionAnswers.filter(a => a.isCorrect).length;
  const total = questionAnswers.length;
  const accuracy = Math.round((correct / total) * 10000) / 100;

  return { correct, total, accuracy };
}

/** Entry for a category's mastery data used in overall calculation */
export interface CategoryMasteryEntry {
  categoryId: string;
  mastery: number;
  questionCount: number;
}

/**
 * Calculate overall mastery as a weighted average across categories.
 *
 * Categories with more questions contribute proportionally more
 * to the overall mastery score.
 *
 * @param categoryMasteries - Array of category mastery entries
 * @returns Overall mastery percentage (0-100), rounded to nearest integer
 */
export function calculateOverallMastery(
  categoryMasteries: CategoryMasteryEntry[]
): number {
  if (categoryMasteries.length === 0) {
    return 0;
  }

  const totalQuestions = categoryMasteries.reduce(
    (sum, c) => sum + c.questionCount,
    0
  );

  if (totalQuestions === 0) {
    return 0;
  }

  const weightedSum = categoryMasteries.reduce(
    (sum, c) => sum + c.mastery * c.questionCount,
    0
  );

  return Math.round(weightedSum / totalQuestions);
}
