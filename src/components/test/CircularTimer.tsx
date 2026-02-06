'use client';

import { useState, useCallback } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CircularTimerProps {
  /** Duration in seconds */
  duration: number;
  /** Current remaining time in seconds (controlled) */
  remainingTime: number;
  /** Whether timer is actively counting */
  isPlaying?: boolean;
  /** Called when timer completes */
  onComplete?: () => void;
  /** Size of the timer */
  size?: 'sm' | 'md' | 'lg';
  /** Allow hiding the timer */
  allowHide?: boolean;
}

const sizeConfig = {
  sm: { size: 80, strokeWidth: 6, fontSize: 'text-lg' },
  md: { size: 120, strokeWidth: 8, fontSize: 'text-2xl' },
  lg: { size: 160, strokeWidth: 10, fontSize: 'text-3xl' },
};

// Bilingual labels (inline since strings.ts may not exist yet)
const timerLabels = {
  hideTimer: { en: 'Hide Timer', my: 'အချိန်ပြကို ဖျောက်ရန်' },
  showTimer: { en: 'Show Timer', my: 'အချိန်ပြကို ပြရန်' },
};

/**
 * Get timer color based on remaining percentage.
 * Blue -> Yellow (50%) -> Orange (25%) -> Red pulse (10%)
 */
function getTimerColor(remainingTime: number, duration: number): string {
  const percent = (remainingTime / duration) * 100;

  if (percent > 50) return 'hsl(217 91% 60%)'; // Primary blue
  if (percent > 25) return 'hsl(45 93% 58%)'; // Yellow warning
  if (percent > 10) return 'hsl(32 95% 52%)'; // Orange urgent
  return 'hsl(0 72% 51%)'; // Red critical
}

/**
 * Circular countdown timer with color thresholds.
 *
 * Features:
 * - Smooth arc depletion animation
 * - Color changes at 50%, 25%, 10% thresholds
 * - Pulse animation at 10% remaining
 * - Hide/show toggle for anxiety reduction
 * - Bilingual show/hide labels
 * - Respects prefers-reduced-motion
 */
export function CircularTimer({
  duration,
  remainingTime,
  isPlaying = true,
  onComplete,
  size = 'md',
  allowHide = true,
}: CircularTimerProps) {
  const [isHidden, setIsHidden] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const config = sizeConfig[size];

  const percent = (remainingTime / duration) * 100;
  const isUrgent = percent <= 10;

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const toggleLabel = isHidden ? timerLabels.showTimer : timerLabels.hideTimer;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Timer display */}
      <div
        className={clsx(
          'relative transition-opacity duration-300',
          isHidden && 'opacity-30 blur-sm'
        )}
        aria-hidden={isHidden}
      >
        <CountdownCircleTimer
          isPlaying={isPlaying && !isHidden}
          duration={duration}
          initialRemainingTime={remainingTime}
          colors={['#3B82F6', '#EAB308', '#F97316', '#EF4444']}
          colorsTime={[duration, duration * 0.5, duration * 0.25, 0]}
          size={config.size}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          trailColor="#E5E7EB"
          onComplete={onComplete}
          isSmoothColorTransition
        >
          {() => (
            <div
              className={clsx(
                'flex flex-col items-center justify-center',
                config.fontSize,
                'font-bold tabular-nums',
                isUrgent && !shouldReduceMotion && 'animate-pulse'
              )}
              style={{ color: getTimerColor(remainingTime, duration) }}
            >
              <span>{formatTime(remainingTime)}</span>
            </div>
          )}
        </CountdownCircleTimer>
      </div>

      {/* Hide/Show toggle */}
      {allowHide && (
        <button
          onClick={() => setIsHidden(!isHidden)}
          className={clsx(
            'flex items-center gap-2 px-3 py-1.5 rounded-full',
            'text-sm text-muted-foreground',
            'hover:bg-muted/50 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
          aria-label={isHidden ? 'Show timer' : 'Hide timer'}
        >
          {isHidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          <span className="flex flex-col leading-tight">
            <span>{toggleLabel.en}</span>
            <span className="font-myanmar text-xs opacity-70">{toggleLabel.my}</span>
          </span>
        </button>
      )}
    </div>
  );
}
