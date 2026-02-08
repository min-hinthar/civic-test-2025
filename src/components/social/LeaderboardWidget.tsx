'use client';

/**
 * LeaderboardWidget - Compact dashboard widget for leaderboard.
 *
 * Follows SRSWidget/InterviewDashboardWidget pattern:
 * - Shows Trophy icon + "Your Rank: #N" or "Not ranked"
 * - Below rank: top 3 entries as mini list
 * - Tapping navigates to /social#leaderboard
 * - Uses useLeaderboard('all-time') with limit of 3
 * - Loading state: skeleton shimmer
 * - Empty state: "Join the leaderboard!" CTA
 * - Bilingual: "Your Rank" / "သင့်အဆင့်"
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, Crown } from 'lucide-react';
import clsx from 'clsx';

import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// ---------------------------------------------------------------------------
// Medal colors for top 3 (matching LeaderboardTable)
// ---------------------------------------------------------------------------

const MEDAL_COLORS: Record<number, string> = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-amber-700',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LeaderboardWidgetProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeaderboardWidget({ className }: LeaderboardWidgetProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { user } = useAuth();
  const { entries, userRank, isLoading } = useLeaderboard('all-time', 3);

  const goToLeaderboard = useCallback(() => {
    navigate({ pathname: '/social', hash: '#leaderboard' });
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

  // Empty state: no leaderboard data
  if (entries.length === 0) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <Trophy className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? '\u1025\u1030\u1038\u1006\u1031\u102C\u1004\u103A\u1018\u102F\u1010\u103A\u1019\u103E\u102C \u1015\u102B\u101D\u1004\u103A\u1015\u102B!'
                  : 'Join the leaderboard!'}
              </p>
              <p className="text-xs text-muted-foreground">
                {showBurmese
                  ? '\u101E\u1004\u1037\u103A\u101B\u1019\u103E\u1010\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1019\u103B\u103E\u101D\u1031\u1015\u103C\u1015\u102B'
                  : 'Compete with fellow learners'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={goToLeaderboard}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 min-h-[44px]"
          >
            <Trophy className="h-3.5 w-3.5" />
            <span>{showBurmese ? '\u1000\u103C\u100A\u1037\u103A\u1015\u102B' : 'View'}</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal state: show rank + top 3
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10 cursor-pointer',
        className
      )}
      onClick={goToLeaderboard}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goToLeaderboard();
        }
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex h-10 w-10 items-center justify-center rounded-xl',
            userRank ? 'bg-primary-100' : 'bg-muted'
          )}>
            <Trophy className={clsx(
              'h-5 w-5',
              userRank ? 'text-primary-600' : 'text-muted-foreground'
            )} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {userRank
                ? showBurmese
                  ? `${'\u101E\u1004\u1037\u103A\u1021\u1006\u1004\u1037\u103A'}: #${userRank}`
                  : `Your Rank: #${userRank}`
                : showBurmese
                  ? '\u1021\u1006\u1004\u1037\u103A\u1019\u101B\u103E\u102D\u101E\u1031\u1038\u1015\u102B'
                  : 'Not ranked'}
            </p>
            <p className="text-xs text-muted-foreground">
              {showBurmese
                ? '\u1025\u1030\u1038\u1006\u1031\u102C\u1004\u103A\u1018\u102F\u1010\u103A'
                : 'Leaderboard'}
            </p>
          </div>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>

      {/* Top 3 mini list */}
      <div className="space-y-1.5 ml-[52px]">
        {entries.map((entry) => {
          const isCurrentUser = user?.id === entry.userId;
          const medalColor = MEDAL_COLORS[entry.rank];

          return (
            <div
              key={entry.userId}
              className={clsx(
                'flex items-center gap-2 text-sm',
                isCurrentUser && 'font-semibold'
              )}
            >
              <span
                className={clsx(
                  'w-5 text-xs font-bold tabular-nums',
                  medalColor ?? 'text-muted-foreground'
                )}
              >
                #{entry.rank}
              </span>
              <span className="flex-1 truncate text-foreground text-xs">
                {entry.displayName}
              </span>
              {entry.isWeeklyWinner && (
                <Crown className="h-3 w-3 text-yellow-500 shrink-0" />
              )}
              <span className="text-xs text-muted-foreground tabular-nums">
                {entry.compositeScore.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
