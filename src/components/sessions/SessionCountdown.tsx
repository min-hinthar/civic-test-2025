'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { playCountdownTick, playCountdownGo } from '@/lib/audio/soundEffects';

/** SVG ring dimensions */
const RING_VIEWBOX = 120;
const RING_RADIUS = 54;
const RING_CENTER = 60;
const RING_STROKE_WIDTH = 6;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Duration for each number step (5-1) in ms */
const STEP_DURATION = 1000;

/** Duration for the "Go!" step in ms */
const GO_DURATION = 500;

/** Delay before skip button appears in ms */
const SKIP_DELAY = 1500;

interface SessionCountdownProps {
  /** Called when countdown completes (after "Go!" displays) */
  onComplete: () => void;
  /** Subtitle text shown beneath the number (e.g., "Mock Test -- 10 Questions") */
  subtitle?: string;
}

/**
 * Full-screen 5-4-3-2-1-Go! countdown overlay with circular progress ring.
 *
 * Features:
 * - Circular SVG progress ring that depletes each second
 * - Tick sound on each number, chime on "Go!"
 * - Skip button appears after 1.5s delay
 * - Bilingual "Go!" text (English / Myanmar)
 * - Reduced motion: numbers only with opacity fade
 */
export function SessionCountdown({ onComplete, subtitle }: SessionCountdownProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  // step: 5, 4, 3, 2, 1, 0 (Go!), then -1 means done
  const [step, setStep] = useState(5);
  const [showSkip, setShowSkip] = useState(false);
  const skipButtonRef = useRef<HTMLButtonElement>(null);

  const goText = showBurmese ? '\u1005\u1010\u1004\u103A!' : 'Go!';

  // Handle skip / complete
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Timer logic: advance step and play sounds
  useEffect(() => {
    // Already done
    if (step < 0) return;

    // Play sound for current step
    try {
      if (step > 0) {
        playCountdownTick();
      } else if (step === 0) {
        playCountdownGo();
      }
    } catch {
      // Sound failures must never break countdown
    }

    // If step went below 0, fire completion (handled above)
    if (step === 0) {
      // "Go!" step: show briefly then complete
      const timer = setTimeout(() => {
        setStep(-1);
        handleComplete();
      }, GO_DURATION);
      return () => clearTimeout(timer);
    }

    // Number steps (5-1): wait 1 second then decrement
    const timer = setTimeout(() => {
      setStep(prev => prev - 1);
    }, STEP_DURATION);
    return () => clearTimeout(timer);
  }, [step, handleComplete]);

  // Skip button delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, SKIP_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus skip button when it appears
  useEffect(() => {
    if (showSkip && skipButtonRef.current) {
      skipButtonRef.current.focus({ preventScroll: true });
    }
  }, [showSkip]);

  // Don't render if already completed
  if (step < 0) return null;

  const isGo = step === 0;
  const displayText = isGo ? goText : String(step);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md">
      {/* Countdown ring + number area */}
      <div className="relative flex items-center justify-center">
        {/* SVG circular progress ring */}
        {!shouldReduceMotion && !isGo && (
          <svg
            width={RING_VIEWBOX}
            height={RING_VIEWBOX}
            viewBox={`0 0 ${RING_VIEWBOX} ${RING_VIEWBOX}`}
            className="absolute h-48 w-48 sm:h-56 sm:w-56"
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
            {/* Animated progress ring */}
            <motion.circle
              cx={RING_CENTER}
              cy={RING_CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={RING_STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
              key={step}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: CIRCUMFERENCE }}
              transition={{ duration: STEP_DURATION / 1000, ease: 'linear' }}
            />
          </svg>
        )}

        {/* Number / Go! display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 2.5 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : {
                    type: 'spring',
                    stiffness: 400,
                    damping: 17,
                  }
            }
            className="select-none"
          >
            <span
              className={
                isGo
                  ? 'block text-5xl font-black text-accent sm:text-6xl'
                  : 'block text-8xl font-black text-foreground sm:text-9xl'
              }
            >
              {displayText}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtitle */}
      {subtitle && <p className="mt-6 text-sm font-medium text-muted-foreground">{subtitle}</p>}

      {/* Skip button */}
      {showSkip && (
        <button
          ref={skipButtonRef}
          onClick={handleComplete}
          onKeyDown={e => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              handleComplete();
            }
          }}
          className="mt-8 rounded-full border border-border px-6 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {showBurmese
            ? '\u1005\u1010\u1004\u103A\u101B\u1014\u103A \u1014\u103E\u102D\u1015\u103A\u1015\u102B'
            : 'Tap to start'}
        </button>
      )}
    </div>
  );
}
