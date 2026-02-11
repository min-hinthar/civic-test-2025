'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';

// ---------------------------------------------------------------------------
// Motivational tier configuration
// ---------------------------------------------------------------------------

interface MotivationalTier {
  en: string;
  my: string;
}

const MOTIVATIONAL_TIERS: { max: number; tier: MotivationalTier }[] = [
  {
    max: 20,
    tier: {
      en: 'Just Starting',
      my: '\u1005\u1010\u1004\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
    },
  },
  {
    max: 40,
    tier: {
      en: 'Building',
      my: '\u1010\u100A\u103A\u1006\u1031\u102C\u1000\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
    },
  },
  {
    max: 60,
    tier: {
      en: 'Making Progress',
      my: '\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A',
    },
  },
  {
    max: 80,
    tier: {
      en: 'Almost There',
      my: '\u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037\u1016\u103C\u1005\u103A\u101C\u102F\u1014\u102E\u1038\u1015\u102B\u1015\u103C\u102E',
    },
  },
  {
    max: 101,
    tier: {
      en: 'Test Ready!',
      my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037!',
    },
  },
];

function getMotivationalTier(percentage: number): MotivationalTier {
  for (const { max, tier } of MOTIVATIONAL_TIERS) {
    if (percentage < max) return tier;
  }
  return MOTIVATIONAL_TIERS[MOTIVATIONAL_TIERS.length - 1].tier;
}

// ---------------------------------------------------------------------------
// Glow color based on percentage
// ---------------------------------------------------------------------------

function getGlowColor(percentage: number): string {
  if (percentage < 40) return 'hsl(0, 80%, 55%)';
  if (percentage <= 70) return 'hsl(45, 90%, 55%)';
  return 'hsl(145, 70%, 45%)';
}

// ---------------------------------------------------------------------------
// ReadinessRing component
// ---------------------------------------------------------------------------

export interface ReadinessRingProps {
  /** Progress percentage (0-100) */
  percentage: number;
  /** Diameter in pixels (default: 180) */
  size?: number;
  /** Stroke width in pixels (default: 14) */
  strokeWidth?: number;
}

/**
 * Gradient SVG ring with inner glow, animated fill, and bilingual motivational text.
 *
 * Features:
 * - SVG linearGradient stroke (red -> amber -> green)
 * - Inner glow: blurred radial gradient div behind ring, color matches percentage tier
 * - Center content: percentage number + bilingual motivational text
 * - Animates fill from 0 on first render via motion.circle pathLength
 * - Respects prefers-reduced-motion
 */
export function ReadinessRing({ percentage, size = 180, strokeWidth = 14 }: ReadinessRingProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  const tier = getMotivationalTier(clampedPercentage);
  const glowColor = getGlowColor(clampedPercentage);

  // Unique ID for the gradient (in case multiple rings exist)
  const gradientId = `readiness-gradient-${size}`;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Inner glow */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-xl"
        style={{ background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }}
      />

      {/* SVG ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        className="relative"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(0, 80%, 55%)" />
            <stop offset="50%" stopColor="hsl(45, 90%, 55%)" />
            <stop offset="100%" stopColor="hsl(145, 70%, 45%)" />
          </linearGradient>
        </defs>

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
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={shouldReduceMotion ? { strokeDashoffset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 60, damping: 20, delay: 0.2 }
          }
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold tabular-nums text-text-primary">
          {clampedPercentage}%
        </span>
        <span className="mt-0.5 text-xs font-semibold text-text-secondary">{tier.en}</span>
        {showBurmese && (
          <span className="font-myanmar text-[10px] text-text-secondary/70">{tier.my}</span>
        )}
      </div>
    </div>
  );
}
