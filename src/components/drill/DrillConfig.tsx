'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { Clock, Zap } from 'lucide-react';
import { DrillBadge } from './DrillBadge';
import type { CategoryName } from '@/lib/mastery';

/** Configuration passed from DrillConfig to DrillPage */
export interface DrillConfigType {
  count: number;
  mode: 'weak-all' | 'category';
  category?: string;
}

interface DrillConfigProps {
  /** Called when user starts the drill */
  onStart: (config: DrillConfigType) => void;
  /** Drill mode */
  mode: 'weak-all' | 'category';
  /** Category name (required for category mode) */
  categoryName?: CategoryName;
  /** Category key (required for category mode) */
  categoryKey?: string;
  /** Show Burmese translations */
  showBurmese: boolean;
}

const QUESTION_COUNTS = [5, 10, 20] as const;

/**
 * Pre-drill configuration screen.
 *
 * Shows focus area explanation, question count selector (5/10/20),
 * estimated time, and Start Drill button. All text localized for Burmese.
 */
export function DrillConfig({
  onStart,
  mode,
  categoryName,
  categoryKey,
  showBurmese,
}: DrillConfigProps) {
  const [count, setCount] = useState<number>(10);

  const handleStart = () => {
    onStart({
      count,
      mode,
      category: mode === 'category' ? categoryKey : undefined,
    });
  };

  // Estimated time range: 30-60 seconds per question
  const minSeconds = count * 30;
  const maxSeconds = count * 60;
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <DrillBadge showBurmese={showBurmese} />
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'weak-all' ? (
              <>
                Drill Weak Areas
                {showBurmese && (
                  <span className="mt-1 block font-myanmar text-lg text-muted-foreground">
                    {
                      '\u1021\u102C\u1038\u1014\u100A\u103A\u1038\u1015\u102D\u102F\u1004\u103A\u1038\u1019\u103B\u102C\u1038 \u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1015\u102B'
                    }
                  </span>
                )}
              </>
            ) : (
              <>
                {categoryName?.en ?? 'Category Drill'}
                {showBurmese && categoryName?.my && (
                  <span className="mt-1 block font-myanmar text-lg text-muted-foreground">
                    {categoryName.my}
                  </span>
                )}
              </>
            )}
          </h1>
        </div>

        {/* Focus area explanation */}
        <div className="mt-5 rounded-xl bg-muted/50 p-4">
          <div className="flex items-start gap-2">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <div>
              <p className="text-sm text-foreground">
                {mode === 'weak-all'
                  ? 'Your weakest questions across all categories'
                  : `Questions from ${categoryName?.en ?? 'this category'} you need to practice`}
              </p>
              {showBurmese && (
                <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                  {mode === 'weak-all'
                    ? '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1019\u103B\u102C\u1038\u1021\u102C\u1038\u101C\u102F\u1036\u1038\u1019\u103E \u101E\u1004\u103A\u1037\u1021\u102C\u1038\u1021\u1014\u100A\u103A\u1038\u1006\u102F\u1036\u1038 \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038'
                    : `${categoryName?.my ?? '\u1024\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038'} \u1019\u103E \u101E\u1004\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u101B\u1014\u103A \u101C\u102D\u102F\u1021\u1015\u103A\u101E\u100A\u103A\u1037 \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Question count selector */}
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Questions
            {showBurmese && (
              <span className="ml-1 font-myanmar">
                {
                  '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1021\u101B\u1031\u1021\u1010\u103D\u1000\u103A'
                }
              </span>
            )}
          </p>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={clsx(
                  'flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors',
                  count === n
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Estimated time */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {formatTime(minSeconds)} - {formatTime(maxSeconds)}
          </span>
        </div>

        {/* Start button */}
        <button
          type="button"
          onClick={handleStart}
          className={clsx(
            'mt-6 w-full rounded-xl px-6 py-3.5 text-base font-bold',
            'bg-orange-500 text-white shadow-md',
            'hover:bg-orange-600 active:bg-orange-700',
            'transition-colors'
          )}
        >
          Start Drill
          {showBurmese && (
            <span className="ml-2 font-myanmar text-sm font-normal">
              {
                '\u101C\u1031\u1037\u1000\u103B\u1004\u103A\u1037\u1001\u1014\u103A\u1038 \u1005\u1010\u1004\u103A\u1015\u102B'
              }
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
