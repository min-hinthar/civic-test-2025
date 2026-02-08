'use client';

/**
 * StreakWidget - Dashboard widget showing current study streak.
 *
 * Compact dashboard card following SRSWidget/InterviewDashboardWidget pattern.
 * Shows flame icon + current streak count + bilingual "day streak" text,
 * dual display (current vs best), and freeze indicator.
 *
 * Tapping navigates to the social hub /social#streak.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Snowflake } from 'lucide-react';
import clsx from 'clsx';

import { useStreak } from '@/hooks/useStreak';
import { useLanguage } from '@/contexts/LanguageContext';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StreakWidgetProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StreakWidget({ className }: StreakWidgetProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { currentStreak, longestStreak, freezesAvailable, isLoading } = useStreak();

  const goToSocial = useCallback(() => {
    navigate({ pathname: '/social', hash: '#streak' });
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            {showBurmese
              ? '\u1010\u1004\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A...'
              : 'Loading...'}
          </span>
        </div>
      </div>
    );
  }

  // Empty state: no streak yet
  if (currentStreak === 0) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Flame className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? '\u101C\u1031\u1037\u101C\u102C\u1005\u1010\u1004\u103A\u1015\u103C\u102E\u1038 streak \u1010\u100A\u103A\u1006\u1031\u102C\u1000\u103A\u1015\u102B!'
                  : 'Start studying to build your streak!'}
              </p>
              <p className="text-xs text-muted-foreground">
                {showBurmese
                  ? '\u1014\u1031\u1037\u1005\u1025\u103A \u101C\u1031\u1037\u101C\u102C\u101B\u1004\u103A \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A \u1010\u102D\u102F\u1038\u101C\u102C\u1015\u102B\u101C\u102D\u1019\u103A\u1037\u1019\u101A\u103A'
                  : 'Study daily to grow your streak'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active streak state
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10 cursor-pointer',
        className
      )}
      onClick={goToSocial}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToSocial();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Fire icon container */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>

          <div>
            {/* Main streak display */}
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? `${currentStreak} \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A`
                  : `${currentStreak} day streak`}
              </p>
            </div>

            {/* Dual display: current vs best */}
            <p className="text-xs text-muted-foreground">
              {showBurmese
                ? `\u101C\u1000\u103A\u101B\u103E\u102D: ${currentStreak} \u101B\u1000\u103A | \u1021\u1000\u1031\u102C\u1004\u103A\u1038\u1006\u102F\u1036\u1038: ${longestStreak} \u101B\u1000\u103A`
                : `Current: ${currentStreak} days | Best: ${longestStreak} days`}
            </p>
          </div>
        </div>

        {/* Right side: freeze indicator */}
        <div className="flex items-center gap-2">
          {freezesAvailable > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Snowflake className="h-3.5 w-3.5" />
              <span className="font-semibold">{freezesAvailable}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
