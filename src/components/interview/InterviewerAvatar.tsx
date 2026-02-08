'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface InterviewerAvatarProps {
  /** Whether the interviewer is currently speaking (enables pulse animation) */
  isSpeaking?: boolean;
  /** Size of the avatar in pixels (default 64) */
  size?: number;
}

/**
 * Interviewer silhouette avatar with optional speaking pulse animation.
 *
 * Renders an inline SVG person silhouette (head circle + shoulder arc)
 * inside a rounded circle with a subtle gradient background.
 * When isSpeaking is true, a pulsing opacity animation plays.
 * Respects prefers-reduced-motion.
 */
export function InterviewerAvatar({ isSpeaking = false, size = 64 }: InterviewerAvatarProps) {
  const shouldReduceMotion = useReducedMotion();

  const pulseAnimation = isSpeaking && !shouldReduceMotion
    ? { opacity: [0.6, 1, 0.6] }
    : {};

  const pulseTransition = isSpeaking && !shouldReduceMotion
    ? { repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const }
    : {};

  return (
    <motion.div
      className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-200"
      style={{ width: size, height: size }}
      animate={pulseAnimation}
      transition={pulseTransition}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Head */}
        <circle cx="20" cy="14" r="7" className="fill-primary-500" />
        {/* Shoulders */}
        <path
          d="M6 36 C6 26, 14 22, 20 22 C26 22, 34 26, 34 36"
          className="fill-primary-500"
        />
      </svg>
    </motion.div>
  );
}
