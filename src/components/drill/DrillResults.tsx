'use client';

import type { Question, QuestionResult } from '@/types';
import type { CategoryName } from '@/lib/mastery';

interface DrillResultsProps {
  results: QuestionResult[];
  questions: Question[];
  totalQuestionCount: number;
  preDrillMastery: number;
  preDrillReadiness: number;
  postDrillReadiness: number;
  mode: 'weak-all' | 'category';
  categoryName?: CategoryName;
  showBurmese: boolean;
  onNewDrill: () => void;
  onPracticeCategory: () => void;
  onBackToDashboard: () => void;
}

/**
 * Post-drill results placeholder.
 * Full implementation in Task 2.
 */
export function DrillResults({
  results,
  totalQuestionCount,
  onNewDrill,
  onBackToDashboard,
}: DrillResultsProps) {
  const correctCount = results.filter(r => r.isCorrect).length;

  return (
    <div className="mx-auto max-w-md py-10 text-center">
      <h2 className="text-2xl font-bold">Drill Complete</h2>
      <p className="mt-2 text-muted-foreground">
        {correctCount} of {results.length} correct
        {results.length < totalQuestionCount &&
          ` (${results.length} of ${totalQuestionCount} questions completed)`}
      </p>
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={onNewDrill}
          className="rounded-xl bg-orange-500 px-6 py-3 text-white font-bold"
        >
          New Drill
        </button>
        <button
          onClick={onBackToDashboard}
          className="rounded-xl bg-muted px-6 py-3 text-foreground"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
