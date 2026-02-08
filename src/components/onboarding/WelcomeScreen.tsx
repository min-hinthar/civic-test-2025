'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeScreenProps {
  /** Called after 2-second auto-transition to start the tour */
  onComplete: () => void;
}

/**
 * CSS-only American flag motif welcome screen.
 * Full bilingual (English + Burmese) with patriotic emojis.
 * Auto-transitions to the onboarding tour after 2 seconds (no button).
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    timerRef.current = setTimeout(handleComplete, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[1001] flex items-center justify-center bg-background/95 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome to Civic Test Prep"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
          className="relative mx-4 max-w-md w-full text-center"
        >
          {/* CSS-only American Flag Motif */}
          <div className="relative mx-auto mb-6 h-32 w-48 overflow-hidden rounded-xl shadow-lg">
            {/* Red and white stripes */}
            <div className="absolute inset-0 flex flex-col">
              {Array.from({ length: 13 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 ${i % 2 === 0 ? 'bg-[hsl(0,72%,51%)]' : 'bg-white'}`}
                />
              ))}
            </div>
            {/* Blue canton with stars */}
            <div className="absolute left-0 top-0 flex h-[54%] w-[40%] flex-wrap items-center justify-center gap-[2px] bg-[hsl(217,91%,35%)] p-1">
              {Array.from({ length: 15 }).map((_, i) => (
                <span key={i} className="text-[6px] leading-none text-white" aria-hidden="true">
                  &#9733;
                </span>
              ))}
            </div>
          </div>

          {/* Patriotic emoji header */}
          <div className="mb-4 text-3xl" aria-hidden="true">
            &#129413; &#128509; &#128293;
          </div>

          {/* English welcome text */}
          <h1 className="text-2xl font-extrabold text-foreground mb-2">
            Welcome to Civic Test Prep!
          </h1>
          <p className="text-muted-foreground text-sm mb-3">
            Your journey to U.S. citizenship starts here.
          </p>

          {/* Burmese welcome text */}
          <h2 className="font-myanmar text-xl font-bold text-foreground mb-1">
            {
              '\u1000\u102D\u102F\u1000\u103A\u1005\u102C\u1005\u1019\u103A\u1038\u1015\u103C\u1004\u103A\u1006\u1004\u103A\u101B\u1031\u1038\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1019\u103E\u102F\u101E\u102D\u102F\u1037 \u1000\u103C\u102D\u102F\u1006\u102D\u102F\u1015\u102B\u101E\u100A\u103A!'
            }
          </h2>
          <p className="font-myanmar text-sm text-muted-foreground mb-4">
            {
              '\u1021\u1019\u1031\u101B\u102D\u1000\u1014\u103A\u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1015\u103D\u1032\u1001\u101B\u102E\u1038\u101E\u100A\u103A \u1012\u102E\u1014\u1031\u101B\u102C\u1019\u103E\u1005\u1010\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
            }
          </p>

          {/* Loading dots animation */}
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
