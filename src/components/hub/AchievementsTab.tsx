'use client';

/**
 * AchievementsTab - Badge gallery and leaderboard for the Progress Hub.
 *
 * Combines:
 * 1. Badge Gallery - Grouped by display categories (Study, Test, Social, Streak)
 *    with earned badge glow/shimmer effects and locked badge greyscale
 * 2. Leaderboard - Top 5 with expand to 25, all-time/weekly toggle
 *
 * Layout:
 * - Desktop (lg:): side-by-side grid (badges 3/5 cols, leaderboard 2/5 cols)
 * - Mobile: stacked vertically (badges on top, leaderboard below)
 *
 * All text is bilingual (EN + MY) via useLanguage().
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  BookOpen,
  Target,
  Users,
  Flame,
  Trophy,
  Lock,
  Heart,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react';
import { Award, Star, BookCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { FadeIn, StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { GlassCard } from '@/components/hub/GlassCard';
import { LeaderboardTable } from '@/components/social/LeaderboardTable';
import { LeaderboardProfile } from '@/components/social/LeaderboardProfile';
import { SocialOptInFlow } from '@/components/social/SocialOptInFlow';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { LeaderboardEntry } from '@/hooks/useLeaderboard';
import type { BadgeDefinition, BadgeCheckData } from '@/lib/social/badgeDefinitions';
import { getBadgeColors } from '@/lib/social/badgeColors';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'motion/react';
import { totalQuestions } from '@/constants/questions';

// ---------------------------------------------------------------------------
// Badge icon map (shared with BadgeCelebration/BadgeGrid)
// ---------------------------------------------------------------------------

const BADGE_ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Target,
  Star,
  BookCheck,
  Award,
};

// ---------------------------------------------------------------------------
// Display category mapping (NOT modifying badgeDefinitions.ts)
// ---------------------------------------------------------------------------

interface DisplayCategory {
  key: string;
  en: string;
  my: string;
  icon: LucideIcon;
  /** Maps from badgeDefinitions category field */
  sourceCategory: string | null;
}

const DISPLAY_CATEGORIES: DisplayCategory[] = [
  {
    key: 'study',
    en: 'Study',
    my: '\u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F',
    icon: BookOpen,
    sourceCategory: 'coverage',
  },
  {
    key: 'test',
    en: 'Test',
    my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032',
    icon: Target,
    sourceCategory: 'accuracy',
  },
  {
    key: 'social',
    en: 'Social',
    my: '\u101C\u1030\u1019\u103E\u102F\u101B\u1031\u1038',
    icon: Users,
    sourceCategory: null,
  },
  {
    key: 'streak',
    en: 'Streak',
    my: '\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A',
    icon: Flame,
    sourceCategory: 'streak',
  },
];

// ---------------------------------------------------------------------------
// Opt-in dismissed key (shared with social opt-in flow)
// ---------------------------------------------------------------------------

const OPT_IN_DISMISSED_KEY = 'civic-prep-social-optin-dismissed';

// ---------------------------------------------------------------------------
// Badge progress helpers
// ---------------------------------------------------------------------------

