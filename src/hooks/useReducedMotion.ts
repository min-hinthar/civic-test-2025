'use client';

import { useReducedMotion as useMotionReducedMotion } from 'motion/react';

/**
 * Hook to detect user's prefers-reduced-motion preference.
 * Uses Motion's built-in hook for consistency with animation library.
 *
 * @returns true if user prefers reduced motion, false otherwise
 *
 * Usage:
 * ```tsx
 * const shouldReduceMotion = useReducedMotion();
 * const animation = shouldReduceMotion ? {} : { scale: 1.05 };
 * ```
 */
export function useReducedMotion(): boolean {
  const prefersReduced = useMotionReducedMotion();
  // Motion's hook returns null during SSR, treat as no preference
  return prefersReduced ?? false;
}
