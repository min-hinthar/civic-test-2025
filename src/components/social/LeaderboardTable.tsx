'use client';

/**
 * LeaderboardTable - Ranked table showing top 25 leaderboard entries.
 *
 * Features:
 * - Medal colors for top 3 (gold, silver, bronze)
 * - Crown icon for weekly winner
 * - User's own row highlighted with primary background
 * - If user rank > 25, shows divider + user row at bottom
 * - Skeleton loading state
 * - Bilingual column headers
 * - StaggeredList for entrance animation
 * - Rows are clickable for profile view
 */

import { useMemo } from 'react';
import clsx from 'clsx';
import {
  Crown,
  Flame,
  Target,
  Star,
  BookCheck,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { useLanguage } from '@/contexts/LanguageContext';
import type { LeaderboardEntry } from '@/hooks/useLeaderboard';

// ---------------------------------------------------------------------------
// Badge icon map (shared with BadgeCelebration/BadgeGrid)
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Target,
  Star,
  BookCheck,
  Award,
};

// ---------------------------------------------------------------------------
// Medal colors for top 3
// ---------------------------------------------------------------------------

const MEDAL_COLORS: Record<number, string> = {
  1: 'text-yellow-500', // Gold
  2: 'text-gray-400',   // Silver
  3: 'text-amber-700',  // Bronze
};

const MEDAL_BG: Record<number, string> = {
  1: 'bg-yellow-50 dark:bg-yellow-900/20',
  2: 'bg-gray-50 dark:bg-gray-900/20',
  3: 'bg-amber-50 dark:bg-amber-900/20',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  userRank: number | null;
  currentUserId: string | null;
  onRowClick: (entry: LeaderboardEntry) => void;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton row
// ---------------------------------------------------------------------------

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="h-5 w-8 rounded bg-muted" />
      <div className="h-5 flex-1 rounded bg-muted" />
      <div className="h-5 w-16 rounded bg-muted" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeaderboardTable({
  entries,
  userRank,
  currentUserId,
  onRowClick,
  isLoading,
}: LeaderboardTableProps) {
  const { showBurmese } = useLanguage();

  // Find user's entry for bottom row if rank > 25
  const userEntry: LeaderboardEntry | null = useMemo(() => {
    if (!currentUserId) return null;
    return entries.find((e) => e.userId === currentUserId) ?? null;
  }, [entries, currentUserId]);

  const showUserAtBottom = userRank !== null && userRank > 25 && !userEntry;

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border/40">
          <span className="w-8 text-xs font-medium text-muted-foreground">
            {showBurmese ? '\u1021\u1006\u1004\u1037\u103A' : 'Rank'}
          </span>
          <span className="flex-1 text-xs font-medium text-muted-foreground">
            {showBurmese ? '\u1021\u1019\u100A\u103A' : 'Name'}
          </span>
          <span className="w-16 text-xs font-medium text-muted-foreground text-right">
            {showBurmese ? '\u101B\u1019\u103E\u1010\u103A' : 'Score'}
          </span>
        </div>
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    );
  }

  // Empty state
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No participants yet. Be the first!
        </p>
        {showBurmese && (
          <p className="font-myanmar text-sm text-muted-foreground mt-1">
            {'\u1015\u102B\u101D\u1004\u103A\u101E\u1030\u1019\u103B\u102C\u1038 \u1019\u101B\u103E\u102D\u101E\u1031\u1038\u1015\u102B\u104B \u1015\u1011\u1019\u1006\u102F\u1036\u1038 \u1016\u103C\u1005\u103A\u1015\u102B!'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 border-b border-border/40">
        <span className="w-8 text-xs font-medium text-muted-foreground">
          {showBurmese ? '\u1021\u1006\u1004\u1037\u103A' : 'Rank'}
        </span>
        <span className="flex-1 text-xs font-medium text-muted-foreground">
          {showBurmese ? '\u1021\u1019\u100A\u103A' : 'Name'}
        </span>
        <span className="w-16 text-xs font-medium text-muted-foreground text-right">
          {showBurmese ? '\u101B\u1019\u103E\u1010\u103A' : 'Score'}
        </span>
      </div>

      {/* Entries */}
      <StaggeredList className="divide-y divide-border/30" stagger={40} delay={60}>
        {entries.map((entry) => {
          const isCurrentUser = currentUserId !== null && entry.userId === currentUserId;

          return (
            <StaggeredItem key={entry.userId}>
              <LeaderboardRow
                entry={entry}
                isCurrentUser={isCurrentUser}
                onClick={() => onRowClick(entry)}
              />
            </StaggeredItem>
          );
        })}
      </StaggeredList>

      {/* User row at bottom (if rank > 25) */}
      {showUserAtBottom && userRank !== null && currentUserId && (
        <>
          {/* Divider */}
          <div className="flex items-center justify-center py-1 bg-muted/20 border-y border-border/30">
            <span className="text-xs text-muted-foreground tracking-widest">...</span>
          </div>

          {/* User's own entry (reconstructed from rank) */}
          <div className="bg-primary/5">
            <div className="flex items-center gap-3 px-4 py-3 cursor-default">
              <span className="w-8 text-sm font-bold text-foreground tabular-nums">
                #{userRank}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground truncate">
                {showBurmese ? '\u101E\u1004\u103A' : 'You'}
              </span>
              <span className="text-sm text-muted-foreground tabular-nums">
                --
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row component
// ---------------------------------------------------------------------------

function LeaderboardRow({
  entry,
  isCurrentUser,
  onClick,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  onClick: () => void;
}) {
  const medalColor = MEDAL_COLORS[entry.rank];
  const medalBg = MEDAL_BG[entry.rank];
  const BadgeIcon = entry.topBadge ? ICON_MAP[entry.topBadge] ?? null : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-muted/20 focus-visible:outline-none focus-visible:bg-muted/30',
        'min-h-[44px]',
        isCurrentUser && 'bg-primary/5',
        medalBg && !isCurrentUser && medalBg
      )}
    >
      {/* Rank */}
      <span
        className={clsx(
          'w-8 text-sm font-bold tabular-nums',
          medalColor ?? 'text-muted-foreground'
        )}
      >
        #{entry.rank}
      </span>

      {/* Name + crown + badge */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5">
        <span className="text-sm font-medium text-foreground truncate">
          {entry.displayName}
        </span>

        {/* Weekly winner crown */}
        {entry.isWeeklyWinner && (
          <Crown className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
        )}

        {/* Top badge icon */}
        {BadgeIcon && (
          <BadgeIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        )}
      </div>

      {/* Score */}
      <span className="w-16 text-sm font-semibold text-foreground text-right tabular-nums">
        {entry.compositeScore.toLocaleString()}
      </span>
    </button>
  );
}
