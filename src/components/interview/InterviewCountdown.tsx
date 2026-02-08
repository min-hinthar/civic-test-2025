'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface InterviewCountdownProps {
  /** Called when the countdown sequence completes (after "Begin" shows) */
  onComplete: () => void;
}

/** Countdown steps: 3, 2, 1, then "Begin" */
const COUNTDOWN_STEPS = ['3', '2', '1', 'Begin'] as const;

/** Duration for each number step in ms */
const STEP_DURATION = 1000;

/** Duration for the "Begin" step in ms */
const BEGIN_DURATION = 800;

/**
 * Full-screen 3-2-1-Begin countdown overlay.
 *
 * Each number uses a spring scale animation (2.0 -> 1.0),
 * shows for 1 second, then fades and transitions to the next.
 * "Begin" shows for 0.8 seconds before calling onComplete.
 * Respects prefers-reduced-motion (shows numbers without scale, just opacity).
 */
export function InterviewCountdown({ onComplete }: InterviewCountdownProps) {
  const shouldReduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);

  const advanceStep = useCallback(() => {
    setStepIndex(prev => prev + 1);
  }, []);

  // Timer to advance through steps
  useEffect(() => {
    if (stepIndex >= COUNTDOWN_STEPS.length) {
      onComplete();
      return;
    }

    const isBegin = stepIndex === COUNTDOWN_STEPS.length - 1;
    const duration = isBegin ? BEGIN_DURATION : STEP_DURATION;
    const timer = setTimeout(advanceStep, duration);
    return () => clearTimeout(timer);
  }, [stepIndex, onComplete, advanceStep]);

  const currentStep = COUNTDOWN_STEPS[stepIndex] as string | undefined;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      {/* Interviewer avatar above countdown */}
      <div className="mb-8">
        <InterviewerAvatar size={72} />
      </div>

      {/* Countdown number/text */}
      <AnimatePresence mode="wait">
        {currentStep != null && (
          <motion.div
            key={stepIndex}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 2 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : {
                    type: 'spring',
                    stiffness: 400,
                    damping: 17,
                  }
            }
            className="select-none"
          >
            <span
              className={`block font-bold text-primary-500 ${
                currentStep === 'Begin' ? 'text-4xl sm:text-5xl' : 'text-7xl sm:text-8xl'
              }`}
            >
              {currentStep}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