function getBadgeProgress(
  badge: BadgeDefinition,
  data: BadgeCheckData | null
): { current: number; target: number } {
  if (!data) return { current: 0, target: 1 };

  switch (badge.id) {
    case 'streak-7':
      return { current: Math.min(Math.max(data.currentStreak, data.longestStreak), 7), target: 7 };
    case 'streak-14':
      return {
        current: Math.min(Math.max(data.currentStreak, data.longestStreak), 14),
        target: 14,
      };
    case 'streak-30':
      return {
        current: Math.min(Math.max(data.currentStreak, data.longestStreak), 30),
        target: 30,
      };
    case 'accuracy-90':
      return { current: Math.min(Math.round(data.bestTestAccuracy), 90), target: 90 };
    case 'accuracy-100':
      return { current: Math.min(Math.round(data.bestTestAccuracy), 100), target: 100 };
    case 'coverage-all':
      return {
        current: Math.min(data.uniqueQuestionsAnswered, totalQuestions),
        target: totalQuestions,
      };
    case 'coverage-mastered':
      return {
        current: Math.min(data.categoriesMastered, data.totalCategories || 1),
        target: data.totalCategories || 1,
      };
    default:
      return { current: 0, target: 1 };
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface AchievementsTabProps {
  earnedBadges: BadgeDefinition[];
  lockedBadges: BadgeDefinition[];
  badgeCheckData: BadgeCheckData | null;
  isLoading: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AchievementsTab({
  earnedBadges,
  lockedBadges,
  badgeCheckData,
  isLoading,
}: AchievementsTabProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const { user } = useAuth();
  const { isOptedIn, isLoading: socialLoading } = useSocial();
  const location = useLocation();

  // Scroll-to-badge when navigated from dashboard with focusBadge state
  // Derive focus target from navigation state (useMemo avoids setState-in-effect)
  const focusBadgeFromNav = useMemo(() => {
    const state = location.state as { focusBadge?: string } | null;
    return state?.focusBadge ?? null;
  }, [location.state]);

  const [focusDismissed, setFocusDismissed] = useState(false);

  const focusedBadgeId =
    focusBadgeFromNav && !focusDismissed && !isLoading ? focusBadgeFromNav : null;

  useEffect(() => {
    if (!focusBadgeFromNav || isLoading) return;

    // Scroll to badge after render
    requestAnimationFrame(() => {
      const el = document.getElementById(`badge-${focusBadgeFromNav}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    // Clear highlight after 2 seconds
    const timer = setTimeout(() => setFocusDismissed(true), 2000);
    return () => clearTimeout(timer);
  }, [focusBadgeFromNav, isLoading]);

  // -------------------------------------------------------------------------
  // Leaderboard state
  // -------------------------------------------------------------------------

  const [boardType, setBoardType] = useState<'all-time' | 'weekly'>('all-time');
  const [leaderboardLimit, setLeaderboardLimit] = useState(5);
  const {
    entries,
    userRank,
    isLoading: leaderboardLoading,
    refresh: refreshLeaderboard,
  } = useLeaderboard(boardType, leaderboardLimit);

  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleRowClick = useCallback((entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    setProfileOpen(true);
  }, []);

  const handleProfileClose = useCallback(() => {
    setProfileOpen(false);
  }, []);

  const toggleLeaderboardExpand = useCallback(() => {
    setLeaderboardLimit(prev => (prev === 5 ? 25 : 5));
  }, []);

  // -------------------------------------------------------------------------
  // Social opt-in
  // -------------------------------------------------------------------------

  const [optInClosed, setOptInClosed] = useState(false);

  const optInDismissed: boolean = useMemo(() => {
    try {
      return localStorage.getItem(OPT_IN_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  }, []);

  const showOptIn: boolean = useMemo(
    () => !!user?.id && !socialLoading && !isOptedIn && !optInDismissed && !optInClosed,
    [user?.id, socialLoading, isOptedIn, optInDismissed, optInClosed]
  );

  const handleOptInComplete = useCallback(() => {
    setOptInClosed(true);
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleOptInCancel = useCallback(() => {
    setOptInClosed(true);
    try {
      localStorage.setItem(OPT_IN_DISMISSED_KEY, 'true');
    } catch {
      // localStorage not available
    }
  }, []);

  // -------------------------------------------------------------------------
  // Badge grouping by display category
  // -------------------------------------------------------------------------

  const earnedIds: Set<string> = useMemo(
    () => new Set(earnedBadges.map(b => b.id)),
    [earnedBadges]
  );

  const allBadges: BadgeDefinition[] = useMemo(() => {
    const all = [...earnedBadges, ...lockedBadges];
    // Deduplicate
    const seen = new Set<string>();
    return all.filter(b => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [earnedBadges, lockedBadges]);

  const groupedByDisplay = useMemo(() => {
    const groups: Record<string, BadgeDefinition[]> = {};
    for (const cat of DISPLAY_CATEGORIES) {
      groups[cat.key] = [];
    }
    for (const badge of allBadges) {
      const displayCat = DISPLAY_CATEGORIES.find(c => c.sourceCategory === badge.category);
      if (displayCat) {
        groups[displayCat.key].push(badge);
      }
    }
    return groups;
  }, [allBadges]);

  // -------------------------------------------------------------------------
  // Empty state check
  // -------------------------------------------------------------------------

  const hasAnyBadges = earnedBadges.length > 0;

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ================================================================= */}
        {/* Badge Gallery (left / top) */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 space-y-6">
          <FadeIn>
            {/* Empty state welcome message */}
            {!hasAnyBadges && !isLoading && (
              <div className="mb-6">
                <EmptyState
                  icon={Trophy}
                  iconColor="text-amber-500"
                  title={{
                    en: 'No badges earned yet',
                    my: '\u1010\u1036\u1006\u102D\u1015\u103A\u1019\u103B\u102C\u1038 \u1019\u101B\u101B\u103E\u102D\u101E\u1031\u1038\u1015\u102B',
                  }}
                  description={{
                    en: 'Complete study sessions and reach milestones to earn badges',
                    my: '\u1010\u1036\u1006\u102D\u1015\u103A\u1019\u103B\u102C\u1038 \u101B\u101B\u103E\u102D\u101B\u1014\u103A \u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F\u1019\u103B\u102C\u1038 \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1015\u103C\u102E\u1038 \u1019\u102D\u102F\u1004\u103A\u1038\u1010\u102D\u102F\u1004\u103A\u1019\u103B\u102C\u1038\u1006\u102D\u102F\u1000\u103A\u1015\u102B',
                  }}
                  action={{
                    label: {
                      en: 'Start Studying',
                      my: '\u1005\u1010\u1004\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
                    },
                    onClick: () => navigate('/study'),
                  }}
                />
              </div>
            )}

            {/* Badge categories */}
            {DISPLAY_CATEGORIES.map(cat => {
              const badges = groupedByDisplay[cat.key] ?? [];
              const CatIcon = cat.icon;

              return (
                <div key={cat.key}>
                  {/* Category section header */}
                  <div className="flex items-center gap-2 mb-3">
                    <CatIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">{cat.en}</h3>
                    {showBurmese && (
                      <span className="text-sm font-myanmar text-muted-foreground">/ {cat.my}</span>
                    )}
                  </div>

                  {/* Social category: coming soon */}
                  {cat.sourceCategory === null && badges.length === 0 && (
                    <GlassCard className="mb-2">
                      <p
                        className={`text-sm text-muted-foreground text-center py-4 ${showBurmese ? 'font-myanmar' : ''}`}
                      >
                        {showBurmese
                          ? 'လူမှုရေး တံဆိပ်များ မကြာမီ လာမည်!'
                          : 'Social badges coming soon!'}
                      </p>
                    </GlassCard>
                  )}

                  {/* Badge grid */}
                  {badges.length > 0 && (
                    <StaggeredList
                      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2"
                      stagger={60}
                      delay={80}
                    >
                      {badges.map(badge => {
                        const isEarned = earnedIds.has(badge.id);
                        const progress = getBadgeProgress(badge, badgeCheckData);
                        return (
                          <StaggeredItem key={badge.id}>
                            <BadgeCard
                              badge={badge}
                              isEarned={isEarned}
                              progress={progress}
                              showBurmese={showBurmese}
                              isFocused={focusedBadgeId === badge.id}
                            />
                          </StaggeredItem>
                        );
                      })}
                    </StaggeredList>
                  )}
                </div>
              );
            })}
          </FadeIn>
        </div>

        {/* ================================================================= */}
        {/* Leaderboard (right / bottom) */}
        {/* ================================================================= */}
        <div className="lg:col-span-2 space-y-4">
          <FadeIn delay={100}>
            {/* Leaderboard header */}
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                {strings.hub.leaderboard.en}
              </h3>
              {showBurmese && (
                <span className="text-xs font-myanmar text-muted-foreground">
                  / {strings.hub.leaderboard.my}
                </span>
              )}
            </div>

            {/* All-time / Weekly toggle */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setBoardType('all-time')}
                className={clsx(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-all min-h-[36px]',
                  boardType === 'all-time'
                    ? 'bg-primary text-white shadow-[0_2px_0_hsl(var(--primary-700))]'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border'
                )}
              >
                <span className={showBurmese ? 'font-myanmar' : ''}>
                  {showBurmese ? '\u1021\u102C\u1038\u101C\u102F\u1036\u1038' : 'All Time'}
                </span>
              </button>
              <button
                onClick={() => setBoardType('weekly')}
                className={clsx(
                  'rounded-xl px-3 py-1.5 text-xs font-bold transition-all min-h-[36px]',
                  boardType === 'weekly'
                    ? 'bg-primary text-white shadow-[0_2px_0_hsl(var(--primary-700))]'
                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border'
                )}
              >
                <span className={showBurmese ? 'font-myanmar' : ''}>
                  {showBurmese ? '\u1021\u1015\u1010\u103A\u1005\u1025\u103A' : 'Weekly'}
                </span>
              </button>
            </div>

            {/* Social opt-in CTA */}
            {user && !isOptedIn && !showOptIn && (
              <GlassCard className="mb-3">
                <div className="flex items-center justify-between gap-3 p-1">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <p
                      className={`text-xs font-bold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                    >
                      {showBurmese
                        ? '\u1021\u101E\u102D\u102F\u1004\u103A\u1038\u1019\u103E\u102C \u1015\u102B\u101D\u1004\u103A\u1015\u102B!'
                        : 'Join the community!'}
                    </p>
                  </div>
                  <button
                    onClick={() => setOptInClosed(false)}
                    className={clsx(
                      'shrink-0 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white min-h-[36px]',
                      'shadow-[0_2px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[1px]',
                      'transition-all'
                    )}
                  >
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? '\u1015\u102B\u101D\u1004\u103A\u1015\u102B' : 'Join'}
                    </span>
                  </button>
                </div>
              </GlassCard>
            )}

            {/* Leaderboard table */}
            <GlassCard className="p-0 overflow-hidden">
              <LeaderboardTable
                entries={entries}
                userRank={userRank}
                currentUserId={user?.id ?? null}
                onRowClick={handleRowClick}
                isLoading={leaderboardLoading}
              />
            </GlassCard>

            {/* Show more / Show less button */}
            {!leaderboardLoading && entries.length > 0 && (
              <button
                onClick={toggleLeaderboardExpand}
                className={clsx(
                  'flex items-center justify-center gap-1 w-full py-2 mt-2',
                  'text-xs font-medium text-muted-foreground hover:text-foreground',
                  'transition-colors rounded-lg hover:bg-muted/30'
                )}
              >
                {leaderboardLimit === 5 ? (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? strings.hub.showMore.my : strings.hub.showMore.en}
                    </span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span className={showBurmese ? 'font-myanmar' : ''}>
                      {showBurmese ? strings.hub.showLess.my : strings.hub.showLess.en}
                    </span>
                  </>
                )}
              </button>
            )}
          </FadeIn>
        </div>
      </div>

      {/* Profile dialog */}
      <LeaderboardProfile entry={selectedEntry} open={profileOpen} onClose={handleProfileClose} />

      {/* Social opt-in flow */}
      {showOptIn && user && (
        <SocialOptInFlow
          open={showOptIn}
          onComplete={handleOptInComplete}
          onCancel={handleOptInCancel}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Badge card with earned glow/shimmer and locked greyscale
// ---------------------------------------------------------------------------

function BadgeCard({
  badge,
  isEarned,
  progress,
  showBurmese,
  isFocused,
}: {
  badge: BadgeDefinition;
  isEarned: boolean;
  progress: { current: number; target: number };
  showBurmese: boolean;
  isFocused: boolean;
}) {
  const IconComponent = BADGE_ICON_MAP[badge.icon] ?? Award;
  const colors = getBadgeColors(badge.id);
  const shouldReduceMotion = useReducedMotion();
  const progressPct =
    progress.target > 0 ? Math.min((progress.current / progress.target) * 100, 100) : 0;

  return (
    <motion.div
      id={`badge-${badge.id}`}
      whileHover={shouldReduceMotion ? {} : { scale: 1.05, y: -4 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <GlassCard
        className={clsx(
          'relative flex flex-col items-center text-center p-4 overflow-hidden cursor-pointer',
          isFocused && 'ring-2 ring-primary ring-offset-2 ring-offset-surface-primary'
        )}
      >
        {/* Icon container */}
        <motion.div
          className={clsx(
            'relative flex items-center justify-center h-12 w-12 rounded-full mb-3',
            isEarned ? `${colors.bgLight} ${colors.bgDark}` : 'bg-muted grayscale'
          )}
          whileHover={
            shouldReduceMotion ? {} : isEarned ? { rotate: [0, -10, 10, -5, 5, 0] } : { scale: 1.1 }
          }
          transition={{ duration: 0.5 }}
        >
          {isEarned ? (
            <IconComponent
              className={clsx('h-6 w-6 filter saturate-150', colors.icon, colors.glow)}
            />
          ) : (
            <Lock className="h-5 w-5 text-muted-foreground" />
          )}
          {isEarned && <div className="badge-gold-shimmer absolute inset-0 rounded-full" />}
        </motion.div>

        {/* Badge name */}
        <p
          className={clsx(
            'text-xs font-semibold leading-tight',
            isEarned ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {badge.name.en}
        </p>
        {showBurmese && (
          <p className="text-xs font-myanmar text-muted-foreground mt-0.5 leading-tight">
            {badge.name.my}
          </p>
        )}

        {/* Progress bar with per-badge color */}
        <div className="w-full mt-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={clsx(
                'h-full rounded-full transition-all duration-500',
                isEarned ? colors.bar : 'bg-muted-foreground/40'
              )}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-caption text-muted-foreground mt-1 tabular-nums">
            {progress.current}/{progress.target}
          </p>
        </div>

        {/* Description (earned) or requirement hint (locked) */}
        {isEarned ? (
          <p className="text-caption text-muted-foreground mt-1.5 leading-relaxed">
            {badge.description.en}
            {showBurmese && (
              <span className="block font-myanmar mt-0.5">{badge.description.my}</span>
            )}
          </p>
        ) : (
          <p className="text-caption text-muted-foreground mt-1.5 leading-relaxed italic">
            {badge.requirement.en}
            {showBurmese && (
              <span className="block font-myanmar mt-0.5">{badge.requirement.my}</span>
            )}
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}
