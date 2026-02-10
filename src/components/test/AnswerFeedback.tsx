'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Star } from 'lucide-react';
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
 * Gamified feedback display for answer results.
 *
 * Features:
 * - Green for correct with animated star + checkmark icon
 * - Soft orange for incorrect with gentle shake X icon (never red)
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
            isCorrect ? 'bg-success-subtle border-success' : 'bg-warning-subtle border-warning'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Animated icon */}
            {isCorrect ? (
              <motion.div
                initial={shouldReduceMotion ? {} : { scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 400, damping: 12 }
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-white"
              >
                <Star className="h-5 w-5 fill-current" />
              </motion.div>
            ) : (
              <motion.div
                initial={shouldReduceMotion ? {} : { x: 0 }}
                animate={shouldReduceMotion ? {} : { x: [0, -4, 4, -3, 3, -1, 0] }}
                transition={
                  shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeInOut' }
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning text-white"
              >
                <X className="h-5 w-5" />
              </motion.div>
            )}

            {/* Content */}
            <div className="flex-1">
              {/* Encouragement with animated check for correct */}
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground">
                  {encouragement.en}
                  <span className="block font-myanmar text-sm font-normal text-muted-foreground mt-0.5">
                    {encouragement.my}
                  </span>
                </p>
                {isCorrect && (
                  <motion.div
                    initial={shouldReduceMotion ? {} : { scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0 }
                        : { delay: 0.2, type: 'spring', stiffness: 500, damping: 15 }
                    }
                  >
                    <Check className="h-5 w-5 text-success" />
                  </motion.div>
                )}
              </div>

              {/* Show correct answer for incorrect */}
              {!isCorrect && correctAnswer && (
                <div className="mt-3 pt-3 border-t border-warning/30">
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
      'hover:border-primary-400 hover:bg-primary-subtle/50 hover:shadow-md',
      '',
      isSelected ? 'border-primary bg-primary-subtle shadow-md' : 'border-border bg-card'
    );
  }

  // After answer - correct option
  if (isCorrect) {
    return clsx('border-2 rounded-2xl p-4', 'border-success bg-success-subtle');
  }

  // After answer - incorrect selected option
  if (isSelected && !isCorrect) {
    return clsx('border-2 rounded-2xl p-4', 'border-warning bg-warning-subtle');
  }

  // After answer - other options (dimmed)
  return clsx(
    'border-2 rounded-2xl p-4',
    'border-border bg-card opacity-50',
    isDisabled && 'cursor-not-allowed'
  );
}
