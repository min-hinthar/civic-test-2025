'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { clsx } from 'clsx';

// Spring physics for Duolingo-style tactile feedback
const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
};

// Button variants using theme tokens
const variants = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-lg shadow-primary/25',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
  ghost: 'text-primary hover:bg-primary/10 active:bg-primary/20',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/25',
  success: 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25',
};

// Button sizes with 44px minimum for touch accessibility
const sizes = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]', // 44px minimum for touch targets
  lg: 'px-8 py-3.5 text-lg min-h-[52px]',
};

// Use Motion's button props to avoid type conflicts with onDrag, etc.
type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>;

export interface ButtonProps extends MotionButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
}

/**
 * Animated pill button with Duolingo-style tactile feedback.
 *
 * Features:
 * - Scale down + spring back on press
 * - Scale up + shadow lift on hover (desktop)
 * - Pill shape (fully rounded ends)
 * - Respects prefers-reduced-motion
 * - 44px minimum height for touch accessibility
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    // Animation variants
    const motionVariants = {
      idle: { scale: 1 },
      hover: shouldReduceMotion
        ? {}
        : {
            scale: 1.03,
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          },
      tap: shouldReduceMotion ? {} : { scale: 0.97 },
    };

    const isDisabled = disabled || loading;

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
          // Base styles
          'inline-flex items-center justify-center font-semibold',
          // Pill shape (fully rounded)
          'rounded-full',
          // Focus ring
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          // Disabled state
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          // Transition for non-motion properties
          'transition-colors duration-150',
          // Variant and size
          variants[variant],
          sizes[size],
          // Full width
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
