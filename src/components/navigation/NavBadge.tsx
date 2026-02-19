'use client';

/**
 * NavBadge -- Badge component with spring entrance animation.
 *
 * Two types:
 * - 'count': Numeric badge (orange/warning), capped at 99+
 * - 'dot': Small dot indicator (accent/primary color)
 *
 * Entrance animation uses spring physics for a natural bounce effect.
 */

import { motion, AnimatePresence } from 'motion/react';

interface NavBadgeProps {
  type: 'count' | 'dot';
  count?: number;
  color?: 'warning' | 'primary';
  visible?: boolean;
}

export function NavBadge({ type, count = 0, color = 'warning', visible }: NavBadgeProps) {
  // For 'count' type: show when count > 0 (unless explicit visible override)
  // For 'dot' type: show when visible is true
  const show = visible !== undefined ? visible : type === 'count' ? count > 0 : false;

  const colorClass =
    color === 'warning'
      ? 'bg-warning text-warning-foreground'
      : 'bg-primary text-primary-foreground';

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key={type === 'count' ? count : 'dot'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full ${colorClass} ${
            type === 'dot'
              ? 'h-2.5 w-2.5'
              : 'min-w-[18px] h-[18px] px-1 text-caption font-bold leading-none'
          }`}
        >
          {type === 'count' && (count > 99 ? '99+' : count)}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
