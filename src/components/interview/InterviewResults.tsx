'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  ScrollText,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ExaminerCharacter } from '@/components/interview/ExaminerCharacter';
import { InterviewTranscript } from '@/components/interview/InterviewTranscript';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { FadeIn } from '@/components/animations/StaggeredList';
import { ShareButton } from '@/components/social/ShareButton';
import { useTTS } from '@/hooks/useTTS';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useStreak } from '@/hooks/useStreak';
import { useSRS } from '@/contexts/SRSContext';
import { useToast } from '@/components/BilingualToast';
import { saveInterviewSession, getInterviewHistory } from '@/lib/interview/interviewStore';
import { getClosingStatement } from '@/lib/interview/interviewGreetings';
import { createAudioPlayer, getInterviewAudioUrl } from '@/lib/audio/audioPlayer';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { playCompletionSparkle } from '@/lib/audio/soundEffects';
import { USCIS_CATEGORIES, CATEGORY_COLORS, getUSCISCategory } from '@/lib/mastery/categoryMapping';
import type { USCISCategory } from '@/lib/mastery/categoryMapping';
import { strings } from '@/lib/i18n/strings';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import type { InterviewMode, InterviewResult, InterviewEndReason, InterviewSession } from '@/types';
import { getTokenColor } from '@/lib/tokens';
import { useThemeContext } from '@/contexts/ThemeContext';

/** Map of end reasons to bilingual display text */
const END_REASON_TEXT: Record<InterviewEndReason, { en: string; my: string }> = {
  passThreshold: {
    en: 'Reached 12 correct answers',
    my: '၁၂ ခုမှန်ကန်စွာဖြေဆိုနိုင်ပါပြီ',
  },
  failThreshold: {
    en: 'Reached 9 incorrect answers',
    my: '၉ ခုမှားယွင်းစွာဖြေဆိုမိပါပြီ',
  },
  complete: {
    en: 'Completed all 20 questions',
    my: 'မေးခွန်း ၂၀ အားလုံးဖြေဆိုပြီးပါပြီ',
  },
  quit: {
    en: 'Interview ended early',
    my: 'အင်တာဗျူးကို စောစီးစွာရပ်ဆိုင်းပါပြီ',
  },
};

/** Color classes for each USCIS category - semantic tokens */
const CATEGORY_COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  blue: {
    bg: 'bg-chart-blue/10',
    text: 'text-chart-blue',
  },
  amber: {
    bg: 'bg-chart-amber/10',
    text: 'text-chart-amber',
  },
  emerald: {
    bg: 'bg-chart-emerald/10',
    text: 'text-chart-emerald',
  },
};

/** Personalized recommendation based on score */
function getRecommendation(score: number, weakCategory: string | null): { en: string; my: string } {
  if (score >= 16) {
    return {
      en: "You're ready for the real interview! Consider scheduling your appointment.",
      my: 'လက်တွေ့အင်တာဗျူးအတွက် အဆင်သင့်ဖြစ်ပါပြီ! ရက်ချိန်းယူပါ။',
    };
  }
  if (score >= 12) {
    const topicText = weakCategory ? ` Focus on ${weakCategory} to boost your score.` : '';
    const topicTextMy = weakCategory ? ` ${weakCategory} ကို အာရုံစိုက်ပါ။` : '';
    return {
      en: `You're close to mastery!${topicText}`,
      my: `ကျွမ်းကျင်မှုနှင့်နီးစပ်ပါပြီ!${topicTextMy}`,
    };
  }
  return {
    en: 'Keep practicing! Review the topics below and try again.',
    my: 'ဆက်လက်လေ့ကျင့်ပါ! အောက်ပါအကြောင်းများကို ပြန်လေ့လာပြီး ထပ်ကြိုးစားပါ။',
  };
}

/** Format seconds to mm:ss */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

