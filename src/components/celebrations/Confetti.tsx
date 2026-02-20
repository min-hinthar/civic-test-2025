'use client';

import { useCallback, useRef, useEffect } from 'react';
import ReactCanvasConfetti from 'react-canvas-confetti';
import confetti from 'canvas-confetti';
import type confettiNs from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { announce } from '@/lib/a11y/announcer';

// Type aliases from canvas-confetti namespace
type ConfettiInstance = confettiNs.CreateTypes;
type ConfettiOptions = confettiNs.Options;

// ---------------------------------------------------------------------------
// Custom Shapes (civics-themed)
// ---------------------------------------------------------------------------

// 5-pointed star
const starShape = confetti.shapeFromPath({
  path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
});

// Shield (civics theme)
const shieldShape = confetti.shapeFromPath({
  path: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5L12 1z',
});

// Weighted shapes array: stars(2), shield(1), circle(3) -- duplicated for weighting
const themedShapes: confettiNs.Shape[] = [
  starShape,
  starShape,
  shieldShape,
  'circle',
  'circle',
  'circle',
];

// ---------------------------------------------------------------------------
// Color Palettes
// ---------------------------------------------------------------------------

const lightModeColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const darkModeColors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#F472B6'];

const goldAccents = ['#FFD700', '#FFC107', '#FFAB00'];

// ---------------------------------------------------------------------------
// Low-end device detection
// ---------------------------------------------------------------------------

const isLowEnd = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ?? 4) <= 2;

const particleScale = isLowEnd ? 0.25 : 1;

// ---------------------------------------------------------------------------
// Confetti defaults (party popper physics from bottom-center)
// ---------------------------------------------------------------------------

const confettiDefaults: ConfettiOptions = {
  origin: { x: 0.5, y: 1.0 },
  angle: 90,
  spread: 70,
  startVelocity: 45,
  gravity: 1.2,
  ticks: 100,
  decay: 0.94,
  shapes: themedShapes,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ConfettiProps {
  /** Trigger confetti burst */
  fire: boolean;
  /** Intensity: small sparkle, medium burst, or full celebration */
  intensity?: 'sparkle' | 'burst' | 'celebration';
  /** Called when animation completes */
  onComplete?: () => void;
  /** Use brighter color palette for dark mode */
  isDarkMode?: boolean;
}

/**
 * Canvas-based confetti celebration effect with civics-themed shapes.
 *
 * Features:
 * - Three intensity levels (sparkle, burst, celebration)
 * - Custom star, shield, and circle particle shapes
 * - Party popper physics (bottom-center origin, upward angle)
 * - Dark mode color adaptation (brighter/more luminous)
 * - Low-end device particle reduction (25% count)
 * - Leak-free interval management with ref cleanup
 * - Respects prefers-reduced-motion (renders nothing)
 *
 * Usage:
 * ```tsx
 * const [showConfetti, setShowConfetti] = useState(false);
 * <Confetti fire={showConfetti} intensity="celebration" onComplete={() => setShowConfetti(false)} />
 * ```
 */
export function Confetti({
  fire,
  intensity = 'burst',
  onComplete,
  isDarkMode = false,
}: ConfettiProps) {
  const refAnimationInstance = useRef<ConfettiInstance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleInit = useCallback(({ confetti: c }: { confetti: ConfettiInstance }) => {
    refAnimationInstance.current = c;
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const fireConfetti = useCallback(() => {
    if (!refAnimationInstance.current || shouldReduceMotion) return;

    const instance = refAnimationInstance.current;
    const colors = isDarkMode ? darkModeColors : lightModeColors;

    switch (intensity) {
      case 'sparkle':
        // Small sparkle - single burst (30 particles, scaled for device)
        instance({
          ...confettiDefaults,
          particleCount: Math.round(30 * particleScale),
          spread: 60,
          colors,
        });
        // onComplete after sparkle animation settles
        setTimeout(() => onComplete?.(), 800);
        break;

      case 'burst':
        // Medium burst - two-shot (50 + 30 delayed)
        instance({
          ...confettiDefaults,
          particleCount: Math.round(50 * particleScale),
          colors,
        });
        setTimeout(() => {
          instance?.({
            ...confettiDefaults,
            particleCount: Math.round(30 * particleScale),
            colors,
          });
        }, 150);
        // onComplete after burst animation settles
        setTimeout(() => onComplete?.(), 1200);
        break;

      case 'celebration': {
        // Full celebration - party popper from bottom-center (3s duration)
        // Alternates left and right of center for party popper fan effect
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const baseParticles = Math.round(200 * particleScale);

        // Clear any existing interval before creating new one
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        let tickIndex = 0;

        intervalRef.current = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            onComplete?.();
            return;
          }

          const progress = timeLeft / duration;
          const particleCount = Math.round((baseParticles / 12) * progress);

          // Alternate left and right of center (x: 0.3 - 0.7)
          const isLeft = tickIndex % 2 === 0;
          const xPos = isLeft ? 0.3 + Math.random() * 0.15 : 0.55 + Math.random() * 0.15;

          // Mix in gold accents for big celebrations
          const celebrationColors = [...colors, ...goldAccents];

          instance({
            ...confettiDefaults,
            particleCount: Math.max(2, particleCount),
            origin: { x: xPos, y: 1.0 },
            colors: celebrationColors,
          });

          tickIndex++;
        }, 250);
        break;
      }
    }
  }, [intensity, onComplete, shouldReduceMotion, isDarkMode]);

  useEffect(() => {
    if (fire) {
      // Screen reader announcement fires regardless of reduced motion setting
      announce('Celebration!');
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
 * Hook to trigger confetti imperatively with themed shapes and physics.
 *
 * Usage:
 * ```tsx
 * const { onInit, fire } = useConfetti();
 * <ReactCanvasConfetti onInit={onInit} />
 * fire({ particleCount: 100 }); // Trigger confetti with themed shapes
 * ```
 */
export function useConfetti() {
  const confettiRef = useRef<ConfettiInstance | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const onInit = useCallback(({ confetti: c }: { confetti: ConfettiInstance }) => {
    confettiRef.current = c;
  }, []);

  const fire = useCallback(
    (options?: Partial<ConfettiOptions>) => {
      if (!confettiRef.current || shouldReduceMotion) return;
      confettiRef.current({
        ...confettiDefaults,
        colors: lightModeColors,
        ...options,
      });
    },
    [shouldReduceMotion]
  );

  return {
    onInit,
    fire,
    confettiDefaults,
    lightModeColors,
    darkModeColors,
    goldAccents,
  };
}
