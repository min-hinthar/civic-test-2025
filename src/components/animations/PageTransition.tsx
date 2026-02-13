'use client';

import { ReactNode, cloneElement, isValidElement, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getSlideDirection } from '@/components/navigation/navConfig';
import { SPRING_SNAPPY } from '@/lib/motion-config';

// Direction-aware slide + scale variants
// Incoming: slide in from side + slight scale up (0.97→1) with spring
// Outgoing: scale down (→0.95) + short slide + quick tween fade
const getVariants = (dir: 'left' | 'right') => ({
  initial: {
    opacity: 0,
    scale: 0.97,
    x: dir === 'left' ? 30 : -30,
  },
  enter: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: SPRING_SNAPPY,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: dir === 'left' ? -15 : 15,
    transition: { type: 'tween' as const, ease: 'easeIn' as const, duration: 0.15 },
  },
});

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
 * Page transition wrapper with direction-aware slide+fade animation.
 *
 * Slides left/right based on tab order (higher tab = slide left, lower = slide right).
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

  // Track previous pathname and direction using "adjust state when props change" pattern
  // to avoid React Compiler issues with ref access during render
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  if (prevPath !== location.pathname) {
    setDirection(getSlideDirection(prevPath, location.pathname));
    setPrevPath(location.pathname);
  }

  // Pass location prop to Routes child for exit animation support
  const routesWithLocation = isValidElement(children)
    ? cloneElement(children, { location } as Record<string, unknown>)
    : children;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={shouldReduceMotion ? reducedMotionVariants : getVariants(direction)}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={shouldReduceMotion ? { duration: 0 } : undefined}
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
