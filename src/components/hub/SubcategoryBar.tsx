'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getMasteryColor } from '@/components/hub/CategoryDonut';

// ---------------------------------------------------------------------------
// SubcategoryBar component
// ---------------------------------------------------------------------------

export interface SubcategoryBarProps {
  /** Mastery percentage (0-100) */
  percentage: number;
  /** Bilingual label */
  label: { en: string; my: string };
  /** Optional click handler -- tapping weak subcategory navigates to study guide */
  onClick?: () => void;
}

/**
 * Animated striped progress bar for subcategory mastery.
 *
 * Features:
 * - Bar fill color uses mastery gradient (red -> amber -> green based on percentage)
 * - Animated striped candy-bar pattern using stripe-move keyframes from globals.css
 * - Animates width from 0 on first render
 * - Shows percentage value on the right
 * - Bilingual label with useLanguage
 * - Tappable when onClick provided (for navigating to study guide)
 */
export function SubcategoryBar({ percentage, label, onClick }: SubcategoryBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const barColor = getMasteryColor(clampedPercentage);

  const Wrapper = onClick ? 'button' : 'div';
  const wrapperProps = onClick
    ? {
        type: 'button' as const,
        onClick,
        className: 'w-full text-left min-h-[36px] cursor-pointer group',
      }
    : { className: 'w-full text-left' };

  return (
    <Wrapper {...wrapperProps}>
      {/* Label row */}
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
          {label.en}
        </span>
        <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-text-secondary">
          {clampedPercentage}%
        </span>
      </div>

      {showBurmese && (
        <p className="font-myanmar -mt-0.5 mb-1 truncate text-[10px] text-text-secondary/70">
          {label.my}
        </p>
      )}

      {/* Progress bar track */}
      <div className="h-2 overflow-hidden rounded-full bg-muted-foreground/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            backgroundColor: barColor,
            backgroundImage: `linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.2) 25%,
              transparent 25%,
              transparent 50%,
              rgba(255, 255, 255, 0.2) 50%,
              rgba(255, 255, 255, 0.2) 75%,
              transparent 75%,
              transparent
            )`,
            backgroundSize: '1rem 1rem',
            animation: shouldReduceMotion ? 'none' : 'stripe-move 1s linear infinite',
          }}
          initial={shouldReduceMotion ? { width: `${clampedPercentage}%` } : { width: '0%' }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 80, damping: 20, delay: 0.4 }
          }
        />
      </div>
    </Wrapper>
  );
}
