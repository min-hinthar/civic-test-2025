'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Confetti } from './Confetti';
import { DotLottieAnimation } from './DotLottieAnimation';
import { useCelebrationListener, isFirstTimeCelebration } from '@/hooks/useCelebration';
import type { CelebrationDetail, CelebrationLevel } from '@/hooks/useCelebration';
import { hapticLight, hapticMedium, hapticHeavy } from '@/lib/haptics';
import {
  playConfettiBurst,
  playPassReveal,
  playUltimateFanfare,
} from '@/lib/audio/celebrationSounds';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { announce } from '@/lib/a11y/announcer';

// ---------------------------------------------------------------------------
// Level configuration
// ---------------------------------------------------------------------------

interface LevelConfig {
  confettiIntensity: 'sparkle' | 'burst' | 'celebration';
  peakDuration: number;
  hapticFn: () => void;
  soundFn: (() => void) | null;
  dotLottieSrc: string | null;
  dotLottieSize: number;
  hasScreenShake: boolean;
}

const LEVEL_CONFIG: Record<CelebrationLevel, LevelConfig> = {
  sparkle: {
    confettiIntensity: 'sparkle',
    peakDuration: 800,
    hapticFn: hapticLight,
    soundFn: null,
    dotLottieSrc: null,
    dotLottieSize: 0,
    hasScreenShake: false,
  },
  burst: {
    confettiIntensity: 'burst',
    peakDuration: 1200,
    hapticFn: hapticMedium,
    soundFn: playConfettiBurst,
    dotLottieSrc: '/lottie/checkmark.lottie',
    dotLottieSize: 80,
    hasScreenShake: false,
  },
  celebration: {
    confettiIntensity: 'celebration',
    peakDuration: 2000,
    hapticFn: hapticHeavy,
    soundFn: playPassReveal,
    dotLottieSrc: '/lottie/trophy.lottie',
    dotLottieSize: 200,
    hasScreenShake: false,
  },
  ultimate: {
    confettiIntensity: 'celebration',
    peakDuration: 2500,
    hapticFn: hapticHeavy,
    soundFn: playUltimateFanfare,
    dotLottieSrc: '/lottie/trophy.lottie',
    dotLottieSize: 200,
    hasScreenShake: true,
  },
};

/** Gap between sequential celebrations in ms */
const QUEUE_GAP_MS = 300;

// ---------------------------------------------------------------------------
// Elevation: first-time celebrations get bumped one tier
// ---------------------------------------------------------------------------

function elevateLevel(level: CelebrationLevel): CelebrationLevel {
  switch (level) {
    case 'sparkle':
      return 'burst';
    case 'burst':
      return 'celebration';
    case 'celebration':
    case 'ultimate':
      return level; // ultimate stays ultimate
  }
}

// ---------------------------------------------------------------------------
// Surprise variations (small Easter eggs)
// ---------------------------------------------------------------------------

/** 5% chance to include a flag emoji shape in confetti */
function shouldShowFlagSurprise(): boolean {
  return Math.random() < 0.05;
}

/** 5% chance for extra sparkle sound after celebration */
function shouldPlayExtraSparkle(): boolean {
  return Math.random() < 0.05;
}

// ---------------------------------------------------------------------------
// CSS keyframes for screen shake (inline style injection)
// ---------------------------------------------------------------------------

