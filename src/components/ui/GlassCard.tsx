'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

export type GlassTier = 'light' | 'medium' | 'heavy';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Glass blur intensity tier. Default: 'light' */
  tier?: GlassTier;
  /** Enable hover lift + shadow intensification */
  interactive?: boolean;
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
 * Tiers:
 * - light (default): Regular cards, list items. 16px blur.
 * - medium: Hero cards, featured content. 24px blur.
 * - heavy: Modals, navigation overlays. 32px blur.
 *
 * Falls back to opaque backgrounds via @supports in globals.css.
 */
export function GlassCard({
  children,
  tier = 'light',
  interactive = false,
  className,
  ...rest
}: GlassCardProps) {
  return (
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
}
