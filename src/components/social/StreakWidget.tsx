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
            {showBurmese ? 'တင်နေပါသည်...' : 'Loading...'}
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
                  ? 'လေ့လာစတင်ပြီး streak တည်ဆောက်ပါ!'
                  : 'Start studying to build your streak!'}
              </p>
              <p className="text-xs text-muted-foreground">
                {showBurmese
                  ? 'နေ့စဥ် လေ့လာရင် ရက်ဆက်တိုက် တိုးလာပါလိမ့်မယ်'
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
                {showBurmese ? `${currentStreak} ရက်ဆက်တိုက်` : `${currentStreak} day streak`}
              </p>
            </div>

            {/* Dual display: current vs best */}
            <p className="text-xs text-muted-foreground">
              {showBurmese
                ? `လက်ရှိ: ${currentStreak} ရက် | အကောင်းဆုံး: ${longestStreak} ရက်`
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
