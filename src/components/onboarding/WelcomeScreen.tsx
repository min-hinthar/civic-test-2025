'use client';

import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AmericanFlag } from '@/components/decorative/AmericanFlag';

interface WelcomeScreenProps {
  /** Called when the user taps the continue button */
  onComplete: () => void;
}

/**
 * CSS-only American flag motif welcome screen.
 * Full bilingual (English + Burmese) with patriotic emojis.
 * Shows on every sign-in session. Dismissed by tapping "Get Started".
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
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
          {/* American Flag Motif */}
          <AmericanFlag size="lg" className="mx-auto mb-6" />

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
            {'ကိုက်စာစမ်းပြင်ဆင်ရေးလေ့ကျင့်မှုသို့ ကြိုဆိုပါသည်!'}
          </h2>
          <p className="font-myanmar text-sm text-muted-foreground mb-6">
            {'အမေရိကန်နိုင်ငံသားဖြစ်ပွဲခရီးသည် ဒီနေရာမှစတင်ပါသည်။'}
          </p>

          {/* Get Started button */}
          <button
            onClick={onComplete}
            className={clsx(
              'px-8 py-3 rounded-full',
              'text-base font-bold',
              'bg-primary text-white',
              'hover:bg-primary/90 active:scale-95',
              'transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              'min-h-[48px]'
            )}
          >
            Get Started
            <span className="font-myanmar ml-2 text-white/80">{'စတင်ပါ'}</span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
