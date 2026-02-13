'use client';

import { useEffect, useState } from 'react';
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

/**
 * Animated score count-up display.
 *
 * Features:
 * - Counts from 0 to final score with easing
 * - Green for passing (>=60%), orange for failing
 * - Scale-in spring animation for container
 * - Optional percentage display
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
  const controls = useAnimationControls();

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const percentage = Math.round((score / total) * 100);
  const isPassing = percentage >= 60; // 6/10 = 60% to pass

  /** Trigger a subtle scale pop when count-up finishes */
  const handleCountEnd = () => {
    if (!shouldReduceMotion) {
      controls.start({
        scale: [1, 1.12, 1],
        transition: { duration: 0.35, ease: 'easeOut' },
      });
    }
    onComplete?.();
  };

  // Reduced motion: show final score immediately
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
      <motion.span
        animate={controls}
        className={clsx(
          'font-bold tabular-nums',
          sizeClasses[size],
          isPassing ? 'text-success' : 'text-warning'
        )}
      >
        {hasStarted ? (
          <CountUp
            start={0}
            end={showPercentage ? percentage : score}
            duration={duration}
            suffix={showPercentage ? '%' : ''}
            onEnd={handleCountEnd}
          />
        ) : showPercentage ? (
          '0%'
        ) : (
          '0'
        )}
      </motion.span>
      {!showPercentage && <span className="text-xl text-muted-foreground">/ {total}</span>}
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
