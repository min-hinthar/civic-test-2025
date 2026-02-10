'use client';

import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface MyanmarFlagProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Entrance spring + gentle continuous float */
  animated?: boolean;
  className?: string;
}

const sizes = {
  sm: 'h-10',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
};

// Official Myanmar flag colors
const YELLOW = '#FECB00';
const GREEN = '#34B233';
const RED_MY = '#EA2839';
const WHITE = '#FFFFFF';

// Use 19:10 viewBox to match AmericanFlag container for visual balance
const W = 1900;
const H = 1000;
const STRIPE_H = H / 3;

// Large white 5-pointed star centered on the flag
const STAR_R = 260;
const CX = W / 2;
const CY = H / 2;

const STAR_POLY = Array.from({ length: 10 }, (_, i) => {
  const angle = Math.PI / 2 + (i * Math.PI) / 5;
  const r = i % 2 === 0 ? STAR_R : STAR_R * 0.382;
  const x = CX - r * Math.cos(angle);
  const y = CY - r * Math.sin(angle);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}).join(' ');

/** Shared SVG flag content */
function FlagSVG() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect x={0} y={0} width={W} height={Math.ceil(STRIPE_H) + 1} fill={YELLOW} />
      <rect
        x={0}
        y={Math.round(STRIPE_H)}
        width={W}
        height={Math.ceil(STRIPE_H) + 1}
        fill={GREEN}
      />
      <rect
        x={0}
        y={Math.round(STRIPE_H * 2)}
        width={W}
        height={Math.ceil(STRIPE_H) + 1}
        fill={RED_MY}
      />
      <polygon points={STAR_POLY} fill={WHITE} />
    </svg>
  );
}

/**
 * SVG Myanmar flag with accurate colors and star.
 * Three stripes (yellow, green, red) with a large white 5-pointed star.
 * Uses 19:10 aspect to match AmericanFlag for visual balance.
 * Purely decorative — uses aria-hidden.
 */
export function MyanmarFlag({ size = 'md', animated = false, className }: MyanmarFlagProps) {
  const base = clsx('aspect-[19/10] overflow-hidden rounded-lg', sizes[size], className);

  if (animated) {
    return (
      <motion.div
        className={clsx(base, 'shadow-lg')}
        aria-hidden="true"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.3 }}
      >
        <motion.div
          className="h-full w-full"
          animate={{
            y: [0, -5, 0],
            rotate: [0, -1.2, 0, 0.8, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        >
          <FlagSVG />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className={clsx(base, 'shadow-md')} aria-hidden="true">
      <FlagSVG />
    </div>
  );
}