interface InterviewResultsProps {
  /** Array of question results from the session */
  results: InterviewResult[];
  /** Interview mode used */
  mode: InterviewMode;
  /** Total session duration in seconds */
  durationSeconds: number;
  /** Reason the interview ended */
  endReason: InterviewEndReason;
  /** Callback to retry (return to setup) */
  onRetry: () => void;
  /** Callback to switch mode and start new session */
  onSwitchMode: (mode: InterviewMode) => void;
  /** Session speed override for speech button labels */
  speedOverride?: 'slow' | 'normal' | 'fast';
}

/**
 * Interview-specific results screen with dark theme, full transcript,
 * confidence analytics, trend chart, SRS batch offer, and personalized recommendation.
 *
 * Features:
 * - Dark gradient background matching interview session aesthetic
 * - ExaminerCharacter at top in idle state
 * - Pass/fail banner with glowing badge and confetti + sound on pass
 * - Animated CountUpScore
 * - Analytics: score breakdown, time taken, confidence distribution, category breakdown
 * - Comparison to previous attempts (improvement/regression)
 * - Score trend chart (recharts LineChart)
 * - Full InterviewTranscript with chat-style Q&A
 * - SRS batch offer for wrong answers
 * - Personalized recommendation
 * - Action buttons: Retry, Review (scroll to transcript), Home, Share
 * - Saves session to IndexedDB and updates mastery system on mount
 * - TTS closing statement from examiner
 */
