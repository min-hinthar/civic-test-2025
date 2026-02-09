'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface InterviewTimerProps {
  /** Duration in seconds (default 15) */
  duration?: number;
  /** Called when timer reaches 0 */
  onExpired: () => void;
  /** Whether the timer is actively counting down */
  isActive: boolean;
}

/**
 * Subtle shrinking progress bar for realistic interview mode.
 *
 * A 4px horizontal bar that shrinks from 100% to 0% over the duration.
 * Color transitions from primary-500 to warning-500 in the last 3 seconds.
 * Hidden when isActive is false.
 *
 * IMPORTANT: To reset the timer for a new question, use a React key on
 * the parent element (e.g., key={questionIndex}). This causes React to
 * unmount and remount, giving a fresh timer without setState in effects.
 */
export function InterviewTimer({ duration = 15, onExpired, isActive }: InterviewTimerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const onExpiredRef = useRef(onExpired);

  // Keep callback ref updated
  useEffect(() => {
    onExpiredRef.current = onExpired;
  }, [onExpired]);

  // Countdown interval
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          onExpiredRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive) return null;

  const progress = timeRemaining / duration;
  const isWarning = timeRemaining <= 3;

  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
      <motion.div
        className="h-full rounded-full"
        initial={{ width: '100%' }}
        animate={{
          width: `${progress * 100}%`,
          backgroundColor: isWarning
            ? 'hsl(var(--color-warning))'
            : 'hsl(var(--color-primary))',
        }}
        transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.8, ease: 'linear' }}
      />
    </div>
  );
}
