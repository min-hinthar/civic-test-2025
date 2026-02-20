'use client';

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { DotLottie } from '@lottiefiles/dotlottie-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Lazy load the DotLottie React component.
 * The WASM renderer is ~200KB -- lazy loading prevents blocking initial page paint.
 */
const LazyDotLottie = lazy(async () => {
  const mod = await import('@lottiefiles/dotlottie-react');
  return { default: mod.DotLottieReact };
});

/**
 * Expected animation file paths (sourced from LottieFiles marketplace):
 * - /lottie/checkmark.lottie  -- check draws in + sparkle particles
 * - /lottie/trophy.lottie     -- 3D spinning trophy for test pass / 100%
 * - /lottie/badge-glow.lottie -- shimmer sweep + radial pulse for badge earn
 * - /lottie/star-burst.lottie -- multi-star explosion for category mastery
 */

interface DotLottieAnimationProps {
  /** Path to .lottie file (relative to public/) */
  src: string;
  /** Whether animation loops */
  loop?: boolean;
  /** Auto-start playback */
  autoplay?: boolean;
  /** Playback speed multiplier */
  speed?: number;
  /** CSS width */
  width?: number | string;
  /** CSS height */
  height?: number | string;
  /** Additional className */
  className?: string;
  /** Called when animation completes (non-looping) */
  onComplete?: () => void;
  /** Colored glow behind animation */
  glowColor?: string;
}

/** Frame timing threshold: 33ms = ~30fps */
const SLOW_FRAME_THRESHOLD_MS = 33;
/** Number of frames to sample before adapting speed */
const FRAME_SAMPLE_SIZE = 10;

export function DotLottieAnimation({
  src,
  loop = false,
  autoplay = true,
  speed = 1,
  width,
  height,
  className,
  onComplete,
  glowColor,
}: DotLottieAnimationProps) {
  const shouldReduceMotion = useReducedMotion();
  const [adaptedSpeed, setAdaptedSpeed] = useState(speed);
  const frameTimestampsRef = useRef<number[]>([]);
  const hasAdaptedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref current without re-subscribing events
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const handleDotLottieRef = useCallback(
    (instance: DotLottie | null) => {
      if (!instance) return;

      // Wire up the complete event for non-looping animations
      instance.addEventListener('complete', () => {
        onCompleteRef.current?.();
      });

      // Performance adaptation: measure frame timing and slow down
      // if the device can't sustain 30fps
      instance.addEventListener('frame', () => {
        if (hasAdaptedRef.current) return;

        const now = performance.now();
        const timestamps = frameTimestampsRef.current;
        timestamps.push(now);

        if (timestamps.length > FRAME_SAMPLE_SIZE) {
          // Calculate average frame duration over sample window
          const durations: number[] = [];
          for (let i = 1; i < timestamps.length; i++) {
            durations.push(timestamps[i] - timestamps[i - 1]);
          }
          const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;

          if (avgDuration > SLOW_FRAME_THRESHOLD_MS) {
            // Device is struggling -- reduce speed to ease rendering load
            setAdaptedSpeed(speed * 0.5);
          }

          hasAdaptedRef.current = true;
        }
      });
    },
    [speed]
  );

  // Reduced motion: render nothing. DotLottie is supplementary --
  // confetti + sound carry the celebration.
  if (shouldReduceMotion) {
    return null;
  }

  const canvas = (
    <Suspense fallback={null}>
      <LazyDotLottie
        src={src}
        loop={loop}
        autoplay={autoplay}
        speed={adaptedSpeed}
        dotLottieRefCallback={handleDotLottieRef}
        style={{
          width: width ?? '100%',
          height: height ?? '100%',
        }}
        className={className}
      />
    </Suspense>
  );

  if (glowColor) {
    return (
      <div
        style={{
          background: `radial-gradient(circle, ${glowColor}33 0%, transparent 70%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {canvas}
      </div>
    );
  }

  return canvas;
}
