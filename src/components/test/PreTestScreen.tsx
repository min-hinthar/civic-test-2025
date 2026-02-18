'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Timer, Volume2 } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useTTS } from '@/hooks/useTTS';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { PillTabBar } from '@/components/ui/PillTabBar';
import { Card } from '@/components/ui/Card';
import { CategoryRing } from '@/components/progress/CategoryRing';
import { strings } from '@/lib/i18n/strings';
import { USCIS_CATEGORIES, CATEGORY_COLORS } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import type { MockTestMode } from '@/types';
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

/** Extended overrides including per-question timer setting and mode */
export interface SessionOverrides extends SpeechOverrides {
  timerEnabled: boolean;
  mode: MockTestMode;
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
  onReady: (overrides?: SessionOverrides) => void;
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

  // Mode selection
  const [selectedMode, setSelectedMode] = useState<MockTestMode>('practice');

  // Per-session overrides (initialized from global, NOT synced back)
  const [sessionSpeed, setSessionSpeed] = useState<'slow' | 'normal' | 'fast'>(globalTTS.rate);
  const [timerEnabled, setTimerEnabled] = useState(true);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
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

      {/* Breathing animation circle */}
      <div className="mb-6 flex justify-center">
        <motion.div
          className={clsx(
            'h-24 w-24 rounded-full',
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
      </div>

      {/* USCIS simulation message */}
      <div className="mb-6 mx-auto max-w-md rounded-xl border border-primary/30 bg-primary-subtle/20 px-4 py-3">
        <p className="text-sm font-medium text-foreground text-center">
          This simulates the real USCIS civics test — questions are in English only.
        </p>
        {showBurmese && (
          <p className="font-myanmar mt-1 text-xs text-muted-foreground text-center">
            {
              '\u1024\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1001\u1014\u103A\u1038\u101E\u100A\u103A \u1010\u1000\u101A\u1037\u103A USCIS \u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1000\u102D\u102F \u1010\u1030\u100A\u102E\u1005\u1031\u1015\u102B\u101E\u100A\u103A \u2014 \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038\u101E\u100A\u103A \u1021\u1004\u1039\u1002\u101C\u102D\u1015\u103A\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u1037\u103A\u101E\u102C \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
            }
          </p>
        )}
      </div>

      {/* Mode selector - PillTabBar */}
      <div className="mb-6">
        <PillTabBar
          tabs={[
            {
              id: 'practice',
              label: 'Practice',
              labelMy: '\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A',
              icon: BookOpen,
            },
            {
              id: 'real-exam',
              label: 'Real Exam',
              labelMy:
                '\u1021\u1019\u103E\u1014\u103A\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032',
              icon: Shield,
            },
          ]}
          activeTab={selectedMode}
          onTabChange={id => setSelectedMode(id as MockTestMode)}
          ariaLabel="Mock test mode"
          showBurmese={showBurmese}
        />
      </div>

      {/* Mode info panel */}
      <Card elevated={false} className="mb-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Mode badge */}
          <span
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
              selectedMode === 'real-exam'
                ? 'bg-primary-subtle text-primary'
                : 'bg-accent/20 text-accent-foreground'
            )}
          >
            {selectedMode === 'real-exam' ? (
              <>
                <Shield className="h-3.5 w-3.5" />
                USCIS Simulation
              </>
            ) : (
              <>
                <BookOpen className="h-3.5 w-3.5" />
                Practice
              </>
            )}
          </span>

          {/* Mode icon */}
          <div
            className={clsx(
              'flex h-16 w-16 items-center justify-center rounded-2xl',
              selectedMode === 'real-exam'
                ? 'bg-primary-subtle text-primary'
                : 'bg-accent/20 text-accent-foreground'
            )}
          >
            {selectedMode === 'real-exam' ? (
              <Shield className="h-8 w-8" />
            ) : (
              <BookOpen className="h-8 w-8" />
            )}
          </div>

