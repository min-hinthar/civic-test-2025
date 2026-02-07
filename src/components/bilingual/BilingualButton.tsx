'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import clsx from 'clsx';
import { BilingualString } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';

// Spring physics for tactile feedback
const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
};

const variants = {
  primary:
    'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-lg shadow-primary-500/25',
  secondary:
    'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-100',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 dark:text-primary-400',
  ghost: 'text-primary-600 hover:bg-primary-100 dark:text-primary-400',
};

const sizes = {
  sm: 'px-4 py-2 min-h-[40px]',
  md: 'px-6 py-3 min-h-[48px]',
  lg: 'px-8 py-4 min-h-[56px]',
};

// Use Motion's button props to avoid type conflicts with onDrag, etc.
type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>;

export interface BilingualButtonProps extends MotionButtonProps {
  /** Button label with en and my keys */
  label: BilingualString;
  /** Visual variant */
  variant?: keyof typeof variants;
  /** Size variant */
  size?: keyof typeof sizes;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  icon?: ReactNode;
}

/**
 * Animated pill button with bilingual label.
 *
 * Features:
 * - English on top, Burmese below (stacked)
 * - Pill shape (fully rounded)
 * - Spring animation on press
 * - 44px+ minimum height for touch accessibility
 */
export const BilingualButton = forwardRef<HTMLButtonElement, BilingualButtonProps>(
  (
    {
      label,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const { showBurmese } = useLanguage();
    const isDisabled = disabled || loading;

    const motionVariants = {
      idle: { scale: 1 },
      hover: shouldReduceMotion ? {} : { scale: 1.03 },
      tap: shouldReduceMotion ? {} : { scale: 0.97 },
    };

    return (
      <motion.button
        ref={ref}
        variants={motionVariants}
        initial="idle"
        whileHover={isDisabled ? undefined : 'hover'}
        whileTap={isDisabled ? undefined : 'tap'}
        transition={springTransition}
        disabled={isDisabled}
        className={clsx(
          // Base
          'inline-flex flex-col items-center justify-center',
          // Pill shape
          'rounded-full',
          // Focus ring
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          // Disabled
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Transition
          'transition-colors duration-150',
          // Variant and size
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        ) : (
          <>
            {icon && <span className="mb-0.5">{icon}</span>}
            <span className="font-semibold leading-tight">{label.en}</span>
            {showBurmese && (
              <span className="text-sm font-normal font-myanmar opacity-80 leading-tight">
                {label.my}
              </span>
            )}
          </>
        )}
      </motion.button>
    );
  }
);
BilingualButton.displayName = 'BilingualButton';
