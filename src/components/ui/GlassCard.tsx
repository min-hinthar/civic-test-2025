'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import clsx from 'clsx';
import { SPRING_GENTLE } from '@/lib/motion-config';

export type GlassTier = 'light' | 'medium' | 'heavy';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Glass blur intensity tier. Default: 'light' */
  tier?: GlassTier;
  /** Enable hover lift + shadow intensification */
  interactive?: boolean;
  /** Enable enter animation (scale+fade). Default: true. Set false inside StaggeredList to avoid double-animation. */
  animate?: boolean;
  className?: string;
}

const TIER_CLASSES: Record<GlassTier, string> = {
  light: 'glass-light prismatic-border',
  medium: 'glass-medium prismatic-border',
  heavy: 'glass-heavy prismatic-border',
};

/**
 * Premium glass-morphism card with tiered blur, prismatic rainbow border,
 * and optional interactive hover effects.
 *
 * Features:
 * - Scale(0.95->1) + fade enter animation on mount
 * - Outer motion.div wrapper avoids transform + backdrop-filter conflict on WebKit
 * - Respects prefers-reduced-motion
 *
 * Tiers:
 * - light (default): Regular cards, list items. 16px blur.
 * - medium: Hero cards, featured content. 24px blur.
 * - heavy: Modals, navigation overlays. 32px blur.
 *
 * Falls back to opaque backgrounds via @supports in globals.css.
 *
 * When used inside StaggeredList, set `animate={false}` to avoid double-animation
 * (StaggeredItem already handles scale + opacity + y entrance).
 */
export function GlassCard({
  children,
  tier = 'light',
  interactive = false,
  animate: enableAnimation = true,
  className,
  ...rest
}: GlassCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimation && !shouldReduceMotion;

  const glassDiv = (
    <div
      className={clsx(
        TIER_CLASSES[tier],
        'p-5',
        interactive && 'glass-card-interactive cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );

  if (!shouldAnimate) return glassDiv;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_GENTLE}
    >
      {glassDiv}
    </motion.div>
  );
}
