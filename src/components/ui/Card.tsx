'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { clsx } from 'clsx';

// Spring physics for hover effect
const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 20,
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

/**
 * Elevated card with subtle shadow and hover lift effect.
 *
 * Features:
 * - Paper-like physical card aesthetic
 * - Subtle elevation with light shadows
 * - Hover lift + shadow increase (when interactive)
 * - 16px+ border radius (bubbly, friendly)
 * - Respects prefers-reduced-motion
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ elevated = true, interactive = false, className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    const baseClasses = clsx(
      // Base card styles
      'bg-card text-card-foreground',
      // Rounded corners (16px+)
      'rounded-2xl',
      // Border
      'border border-border/60',
      // Padding
      'p-5',
      // Transition for non-motion properties
      'transition-colors duration-150',
      // Elevation shadow
      elevated && 'shadow-lg shadow-primary/10',
      className
    );

    // Non-interactive card - no motion
    if (!interactive) {
      return (
        <div ref={ref} className={baseClasses} {...props}>
          {children}
        </div>
      );
    }

    // Interactive card with hover animation
    const motionVariants = {
      idle: {
        y: 0,
        boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.1)',
      },
      hover: shouldReduceMotion
        ? {}
        : {
            y: -4,
            boxShadow: '0 20px 60px -15px rgba(59, 130, 246, 0.25)',
          },
    };

    // Cast props to avoid type conflicts with motion
    const { onClick, onKeyDown, ...restProps } = props;

    return (
      <motion.div
        ref={ref}
        variants={motionVariants}
        initial="idle"
        whileHover="hover"
        transition={springTransition}
        className={clsx(baseClasses, 'cursor-pointer')}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...(restProps as Omit<HTMLMotionProps<'div'>, 'ref'>)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card header section
 */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card content section
 */
export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card footer section
 */
export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mt-4 pt-4 border-t border-border/40', className)} {...props}>
      {children}
    </div>
  );
}
