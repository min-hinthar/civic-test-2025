/**
 * Weak Area Detection
 *
 * Identifies categories where the user needs more practice,
 * detects stale categories not practiced recently, and
 * provides milestone progression tracking.
 */

import type { CategoryMasteryEntry } from './calculateMastery';
import type { StoredAnswer } from './masteryStore';

/** A category identified as weak (below threshold) */
export interface WeakArea {
  categoryId: string;
  mastery: number;
}

/** A category that hasn't been practiced recently */
export interface StaleCategory {
  categoryId: string;
  lastPracticed: number | null;
  daysSincePractice: number | null;
}

/** Next milestone the user is working toward */
export interface Milestone {
  level: 'bronze' | 'silver' | 'gold';
  target: number;
  remaining: number;
}

/** Milliseconds in one day */
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Detect categories below a mastery threshold.
 *
 * Returns weak categories sorted by mastery ascending (weakest first),
 * so the UI can prioritize recommendations.
 *
 * @param categoryMasteries - Current mastery for each category
 * @param threshold - Mastery percentage below which a category is "weak" (default: 60)
 * @returns Array of weak areas, sorted weakest first
 */
export function detectWeakAreas(
  categoryMasteries: CategoryMasteryEntry[],
  threshold: number = 60
): WeakArea[] {
  return categoryMasteries
    .filter(c => c.mastery < threshold)
    .map(c => ({ categoryId: c.categoryId, mastery: c.mastery }))
    .sort((a, b) => a.mastery - b.mastery);
}

/**
 * Detect categories that haven't been practiced recently.
 *
 * A category is "stale" if no answers exist for any of its questions
 * within the staleDays window, or if it has never been practiced.
 *
 * Accepts a mapping of categoryId -> questionIds so it can correctly
 * associate answers with categories. Use getCategoryQuestionIds from
 * categoryMapping.ts to build this mapping.
 *
 * @param answerHistory - Full answer history
 * @param categoryQuestionMap - Map of categoryId to its question IDs
 * @param staleDays - Number of days after which a category is considered stale (default: 7)
 * @returns Array of stale categories
 */
export function detectStaleCategories(
  answerHistory: StoredAnswer[],
  categoryQuestionMap: Record<string, string[]>,
  staleDays: number = 7
): StaleCategory[] {
  const now = Date.now();
  const staleThreshold = now - staleDays * MS_PER_DAY;
  const result: StaleCategory[] = [];

  for (const [categoryId, questionIds] of Object.entries(categoryQuestionMap)) {
    // Find answers that belong to this category's questions
    const questionIdSet = new Set(questionIds);
    const categoryAnswers = answerHistory.filter(a =>
      questionIdSet.has(a.questionId)
    );

    if (categoryAnswers.length === 0) {
      // Never practiced
      result.push({
        categoryId,
        lastPracticed: null,
        daysSincePractice: null,
      });
    } else {
      const lastPracticed = Math.max(...categoryAnswers.map(a => a.timestamp));
      if (lastPracticed < staleThreshold) {
        const daysSincePractice = Math.floor((now - lastPracticed) / MS_PER_DAY);
        result.push({
          categoryId,
          lastPracticed,
          daysSincePractice,
        });
      }
    }
  }

  return result;
}

/**
 * Get the next milestone for a given mastery level.
 *
 * Milestones:
 * - Bronze: reach 50% mastery
 * - Silver: reach 75% mastery
 * - Gold: reach 100% mastery
 *
 * @param mastery - Current mastery percentage (0-100)
 * @returns Next milestone or null if gold is achieved (mastery >= 100)
 */
export function getNextMilestone(
  mastery: number
): Milestone | null {
  if (mastery >= 100) {
    return null;
  }

  if (mastery < 50) {
    return { level: 'bronze', target: 50, remaining: 50 - mastery };
  }

  if (mastery < 75) {
    return { level: 'silver', target: 75, remaining: 75 - mastery };
  }

  return { level: 'gold', target: 100, remaining: 100 - mastery };
}
