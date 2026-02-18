'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsePerQuestionTimerOptions {
  /** Total duration in seconds. Default: 30 */
  duration?: number;
  /** Pause the countdown (e.g. during feedback phase). */
  isPaused?: boolean;
  /** Called when the timer reaches 0. */
  onExpire: () => void;
  /** Called each second while timeLeft is in the warning zone (1-5s). */
  onWarning?: () => void;
  /** Whether the WCAG 2.2.1 extension prompt is available. */
  allowExtension?: boolean;
}

interface UsePerQuestionTimerReturn {
  /** Seconds remaining. */
  timeLeft: number;
  /** True when timeLeft <= 5. */
  isWarning: boolean;
  /** True when timeLeft <= 6 AND allowExtension is true. */
  showExtensionPrompt: boolean;
  /** Add 50% of original duration to the timer. Multiple calls allowed. */
  extend: () => void;
  /** Reset the timer for the next question. */
  reset: (newDuration?: number) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePerQuestionTimer({
  duration = 30,
  isPaused = false,
  onExpire,
  onWarning,
  allowExtension = false,
}: UsePerQuestionTimerOptions): UsePerQuestionTimerReturn {
  // Use lazy init for React Compiler safety
  const [timeLeft, setTimeLeft] = useState(() => duration);

  // Ref for interval ID -- only accessed in effects/handlers
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // One-shot flag for expiry -- only accessed in effects/handlers (never during render)
  const expiredFiredRef = useRef(false);

  // ---------------------------------------------------------------------------
  // Sync callback refs in effects (React Compiler safe)
  // ---------------------------------------------------------------------------
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const onWarningRef = useRef(onWarning);
  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  // ---------------------------------------------------------------------------
  // Countdown effect
  //
  // Handles countdown, warning, and expiry all inside the interval callback.
  // This avoids separate effects that use setState (React Compiler violation).
  // Refs are only accessed inside the interval callback (event handler context).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;

        // Fire warning callback each second during the last 5 seconds
        if (next <= 5 && next > 0) {
          // Schedule outside setState updater to avoid nested dispatch
          setTimeout(() => onWarningRef.current?.(), 0);
        }

        // Fire expiry callback once when reaching 0
        if (next <= 0 && !expiredFiredRef.current) {
          expiredFiredRef.current = true;
          setTimeout(() => onExpireRef.current(), 0);
          return 0;
        }

        return Math.max(0, next);
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused]);

  // ---------------------------------------------------------------------------
  // Extend: add 50% of original duration
  // ---------------------------------------------------------------------------
  const extend = useCallback(() => {
    const bonus = Math.ceil(duration * 0.5);
    setTimeLeft(prev => prev + bonus);
    // Reset expiry flag so callback can fire again (handler context = safe)
    expiredFiredRef.current = false;
  }, [duration]);

  // ---------------------------------------------------------------------------
  // Reset: for transitioning to next question
  // ---------------------------------------------------------------------------
  const reset = useCallback(
    (newDuration?: number) => {
      const d = newDuration ?? duration;
      setTimeLeft(d);
      // Reset expiry flag (handler context = safe)
      expiredFiredRef.current = false;
    },
    [duration]
  );

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const isWarning = timeLeft <= 5;
  const showExtensionPrompt = allowExtension && timeLeft <= 6 && timeLeft > 0;

  return {
    timeLeft,
    isWarning,
    showExtensionPrompt,
    extend,
    reset,
  };
}
