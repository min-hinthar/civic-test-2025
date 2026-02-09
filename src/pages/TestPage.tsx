'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import SpeechButton from '@/components/ui/SpeechButton';
import { fisherYatesShuffle } from '@/lib/shuffle';
import type { Answer, QuestionResult, TestEndReason, TestSession } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/BilingualToast';
import { BilingualHeading, SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Progress } from '@/components/ui/Progress';
import { CircularTimer } from '@/components/test/CircularTimer';
import { PreTestScreen } from '@/components/test/PreTestScreen';
import { AnswerFeedback, getAnswerOptionClasses } from '@/components/test/AnswerFeedback';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { WhyButton } from '@/components/explanations/WhyButton';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import { WeakAreaNudge } from '@/components/nudges/WeakAreaNudge';
import { AddToDeckButton } from '@/components/srs/AddToDeckButton';
import { ShareButton } from '@/components/social/ShareButton';
import { useStreak } from '@/hooks/useStreak';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { detectWeakAreas, getCategoryQuestionIds, USCIS_CATEGORIES } from '@/lib/mastery';
import type { USCISCategory, CategoryMasteryEntry } from '@/lib/mastery';
import { allQuestions } from '@/constants/questions';
import { strings } from '@/lib/i18n/strings';
import { FadeIn } from '@/components/animations/StaggeredList';
import { Filter } from 'lucide-react';
import { playCorrect, playIncorrect, playLevelUp, playMilestone } from '@/lib/audio/soundEffects';

const TEST_DURATION_SECONDS = 20 * 60;
const PASS_THRESHOLD = 12;
const INCORRECT_LIMIT = 9;
const FEEDBACK_DELAY_MS = 1500;

