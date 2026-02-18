'use client';

import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { AmericanFlag } from '@/components/decorative/AmericanFlag';
import { MyanmarFlag } from '@/components/decorative/MyanmarFlag';
import { useLanguage } from '@/contexts/LanguageContext';

interface WelcomeScreenProps {
  /** Called when the user taps the continue button */
  onComplete: () => void;
}

/**
 * Bilingual welcome screen with animated US + Myanmar flags.
 * Shows on every sign-in. Dismissed by tapping "Get Started".
 * Respects language mode (showBurmese guard).
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { showBurmese } = useLanguage();

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
        <div className="relative mx-4 w-full max-w-md text-center">
          {/* Bilingual flags — own entrance animations */}
          <div className="mb-8 flex items-center justify-center gap-5">
            <AmericanFlag size="lg" animated />
            <MyanmarFlag size="lg" animated />
          </div>

          {/* Text content with separate spring */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.35 }}
          >
            {/* English */}
            <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Welcome to Civic Test Prep!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Your journey to U.S. citizenship starts here.
            </p>

            {/* Burmese */}
            {showBurmese && (
              <h2 className="mt-4 font-myanmar text-xl font-bold text-foreground">
                နိုင်ငံသားစာမေးပွဲ ပြင်ဆင်ရေးသို့ ကြိုဆိုပါတယ်!
              </h2>
            )}
            {showBurmese && (
              <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                အမေရိကန်နိုင်ငံသားဖြစ်ဖို့ ခရီးကို ဒီကနေ စလိုက်ပါ။
              </p>
            )}

            {/* Get Started button */}
            <button
              onClick={onComplete}
              className={clsx(
                'mt-8 px-10 py-3.5 rounded-full',
                'text-base font-bold',
                'bg-primary text-white',
                'hover:bg-primary/90 active:scale-95',
                'transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'min-h-[48px]'
              )}
            >
              Get Started
              {showBurmese && <span className="font-myanmar ml-2 text-white/80">စတင်ပါ</span>}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
