'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import clsx from 'clsx';
import { BilingualString } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { SPRING_BOUNCY, SPRING_PRESS_DOWN } from '@/lib/motion-config';

// === Tier classification (matches Button.tsx) ===
type ButtonTier = 'primary' | 'secondary' | 'tertiary';

function getTier(variant: string): ButtonTier {
  switch (variant) {
    case 'primary':
    case 'chunky':
      return 'primary';
    case 'secondary':
      return 'secondary';
    case 'outline':
    case 'ghost':
      return 'tertiary';
    default:
      return 'primary';
  }
}

// 3D chunky shadow classes using token-based colors (matches Button.tsx)
// Dark mode uses lighter rim-lit edges for glow effect
const chunky3D = [
  'shadow-[0_4px_0_hsl(var(--primary-700))]',
  'dark:shadow-[0_4px_0_hsl(var(--primary-300)/0.6)]',
  'hover:shadow-[0_4px_0_hsl(var(--primary-800))]',
  'dark:hover:shadow-[0_4px_0_hsl(var(--primary-300)/0.7)]',
  'active:shadow-[0_1px_0_hsl(var(--primary-800)),0_0_20px_hsl(var(--color-primary)/0.4)] active:translate-y-[3px] active:brightness-110',
  'dark:active:shadow-[0_1px_0_hsl(var(--primary-300)/0.6),0_0_20px_hsl(var(--color-primary)/0.4)]',
  'transition-[box-shadow,transform,filter] duration-100',
].join(' ');

const variants = {
  // PRIMARY tier — 3D chunky press
  primary: clsx(
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
    chunky3D
  ),
  chunky: clsx(
    'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
    chunky3D
  ),

  // SECONDARY tier — subtle scale + shadow reduction
  secondary: clsx(
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
    'shadow-sm active:shadow-none',
    'transition-[box-shadow] duration-100'
  ),

  // TERTIARY tier — opacity fade
  outline: clsx(
    'border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
    'transition-opacity duration-100 active:opacity-70'
  ),
  ghost: clsx(
    'text-primary hover:bg-primary/10 active:bg-primary/20',
    'transition-opacity duration-100 active:opacity-70'
  ),
};

const sizes = {
  sm: 'px-4 py-2 min-h-[40px]',
  md: 'px-6 py-3 min-h-[48px]',
  lg: 'px-8 py-4 min-h-[56px]',
};

// Use Motion's button props to avoid type conflicts with onDrag, etc.
type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>;

export interface BilingualButtonProps extends MotionButtonProps {
  /** Button label with en and my keys */
  label: BilingualString;
  /** Visual variant */
  variant?: keyof typeof variants;
  /** Size variant */
  size?: keyof typeof sizes;
  /** Full width button */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Icon to display before text */
  icon?: ReactNode;
}

/**
 * Animated pill button with bilingual label and three-tier press feedback.
 *
 * Tiers (aligned with Button.tsx):
 * - PRIMARY (primary, chunky): 3D chunky press with spring-back, lift on hover, dark mode rim-lit edges
 * - SECONDARY (secondary): Subtle scale 0.97 with shadow reduction
 * - TERTIARY (outline, ghost): Opacity 0.7 fade on press
 *
 * Features:
 * - English on top, Burmese below (stacked)
 * - Pill shape (fully rounded)
 * - Shared spring configs from motion-config.ts
 * - Respects prefers-reduced-motion
 * - 44px+ minimum height for touch accessibility
 * - Disabled buttons show muted feedback
 */
export const BilingualButton = forwardRef<HTMLButtonElement, BilingualButtonProps>(
  (
    {
      label,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      icon,
      className,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const { showBurmese } = useLanguage();
    const isDisabled = disabled || loading;
    const tier = getTier(variant);

    // Tier-aware motion variants (matches Button.tsx pattern)
    const motionVariants = {
      idle: { scale: 1 },
      hover: shouldReduceMotion
        ? {}
        : tier === 'primary'
          ? { scale: 1.03, y: -1 } // lift on hover
          : tier === 'secondary'
            ? { scale: 1.02 }
            : {}, // tertiary: no hover animation
      tap: shouldReduceMotion
        ? {}
        : tier === 'primary'
          ? { scale: 0.95 }
          : tier === 'secondary'
            ? { scale: 0.97 }
            : {}, // tertiary: opacity handled by CSS
    };

    return (
      <motion.button
        ref={ref}
        variants={motionVariants}
        initial="idle"
        whileHover={isDisabled ? undefined : 'hover'}
        whileTap={isDisabled ? undefined : 'tap'}
        transition={tier === 'primary' ? SPRING_PRESS_DOWN : SPRING_BOUNCY}
        disabled={isDisabled}
        className={clsx(
          // Base
          'inline-flex flex-col items-center justify-center font-bold',
          // Pill shape
          'rounded-full',
          // Focus ring with smooth transition (matches Button.tsx)
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
          'transition-[box-shadow] duration-200',
          // Disabled — muted feedback hint
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'disabled:active:opacity-45',
          // Variant and size
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </span>
        ) : (
          <>
            {icon && <span className="mb-0.5">{icon}</span>}
            <span className="font-semibold leading-tight">{label.en}</span>
            {showBurmese && (
              <span className="font-normal font-myanmar text-white/80 leading-tight">
                {label.my}
              </span>
            )}
          </>
        )}
      </motion.button>
    );
  }
);
BilingualButton.displayName = 'BilingualButton';
