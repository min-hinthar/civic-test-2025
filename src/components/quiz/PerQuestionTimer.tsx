'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PerQuestionTimerProps {
  /** Seconds remaining */
  timeLeft: number;
  /** Total duration in seconds (for percentage calculation) */
  duration: number;
  /** True when <= 5 seconds remaining (enables pulse animation) */
  isWarning: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIZE = 40;
const STROKE_WIDTH = 3.5;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

/**
 * Timer color based on remaining percentage.
 * Green (>50%) -> Yellow (20-50%) -> Red (<20%)
 *
 * Uses CSS custom properties with HSL wrapping for theme support.
 */
function getTimerColor(timeLeft: number, duration: number): string {
  const percent = (timeLeft / duration) * 100;
  if (percent > 50) return 'hsl(var(--color-success))';
  if (percent > 20) return 'hsl(var(--color-warning))';
  return 'hsl(var(--color-destructive))';
}

// ---------------------------------------------------------------------------
// PerQuestionTimer
// ---------------------------------------------------------------------------

/**
 * Compact 40x40 circular per-question timer.
 *
 * Features:
 * - SVG circle with stroke-dasharray animation
 * - Color: green (>50%) -> yellow (20-50%) -> red (<20%)
 * - Pulse animation at <= 5s (disabled under reduced motion)
 * - role="timer" with aria-label for accessibility
 * - sr-only live region announces at exactly 5 seconds
 *
 * The sr-only announcement fires when timeLeft === 5 (the threshold crossing).
 * Since timeLeft changes each second, aria-live content changes once at the
 * exact threshold. After extension, timeLeft rises above 5 and the announcement
 * will trigger again on the next countdown to 5.
 */
export function PerQuestionTimer({ timeLeft, duration, isWarning }: PerQuestionTimerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Announce at exactly 5 seconds (the threshold crossing point).
  // aria-live="assertive" will announce whenever this content changes.
  // Using useMemo is not needed here since this is a simple derivation.
  const announcementText = timeLeft === 5 ? '5 seconds remaining' : '';

  const percent = useMemo(() => (duration > 0 ? timeLeft / duration : 0), [timeLeft, duration]);
  const dashOffset = CIRCUMFERENCE * (1 - percent);
  const color = getTimerColor(timeLeft, duration);

  return (
    <div
      role="timer"
      aria-label={`${timeLeft} seconds remaining`}
      className={clsx(
        'relative flex items-center justify-center',
        isWarning && !shouldReduceMotion && 'animate-timer-warning'
      )}
      style={{
        width: SIZE,
        height: SIZE,
        ...(isWarning
          ? { boxShadow: '0 0 8px 2px hsl(var(--color-destructive) / 0.5)', borderRadius: '50%' }
          : {}),
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track circle */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="hsl(var(--color-border))"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Progress arc */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
        />
      </svg>
      {/* Seconds number */}
      <span className="absolute text-xs font-bold tabular-nums" style={{ color }}>
        {timeLeft}
      </span>

      {/* Screen reader announcement at 5 seconds */}
      <span className="sr-only" aria-live="assertive" role="alert">
        {announcementText}
      </span>
    </div>
  );
}
