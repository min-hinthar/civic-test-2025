'use client';

import { clsx } from 'clsx';

interface AmericanFlagProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-16 w-24',
  md: 'h-24 w-36',
  lg: 'h-32 w-48',
};

/**
 * CSS-only American flag motif.
 * Red/white stripes with a blue canton and simplified stars.
 * Purely decorative — uses aria-hidden.
 */
export function AmericanFlag({ size = 'md', className }: AmericanFlagProps) {
  return (
    <div
      className={clsx('relative overflow-hidden rounded-xl shadow-lg', sizes[size], className)}
      aria-hidden="true"
    >
      {/* Red and white stripes */}
      <div className="absolute inset-0 flex flex-col">
        {Array.from({ length: 13 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 ${i % 2 === 0 ? 'bg-[hsl(0,72%,51%)]' : 'bg-surface'}`}
          />
        ))}
      </div>
      {/* Blue canton with stars */}
      <div className="absolute left-0 top-0 flex h-[54%] w-[40%] flex-wrap items-center justify-center gap-[2px] bg-[hsl(217,91%,35%)] p-1">
        {Array.from({ length: 15 }).map((_, i) => (
          <span key={i} className="text-[6px] leading-none text-white">
            &#9733;
          </span>
        ))}
      </div>
    </div>
  );
}
