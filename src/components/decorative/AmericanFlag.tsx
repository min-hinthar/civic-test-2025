'use client';

import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface AmericanFlagProps {
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

// Official US flag colors (Executive Order 10834)
const RED = '#B22234';
const WHITE = '#FFFFFF';
const BLUE = '#3C3B6E';

// Flag dimensions: 1900 × 1000 (ratio 19:10)
const W = 1900;
const H = 1000;
const STRIPE_H = H / 13;

// Canton: 7 stripes tall, 2/5 of flag width
const CANTON_W = 760;
const CANTON_H = (7 / 13) * H;

// 5-pointed star polygon (unit radius, centered at origin)
const STAR_POLY = Array.from({ length: 10 }, (_, i) => {
  const angle = Math.PI / 2 + (i * Math.PI) / 5;
  const r = i % 2 === 0 ? 1 : 0.382;
  return `${(-r * Math.cos(angle)).toFixed(3)},${(-r * Math.sin(angle)).toFixed(3)}`;
}).join(' ');

// Star radius (close to official spec: 0.0616 * H / 2 ≈ 30.8)
const STAR_R = 30;

// 50 stars in 9 rows: alternating 6 and 5 per row
const HS = CANTON_W / 12;
const VS = CANTON_H / 10;

const STARS: { x: number; y: number }[] = [];
for (let row = 0; row < 9; row++) {
  const y = VS * (row + 1);
  const six = row % 2 === 0;
  const count = six ? 6 : 5;
  for (let col = 0; col < count; col++) {
    const x = six ? HS * (1 + col * 2) : HS * (2 + col * 2);
    STARS.push({ x, y });
  }
}

/** Shared SVG flag content */
function FlagSVG() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      {Array.from({ length: 13 }, (_, i) => (
        <rect
          key={`s${i}`}
          x={0}
          y={Math.round(i * STRIPE_H)}
          width={W}
          height={Math.ceil(STRIPE_H) + 1}
          fill={i % 2 === 0 ? RED : WHITE}
        />
      ))}
      <rect x={0} y={0} width={CANTON_W} height={Math.ceil(CANTON_H)} fill={BLUE} />
      <g fill={WHITE}>
        {STARS.map((pos, i) => (
          <polygon
            key={`st${i}`}
            points={STAR_POLY}
            transform={`translate(${pos.x.toFixed(1)},${pos.y.toFixed(1)}) scale(${STAR_R})`}
          />
        ))}
      </g>
    </svg>
  );
}

/**
 * SVG American flag with accurate proportions.
 * 13 stripes, blue canton, 50 stars in 9 alternating rows.
 * Official Old Glory colors. Purely decorative — uses aria-hidden.
 */
export function AmericanFlag({ size = 'md', animated = false, className }: AmericanFlagProps) {
  const base = clsx('aspect-[19/10] overflow-hidden rounded-lg', sizes[size], className);

  if (animated) {
    return (
      <motion.div
        className={clsx(base, 'shadow-lg')}
        aria-hidden="true"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 16, delay: 0.15 }}
      >
        <motion.div
          className="h-full w-full"
          animate={{
            y: [0, -5, 0],
            rotate: [0, 1.2, 0, -0.8, 0],
          }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
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
