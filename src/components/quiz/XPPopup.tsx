'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface XPPopupProps {
  /** XP points gained */
  points: number;
  /** Whether to show the popup */
  show: boolean;
}

// ---------------------------------------------------------------------------
// XPPopup
// ---------------------------------------------------------------------------

/**
 * Floating "+X XP" gain indicator.
 *
 * Shows a small amber/gold text that floats upward and fades out.
 * Positioned at the top-right of its parent container (absolute).
 *
 * Auto-removes via animation completion (~1.5s).
 * Reduced motion: simple fade without vertical movement.
 */
export function XPPopup({ points, show }: XPPopupProps) {
  const shouldReduceMotion = useReducedMotion();
  // Stable key for animation identity -- increments each time show transitions to true
  const [animKey, setAnimKey] = useState(0);
  // Track previous show value to detect transitions
  const [prevShow, setPrevShow] = useState(false);
  if (show && !prevShow) {
    setAnimKey(k => k + 1);
  }
  if (show !== prevShow) {
    setPrevShow(show);
  }

  if (points <= 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={`xp-${points}-${animKey}`}
          initial={shouldReduceMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
          animate={shouldReduceMotion ? { opacity: 0 } : { y: -40, opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="pointer-events-none text-sm font-bold text-amber-500 dark:text-amber-400"
          aria-hidden="true"
        >
          +{points} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
