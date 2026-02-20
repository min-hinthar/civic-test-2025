'use client';

import { useState } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { XPPopup } from '@/components/quiz/XPPopup';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface XPCounterProps {
  /** Current XP total */
  xp: number;
  /** Previous XP total (before latest gain) */
  previousXp: number;
}

// ---------------------------------------------------------------------------
// XPCounter
// ---------------------------------------------------------------------------

/**
 * Spring-animated XP counter for the quiz header.
 *
 * Features:
 * - Displays current XP with amber/gold styling
 * - Spring pulse animation when XP increments
 * - Renders floating "+N XP" via XPPopup on gain
 * - React Compiler safe (no setState in effects)
 *
 * Usage:
 * ```tsx
 * <XPCounter xp={120} previousXp={100} />
 * ```
 */
export function XPCounter({ xp, previousXp }: XPCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  const controls = useAnimationControls();

  // Track previous XP using render-time comparison (React Compiler safe)
  const [prevXp, setPrevXp] = useState(previousXp);
  const gained = xp - prevXp;

  if (xp !== prevXp) {
    if (xp > prevXp && !shouldReduceMotion) {
      controls.start({
        scale: [1, 1.3, 1],
        transition: { type: 'spring', stiffness: 400, damping: 10 },
      });
    }
    setPrevXp(xp);
  }

  return (
    <div className="relative inline-flex items-center">
      <motion.span
        animate={controls}
        className="text-xs font-bold tabular-nums text-amber-500 dark:text-amber-400"
      >
        {xp} XP
      </motion.span>

      {/* Floating "+N XP" popup positioned above */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <XPPopup points={gained} show={gained > 0} />
      </div>
    </div>
  );
}
