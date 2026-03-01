'use client';

/**
 * TestDateCountdownCard
 *
 * Two-state card for the Dashboard:
 * 1. No date set: "Set Your Test Date" prompt with native date input
 * 2. Date set: Countdown with urgency gradient, days remaining, readiness, pace indicator
 *
 * Uses native <input type="date"> for zero dependency date picking.
 * Urgency gradient: green (>21 days), amber (8-21 days), red (<=7 days).
 */

import { useRef } from 'react';
import { motion } from 'motion/react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import CountUp from 'react-countup';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_GENTLE } from '@/lib/motion-config';
import type { PaceStatus } from '@/lib/studyPlan';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TestDateCountdownCardProps {
  testDate: string | null;
  daysRemaining: number | null;
  paceStatus: PaceStatus | null;
  readinessScore: number;
  onSetDate: (date: string | null) => void;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Urgency gradient config
// ---------------------------------------------------------------------------

interface UrgencyGradient {
  light: string;
  dark: string;
}

function getUrgencyGradient(daysRemaining: number): UrgencyGradient {
  if (daysRemaining <= 7) {
    return {
      light: 'from-red-500/5 to-red-500/10',
      dark: 'dark:from-red-500/15 dark:to-red-500/20',
    };
  }
  if (daysRemaining <= 21) {
    return {
      light: 'from-amber-500/5 to-amber-500/10',
      dark: 'dark:from-amber-500/15 dark:to-amber-500/20',
    };
  }
  return {
    light: 'from-green-500/5 to-green-500/10',
    dark: 'dark:from-green-500/15 dark:to-green-500/20',
  };
}

// ---------------------------------------------------------------------------
// Pace badge config
// ---------------------------------------------------------------------------

const PACE_CONFIG: Record<
  PaceStatus,
  { en: string; my: string; color: string; Icon: typeof TrendingUp }
> = {
  ahead: {
    en: 'Ahead',
    my: '\u101B\u103E\u1031\u1037\u1014\u1031\u101E\u100A\u103A',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Icon: TrendingUp,
  },
  'on-track': {
    en: 'On Track',
    my: '\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u103E\u102E',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    Icon: Minus,
  },
  behind: {
    en: 'Behind',
    my: '\u1014\u1031\u102C\u1000\u103A\u1000\u103B\u1014\u1031\u101E\u100A\u103A',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Icon: TrendingDown,
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TestDateCountdownCard({
  testDate,
  daysRemaining,
  paceStatus,
  readinessScore,
  onSetDate,
  showBurmese,
}: TestDateCountdownCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetDate(e.target.value || null);
  };

  const Wrapper = shouldReduceMotion ? 'div' : motion.div;
  const animProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: SPRING_GENTLE,
      };

  // -------------------------------------------------------------------------
  // State 1: No date set
  // -------------------------------------------------------------------------
  if (!testDate) {
    return (
      <Wrapper {...animProps}>
        <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-blue-500/5 to-slate-500/5 dark:from-blue-500/10 dark:to-slate-500/10 p-5 shadow-lg shadow-primary/5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground">Set Your Test Date</h3>
              {showBurmese && (
                <p className="font-myanmar text-base text-muted-foreground">
                  {
                    '\u101E\u1004\u103A\u1037\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u101B\u1000\u103A\u1000\u102D\u102F \u101E\u1010\u103A\u1019\u103E\u1010\u103A\u1015\u102B'
                  }
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Know when your USCIS interview is? Set it here for a personalized study plan.
              </p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground mt-0.5">
                  {
                    '\u101E\u1004\u103A\u1037 USCIS \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038 \u1018\u101A\u103A\u1010\u102F\u1014\u103A\u1038\u101C\u1032\u1006\u102D\u102F\u1010\u101A\u103A\u1006\u102D\u102F\u101B\u1004\u103A \u101E\u1004\u103A\u1037\u1021\u1010\u103D\u1000\u103A \u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A \u1021\u1005\u102E\u1021\u1005\u1025\u103A \u101B\u1031\u1038\u1006\u103D\u1032\u1015\u102B\u104B'
                  }
                </p>
              )}
              <div className="mt-3">
                <input
                  type="date"
                  value=""
                  onChange={handleDateChange}
                  min={today}
                  className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary min-h-[48px] cursor-pointer hover:bg-muted/40 transition-colors"
                  aria-label="Set your USCIS test date"
                />
              </div>
            </div>
          </div>
        </div>
      </Wrapper>
    );
  }

  // -------------------------------------------------------------------------
  // State 2: Date set (countdown active)
  // -------------------------------------------------------------------------
  const effectiveDays = daysRemaining ?? 0;
  const gradient = getUrgencyGradient(effectiveDays);

  return (
    <Wrapper {...animProps}>
      <button
        type="button"
        onClick={() => dateInputRef.current?.showPicker?.()}
        className="w-full text-left rounded-2xl border border-border/60 bg-gradient-to-br p-5 shadow-lg shadow-primary/5 cursor-pointer hover:shadow-md transition-shadow"
        style={{ backgroundImage: 'none' }}
        aria-label="Change your test date"
      >
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient.light} ${gradient.dark} pointer-events-none`}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {/* Days remaining */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-foreground tabular-nums">
                  {shouldReduceMotion ? (
                    effectiveDays
                  ) : (
                    <CountUp end={effectiveDays} duration={1} preserveValue />
                  )}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">days until your test</p>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-muted-foreground">
                      {
                        '\u101B\u1000\u103A \u101E\u1004\u103A\u1037\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1021\u1010\u103D\u1000\u103A'
                      }
                    </p>
                  )}
                </div>
              </div>

              {/* Readiness inline */}
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{readinessScore}%</span> ready
                {showBurmese && (
                  <span className="font-myanmar ml-1">
                    {'/ \u1021\u1006\u1004\u103A\u101E\u1004\u103A\u1037'}
                  </span>
                )}
              </p>
            </div>

            {/* Pace indicator badge */}
            {paceStatus &&
              (() => {
                const PaceIcon = PACE_CONFIG[paceStatus].Icon;
                const paceConfig = PACE_CONFIG[paceStatus];
                return (
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${paceConfig.color}`}
                  >
                    <PaceIcon className="h-3.5 w-3.5" />
                    <span>{paceConfig.en}</span>
                    {showBurmese && <span className="font-myanmar ml-0.5">{paceConfig.my}</span>}
                  </div>
                );
              })()}
          </div>

          {/* Hidden date input for changing the date */}
          <input
            ref={dateInputRef}
            type="date"
            value={testDate}
            onChange={handleDateChange}
            min={today}
            className="absolute opacity-0 h-0 w-0 pointer-events-none"
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>
      </button>
    </Wrapper>
  );
}
