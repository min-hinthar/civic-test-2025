'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { CheckCircle2, XCircle, ArrowRight, Home } from 'lucide-react';
import { clsx } from 'clsx';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { WhyButton } from '@/components/explanations/WhyButton';
import { FadeIn } from '@/components/animations/StaggeredList';
import { ShareButton } from '@/components/social/ShareButton';
import { useInterviewTTS } from '@/hooks/useInterviewTTS';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useStreak } from '@/hooks/useStreak';
import { saveInterviewSession, getInterviewHistory } from '@/lib/interview/interviewStore';
import { getClosingStatement } from '@/lib/interview/interviewGreetings';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { USCIS_CATEGORIES, CATEGORY_COLORS, getUSCISCategory } from '@/lib/mastery/categoryMapping';
import type { USCISCategory } from '@/lib/mastery/categoryMapping';
import { allQuestions } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import type { InterviewMode, InterviewResult, InterviewEndReason, InterviewSession } from '@/types';

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

/** Color classes for each USCIS category */
const CATEGORY_COLOR_CLASSES: Record<string, { bg: string; text: string; bar: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
    bar: 'default' as const,
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
    bar: 'warning' as const,
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
    bar: 'success' as const,
  },
};

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
}

/**
 * Interview results screen with full analysis, trend chart, mastery integration.
 *
 * Features:
 * - Pass/fail banner with animated score
 * - Confetti celebration for passing
 * - Category breakdown by USCIS main categories
 * - Trend chart showing score history (recharts LineChart)
 * - Incorrect question review with WhyButton explanations
 * - Retry and mode-switch actions
 * - Saves session to IndexedDB and updates mastery system on mount
 * - TTS closing statement from interviewer avatar
 */