const SHAKE_KEYFRAMES = `
@keyframes celebrationShake {
  0%, 100% { transform: translateX(0); }
  10% { transform: translateX(-2px); }
  30% { transform: translateX(2px); }
  50% { transform: translateX(-2px); }
  70% { transform: translateX(2px); }
  90% { transform: translateX(-1px); }
}
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Global celebration overlay that orchestrates confetti, DotLottie animations,
 * sound, and haptics based on CustomEvent dispatches from `celebrate()`.
 *
 * Features:
 * - Queue management: multiple celebrations play sequentially with 300ms gap
 * - Blocking overlay during peak moment (1-2s), then non-blocking for fade
 * - Each celebration level maps to specific confetti intensity, sound, haptics
 * - First-time celebrations get elevated one tier
 * - Reduced motion: skips visuals, still plays sound and haptics
 * - Surprise variations: 5% chance of flag emoji or extra sparkle
 * - Ultimate-tier gets screen shake
 *
 * Mount as a singleton in AppShell.tsx (no Context provider needed).
 */
export function CelebrationOverlay() {
  const [queue, setQueue] = useState<CelebrationDetail[]>([]);
  const [current, setCurrent] = useState<CelebrationDetail | null>(null);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showFlagSurprise, setShowFlagSurprise] = useState(false);

  const peakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // ---------------------------------------------------------------------------
  // Enqueue incoming celebrations
  // ---------------------------------------------------------------------------

  const handleCelebration = useCallback((detail: CelebrationDetail) => {
    // Check first-time status and attach to detail
    const enriched: CelebrationDetail = {
      ...detail,
      isFirstTime: detail.isFirstTime ?? isFirstTimeCelebration(detail.source),
    };
    setQueue(prev => [...prev, enriched]);
  }, []);

  useCelebrationListener(handleCelebration);

  // ---------------------------------------------------------------------------
  // Dequeue: when no current celebration and queue has items
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (current !== null || queue.length === 0) return;

    const next = queue[0];
    setQueue(prev => prev.slice(1));
    setCurrent(next);
  }, [current, queue]);

  // ---------------------------------------------------------------------------
  // Fire celebration effects when current changes
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!current) return;

    // Determine effective level (elevate if first-time)
    const effectiveLevel = current.isFirstTime ? elevateLevel(current.level) : current.level;
    const config = LEVEL_CONFIG[effectiveLevel];

    // --- Blocking overlay ---
    setIsBlocking(true);
    peakTimeoutRef.current = setTimeout(() => {
      setIsBlocking(false);
    }, config.peakDuration);

    // --- Haptics ---
    config.hapticFn();
    if (effectiveLevel === 'ultimate') {
      // Double haptic for ultimate: second burst 200ms later
      setTimeout(() => hapticHeavy(), 200);
    }

    // --- Screen reader announcement (fires regardless of motion preference) ---
    if (shouldReduceMotion) {
      announce('Celebration!');
    }

    // --- Sound ---
    if (config.soundFn) {
      config.soundFn();
    }
    // Surprise: extra sparkle sound at end
    if (shouldPlayExtraSparkle() && config.soundFn) {
      setTimeout(() => playConfettiBurst(), config.peakDuration - 200);
    }

    // --- Screen shake (ultimate only, skip if reduced motion) ---
    if (config.hasScreenShake && !shouldReduceMotion) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
    }

    // --- Flag surprise ---
    setShowFlagSurprise(shouldShowFlagSurprise());

    return () => {
      if (peakTimeoutRef.current) {
        clearTimeout(peakTimeoutRef.current);
        peakTimeoutRef.current = null;
      }
    };
    // Intentionally depend only on `current` identity change, not shouldReduceMotion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // ---------------------------------------------------------------------------
  // Cleanup timeouts on unmount
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      if (peakTimeoutRef.current) {
        clearTimeout(peakTimeoutRef.current);
        peakTimeoutRef.current = null;
      }
      if (gapTimeoutRef.current) {
        clearTimeout(gapTimeoutRef.current);
        gapTimeoutRef.current = null;
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Confetti complete handler: wait gap, then dequeue next
  // ---------------------------------------------------------------------------

  const handleConfettiComplete = useCallback(() => {
    gapTimeoutRef.current = setTimeout(() => {
      setCurrent(null);
      gapTimeoutRef.current = null;
    }, QUEUE_GAP_MS);
  }, []);

  // ---------------------------------------------------------------------------
  // Render nothing if no celebration active
  // ---------------------------------------------------------------------------

  if (!current) return null;

  const effectiveLevel = current.isFirstTime ? elevateLevel(current.level) : current.level;
  const config = LEVEL_CONFIG[effectiveLevel];

  return (
    <>
      {/* Inject shake keyframes */}
      {config.hasScreenShake && !shouldReduceMotion && (
        <style dangerouslySetInnerHTML={{ __html: SHAKE_KEYFRAMES }} />
      )}

      {/* Overlay container */}
      <div
        className="fixed inset-0 z-[200]"
        style={{
          pointerEvents: isBlocking ? 'auto' : 'none',
          animation:
            isShaking && !shouldReduceMotion ? 'celebrationShake 200ms ease-in-out' : undefined,
        }}
        aria-hidden="true"
      >
        {/* Subtle dark backdrop during blocking peak */}
        {isBlocking && (
          <div className="absolute inset-0 bg-black/10 transition-opacity duration-300" />
        )}

        {/* Confetti (skip for reduced motion) */}
        {!shouldReduceMotion && (
          <Confetti
            fire={true}
            intensity={config.confettiIntensity}
            isDarkMode={current.isDarkMode}
            onComplete={handleConfettiComplete}
          />
        )}

        {/* Reduced motion: skip visuals, trigger completion after peak */}
        {shouldReduceMotion && (
          <ReducedMotionTimer
            duration={config.peakDuration + QUEUE_GAP_MS}
            onComplete={handleConfettiComplete}
          />
        )}

        {/* DotLottie animation (skip for reduced motion + sparkle level) */}
        {!shouldReduceMotion && config.dotLottieSrc && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <DotLottieAnimation
              src={config.dotLottieSrc}
              width={config.dotLottieSize}
              height={config.dotLottieSize}
              autoplay
              loop={false}
              glowColor={effectiveLevel === 'ultimate' ? '#FFD700' : undefined}
            />
          </div>
        )}

        {/* Flag surprise: render a small flag emoji floating in center */}
        {showFlagSurprise && !shouldReduceMotion && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-4xl animate-bounce"
              style={{ animationDuration: '600ms' }}
              role="img"
              aria-label="US flag"
            >
              {'\uD83C\uDDFA\uD83C\uDDF8'}
            </span>
          </div>
        )}

        {/* Queue counter pill */}
        {queue.length > 0 && (
          <div className="fixed bottom-4 right-4 rounded-full bg-black/40 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
            {queue.length} more
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Reduced-motion timer helper
// ---------------------------------------------------------------------------

/**
 * Fires onComplete after the specified duration.
 * Used in reduced-motion mode where confetti is skipped.
 */
function ReducedMotionTimer({
  duration,
  onComplete,
}: {
  duration: number;
  onComplete: () => void;
}) {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onCompleteRef.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return null;
}
