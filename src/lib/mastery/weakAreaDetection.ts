/**
 * Weak Area Detection - Stub
 *
 * Will be implemented in GREEN phase.
 */
import type { CategoryMasteryEntry } from './calculateMastery';
import type { StoredAnswer } from './masteryStore';

export interface WeakArea {
  categoryId: string;
  mastery: number;
}

export interface StaleCategory {
  categoryId: string;
  lastPracticed: number | null;
  daysSincePractice: number | null;
}

export interface Milestone {
  level: 'bronze' | 'silver' | 'gold';
  target: number;
  remaining: number;
}

export function detectWeakAreas(
  _categoryMasteries: CategoryMasteryEntry[],
  _threshold?: number
): WeakArea[] {
  throw new Error('Not implemented');
}

export function detectStaleCategories(
  _answerHistory: StoredAnswer[],
  _categoryIds: string[],
  _staleDays?: number
): StaleCategory[] {
  throw new Error('Not implemented');
}

export function getNextMilestone(
  _mastery: number
): Milestone | null {
  throw new Error('Not implemented');
}
