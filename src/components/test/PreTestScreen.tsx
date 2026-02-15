'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Volume2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useTTS } from '@/hooks/useTTS';
import { useTTSSettings } from '@/hooks/useTTSSettings';
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

/** Speech override values passed from pre-screen to session */
export interface SpeechOverrides {
  speedOverride: 'slow' | 'normal' | 'fast';
  autoReadOverride: boolean;
}

/** Speed pill options matching Settings page pattern */
const SPEED_OPTIONS: { value: 'slow' | 'normal' | 'fast'; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: '\u1014\u103E\u1031\u1038' },
  { value: 'normal', en: 'Normal', my: '\u1015\u102F\u1036\u1019\u103E\u1014\u103A' },
  { value: 'fast', en: 'Fast', my: '\u1019\u103C\u1014\u103A' },
];

interface PreTestScreenProps {
  questionCount: number;
  durationMinutes: number;
  onReady: (overrides?: SpeechOverrides) => void;
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
 * - Per-session speech speed and auto-read overrides
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
  const { isSupported: ttsSupported } = useTTS();
  const { settings: globalTTS } = useTTSSettings();
  const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];

  // Per-session overrides (initialized from global, NOT synced back)
  const [sessionSpeed, setSessionSpeed] = useState<'slow' | 'normal' | 'fast'>(globalTTS.rate);
  const [sessionAutoRead, setSessionAutoRead] = useState(globalTTS.autoRead);

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
          my: '\u101E\u1004\u103A\u101C\u102F\u1015\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u1010\u101A\u103A!',
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
            {
              '\u1024\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1001\u1014\u103A\u1038\u101E\u100A\u103A \u1010\u1000\u101A\u1037\u103A USCIS \u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1000\u102D\u102F \u1010\u1030\u100A\u102E\u1005\u1031\u1015\u102B\u101E\u100A\u103A \u2014 \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038\u101E\u100A\u103A \u1021\u1004\u1039\u1002\u101C\u102D\u1015\u103A\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u1037\u103A\u101E\u102C \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
            }
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
            {
              '\u1021\u101E\u1000\u103A\u101B\u103E\u1030\u1014\u1000\u103A\u1014\u1000\u103A\u101B\u103E\u1030\u1015\u102B\u104B \u1024\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1001\u1014\u103A\u1038\u1000 \u101E\u1004\u1037\u103A\u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1016\u103C\u1005\u103A\u1001\u103C\u1004\u103A\u1038\u1001\u101B\u102E\u1038\u1021\u1010\u103D\u1000\u103A \u1021\u1000\u1030\u1021\u100A\u102E\u1016\u103C\u1005\u103A\u1015\u102B\u101C\u102D\u1019\u1037\u103A\u1019\u101A\u103A\u104B'
            }
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
          <span>
            {showBurmese
              ? 'Questions / \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038'
              : 'Questions'}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">{durationMinutes}</span>
          <span>{showBurmese ? 'Minutes / \u1019\u102D\u1014\u1005\u103A' : 'Minutes'}</span>
        </div>
      </div>

      {/* Speech options divider */}
      {ttsSupported && (
        <div className="mb-6 w-full max-w-sm border-t border-border/40 pt-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Volume2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Speech Speed</p>
            {showBurmese && (
              <span className="font-myanmar text-xs text-muted-foreground">
                {
                  '\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u1014\u103E\u102F\u1014\u103A\u1038'
                }
              </span>
            )}
          </div>

          {/* Speed pill selector */}
          <div className="flex gap-2" role="radiogroup" aria-label="Speech speed">
            {SPEED_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={sessionSpeed === option.value}
                onClick={() => setSessionSpeed(option.value)}
                className={clsx(
                  'flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition-all duration-150 min-h-[44px]',
                  sessionSpeed === option.value
                    ? 'border-primary bg-primary-subtle text-primary shadow-[0_2px_0_0] shadow-primary-200'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                )}
              >
                <span>{option.en}</span>
                {showBurmese && (
                  <span className="block font-myanmar text-xs mt-0.5 font-normal">{option.my}</span>
                )}
              </button>
            ))}
          </div>

          {/* Auto-read toggle */}
          <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Read</p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1021\u101C\u102D\u102F\u1021\u101C\u103B\u103E\u1031\u102C\u1000\u103A\u1016\u1010\u103A\u1015\u102B'
                  }
                </p>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sessionAutoRead}
              aria-label="Toggle auto-read"
              onClick={() => setSessionAutoRead(prev => !prev)}
              className="relative inline-flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span
                className={clsx(
                  'inline-flex h-7 w-12 items-center rounded-full border-2 border-transparent transition-colors duration-200',
                  sessionAutoRead ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-6 w-6 rounded-full bg-surface shadow-md ring-0 transition-transform duration-200',
                    sessionAutoRead ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Ready button - 3D chunky */}
      <BilingualButton
        label={strings.actions.iAmReady}
        variant="chunky"
        size="lg"
        onClick={() => onReady({ speedOverride: sessionSpeed, autoReadOverride: sessionAutoRead })}
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
                  {
                    '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1021\u101C\u102D\u102F\u1000\u103A \u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B'
                  }
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