export function InterviewResults({
  results,
  mode,
  durationSeconds,
  endReason,
  onRetry,
  onSwitchMode,
}: InterviewResultsProps) {
  const navigate = useNavigate();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { speakWithCallback, cancel: cancelTTS, isSpeaking } = useInterviewTTS();
  const { currentStreak } = useStreak();

  const [showConfetti, setShowConfetti] = useState(false);
  const [trendData, setTrendData] = useState<Array<{ date: string; score: number }>>([]);
  const [hasSaved, setHasSaved] = useState(false);

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

  // Incorrect questions
  const incorrectResults = useMemo(
    () => results.filter(r => r.selfGrade === 'incorrect'),
    [results]
  );

  // Questions lookup map for explanation data
  const questionsById = useMemo(() => {
    const map = new Map(allQuestions.map(q => [q.id, q]));
    return map;
  }, []);

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

      // Load full history for trend chart
      const history = await getInterviewHistory();

      if (!cancelled) {
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
  }, [hasSaved, mode, score, totalQuestions, durationSeconds, passed, endReason, results]);

  // --- TTS closing statement ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const closing = getClosingStatement(passed);
      speakWithCallback(closing);
    }, 1000);

    return () => {
      clearTimeout(timer);
      cancelTTS();
    };
  }, [passed, speakWithCallback, cancelTTS]);

  // --- Confetti for passing ---
  useEffect(() => {
    if (passed) {
      const timer = setTimeout(() => setShowConfetti(true), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [passed]);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  // --- Render ---
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Confetti overlay */}
      <Confetti fire={showConfetti} intensity="celebration" onComplete={handleConfettiComplete} />

      {/* Interviewer avatar with TTS */}
      <FadeIn>
        <div className="mb-6 flex justify-center">
          <InterviewerAvatar size={64} isSpeaking={isSpeaking} />
        </div>
      </FadeIn>

      {/* 1. Pass/Fail Banner */}
      <FadeIn delay={200}>
        <div
          className={clsx(
            'rounded-2xl px-6 py-5 text-center',
            passed
              ? 'bg-gradient-to-br from-success-50 to-success-100/60 dark:from-success-500/15 dark:to-success-500/5'
              : 'bg-gradient-to-br from-warning-50 to-warning-100/60 dark:from-warning-500/15 dark:to-warning-500/5'
          )}
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            {passed ? (
              <CheckCircle2 className="h-7 w-7 text-success-500" />
            ) : (
              <XCircle className="h-7 w-7 text-warning-500" />
            )}
            <span
              className={clsx(
                'text-2xl font-bold',
                passed
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-warning-600 dark:text-warning-400'
              )}
            >
              {passed ? strings.interview.passed.en : strings.interview.failed.en}
            </span>
          </div>
          {showBurmese && (
            <p
              className={clsx(
                'font-myanmar text-sm',
                passed
                  ? 'text-success-600/80 dark:text-success-400/80'
                  : 'text-warning-600/80 dark:text-warning-400/80'
              )}
            >
              {passed ? strings.interview.passed.my : strings.interview.failed.my}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {END_REASON_TEXT[endReason].en}
            {showBurmese && (
              <span className="ml-1 font-myanmar text-xs">· {END_REASON_TEXT[endReason].my}</span>
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
        <div className="mt-1 text-center">
          <span className="text-lg text-muted-foreground">{percentage}%</span>
        </div>
      </FadeIn>

      {/* 3. Encouragement for failing */}
      {!passed && (
        <FadeIn delay={600}>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t give up! Each attempt helps you learn.
              {showBurmese && (
                <span className="mt-0.5 block font-myanmar text-xs">
                  အားမလျှော့ပါနဲ့! ကြိုးစားမှုတိုင်းက သင်ယူမှုကိုကူညီပါတယ်။
                </span>
              )}
            </p>
          </div>
        </FadeIn>
      )}

      {/* 4. Category Breakdown */}
      <FadeIn delay={700}>
        <div className="mt-8">
          <SectionHeading
            text={{ en: 'Category Breakdown', my: 'အမျိုးအစားအလိုက်ခွဲခြမ်းစိတ်ဖြာမှု' }}
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
                <Card key={category} className="p-4" elevated={false}>
                  <div className="flex items-center justify-between mb-2">
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
                    <span className="text-sm font-semibold text-foreground">
                      {correct}/{total}
                    </span>
                  </div>
                  {showBurmese && (
                    <p className="mb-2 font-myanmar text-xs text-muted-foreground">
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

      {/* 5. Trend Chart */}
      <FadeIn delay={900}>
        <div className="mt-8">
          <SectionHeading text={{ en: 'Score Trend', my: 'အမှတ်တိုးတက်မှု' }} />
          {trendData.length >= 2 ? (
            <Card className="p-4" elevated={false}>
              <div className="h-48 w-full">
                <ResponsiveContainer>
                  <LineChart data={trendData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      domain={[0, 20]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(value: number) => `${value}`}
                    />
                    <Tooltip
                      formatter={value => [`${Number(value)} / 20`, 'Score']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderRadius: '1rem',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ) : (
            <Card className="p-4" elevated={false}>
              <p className="text-center text-sm text-muted-foreground">
                Complete more interviews to see trends.
                {showBurmese && (
                  <span className="mt-0.5 block font-myanmar text-xs">
                    လမ်းကြောင်းများကိုကြည့်ရန် နောက်ထပ်အင်တာဗျူးများဖြေဆိုပါ။
                  </span>
                )}
              </p>
            </Card>
          )}
        </div>
      </FadeIn>

      {/* 6. Incorrect Questions Review */}
      {incorrectResults.length > 0 && (
        <FadeIn delay={1100}>
          <div className="mt-8">
            <SectionHeading
              text={{ en: 'Review Incorrect Answers', my: 'မှားယွင်းသောအဖြေများကိုပြန်ကြည့်ပါ' }}
            />
            <div className="space-y-3">
              {incorrectResults.map(result => {
                const question = questionsById.get(result.questionId);
                return (
                  <Card key={result.questionId} className="p-4" elevated={false}>
                    <p className="text-sm font-semibold text-foreground">
                      {result.questionText_en}
                    </p>
                    {showBurmese && (
                      <p className="mt-0.5 font-myanmar text-xs text-muted-foreground">
                        {result.questionText_my}
                      </p>
                    )}
                    {/* Correct answers */}
                    <div className="mt-2">
                      <span className="text-xs font-semibold text-success-500">
                        {strings.interview.correct.en}:
                      </span>
                      <p className="text-sm text-foreground">
                        {result.correctAnswers.map(a => a.text_en).join('; ')}
                      </p>
                    </div>
                    {/* WhyButton explanation */}
                    {question?.explanation && (
                      <div className="mt-3">
                        <WhyButton
                          explanation={question.explanation}
                          isCorrect={false}
                          compact
                          allQuestions={allQuestions}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        </FadeIn>
      )}

      {/* 7. Action Buttons - 3D chunky Duolingo treatment */}
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
              'text-sm font-bold text-muted-foreground min-h-[44px]',
              'transition-colors hover:text-foreground hover:bg-muted/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <Home className="h-4 w-4" />
            <span>
              {showBurmese ? (
                <>
                  Dashboard ·{' '}
                  <span className="font-myanmar">
                    {'\u1012\u1000\u103A\u101B\u103E\u103A\u1018\u102F\u1010\u103A'}
                  </span>
                </>
              ) : (
                'Dashboard'
              )}
            </span>
          </motion.button>
        </div>
      </FadeIn>
    </div>
  );
}
