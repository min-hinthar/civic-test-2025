'use client';

/**
 * BadgeHighlights - Horizontal scrollable row of top earned badges.
 *
 * Shows up to 5 earned badges with icons, or locked placeholders if
 * no badges have been earned yet. Tapping navigates to /social#badges.
 *
 * Uses getEarnedBadges from badgeStore and matches against BADGE_DEFINITIONS.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Target, Star, BookCheck, Award, Lock } from 'lucide-react';
import clsx from 'clsx';

import { useLanguage } from '@/contexts/LanguageContext';
import { getEarnedBadges } from '@/lib/social/badgeStore';
import type { EarnedBadge } from '@/lib/social/badgeStore';
import { BADGE_DEFINITIONS } from '@/lib/social/badgeDefinitions';
import type { BadgeDefinition } from '@/lib/social/badgeDefinitions';

// ---------------------------------------------------------------------------
// Icon mapping (lucide-react icon name -> component)
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Target,
  Star,
  BookCheck,
  Award,
};

function getBadgeIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Award;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BadgeHighlightsProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BadgeHighlights({ className }: BadgeHighlightsProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const [earnedRecords, setEarnedRecords] = useState<EarnedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load earned badges from IndexedDB
  useEffect(() => {
    let cancelled = false;

    getEarnedBadges()
      .then(records => {
        if (!cancelled) {
          setEarnedRecords(records);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Match earned records to badge definitions (top 5)
  const displayBadges: Array<{ badge: BadgeDefinition; earned: boolean }> = useMemo(() => {
    const earnedIds = new Set(earnedRecords.map(r => r.badgeId));

    // Get earned badges, sorted by earn date (newest first)
    const earned = BADGE_DEFINITIONS.filter(b => earnedIds.has(b.id))
      .slice(0, 5)
      .map(badge => ({ badge, earned: true }));

    if (earned.length > 0) {
      return earned;
    }

    // Show 3 locked placeholders if no badges earned
    return BADGE_DEFINITIONS.slice(0, 3).map(badge => ({
      badge,
      earned: false,
    }));
  }, [earnedRecords]);

  const goToBadges = useCallback(() => {
    navigate({ pathname: '/social', hash: '#badges' });
  }, [navigate]);

  // Loading state - minimal skeleton
  if (isLoading) {
    return (
      <div className={clsx('flex gap-2 overflow-x-auto py-1', className)}>
        {[0, 1, 2].map(i => (
          <div key={i} className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-muted/40" />
        ))}
      </div>
    );
  }

  const hasEarnedBadges = earnedRecords.length > 0;

  return (
    <div className={clsx('space-y-1', className)}>
      {/* Badge row */}
      <div
        className="flex items-center gap-2 overflow-x-auto py-1 cursor-pointer"
        onClick={goToBadges}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToBadges();
          }
        }}
      >
        {displayBadges.map(({ badge, earned }) => {
          const IconComponent = getBadgeIcon(badge.icon);

          return (
            <div
              key={badge.id}
              className={clsx(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                earned
                  ? 'border-amber-400 bg-warning-subtle shadow-sm'
                  : 'border-border/60 bg-muted/30'
              )}
              title={showBurmese ? badge.name.my : badge.name.en}
              aria-label={showBurmese ? badge.name.my : badge.name.en}
            >
              {earned ? (
                <IconComponent className="h-5 w-5 text-warning" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          );
        })}

        {/* Message next to badges */}
        <div className="shrink-0 pl-1">
          <p
            className={`text-xs text-muted-foreground whitespace-nowrap ${showBurmese ? 'font-myanmar' : ''}`}
          >
            {hasEarnedBadges
              ? showBurmese
                ? `${earnedRecords.length} ဘက်ခ် ရရှိပြီး`
                : `${earnedRecords.length} badge${earnedRecords.length !== 1 ? 's' : ''} earned`
              : showBurmese
                ? 'ဆက်လေ့လာပါ!'
                : 'Keep studying!'}
          </p>
        </div>
      </div>
    </div>
  );
}
