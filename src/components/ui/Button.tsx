'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { clsx } from 'clsx';
import { SPRING_BOUNCY, SPRING_PRESS_DOWN } from '@/lib/motion-config';

// === Tier classification ===
type ButtonTier = 'primary' | 'secondary' | 'tertiary';

function getTier(variant: string): ButtonTier {
  switch (variant) {
    case 'primary':
    case 'chunky':
    case 'destructive':
    case 'chunky-destructive':
    case 'success':
    case 'chunky-success':
      return 'primary';
    case 'secondary':
    case 'outline':
      return 'secondary';
    case 'ghost':
      return 'tertiary';
    default:
      return 'primary';
  }
}

// === 3D chunky shadow classes (CSS transition handles shadow + translateY on active) ===
// Prismatic glow flare added on press for triple feedback (scale + glow + brightness)
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

const chunkyDestructive3D = [
  'shadow-[0_4px_0_hsl(10_45%_35%)]',
  'dark:shadow-[0_4px_0_hsl(10_70%_65%/0.6)]',
  'hover:shadow-[0_4px_0_hsl(10_40%_30%)]',
  'dark:hover:shadow-[0_4px_0_hsl(10_70%_65%/0.7)]',
  'active:shadow-[0_1px_0_hsl(10_40%_30%),0_0_20px_hsl(var(--color-destructive)/0.4)] active:translate-y-[3px] active:brightness-110',
  'dark:active:shadow-[0_1px_0_hsl(10_70%_65%/0.6),0_0_20px_hsl(var(--color-destructive)/0.4)]',
  'transition-[box-shadow,transform,filter] duration-100',
].join(' ');

const chunkySuccess3D = [
  'shadow-[0_4px_0_hsl(142_76%_30%)]',
  'dark:shadow-[0_4px_0_hsl(142_76%_55%/0.6)]',
  'hover:shadow-[0_4px_0_hsl(142_76%_25%)]',
  'dark:hover:shadow-[0_4px_0_hsl(142_76%_55%/0.7)]',
  'active:shadow-[0_1px_0_hsl(142_76%_25%),0_0_20px_hsl(var(--color-success)/0.4)] active:translate-y-[3px] active:brightness-110',
  'dark:active:shadow-[0_1px_0_hsl(142_76%_55%/0.6),0_0_20px_hsl(var(--color-success)/0.4)]',
  'transition-[box-shadow,transform,filter] duration-100',
].join(' ');

// === Button variants using theme tokens with 3D depth ===
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
  destructive: clsx(
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    chunkyDestructive3D
  ),
  'chunky-destructive': clsx(
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    chunkyDestructive3D
  ),
  success: clsx('bg-success text-white hover:bg-emerald-600', chunkySuccess3D),
  'chunky-success': clsx('bg-success text-white hover:bg-emerald-600', chunkySuccess3D),

  // SECONDARY tier — subtle scale + shadow reduction
  secondary: clsx(
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70',
    'shadow-sm active:shadow-none',
    'transition-[box-shadow] duration-100'
  ),
  outline: clsx(
    'border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20',
    'shadow-sm active:shadow-none',
    'transition-[box-shadow] duration-100'
  ),

  // TERTIARY tier — opacity fade
  ghost: clsx(
    'text-primary hover:bg-primary/10 active:bg-primary/20',
    'transition-opacity duration-100 active:opacity-70'
  ),
};

// Button sizes with 44px minimum for touch accessibility
const sizes = {
  sm: 'px-3 py-2 text-sm min-h-[44px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]', // 44px minimum for touch targets
  lg: 'px-8 py-3.5 text-lg min-h-[52px]',
};

// Use Motion's button props to avoid type conflicts with onDrag, etc.
type MotionButtonProps = Omit<HTMLMotionProps<'button'>, 'children'>;

export interface ButtonProps extends MotionButtonProps {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  fullWidth?: boolean;
  loading?: boolean;
  pill?: boolean;
  children: ReactNode;
}

/**
 * Animated button with three-tier press feedback system.
 *
 * Tiers:
 * - PRIMARY (primary, chunky, destructive, success): 3D chunky press with spring-back,
 *   lift on hover, dark mode rim-lit edges
 * - SECONDARY (secondary, outline): Subtle scale 0.97 with shadow reduction
 * - TERTIARY (ghost): Opacity fade to 0.7 on press
 *
 * Features:
 * - 3D raised appearance with bottom shadow that depresses on click (primary tier)
 * - Scale + spring back on press (motion/react)
 * - Scale up on hover (desktop, primary/secondary tiers)
 * - Rounded-xl shape (12px) by default, pill shape via `pill` prop
 * - Respects prefers-reduced-motion with instant state changes
 * - 44px minimum height for touch accessibility
 * - Bold font weight for Duolingo feel
 * - Disabled buttons show muted feedback
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled = false,
      pill = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();
    const tier = getTier(variant);

    // Tier-aware animation variants
    // CSS handles shadow + translateY on :active; motion handles scale only (avoids transform conflict)
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

    const isDisabled = disabled || loading;

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
          // Base styles with bold font
          'inline-flex items-center justify-center font-bold',
          // Rounded-xl by default, pill shape optional
          pill ? 'rounded-full' : 'rounded-xl',
          // Focus ring with smooth transition
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2',
          'transition-[box-shadow] duration-200',
          // Disabled state — muted feedback hint
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'disabled:active:opacity-45',
          // Variant and size
          variants[variant],
          sizes[size],
          // Full width
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
