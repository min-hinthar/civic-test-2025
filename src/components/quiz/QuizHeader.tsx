'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { strings } from '@/lib/i18n/strings';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QuizHeaderProps {
  questionNumber: number;
  totalQuestions: number;
  mode: 'mock-test' | 'practice';
  onExit: () => void;
  timerSlot?: ReactNode;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// QuizHeader
// ---------------------------------------------------------------------------

/**
 * Top bar for quiz flow: exit button (X), question counter, and optional timer.
 *
 * - Exit button triggers onExit callback (confirmation dialog handled upstream)
 * - Escape key triggers exit
 * - Not sticky -- scrolls with content per user decision
 * - Bilingual question label when showBurmese is true
 */
export function QuizHeader({
  questionNumber,
  totalQuestions,
  mode: _mode,
  onExit,
  timerSlot,
  showBurmese,
}: QuizHeaderProps) {
  // Escape key triggers exit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    },
    [onExit]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const questionLabel = showBurmese
    ? `${strings.quiz.questionNofM.my} ${questionNumber} ${strings.quiz.of.my} ${totalQuestions}`
    : `${strings.quiz.questionNofM.en} ${questionNumber} ${strings.quiz.of.en} ${totalQuestions}`;

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      {/* Exit button */}
      <button
        onClick={onExit}
        className={clsx(
          'flex items-center justify-center',
          'h-10 w-10 rounded-full',
          'text-muted-foreground hover:text-foreground',
          'hover:bg-muted/50 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
        )}
        aria-label={showBurmese ? strings.quiz.exit.my : strings.quiz.exit.en}
      >
        <X className="h-5 w-5" />
      </button>

      {/* Question counter */}
      <div className="flex flex-col items-center flex-1 min-w-0">
        <span className="text-sm font-semibold text-foreground truncate">
          {`${strings.quiz.questionNofM.en} ${questionNumber} ${strings.quiz.of.en} ${totalQuestions}`}
        </span>
        {showBurmese && (
          <span className="text-sm font-myanmar text-muted-foreground truncate">
            {questionLabel}
          </span>
        )}
      </div>

      {/* Timer slot (renders CircularTimer for mock test, nothing for practice without timer) */}
      <div className="flex items-center justify-end shrink-0">
        {timerSlot ?? <div className="w-10" aria-hidden="true" />}
      </div>
    </div>
  );
}
