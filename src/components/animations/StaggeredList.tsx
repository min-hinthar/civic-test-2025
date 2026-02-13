'use client';

import { ReactNode, Children } from 'react';
import { motion, Variants } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY, STAGGER_DEFAULT } from '@/lib/motion-config';
import { clsx } from 'clsx';

// Item variants - bouncy spring pop entrance (scale 0.9→1 + y 20→0)
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING_BOUNCY,
  },
};

// Reduced motion variants
const reducedContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
};

const reducedItemVariants: Variants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  /** Time between each item animation (ms) */
  stagger?: number;
}

/**
 * Container for staggered list item animations.
 *
 * Features:
 * - Items fade/slide in sequentially
 * - Configurable stagger timing
 * - Respects prefers-reduced-motion
 *
 * Usage:
 * ```tsx
 * <StaggeredList>
 *   {items.map(item => (
 *     <StaggeredItem key={item.id}>
 *       <Card>{item.content}</Card>
 *     </StaggeredItem>
 *   ))}
 * </StaggeredList>
 * ```
 */
export function StaggeredList({
  children,
  className,
  delay = 100,
  stagger = STAGGER_DEFAULT * 1000,
}: StaggeredListProps) {
  const shouldReduceMotion = useReducedMotion();

  const customContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger / 1000,
        delayChildren: delay / 1000,
      },
    },
  };

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedContainerVariants : customContainerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * Individual item within a StaggeredList.
 */
export function StaggeredItem({ children, className }: StaggeredItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedItemVariants : itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered grid for card layouts
 */
export function StaggeredGrid({
  children,
  className,
  columns = 3,
  ...props
}: StaggeredListProps & { columns?: number }) {
  return (
    <StaggeredList
      className={clsx(
        'grid gap-4',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
      {...props}
    >
      {Children.map(children, child => (
        <StaggeredItem>{child}</StaggeredItem>
      ))}
    </StaggeredList>
  );
}

/**
 * Simple fade-in animation for single elements
 */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delay: delay / 1000, duration: 0.3, ease: 'easeOut' }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
