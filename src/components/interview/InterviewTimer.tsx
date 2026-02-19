'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface InterviewTimerProps {
  /** Duration in seconds (default 15) */
  duration?: number;
  /** Called when timer reaches 0 */
  onExpired: () => void;
  /** Whether the timer is actively counting down */
  isActive: boolean;
}

/** SVG ring radius and derived circumference */
const RING_RADIUS = 22;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Enhanced interview timer with numeric countdown and SVG ring indicator.
 *
 * Features:
 * - Circular SVG ring that counts down around the number
 * - Color transitions: white (>5s), amber (5s-3s), red (<3s)
 * - Gentle pulse animation at urgent phase (<3s)
 * - Falls back to a shrinking progress bar when hidden behind other UI
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
  const isWarning = timeRemaining <= 5 && timeRemaining > 3;
  const isUrgent = timeRemaining <= 3;

  // Color tokens based on urgency level
  const colorClass = isUrgent ? 'text-destructive' : isWarning ? 'text-warning' : 'text-white';
  const strokeColor = isUrgent
    ? 'hsl(var(--color-destructive))'
    : isWarning
      ? 'hsl(var(--color-warning))'
      : 'hsl(var(--color-primary))';
  const barColor = isUrgent
    ? 'hsl(var(--color-destructive))'
    : isWarning
      ? 'hsl(var(--color-warning))'
      : 'hsl(var(--color-primary))';

  // SVG ring offset (full → empty)
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Circular timer with SVG ring */}
      <motion.div
        className="relative flex items-center justify-center"
        animate={isUrgent && !shouldReduceMotion ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={
          isUrgent && !shouldReduceMotion
            ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 0.1 }
        }
      >
        {/* SVG ring */}
        <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90" aria-hidden="true">
          {/* Background ring */}
          <circle
            cx="28"
            cy="28"
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(0 0% 100% / 0.1)"
            strokeWidth="3"
          />
          {/* Progress ring */}
          <circle
            cx="28"
            cy="28"
            r={RING_RADIUS}
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-linear"
          />
        </svg>

        {/* Numeric countdown centered in ring */}
        <span
          className={clsx('absolute text-sm font-bold tabular-nums', colorClass)}
          aria-live="off"
        >
          {timeRemaining}
        </span>
      </motion.div>

      {/* Linear progress bar below ring */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: '100%' }}
          animate={{
            width: `${progress * 100}%`,
            backgroundColor: barColor,
          }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.8, ease: 'linear' }}
        />
      </div>

      {/* Screen reader announcement at urgency thresholds */}
      {timeRemaining === 5 && (
        <span className="sr-only" aria-live="assertive">
          5 seconds remaining
        </span>
      )}
      {timeRemaining === 3 && (
        <span className="sr-only" aria-live="assertive">
          3 seconds remaining
        </span>
      )}
    </div>
  );
}
