'use client';

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import AppNavigation from '@/components/AppNavigation';
import SpeechButton from '@/components/ui/SpeechButton';
import { civicsQuestions } from '@/constants/civicsQuestions';
import { fisherYatesShuffle } from '@/lib/shuffle';
import type { Answer, QuestionResult, TestEndReason, TestSession } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Progress } from '@/components/ui/Progress';
import { CircularTimer } from '@/components/test/CircularTimer';
import { PreTestScreen } from '@/components/test/PreTestScreen';
import { AnswerFeedback, getAnswerOptionClasses } from '@/components/test/AnswerFeedback';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { WhyButton } from '@/components/explanations/WhyButton';
import { recordAnswer } from '@/lib/mastery/masteryStore';
import { strings } from '@/lib/i18n/strings';

const TEST_DURATION_SECONDS = 20 * 60;
const PASS_THRESHOLD = 12;
const INCORRECT_LIMIT = 9;
const FEEDBACK_DELAY_MS = 1500;

const TestPage = () => {
  const { saveTestSession } = useAuth();
  const navigate = useNavigate();
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
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef<QuestionResult | null>(null);
  const hasSavedSessionRef = useRef(false);
  const lockMessage =
    'စမ်းသပ်စာမေးပွဲ မေးခွန်းများပြီးဆုံးစွာ ဖြေဆိုပြီးမှထွက်ပါ · Complete the mock test before leaving · ';

  const questions = useMemo(
    () =>
      fisherYatesShuffle(civicsQuestions)
        .slice(0, 20)
        .map(question => ({
          ...question,
          answers: fisherYatesShuffle(question.answers),
        })),
    []
  );
  const currentQuestion = !isFinished ? questions[currentIndex] : null;
  const questionAudioText = currentQuestion?.question_en ?? '';
  const answerChoicesAudioText =
    currentQuestion?.answers?.map(answer => answer.text_en).join('. ') ?? '';

  const answeredQuestions = results.length;
  const progressPercent = Math.round((answeredQuestions / questions.length) * 100);

  const correctCount = results.filter(result => result.isCorrect).length;
  const askedCount = results.length;
  const incorrectCount = askedCount - correctCount;
  const completionMessage: Record<TestEndReason, string> = {
    passThreshold:
      'USCIS interview stops after 12 correct answers. Great job reaching the passing threshold early! အဖြေမှန် ၁၂ ချက်ဖြေဆိုပြီးလျှင်ရပ်တန့်ပါတယ်။ စောစီးအောင်မြင်စွာဖြေဆိုနိုင်သည်ကို ဂုဏ်ယူလိုက်ပါ။',
    failThreshold:
      'Interview ended after 9 incorrect answers. Review the feedback below before retrying. - အမှား ၉ ကြိမ်ဖြေဆိုပြီးနောက်ရပ်တန့်လိုက်ပါတယ်။ ထပ်မံကြိုးစားရန် ဖြေဆိုချက်များကိုပြန်လည်သုံးသပ်ပါ။',
    time: 'Time expired before the full set finished.',
    complete: 'You completed all 20 questions.',
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

  const handleExplanationExpandChange = useCallback(
    (expanded: boolean) => {
      setExplanationExpanded(expanded);
      if (expanded && feedbackTimeoutRef.current) {
        // Pause auto-advance when user expands explanation
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
    },
    []
  );

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

  // Navigation lock
  useEffect(() => {
    if (isFinished || showPreTest) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    const handlePopState = () => {
      window.history.replaceState(null, '', window.location.href);
      toast({
        title: 'Please finish the mock test first!',
        description: lockMessage,
        variant: 'destructive',
      });
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isFinished, lockMessage, showPreTest]);

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
        toast({
          title: 'Mock test saved',
          description: `You answered ${correctAnswers} questions correctly.`,
        });
      } catch (error) {
        console.error(error);
        hasSavedSessionRef.current = false;
        toast({
          title: 'Unable to save test',
          description: 'Please check your connection and try again.',
          variant: 'destructive',
        });
      }
    };
    persist();
  }, [endReason, isFinished, questions.length, results, saveTestSession, timeLeft]);

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
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <div className="glass-panel p-6 shadow-2xl shadow-primary/20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              Mock Test · စမ်းသပ်စာမေးပွဲ
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              Question {currentIndex + 1}{' '}
              <span className="text-muted-foreground">/ {questions.length}</span>
            </h1>
          </div>

          {/* Circular Timer */}
          <CircularTimer duration={TEST_DURATION_SECONDS} remainingTime={timeLeft} allowHide />

          <div className="w-full rounded-2xl border border-border bg-card/80 p-6 lg:w-64">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Test Progress · <span className="font-myanmar">စာမေးပွဲပြီးဆုံးရန်</span>
            </p>
            <div className="mt-2">
              <Progress value={progressPercent} size="sm" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Answered {answeredQuestions} of {questions.length}
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              <span className="font-myanmar">
                အဖြေမှန် ၁၂ ခု သို့မဟုတ် အဖြေမှား ၉ ခု ဖြေပြီးလျှင် စာမေးပွဲပြီးဆုံးစေပါမည်။
              </span>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Interview ends early after 12 correct or 9 incorrect answers.
            </p>
          </div>
        </div>

        {/* Question area */}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-border/50 bg-muted/30 p-6">
            <p className="mt-1 text-sm text-muted-foreground">{currentQuestion?.category}</p>
            <p className="text-lg font-semibold text-foreground">{currentQuestion?.question_en}</p>
            <p className="mt-3 text-base text-muted-foreground font-myanmar leading-relaxed">
              {currentQuestion?.question_my}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
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
        </div>

        {/* Answer options with getAnswerOptionClasses */}
        <div className="mt-8 grid gap-4">
          {currentQuestion?.answers.map(answer => (
            <button
              key={answer.text_en}
              onClick={() => handleAnswerSelect(answer)}
              disabled={showFeedback}
              className={clsx(
                getAnswerOptionClasses(
                  selectedAnswer === answer,
                  showFeedback ? answer.correct : null,
                  showFeedback
                ),
                'w-full min-h-[44px] py-3 px-4 text-left space-y-1'
              )}
            >
              <span className="font-semibold block">{answer.text_en}</span>
              <span className="font-myanmar text-muted-foreground block text-sm">
                {answer.text_my}
              </span>
            </button>
          ))}
        </div>

        {/* Answer feedback */}
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
                  'min-h-[44px] rounded-xl border border-primary-500/30 bg-primary-50 px-4 py-2.5',
                  'text-sm font-semibold text-primary-600',
                  'transition-colors duration-150 hover:bg-primary-100',
                  'dark:bg-primary-500/10 dark:text-primary-400 dark:hover:bg-primary-500/20'
                )}
              >
                {strings.actions.next.en}
                <span className="font-myanmar text-xs">{strings.actions.next.my}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Tap an answer to move to the next question.
        </p>
      </div>
    </div>
  );

  const resultView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <Confetti
        fire={showConfetti}
        intensity={correctCount >= PASS_THRESHOLD ? 'celebration' : 'burst'}
      />

      <div className="glass-panel p-6 shadow-2xl shadow-primary/20">
        <div className="text-center py-8">
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
            onComplete={() => setShowConfetti(true)}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
          <div>
            <p className="text-muted-foreground">
              Review your answers and retake the mock test anytime.
            </p>
            {endReason && (
              <p className="mt-2 text-sm font-semibold text-primary">
                {completionMessage[endReason]}
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
              variant="primary"
              size="sm"
              icon={<Sparkles className="h-4 w-4" />}
              onClick={() => window.location.reload()}
            />
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
            <p className="text-2xl font-bold text-success-500">{correctCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Incorrect</p>
            <p className="text-2xl font-bold text-warning-500">{incorrectCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Status</p>
            <p
              className={clsx(
                'text-2xl font-bold',
                correctCount >= PASS_THRESHOLD ? 'text-success-500' : 'text-warning-500'
              )}
            >
              {correctCount >= PASS_THRESHOLD ? 'Pass' : 'Review'}
            </p>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          {results.map(result => (
            <div
              key={result.questionId}
              className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
              <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                {result.questionText_my}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
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
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Your answer · <span className="font-myanmar">အဖြေ</span>
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
                    Official answer · <span className="font-myanmar">အဖြေမှန်</span>
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
                  result.isCorrect ? 'text-success-500' : 'text-warning-500'
                )}
              >
                {result.isCorrect ? 'Correct · မှန်' : 'Review this answer · ပြန်လည်လေ့လာပါ'}
              </p>
            </div>
          ))}
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
