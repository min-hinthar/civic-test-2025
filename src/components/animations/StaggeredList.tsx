'use client';

/**
 * Coverage audit (Phase 31-05):
 *
 * StaggeredList consumers (11 usages across 10 files):
 * - LandingPage: feature cards (4 items, stagger=100 explicit) -- fixed short list
 * - Dashboard: hero + stat sections (5-6 items, stagger=80 explicit) -- fixed layout
 * - StudyGuidePage: category cards (7 items, no explicit stagger) -- adaptive 40ms
 * - WelcomeState: guided steps (~4 items, stagger=100 explicit) -- fixed short list
 * - HistoryTab: test/interview sessions (2 dynamic lists, no explicit stagger) -- adaptive
 * - OverviewTab: dashboard sections (3 items, stagger=80 explicit) -- fixed short list
 * - AchievementsTab: badge grid (dynamic, stagger=60 explicit) -- per-category badges
 * - SessionSetup: setup form sections (5 items, no explicit stagger) -- adaptive 40ms
 * - DeckManager: deck card list (dynamic, up to 128, no explicit stagger) -- adaptive/skip 15+
 * - LeaderboardTable: leaderboard rows (up to 25, stagger=40 explicit) -- fast cascade
 * - BadgeGrid: badge cards (dynamic per category, stagger=60 explicit) -- grid layout
 *
 * FadeIn-only consumers (9 files):
 * - TestPage, InterviewResults, TestResultsScreen, PasswordUpdatePage,
 *   PasswordResetPage, QuestionReviewList, CategoryBreakdown, AuthPage, AboutPage
 *
 * Lists NOT using stagger (intentionally):
 * - Quiz answer options: appear instantly for fast interaction
 * - Flashcard stack: uses custom 3D flip animation, not list stagger
 * - Settings page rows: static config, no animation needed
 * - Navigation tabs: use indicator slide, not stagger
 */

import { ReactNode, Children } from 'react';
import { motion, Variants } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { clsx } from 'clsx';

/**
 * Adaptive stagger configuration based on child count, device capability,
 * and reduced-motion preference.
 */
interface AdaptiveConfig {
  shouldAnimate: boolean;
  stagger: number; // seconds
  delay: number; // seconds
}

/**
 * Calculates adaptive stagger timing based on list length and device capability.
 *
 * - 1-3 items: 60ms stagger (luxurious entrance)
 * - 4-8 items: 40ms stagger (fast cascade)
 * - 9-14 items: capped so total animation stays under ~400ms
 * - 15+ items: skip stagger entirely (all items appear at once)
 * - Low-end devices (hardwareConcurrency <= 4): skip stagger
 * - prefers-reduced-motion: keep stagger timing but remove per-item visual motion
 *
 * When `customStagger` is provided (backward compat), it overrides adaptive calculation.
 */
function getAdaptiveConfig(
  childCount: number,
  prefersReduced: boolean,
  customStagger?: number, // ms, from prop
  customDelay?: number // ms, from prop
): AdaptiveConfig {
  // 15+ items: skip entirely (performance, not motion preference)
  if (childCount >= 15) {
    return { shouldAnimate: false, stagger: 0, delay: 0 };
  }

  // Low-end device detection (performance, not motion preference)
  const isLowEnd =
    typeof navigator !== 'undefined' &&
    navigator.hardwareConcurrency != null &&
    navigator.hardwareConcurrency <= 4;
  if (isLowEnd) {
    return { shouldAnimate: false, stagger: 0, delay: 0 };
  }

  // If custom stagger provided, use it (backward compat)
  if (customStagger !== undefined) {
    return {
      shouldAnimate: true,
      stagger: customStagger / 1000,
      delay: (customDelay ?? 50) / 1000,
    };
  }

  // Adaptive timing based on count (same for normal and reduced motion)
  const delay = (customDelay ?? (prefersReduced ? 50 : 100)) / 1000;

  if (childCount <= 3) return { shouldAnimate: true, stagger: 0.06, delay }; // luxurious
  if (childCount <= 8) return { shouldAnimate: true, stagger: 0.04, delay }; // fast cascade

  // 9-14 items: cap total animation at ~400ms
  return {
    shouldAnimate: true,
    stagger: Math.min(0.04, 0.4 / childCount),
    delay: 0.03,
  };
}

// Item variants - slide up from 12px below + fade in + subtle scale
const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRING_BOUNCY,
  },
};

// Reduced motion variants: items start hidden, snap to visible instantly.
// Container stagger timing still applies, so items appear one-by-one
// but with zero per-item visual motion (no slide, no fade, no scale).
const reducedItemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
  /**
   * Time between each item animation (ms).
   * When omitted, adaptive timing is used based on child count.
   * When explicitly set, overrides adaptive calculation (backward compat).
   */
  stagger?: number;
}

/**
 * Container for staggered list item animations with adaptive timing.
 *
 * Features:
 * - Adaptive stagger timing scales with child count
 * - Skips stagger for 15+ items (instant appearance)
 * - Auto-disables on low-end devices (hardwareConcurrency <= 4)
 * - Respects prefers-reduced-motion
 * - Custom stagger prop overrides adaptive mode (backward compat)
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
export function StaggeredList({ children, className, delay, stagger }: StaggeredListProps) {
  const shouldReduceMotion = useReducedMotion();
  const childCount = Children.count(children);
  const config = getAdaptiveConfig(childCount, shouldReduceMotion, stagger, delay);

  if (!config.shouldAnimate) {
    // Skip animation: render children directly
    return <div className={className}>{children}</div>;
  }

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: config.stagger,
        delayChildren: config.delay,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
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
