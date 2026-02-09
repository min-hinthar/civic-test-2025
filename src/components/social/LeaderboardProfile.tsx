'use client';

/**
 * LeaderboardProfile - Mini profile dialog for a leaderboard entry.
 *
 * Shows a read-only profile with:
 * - Display name, rank, composite score
 * - Current streak with fire icon
 * - Top badge (if any) with icon and name
 * - Earned badges loaded from Supabase (for opted-in users)
 *
 * Uses Radix Dialog for accessibility.
 * All text is bilingual (EN + MY).
 */

import { useState, useEffect, useMemo } from 'react';
import { Flame, Target, Star, BookCheck, Award, Trophy, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabaseClient';
import type { LeaderboardEntry } from '@/hooks/useLeaderboard';
import { BADGE_DEFINITIONS } from '@/lib/social/badgeDefinitions';

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
// Types
// ---------------------------------------------------------------------------

interface EarnedBadgeRow {
  badge_id: string;
  earned_at: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface LeaderboardProfileProps {
  entry: LeaderboardEntry | null;
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeaderboardProfile({ entry, open, onClose }: LeaderboardProfileProps) {
  const { showBurmese } = useLanguage();
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);

  // Load earned badges for the selected user
  useEffect(() => {
    if (!entry || !open) {
      setEarnedBadgeIds([]);
      return;
    }

    let cancelled = false;
    setBadgesLoading(true);

    // Capture for closure (TypeScript narrowing)
    const userId = entry.userId;

    async function loadBadges() {
      try {
        const { data, error } = await supabase
          .from('earned_badges')
          .select('badge_id, earned_at')
          .eq('user_id', userId);

        if (cancelled) return;

        if (error) {
          console.warn('[LeaderboardProfile] Failed to load badges:', error.message);
          setEarnedBadgeIds([]);
        } else {
          const rows = (data ?? []) as EarnedBadgeRow[];
          setEarnedBadgeIds(rows.map(r => r.badge_id));
        }
      } catch {
        // Network error or Supabase unavailable
      } finally {
        if (!cancelled) {
          setBadgesLoading(false);
        }
      }
    }

    loadBadges();

    return () => {
      cancelled = true;
    };
  }, [entry, open]);

  // Match earned badge IDs to badge definitions
  const earnedBadges = useMemo(() => {
    if (earnedBadgeIds.length === 0) return [];
    const idSet = new Set(earnedBadgeIds);
    return BADGE_DEFINITIONS.filter(b => idSet.has(b.id));
  }, [earnedBadgeIds]);

  if (!entry) return null;

  const TopBadgeIcon = entry.topBadge ? (ICON_MAP[entry.topBadge] ?? null) : null;
  const topBadgeDef = entry.topBadge
    ? (BADGE_DEFINITIONS.find(b => b.icon === entry.topBadge) ?? null)
    : null;

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent>
        <div className="flex flex-col items-center text-center">
          {/* Rank badge */}
          <div
            className={clsx(
              'flex items-center justify-center',
              'h-16 w-16 rounded-full',
              'bg-primary-100 dark:bg-primary-900/30',
              'ring-4 ring-primary/20'
            )}
          >
            <Trophy className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>

          {/* Display name */}
          <DialogTitle className="mt-4 text-xl">{entry.displayName}</DialogTitle>
          <DialogDescription className="sr-only">Profile for {entry.displayName}</DialogDescription>

          {/* Rank */}
          <p className="mt-1 text-sm font-semibold text-primary">
            Rank #{entry.rank}
            {showBurmese && (
              <span className="font-myanmar ml-1 text-muted-foreground">
                / {'အဆင့်'} #{entry.rank}
              </span>
            )}
          </p>

          {/* Stats grid */}
          <div className="mt-5 grid grid-cols-2 gap-4 w-full max-w-xs">
            {/* Composite score */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p
                className={`text-xs text-muted-foreground uppercase tracking-wider ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? 'ရမှတ်' : 'Score'}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums mt-1">
                {entry.compositeScore.toLocaleString()}
              </p>
            </div>

            {/* Current streak */}
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
              <p
                className={`text-xs text-muted-foreground uppercase tracking-wider ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? 'ဆက်တိုက်' : 'Streak'}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="h-5 w-5 text-warning-500" />
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {entry.currentStreak}
                </span>
              </div>
            </div>
          </div>

          {/* Top badge */}
          {TopBadgeIcon && topBadgeDef && (
            <div className="mt-4 flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/20 px-4 py-2">
              <TopBadgeIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span
                className={`text-sm font-medium text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? topBadgeDef.name.my : topBadgeDef.name.en}
              </span>
            </div>
          )}

          {/* Earned badges row */}
          {earnedBadges.length > 0 && (
            <div className="mt-4 w-full">
              <p
                className={`text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? 'ရရှိထားသော တံဆိပ်များ' : 'Earned Badges'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {earnedBadges.map(badge => {
                  const IconComp = ICON_MAP[badge.icon] ?? Award;
                  return (
                    <div
                      key={badge.id}
                      className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30"
                      title={badge.name.en}
                    >
                      <IconComp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Badges loading indicator */}
          {badgesLoading && (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              <span
                className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? 'တင်နေပါသည်...' : 'Loading badges...'}
              </span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className={clsx(
              'mt-6 px-6 py-2.5 rounded-full w-full max-w-xs',
              'text-sm font-semibold',
              'bg-primary-500 text-white',
              'hover:bg-primary-600 active:bg-primary-700',
              'transition-colors min-h-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
            )}
          >
            Close
            {showBurmese && <span className="font-myanmar ml-2 text-white/80">{'ပိတ်ပါ'}</span>}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
