'use client';

import { motion } from 'motion/react';
import { type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface CategoryRingProps {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Tailwind color class for the progress stroke (e.g., 'text-primary') */
  color: string;
  /** Diameter in pixels (default: 100) */
  size?: number;
  /** Stroke width in pixels (default: 8) */
  strokeWidth?: number;
  /** Content to render in the center of the ring */
  children?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Animated SVG circular progress ring.
 *
 * Features:
 * - Custom SVG with strokeDasharray/strokeDashoffset for progress
 * - Animated with motion.circle (spring: stiffness 100, damping 20)
 * - Background track circle in muted color
 * - Center content via children (percentage, badge, etc.)
 * - Respects prefers-reduced-motion
 * - SVG rotated -90deg so progress starts from top
 *
 * Usage:
 * ```tsx
 * <CategoryRing percentage={75} color="text-primary">
 *   <span className="text-xl font-bold">75%</span>
 * </CategoryRing>
 * ```
 */
export function CategoryRing({
  percentage,
  color,
  size = 100,
  strokeWidth = 8,
  children,
  className,
}: CategoryRingProps) {
  const shouldReduceMotion = useReducedMotion();

  // Calculate SVG circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />

        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          className={color}
          initial={shouldReduceMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: 'spring',
                  stiffness: 100,
                  damping: 20,
                }
          }
        />
      </svg>

      {/* Center content */}
      {children && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: 'none' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