export function InterviewResults({
  results,
  mode,
  durationSeconds,
  endReason,
  onRetry,
  onSwitchMode,
  speedOverride,
}: InterviewResultsProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { settings: ttsSettings } = useTTS();
  const closingPlayerRef = useRef(createAudioPlayer());
  const [isClosingSpeaking, setIsClosingSpeaking] = useState(false);

  // Effective speed for speech button labels in transcript
  const effectiveSpeed = mode === 'realistic' ? 'normal' : (speedOverride ?? ttsSettings.rate);
  const effectiveSpeedLabel = effectiveSpeed === 'normal' ? undefined : effectiveSpeed;

  const { currentStreak } = useStreak();
  const { addCard, isInDeck } = useSRS();
  const { showSuccess } = useToast();

  // Subscribe to theme changes so getTokenColor() re-resolves on toggle
  useThemeContext();

  const [showConfetti, setShowConfetti] = useState(false);
  const [trendData, setTrendData] = useState<Array<{ date: string; score: number }>>([]);
  const [hasSaved, setHasSaved] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Ref for scroll-to-transcript
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  // --- Computed values ---
  const score = useMemo(() => results.filter(r => r.selfGrade === 'correct').length, [results]);
  const passed = score >= 12;
  const totalQuestions = results.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<USCISCategory, { correct: number; total: number }> = {
      'American Government': { correct: 0, total: 0 },
      'American History': { correct: 0, total: 0 },
      'Integrated Civics': { correct: 0, total: 0 },
    };

    for (const result of results) {
      const mainCat = getUSCISCategory(result.category);
      breakdown[mainCat].total += 1;
      if (result.selfGrade === 'correct') {
        breakdown[mainCat].correct += 1;
      }
    }

    return breakdown;
  }, [results]);

  // Weakest category for recommendation
  const weakestCategory = useMemo(() => {
    let worst: string | null = null;
    let worstPct = 1;
    for (const [cat, stats] of Object.entries(categoryBreakdown)) {
      if (stats.total === 0) continue;
      const pct = stats.correct / stats.total;
      if (pct < worstPct) {
        worstPct = pct;
        worst = cat;
      }
    }
    return worst;
  }, [categoryBreakdown]);

  // Incorrect questions for SRS batch offer
  const incorrectResults = useMemo(
    () => results.filter(r => r.selfGrade === 'incorrect'),
    [results]
  );

  // Count how many incorrect are NOT already in deck
  const incorrectNotInDeck = useMemo(
    () => incorrectResults.filter(r => !isInDeck(r.questionId)),
    [incorrectResults, isInDeck]
  );

  // Confidence analytics
  const confidenceStats = useMemo(() => {
    const withConfidence = results.filter(r => r.confidence !== undefined);
    if (withConfidence.length === 0) return null;

    const confidences = withConfidence.map(r => r.confidence!);
    const avg = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const min = Math.min(...confidences);
    const max = Math.max(...confidences);

    return {
      avg: Math.round(avg * 100),
      min: Math.round(min * 100),
      max: Math.round(max * 100),
      count: withConfidence.length,
    };
  }, [results]);

  // Early termination index
  const earlyTerminationIndex = useMemo(() => {
    if (endReason === 'passThreshold' || endReason === 'failThreshold') {
      return results.length - 1;
    }
    return undefined;
  }, [endReason, results.length]);

  // Share card data for social sharing
  const shareCardData: ShareCardData = useMemo(
    () => ({
      score,
      total: totalQuestions,
      sessionType: 'interview',
      streak: currentStreak,
      topBadge: null,
      categories: (
        Object.entries(categoryBreakdown) as Array<[string, { correct: number; total: number }]>
      )
        .filter(([, stats]) => stats.total > 0)
        .map(([name, stats]) => ({ name, correct: stats.correct, total: stats.total })),
      date: new Date().toISOString(),
    }),
    [score, totalQuestions, currentStreak, categoryBreakdown]
  );

  // --- Save results and load history on mount ---
  useEffect(() => {
    if (hasSaved) return;

    let cancelled = false;

    const saveAndLoad = async () => {
      // Build and save session
      const session: InterviewSession = {
        id: `interview-${Date.now()}`,
        date: new Date().toISOString(),
        mode,
        score,
        totalQuestions,
        durationSeconds,
        passed,
        endReason,
        results,
      };

      await saveInterviewSession(session);

      // eslint-disable-next-line no-console
      console.debug('[analytics] interview_session_completed', {
        interviewMode: mode,
        languageMode: showBurmese ? 'bilingual' : 'english-only',
        score,
        passed,
        endReason,
      });

      // Record each answer to mastery system
      await Promise.all(
        results.map(r =>
          recordAnswer({
            questionId: r.questionId,
            isCorrect: r.selfGrade === 'correct',
            sessionType: 'test',
          })
        )
      );

      // Load full history for trend chart and comparison
      const history = await getInterviewHistory();

      if (!cancelled) {
        // Previous score (second most recent, since first is the current session)
        if (history.length >= 2) {
          setPreviousScore(history[1].score);
        }

        // Build trend data (oldest first, last 10 sessions)
        const recent = history.slice(0, 10).reverse();
        const data = recent.map(s => ({
          date: new Date(s.date).toLocaleDateString(),
          score: s.score,
        }));
        setTrendData(data);
        setHasSaved(true);
      }
    };

    saveAndLoad().catch(() => {
      // IndexedDB not available - continue without persistence
      if (!cancelled) {
        setHasSaved(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    hasSaved,
    mode,
    score,
    totalQuestions,
    durationSeconds,
    passed,
    endReason,
    results,
    showBurmese,
  ]);

  // --- Pre-generated closing statement audio ---
  useEffect(() => {
    const player = closingPlayerRef.current;
    const timer = setTimeout(() => {
      const { audio } = getClosingStatement(passed);
      const url = getInterviewAudioUrl(audio);
      setIsClosingSpeaking(true);
      player
        .play(url)
        .catch(() => {})
        .finally(() => setIsClosingSpeaking(false));
    }, 1000);

    return () => {
      clearTimeout(timer);
      player.cancel();
      setIsClosingSpeaking(false);
    };
  }, [passed]);

  // --- Confetti + sound for passing ---
  useEffect(() => {
    if (passed) {
      const timer = setTimeout(() => {
        setShowConfetti(true);
        playCompletionSparkle();
      }, 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [passed]);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  // Scroll to transcript section
  const handleScrollToTranscript = useCallback(() => {
    transcriptRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [shouldReduceMotion]);

  // Batch add all incorrect to SRS deck
  const handleAddAllToDeck = useCallback(async () => {
    if (isAddingAll) return;
    setIsAddingAll(true);
    try {
      let added = 0;
      for (const result of incorrectNotInDeck) {
        await addCard(result.questionId);
        added++;
      }
      if (added > 0) {
        showSuccess({
          en: `Added ${added} question${added > 1 ? 's' : ''} to review deck`,
          my: `${added} ခု ပြန်လေ့လာစာရင်းသို့ထည့်ပြီး`,
        });
      }
    } catch {
      // SRS add failure is non-critical
    } finally {
      setIsAddingAll(false);
    }
  }, [isAddingAll, incorrectNotInDeck, addCard, showSuccess]);

  // Score improvement from previous attempt
  const scoreDiff = previousScore !== null ? score - previousScore : null;

  // Recommendation text
  const recommendation = getRecommendation(score, weakestCategory);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto w-full max-w-2xl px-4 py-6">
        {/* Confetti overlay */}
        <Confetti fire={showConfetti} intensity="celebration" onComplete={handleConfettiComplete} />

        {/* Examiner character at top */}
        <FadeIn>
          <div className="mb-4 flex justify-center">
            <ExaminerCharacter state={isClosingSpeaking ? 'speaking' : 'idle'} size="md" />
          </div>
        </FadeIn>

        {/* 1. Pass/Fail Banner with glow */}
        <FadeIn delay={200}>
          <div
            className={clsx(
              'rounded-2xl px-6 py-5 text-center',
              passed
                ? 'bg-gradient-to-br from-success/20 to-success/5 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                : 'bg-gradient-to-br from-warning/20 to-warning/5 shadow-[0_0_30px_rgba(245,158,11,0.15)]'
            )}
          >
            <div className="mb-2 flex items-center justify-center gap-2">
              {passed ? (
                <CheckCircle2 className="h-7 w-7 text-success" />
              ) : (
                <XCircle className="h-7 w-7 text-warning" />
              )}
              <span
                className={clsx('text-2xl font-bold', passed ? 'text-success' : 'text-warning')}
              >
                {passed ? strings.interview.passed.en : strings.interview.failed.en}
              </span>
            </div>
            {showBurmese && (
              <p
                className={clsx(
                  'font-myanmar text-sm',
                  passed ? 'text-success/80' : 'text-warning/80'
                )}
              >
                {passed ? strings.interview.passed.my : strings.interview.failed.my}
              </p>
            )}
            <p className="mt-2 text-sm text-slate-400">
              {END_REASON_TEXT[endReason].en}
              {showBurmese && (
                <span className="ml-1 font-myanmar text-sm">
                  {' \u00B7 '}
                  {END_REASON_TEXT[endReason].my}
                </span>
              )}
            </p>
          </div>
        </FadeIn>

        {/* 2. Animated Score */}
        <FadeIn delay={400}>
          <div className="mt-6 flex justify-center">
            <CountUpScore
              score={score}
              total={totalQuestions || 20}
              size="xl"
              delay={600}
              duration={2}
            />
          </div>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="text-lg text-slate-400">{percentage}%</span>
            {/* Comparison to previous attempt */}
            {scoreDiff !== null && scoreDiff !== 0 && (
              <span
                className={clsx(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                  scoreDiff > 0
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                )}
              >
                {scoreDiff > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {scoreDiff > 0 ? '+' : ''}
                {scoreDiff}
              </span>
            )}
          </div>
        </FadeIn>

        {/* 3. Personalized recommendation */}
        <FadeIn delay={550}>
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-300">{recommendation.en}</p>
            {showBurmese && (
              <p className="mt-0.5 font-myanmar text-sm text-slate-400">{recommendation.my}</p>
            )}
          </div>
        </FadeIn>

        {/* 4. Analytics Section */}
        <FadeIn delay={650}>
          <div className="mt-8">
            <SectionHeading
              text={{
                en: 'Session Analytics',
                my: 'စစ်ဆေးချက်များ',
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              {/* Time taken */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-3" elevated={false}>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">
                    Time
                    {showBurmese && <span className="font-myanmar ml-1">ကြာချိန်</span>}
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-slate-100">
                  {formatDuration(durationSeconds)}
                </p>
              </Card>

              {/* Score fraction */}
              <Card className="bg-slate-800/50 border-slate-700/50 p-3" elevated={false}>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">
                    Score
                    {showBurmese && <span className="font-myanmar ml-1">ရမှတ်</span>}
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-slate-100">
                  {score}/{totalQuestions}
                </p>
              </Card>

              {/* Avg confidence */}
              {confidenceStats && (
                <Card className="bg-slate-800/50 border-slate-700/50 p-3" elevated={false}>
                  <div className="text-xs text-slate-400">
                    Avg Confidence
                    {showBurmese && <span className="font-myanmar ml-1">ပျမ်းမျှယုံကြည်မှု</span>}
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-100">{confidenceStats.avg}%</p>
                  <p className="text-[10px] text-slate-500">
                    {confidenceStats.min}% - {confidenceStats.max}%
                  </p>
                </Card>
              )}

              {/* Previous comparison */}
              {previousScore !== null && (
                <Card className="bg-slate-800/50 border-slate-700/50 p-3" elevated={false}>
                  <div className="text-xs text-slate-400">
                    Previous
                    {showBurmese && <span className="font-myanmar ml-1">ယခင်</span>}
                  </div>
                  <p className="mt-1 text-lg font-bold text-slate-100">
                    {previousScore}/{totalQuestions}
                  </p>
                  {scoreDiff !== null && scoreDiff !== 0 && (
                    <p
                      className={clsx(
                        'text-[10px] font-medium',
                        scoreDiff > 0 ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {scoreDiff > 0 ? '+' : ''}
                      {scoreDiff} from last
                      {showBurmese && <span className="font-myanmar ml-0.5">ယခင်နှင့်</span>}
                    </p>
                  )}
                </Card>
              )}
            </div>
          </div>
        </FadeIn>

        {/* 5. Category Breakdown */}
        <FadeIn delay={750}>
          <div className="mt-8">
            <SectionHeading
              text={{
                en: 'Category Breakdown',
                my: 'အမျိုးအစားခွဲခြမ်းချက်',
              }}
            />
            <div className="space-y-3">
              {(
                Object.entries(categoryBreakdown) as Array<
                  [USCISCategory, { correct: number; total: number }]
                >
              ).map(([category, { correct, total }]) => {
                if (total === 0) return null;
                const color = CATEGORY_COLORS[category];
                const colorClasses = CATEGORY_COLOR_CLASSES[color] ?? CATEGORY_COLOR_CLASSES.blue;
                const pct = Math.round((correct / total) * 100);

                return (
                  <Card
                    key={category}
                    className="bg-slate-800/50 border-slate-700/50 p-4"
                    elevated={false}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                            colorClasses.bg,
                            colorClasses.text
                          )}
                        >
                          {USCIS_CATEGORIES[category].name.en}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-200">
                        {correct}/{total}
                      </span>
                    </div>
                    {showBurmese && (
                      <p className="mb-2 font-myanmar text-xs text-slate-400">
                        {USCIS_CATEGORIES[category].name.my}
                      </p>
                    )}
                    <Progress value={pct} variant={pct >= 60 ? 'success' : 'warning'} size="sm" />
                  </Card>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* 6. Score Trend Chart */}
        <FadeIn delay={900}>
          <div className="mt-8">
            <SectionHeading
              text={{
                en: 'Score Trend',
                my: 'အမှတ်တိုးတက်မှု',
              }}
            />
            {trendData.length >= 2 ? (
              <Card className="bg-slate-800/50 border-slate-700/50 p-4" elevated={false}>
                <div className="h-48 w-full">
                  <ResponsiveContainer>
                    <LineChart data={trendData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={getTokenColor('--color-border', 0.3)}
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={getTokenColor('--color-text-secondary')}
                        fontSize={11}
                      />
                      <YAxis
                        domain={[0, 20]}
                        stroke={getTokenColor('--color-text-secondary')}
                        fontSize={11}
                        tickFormatter={(value: number) => `${value}`}
                      />
                      <Tooltip
                        formatter={value => [`${Number(value)} / 20`, 'Score']}
                        contentStyle={{
                          backgroundColor: getTokenColor('--color-surface'),
                          borderRadius: '1rem',
                          border: `1px solid ${getTokenColor('--color-border')}`,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={getTokenColor('--color-chart-blue')}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700/50 p-4" elevated={false}>
                <p className="text-center text-sm text-slate-400">
                  Complete more interviews to see trends.
                  {showBurmese && (
                    <span className="mt-0.5 block font-myanmar text-sm text-slate-500">
                      လမ်းကြောင်းများကိုကြည့်ရန် နောက်ထပ်အင်တာဗျူးများဖြေဆိုပါ။
                    </span>
                  )}
                </p>
              </Card>
            )}
          </div>
        </FadeIn>

        {/* 7. SRS Batch Offer */}
        {incorrectNotInDeck.length > 0 && (
          <FadeIn delay={1000}>
            <div className="mt-8">
              <Card className="bg-primary/10 border-primary/20 p-4" elevated={false}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      Add {incorrectNotInDeck.length} wrong answer
                      {incorrectNotInDeck.length > 1 ? 's' : ''} to your review deck?
                    </p>
                    {showBurmese && (
                      <p className="mt-0.5 font-myanmar text-sm text-slate-400">
                        မှားယွင်းအဖြေ {incorrectNotInDeck.length} ခုကို ပြန်လေ့လာစာရင်းသို့
                        ထည့်မလား?
                      </p>
                    )}
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleAddAllToDeck}
                    disabled={isAddingAll}
                    whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
                    className={clsx(
                      'inline-flex items-center gap-1.5 rounded-full px-4 py-2',
                      'bg-primary text-white text-sm font-semibold',
                      'transition-opacity',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    {isAddingAll ? 'Adding...' : 'Add All'}
                    {showBurmese && (
                      <span className="font-myanmar ml-1">
                        {isAddingAll ? 'ထည့်နေသည်...' : 'အားလုံးထည့်'}
                      </span>
                    )}
                  </motion.button>
                </div>
              </Card>
            </div>
          </FadeIn>
        )}

        {/* 8. Full Transcript */}
        <FadeIn delay={1100}>
          <div ref={transcriptRef} className="mt-8">
            <SectionHeading
              text={{
                en: 'Interview Transcript',
                my: 'အင်တာဗျူးမှတ်တမ်း',
              }}
            />
            <InterviewTranscript
              results={results}
              mode={mode}
              endReason={endReason}
              earlyTerminationIndex={earlyTerminationIndex}
              showBurmese={showBurmese}
              speedLabel={effectiveSpeedLabel}
            />
          </div>
        </FadeIn>

        {/* 9. Action Buttons */}
        <FadeIn delay={1300}>
          <div className="mt-8 flex flex-col items-center gap-3 pb-8">
            {passed && <ShareButton data={shareCardData} />}
            <BilingualButton
              label={strings.actions.tryAgain}
              variant="chunky"
              onClick={onRetry}
              fullWidth
            />
            <BilingualButton
              label={{
                en: 'Review Transcript',
                my: 'မှတ်တမ်းပြန်ကြည့်ပါ',
              }}
              variant="secondary"
              onClick={handleScrollToTranscript}
              fullWidth
              icon={<ScrollText className="h-4 w-4" />}
            />
            <BilingualButton
              label={
                mode === 'realistic'
                  ? strings.interview.practiceMode
                  : strings.interview.realisticMode
              }
              variant="secondary"
              onClick={() => onSwitchMode(mode === 'realistic' ? 'practice' : 'realistic')}
              fullWidth
              icon={<ArrowRight className="h-4 w-4" />}
            />
            <motion.button
              type="button"
              onClick={() => navigate('/')}
              whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
              className={clsx(
                'mt-2 flex items-center gap-2 rounded-xl px-6 py-3',
                'text-sm font-bold text-slate-400 min-h-[44px]',
                'transition-colors hover:text-slate-200 hover:bg-slate-700/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
            >
              <Home className="h-4 w-4" />
              <span>
                {showBurmese ? (
                  <>
                    Dashboard {'\u00B7'} <span className="font-myanmar">ဒက်ရှ်ဘုတ်</span>
                  </>
                ) : (
                  'Dashboard'
                )}
              </span>
            </motion.button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
