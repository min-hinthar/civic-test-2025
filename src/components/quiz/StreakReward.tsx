'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playStreak } from '@/lib/audio/soundEffects';
import { strings } from '@/lib/i18n/strings';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Streak milestones that trigger the reward animation */
const STREAK_MILESTONES = [3, 5, 7, 10, 15, 20] as const;

/** Duration in ms before the badge auto-hides */
const DISPLAY_DURATION_MS = 2000;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface StreakRewardProps {
  /** Current streak count */
  count: number;
  /** Whether to trigger the animation */
  show: boolean;
  /** Whether to display Burmese text */
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Check if a count is a streak milestone */
function isMilestone(count: number): boolean {
  return STREAK_MILESTONES.includes(count as (typeof STREAK_MILESTONES)[number]);
}

/** Get badge tier based on streak count */
function getBadgeTier(count: number): { emoji: string; colorClass: string; scale: number } {
  if (count >= 10) {
    return {
      emoji: '\uD83C\uDFC6',
      colorClass: 'bg-accent-purple/20 text-accent-purple',
      scale: 1.15,
    };
  }
  if (count >= 5) {
    return {
      emoji: '\u2B50',
      colorClass: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
      scale: 1.08,
    };
  }
  // 3+
  return {
    emoji: '\uD83D\uDD25',
    colorClass: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
    scale: 1,
  };
}

// ---------------------------------------------------------------------------
// StreakReward
// ---------------------------------------------------------------------------

/**
 * Streak milestone celebration badge.
 *
 * Shows a floating "X in a row!" badge at specific streak milestones
 * (3, 5, 7, 10, 15, 20). Badge tier determines emoji, color, and size.
 * Plays streak sound at milestones >= 10.
 *
 * Position: rendered inline above the feedback panel, centered.
 * Auto-removes after 2 seconds.
 * Reduced motion: simple fade instead of scale+float.
 */
export function StreakReward({ count, show, showBurmese }: StreakRewardProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasPlayedSoundRef = useRef(false);

  // Play streak sound for high milestones (>= 10)
  useEffect(() => {
    if (show && isMilestone(count) && count >= 10 && !hasPlayedSoundRef.current) {
      hasPlayedSoundRef.current = true;
      playStreak();
    }
    if (!show) {
      hasPlayedSoundRef.current = false;
    }
  }, [show, count]);

  const shouldShow = show && isMilestone(count);
  const tier = getBadgeTier(count);

  return (
    <>
      {/* Persistent sr-only live region -- always in DOM for reliable announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {shouldShow ? `${count} correct in a row!` : ''}
      </div>

      <AnimatePresence>
        {shouldShow && (
          <motion.div
            key={`streak-${count}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, y: 10 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: tier.scale, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={shouldReduceMotion ? { duration: 0.2 } : SPRING_BOUNCY}
            className="flex justify-center pointer-events-none"
            aria-hidden="true"
          >
            <div
              className={clsx(
                'inline-flex items-center gap-2 rounded-full px-4 py-2',
                'font-bold shadow-lg',
                tier.colorClass
              )}
            >
              <span aria-hidden="true" className="text-lg">
                {tier.emoji}
              </span>
              <span className="text-sm">
                {count} {strings.quiz.streakInRow.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar text-xs font-normal">
                    {count} {strings.quiz.streakInRow.my}
                  </span>
                )}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Duration in ms for how long the streak reward is displayed */
export const STREAK_DISPLAY_DURATION_MS = DISPLAY_DURATION_MS;
