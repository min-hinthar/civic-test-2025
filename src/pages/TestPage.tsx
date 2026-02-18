'use client';

import { useCallback, useMemo, useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import SpeechButton from '@/components/ui/SpeechButton';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { useAutoRead } from '@/hooks/useAutoRead';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { getBurmeseAudioUrl, getEnglishAudioUrl } from '@/lib/audio/burmeseAudio';
import { fisherYatesShuffle } from '@/lib/shuffle';
import type { Answer, QuestionResult, TestEndReason, TestSession } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/BilingualToast';
import { BilingualHeading, SectionHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { CircularTimer } from '@/components/test/CircularTimer';
import { PreTestScreen, type SessionOverrides } from '@/components/test/PreTestScreen';
import type { MockTestMode } from '@/types';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
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
import { useUserState } from '@/contexts/StateContext';
import { DynamicAnswerNote } from '@/components/study/Flashcard3D';
import { strings } from '@/lib/i18n/strings';
import { FadeIn } from '@/components/animations/StaggeredList';
import { UpdateBanner } from '@/components/update/UpdateBanner';
import { Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  playCorrect,
  playIncorrect,
  playLevelUp,
  playMilestone,
  playTimerWarningTick,
} from '@/lib/audio/soundEffects';
import { saveSession, getSessionsByType, deleteSession } from '@/lib/sessions/sessionStore';
import type { MockTestSnapshot } from '@/lib/sessions/sessionTypes';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import { ResumePromptModal } from '@/components/sessions/ResumePromptModal';
import { SessionCountdown } from '@/components/sessions/SessionCountdown';
import type { SessionSnapshot } from '@/lib/sessions/sessionTypes';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { hapticLight, hapticDouble } from '@/lib/haptics';

// New quiz state machine components
import {
  quizReducer,
  initialQuizState,
  createQuizConfig,
  hasPassedThreshold,
  hasFailedThreshold,
} from '@/lib/quiz/quizReducer';
import { AnswerOptionGroup } from '@/components/quiz/AnswerOption';
import { FeedbackPanel } from '@/components/quiz/FeedbackPanel';
import { SegmentedProgressBar } from '@/components/quiz/SegmentedProgressBar';
import type { SegmentStatus } from '@/components/quiz/SegmentedProgressBar';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { SkipButton } from '@/components/quiz/SkipButton';
import { ExitConfirmDialog } from '@/components/quiz/ExitConfirmDialog';
import { StreakReward, STREAK_DISPLAY_DURATION_MS } from '@/components/quiz/StreakReward';
import { XPPopup } from '@/components/quiz/XPPopup';
import { usePerQuestionTimer } from '@/hooks/usePerQuestionTimer';
import { PerQuestionTimer } from '@/components/quiz/PerQuestionTimer';

const TEST_DURATION_SECONDS = 20 * 60;
const PASS_THRESHOLD = 12;
const CHECK_DELAY_MS = 250;

// ---------------------------------------------------------------------------
// Helpers (outside component for React Compiler purity)
// ---------------------------------------------------------------------------

function getQuestionAtIndex(
  questions: ReturnType<typeof fisherYatesShuffle<(typeof allQuestions)[number]>>,
  index: number
) {
  return questions[index] ?? null;
}

// ---------------------------------------------------------------------------
// TestPage
// ---------------------------------------------------------------------------

const TestPage = () => {
  const { saveTestSession } = useAuth();
  const navigate = useNavigate();
  const { categoryMasteries } = useCategoryMastery();
  const { currentStreak } = useStreak();
  const shouldReduceMotion = useReducedMotion();
  const { stateInfo } = useUserState();
  const { showBurmese } = useLanguage();
  const { showSuccess, showWarning } = useToast();
  const { setLock } = useNavigation();
  const { settings: tts } = useTTSSettings();

  // Per-session speech overrides from PreTestScreen
  const [speechOverrides, setSpeechOverrides] = useState<SessionOverrides | null>(null);
  const testMode: MockTestMode = speechOverrides?.mode ?? 'real-exam';
  const isPracticeMode = testMode === 'practice';
  const effectiveSpeed = speechOverrides?.speedOverride ?? tts.rate;
  const effectiveAutoRead = speechOverrides?.autoReadOverride ?? tts.autoRead;
  const speedLabel = { slow: '0.75x', normal: '1x', fast: '1.25x' }[effectiveSpeed];
  const numericRate = { slow: 0.7, normal: 0.98, fast: 1.3 }[effectiveSpeed];
  const timerEnabled = speechOverrides?.timerEnabled ?? !isPracticeMode;

  // Pre-quiz UI state
  const [showPreTest, setShowPreTest] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);
  const [savedSessions, setSavedSessions] = useState<MockTestSnapshot[]>([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  // Timer state (external to reducer -- timer is a side effect)
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);

  // Exit dialog state
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Streak/XP micro-reward state
  const [showStreakReward, setShowStreakReward] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpPoints, setXpPoints] = useState(10);
  const streakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Results screen state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);

  // Session ID (stable across renders)
  const [sessionId] = useState(() => `session-mock-test-${Date.now()}`);

  // Refs for timeout cleanup, save guard, and focus management
  const checkDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSavedSessionRef = useRef(false);
  const resumeDataRef = useRef<MockTestSnapshot | null>(null);
  const questionAreaRef = useRef<HTMLDivElement>(null);

  // Questions (lazy-initialized, can be replaced by resume)
  const [questions, setQuestions] = useState(() =>
    fisherYatesShuffle(allQuestions)
      .slice(0, 20)
      .map(question => ({
        ...question,
        answers: fisherYatesShuffle(question.answers),
      }))
  );

  // Quiz state machine config
  const quizConfig = useMemo(
    () => createQuizConfig('mock-test', questions.length),
    [questions.length]
  );

  // Quiz state machine
  const [quizState, dispatch] = useReducer(quizReducer, quizConfig, initialQuizState);
  const isFinished = quizState.phase === 'finished';
  const lockMessage = 'Complete or exit the test first';

  // ---------------------------------------------------------------------------
  // Derived state (MUST be before early returns per rules-of-hooks)
  // ---------------------------------------------------------------------------

  const questionsById = useMemo(() => new Map(questions.map(q => [q.id, q])), [questions]);

  const currentQuestion = !isFinished
    ? getQuestionAtIndex(questions, quizState.currentIndex)
    : null;
  const questionAudioText = currentQuestion?.question_en ?? '';
  const answerChoicesAudioText =
    currentQuestion?.answers?.map(answer => answer.text_en).join('. ') ?? '';

  // Auto-read question on question change (gated on autoRead setting and active quiz)
  useAutoRead({
    text: questionAudioText,
    enabled: effectiveAutoRead && !showPreTest && !showCountdown && !isFinished,
    triggerKey: quizState.currentIndex,
    lang: 'en-US',
    autoReadLang: tts.autoReadLang,
    englishAudioUrl: currentQuestion ? getEnglishAudioUrl(currentQuestion.id, 'q') : undefined,
    englishRate: numericRate,
    burmeseAudioUrl:
      showBurmese && currentQuestion ? getBurmeseAudioUrl(currentQuestion.id, 'q') : undefined,
    burmeseRate: numericRate,
  });

  const correctCount = useMemo(
    () => quizState.results.filter(r => r.isCorrect).length,
    [quizState.results]
  );
  const incorrectCount = quizState.results.length - correctCount;

  // Segmented progress bar segments
  const segments: SegmentStatus[] = useMemo(() => {
    const segs: SegmentStatus[] = [];
    for (let i = 0; i < questions.length; i++) {
      if (i === quizState.currentIndex && !isFinished) {
        segs.push('current');
      } else if (quizState.skippedIndices.includes(i)) {
        segs.push('skipped');
      } else {
        const result = quizState.results.find(r => r.questionId === questions[i].id);
        if (result) {
          segs.push(result.isCorrect ? 'correct' : 'incorrect');
        } else {
          segs.push('unanswered');
        }
      }
    }
    return segs;
  }, [questions, quizState.currentIndex, quizState.results, quizState.skippedIndices, isFinished]);

  // End reason for results display
  const endReasonForDisplay: TestEndReason | null = useMemo(() => {
    if (!isFinished) return null;
    if (hasPassedThreshold(quizState, quizConfig)) return 'passThreshold';
    if (hasFailedThreshold(quizState, quizConfig)) return 'failThreshold';
    if (quizState.results.length === questions.length) return 'complete';
    return 'time';
  }, [isFinished, quizState, quizConfig, questions.length]);

  // Final results for save-on-finish
  const finalResults = useMemo(
    () => (isFinished ? quizState.results : []),
    [isFinished, quizState.results]
  );
  const finalCorrect = useMemo(() => finalResults.filter(r => r.isCorrect).length, [finalResults]);
  const finalIncorrect = finalResults.length - finalCorrect;

  // Share card data (only when test is complete and passed)
  const shareCardData: ShareCardData | null = useMemo(() => {
    if (!isFinished || finalCorrect < PASS_THRESHOLD) return null;

    const catMap: Record<string, { correct: number; total: number }> = {};
    for (const r of finalResults) {
      if (!catMap[r.category]) catMap[r.category] = { correct: 0, total: 0 };
      catMap[r.category].total += 1;
      if (r.isCorrect) catMap[r.category].correct += 1;
    }

    return {
      score: finalCorrect,
      total: finalResults.length,
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
  }, [isFinished, finalCorrect, finalResults, currentStreak]);

  const completionMessage: Record<TestEndReason, { en: string; my: string }> = {
    passThreshold: {
      en: 'USCIS interview stops after 12 correct answers. Great job reaching the passing threshold early!',
      my: 'အဖြေမှန် ၁၂ ချက်ရပြီးတဲ့အတွက် ရပ်တန့်ပါတယ်။ စောစီးစွာ အောင်မြင်ခဲ့တာ ဂုဏ်ယူပါတယ်!',
    },
    failThreshold: {
      en: 'Interview ended after 9 incorrect answers. Review the feedback below before retrying.',
      my: 'အမှား ၉ ကြိမ်ဖြေဆိုပြီးနောက် ရပ်တန့်လိုက်ပါတယ်။ ထပ်ကြိုးစားရန် အောက်က ဖြေဆိုချက်များကို ပြန်လည်သုံးသပ်ပါ။',
    },
    time: {
      en: 'Time expired before the full set finished.',
      my: 'အချိန်ကုန်သွားပါတယ်။',
    },
    complete: {
      en: 'You completed all 20 questions.',
      my: 'မေးခွန်း ၂၀ လုံးဖြေဆိုပြီးပါပြီ။',
    },
  };

  // ---------------------------------------------------------------------------
  // Per-question timer (mock test: always ON, no extension)
  // ---------------------------------------------------------------------------

  // Use refs for expire handler to avoid circular dependency with handleCheck
  const perQuestionExpireRef = useRef<() => void>(() => {});

  const handleTimerWarning = useCallback(() => {
    playTimerWarningTick();
    hapticLight();
  }, []);

  const perQuestionTimer = usePerQuestionTimer({
    duration: 30,
    isPaused:
      !timerEnabled ||
      quizState.phase !== 'answering' ||
      showPreTest ||
      showCountdown ||
      isFinished,
    onExpire: useCallback(() => perQuestionExpireRef.current(), []),
    onWarning: handleTimerWarning,
    allowExtension: false,
  });

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Reset per-question timer when advancing to next question
  useEffect(() => {
    if (!showPreTest && !showCountdown && !isFinished) {
      perQuestionTimer.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset on index change only
  }, [quizState.currentIndex]);

  // Navigation lock via context: lock when test is active (Real Exam only)
  useEffect(() => {
    const shouldLock = !isPracticeMode && !showPreTest && !isFinished && !showCountdown;
    setLock(shouldLock, lockMessage);
  }, [isPracticeMode, showPreTest, isFinished, showCountdown, setLock]);

  // Release lock on unmount
  useEffect(() => () => setLock(false), [setLock]);

  // Check for saved mock-test sessions on mount
  useEffect(() => {
    let cancelled = false;
    getSessionsByType('mock-test')
      .then(sessions => {
        if (!cancelled && sessions.length > 0) {
          setSavedSessions(sessions as MockTestSnapshot[]);
          setShowResumeModal(true);
        }
      })
      .catch(() => {
        // IndexedDB not available
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Timer countdown (pauses during feedback/checked phases and countdown animation)
  // Only active in Real Exam mode — Practice mode has no overall time limit
  useEffect(() => {
    if (isPracticeMode) return;
    if (isFinished || showPreTest || showCountdown) return;
    if (quizState.phase === 'feedback' || quizState.phase === 'checked') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          dispatch({ type: 'FINISH' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPracticeMode, isFinished, showPreTest, showCountdown, quizState.phase]);

  // Navigation lock -- throttle history API to stay under browser's 100/10s limit
  // Only active in Real Exam mode — Practice mode allows free navigation
  useEffect(() => {
    if (isPracticeMode) return;
    if (isFinished || showPreTest || showCountdown) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    let lastWarningTime = 0;
    const handlePopState = () => {
      try {
        window.history.pushState(null, '', window.location.href);
      } catch {
        // SecurityError: browser rate limit exceeded
      }
      const now = Date.now();
      if (now - lastWarningTime > 3000) {
        lastWarningTime = now;
        showWarning({
          en: 'Please finish the mock test first!',
          my: 'စမ်းသပ်စာမေးပွဲကို အရင်ပြီးအောင်ဖြေပါ!',
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
  }, [isPracticeMode, isFinished, showPreTest, showCountdown, showWarning]);

  // Save session on finish (batch SRS recording)
  useEffect(() => {
    if (!isFinished || finalResults.length === 0 || hasSavedSessionRef.current) return;
    hasSavedSessionRef.current = true;
    const completedFullSet = finalResults.length === questions.length;
    const fallbackReason: TestEndReason =
      endReasonForDisplay ?? (completedFullSet ? 'complete' : 'time');
    const session: Omit<TestSession, 'id'> = {
      date: new Date().toISOString(),
      score: finalCorrect,
      totalQuestions: finalResults.length,
      durationSeconds: TEST_DURATION_SECONDS - timeLeft,
      passed: finalCorrect >= PASS_THRESHOLD,
      incorrectCount: finalIncorrect,
      endReason: fallbackReason,
      results: finalResults,
    };

    // Batch SRS recording on finish (instead of per-answer)
    for (const result of finalResults) {
      recordAnswer({
        questionId: result.questionId,
        isCorrect: result.isCorrect,
        sessionType: 'test',
      });
    }

    const persist = async () => {
      try {
        await saveTestSession(session);
        deleteSession(sessionId).catch(() => {});
        showSuccess({
          en: `Mock test saved — ${finalCorrect} correct answers`,
          my: `စမ်းသပ်စာမေးပွဲ သိမ်းဆည်းပြီး — အဖြေမှန် ${finalCorrect} ခု`,
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
    endReasonForDisplay,
    isFinished,
    finalCorrect,
    finalIncorrect,
    finalResults,
    questions.length,
    saveTestSession,
    sessionId,
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

  // Cleanup check delay and streak timer on unmount
  useEffect(() => {
    return () => {
      if (checkDelayRef.current) {
        clearTimeout(checkDelayRef.current);
      }
      if (streakTimerRef.current) {
        clearTimeout(streakTimerRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  // Resume handler: restore session state and show countdown
  const handleResume = useCallback((session: SessionSnapshot) => {
    const mockSession = session as MockTestSnapshot;
    setQuestions(mockSession.questions);
    setTimeLeft(TEST_DURATION_SECONDS);
    setShowResumeModal(false);
    setIsResuming(true);
    setShowPreTest(false);
    setShowCountdown(true);
    resumeDataRef.current = mockSession;
  }, []);

  // Start fresh handler
  const handleStartFresh = useCallback((session: SessionSnapshot) => {
    deleteSession(session.id).catch(() => {});
    setSavedSessions([]);
    setShowResumeModal(false);
  }, []);

  // Not now handler
  const handleNotNow = useCallback(() => {
    setShowResumeModal(false);
  }, []);

  // Countdown complete handler
  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    resumeDataRef.current = null;
  }, []);

  // Question count change from PreTestScreen
  const handleCountChange = useCallback((count: number) => {
    setQuestionCount(count);
    setQuestions(
      fisherYatesShuffle(allQuestions)
        .slice(0, count)
        .map(question => ({
          ...question,
          answers: fisherYatesShuffle(question.answers),
        }))
    );
  }, []);

  // Handle answer selection (does NOT commit -- TPUX-01)
  const handleAnswerSelect = useCallback(
    (answer: Answer) => {
      if (quizState.phase !== 'answering') return;
      dispatch({ type: 'SELECT_ANSWER', answer });
    },
    [quizState.phase]
  );

  // Handle Check button (TPUX-02)
  const handleCheck = useCallback(() => {
    if (quizState.phase !== 'answering' || !quizState.selectedAnswer || !currentQuestion) return;

    const selectedAnswer = quizState.selectedAnswer;
    const isCorrectAnswer = selectedAnswer.correct;

    // Sound + haptic in event handler (React Compiler safe)
    if (isCorrectAnswer) {
      playCorrect();
      hapticLight();
    } else {
      playIncorrect();
      hapticDouble();
    }

    // Transition to checked phase
    dispatch({ type: 'CHECK' });

    // Build the result
    const correctAnswer = currentQuestion.answers.find(ans => ans.correct)!;
    const result: QuestionResult = {
      questionId: currentQuestion.id,
      questionText_en: currentQuestion.question_en,
      questionText_my: currentQuestion.question_my,
      selectedAnswer,
      correctAnswer,
      isCorrect: isCorrectAnswer,
      category: currentQuestion.category,
    };

    // Fire-and-forget: persist session snapshot to IndexedDB
    const snapshot: MockTestSnapshot = {
      id: sessionId,
      type: 'mock-test',
      savedAt: new Date().toISOString(),
      version: SESSION_VERSION,
      questions,
      results: [...quizState.results, result],
      currentIndex: quizState.currentIndex + 1,
      timeLeft,
    };
    saveSession(snapshot).catch(() => {});

    // Intentional delay before showing feedback (per locked decision: 200-300ms)
    checkDelayRef.current = setTimeout(() => {
      checkDelayRef.current = null;
      dispatch({ type: 'SHOW_FEEDBACK', result, isCorrect: isCorrectAnswer });

      // Trigger streak/XP micro-rewards on correct answers
      if (isCorrectAnswer) {
        const newStreak = quizState.streakCount + 1;
        setXpPoints(newStreak >= 3 ? 15 : 10);
        setShowXP(true);
        setShowStreakReward(true);

        if (streakTimerRef.current) clearTimeout(streakTimerRef.current);
        streakTimerRef.current = setTimeout(() => {
          setShowStreakReward(false);
          setShowXP(false);
          streakTimerRef.current = null;
        }, STREAK_DISPLAY_DURATION_MS);
      }
    }, CHECK_DELAY_MS);
  }, [quizState, currentQuestion, sessionId, questions, timeLeft]);

  // Handle Continue from FeedbackPanel (TPUX-03)
  const handleContinue = useCallback(() => {
    if (quizState.phase !== 'feedback') return;

    // Hide streak/XP rewards
    setShowStreakReward(false);
    setShowXP(false);

    // Defensive: finish if all questions answered (or thresholds met in Real Exam mode)
    if (
      quizState.currentIndex + 1 >= questions.length ||
      (!isPracticeMode &&
        (hasPassedThreshold(quizState, quizConfig) || hasFailedThreshold(quizState, quizConfig)))
    ) {
      dispatch({ type: 'FINISH' });
      return;
    }

    dispatch({ type: 'CONTINUE' });

    // After a brief moment for the transition animation, complete the transition
    setTimeout(() => {
      dispatch({ type: 'TRANSITION_COMPLETE' });
      // Focus question area after advancing to next question (A11Y-02)
      requestAnimationFrame(() => {
        questionAreaRef.current?.focus({ preventScroll: true });
      });
    }, 50);
  }, [quizState, quizConfig, questions.length, isPracticeMode]);

  // Handle Skip
  const handleSkip = useCallback(() => {
    if (quizState.phase !== 'answering') return;
    dispatch({ type: 'SKIP' });
    setTimeout(() => {
      dispatch({ type: 'TRANSITION_COMPLETE' });
    }, 50);
  }, [quizState.phase]);

  // Keep per-question expire ref in sync with latest handlers
  perQuestionExpireRef.current = () => {
    if (quizState.phase !== 'answering') return;
    if (quizState.selectedAnswer) {
      handleCheck();
    } else {
      handleSkip();
    }
  };

  // Exit dialog handlers
  const handleExitRequest = useCallback(() => {
    setShowExitDialog(true);
  }, []);

  const handleExitClose = useCallback(() => {
    setShowExitDialog(false);
  }, []);

  const handleConfirmExit = useCallback(() => {
    setShowExitDialog(false);
    navigate('/dashboard');
  }, [navigate]);

  // Score count complete handler for results celebration
  const handleScoreCountComplete = useCallback(() => {
    setShowConfetti(true);
    if (finalCorrect >= PASS_THRESHOLD) {
      playMilestone();
    } else {
      playLevelUp();
    }
  }, [finalCorrect]);

  // ---------------------------------------------------------------------------
  // Keyboard navigation (TPUX-06)
  // ---------------------------------------------------------------------------

  // Context-sensitive Enter key: Check when answer selected, Continue when feedback showing
  // Escape key: opens ExitConfirmDialog
  useEffect(() => {
    if (isFinished || showPreTest || showCountdown) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (quizState.phase === 'answering' && quizState.selectedAnswer) {
          e.preventDefault();
          handleCheck();
        } else if (quizState.phase === 'feedback') {
          e.preventDefault();
          handleContinue();
        }
      } else if (e.key === 'Escape' && !showExitDialog) {
        e.preventDefault();
        setShowExitDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isFinished,
    showPreTest,
    showCountdown,
    quizState.phase,
    quizState.selectedAnswer,
    showExitDialog,
    handleCheck,
    handleContinue,
  ]);

  // ---------------------------------------------------------------------------
  // Early returns (pre-test screens)
  // ---------------------------------------------------------------------------

  if (showPreTest) {
    return (
      <div className="page-shell" data-tour="mock-test">
        <UpdateBanner showBurmese={showBurmese} />
        <PreTestScreen
          questionCount={questionCount}
          durationMinutes={20}
          onReady={overrides => {
            if (overrides) {
              setSpeechOverrides(overrides);
              // Real Exam mode forces 20 questions
              if (overrides.mode === 'real-exam' && questionCount !== 20) {
                handleCountChange(20);
              }
            }
            setShowPreTest(false);
            setShowCountdown(true);
          }}
          onCountChange={handleCountChange}
        />
        <ResumePromptModal
          sessions={savedSessions}
          open={showResumeModal}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onNotNow={handleNotNow}
        />
      </div>
    );
  }

  if (showCountdown) {
    return (
      <div className="page-shell" data-tour="mock-test">
        <SessionCountdown
          onComplete={handleCountdownComplete}
          subtitle={
            isResuming
              ? `Mock Test \u2014 Q${quizState.currentIndex + 1}/${questions.length}`
              : `Mock Test \u2014 ${questions.length} Questions`
          }
        />
      </div>
    );
  }

  if (!currentQuestion && !isFinished) {
    // Safety: if no question exists at current index, force finish to avoid stuck state
    if (quizState.currentIndex >= questions.length) {
      dispatch({ type: 'FINISH' });
    }
    return (
      <div className="page-shell" data-tour="mock-test">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-muted-foreground">
          Preparing your next question...
          {showBurmese && (
            <span className="block font-myanmar mt-1">နောက်မေးခွန်းကို ပြင်ဆင်နေပါသည်...</span>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Active quiz view
  // ---------------------------------------------------------------------------

  const activeView = (
    <div className="mx-auto max-w-5xl px-4 pb-32 pt-2">
      {/* Quiz header: exit (X), question number, timer */}
      <QuizHeader
        questionNumber={quizState.currentIndex + 1}
        totalQuestions={questions.length}
        mode="mock-test"
        onExit={handleExitRequest}
        timerSlot={
          <div className="flex items-center gap-2">
            {timerEnabled && (
              <PerQuestionTimer
                timeLeft={perQuestionTimer.timeLeft}
                duration={30}
                isWarning={perQuestionTimer.isWarning}
              />
            )}
            {!isPracticeMode && (
              <CircularTimer
                duration={TEST_DURATION_SECONDS}
                remainingTime={timeLeft}
                isPlaying={quizState.phase !== 'feedback' && quizState.phase !== 'checked'}
                size="sm"
                allowHide
              />
            )}
          </div>
        }
        showBurmese={showBurmese}
      />

      {/* Segmented progress bar */}
      <div className="mb-6">
        <SegmentedProgressBar
          segments={segments}
          currentIndex={quizState.currentIndex}
          totalCount={questions.length}
          showBurmese={showBurmese}
        />
      </div>

      {/* Question card with AnimatePresence for slide transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={quizState.currentIndex}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -60 }}
          transition={shouldReduceMotion ? { duration: 0.15 } : SPRING_SNAPPY}
        >
          <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
            {/* Question area -- focusable for a11y after Continue */}
            <div
              ref={questionAreaRef}
              tabIndex={-1}
              className="rounded-2xl border border-border/50 bg-muted/30 p-5 outline-none"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">
                {currentQuestion?.category}
              </p>
              <p className="mt-2 text-lg font-bold text-foreground leading-snug">
                {currentQuestion?.question_en}
              </p>
              {showBurmese && (
                <p className="mt-2 text-base text-muted-foreground font-myanmar leading-relaxed">
                  {currentQuestion?.question_my}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <SpeechButton
                  text={questionAudioText}
                  questionId={currentQuestion?.id}
                  audioType="q"
                  label="Question"
                  ariaLabel="Play English test question audio"
                  rate={numericRate}
                  showSpeedLabel
                  speedLabel={speedLabel}
                />
                {showBurmese && currentQuestion && (
                  <BurmeseSpeechButton
                    questionId={currentQuestion.id}
                    audioType="q"
                    label="မေးခွန်း"
                    showSpeedLabel
                    speedLabel={speedLabel}
                  />
                )}
                <SpeechButton
                  text={answerChoicesAudioText}
                  questionId={currentQuestion?.id}
                  audioType="a"
                  label="Answers"
                  ariaLabel="Play English answer choices audio"
                  rate={numericRate}
                  showSpeedLabel
                  speedLabel={speedLabel}
                />
              </div>
            </div>

            {/* Answer options using AnswerOptionGroup with roving focus */}
            <div className="mt-6">
              <AnswerOptionGroup
                answers={currentQuestion?.answers ?? []}
                selectedAnswer={quizState.selectedAnswer}
                isLocked={quizState.phase === 'checked' || quizState.phase === 'feedback'}
                correctAnswer={
                  quizState.phase === 'feedback' || quizState.phase === 'checked'
                    ? currentQuestion?.answers.find(a => a.correct)
                    : undefined
                }
                onSelect={handleAnswerSelect}
                showBurmese={showBurmese}
              />
            </div>

            {/* Dynamic answer note during feedback */}
            {quizState.phase === 'feedback' && currentQuestion?.dynamic && (
              <DynamicAnswerNote dynamic={currentQuestion.dynamic} stateInfo={stateInfo} />
            )}

            {/* Progress summary */}
            <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="text-success font-bold">
                  {correctCount} correct
                  {showBurmese && <span className="font-myanmar font-normal"> မှန်</span>}
                </span>
                <span className="text-warning font-bold">
                  {incorrectCount} incorrect
                  {showBurmese && <span className="font-myanmar font-normal"> မှား</span>}
                </span>
              </div>
              {!isPracticeMode && (
                <p className="text-xs text-muted-foreground">
                  12 correct or 9 incorrect ends the test
                  {showBurmese && (
                    <span className="block font-myanmar">
                      ၁၂ ခုမှန် သို့ ၉ ခုမှားရင် စာမေးပွဲပြီးပါမယ်
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom action buttons: Skip + Check (only during answering phase) */}
      {quizState.phase === 'answering' && (
        <div className="mt-6 flex items-center gap-3 justify-end">
          <SkipButton onSkip={handleSkip} showBurmese={showBurmese} />
          <button
            type="button"
            onClick={handleCheck}
            disabled={!quizState.selectedAnswer}
            className={clsx(
              'rounded-full px-8 py-3 min-h-[48px] text-base font-bold',
              'transition-all duration-100',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              quizState.selectedAnswer
                ? [
                    'bg-primary text-primary-foreground',
                    'shadow-[0_4px_0_hsl(var(--primary-700))]',
                    'active:shadow-[0_1px_0_hsl(var(--primary-700))] active:translate-y-[3px]',
                    'hover:bg-primary/90',
                  ]
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            )}
          >
            {strings.quiz.check.en}
            {showBurmese && (
              <span className="ml-2 font-myanmar text-base font-normal">
                {strings.quiz.check.my}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Streak/XP micro-rewards (above feedback panel) */}
      <div className="fixed inset-x-0 bottom-[140px] z-50 flex flex-col items-center gap-2 pointer-events-none">
        <StreakReward
          count={quizState.streakCount}
          show={showStreakReward}
          showBurmese={showBurmese}
        />
        <XPPopup points={xpPoints} show={showXP} />
      </div>

      {/* Feedback panel -- slides up from bottom (TPUX-02) */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        <FeedbackPanel
          isCorrect={quizState.isCorrect ?? false}
          show={quizState.phase === 'feedback'}
          correctAnswer={currentQuestion?.answers.find(a => a.correct)?.text_en ?? ''}
          correctAnswerMy={currentQuestion?.answers.find(a => a.correct)?.text_my}
          userAnswer={quizState.selectedAnswer?.text_en}
          userAnswerMy={quizState.selectedAnswer?.text_my}
          questionId={currentQuestion?.id}
          streakCount={quizState.streakCount}
          mode="mock-test"
          onContinue={handleContinue}
          showBurmese={showBurmese}
        />
      </div>

      {/* Exit confirmation dialog */}
      <ExitConfirmDialog
        open={showExitDialog}
        onClose={handleExitClose}
        onConfirmExit={handleConfirmExit}
        mode="mock-test"
        showBurmese={showBurmese}
      />
    </div>
  );

  // ---------------------------------------------------------------------------
  // Results view
  // ---------------------------------------------------------------------------

  const resultView = (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <Confetti
        fire={showConfetti}
        intensity={finalCorrect >= PASS_THRESHOLD ? 'celebration' : 'burst'}
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
                finalCorrect >= PASS_THRESHOLD ? 'text-success' : 'text-warning'
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
            score={finalCorrect}
            total={finalResults.length}
            onComplete={handleScoreCountComplete}
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mt-6">
          <div>
            <p className="text-muted-foreground">
              Review your answers and retake the mock test anytime.
              {showBurmese && (
                <span className="block font-myanmar text-muted-foreground mt-0.5">
                  အဖြေများကို ပြန်လည်စစ်ဆေးပြီး အချိန်မရွေး ထပ်ဖြေနိုင်ပါတယ်။
                </span>
              )}
            </p>
            {endReasonForDisplay && (
              <p className="mt-2 text-sm font-semibold text-primary">
                {completionMessage[endReasonForDisplay].en}
                {showBurmese && completionMessage[endReasonForDisplay].my && (
                  <span className="block font-myanmar mt-0.5 font-normal text-muted-foreground">
                    {completionMessage[endReasonForDisplay].my}
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
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Duration
              {showBurmese && (
                <span className="font-myanmar normal-case tracking-normal"> · ကြာချိန်</span>
              )}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {Math.round((TEST_DURATION_SECONDS - timeLeft) / 60)} mins
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Correct
              {showBurmese && (
                <span className="font-myanmar normal-case tracking-normal"> · မှန်</span>
              )}
            </p>
            <p className="text-2xl font-bold text-success">{finalCorrect}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Incorrect
              {showBurmese && (
                <span className="font-myanmar normal-case tracking-normal"> · မှား</span>
              )}
            </p>
            <p className="text-2xl font-bold text-warning">{finalIncorrect}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Status
              {showBurmese && (
                <span className="font-myanmar normal-case tracking-normal"> · အခြေအနေ</span>
              )}
            </p>
            <p
              className={clsx(
                'text-2xl font-bold',
                finalCorrect >= PASS_THRESHOLD ? 'text-success' : 'text-warning'
              )}
            >
              {finalCorrect >= PASS_THRESHOLD ? 'Pass' : 'Review'}
              {showBurmese && (
                <span className="block font-myanmar text-2xl font-semibold">
                  {finalCorrect >= PASS_THRESHOLD ? 'အောင်မြင်' : 'ပြန်လေ့လာရန်'}
                </span>
              )}
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
                  'rounded-md px-3 py-2 text-xs font-semibold transition-colors min-h-[44px]',
                  !showAllResults
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {strings.test.incorrectOnly.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.test.incorrectOnly.my}</span>
                )}
              </button>
              <button
                onClick={() => setShowAllResults(true)}
                className={clsx(
                  'rounded-md px-3 py-2 text-xs font-semibold transition-colors min-h-[44px]',
                  showAllResults
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {strings.test.showAll.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.test.showAll.my}</span>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {strings.test.showing.en}{' '}
            {showAllResults ? finalResults.length : finalResults.filter(r => !r.isCorrect).length}{' '}
            {strings.test.ofQuestions.en} {finalResults.length} {strings.test.questions.en}
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
                    my: 'ဒီစာမေးပွဲအပေါ်အခြေခံပြီး ပြန်လည်လေ့လာသင့်တာတွေ:',
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
          {(showAllResults ? finalResults : finalResults.filter(r => !r.isCorrect)).map(result => {
            const questionData = questionsById.get(result.questionId);
            const explanation = questionData?.explanation;

            return (
              <div
                key={result.questionId}
                className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
                {showBurmese && (
                  <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                    {result.questionText_my}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <SpeechButton
                    text={result.questionText_en}
                    questionId={result.questionId}
                    audioType="q"
                    label="Question"
                    ariaLabel={`Play English question audio for ${result.questionText_en}`}
                    rate={numericRate}
                    showSpeedLabel
                    speedLabel={speedLabel}
                  />
                  {showBurmese && (
                    <BurmeseSpeechButton
                      questionId={result.questionId}
                      audioType="q"
                      label="မေးခွန်း"
                      showSpeedLabel
                      speedLabel={speedLabel}
                    />
                  )}
                  <SpeechButton
                    text={result.correctAnswer.text_en}
                    questionId={result.questionId}
                    audioType="a"
                    label="Answer"
                    ariaLabel={`Play English official answer for ${result.questionText_en}`}
                    rate={numericRate}
                    showSpeedLabel
                    speedLabel={speedLabel}
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
                      {strings.test.yourAnswer.en}
                      {showBurmese && (
                        <span className="font-myanmar"> \u00B7 {strings.test.yourAnswer.my}</span>
                      )}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {result.selectedAnswer.text_en}
                    </p>
                    {showBurmese && (
                      <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                        {result.selectedAnswer.text_my}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {strings.test.correctAnswer.en}
                      {showBurmese && (
                        <span className="font-myanmar">
                          {' '}
                          \u00B7 {strings.test.correctAnswer.my}
                        </span>
                      )}
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {result.correctAnswer.text_en}
                    </p>
                    {showBurmese && (
                      <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                        {result.correctAnswer.text_my}
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className={clsx(
                    'mt-3 text-sm font-semibold',
                    result.isCorrect ? 'text-success' : 'text-warning'
                  )}
                >
                  {result.isCorrect
                    ? showBurmese
                      ? `${strings.test.correct.en} \u00B7 ${strings.test.correct.my}`
                      : strings.test.correct.en
                    : showBurmese
                      ? `${strings.test.reviewAnswer.en} \u00B7 ${strings.test.reviewAnswer.my}`
                      : strings.test.reviewAnswer.en}
                </p>

                {/* Dynamic answer note for time/state-varying questions */}
                {questionData?.dynamic && (
                  <DynamicAnswerNote dynamic={questionData.dynamic} stateInfo={stateInfo} />
                )}

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

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  return (
    <div className="page-shell" data-tour="mock-test">
      {isFinished ? resultView : activeView}
    </div>
  );
};

export default TestPage;
