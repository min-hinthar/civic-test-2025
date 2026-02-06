'use client';

import { useCallback, useRef, useEffect } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import type confetti from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Type aliases from canvas-confetti namespace
type ConfettiInstance = confetti.CreateTypes;
type ConfettiOptions = confetti.Options;

// Confetti preset options - patriotic + celebratory colors
const confettiDefaults: ConfettiOptions = {
  spread: 360,
  ticks: 100,
  gravity: 0.8,
  decay: 0.94,
  startVelocity: 30,
  colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
};

interface ConfettiProps {
  /** Trigger confetti burst */
  fire: boolean;
  /** Intensity: small sparkle, medium burst, or full celebration */
  intensity?: 'sparkle' | 'burst' | 'celebration';
  /** Called when animation completes */
  onComplete?: () => void;
}

/**
 * Canvas-based confetti celebration effect.
 *
 * Features:
 * - Three intensity levels (sparkle, burst, celebration)
 * - Smooth, performant canvas animation
 * - Respects prefers-reduced-motion (renders nothing)
 *
 * Usage:
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false);
 * <Confetti fire={showConfetti} intensity="celebration" onComplete={() => setShowConfetti(false)} />
 * ```
 */
export function Confetti({ fire, intensity = 'burst', onComplete }: ConfettiProps) {
  const refAnimationInstance = useRef<ConfettiInstance | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleInit = useCallback(({ confetti }: { confetti: ConfettiInstance }) => {
    refAnimationInstance.current = confetti;
  }, []);

  const fireConfetti = useCallback(() => {
    if (!refAnimationInstance.current || shouldReduceMotion) return;

    const instance = refAnimationInstance.current;

    switch (intensity) {
      case 'sparkle':
        // Small sparkle - single burst (30 particles)
        instance({
          ...confettiDefaults,
          particleCount: 30,
          spread: 60,
          origin: { x: 0.5, y: 0.6 },
        });
        break;

      case 'burst':
        // Medium burst - two-shot
        instance({
          ...confettiDefaults,
          particleCount: 50,
          origin: { x: 0.5, y: 0.5 },
        });
        setTimeout(() => {
          instance?.({
            ...confettiDefaults,
            particleCount: 30,
            origin: { x: 0.5, y: 0.5 },
          });
        }, 150);
        break;

      case 'celebration': {
        // Full celebration - fireworks effect (3s duration)
        const duration = 3000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            clearInterval(interval);
            onComplete?.();
            return;
          }

          const particleCount = 50 * (timeLeft / duration);

          // Left side burst
          instance({
            ...confettiDefaults,
            particleCount,
            origin: { x: Math.random() * 0.3, y: Math.random() - 0.2 },
          });
          // Right side burst
          instance({
            ...confettiDefaults,
            particleCount,
            origin: { x: Math.random() * 0.3 + 0.7, y: Math.random() - 0.2 },
          });
        }, 250);
        break;
      }
    }

    // For non-celebration intensities, call complete after short delay
    if (intensity !== 'celebration') {
      setTimeout(() => onComplete?.(), 1000);
    }
  }, [intensity, onComplete, shouldReduceMotion]);

  useEffect(() => {
    if (fire) {
      fireConfetti();
    }
  }, [fire, fireConfetti]);

  // Don't render canvas if reduced motion
  if (shouldReduceMotion) {
    return null;
  }

  return (
    <ReactCanvasConfetti
      onInit={handleInit}
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    />
  );
}

/**
 * Hook to trigger confetti imperatively.
 *
 * Usage:
 * ```tsx
 * const { onInit, fire } = useConfetti();
 * <ReactCanvasConfetti onInit={onInit} />
 * fire({ particleCount: 100 }); // Trigger confetti
 * ```
 */
export function useConfetti() {
  const confettiRef = useRef<ConfettiInstance | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const onInit = useCallback(({ confetti }: { confetti: ConfettiInstance }) => {
    confettiRef.current = confetti;
  }, []);

  const fire = useCallback(
    (options?: Partial<ConfettiOptions>) => {
      if (!confettiRef.current || shouldReduceMotion) return;
      confettiRef.current({
        ...confettiDefaults,
        ...options,
      });
    },
    [shouldReduceMotion]
  );

  return { onInit, fire };
}
