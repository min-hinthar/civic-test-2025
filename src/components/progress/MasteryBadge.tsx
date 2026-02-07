'use client';

import { Medal, Crown, Circle } from 'lucide-react';
import { clsx } from 'clsx';

/** Milestone levels for mastery progression */
export type MilestoneLevel = 'none' | 'bronze' | 'silver' | 'gold';

/**
 * Determine the milestone level based on mastery percentage.
 *
 * Thresholds:
 * - 0-49:  'none'
 * - 50-74: 'bronze'
 * - 75-99: 'silver'
 * - 100:   'gold'
 */
export function getMilestoneLevel(mastery: number): MilestoneLevel {
  if (mastery >= 100) return 'gold';
  if (mastery >= 75) return 'silver';
  if (mastery >= 50) return 'bronze';
  return 'none';
}

export interface MasteryBadgeProps {
  /** Mastery percentage (0-100) */
  mastery: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

// Size mappings in pixels
const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
} as const;

// Background + text color classes for each level
const levelStyles: Record<MilestoneLevel, { bg: string; icon: string }> = {
  none: {
    bg: 'bg-muted/40',
    icon: 'text-muted-foreground/40',
  },
  bronze: {
    bg: 'bg-amber-100 dark:bg-amber-950/30',
    icon: 'text-amber-600 dark:text-amber-500',
  },
  silver: {
    bg: 'bg-slate-100 dark:bg-slate-800/40',
    icon: 'text-slate-400 dark:text-slate-300',
  },
  gold: {
    bg: 'bg-yellow-100 dark:bg-yellow-950/30 ring-1 ring-yellow-300/50',
    icon: 'text-yellow-500 dark:text-yellow-400',
  },
};

/**
 * Mastery badge component showing bronze/silver/gold achievement level.
 *
 * Features:
 * - Icon-based badges using lucide-react
 * - none: outline circle (empty state)
 * - bronze: Medal icon in amber with warm background
 * - silver: Medal icon in slate with cool background
 * - gold: Crown icon in yellow with golden glow
 * - Three size variants: sm (16px), md (24px), lg (32px)
 *
 * Usage:
 * ```tsx
 * <MasteryBadge mastery={75} size="md" />
 * ```
 */
export function MasteryBadge({ mastery, size = 'md', className }: MasteryBadgeProps) {
  const level = getMilestoneLevel(mastery);
  const iconSize = sizeMap[size];
  const styles = levelStyles[level];

  // Padding scales with size
  const paddingMap = { sm: 'p-1', md: 'p-1.5', lg: 'p-2' } as const;

  return (
    <div
      className={clsx(
        'inline-flex items-center justify-center rounded-full',
        paddingMap[size],
        styles.bg,
        className
      )}
      title={level === 'none' ? 'No badge yet' : `${level.charAt(0).toUpperCase() + level.slice(1)} badge`}
    >
      {level === 'none' && (
        <Circle className={styles.icon} size={iconSize} strokeWidth={1.5} />
      )}
      {level === 'bronze' && (
        <Medal className={styles.icon} size={iconSize} strokeWidth={1.5} />
      )}
      {level === 'silver' && (
        <Medal className={styles.icon} size={iconSize} strokeWidth={1.5} />
      )}
      {level === 'gold' && (
        <Crown className={styles.icon} size={iconSize} strokeWidth={1.5} />
      )}
    </div>
  );
}
