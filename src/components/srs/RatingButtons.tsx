'use client';

import { motion } from 'motion/react';
import { RotateCcw, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';

// Spring physics matching Button component (stiffness 400, damping 17)
const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
};

export interface RatingButtonsProps {
  /** Callback when user rates the card */
  onRate: (isEasy: boolean) => void;
  /** Disable buttons (e.g. during feedback animation) */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Easy/Hard rating buttons for SRS review.
 *
 * Features:
 * - Two side-by-side buttons: Hard (left, orange) and Easy (right, green)
 * - Bilingual labels (English + Burmese)
 * - Icons: RotateCcw for Hard, Check for Easy
 * - 44px minimum height for touch accessibility
 * - Spring scale animation on press
 * - Respects prefers-reduced-motion
 */
export function RatingButtons({ onRate, disabled = false, className }: RatingButtonsProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  const motionVariants = {
    idle: { scale: 1 },
    hover: shouldReduceMotion ? {} : { scale: 1.03 },
    tap: shouldReduceMotion ? {} : { scale: 0.95 },
  };

  return (
    <div className={clsx('grid grid-cols-2 gap-3', className)}>
      {/* Hard button (left) */}
      <motion.button
        type="button"
        variants={motionVariants}
        initial="idle"
        whileHover={disabled ? undefined : 'hover'}
        whileTap={disabled ? undefined : 'tap'}
        transition={springTransition}
        onClick={() => onRate(false)}
        disabled={disabled}
        className={clsx(
          'flex items-center justify-center gap-2',
          'min-h-[44px] px-4 py-2.5',
          'rounded-full border',
          'bg-warning-50',
          'border-warning-500/30',
          'text-warning',
          'font-semibold text-sm',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Rate as Hard"
      >
        <RotateCcw className="h-4 w-4 shrink-0" />
        <span className="flex flex-col items-center leading-tight">
          <span>Hard</span>
          {showBurmese && <span className="font-myanmar text-xs opacity-80">{'ခက်သည်'}</span>}
        </span>
      </motion.button>

      {/* Easy button (right) */}
      <motion.button
        type="button"
        variants={motionVariants}
        initial="idle"
        whileHover={disabled ? undefined : 'hover'}
        whileTap={disabled ? undefined : 'tap'}
        transition={springTransition}
        onClick={() => onRate(true)}
        disabled={disabled}
        className={clsx(
          'flex items-center justify-center gap-2',
          'min-h-[44px] px-4 py-2.5',
          'rounded-full border',
          'bg-success-50',
          'border-success-500/30',
          'text-success-700 dark:text-success',
          'font-semibold text-sm',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        aria-label="Rate as Easy"
      >
        <Check className="h-4 w-4 shrink-0" />
        <span className="flex flex-col items-center leading-tight">
          <span>Easy</span>
          {showBurmese && <span className="font-myanmar text-xs opacity-80">{'လွယ်သည်'}</span>}
        </span>
      </motion.button>
    </div>
  );
}