          {/* Mode description */}
          {selectedMode === 'real-exam' ? (
            <div className="space-y-2">
              <p className="text-base font-bold text-foreground">USCIS 2025 Rules</p>
              <p className="text-sm text-muted-foreground">
                20 questions. Pass at 12 correct. Fail at 9 incorrect.
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1042\u1040\u104B \u1041\u1042 \u1001\u102F\u1019\u103E\u1014\u103A\u101C\u103B\u103E\u1004\u103A \u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u104B \u1049 \u1001\u102F\u1019\u103E\u102C\u1038\u101C\u103B\u103E\u1004\u103A \u1000\u103B\u101B\u103E\u102F\u1036\u1038\u104B'
                  }
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  20 min time limit
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  30s per question
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  No feedback until end
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Cannot quit
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-base font-bold text-foreground">Learn at Your Pace</p>
              <p className="text-sm text-muted-foreground">
                Get feedback after each question. Great for learning!
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1010\u1005\u103A\u1001\u102F\u1015\u103C\u102E\u1038\u1010\u102D\u102F\u1004\u103A\u1038 \u1021\u1000\u103C\u1036\u1015\u103C\u102F\u1001\u103B\u1000\u103A\u101B\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B \u101E\u1004\u103A\u101A\u1030\u101B\u1014\u103A \u1021\u1000\u1031\u102C\u1004\u103A\u1038\u1006\u102F\u1036\u1038\u104B'
                  }
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  No time limit
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Explanations shown
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Quit anytime
                </span>
              </div>
            </div>
          )}

          {/* Question count selector (Practice mode only) */}
          {selectedMode === 'practice' && onCountChange && (
            <div className="w-full border-t border-border/40 pt-4">
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

          {/* Speech speed selector (Practice mode only, TTS supported) */}
          {selectedMode === 'practice' && ttsSupported && (
            <div className="w-full border-t border-border/40 pt-4">
              <div className="flex items-center justify-center gap-2 mb-3">
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
                      <span className="block font-myanmar text-xs mt-0.5 font-normal">
                        {option.my}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Per-question timer toggle (Practice mode only) */}
          {selectedMode === 'practice' && (
            <div className="w-full border-t border-border/40 pt-4">
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <Timer className="h-5 w-5 text-muted-foreground" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {strings.quiz.perQuestionTimer.en}
                    </p>
                    {showBurmese && (
                      <p className="font-myanmar text-xs text-muted-foreground">
                        {strings.quiz.perQuestionTimer.my}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {strings.quiz.thirtySecondsPerQuestion.en}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={timerEnabled}
                  aria-label="Toggle per-question timer"
                  onClick={() => setTimerEnabled(prev => !prev)}
                  className="relative inline-flex min-h-[48px] min-w-[48px] shrink-0 cursor-pointer items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span
                    className={clsx(
                      'inline-flex h-7 w-12 items-center rounded-full border-2 border-transparent transition-colors duration-200',
                      timerEnabled ? 'bg-primary' : 'bg-muted'
                    )}
                  >
                    <span
                      className={clsx(
                        'pointer-events-none inline-block h-6 w-6 rounded-full bg-surface shadow-md ring-0 transition-transform duration-200',
                        timerEnabled ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Start button */}
          <BilingualButton
            label={strings.actions.iAmReady}
            variant="chunky"
            size="lg"
            onClick={() =>
              onReady({
                speedOverride: selectedMode === 'practice' ? sessionSpeed : 'normal',
                autoReadOverride: globalTTS.autoRead,
                timerEnabled: selectedMode === 'real-exam' ? true : timerEnabled,
                mode: selectedMode,
              })
            }
          />
        </div>
      </Card>

      {/* Test info summary */}
      <div className="mb-6 flex justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">
            {selectedMode === 'real-exam' ? 20 : questionCount}
          </span>
          <span>
            {showBurmese
              ? 'Questions / \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038'
              : 'Questions'}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold text-foreground">
            {selectedMode === 'real-exam' ? durationMinutes : '\u221E'}
          </span>
          <span>{showBurmese ? 'Minutes / \u1019\u102D\u1014\u1005\u103A' : 'Minutes'}</span>
        </div>
      </div>

      {/* Pass threshold info (Real Exam only) */}
      {selectedMode === 'real-exam' && (
        <p className="text-center text-sm text-muted-foreground mb-6">
          {strings.test.passThreshold.en}
          {showBurmese && (
            <span className="block font-myanmar">{strings.test.passThreshold.my}</span>
          )}
        </p>
      )}

      {/* Practice by Category section */}
      <div className="w-full max-w-md mx-auto">
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
