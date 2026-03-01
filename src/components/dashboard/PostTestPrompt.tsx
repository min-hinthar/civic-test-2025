'use client';

/**
 * PostTestPrompt
 *
 * Modal overlay shown when the user's test date has passed.
 * Asks "How did your test go?" with two options:
 * - "I Passed!" (green, Trophy icon) -> onPass
 * - "I Need to Reschedule" (amber, Calendar icon) -> onReschedule
 *
 * Follows the MasteryMilestone/BadgeCelebration modal pattern
 * with AnimatePresence for enter/exit animations.
 */

import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Calendar, X } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY, SPRING_GENTLE } from '@/lib/motion-config';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PostTestPromptProps {
  isOpen: boolean;
  onPass: () => void;
  onReschedule: () => void;
  onDismiss: () => void;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PostTestPrompt({
  isOpen,
  onPass,
  onReschedule,
  onDismiss,
  showBurmese,
}: PostTestPromptProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onDismiss}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal content */}
          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl border border-border/60 bg-card p-6 shadow-2xl"
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }}
            transition={shouldReduceMotion ? { duration: 0 } : SPRING_BOUNCY}
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-test-title"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={onDismiss}
              className="absolute top-3 right-3 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 id="post-test-title" className="text-xl font-bold text-foreground">
                How did your test go?
              </h2>
              {showBurmese && (
                <p className="font-myanmar text-lg text-muted-foreground mt-1">
                  {
                    '\u101E\u1004\u103A\u1037\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1018\u101A\u103A\u101C\u102D\u102F\u1016\u103C\u1005\u103A\u1015\u102B\u101E\u101C\u1032\u104B'
                  }
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {/* Pass button */}
              <motion.button
                type="button"
                onClick={onPass}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 px-4 py-4 text-white font-bold text-base min-h-[56px] hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20"
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                transition={SPRING_GENTLE}
              >
                <Trophy className="h-5 w-5" />
                <div>
                  <span>I Passed!</span>
                  {showBurmese && (
                    <span className="font-myanmar block text-sm font-normal opacity-90">
                      {
                        '\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1015\u102B\u1015\u103C\u102E!'
                      }
                    </span>
                  )}
                </div>
              </motion.button>

              {/* Reschedule button */}
              <motion.button
                type="button"
                onClick={onReschedule}
                className="flex w-full items-center justify-center gap-3 rounded-xl bg-amber-500 px-4 py-4 text-white font-bold text-base min-h-[56px] hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                transition={SPRING_GENTLE}
              >
                <Calendar className="h-5 w-5" />
                <div>
                  <span>I Need to Reschedule</span>
                  {showBurmese && (
                    <span className="font-myanmar block text-sm font-normal opacity-90">
                      {
                        '\u1021\u1001\u103B\u102D\u1014\u103A\u1015\u103C\u1014\u103A\u101E\u1010\u103A\u1019\u103E\u1010\u103A\u101B\u1014\u103A \u101C\u102D\u102F\u1015\u102B\u1010\u101A\u103A'
                      }
                    </span>
                  )}
                </div>
              </motion.button>
            </div>

            {/* Dismiss link */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Maybe later
                {showBurmese && (
                  <span className="font-myanmar ml-1">
                    {'/ \u1014\u1031\u102C\u1000\u103A\u1019\u103E\u1015\u1032'}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
