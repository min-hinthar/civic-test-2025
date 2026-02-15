'use client';

import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { PillTabBar } from '@/components/ui/PillTabBar';
import { CategoryRing } from '@/components/progress/CategoryRing';
import { strings } from '@/lib/i18n/strings';
import { USCIS_CATEGORIES, CATEGORY_COLORS } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import { clsx } from 'clsx';

const miniRingColors: Record<string, string> = {
  blue: 'text-primary',
  amber: 'text-warning',
  emerald: 'text-success',
};

interface PreTestScreenProps {
  questionCount: number;
  durationMinutes: number;
  onReady: () => void;
  /** Optional callback for question count selection */
  onCountChange?: (count: number) => void;
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
export function PreTestScreen({
  questionCount,
  durationMinutes,
  onReady,
  onCountChange,
}: PreTestScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();
  const { categoryMasteries } = useCategoryMastery();
  const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center glass-medium rounded-2xl mx-4 my-6 py-8">
      {/* Breathing animation circle - runs until user clicks I'm Ready */}
      <motion.div
        className={clsx(
          'mb-8 h-32 w-32 rounded-full',
          'bg-gradient-to-br from-primary-400 to-primary-600',
          'shadow-lg shadow-primary-500/30'
        )}
        initial={{ scale: 1, opacity: 0.7 }}
        animate={shouldReduceMotion ? {} : { scale: 1.15, opacity: 1 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'mirror',
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

      {/* USCIS simulation message */}
      <div className="mb-4 max-w-md rounded-xl border border-primary/30 bg-primary-subtle/20 px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          This simulates the real USCIS civics test — questions are in English only.
        </p>
        {showBurmese && (
          <p className="font-myanmar mt-1 text-xs text-muted-foreground">
            ဤလေ့ကျင့်ခန်းသည် တကယ့် USCIS နိုင်ငံသားစာမေးပွဲကို တူညီစေပါသည် — မေးခွန်းများသည်
            အင်္ဂလိပ်ဘာသာဖြင့်သာ ဖြစ်ပါသည်။
          </p>
        )}
      </div>

      {/* Encouraging message */}
      <p className="max-w-md text-muted-foreground mb-6">
        <span className="block">
          Take a deep breath. This practice test will help you prepare for your citizenship journey.
        </span>
        {showBurmese && (
          <span className="block font-myanmar mt-1">
            အသက်ရှုနက်နက်ရှူပါ။ ဤလေ့ကျင့်ခန်းက သင့်နိုင်ငံသားဖြစ်ခြင်းခရီးအတွက်
            အကူအညီဖြစ်ပါလိမ့်မယ်။
          </span>
        )}
      </p>

      {/* Question count selector */}
      {onCountChange && (
        <div className="mb-6 w-full max-w-xs">
          <PillTabBar
            tabs={[
              { id: '10', label: '10 Qs' },
              { id: '20', label: '20 Qs' },
            ]}
            activeTab={String(questionCount)}
            onTabChange={id => onCountChange(Number(id))}
            ariaLabel="Question count"
            size="sm"
          />
        </div>
      )}

      {/* Test info */}
      <div className="mb-8 flex gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">{questionCount}</span>
          <span>{showBurmese ? 'Questions / မေးခွန်းများ' : 'Questions'}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">{durationMinutes}</span>
          <span>{showBurmese ? 'Minutes / မိနစ်' : 'Minutes'}</span>
        </div>
      </div>

      {/* Ready button - 3D chunky */}
      <BilingualButton
        label={strings.actions.iAmReady}
        variant="chunky"
        size="lg"
        onClick={onReady}
      />

      {/* Pass threshold info */}
      <p className="mt-6 text-sm text-muted-foreground">
        {strings.test.passThreshold.en}
        {showBurmese && <span className="block font-myanmar">{strings.test.passThreshold.my}</span>}
      </p>

      {/* Practice by Category section */}
      <div className="mt-10 w-full max-w-md">
        <div className="border-t border-border/40 pt-6">
          <Link
            to="/practice"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary-400 hover:bg-primary-subtle/30"
          >
            <BookOpen className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Practice by Category</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  အမျိုးအစားအလိုက် လေ့ကျင့်ပါ
                </p>
              )}
            </div>
            <div className="flex gap-1.5">
              {categories.map(cat => {
                const color = CATEGORY_COLORS[cat];
                const mastery = categoryMasteries[cat] ?? 0;
                return (
                  <CategoryRing
                    key={cat}
                    percentage={mastery}
                    color={miniRingColors[color]}
                    size={28}
                    strokeWidth={3}
                  />
                );
              })}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
