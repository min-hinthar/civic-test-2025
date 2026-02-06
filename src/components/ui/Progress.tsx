'use client';

import { forwardRef } from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface ProgressProps {
  /** Current value (0 to max) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Color variant */
  variant?: 'default' | 'success' | 'warning';
  /** Show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const variantClasses = {
  default: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
};

/**
 * Accessible progress bar with smooth animation.
 *
 * Features:
 * - WAI-ARIA progressbar role (via Radix primitives)
 * - Animated fill transition with spring physics
 * - Multiple size and color variants
 * - Optional percentage label
 * - Respects prefers-reduced-motion
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ value, max = 100, variant = 'default', showLabel = false, size = 'md', className }, ref) => {
    const shouldReduceMotion = useReducedMotion();
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className={clsx('relative', className)}>
        <ProgressPrimitive.Root
          ref={ref}
          value={value}
          max={max}
          className={clsx('relative overflow-hidden rounded-full bg-muted', sizeClasses[size])}
        >
          <ProgressPrimitive.Indicator asChild>
            <motion.div
              initial={shouldReduceMotion ? { width: `${percentage}%` } : { width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 100, damping: 20 }
              }
              className={clsx('h-full rounded-full', variantClasses[variant])}
            />
          </ProgressPrimitive.Indicator>
        </ProgressPrimitive.Root>
        {showLabel && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground ml-2">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

/**
 * Progress bar with bilingual label
 */
export function ProgressWithLabel({
  value,
  max = 100,
  labelEn,
  labelMy,
  ...props
}: ProgressProps & { labelEn?: string; labelMy?: string }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="space-y-1">
      {(labelEn || labelMy) && (
        <div className="flex justify-between text-sm">
          <span className="text-foreground">
            {labelEn}
            {labelMy && <span className="ml-2 text-muted-foreground font-myanmar">{labelMy}</span>}
          </span>
          <span className="text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <Progress value={value} max={max} {...props} />
    </div>
  );
}
