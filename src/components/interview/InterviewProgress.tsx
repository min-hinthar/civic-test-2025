'use client';

import { clsx } from 'clsx';
import type { InterviewMode } from '@/types';

interface InterviewProgressProps {
  mode: InterviewMode;
  /** Current question index (0-based) */
  currentIndex: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Grading results per question (null = not yet answered) */
  results: Array<{ isCorrect: boolean } | null>;
}

/**
 * Dual-indicator progress: "Q3/20" text + segmented progress bar.
 *
 * Real mode: monochrome segments (answered = slate-400, current = white pulse,
 * unanswered = slate-700) — score is hidden.
 *
 * Practice mode: colored segments (correct = green, incorrect = red,
 * current = primary pulse, unanswered = slate-700).
 */
export function InterviewProgress({
  mode,
  currentIndex,
  totalQuestions,
  results,
}: InterviewProgressProps) {
  const isReal = mode === 'realistic';
  const questionNumber = currentIndex + 1;

  return (
    <div className="w-full space-y-1.5">
      {/* Text indicator */}
      <p className="text-center text-xs font-bold text-white/80">
        Q{questionNumber}/{totalQuestions}
      </p>

      {/* Segmented progress bar */}
      <div
        role="progressbar"
        aria-valuenow={questionNumber}
        aria-valuemin={1}
        aria-valuemax={totalQuestions}
        aria-label={`Question ${questionNumber} of ${totalQuestions}`}
        className="flex w-full gap-px"
      >
        <span className="sr-only">
          Question {questionNumber} of {totalQuestions}
        </span>

        {Array.from({ length: totalQuestions }, (_, i) => {
          const isCurrent = i === currentIndex;
          const result = results[i];
          const isAnswered = result !== null && result !== undefined;

          let segmentClass: string;

          if (isReal) {
            // Monochrome: no score distinction
            if (isCurrent) {
              segmentClass = 'bg-white animate-pulse';
            } else if (isAnswered) {
              segmentClass = 'bg-slate-400';
            } else {
              segmentClass = 'bg-slate-700';
            }
          } else {
            // Colored: correct/incorrect distinction
            if (isCurrent) {
              segmentClass = 'bg-primary animate-pulse';
            } else if (isAnswered && result.isCorrect) {
              segmentClass = 'bg-success';
            } else if (isAnswered && !result.isCorrect) {
              segmentClass = 'bg-destructive';
            } else {
              segmentClass = 'bg-slate-700';
            }
          }

          return (
            <div
              key={i}
              className={clsx(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                segmentClass
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
