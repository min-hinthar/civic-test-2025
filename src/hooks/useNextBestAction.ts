'use client';

/**
 * useNextBestAction - Composition hook bridging data hooks to NBA pure function.
 *
 * Aggregates state from 5+ data sources (streak, SRS, category mastery,
 * test history, interview history, practice count) and feeds them into
 * the pure determineNextBestAction function.
 *
 * Waits for ALL data sources to finish loading before computing
 * to avoid partial-data flash. Returns typed NBAState via useMemo.
 *
 * React Compiler safe:
 * - useMemo for derived state (no useState+useEffect for NBA computation)
 * - Cancellation pattern for async IndexedDB loads
 * - No setState in effect bodies (only in async callbacks with cancelled guard)
 */

import { useState, useEffect, useMemo } from 'react';

import { useStreak } from '@/hooks/useStreak';
import { useSRSWidget } from '@/hooks/useSRSWidget';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTestDate } from '@/hooks/useTestDate';
import { getInterviewHistory } from '@/lib/interview/interviewStore';
import { getAnswerHistory } from '@/lib/mastery';
import { totalQuestions } from '@/constants/questions';
import { determineNextBestAction } from '@/lib/nba';
import type { NBAState } from '@/lib/nba';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseNextBestActionReturn {
  /** NBA recommendation state -- null while any data source is loading */
  nbaState: NBAState | null;
  /** Whether any data source is still loading */
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Composition hook that bridges existing data hooks to the pure NBA engine.
 *
 * Data sources:
 * 1. useStreak -> currentStreak, activityDates
 * 2. useSRSWidget -> srsDueCount
 * 3. useCategoryMastery -> categoryMasteries, overallMastery
 * 4. useAuth -> user.testHistory
 * 5. getInterviewHistory() -> interview pass/fail history (IndexedDB)
 * 6. getAnswerHistory() -> unique questions practiced count (IndexedDB)
 *
 * Usage:
 * ```tsx
 * const { nbaState, isLoading } = useNextBestAction();
 * if (isLoading || !nbaState) return <NBAHeroSkeleton />;
 * return <NBAHeroCard nbaState={nbaState} />;
 * ```
 */
export function useNextBestAction(): UseNextBestActionReturn {
  // -------------------------------------------------------------------------
  // 1. Existing hooks
  // -------------------------------------------------------------------------
  const { currentStreak, activityDates, isLoading: streakLoading } = useStreak();

  const { dueCount: srsDueCount, isLoading: srsLoading } = useSRSWidget();

  const { categoryMasteries, overallMastery, isLoading: masteryLoading } = useCategoryMastery();

  const { user, isLoading: authLoading } = useAuth();

  const { testDate } = useTestDate();

  // -------------------------------------------------------------------------
  // 2. Interview history from IndexedDB
  // -------------------------------------------------------------------------
  const [interviewHistory, setInterviewHistory] = useState<{ date: string; passed: boolean }[]>([]);
  const [interviewLoading, setInterviewLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getInterviewHistory()
      .then(sessions => {
        if (!cancelled) {
          setInterviewHistory(
            sessions.map(s => ({
              date: s.date,
              passed: s.passed,
            }))
          );
          setInterviewLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setInterviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------------------------------------------------------
  // 3. Unique questions practiced count from IndexedDB
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
  // 4. Combined loading state -- wait for ALL sources
  // -------------------------------------------------------------------------
  const isLoading =
    streakLoading ||
    srsLoading ||
    masteryLoading ||
    authLoading ||
    interviewLoading ||
    questionsLoading;

  // -------------------------------------------------------------------------
  // 5. Derive NBAState via useMemo (React Compiler safe)
  // -------------------------------------------------------------------------
  const nbaState: NBAState | null = useMemo(() => {
    if (isLoading) return null;

    // Map test history from auth user (Supabase) to NBA input format
    const testHistory = (user?.testHistory ?? []).map(s => ({
      date: s.date,
      score: s.score,
      totalQuestions: s.totalQuestions,
    }));

    return determineNextBestAction({
      currentStreak,
      activityDates,
      srsDueCount,
      overallMastery,
      categoryMasteries,
      testHistory,
      interviewHistory,
      uniqueQuestionsPracticed: uniqueQuestionsCount,
      totalQuestions,
      testDate,
    });
  }, [
    isLoading,
    currentStreak,
    activityDates,
    srsDueCount,
    overallMastery,
    categoryMasteries,
    user?.testHistory,
    interviewHistory,
    uniqueQuestionsCount,
    testDate,
  ]);

  return { nbaState, isLoading };
}