const TestPage = () => {
  const { saveTestSession } = useAuth();
  const navigate = useNavigate();
  const { categoryMasteries } = useCategoryMastery();
  const { currentStreak } = useStreak();
  const shouldReduceMotion = useReducedMotion();
  const { showSuccess, showWarning } = useToast();
  const [showPreTest, setShowPreTest] = useState(true);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [endReason, setEndReason] = useState<TestEndReason | null>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [explanationExpanded, setExplanationExpanded] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef<QuestionResult | null>(null);
  const hasSavedSessionRef = useRef(false);
  const lockMessage =
    'စမ်းသပ်စာမေးပွဲ မေးခွန်းများပြီးဆုံးစွာ ဖြေဆိုပြီးမှထွက်ပါ · Complete the mock test before leaving · ';

  const questions = useMemo(
    () =>
      fisherYatesShuffle(allQuestions)
        .slice(0, 20)
        .map(question => ({
          ...question,
          answers: fisherYatesShuffle(question.answers),
        })),
    []
  );
  // Map questionId -> Question for explanation lookup in review screen
  const questionsById = useMemo(() => new Map(questions.map(q => [q.id, q])), [questions]);
  const currentQuestion = !isFinished ? questions[currentIndex] : null;
  const questionAudioText = currentQuestion?.question_en ?? '';
  const answerChoicesAudioText =
    currentQuestion?.answers?.map(answer => answer.text_en).join('. ') ?? '';

  const answeredQuestions = results.length;
  const progressPercent = Math.round((answeredQuestions / questions.length) * 100);

  const correctCount = results.filter(result => result.isCorrect).length;
  const askedCount = results.length;
  const incorrectCount = askedCount - correctCount;

  // Share card data for social sharing (only when test is complete)
  const shareCardData: ShareCardData | null = useMemo(() => {
    if (!isFinished || correctCount < PASS_THRESHOLD) return null;

    // Build category breakdown from results
    const catMap: Record<string, { correct: number; total: number }> = {};
    for (const r of results) {
      if (!catMap[r.category]) catMap[r.category] = { correct: 0, total: 0 };
      catMap[r.category].total += 1;
      if (r.isCorrect) catMap[r.category].correct += 1;
    }

    return {
      score: correctCount,
      total: askedCount,
      sessionType: 'test',
      streak: currentStreak,
      topBadge: null,
      categories: Object.entries(catMap).map(([name, stats]) => ({
        name,
        correct: stats.correct,
        total: stats.total,
      })),
      date: new Date().toISOString(),
    };
  }, [isFinished, correctCount, askedCount, results, currentStreak]);

  const completionMessage: Record<TestEndReason, { en: string; my: string }> = {
    passThreshold: {
      en: 'USCIS interview stops after 12 correct answers. Great job reaching the passing threshold early!',
      my: 'အဖြေမှန် ၁၂ ချက်ဖြေဆိုပြီးလျှင်ရပ်တန့်ပါတယ်။ စောစီးအောင်မြင်စွာဖြေဆိုနိုင်သည်ကို ဂုဏ်ယူလိုက်ပါ။',
    },
    failThreshold: {
      en: 'Interview ended after 9 incorrect answers. Review the feedback below before retrying.',
      my: 'အမှား ၉ ကြိမ်ဖြေဆိုပြီးနောက်ရပ်တန့်လိုက်ပါတယ်။ ထပ်မံကြိုးစားရန် ဖြေဆိုချက်များကိုပြန်လည်သုံးသပ်ပါ။',
    },
    time: {
      en: 'Time expired before the full set finished.',
      my: '',
    },
    complete: {
      en: 'You completed all 20 questions.',
      my: '',
    },
  };

  const processResult = useCallback(
    (result: QuestionResult) => {
      const nextResults = [...results, result];
      const nextCorrect = nextResults.filter(item => item.isCorrect).length;
      const nextIncorrect = nextResults.length - nextCorrect;
      const answeredAll = nextResults.length === questions.length;
      const reachedPass = nextCorrect >= PASS_THRESHOLD;
      const reachedFail = nextIncorrect >= INCORRECT_LIMIT;

      setResults(nextResults);

      if (reachedPass || reachedFail) {
        setIsFinished(true);
        setEndReason(reachedPass ? 'passThreshold' : 'failThreshold');
      } else if (answeredAll) {
        setIsFinished(true);
        setEndReason('complete');
      } else {
        setCurrentIndex(prevIndex => Math.min(prevIndex + 1, questions.length - 1));
      }
    },
    [questions.length, results]
  );

  const advanceToNext = useCallback(() => {
    const result = pendingResultRef.current;
    if (!result) return;
    pendingResultRef.current = null;
    setShowFeedback(false);
    setSelectedAnswer(null);
    setExplanationExpanded(false);
    processResult(result);
  }, [processResult]);

  const handleAnswerSelect = useCallback(
    (answer: Answer) => {
      if (!currentQuestion || isFinished || showFeedback) return;

      setSelectedAnswer(answer);
      setShowFeedback(true);
      setExplanationExpanded(false);

      // Play sound in event handler (React Compiler safe)
      if (answer.correct) {
        playCorrect();
      } else {
        playIncorrect();
      }

      const correctAnswer = currentQuestion.answers.find(ans => ans.correct)!;
      const result: QuestionResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        selectedAnswer: answer,
        correctAnswer,
        isCorrect: answer.correct,
        category: currentQuestion.category,
      };

      pendingResultRef.current = result;

      // Fire-and-forget: record answer to mastery store
      recordAnswer({
        questionId: currentQuestion.id,
        isCorrect: answer.correct,
        sessionType: 'test',
      });

      // Delay before moving to next question to show feedback
      feedbackTimeoutRef.current = setTimeout(() => {
        feedbackTimeoutRef.current = null;
        advanceToNext();
      }, FEEDBACK_DELAY_MS);
    },
    [currentQuestion, isFinished, showFeedback, advanceToNext]
  );

  const handleExplanationExpandChange = useCallback((expanded: boolean) => {
    setExplanationExpanded(expanded);
    if (expanded && feedbackTimeoutRef.current) {
      // Pause auto-advance when user expands explanation
      clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
  }, []);

  // Handler for results celebration sound
  const handleScoreCountComplete = useCallback(() => {
    setShowConfetti(true);
    if (correctCount >= PASS_THRESHOLD) {
      playMilestone();
    } else {
      playLevelUp();
    }
  }, [correctCount]);

  // Timer countdown
  useEffect(() => {
    if (isFinished || showPreTest) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setEndReason(current => current ?? 'time');
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, showPreTest]);

  // Navigation lock — throttle history API to stay under browser's 100/10s limit
  useEffect(() => {
    if (isFinished || showPreTest) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    let lastWarningTime = 0;
    const handlePopState = () => {
      try {
        window.history.pushState(null, '', window.location.href);
      } catch {
        // SecurityError: browser rate limit exceeded — earlier pushState calls
        // already have guard entries in the history stack, so navigation is still blocked
      }
      const now = Date.now();
      if (now - lastWarningTime > 3000) {
        lastWarningTime = now;
        showWarning({
          en: 'Please finish the mock test first!',
          my: 'စမ်းသပ်စာမေးပွဲ မေးခွန်းများပြီးဆုံးစွာ ဖြေဆိုပြီးမှထွက်ပါ',
        });
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFinished, showPreTest, showWarning]);

  // Save session on finish
  useEffect(() => {
    if (!isFinished || !results.length || hasSavedSessionRef.current) return;
    hasSavedSessionRef.current = true;
    const correctAnswers = results.filter(result => result.isCorrect).length;
    const incorrectAnswers = results.length - correctAnswers;
    const completedFullSet = results.length === questions.length;
    const fallbackReason: TestEndReason = endReason ?? (completedFullSet ? 'complete' : 'time');
    const session: Omit<TestSession, 'id'> = {
      date: new Date().toISOString(),
      score: correctAnswers,
      totalQuestions: results.length,
      durationSeconds: TEST_DURATION_SECONDS - timeLeft,
      passed: correctAnswers >= PASS_THRESHOLD,
      incorrectCount: incorrectAnswers,
      endReason: fallbackReason,
      results,
    };
    const persist = async () => {
      try {
        await saveTestSession(session);
        showSuccess({
          en: `Mock test saved — ${correctAnswers} correct answers`,
          my: `စမ်းသပ်စာမေးပွဲ သိမ်းဆည်းပြီး — အဖြေမှန် ${correctAnswers} ခု`,
        });
      } catch (error) {
        console.error(error);
        hasSavedSessionRef.current = false;
        showWarning({
          en: 'Unable to save test — please check your connection',
          my: 'စာမေးပွဲ သိမ်းဆည်းမရပါ — ချိတ်ဆက်မှုကို စစ်ဆေးပါ',
        });
      }
    };
    persist();
  }, [
    endReason,
    isFinished,
    questions.length,
    results,
    saveTestSession,
    showSuccess,
    showWarning,
    timeLeft,
  ]);

  // Scroll to top on finish
  useEffect(() => {
    if (isFinished) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isFinished]);

  // Pre-test screen
  if (showPreTest) {
    return (
      <div className="page-shell" data-tour="mock-test">
        <AppNavigation />
        <PreTestScreen
          questionCount={20}
          durationMinutes={20}
          onReady={() => setShowPreTest(false)}
        />
      </div>
    );
  }

  if (!currentQuestion && !isFinished) {
    return (
      <div className="page-shell" data-tour="mock-test">
        <AppNavigation locked lockMessage={lockMessage} />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
          Preparing your next question...
        </div>
      </div>
    );
  }

  const activeView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
      {/* Horizontal progress bar at top with timer alongside */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Question {currentIndex + 1} / {questions.length}
            </p>
            <p className="text-xs text-muted-foreground">{answeredQuestions} answered</p>
          </div>
          <Progress value={progressPercent} size="lg" />
        </div>
        {/* Compact circular timer alongside progress */}
        <div className="shrink-0">
          <CircularTimer
            duration={TEST_DURATION_SECONDS}
            remainingTime={timeLeft}
            size="sm"
            allowHide
          />
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
        {/* Question area */}
        <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
            {currentQuestion?.category}
          </p>
          <p className="mt-2 text-lg font-bold text-foreground leading-snug">
            {currentQuestion?.question_en}
          </p>
          <p className="mt-2 text-base text-muted-foreground font-myanmar leading-relaxed">
            {currentQuestion?.question_my}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SpeechButton
              text={questionAudioText}
              label="Play Test Question"
              ariaLabel="Play English test question audio"
            />
            <SpeechButton
              text={answerChoicesAudioText}
              label="Play Answer Choices"
              ariaLabel="Play English answer choices audio"
            />
          </div>
        </div>

        {/* Answer options as 3D chunky buttons */}
        <div className="mt-6 grid gap-3">
          {currentQuestion?.answers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isAnswered = showFeedback;

            // 3D chunky styles for unanswered state
            const chunkyBase = !isAnswered
              ? clsx(
                  'rounded-2xl border-2 px-5 py-4 text-left w-full min-h-[56px]',
                  'font-semibold transition-all duration-100',
                  'shadow-[0_4px_0_hsl(var(--border))] active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[3px]',
                  'hover:border-primary-400 hover:bg-primary-subtle/50 hover:shadow-[0_4px_0_hsl(var(--primary-600))]',
                  '',
                  isSelected
                    ? 'border-primary bg-primary-subtle shadow-[0_4px_0_hsl(var(--primary-600))]'
                    : 'border-border bg-card'
                )
              : undefined;

            // When answered, use getAnswerOptionClasses for correct/incorrect coloring
            const answeredClasses = isAnswered
              ? clsx(
                  getAnswerOptionClasses(isSelected, answer.correct, true),
                  'w-full min-h-[56px] py-4 px-5 text-left'
                )
              : undefined;

            return (
              <motion.button
                key={answer.text_en}
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : { delay: index * 0.05 }}
                onClick={() => handleAnswerSelect(answer)}
                disabled={showFeedback}
                className={chunkyBase ?? answeredClasses}
              >
                <span className="font-bold block text-foreground">{answer.text_en}</span>
                <span className="font-myanmar text-muted-foreground block text-sm mt-0.5">
                  {answer.text_my}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Answer feedback with animated icons */}
        <div className="mt-4">
          <AnswerFeedback
            isCorrect={selectedAnswer?.correct ?? false}
            show={showFeedback}
            correctAnswer={currentQuestion?.answers.find(a => a.correct)?.text_en}
            correctAnswerMy={currentQuestion?.answers.find(a => a.correct)?.text_my}
          />
        </div>

        {/* WhyButton inline explanation (only when feedback shown and explanation exists) */}
        {showFeedback && currentQuestion?.explanation && (
          <div className="mt-3">
            <WhyButton
              explanation={currentQuestion.explanation}
              isCorrect={selectedAnswer?.correct}
              compact
              onExpandChange={handleExplanationExpandChange}
            />
            {/* Show "Next" button when explanation is expanded (auto-advance paused) */}
            {explanationExpanded && (
              <button
                onClick={advanceToNext}
                className={clsx(
                  'mt-3 flex w-full items-center justify-center gap-2',
                  'min-h-[48px] rounded-xl px-4 py-2.5',
                  'bg-primary text-primary-foreground font-bold',
                  'shadow-[0_4px_0_hsl(var(--primary-700))] active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]',
                  'transition-[box-shadow,transform] duration-100'
                )}
              >
                {strings.actions.next.en}
                <span className="font-myanmar text-xs">{strings.actions.next.my}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Progress summary */}
        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="text-success font-bold">{correctCount} correct</span>
            <span className="text-warning font-bold">{incorrectCount} incorrect</span>
          </div>
          <p className="text-xs text-muted-foreground">12 correct or 9 incorrect ends the test</p>
        </div>
      </div>
    </div>
  );

  const resultView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <Confetti
        fire={showConfetti}
        intensity={correctCount >= PASS_THRESHOLD ? 'celebration' : 'burst'}
      />

      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
        {/* Results header with trophy */}
        <div className="text-center py-8">
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }
            }
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-subtle"
          >
            <Trophy
              className={clsx(
                'h-8 w-8',
                correctCount >= PASS_THRESHOLD ? 'text-success' : 'text-warning'
              )}
            />
          </motion.div>

          <BilingualHeading
            text={strings.test.testComplete}
            level={1}
            size="2xl"
            centered
            className="mb-6"
          />
          <CountUpScore
            score={correctCount}
            total={askedCount}
            onComplete={handleScoreCountComplete}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
          <div>
            <p className="text-muted-foreground">
              Review your answers and retake the mock test anytime.
            </p>
            {endReason && (
              <p className="mt-2 text-sm font-semibold text-primary">
                {completionMessage[endReason].en}
                {completionMessage[endReason].my && (
                  <span className="block font-myanmar mt-0.5 font-normal text-muted-foreground">
                    {completionMessage[endReason].my}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <BilingualButton
              label={strings.actions.back}
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            />
            <BilingualButton
              label={strings.actions.tryAgain}
              variant="chunky"
              size="sm"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={() => window.location.reload()}
            />
            {shareCardData && <ShareButton data={shareCardData} />}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Duration</p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round((TEST_DURATION_SECONDS - timeLeft) / 60)} mins
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Correct</p>
            <p className="text-2xl font-bold text-success">{correctCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Incorrect</p>
            <p className="text-2xl font-bold text-warning">{incorrectCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
            <p
              className={clsx(
                'text-2xl font-bold',
                correctCount >= PASS_THRESHOLD ? 'text-success' : 'text-warning'
              )}
            >
              {correctCount >= PASS_THRESHOLD ? 'Pass' : 'Review'}
            </p>
          </div>
        </div>

        {/* Filter toggle */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
              <button
                onClick={() => setShowAllResults(false)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  !showAllResults
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {strings.test.incorrectOnly.en}
                <span className="ml-1 font-myanmar">{strings.test.incorrectOnly.my}</span>
              </button>
              <button
                onClick={() => setShowAllResults(true)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  showAllResults
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {strings.test.showAll.en}
                <span className="ml-1 font-myanmar">{strings.test.showAll.my}</span>
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {strings.test.showing.en}{' '}
            {showAllResults ? results.length : results.filter(r => !r.isCorrect).length}{' '}
            {strings.test.ofQuestions.en} {results.length} {strings.test.questions.en}
          </p>
        </div>

        {/* Post-test weak area nudge */}
        {(() => {
          const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
          const entries: CategoryMasteryEntry[] = categories.map(cat => ({
            categoryId: cat,
            mastery: categoryMasteries[cat] ?? 0,
            questionCount: getCategoryQuestionIds(cat, allQuestions).length,
          }));
          const weak = detectWeakAreas(entries, 60).slice(0, 2);
          if (weak.length === 0) return null;

          return (
            <FadeIn delay={400}>
              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-4">
                <SectionHeading
                  text={{
                    en: 'Based on this test, consider reviewing:',
                    my: 'ဒီစာမေးပွဲအပေါ်အခြေခံ၍ ပြန်လည်လေ့လာရန်:',
                  }}
                  className="mb-3"
                />
                <div className="space-y-3">
                  {weak.map(w => (
                    <WeakAreaNudge
                      key={w.categoryId}
                      category={w.categoryId}
                      mastery={w.mastery}
                      isUnattempted={w.mastery === 0}
                      onPractice={() =>
                        navigate(`/practice?category=${encodeURIComponent(w.categoryId)}`)
                      }
                      onReview={() =>
                        navigate(`/study#category-${encodeURIComponent(w.categoryId)}`)
                      }
                    />
                  ))}
                </div>
              </div>
            </FadeIn>
          );
        })()}

        {/* Result cards */}
        <div className="mt-4 space-y-6">
          {(showAllResults ? results : results.filter(r => !r.isCorrect)).map(result => {
            const questionData = questionsById.get(result.questionId);
            const explanation = questionData?.explanation;

            return (
              <div
                key={result.questionId}
                className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
                <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                  {result.questionText_my}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <SpeechButton
                    text={result.questionText_en}
                    label="Play English question"
                    ariaLabel={`Play English question audio for ${result.questionText_en}`}
                  />
                  <SpeechButton
                    text={result.correctAnswer.text_en}
                    label="Play official answer"
                    ariaLabel={`Play English official answer for ${result.questionText_en}`}
                  />
                  <AddToDeckButton questionId={result.questionId} compact />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div
                    className={clsx(
                      'rounded-2xl border p-3',
                      result.isCorrect
                        ? 'border-success/30 bg-success-subtle'
                        : 'border-warning/30 bg-warning-subtle'
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {strings.test.yourAnswer.en} ·{' '}
                      <span className="font-myanmar">{strings.test.yourAnswer.my}</span>
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {result.selectedAnswer.text_en}
                    </p>
                    <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                      {result.selectedAnswer.text_my}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {strings.test.correctAnswer.en} ·{' '}
                      <span className="font-myanmar">{strings.test.correctAnswer.my}</span>
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {result.correctAnswer.text_en}
                    </p>
                    <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                      {result.correctAnswer.text_my}
                    </p>
                  </div>
                </div>
                <p
                  className={clsx(
                    'mt-3 text-sm font-semibold',
                    result.isCorrect ? 'text-success' : 'text-warning'
                  )}
                >
                  {result.isCorrect
                    ? `${strings.test.correct.en} · ${strings.test.correct.my}`
                    : `${strings.test.reviewAnswer.en} · ${strings.test.reviewAnswer.my}`}
                </p>

                {/* Explanation card for review */}
                {explanation && (
                  <div className="mt-3">
                    <ExplanationCard
                      explanation={explanation}
                      isCorrect={result.isCorrect}
                      defaultExpanded={!result.isCorrect}
                      allQuestions={questions}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-shell" data-tour="mock-test">
      <AppNavigation locked={!isFinished} lockMessage={lockMessage} />
      {isFinished ? resultView : activeView}
    </div>
  );
};

export default TestPage;
