/**
 * useSRSWidget - Hook providing data for the dashboard SRS widget.
 *
 * Computes due count, review streak, category breakdown, and
 * next-due text from the SRS deck for dashboard display.
 */

import { useMemo } from 'react';
import { useSRS } from '@/contexts/SRSContext';
import { isDue, getNextReviewText } from '@/lib/srs';
import { allQuestions } from '@/constants/questions';
import { getUSCISCategory, USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import type { Question } from '@/types';

/** Category breakdown entry for the widget */
interface CategoryBreakdownEntry {
  categoryId: string;
  dueCount: number;
  totalCount: number;
}

// Build a questionId -> Question lookup map once at module level
const questionsById: Map<string, Question> = new Map(
  allQuestions.map((q) => [q.id, q])
);

/**
 * Compute review streak: count consecutive days (backwards from today)
 * that have at least one reviewed card.
 */
function computeReviewStreak(
  deck: { lastReviewedAt?: string }[]
): number {
  // Collect unique review dates (YYYY-MM-DD)
  const reviewDates = new Set<string>();
  for (const record of deck) {
    if (record.lastReviewedAt) {
      const date = record.lastReviewedAt.slice(0, 10); // 'YYYY-MM-DD'
      reviewDates.add(date);
    }
  }

  if (reviewDates.size === 0) return 0;

  // Count consecutive days backwards from today
  let streak = 0;
  const now = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().slice(0, 10);

    if (reviewDates.has(dateStr)) {
      streak++;
    } else if (i === 0) {
      // Today hasn't been reviewed yet, that's ok -- check yesterday
      continue;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Hook providing dashboard widget data for the SRS system.
 *
 * Returns due count, review streak, category breakdown,
 * and empty/caught-up states for the SRS dashboard widget.
 */
export function useSRSWidget() {
  const { deck, dueCount, isLoading } = useSRS();

  const reviewStreak: number = useMemo(
    () => computeReviewStreak(deck),
    [deck]
  );

  const categoryBreakdown: CategoryBreakdownEntry[] = useMemo(() => {
    // Group deck cards by USCIS main category
    const categoryMap = new Map<
      string,
      { dueCount: number; totalCount: number }
    >();

    // Initialize all categories
    for (const catName of Object.keys(USCIS_CATEGORIES)) {
      categoryMap.set(catName, { dueCount: 0, totalCount: 0 });
    }

    for (const record of deck) {
      const question = questionsById.get(record.questionId);
      if (!question) continue;

      const mainCategory: USCISCategory = getUSCISCategory(question.category);
      const entry = categoryMap.get(mainCategory);
      if (entry) {
        entry.totalCount++;
        if (isDue(record.card)) {
          entry.dueCount++;
        }
      }
    }

    const result: CategoryBreakdownEntry[] = [];
    for (const [categoryId, counts] of categoryMap) {
      if (counts.totalCount > 0) {
        result.push({
          categoryId,
          dueCount: counts.dueCount,
          totalCount: counts.totalCount,
        });
      }
    }

    return result;
  }, [deck]);

  const isEmpty = deck.length === 0;
  const isAllCaughtUp = !isEmpty && dueCount === 0;

  const nextDueText: { en: string; my: string } | null = useMemo(() => {
    if (!isAllCaughtUp) return null;

    // Find the card with the earliest future due date
    let earliest: { due: Date; card: (typeof deck)[0] } | null = null;
    for (const record of deck) {
      const dueDate = record.card.due;
      if (!earliest || dueDate < earliest.due) {
        earliest = { due: dueDate, card: record };
      }
    }

    if (!earliest) return null;

    return getNextReviewText(earliest.card.card);
  }, [deck, isAllCaughtUp]);

  return {
    dueCount,
    reviewStreak,
    categoryBreakdown,
    isEmpty,
    isAllCaughtUp,
    nextDueText,
    isLoading,
  };
}
