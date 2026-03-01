'use client';

/**
 * useStudyPlan - Composition hook bridging data hooks to study plan engine.
 *
 * Aggregates state from 6 data sources (test date, readiness, SRS,
 * category mastery, auth/test history, IndexedDB answer history) and
 * feeds them into the pure computeStudyPlan function via useMemo.
 *
 * Waits for ALL data sources to finish loading before computing
 * to avoid partial-data flash. Returns typed DailyPlan.
 *
 * React Compiler safe:
 * - useMemo for derived state (no useState+useEffect for plan computation)
 * - Cancellation pattern for async IndexedDB loads
 * - No setState in effect bodies (only in async callbacks with cancelled guard)
 */

import { useState, useEffect, useMemo } from 'react';

import { useTestDate } from '@/hooks/useTestDate';
import { useReadinessScore } from '@/hooks/useReadinessScore';
import { useSRSWidget } from '@/hooks/useSRSWidget';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import { USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import { computeStudyPlan } from '@/lib/studyPlan';
import type { DailyPlan } from '@/lib/studyPlan';
import type { PostTestAction } from '@/hooks/useTestDate';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseStudyPlanReturn {
  /** Computed daily study plan -- null while any data source is loading */
  dailyPlan: DailyPlan | null;
  /** Current test date in YYYY-MM-DD format, or null */
  testDate: string | null;
  /** Set or clear the test date */
  setTestDate: (date: string | null) => void;
  /** Current post-test action state */
  postTestAction: PostTestAction;
  /** Update the post-test action */
  setPostTestAction: (action: PostTestAction) => void;
  /** Whether any data source is still loading */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Composition hook that bridges existing data hooks to the pure study plan engine.
 *
 * Data sources:
 * 1. useTestDate -> testDate
 * 2. useReadinessScore -> readiness score
 * 3. useSRSWidget -> srsDueCount
 * 4. useCategoryMastery -> categoryMasteries, overallMastery
 * 5. useAuth -> user.testHistory (for lastMockTestDate)
 * 6. getAnswerHistory() -> unique questions practiced count (IndexedDB)
 *
 * Usage:
 * ```tsx
 * const { dailyPlan, testDate, setTestDate, isLoading } = useStudyPlan();
 * if (isLoading || !dailyPlan) return <StudyPlanSkeleton />;
 * return <StudyPlanCard plan={dailyPlan} />;
 * ```
 */
export function useStudyPlan(): UseStudyPlanReturn {
  // -------------------------------------------------------------------------
  // 1. Test date from localStorage
  // -------------------------------------------------------------------------
  const { testDate, setTestDate, postTestAction, setPostTestAction } = useTestDate();

  // -------------------------------------------------------------------------
  // 2. Readiness score
  // -------------------------------------------------------------------------
  const { readiness, isLoading: readinessLoading } = useReadinessScore();

  // -------------------------------------------------------------------------
  // 3. SRS due count
  // -------------------------------------------------------------------------
  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();

  // -------------------------------------------------------------------------
  // 4. Category mastery
  // -------------------------------------------------------------------------
  const { categoryMasteries, overallMastery, isLoading: masteryLoading } = useCategoryMastery();

  // -------------------------------------------------------------------------
  // 5. Auth (test history for lastMockTestDate)
  // -------------------------------------------------------------------------
  const { user, isLoading: authLoading } = useAuth();

  // -------------------------------------------------------------------------
  // 6. Unique questions practiced count from IndexedDB
  // -------------------------------------------------------------------------
  const [uniqueQuestionsCount, setUniqueQuestionsCount] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getAnswerHistory()
      .then(answers => {
        if (!cancelled) {
          const unique = new Set(answers.map(a => a.questionId));
          setUniqueQuestionsCount(unique.size);
          setQuestionsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setQuestionsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // 7. Combined loading state -- wait for ALL sources
  // -------------------------------------------------------------------------
  const isLoading =
    readinessLoading || srsLoading || masteryLoading || authLoading || questionsLoading;

  // -------------------------------------------------------------------------
  // 8. Derive DailyPlan via useMemo (React Compiler safe)
  // -------------------------------------------------------------------------
  const dailyPlan: DailyPlan | null = useMemo(() => {
    if (isLoading) return null;

    // Derive lastMockTestDate from user's test history
    const testHistory = user?.testHistory ?? [];
    let lastMockTestDate: string | null = null;
    if (testHistory.length > 0) {
      const sorted = testHistory.slice().sort((a, b) => b.date.localeCompare(a.date));
      lastMockTestDate = sorted[0].date;
    }

    // Build weak categories from main USCIS categories (not sub-categories)
    const weakCategories: { name: string; mastery: number }[] = [];
    for (const catName of Object.keys(USCIS_CATEGORIES) as USCISCategory[]) {
      const mastery = categoryMasteries[catName];
      if (mastery !== undefined && mastery < 50) {
        weakCategories.push({ name: catName, mastery });
      }
    }

    const unpracticedCount = totalQuestions - uniqueQuestionsCount;

    return computeStudyPlan({
      readinessScore: readiness?.score ?? 0,
      readinessTarget: 90,
      srsDueCount,
      unpracticedCount,
      weakCategories,
      testDate,
      lastMockTestDate,
      overallMastery,
    });
  }, [
    isLoading,
    readiness,
    srsDueCount,
    categoryMasteries,
    overallMastery,
    user?.testHistory,
    uniqueQuestionsCount,
    testDate,
  ]);

  return {
    dailyPlan,
    testDate,
    setTestDate,
    postTestAction,
    setPostTestAction,
    isLoading,
  };
}
