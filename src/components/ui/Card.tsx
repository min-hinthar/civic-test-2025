'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { clsx } from 'clsx';
import { SPRING_GENTLE } from '@/lib/motion-config';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  /** Enable enter animation (scale+fade). Default: true. Set false inside StaggeredList to avoid double-animation. */
  animate?: boolean;
  children: ReactNode;
}

/**
 * Elevated card with Duolingo-inspired rounded corners and intense shadows.
 *
 * Features:
 * - 20px border radius (rounded-2xl) for chunky, friendly feel
 * - overflow-hidden to prevent child content clipping
 * - Intense gradient shadow with primary color tinting
 * - Hover lift + shadow increase (when interactive)
 * - Scale(0.95->1) + fade enter animation on mount
 * - Equally vibrant in dark mode
 * - Respects prefers-reduced-motion
 *
 * When used inside StaggeredList, set `animate={false}` to avoid double-animation
 * (StaggeredItem already handles scale + opacity + y entrance).
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      elevated = true,
      interactive = false,
      animate: enableAnimation = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const shouldAnimate = enableAnimation && !shouldReduceMotion;

    const baseClasses = clsx(
      // Base card styles
      'bg-card text-card-foreground',
      // Rounded corners (20px - Duolingo chunky)
      'rounded-2xl',
      // Overflow hidden for child content clipping
      'overflow-hidden',
      // Border
      'border border-border/60',
      // Padding
      'p-5',
      // Transition for non-motion properties
      'transition-colors duration-150',
      // Elevation shadow - semantic token handles dark mode
      elevated && 'shadow-xl shadow-primary/15',
      className
    );

    // Non-interactive card
    if (!interactive) {
      if (shouldAnimate) {
        return (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRING_GENTLE}
            className={baseClasses}
            {...(props as Omit<HTMLMotionProps<'div'>, 'ref'>)}
          >
            {children}
          </motion.div>
        );
      }
      return (
        <div ref={ref} className={baseClasses} {...props}>
          {children}
        </div>
      );
    }

    // Interactive card with hover animation - semantic token shadows
    const motionVariants = {
      idle: {
        y: 0,
        boxShadow: '0 10px 40px -10px hsl(var(--color-primary) / 0.15)',
      },
      hover: shouldReduceMotion
        ? {}
        : {
            y: -4,
            boxShadow: '0 20px 60px -15px hsl(var(--color-primary) / 0.3)',
          },
    };

    // Cast props to avoid type conflicts with motion
    const { onClick, onKeyDown, ...restProps } = props;

    return (
      <motion.div
        ref={ref}
        variants={motionVariants}
        initial={shouldAnimate ? { opacity: 0, scale: 0.95, y: 0 } : 'idle'}
        animate="idle"
        whileHover="hover"
        transition={SPRING_GENTLE}
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
 * Card header section with bold typography
 */
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('mb-4 font-bold', className)} {...props}>
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
