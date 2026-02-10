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

import { PageTitle } from '@/components/bilingual/BilingualHeading';
import { Card } from '@/components/ui/Card';
import { FadeIn } from '@/components/animations/StaggeredList';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSocial } from '@/contexts/SocialContext';
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
  const { isOptedIn, isLoading: socialLoading } = useSocial();
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

  // Track whether user has manually closed the opt-in dialog this session
  const [optInClosed, setOptInClosed] = useState(false);

  // Check localStorage once for persistent dismissal
  const optInDismissed: boolean = useMemo(() => {
    try {
      return localStorage.getItem(OPT_IN_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  }, []);

  // Derive whether to show the opt-in prompt (no setState in effect needed)
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

  // Tab config for DRY rendering
  const tabs = [
    {
      key: 'leaderboard' as const,
      en: 'Community Learners',
      my: 'သင်ယူသူဖော်များ',
      icon: Users,
    },
    {
      key: 'badges' as const,
      en: 'Achievements',
      my: 'အောင်မြင်မှုများ',
      icon: Award,
    },
    {
      key: 'streak' as const,
      en: 'Streak',
      my: 'ဆက်တိုက်',
      icon: Flame,
    },
  ];

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <PageTitle
          text={{
            en: 'Community',
            my: 'အသိုင်းအဝိုင်း',
          }}
        />

        <p className="text-muted-foreground mb-6">
          Study together, celebrate each other, and grow as a community.
          {showBurmese && (
            <span className="block font-myanmar mt-1">
              {'အတူတက်လေ့ကျင့်ပါ၍ အချင်းချင်းကို ဂုဏ်ရည်ပါ၍ အသိုင်းအဝိုင်းအဖြစ် ကြီးထွားပါ၍'}
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
                    ? 'bg-primary text-white shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px] transition-[box-shadow,transform] duration-100'
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
                      ? 'bg-primary text-white shadow-[0_3px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[2px]'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border'
                  )}
                >
                  <span className={showBurmese ? 'font-myanmar' : ''}>
                    {showBurmese ? 'အားလုံး' : 'All Time'}
                  </span>
                </button>
                <button
                  onClick={() => setBoardType('weekly')}
                  className={clsx(
                    'rounded-xl px-4 py-2 text-sm font-bold transition-all min-h-[44px]',
                    boardType === 'weekly'
                      ? 'bg-primary text-white shadow-[0_3px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[2px]'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60 border border-border'
                  )}
                >
                  <span className={showBurmese ? 'font-myanmar' : ''}>
                    {showBurmese ? 'အပတ်စဥ်' : 'Weekly'}
                  </span>
                </button>
              </div>

              {/* Encouraging opt-in CTA for non-opted-in authenticated users */}
              {user && !isOptedIn && !showOptIn && (
                <Card className="border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle">
                        <Heart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-bold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                        >
                          {showBurmese ? 'အသိုင်းမှာ ပါဝင်ပါ!' : 'Join the community!'}
                        </p>
                        <p
                          className={`text-xs text-muted-foreground mt-0.5 ${showBurmese ? 'font-myanmar' : ''}`}
                        >
                          {showBurmese
                            ? 'သင့်ရမှတ်များကို မျှဝေပြပါ'
                            : 'Share your journey and encourage others'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setOptInClosed(false)}
                      className={clsx(
                        'shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white min-h-[44px]',
                        'shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]',
                        'transition-all hover:bg-primary'
                      )}
                    >
                      <span className={showBurmese ? 'font-myanmar' : ''}>
                        {showBurmese ? 'ပါဝင်ပါ' : 'Join'}
                      </span>
                    </button>
                  </div>
                </Card>
              )}

              {/* Non-authenticated CTA */}
              {!user && (
                <Card className="text-center">
                  <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p
                    className={`text-sm font-bold text-foreground mb-1 ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? 'ပါဝင်ရန် အရင် ဝင်ရောက်ပါ' : 'Sign in to participate'}
                  </p>
                  <p
                    className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese
                      ? 'အသိုင်းမှာ ပါဝင်ပြီး အတူလေ့ကျင့်ပါ'
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
              <Card className="border-accent-purple/20 bg-accent-purple/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/20">
                    <Sparkles className="h-5 w-5 text-accent-purple" />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                    >
                      {showBurmese ? 'သင့်အောင်မြင်မှုများ' : 'Your Achievements'}
                    </p>
                    <p
                      className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                    >
                      {showBurmese
                        ? `အောင်မြင်မှု ${earnedBadges.length} ခု ရရှိပြီး ၍ ဆက်လေ့ကျင့်ပါ!`
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
                  <Flame className="h-7 w-7 text-accent mx-auto" />
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {streakLoading ? '--' : currentStreak}
                  </p>
                  <p
                    className={`text-xs text-muted-foreground mt-1 font-bold ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? 'လက်ရှိ' : 'Current'}
                  </p>
                </Card>

                {/* Longest streak */}
                <Card className="text-center">
                  <Trophy className="h-7 w-7 text-primary mx-auto" />
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {streakLoading ? '--' : longestStreak}
                  </p>
                  <p
                    className={`text-xs text-muted-foreground mt-1 font-bold ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? 'အကောင်းဆုံး' : 'Longest'}
                  </p>
                </Card>

                {/* Freezes available */}
                <Card className="text-center">
                  <Snowflake className="h-7 w-7 text-primary mx-auto" />
                  <p className="text-3xl font-bold text-foreground mt-2 tabular-nums">
                    {streakLoading ? '--' : `${freezesAvailable}/3`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-bold">Freezes</p>
                </Card>
              </div>

              {/* Streak heatmap */}
              <Card>
                <h3
                  className={`text-sm font-bold text-foreground mb-3 ${showBurmese ? 'font-myanmar' : ''}`}
                >
                  {showBurmese ? 'လှုပ်ရှားမှု' : 'Activity Calendar'}
                </h3>
                <StreakHeatmap activityDates={activityDates} freezesUsed={freezesUsed} />
              </Card>

              {/* How freezes work - encouraging tone */}
              <Card className="border-primary/40 bg-primary-subtle/30">
                <div className="flex items-center gap-2 mb-2">
                  <Snowflake className="h-5 w-5 text-primary" />
                  <h3
                    className={`text-sm font-bold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? 'Freeze အလုပ်လုပ်ပုံ' : 'How Freezes Work'}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete a full practice test or 10+ SRS reviews to earn a freeze. Freezes protect
                  your streak when you miss a day (max 3).
                </p>
                {showBurmese && (
                  <p className="font-myanmar text-sm text-muted-foreground leading-relaxed mt-2">
                    {
                      'လေ့ကျင့်စာမေးပွဲ အပြည့် သို့မဿဟုတ် SRS ပြန်လည်မှု ၁၀+ ခု ပြီးဆုံးပါက freeze ရရှိပါသည်၍ Freeze များသည် သင် တရက်လွဲသောနေ့ streak ကို ကာကွယ်ပါသည် (အများဆုံး ၃ ခု)၍'
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
