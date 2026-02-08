'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { BilingualText } from '@/components/bilingual/BilingualText';
import { strings } from '@/lib/i18n/strings';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SelfGradeButtonsProps {
  /** Called when user grades their answer */
  onGrade: (grade: 'correct' | 'incorrect') => void;
  /** Disable buttons (e.g., during transition) */
  disabled?: boolean;
}

/**
 * Correct/Incorrect binary grading buttons for interview self-assessment.
 *
 * Features:
 * - Side-by-side buttons with icons and bilingual text
 * - Press animation (scale down) via motion/react
 * - Brief colored flash on the container when graded
 * - Disabled state with reduced opacity
 */
export function SelfGradeButtons({ onGrade, disabled = false }: SelfGradeButtonsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [flash, setFlash] = useState<'correct' | 'incorrect' | null>(null);

  const handleGrade = useCallback(
    (grade: 'correct' | 'incorrect') => {
      if (disabled) return;
      setFlash(grade);
      onGrade(grade);
      // Clear flash after animation
      setTimeout(() => setFlash(null), 500);
    },
    [disabled, onGrade]
  );

  return (
    <div className="relative">
      {/* Flash overlay */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={clsx(
              'pointer-events-none absolute inset-0 z-10 rounded-2xl',
              flash === 'correct' ? 'bg-success-500/30' : 'bg-warning-500/30'
            )}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        {/* Correct button */}
        <motion.button
          type="button"
          onClick={() => handleGrade('correct')}
          disabled={disabled}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-4',
            'min-h-[48px]',
            'bg-success-500 text-white font-semibold',
            'transition-opacity duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <Check className="h-5 w-5" />
          <BilingualText
            text={strings.interview.correct}
            size="sm"
            className="text-white [&_span]:text-white"
          />
        </motion.button>

        {/* Incorrect button */}
        <motion.button
          type="button"
          onClick={() => handleGrade('incorrect')}
          disabled={disabled}
          whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-xl px-4',
            'min-h-[48px]',
            'bg-warning-500 text-white font-semibold',
            'transition-opacity duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <X className="h-5 w-5" />
          <BilingualText
            text={strings.interview.incorrect}
            size="sm"
            className="text-white [&_span]:text-white"
          />
        </motion.button>
      </div>
    </div>
  );
}
