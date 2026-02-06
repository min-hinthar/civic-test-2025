'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/router';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Page transition variants - slide + fade per user decision
const pageVariants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  enter: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -20,
  },
};

// Snappy timing per user decision (150-250ms)
const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.2,
};

// Reduced motion variants - instant transition
const reducedMotionVariants = {
  initial: { opacity: 1, x: 0 },
  enter: { opacity: 1, x: 0 },
  exit: { opacity: 1, x: 0 },
};

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Page transition wrapper with slide+fade animation.
 *
 * Features:
 * - Slide + fade combo between pages (modern app feel)
 * - Uses Next.js router pathname as key for proper exit animations
 * - mode="wait" ensures old page exits before new enters
 * - Respects prefers-reduced-motion
 *
 * Usage (in pages/_app.tsx):
 * ```tsx
 * <PageTransition>
 *   <Component {...pageProps} />
 * </PageTransition>
 * ```
 */
export function PageTransition({ children }: PageTransitionProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={router.pathname}
        variants={shouldReduceMotion ? reducedMotionVariants : pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={shouldReduceMotion ? { duration: 0 } : pageTransition}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Simpler fade-only transition for modals/overlays
 */
export function FadeTransition({ children, show }: { children: ReactNode; show: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
