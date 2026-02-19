'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { precacheInterviewAudio, type PrecacheProgress } from '@/lib/audio/audioPrecache';
import { checkNetworkQuality, type NetworkQuality } from '@/lib/audio/networkCheck';

interface InterviewCountdownProps {
  /** Called when the countdown sequence completes (after "Begin" shows) */
  onComplete: () => void;
  /** The question IDs to pre-cache audio for */
  questionIds?: string[];
  /** Whether to pre-cache Burmese audio */
  includeBurmese?: boolean;
  /** Reports cache result to parent when loading phase completes */
  onCacheComplete?: (result: PrecacheProgress) => void;
}

/** Countdown steps: 3, 2, 1, then "Begin" */
const COUNTDOWN_STEPS = ['3', '2', '1', 'Begin'] as const;

/** Duration for each number step in ms */
const STEP_DURATION = 1000;

/** Duration for the "Begin" step in ms */
const BEGIN_DURATION = 800;

/** Phase of the countdown: loading audio or number countdown */
type CountdownPhase = 'loading' | 'countdown';

/**
 * Full-screen countdown overlay with optional audio pre-caching.
 *
 * Two-phase operation when questionIds are provided:
 * 1. **Loading phase** -- pre-caches all interview audio with progress bar
 * 2. **Countdown phase** -- 3-2-1-Begin sequence (spring scale animation)
 *
 * When questionIds are not provided, skips directly to countdown phase.
 * Respects prefers-reduced-motion (shows numbers without scale, just opacity).
 */
export function InterviewCountdown({
  onComplete,
  questionIds,
  includeBurmese = false,
  onCacheComplete,
}: InterviewCountdownProps) {
  const shouldReduceMotion = useReducedMotion();

  const hasAudioToCache = questionIds != null && questionIds.length > 0;
  const [phase, setPhase] = useState<CountdownPhase>(hasAudioToCache ? 'loading' : 'countdown');

  // Loading phase state
  const [loadProgress, setLoadProgress] = useState<PrecacheProgress>({
    loaded: 0,
    total: 0,
    failed: [],
  });
  const [networkWarning, setNetworkWarning] = useState<NetworkQuality | null>(null);

  // Countdown phase state
  const [stepIndex, setStepIndex] = useState(0);

  // Track whether loading effect has run to avoid double-invocation in StrictMode
  const loadingStarted = useRef(false);

  const advanceStep = useCallback(() => {
    setStepIndex(prev => prev + 1);
  }, []);

  // Phase 1: Audio loading
  useEffect(() => {
    if (phase !== 'loading' || !hasAudioToCache || loadingStarted.current) return;
    loadingStarted.current = true;

    let cancelled = false;

    const run = async () => {
      // Run network check in parallel with pre-caching
      const networkPromise = checkNetworkQuality();

      const result = await precacheInterviewAudio(questionIds, { includeBurmese }, progress => {
        if (!cancelled) {
          setLoadProgress({ ...progress });
        }
      });

      const quality = await networkPromise;

      if (cancelled) return;

      if (quality !== 'fast') {
        setNetworkWarning(quality);
      }

      onCacheComplete?.(result);

      // Transition to countdown phase after a brief pause
      setTimeout(() => {
        if (!cancelled) {
          setPhase('countdown');
        }
      }, 300);
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [phase, hasAudioToCache, questionIds, includeBurmese, onCacheComplete]);

  // Phase 2: Timer to advance through countdown steps
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (stepIndex >= COUNTDOWN_STEPS.length) {
      onComplete();
      return;
    }

    const isBegin = stepIndex === COUNTDOWN_STEPS.length - 1;
    const duration = isBegin ? BEGIN_DURATION : STEP_DURATION;
    const timer = setTimeout(advanceStep, duration);
    return () => clearTimeout(timer);
  }, [phase, stepIndex, onComplete, advanceStep]);

  const currentStep = COUNTDOWN_STEPS[stepIndex] as string | undefined;
  const progressPercent =
    loadProgress.total > 0 ? Math.round((loadProgress.loaded / loadProgress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
      {/* Interviewer avatar above countdown */}
      <div className="mb-8">
        <InterviewerAvatar size={72} />
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Audio loading */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4 px-6"
          >
            <p className="text-lg font-medium text-primary">
              Loading audio: {loadProgress.loaded}/{loadProgress.total}
            </p>

            {/* Progress bar */}
            <div className="h-2 w-64 max-w-[80vw] overflow-hidden rounded-full bg-slate-700">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>

            {/* Network warning */}
            {networkWarning === 'slow' && (
              <p className="max-w-xs text-center text-sm text-amber-400">
                Slow connection detected. Audio may take longer to load.
              </p>
            )}
            {networkWarning === 'offline' && (
              <p className="max-w-xs text-center text-sm text-amber-400">
                You&apos;re offline. Some audio may use voice synthesis.
              </p>
            )}
          </motion.div>
        )}

        {/* Phase 2: Countdown numbers */}
        {phase === 'countdown' && currentStep != null && (
          <motion.div
            key={`step-${stepIndex}`}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 2 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
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
              className={`block font-bold text-primary ${
                currentStep === 'Begin' ? 'text-4xl sm:text-5xl' : 'text-7xl sm:text-8xl'
              }`}
            >
              {currentStep}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
