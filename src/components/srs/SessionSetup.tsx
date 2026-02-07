'use client';

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';

// ---------------------------------------------------------------------------
// Burmese numeral helper (inline to avoid circular dep)
// ---------------------------------------------------------------------------

const BURMESE_DIGITS = [
  '\u1040', '\u1041', '\u1042', '\u1043', '\u1044',
  '\u1045', '\u1046', '\u1047', '\u1048', '\u1049',
];

function toBurmeseNumeral(n: number): string {
  return String(n)
    .split('')
    .map((ch) => BURMESE_DIGITS[Number(ch)] ?? ch)
    .join('');
}

// ---------------------------------------------------------------------------
// Spring physics for pill selection
// ---------------------------------------------------------------------------

const springTransition = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 17,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionSetupProps {
  /** Total number of cards currently due for review */
  totalDue: number;
  /** Callback when user starts a review session */
  onStart: (sessionSize: number, timerEnabled: boolean) => void;
  /** Callback for back navigation */
  onBack: () => void;
  /** Additional class names */
  className?: string;
}

/** Session size option */
interface SizeOption {
  value: number;
  labelEn: string;
  labelMy: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Pre-session configuration screen for SRS review.
 *
 * Features:
 * - Due card count display
 * - Session size picker: 10, 20, or all due cards (bilingual)
 * - Optional timer toggle
 * - Smart pre-selection based on totalDue count
 * - All-caught-up empty state when no cards are due
 * - Consistent with PracticePage config screen pattern (Phase 4)
 */
export function SessionSetup({
  totalDue,
  onStart,
  onBack,
  className,
}: SessionSetupProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  // Build size options dynamically based on totalDue
  const sizeOptions: SizeOption[] = useMemo(() => {
    const options: SizeOption[] = [];

    if (totalDue > 10) {
      options.push({
        value: 10,
        labelEn: '10 Cards',
        labelMy: `\u1000\u1010\u103A ${toBurmeseNumeral(10)}`,
      });
    }

    if (totalDue > 20) {
      options.push({
        value: 20,
        labelEn: '20 Cards',
        labelMy: `\u1000\u1010\u103A ${toBurmeseNumeral(20)}`,
      });
    }

    if (totalDue > 0) {
      options.push({
        value: totalDue,
        labelEn: `All (${totalDue}) Cards`,
        labelMy: `\u1021\u102C\u1038\u101C\u102F\u1036\u1038 (${toBurmeseNumeral(totalDue)}) \u1000\u1010\u103A`,
      });
    }

    return options;
  }, [totalDue]);

  // Smart pre-selection: if <=10, select All; if <=20, select 10; else select 10
  const defaultSize = useMemo(() => {
    if (totalDue <= 10) return totalDue;
    return 10;
  }, [totalDue]);

  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [timerEnabled, setTimerEnabled] = useState(false);

  // All-caught-up state
  if (totalDue === 0) {
    return (
      <div className={clsx('flex flex-col items-center', className)}>
        {/* Back button */}
        <div className="w-full mb-6">
          <button
            type="button"
            onClick={onBack}
            className={clsx(
              'flex items-center gap-1.5 text-sm text-muted-foreground',
              'hover:text-foreground transition-colors duration-150',
              'min-h-[44px] px-2',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
            {showBurmese && (
              <span className="font-myanmar ml-1">/  {'\u1014\u1031\u102C\u1000\u103A\u101E\u102D\u102F\u1037'}</span>
            )}
          </button>
        </div>

        <Card className="w-full max-w-md text-center py-10">
          <Sparkles className="h-12 w-12 text-success-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">
            All caught up!
          </h2>
          {showBurmese && (
            <p className="font-myanmar text-base text-muted-foreground mt-1">
              {'\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u103A\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E\u104B'}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-3">
            Come back later for more reviews.
          </p>
          {showBurmese && (
            <p className="font-myanmar text-sm text-muted-foreground mt-0.5">
              {'\u1014\u1031\u102C\u1000\u103A\u1019\u103E\u1015\u103C\u1014\u103A\u101C\u102C\u1015\u102B\u104B'}
            </p>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col', className)}>
      {/* Back button */}
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className={clsx(
            'flex items-center gap-1.5 text-sm text-muted-foreground',
            'hover:text-foreground transition-colors duration-150',
            'min-h-[44px] px-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
          {showBurmese && (
            <span className="font-myanmar ml-1">/ {'\u1014\u1031\u102C\u1000\u103A\u101E\u102D\u102F\u1037'}</span>
          )}
        </button>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <StaggeredList>
          {/* Header */}
          <StaggeredItem>
            <h2 className="text-xl font-bold text-foreground">
              Review Session
            </h2>
            {showBurmese && (
              <p className="font-myanmar text-base text-muted-foreground mt-0.5">
                {'\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u103A\u1037\u1005\u1005\u103A\u1006\u1031\u1038\u1001\u103C\u1004\u103A\u1038'}
              </p>
            )}
          </StaggeredItem>

          {/* Due count */}
          <StaggeredItem className="mt-6">
            <div className="text-center py-4 bg-primary/5 rounded-2xl">
              <p className="text-4xl font-bold text-primary">
                {totalDue}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                cards due for review
              </p>
              {showBurmese && (
                <p className="font-myanmar text-sm text-muted-foreground">
                  {'\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u103A\u101B\u1019\u100A\u103A\u1037 \u1000\u1010\u103A\u1019\u103B\u102C\u1038'}
                </p>
              )}
            </div>
          </StaggeredItem>

          {/* Session size picker */}
          <StaggeredItem className="mt-6">
            <p className="text-sm font-medium text-foreground mb-3">
              Session size
              {showBurmese && (
                <span className="font-myanmar text-muted-foreground ml-2">
                  / {'\u1021\u1000\u103C\u102D\u1019\u103A\u1021\u101B\u1031\u1021\u1010\u103D\u1000\u103A'}
                </span>
              )}
            </p>
            <div className="flex gap-2">
              {sizeOptions.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedSize(option.value)}
                  variants={{
                    idle: { scale: 1 },
                    tap: shouldReduceMotion ? {} : { scale: 0.95 },
                  }}
                  initial="idle"
                  whileTap="tap"
                  transition={springTransition}
                  className={clsx(
                    'flex-1 py-2.5 px-3 rounded-full text-center',
                    'min-h-[44px]',
                    'border font-semibold text-sm',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    selectedSize === option.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                      : 'bg-card text-foreground border-border hover:bg-muted/50'
                  )}
                >
                  <span className="block">{option.labelEn}</span>
                  {showBurmese && (
                    <span className="font-myanmar text-xs block opacity-80 mt-0.5">
                      {option.labelMy}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </StaggeredItem>

          {/* Timer toggle */}
          <StaggeredItem className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Enable Timer
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-xs text-muted-foreground">
                      {'\u1021\u1001\u103B\u102D\u1014\u103A\u1010\u102D\u102F\u1004\u103A\u1038\u1000\u102D\u101B\u102D\u101A\u102C \u1016\u103D\u1004\u103A\u1037\u1015\u102B'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Practice with time pressure
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-xs text-muted-foreground">
                      {'\u1021\u1001\u103B\u102D\u1014\u103A\u1016\u102D\u1021\u102C\u1038\u1016\u103C\u1004\u103A\u1037 \u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B'}
                    </p>
                  )}
                </div>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                role="switch"
                aria-checked={timerEnabled}
                onClick={() => setTimerEnabled((prev) => !prev)}
                className={clsx(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full',
                  'border-2 border-transparent cursor-pointer',
                  'transition-colors duration-200 ease-in-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  timerEnabled ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={clsx(
                    'pointer-events-none inline-block h-5 w-5 rounded-full',
                    'bg-white shadow-lg ring-0',
                    'transform transition duration-200 ease-in-out',
                    timerEnabled ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </StaggeredItem>

          {/* Start button */}
          <StaggeredItem className="mt-8">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onStart(selectedSize, timerEnabled)}
            >
              <span className="flex flex-col items-center">
                <span>Start Review</span>
                {showBurmese && (
                  <span className="font-myanmar text-sm opacity-80">
                    {'\u1015\u103C\u1014\u103A\u101C\u103E\u100A\u103A\u1001\u103C\u1004\u103A\u1038\u1005\u1010\u1004\u103A\u1015\u102B'}
                  </span>
                )}
              </span>
            </Button>
          </StaggeredItem>
        </StaggeredList>
      </Card>
    </div>
  );
}
