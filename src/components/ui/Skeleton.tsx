'use client';

import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of skeleton (default: 100%) */
  width?: string | number;
  /** Height of skeleton (default: 1rem) */
  height?: string | number;
  /** Make skeleton circular */
  circle?: boolean;
  /** Number of lines to render */
  lines?: number;
  /** Shimmer variant: 'default' uses neutral shimmer, 'accent' uses primary-tinted shimmer */
  variant?: 'default' | 'accent';
  /** Accessible label for screen readers (e.g., "Loading Dashboard...") */
  'aria-label'?: string;
  /** Enable staggered entrance animation delay */
  stagger?: boolean;
  /** Index for stagger delay calculation (delay = index * 80ms) */
  index?: number;
}

/**
 * Shimmer skeleton loader for async content.
 *
 * Features:
 * - Shimmer animation (feels alive)
 * - Accent-tinted shimmer variant for branded loading
 * - Respects prefers-reduced-motion (shows solid color)
 * - Supports multiple lines with staggered widths
 * - Circle variant for avatars
 * - Staggered entrance animation (top to bottom)
 * - Screen reader announcement via aria-label + role="status"
 */
export function Skeleton({
  width,
  height = '1rem',
  circle = false,
  lines = 1,
  variant = 'default',
  'aria-label': ariaLabel,
  stagger = false,
  index = 0,
  className,
  style,
  ...props
}: SkeletonProps) {
  const shimmerClass = variant === 'accent' ? 'skeleton-accent' : 'skeleton-shimmer';
  const staggerStyle = stagger ? { animationDelay: `${index * 80}ms` } : {};
  const a11yProps = ariaLabel ? { 'aria-label': ariaLabel, role: 'status' as const } : {};

  // Multiple lines with decreasing width
  if (lines > 1) {
    const lineWidths = ['100%', '85%', '70%', '90%', '60%'];
    return (
      <div className={clsx('space-y-2', className)} {...a11yProps} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(shimmerClass, 'rounded-lg')}
            style={{
              width: lineWidths[i % lineWidths.length],
              height,
              ...(stagger ? { animationDelay: `${(index + i) * 80}ms` } : {}),
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(shimmerClass, circle ? 'rounded-full' : 'rounded-lg', className)}
      style={{
        width: width ?? '100%',
        height: circle ? width : height,
        ...staggerStyle,
        ...style,
      }}
      {...a11yProps}
      {...props}
    />
  );
}

/**
 * Skeleton card matching Card component dimensions
 */
export function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('rounded-2xl border border-border/60 bg-card p-5', className)} {...props}>
      <Skeleton height="1.5rem" width="60%" className="mb-4" />
      <Skeleton lines={3} height="1rem" />
      <div className="mt-4 flex gap-2">
        <Skeleton height="2.5rem" width="6rem" className="rounded-full" />
        <Skeleton height="2.5rem" width="6rem" className="rounded-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for avatar/profile images
 */
export function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return <Skeleton circle width={size} height={size} className={className} />;
}
