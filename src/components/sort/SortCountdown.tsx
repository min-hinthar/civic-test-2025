'use client';

import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { playCountdownTick, playCountdownGo } from '@/lib/audio/soundEffects';

// ---------------------------------------------------------------------------
// SVG ring constants
// ---------------------------------------------------------------------------

const RING_VIEWBOX = 100;
const RING_RADIUS = 44;
const RING_CENTER = 50;
const RING_STROKE_WIDTH = 5;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SortCountdownProps {
  /** Called when countdown reaches zero */
  onComplete: () => void;
  /** Called when user taps to skip countdown (start immediately) */
  onSkip: () => void;
  /** Called when user cancels (stop auto-start) */
  onCancel: () => void;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Bilingual labels
// ---------------------------------------------------------------------------

const labels = {
  studyMissed: {
    en: 'Study Missed Cards',
    my: 'မမှန်ကတ်များကိုလေ့လာပါ',
  },
  cancel: {
    en: 'Cancel',
    my: 'ပယ်ဖျက်ပါ',
  },
  startingIn: {
    en: 'Starting in',
    my: 'စတင်မည်',
  },
};

// ---------------------------------------------------------------------------
// SortCountdown
// ---------------------------------------------------------------------------

/**
 * 5-second auto-start countdown for the next round in sort mode.
 *
 * Overlays the round summary CTA area with:
 * - Circular SVG countdown indicator (or static text for reduced motion)
 * - "Study Missed Cards (5s)" button that skips the timer
 * - "Cancel" link to stop auto-start
 * - Tick sound on each second, Go sound on completion
 */
export function SortCountdown({ onComplete, onSkip, onCancel, showBurmese }: SortCountdownProps) {
  const shouldReduceMotion = useReducedMotion();
  const [count, setCount] = useState(5);

  // Handle skip (start immediately)
  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  // Handle cancel (stop auto-start)
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // Timer logic: decrement each second, play sounds, fire onComplete at 0
  useEffect(() => {
    // Play sound for current count
    try {
      if (count > 0) {
        playCountdownTick();
      } else if (count === 0) {
        playCountdownGo();
      }
    } catch {
      // Sound failures must never break countdown
    }

    // At zero, wait briefly then fire completion
    if (count === 0) {
      const timer = setTimeout(() => {
        onComplete();
      }, 400);
      return () => clearTimeout(timer);
    }

    // Decrement each second using step-based pattern (React Compiler safe)
    const timer = setTimeout(() => {
      setCount(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  // Progress fraction for SVG ring (1 = full, 0 = empty)
  const progress = count / 5;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Countdown circle or static text */}
      {shouldReduceMotion ? (
        /* Reduced motion: static text */
        <p
          className={clsx(
            'text-sm font-medium text-muted-foreground',
            showBurmese && 'font-myanmar'
          )}
        >
          {showBurmese
            ? `${labels.startingIn.my} ${count}s...`
            : `${labels.startingIn.en} ${count}s...`}
        </p>
      ) : (
        /* Animated SVG ring with number */
        <div className="relative flex items-center justify-center">
          <svg
            width="72"
            height="72"
            viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
            className="transform -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth={RING_STROKE_WIDTH}
            />
            {/* Progress ring */}
            <circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="hsl(var(--accent-purple))"
              strokeWidth={RING_STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          {/* Number in center */}
          <span className="absolute text-2xl font-black text-foreground tabular-nums">{count}</span>
        </div>
      )}

      {/* Study Missed Cards button (skip countdown) */}
      <button
        type="button"
        onClick={handleSkip}
        className={clsx(
          'inline-flex items-center justify-center gap-2',
          'rounded-xl px-6 py-3 min-h-[48px]',
          'bg-accent-purple text-white',
          'shadow-[0_4px_0_hsl(var(--accent-purple)/0.6)]',
          'active:shadow-[0_1px_0_hsl(var(--accent-purple)/0.6)] active:translate-y-[3px]',
          'transition-[box-shadow,transform] duration-100',
          'focus:outline-none focus:ring-2 focus:ring-accent-purple focus:ring-offset-2',
          'font-semibold text-sm'
        )}
      >
        <span
          className={clsx(
            'flex flex-col items-center leading-tight',
            showBurmese && 'font-myanmar'
          )}
        >
          <span>
            {showBurmese ? labels.studyMissed.my : labels.studyMissed.en}{' '}
            <span className="tabular-nums opacity-80">({count}s)</span>
          </span>
        </span>
      </button>

      {/* Cancel link */}
      <button
        type="button"
        onClick={handleCancel}
        className={clsx(
          'text-sm text-muted-foreground underline underline-offset-2',
          'hover:text-foreground transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:rounded-sm',
          'min-h-[44px] inline-flex items-center',
          showBurmese && 'font-myanmar'
        )}
      >
        {showBurmese ? labels.cancel.my : labels.cancel.en}
      </button>
    </div>
  );
}
