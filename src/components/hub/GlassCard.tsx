'use client';

import { type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  /** Enable subtle hover lift + scale effect */
  interactive?: boolean;
}

/**
 * Reusable glass-morphism card wrapper for the Progress Hub.
 *
 * Uses frosted glass effect with backdrop-filter blur, translucent backgrounds,
 * and dark mode variants with subtle border glow. Supports an interactive mode
 * with hover scale/lift transitions.
 *
 * Falls back to opaque backgrounds for browsers without backdrop-filter support
 * via the `.glass-card` CSS class defined in globals.css.
 */
export function GlassCard({ children, className, interactive = false, ...rest }: GlassCardProps) {
  return (
    <div
      className={clsx('glass-card', interactive && 'glass-card-interactive', className)}
      {...rest}
    >
      {children}
    </div>
  );
}
