'use client';

/**
 * BadgeHighlights - Dashboard badge showcase matching Hub achievements style.
 *
 * Shows ALL 7 badges in a responsive grid using the same card layout as
 * BadgeGrid (icon circle, name, description/requirement). Wrapped in a
 * GlassCard with header, count pill, and footer link.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Flame, Target, Star, BookCheck, Award, Lock, Trophy } from 'lucide-react';
import clsx from 'clsx';

import { GlassCard } from '@/components/hub/GlassCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getEarnedBadges } from '@/lib/social/badgeStore';
import type { EarnedBadge } from '@/lib/social/badgeStore';
import { BADGE_DEFINITIONS } from '@/lib/social/badgeDefinitions';
import { getBadgeColors } from '@/lib/social/badgeColors';

// ---------------------------------------------------------------------------
// Icon mapping
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
  const shouldReduceMotion = useReducedMotion();
  const [earnedRecords, setEarnedRecords] = useState<EarnedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const earnedIds = useMemo(() => new Set(earnedRecords.map(r => r.badgeId)), [earnedRecords]);

  const goToBadges = useCallback(() => {
    navigate('/hub/achievements');
  }, [navigate]);

  const goToBadge = useCallback(
    (badgeId: string) => {
      navigate('/hub/achievements', { state: { focusBadge: badgeId } });
    },
    [navigate]
  );

  const hasEarnedBadges = earnedRecords.length > 0;

  // Loading skeleton
  if (isLoading) {
    return (
      <GlassCard className={clsx('rounded-2xl p-5', className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 animate-pulse rounded bg-text-secondary/20" />
          <div className="h-4 w-28 animate-pulse rounded bg-text-secondary/20" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-text-secondary/10" />
              <div className="h-3 w-16 animate-pulse rounded bg-text-secondary/10" />
              <div className="h-2 w-20 animate-pulse rounded bg-text-secondary/10" />
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={clsx('rounded-2xl p-0', className)}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-warning" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Achievements</h3>
            {showBurmese && (
              <span className="font-myanmar text-sm leading-tight text-muted-foreground">
                အောင်မြင်မှုများ
              </span>
            )}
          </div>
          <span className="ml-auto rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-warning">
            {earnedRecords.length}/{BADGE_DEFINITIONS.length}
          </span>
        </div>

        {/* Badge card grid — each card navigates to its badge in Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {BADGE_DEFINITIONS.map((badge, index) => {
            const earned = earnedIds.has(badge.id);
            const IconComponent = getBadgeIcon(badge.icon);
            const colors = getBadgeColors(badge.id);

            return (
              <motion.div
                key={badge.id}
                className={clsx(
                  'flex flex-col items-center text-center p-3 rounded-xl cursor-pointer',
                  'border border-border/60 bg-card',
                  earned ? '' : 'opacity-60'
                )}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: earned ? 1 : 0.6, scale: 1 }}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -4 }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 260, damping: 20, delay: index * 0.05 }
                }
                onClick={() => goToBadge(badge.id)}
              >
                {/* Icon circle with hover rotation */}
                <motion.div
                  className={clsx(
                    'relative flex items-center justify-center h-12 w-12 rounded-full mb-2',
                    earned ? `${colors.bgLight} ${colors.bgDark}` : 'bg-muted grayscale'
                  )}
                  whileHover={
                    shouldReduceMotion
                      ? {}
                      : earned
                        ? { rotate: [0, -10, 10, -5, 5, 0] }
                        : { scale: 1.1 }
                  }
                  transition={{ duration: 0.5 }}
                >
                  {earned ? (
                    <IconComponent
                      className={clsx('h-6 w-6 filter saturate-150', colors.icon, colors.glow)}
                    />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  {earned && <div className="badge-gold-shimmer absolute inset-0 rounded-full" />}
                </motion.div>

                {/* Badge name */}
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {badge.name.en}
                </p>
                {showBurmese && (
                  <p className="text-xs font-myanmar text-muted-foreground mt-0.5 leading-tight">
                    {badge.name.my}
                  </p>
                )}

                {/* Description (earned) or Requirement (locked) */}
                {earned ? (
                  <p className="text-caption text-muted-foreground mt-1.5 leading-relaxed">
                    {badge.description.en}
                  </p>
                ) : (
                  <p className="text-caption text-muted-foreground mt-1.5 leading-relaxed italic">
                    {badge.requirement.en}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          type="button"
          className="mt-4 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          onClick={goToBadges}
        >
          {hasEarnedBadges
            ? showBurmese
              ? `တံဆိပ် ${earnedRecords.length} ခု ရရှိပြီး — အားလုံးကြည့်ရန် →`
              : `${earnedRecords.length} badge${earnedRecords.length !== 1 ? 's' : ''} earned — View all →`
            : showBurmese
              ? 'ဆက်လေ့လာပြီး တံဆိပ်များ ရယူပါ →'
              : 'Keep studying to earn badges →'}
        </button>
      </div>
    </GlassCard>
  );
}
