'use client';

import { ReactNode, cloneElement, isValidElement } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
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
 * Wraps a <Routes> component and provides animated page transitions.
 * Passes location to the Routes child for proper exit animation support.
 *
 * Usage:
 * ```tsx
 * <PageTransition>
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *   </Routes>
 * </PageTransition>
 * ```
 */
export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Pass location prop to Routes child for exit animation support
  const routesWithLocation =
    isValidElement(children) ? cloneElement(children, { location } as Record<string, unknown>) : children;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={shouldReduceMotion ? reducedMotionVariants : pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={shouldReduceMotion ? { duration: 0 } : pageTransition}
      >
        {routesWithLocation}
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
