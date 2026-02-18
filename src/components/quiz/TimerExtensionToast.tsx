'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TimerExtensionToastProps {
  /** Whether to show the toast */
  show: boolean;
  /** Called when user extends the timer */
  onExtend: () => void;
  /** Show Burmese text */
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// TimerExtensionToast
// ---------------------------------------------------------------------------

/**
 * WCAG 2.2.1 timer extension banner.
 *
 * Features:
 * - Warning-subtle background with border
 * - "+15s" button with min-h-[44px] touch target
 * - E keyboard shortcut to extend
 * - AnimatePresence for slide-in/out
 * - role="alert" aria-live="assertive" for screen reader announcement
 */
export function TimerExtensionToast({ show, onExtend, showBurmese }: TimerExtensionToastProps) {
  const shouldReduceMotion = useReducedMotion();

  // Sync callback ref in effect (React Compiler safe -- no ref access during render)
  const extendRef = useRef(onExtend);
  useEffect(() => {
    extendRef.current = onExtend;
  }, [onExtend]);

  // E keyboard shortcut (active when show=true)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'e' || e.key === 'E') {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      e.preventDefault();
      extendRef.current();
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, handleKeyDown]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.2 }}
          role="alert"
          aria-live="assertive"
          className={clsx(
            'flex items-center gap-3 rounded-xl border border-warning/40 bg-warning-subtle px-4 py-3',
            'shadow-lg'
          )}
        >
          <Clock className="h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Time running low!</p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground">
                {
                  '\u1021\u1001\u103B\u102D\u1014\u103A\u1014\u100A\u103A\u1038\u1014\u1031\u1015\u102B\u1015\u103C\u102E!'
                }
              </p>
            )}
            <p className="sr-only">Time running low. Press E or tap Extend to add 15 seconds.</p>
          </div>
          <button
            type="button"
            onClick={onExtend}
            className={clsx(
              'shrink-0 rounded-lg px-4 py-2 text-sm font-bold',
              'min-h-[44px] min-w-[44px]',
              'bg-warning text-white',
              'transition-colors hover:bg-warning/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2'
            )}
          >
            +15s
            <span className="sr-only"> (or press E)</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
