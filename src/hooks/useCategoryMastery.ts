'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getAnswerHistory,
  calculateCategoryMastery,
  calculateOverallMastery,
  getCategoryQuestionIds,
  USCIS_CATEGORIES,
} from '@/lib/mastery';
import type { StoredAnswer, USCISCategory, CategoryMasteryEntry } from '@/lib/mastery';
import { allQuestions } from '@/constants/questions';

/** Return type for the useCategoryMastery hook */
export interface CategoryMasteryData {
  /** Mastery percentage (0-100) for each main USCIS category */
  categoryMasteries: Record<string, number>;
  /** Mastery percentage (0-100) for each sub-category */
  subCategoryMasteries: Record<string, number>;
  /** Overall weighted mastery across all categories */
  overallMastery: number;
  /** Whether data is still loading from IndexedDB */
  isLoading: boolean;
  /** Re-fetch answer history and recalculate mastery */
  refresh: () => void;
}

/**
 * Hook that loads answer history from IndexedDB and computes mastery
 * per USCIS category and sub-category.
 *
 * Uses exponential decay with 14-day half-life (via calculateCategoryMastery).
 * Caches computed mastery with useMemo to avoid recalculating on every render.
 *
 * Usage:
 * ```tsx
 * const { categoryMasteries, overallMastery, isLoading, refresh } = useCategoryMastery();
 * // After recording a new answer:
 * refresh();
 * ```
 */
export function useCategoryMastery(): CategoryMasteryData {
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load answer history from IndexedDB
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      setIsLoading(true);
      try {
        const history = await getAnswerHistory();
        if (!cancelled) {
          setAnswers(history);
        }
      } catch {
        // IndexedDB may not be available (SSR, tests)
        if (!cancelled) {
          setAnswers([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  // Compute mastery per main USCIS category
  const categoryMasteries = useMemo(() => {
    const result: Record<string, number> = {};
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

    for (const category of categories) {
      const questionIds = getCategoryQuestionIds(category, allQuestions);
      result[category] = calculateCategoryMastery(answers, questionIds);
    }

    return result;
  }, [answers]);

  // Compute mastery per sub-category
  const subCategoryMasteries = useMemo(() => {
    const result: Record<string, number> = {};
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

    for (const category of categories) {
      const def = USCIS_CATEGORIES[category];
      for (const subCategory of def.subCategories) {
        const questionIds = getCategoryQuestionIds(subCategory, allQuestions);
        result[subCategory] = calculateCategoryMastery(answers, questionIds);
      }
    }

    return result;
  }, [answers]);

  // Compute overall mastery (weighted by question count)
  const overallMastery = useMemo(() => {
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
    const entries: CategoryMasteryEntry[] = categories.map(category => ({
      categoryId: category,
      mastery: categoryMasteries[category] ?? 0,
      questionCount: getCategoryQuestionIds(category, allQuestions).length,
    }));
    return calculateOverallMastery(entries);
  }, [categoryMasteries]);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    categoryMasteries,
    subCategoryMasteries,
    overallMastery,
    isLoading,
    refresh,
  };
}
