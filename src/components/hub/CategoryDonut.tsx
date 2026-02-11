'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Mastery-level color interpolation (red -> amber -> green)
// ---------------------------------------------------------------------------

/**
 * Returns an HSL color string interpolated across the mastery gradient:
 * 0% = red (hsl(0, 80%, 55%)), 50% = amber (hsl(45, 90%, 55%)), 100% = green (hsl(145, 70%, 45%))
 */
function getMasteryColor(percentage: number): string {
  const clamped = Math.max(0, Math.min(100, percentage));

  if (clamped <= 50) {
    // red (0) -> amber (45) for h, 80->90 for s, 55->55 for l
    const t = clamped / 50;
    const h = 0 + t * 45;
    const s = 80 + t * 10;
    return `hsl(${h}, ${s}%, 55%)`;
  }

  // amber (45) -> green (145) for h, 90->70 for s, 55->45 for l
  const t = (clamped - 50) / 50;
  const h = 45 + t * 100;
  const s = 90 - t * 20;
  const l = 55 - t * 10;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// ---------------------------------------------------------------------------
// CategoryDonut component
// ---------------------------------------------------------------------------

export interface CategoryDonutProps {
  /** Mastery percentage (0-100) */
  percentage: number;
  /** Diameter in pixels (default: 80) */
  size?: number;
  /** Stroke width in pixels (default: 7) */
  strokeWidth?: number;
  /** Bilingual label (for aria) */
  label?: { en: string; my: string };
}

/**
 * Gradient-filled donut chart per USCIS category.
 *
 * Features:
 * - Stroke color interpolated from red -> amber -> green based on mastery percentage
 * - Animated fill from 0 on first render using motion.circle
 * - Percentage number displayed inside the ring
 * - Respects prefers-reduced-motion
 */
export function CategoryDonut({
  percentage,
  size = 80,
  strokeWidth = 7,
  label,
}: CategoryDonutProps) {
  const shouldReduceMotion = useReducedMotion();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;
  const strokeColor = getMasteryColor(clampedPercentage);

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ? `${label.en}: ${clampedPercentage}%` : `${clampedPercentage}%`}
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
          className="text-muted-foreground/15"
        />

        {/* Animated progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduceMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 80, damping: 20, delay: 0.3 }
          }
        />
      </svg>

      {/* Percentage inside */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-text-primary">
          {clampedPercentage}%
        </span>
      </div>
    </div>
  );
}

// Re-export the helper for use by SubcategoryBar
export { getMasteryColor };
