'use client';

import { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { MasteryBadge } from '@/components/progress/MasteryBadge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { getAnswerHistory } from '@/lib/mastery/masteryStore';
import { calculateQuestionAccuracy } from '@/lib/mastery/calculateMastery';
import type { StoredAnswer } from '@/lib/mastery';

export interface CategoryHeaderBadgeProps {
  /** Category name to look up mastery for */
  category: string;
}

/**
 * Shows a MasteryBadge (bronze/silver/gold) alongside the mastery percentage
 * for a category header in the study guide.
 *
 * Looks up mastery from useCategoryMastery hook.
 */
export function CategoryHeaderBadge({ category }: CategoryHeaderBadgeProps) {
  const { categoryMasteries } = useCategoryMastery();
  const { showBurmese } = useLanguage();
  const mastery = categoryMasteries[category] ?? 0;

  // Don't show anything if no data yet
  if (mastery === 0 && Object.keys(categoryMasteries).length === 0) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <MasteryBadge mastery={mastery} size="sm" />
      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
        {mastery}%
      </span>
    </div>
  );
}

export interface QuestionAccuracyDotProps {
  /** Question ID to look up accuracy for */
  questionId: string;
}

/**
 * Small indicator dot on individual questions showing accuracy history.
 *
 * - Green dot: most recent answer was correct
 * - Orange dot: most recent answer was incorrect
 * - No dot: unattempted
 *
 * Uses the most recent answer for the question to determine status.
 */
export function QuestionAccuracyDot({ questionId }: QuestionAccuracyDotProps) {
  const [answers, setAnswers] = useState<StoredAnswer[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAnswerHistory().then(history => {
      if (!cancelled) setAnswers(history);
    }).catch(() => {
      // IndexedDB not available
    });
    return () => { cancelled = true; };
  }, []);

  // Find the most recent answer for this question
  const status = useMemo(() => {
    const questionAnswers = answers
      .filter(a => a.questionId === questionId)
      .sort((a, b) => b.timestamp - a.timestamp);

    if (questionAnswers.length === 0) return null;
    return questionAnswers[0].isCorrect ? 'correct' : 'incorrect';
  }, [answers, questionId]);

  if (status === null) return null;

  return (
    <span
      className={clsx(
        'inline-block h-2.5 w-2.5 rounded-full shrink-0',
        status === 'correct'
          ? 'bg-success-500'
          : 'bg-warning-500'
      )}
      title={status === 'correct' ? 'Previously answered correctly' : 'Previously answered incorrectly'}
      aria-label={status === 'correct' ? 'Correct' : 'Needs review'}
    />
  );
}
