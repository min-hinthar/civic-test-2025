'use client';

import { usePathname } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { getSlideDirection } from '@/components/navigation/navConfig';
import { SPRING_GENTLE } from '@/lib/motion-config';

const SESSION_KEY = 'civic-prev-pathname';

/**
 * Enter-only page transition for protected routes.
 *
 * Direction is determined by comparing the previous pathname (stored in
 * sessionStorage) against the current pathname using `getSlideDirection()`.
 * Template remounts on every navigation so `key` is unnecessary.
 * AnimatePresence is not used (no exit animation in App Router).
 */
export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  const rawPathname = usePathname();
  const pathname = rawPathname ?? '/home';
  const prefersReducedMotion = useReducedMotion();

  // Read previous path from sessionStorage (falls back to /home)
  const prevPath =
    typeof window !== 'undefined' ? (sessionStorage.getItem(SESSION_KEY) ?? '/home') : '/home';

  const direction = getSlideDirection(prevPath, pathname);

  // Store current pathname for the next navigation
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, pathname);
  }

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: direction === 'left' ? 30 : -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={SPRING_GENTLE}
    >
      {children}
    </motion.div>
  );
}
