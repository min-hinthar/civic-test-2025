'use client';

import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { motion, useAnimationControls } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { clsx } from 'clsx';

interface CountUpScoreProps {
  /** Final score value */
  score: number;
  /** Total possible (for "X of Y" display) */
  total: number;
  /** Delay before counting starts (ms) */
  delay?: number;
  /** Duration of count animation (seconds) */
  duration?: number;
  /** Show as percentage */
  showPercentage?: boolean;
  /** Size variant */
  size?: 'md' | 'lg' | 'xl';
  /** Called when count-up completes */
  onComplete?: () => void;
}

const sizeClasses = {
  md: 'text-4xl',
  lg: 'text-5xl',
  xl: 'text-6xl',
};

// ---------------------------------------------------------------------------
// Dramatic easing function for countup.js
// ---------------------------------------------------------------------------

/**
 * Custom easing: slow cubic start (0-30%), fast linear middle (30-80%),
 * decelerate at end (80-100%). Builds tension then releases.
 *
 * @param t - current time
 * @param b - start value
 * @param c - change in value (end - start)
 * @param d - total duration
 */
function dramaticEasing(t: number, b: number, c: number, d: number): number {
  const p = t / d; // normalized progress 0..1

  let value: number;
  if (p < 0.3) {
    // Cubic ease-in for first 30% -- covers 15% of value range
    const segmentProgress = p / 0.3;
    value = segmentProgress * segmentProgress * segmentProgress * 0.15;
  } else if (p < 0.8) {
    // Fast linear section 30-80% -- covers 70% of value range
    const segmentProgress = (p - 0.3) / 0.5;
    value = 0.15 + segmentProgress * 0.7;
  } else {
    // Decelerate (quadratic ease-out) 80-100% -- covers final 15%
    const segmentProgress = (p - 0.8) / 0.2;
    value = 0.85 + (1 - (1 - segmentProgress) * (1 - segmentProgress)) * 0.15;
  }

  return b + c * value;
}

// ---------------------------------------------------------------------------
// Color class helper
// ---------------------------------------------------------------------------

/**
 * Determines color class based on current count progress and final outcome.
 * Transitions from neutral -> pass (green) or fail (amber).
 */
function getColorClass(currentValue: number, total: number, isPassing: boolean): string {
  const ratio = total > 0 ? currentValue / total : 0;

  if (ratio < 0.4) {
    return 'text-muted-foreground';
  }

  // Final color depends on pass/fail
  if (isPassing) {
    // Gradually shift to green
    return ratio >= 0.6 ? 'text-success' : 'text-muted-foreground';
  }

  // Failing: shift to amber in last portion
  return ratio >= 0.8 ? 'text-warning' : 'text-muted-foreground';
}

/**
 * Animated score count-up display with dramatic easing.
 *
 * Features:
 * - Dramatic easing: slow start, fast middle, decelerate at end
 * - Spring overshoot animation on landing (scale pop + brief "+N" text)
 * - Color shifts from neutral to green (pass) or amber (fail) during count
 * - Synced fraction ("/ N") fade-in animation
 * - Whole numbers only (decimals={0})
 * - Respects prefers-reduced-motion (shows final score immediately)
 *
 * Usage:
 * ```tsx
 * <CountUpScore score={85} total={100} onComplete={() => triggerConfetti()} />
 * ```
 */
export function CountUpScore({
  score,
  total,
  delay = 500,
  duration = 2,
  showPercentage = false,
  size = 'lg',
  onComplete,
}: CountUpScoreProps) {
  const shouldReduceMotion = useReducedMotion();
  const [hasStarted, setHasStarted] = useState(false);
  const [showOvershoot, setShowOvershoot] = useState(false);
  const [colorClass, setColorClass] = useState('text-muted-foreground');
  const controls = useAnimationControls();
  const currentValueRef = useRef(0);

  const percentage = Math.round((score / total) * 100);
  const isPassing = percentage >= 60; // 6/10 = 60% to pass
  const displayEnd = showPercentage ? percentage : score;
  const overshootAmount = Math.min(5, Math.ceil(score * 0.05));

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  /** Formatting function that tracks current value for color shift */
  const handleFormat = (n: number): string => {
    currentValueRef.current = n;
    return `${Math.round(n)}${showPercentage ? '%' : ''}`;
  };

  /** Trigger spring overshoot and color finalization when count-up finishes */
  const handleCountEnd = () => {
    // Set final color
    setColorClass(isPassing ? 'text-success' : 'text-warning');

    if (!shouldReduceMotion) {
      // Spring scale overshoot: 1 -> 1.15 -> 1
      controls.start({
        scale: [1, 1.15, 1],
        transition: { type: 'spring', stiffness: 400, damping: 10 },
      });

      // Show brief "+N" overshoot text
      setShowOvershoot(true);
      setTimeout(() => setShowOvershoot(false), 400);
    }

    onComplete?.();
  };

  // Update color class periodically during count-up via an interval
  useEffect(() => {
    if (!hasStarted || shouldReduceMotion) return;

    const interval = setInterval(() => {
      const currentVal = currentValueRef.current;
      const effectiveTotal = showPercentage ? 100 : total;
      setColorClass(getColorClass(currentVal, effectiveTotal, isPassing));
    }, 100);

    return () => clearInterval(interval);
  }, [hasStarted, shouldReduceMotion, total, isPassing, showPercentage]);

  // Reduced motion: show final score immediately with final colors
  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col items-center">
        <span
          className={clsx(
            'font-bold tabular-nums',
            sizeClasses[size],
            isPassing ? 'text-success' : 'text-warning'
          )}
        >
          {showPercentage ? `${percentage}%` : score}
        </span>
        {!showPercentage && <span className="text-xl text-muted-foreground">/ {total}</span>}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center"
    >
      {/* Score value with spring overshoot control */}
      <motion.span
        animate={controls}
        className={clsx(
          'font-bold tabular-nums transition-colors duration-300 relative',
          sizeClasses[size],
          colorClass
        )}
      >
        {hasStarted ? (
          <CountUp
            start={0}
            end={displayEnd}
            duration={duration}
            decimals={0}
            easingFn={dramaticEasing}
            formattingFn={handleFormat}
            onEnd={handleCountEnd}
          />
        ) : showPercentage ? (
          '0%'
        ) : (
          '0'
        )}

        {/* Overshoot "+N" indicator */}
        {showOvershoot && (
          <motion.span
            initial={{ opacity: 1, y: 0, scale: 1.2 }}
            animate={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={clsx(
              'absolute -right-8 top-0 text-lg font-bold',
              isPassing ? 'text-success' : 'text-warning'
            )}
          >
            +{overshootAmount}
          </motion.span>
        )}
      </motion.span>

      {/* Fraction "/ N" synced fade-in */}
      {!showPercentage && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay / 1000, duration: 0.5 }}
          className="text-xl text-muted-foreground"
        >
          / {total}
        </motion.span>
      )}
    </motion.div>
  );
}

/**
 * Rolling odometer-style number animation for single-digit updates.
 *
 * Usage:
 * ```tsx
 * <OdometerNumber value={currentQuestion} className="text-2xl font-bold" />
 * ```
 */
export function OdometerNumber({ value, className }: { value: number; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <span className={className}>{value}</span>;
  }

  return (
    <CountUp
      start={Math.max(0, value - 1)}
      end={value}
      duration={0.5}
      preserveValue
      className={className}
    />
  );
}
