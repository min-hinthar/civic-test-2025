'use client';

/**
 * SocialHubPage - Community hub with collaborative, encouraging feel.
 *
 * Three-tab layout (Duolingo visual treatment):
 * 1. Community Learners - Top 25 + user rank, all-time/weekly toggle
 * 2. Achievements - Earned/locked badge grid with celebration modal
 * 3. Streak - Streak stats, heatmap, freeze info
 *
 * Tab navigation follows HistoryPage pattern exactly:
 * - Hash-based routing (#leaderboard, #badges, #streak)
 * - useMemo-derived activeTab (React Compiler safe)
 * - userSelectedTab with null initial -> fallback to hash-derived tab
 *
 * Social opt-in flow triggers on first visit for authenticated users.
 * Non-authenticated users can view the leaderboard but not participate.
 *
 * Tone: Collaborative, community, encouragement - no competitive shame.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, Award, Flame, Snowflake, Users, Heart, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import { PageTitle } from '@/components/bilingual/BilingualHeading';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/animations/StaggeredList';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useStreak } from '@/hooks/useStreak';
import { useBadges } from '@/hooks/useBadges';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { LeaderboardTable } from '@/components/social/LeaderboardTable';
import { LeaderboardProfile } from '@/components/social/LeaderboardProfile';
import { BadgeGrid } from '@/components/social/BadgeGrid';
import { BadgeCelebration } from '@/components/social/BadgeCelebration';
import { StreakHeatmap } from '@/components/social/StreakHeatmap';
import { SocialOptInFlow } from '@/components/social/SocialOptInFlow';
import type { LeaderboardEntry } from '@/hooks/useLeaderboard';
import type { BadgeCheckData } from '@/lib/social/badgeDefinitions';
import { getAnswerHistory } from '@/lib/mastery';

// ---------------------------------------------------------------------------
// Tab type
// ---------------------------------------------------------------------------

type SocialTab = 'leaderboard' | 'badges' | 'streak';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPT_IN_DISMISSED_KEY = 'civic-prep-social-optin-dismissed';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SocialHubPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();

  // -------------------------------------------------------------------------
  // Tab navigation (HistoryPage pattern)
  // -------------------------------------------------------------------------

  const tabFromHash: SocialTab | null = useMemo(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'leaderboard') return 'leaderboard';
    if (hash === 'badges') return 'badges';
    if (hash === 'streak') return 'streak';
    return null;
  }, [location.hash]);

  const [userSelectedTab, setUserSelectedTab] = useState<SocialTab | null>(null);
  const activeTab = userSelectedTab ?? tabFromHash ?? 'leaderboard';

  const setActiveTab = useCallback(
    (tab: SocialTab) => {
      setUserSelectedTab(tab);
      navigate({ hash: `#${tab}` }, { replace: true });
    },
    [navigate]
  );

  // -------------------------------------------------------------------------
  // Leaderboard state
  // -------------------------------------------------------------------------

  const [boardType, setBoardType] = useState<'all-time' | 'weekly'>('all-time');
  const {
    entries,
    userRank,
    isLoading: leaderboardLoading,
    refresh: refreshLeaderboard,
  } = useLeaderboard(boardType);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleRowClick = useCallback((entry: LeaderboardEntry) => {
    setSelectedEntry(entry);
    setProfileOpen(true);
  }, []);

  const handleProfileClose = useCallback(() => {
    setProfileOpen(false);
  }, []);

  // -------------------------------------------------------------------------
  // Badge state
  // -------------------------------------------------------------------------

  const { categoryMasteries } = useCategoryMastery();
  const {
    currentStreak,
    longestStreak,
    freezesAvailable,
    freezesUsed,
    activityDates,
    isLoading: streakLoading,
  } = useStreak();

  // Build BadgeCheckData from user stats
  const [uniqueQuestionsCount, setUniqueQuestionsCount] = useState(0);
  useEffect(() => {
    let cancelled = false;
    getAnswerHistory()
      .then(answers => {
        if (!cancelled) {
          const unique = new Set(answers.map(a => a.questionId));
          setUniqueQuestionsCount(unique.size);
        }
      })
      .catch(() => {
        // IndexedDB not available
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const history = useMemo(() => user?.testHistory ?? [], [user?.testHistory]);

  const badgeCheckData: BadgeCheckData | null = useMemo(() => {
    if (streakLoading) return null;

    const bestTest = history.reduce<{ accuracy: number; score: number }>(
      (best, session) => {
        const accuracy =
          session.totalQuestions > 0 ? (session.score / session.totalQuestions) * 100 : 0;
        return {
          accuracy: Math.max(best.accuracy, accuracy),
          score: Math.max(best.score, session.score),
        };
      },
      { accuracy: 0, score: 0 }
    );

    const catValues = Object.values(categoryMasteries);
    const categoriesMastered = catValues.filter(v => v >= 100).length;

    return {
      currentStreak,
      longestStreak,
      bestTestAccuracy: bestTest.accuracy,
      bestTestScore: bestTest.score,
      totalTestsTaken: history.length,
      uniqueQuestionsAnswered: uniqueQuestionsCount,
      categoriesMastered,
      totalCategories: catValues.length,
    };
  }, [
    streakLoading,
    currentStreak,
    longestStreak,
    history,
    uniqueQuestionsCount,
    categoryMasteries,
  ]);

  const { earnedBadges, lockedBadges, newlyEarnedBadge, dismissCelebration } =
    useBadges(badgeCheckData);

  // -------------------------------------------------------------------------
  // Social opt-in flow
  // -------------------------------------------------------------------------

  const [showOptIn, setShowOptIn] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);

  // Check opt-in state on mount (lazy import useSocial only if SocialProvider available)
  // Since SocialProvider may not be in the tree yet (plan 08), we check gracefully
  useEffect(() => {
    if (!user?.id) return;

    // Check if user already dismissed the opt-in prompt
    try {
      const dismissed = localStorage.getItem(OPT_IN_DISMISSED_KEY);
      if (dismissed === 'true') return;
    } catch {
      // localStorage not available
    }

    // Use dynamic import to safely check social profile
    import('@/lib/social/socialProfileSync')
      .then(({ getSocialProfile }) => {
        getSocialProfile(user.id)
          .then(profile => {
            if (profile?.socialOptIn) {
              setIsOptedIn(true);
            } else if (profile === null || !profile.socialOptIn) {
              // User hasn't opted in, show opt-in flow
              setShowOptIn(true);
            }
          })
          .catch(() => {
            // Supabase not available
          });
      })
      .catch(() => {
        // Module not available
      });
  }, [user?.id]);

  const handleOptInComplete = useCallback(() => {
    setShowOptIn(false);
    setIsOptedIn(true);
    refreshLeaderboard();
  }, [refreshLeaderboard]);

  const handleOptInCancel = useCallback(() => {
    setShowOptIn(false);
    try {
      localStorage.setItem(OPT_IN_DISMISSED_KEY, 'true');
    } catch {
      // localStorage not available
    }
  }, []);

  // Tab config for DRY rendering
  const tabs = [
    {
      key: 'leaderboard' as const,
      en: 'Community Learners',
      my: '\u101E\u1004\u103A\u101A\u1030\u101E\u1030\u1016\u1031\u102C\u103A\u1019\u103B\u102C\u1038',
      icon: Users,
    },
    {
      key: 'badges' as const,
      en: 'Achievements',
      my: '\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1019\u103E\u102F\u1019\u103B\u102C\u1038',
      icon: Award,
    },
    {
      key: 'streak' as const,
      en: 'Streak',
      my: '\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A',
      icon: Flame,
    },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="page-shell">
      <AppNavigation />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageTitle
          text={{
            en: 'Community',
            my: '\u1021\u101E\u102D\u102F\u1004\u103A\u1038\u1021\u101D\u102D\u102F\u1004\u103A\u1038',
          }}
        />

        <p className="text-muted-foreground mb-6">
          Study together, celebrate each other, and grow as a community.
          {showBurmese && (
            <span className="block font-myanmar mt-1">
              {
                '\u1021\u1010\u1030\u1010\u1000\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B\u104D \u1021\u1001\u103B\u1004\u103A\u1038\u1001\u103B\u1004\u103A\u1038\u1000\u102D\u102F \u1002\u102F\u100F\u103A\u101B\u100A\u103A\u1015\u102B\u104D \u1021\u101E\u102D\u102F\u1004\u103A\u1038\u1021\u101D\u102D\u102F\u1004\u103A\u1038\u1021\u1016\u103C\u1005\u103A \u1000\u103C\u102E\u1038\u1011\u103D\u102C\u1038\u1015\u102B\u104D'
              }
            </span>
          )}
        </p>

        {/* Tab navigation - Duolingo-style rounded pill tabs */}
        <div className="mb-8 flex rounded-2xl border border-border bg-muted/30 p-1 w-fit">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={clsx(
                  'rounded-xl px-4 py-2.5 text-sm font-bold transition-all min-h-[44px] flex items-center gap-2',
                  activeTab === tab.key
                    ? 'bg-primary-500 text-white shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px] transition-[box-shadow,transform] duration-100'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {tab.en}
                  {showBurmese && (
                    <span className="ml-1 font-myanmar text-xs opacity-80">{tab.my}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* Community Learners Tab */}
        {/* ================================================================= */}
        {activeTab === 'leaderboard' && (
          <FadeIn>
            <section className="space-y-4" aria-label="Community Learners">
              {/* All Time / Weekly toggle - 3D chunky */}
              <div className="flex gap-2">
                <button
                  onClick={() => setBoardType('all-time')}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-bold transition-all min-h-[44px]',
                    boardType === 'all-time'
                      ? 'bg-primary-500 text-white shadow-[0_3px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[2px]'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border'
                  )}
                >
                  {showBurmese ? '\u1021\u102C\u1038\u101C\u102F\u1036\u1038' : 'All Time'}
                </button>
                <button
                  onClick={() => setBoardType('weekly')}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-bold transition-all min-h-[44px]',
                    boardType === 'weekly'
                      ? 'bg-primary-500 text-white shadow-[0_3px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[2px]'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border'
                  )}
                >
                  {showBurmese ? '\u1021\u1015\u1010\u103A\u1005\u1025\u103A' : 'Weekly'}
                </button>
              </div>

              {/* Encouraging opt-in CTA for non-opted-in authenticated users */}
              {user && !isOptedIn && !showOptIn && (
                <Card className="border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-primary-500/15">
                        <Heart className="h-5 w-5 text-primary-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {showBurmese
                            ? '\u1021\u101E\u102D\u102F\u1004\u103A\u1038\u1019\u103E\u102C \u1015\u102B\u101D\u1004\u103A\u1015\u102B!'
                            : 'Join the community!'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {showBurmese
                            ? '\u101E\u1004\u1037\u103A\u101B\u1019\u103E\u1010\u103A\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1019\u103B\u103E\u101D\u1031\u1015\u103C\u1015\u102B'
                            : 'Share your journey and encourage others'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowOptIn(true)}
                      className={clsx(
                        'shrink-0 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]',
                        'shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]',
                        'transition-all hover:bg-primary-600'
                      )}
                    >
                      {showBurmese ? '\u1015\u102B\u101D\u1004\u103A\u1015\u102B' : 'Join'}
                    </button>
                  </div>
                </Card>
              )}

              {/* Non-authenticated CTA */}
              {!user && (
                <Card className="text-center">
                  <Sparkles className="h-8 w-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground mb-1">
                    {showBurmese
                      ? '\u1015\u102B\u101D\u1004\u103A\u101B\u1014\u103A \u1021\u101B\u1004\u103A \u101D\u1004\u103A\u101B\u1031\u102C\u1000\u103A\u1015\u102B'
                      : 'Sign in to participate'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {showBurmese
                      ? '\u1021\u101E\u102D\u102F\u1004\u103A\u1038\u1019\u103E\u102C \u1015\u102B\u101D\u1004\u103A\u1015\u103C\u102E\u1038 \u1021\u1010\u1030\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B'
                      : 'Join the community and learn together'}
                  </p>
                </Card>
              )}

              {/* Leaderboard table */}
              <LeaderboardTable
                entries={entries}
                userRank={userRank}
                currentUserId={user?.id ?? null}
                onRowClick={handleRowClick}
                isLoading={leaderboardLoading}
              />
            </section>
          </FadeIn>
        )}

        {/* ================================================================= */}
        {/* Achievements Tab */}
        {/* ================================================================= */}
        {activeTab === 'badges' && (
          <FadeIn>
            <section className="space-y-6" aria-label="Achievements">
              {/* Encouraging header for badges */}
              <Card className="border-accent-purple/20 bg-accent-purple/5 dark:bg-accent-purple/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/20">
                    <Sparkles className="h-5 w-5 text-accent-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {showBurmese
                        ? '\u101E\u1004\u1037\u103A\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1019\u103E\u102F\u1019\u103B\u102C\u1038'
                        : 'Your Achievements'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {showBurmese
                        ? `\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u1019\u103E\u102F ${earnedBadges.length} \u1001\u102F \u101B\u101B\u103E\u102D\u1015\u103C\u102E\u1038 \u104D \u1006\u1000\u103A\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1015\u102B!`
                        : `${earnedBadges.length} earned - keep learning!`}
                    </p>
                  </div>
                </div>
              </Card>

              <BadgeGrid earnedBadges={earnedBadges} lockedBadges={lockedBadges} />
            </section>
          </FadeIn>
        )}

        {/* ================================================================= */}
        {/* Streak Tab */}
        {/* ================================================================= */}
        {activeTab === 'streak' && (
          <FadeIn>
            <section className="space-y-6" aria-label="Streak">
              {/* Streak stats cards - rounded-2xl with icons */}
              <div className="grid grid-cols-3 gap-4">
                {/* Current streak */}
                <Card className="text-center">
                  <Flame className="h-7 w-7 text-orange-500 mx-auto" />
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {streakLoading ? '--' : currentStreak}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-bold">
                    {showBurmese ? '\u101C\u1000\u103A\u101B\u103E\u102D' : 'Current'}
                  </p>
                </Card>

                {/* Longest streak */}
                <Card className="text-center">
                  <Trophy className="h-7 w-7 text-primary-500 mx-auto" />
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {streakLoading ? '--' : longestStreak}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-bold">
                    {showBurmese
                      ? '\u1021\u1000\u1031\u102C\u1004\u103A\u1038\u1006\u102F\u1036\u1038'
                      : 'Longest'}
                  </p>
                </Card>

                {/* Freezes available */}
                <Card className="text-center">
                  <Snowflake className="h-7 w-7 text-blue-400 mx-auto" />
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {streakLoading ? '--' : `${freezesAvailable}/3`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-bold">Freezes</p>
                </Card>
              </div>

              {/* Streak heatmap */}
              <Card>
                <h3 className="text-sm font-bold text-foreground mb-3">
                  {showBurmese
                    ? '\u101C\u103E\u102F\u1015\u103A\u101B\u103E\u102C\u1038\u1019\u103E\u102F'
                    : 'Activity Calendar'}
                </h3>
                <StreakHeatmap activityDates={activityDates} freezesUsed={freezesUsed} />
              </Card>

              {/* How freezes work - encouraging tone */}
              <Card className="border-blue-200/40 dark:border-blue-500/20 bg-blue-50/30 dark:bg-blue-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Snowflake className="h-5 w-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-foreground">
                    {showBurmese
                      ? 'Freeze \u1021\u101C\u102F\u1015\u103A\u101C\u102F\u1015\u103A\u1015\u102F\u1036'
                      : 'How Freezes Work'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete a full practice test or 10+ SRS reviews to earn a freeze. Freezes protect
                  your streak when you miss a day (max 3).
                </p>
                {showBurmese && (
                  <p className="font-myanmar text-sm text-muted-foreground leading-relaxed mt-2">
                    {
                      '\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032 \u1021\u1015\u103C\u100A\u1037\u103A \u101E\u102D\u102F\u1037\u1019\u103F\u101F\u102F\u1010\u103A SRS \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1019\u103E\u102F \u1041\u1040+ \u1001\u102F \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1015\u102B\u1000 freeze \u101B\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104D Freeze \u1019\u103B\u102C\u1038\u101E\u100A\u103A \u101E\u1004\u103A \u1010\u101B\u1000\u103A\u101C\u103D\u1032\u101E\u1031\u102C\u1014\u1031\u1037 streak \u1000\u102D\u102F \u1000\u102C\u1000\u103D\u101A\u103A\u1015\u102B\u101E\u100A\u103A (\u1021\u1019\u103B\u102C\u1038\u1006\u102F\u1036\u1038 \u1043 \u1001\u102F)\u104D'
                    }
                  </p>
                )}
              </Card>
            </section>
          </FadeIn>
        )}
      </div>

      {/* Profile dialog */}
      <LeaderboardProfile entry={selectedEntry} open={profileOpen} onClose={handleProfileClose} />

      {/* Badge celebration modal */}
      {newlyEarnedBadge && (
        <BadgeCelebration
          badge={newlyEarnedBadge}
          onDismiss={() => dismissCelebration(newlyEarnedBadge.id)}
        />
      )}

      {/* Social opt-in flow */}
      {showOptIn && user && (
        <SocialOptInFlow
          open={showOptIn}
          onComplete={handleOptInComplete}
          onCancel={handleOptInCancel}
        />
      )}
    </div>
  );
};

export default SocialHubPage;
