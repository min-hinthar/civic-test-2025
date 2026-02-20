'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hapticMedium } from '@/lib/haptics';

interface LongPressButtonProps {
  /** Callback fired after the hold duration completes */
  onLongPress: () => void;
  /** Hold duration in milliseconds (default 3000) */
  holdDuration?: number;
  /** Button content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/** SVG ring dimensions for progress indicator */
const RING_SIZE = 48;
const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Long-press button that requires a sustained hold to activate.
 *
 * Used as a hidden emergency exit in Real interview mode. Displays a
 * circular SVG fill progress during the hold. Fires onLongPress only
 * when the hold completes. Releases early reset progress.
 *
 * Uses requestAnimationFrame for smooth progress updates. Refs are
 * only accessed in event handlers (React Compiler safe).
 */
export function LongPressButton({
  onLongPress,
  holdDuration = 3000,
  children,
  className,
}: LongPressButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  // Refs for RAF loop -- only accessed in handlers, not render
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const onLongPressRef = useRef(onLongPress);

  // Keep callback ref in sync
  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  const startHold = useCallback(() => {
    setIsHolding(true);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / holdDuration, 1);
      setProgress(p);

      if (p >= 1) {
        // Hold complete
        setProgress(0);
        setIsHolding(false);
        rafIdRef.current = null;

        // Haptic feedback on hold complete
        hapticMedium();

        onLongPressRef.current();
        return;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);
  }, [holdDuration]);

  const cancelHold = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    setIsHolding(false);
    setProgress(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // SVG ring offset (empty → full)
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);

  return (
    <button
      type="button"
      onPointerDown={startHold}
      onPointerUp={cancelHold}
      onPointerLeave={cancelHold}
      onPointerCancel={cancelHold}
      aria-label="Hold for 3 seconds to exit"
      aria-roledescription="long press button"
      className={clsx(
        'relative inline-flex items-center justify-center',
        'rounded-full p-2',
        'text-white/40 transition-colors',
        'hover:text-white/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        'select-none touch-none',
        className
      )}
    >
      {/* SVG ring progress indicator */}
      {isHolding && !shouldReduceMotion && (
        <svg
          width={RING_SIZE}
          height={RING_SIZE}
          viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
          className="pointer-events-none absolute -rotate-90"
          aria-hidden="true"
        >
          {/* Background ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(0 0% 100% / 0.1)"
            strokeWidth="2"
          />
          {/* Progress ring */}
          <circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="hsl(var(--color-warning))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
      )}

      {/* Reduced motion: simple loading text after threshold */}
      {isHolding && shouldReduceMotion && (
        <span
          className="pointer-events-none absolute -bottom-5 text-caption text-warning"
          aria-hidden="true"
        >
          {Math.ceil((1 - progress) * (holdDuration / 1000))}s
        </span>
      )}

      {/* Button content (icon) */}
      <span className={clsx('relative z-10', isHolding && 'text-warning')}>{children}</span>
    </button>
  );
}
