'use client';

import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { strings } from '@/lib/i18n/strings';
import { clsx } from 'clsx';

interface PreTestScreenProps {
  questionCount: number;
  durationMinutes: number;
  onReady: () => void;
}

/**
 * Calming pre-test screen with breathing animation.
 *
 * Features:
 * - Encouraging bilingual message
 * - Test info (question count, time limit)
 * - Breathing animation circle (user-controlled, runs until ready)
 * - "I'm Ready" button to start
 * - Respects prefers-reduced-motion
 *
 * IMPORTANT: Per user decision, the breathing animation is user-controlled -
 * it runs continuously until the user taps "I'm Ready", not on a forced timer.
 */
export function PreTestScreen({ questionCount, durationMinutes, onReady }: PreTestScreenProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {/* Breathing animation circle - runs until user clicks I'm Ready */}
      <motion.div
        className={clsx(
          'mb-8 h-32 w-32 rounded-full',
          'bg-gradient-to-br from-primary-400 to-primary-600',
          'shadow-lg shadow-primary-500/30'
        )}
        animate={
          shouldReduceMotion
            ? {}
            : {
                scale: [1, 1.15, 1],
                opacity: [0.7, 1, 0.7],
              }
        }
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />

      {/* Encouraging heading */}
      <BilingualHeading
        text={{
          en: "You've Got This!",
          my: 'သင်လုပ်နိုင်ပါတယ်!',
        }}
        level={1}
        size="2xl"
        centered
        className="mb-4"
      />

      {/* Encouraging message */}
      <p className="max-w-md text-muted-foreground mb-6">
        <span className="block">
          Take a deep breath. This practice test will help you prepare for your citizenship journey.
        </span>
        <span className="block font-myanmar mt-1">
          အသက်ရှုနက်နက်ရှူပါ။ ဤလေ့ကျင့်ခန်းက သင့်နိုင်ငံသားဖြစ်ခြင်းခရီးအတွက် အကူအညီဖြစ်ပါလိမ့်မယ်။
        </span>
      </p>

      {/* Test info */}
      <div className="mb-8 flex gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">{questionCount}</span>
          <span>Questions / မေးခွန်းများ</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">{durationMinutes}</span>
          <span>Minutes / မိနစ်</span>
        </div>
      </div>

      {/* Ready button */}
      <BilingualButton
        label={strings.actions.iAmReady}
        variant="primary"
        size="lg"
        onClick={onReady}
      />

      {/* Pass threshold info */}
      <p className="mt-6 text-sm text-muted-foreground">
        {strings.test.passThreshold.en}
        <span className="block font-myanmar">{strings.test.passThreshold.my}</span>
      </p>
    </div>
  );
}
