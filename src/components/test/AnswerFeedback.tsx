'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getRandomCorrectEncouragement, getRandomIncorrectEncouragement } from '@/lib/i18n/strings';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  show: boolean;
  correctAnswer?: string;
  correctAnswerMy?: string;
}

/**
 * Soft feedback display for answer results.
 *
 * Features:
 * - Green for correct with checkmark icon
 * - Soft orange for incorrect with X icon (never red)
 * - Bilingual encouragement message (rotating variety)
 * - Shows correct answer for incorrect responses
 * - Respects prefers-reduced-motion
 */
export function AnswerFeedback({
  isCorrect,
  show,
  correctAnswer,
  correctAnswerMy,
}: AnswerFeedbackProps) {
  const shouldReduceMotion = useReducedMotion();

  const encouragement = isCorrect
    ? getRandomCorrectEncouragement()
    : getRandomIncorrectEncouragement();

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            'rounded-2xl p-4 border',
            isCorrect
              ? 'bg-success-50 border-success-500 dark:bg-success-500/10'
              : 'bg-warning-50 border-warning-500 dark:bg-warning-500/10'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className={clsx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                isCorrect ? 'bg-success-500 text-white' : 'bg-warning-500 text-white'
              )}
            >
              {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </div>

            {/* Content */}
            <div className="flex-1">
              {/* Encouragement */}
              <p className="font-semibold text-foreground">
                {encouragement.en}
                <span className="block font-myanmar text-sm font-normal text-muted-foreground mt-0.5">
                  {encouragement.my}
                </span>
              </p>

              {/* Show correct answer for incorrect */}
              {!isCorrect && correctAnswer && (
                <div className="mt-3 pt-3 border-t border-warning-500/30">
                  <p className="text-sm text-muted-foreground">
                    Correct answer:
                    <span className="block font-myanmar">မှန်ကန်သောအဖြေ:</span>
                  </p>
                  <p className="mt-1 font-medium text-foreground">
                    {correctAnswer}
                    {correctAnswerMy && (
                      <span className="block font-myanmar text-muted-foreground">
                        {correctAnswerMy}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Answer option styling based on state.
 *
 * Features:
 * - Interactive hover states before answering
 * - Green highlight for correct answer
 * - Soft orange for incorrect selected option (never red)
 * - Dimmed non-relevant options after answering
 */
export function getAnswerOptionClasses(
  isSelected: boolean,
  isCorrect: boolean | null,
  isDisabled: boolean
): string {
  // Not yet answered
  if (isCorrect === null) {
    return clsx(
      'border-2 rounded-2xl p-4 transition-all cursor-pointer',
      'hover:border-primary-400 hover:bg-primary-50/50 hover:shadow-md',
      'dark:hover:bg-primary-500/10',
      isSelected
        ? 'border-primary-500 bg-primary-50 shadow-md dark:bg-primary-500/10'
        : 'border-border bg-card'
    );
  }

  // After answer - correct option
  if (isCorrect) {
    return clsx(
      'border-2 rounded-2xl p-4',
      'border-success-500 bg-success-50 dark:bg-success-500/10'
    );
  }

  // After answer - incorrect selected option
  if (isSelected && !isCorrect) {
    return clsx(
      'border-2 rounded-2xl p-4',
      'border-warning-500 bg-warning-50 dark:bg-warning-500/10'
    );
  }

  // After answer - other options (dimmed)
  return clsx(
    'border-2 rounded-2xl p-4',
    'border-border bg-card opacity-50',
    isDisabled && 'cursor-not-allowed'
  );
}
