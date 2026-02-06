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
}

/**
 * Shimmer skeleton loader for async content.
 *
 * Features:
 * - Shimmer animation (feels alive)
 * - Respects prefers-reduced-motion (shows solid color)
 * - Supports multiple lines with staggered widths
 * - Circle variant for avatars
 */
export function Skeleton({
  width,
  height = '1rem',
  circle = false,
  lines = 1,
  className,
  style,
  ...props
}: SkeletonProps) {
  // Multiple lines with decreasing width
  if (lines > 1) {
    const lineWidths = ['100%', '85%', '70%', '90%', '60%'];
    return (
      <div className={clsx('space-y-2', className)} {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="skeleton-shimmer rounded-lg"
            style={{
              width: lineWidths[i % lineWidths.length],
              height,
              ...style,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx('skeleton-shimmer', circle ? 'rounded-full' : 'rounded-lg', className)}
      style={{
        width: width ?? '100%',
        height: circle ? width : height,
        ...style,
      }}
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
