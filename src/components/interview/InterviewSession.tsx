'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, LogOut, Mic, Square, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { ExaminerCharacter } from '@/components/interview/ExaminerCharacter';
import { ChatBubble } from '@/components/interview/ChatBubble';
import { TypingIndicator } from '@/components/interview/TypingIndicator';
import { TranscriptionReview } from '@/components/interview/TranscriptionReview';
import { AudioWaveform } from '@/components/interview/AudioWaveform';
import { SelfGradeButtons } from '@/components/interview/SelfGradeButtons';
import { InterviewTimer } from '@/components/interview/InterviewTimer';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { useTTS } from '@/hooks/useTTS';
import { TTSCancelledError } from '@/lib/ttsTypes';
import { useInterviewSpeech } from '@/hooks/useSpeechRecognition';
import { useSilenceDetection } from '@/hooks/useSilenceDetection';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { gradeAnswer } from '@/lib/interview/answerGrader';
import { playChime } from '@/lib/interview/audioChime';
import { getRandomGreeting } from '@/lib/interview/interviewGreetings';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions } from '@/constants/questions';
import { saveSession } from '@/lib/sessions/sessionStore';
import { SESSION_VERSION } from '@/lib/sessions/sessionTypes';
import type { InterviewSnapshot } from '@/lib/sessions/sessionTypes';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { InterviewMode, InterviewResult, InterviewEndReason, Question } from '@/types';
import type { GradeResult } from '@/lib/interview/answerGrader';

/** Maximum replays per question */
const MAX_REPLAYS = 2;

/** Maximum re-record attempts for transcription */
const MAX_RECORD_ATTEMPTS = 3;

/** Timer duration for realistic mode in seconds */
const REALISTIC_TIMER_SECONDS = 15;

/** Delay between grading and next question in ms */
const TRANSITION_DELAY_MS = 1500;

/** Pass threshold for realistic mode */
const PASS_THRESHOLD = 12;

/** Fail threshold for realistic mode */
const FAIL_THRESHOLD = 9;

/** Number of questions per interview session */
const QUESTIONS_PER_SESSION = 20;

/** Typing indicator display duration in ms */
const TYPING_INDICATOR_MS = 1200;

type QuestionPhase =
  | 'greeting'
  | 'chime'
  | 'typing'
  | 'reading'
  | 'responding'
  | 'transcription'
  | 'grading'
  | 'feedback'
  | 'transition';

/** A single chat message for the conversation log */
interface ChatMessage {
  id: string;
  sender: 'examiner' | 'user';
  text: string;
  isCorrect?: boolean;
  confidence?: number;
}

/** Rate map for named speed to numeric playback rate */
const RATE_MAP: Record<'slow' | 'normal' | 'fast', number> = {
  slow: 0.7,
  normal: 0.98,
  fast: 1.3,
};

interface InterviewSessionProps {
  /** Interview mode (realistic or practice) */
  mode: InterviewMode;
  /** Called when the session is complete */
  onComplete: (
    results: InterviewResult[],
    durationSeconds: number,
    endReason: InterviewEndReason
  ) => void;
  /** Whether mic permission was granted */
  micPermission: boolean;
  /** Per-session speech speed override from InterviewSetup */
  speedOverride?: 'slow' | 'normal' | 'fast';
  /** Session ID for persistence */
  sessionId?: string;
  /** Pre-shuffled questions for resume */
  initialQuestions?: Question[];
  /** Graded results so far (resume) */
  initialResults?: InterviewResult[];
  /** Current question index (resume) */
  initialIndex?: number;
  /** Running correct count (resume) */
  initialCorrectCount?: number;
  /** Running incorrect count (resume) */
  initialIncorrectCount?: number;
  /** Original session start timestamp (resume) */
  initialStartTime?: number;
}

/**
 * Chat-style interview session with ExaminerCharacter, speech recognition,
 * and dual Practice/Real modes.
 *
 * Visual layout:
 * - ExaminerCharacter at top
 * - Chat messages area (scrollable)
 * - Recording area at bottom (mic + waveform)
 *
 * Chat flow:
 * greeting -> (typing -> reading -> responding -> transcription -> grading -> feedback -> transition) * N
 *
 * Practice mode: per-question feedback, always 20 questions, exit allowed
 * Real mode: no per-question feedback, early termination at 12/9, no exit
 */
export function InterviewSession({
  mode,
  onComplete,
  micPermission,
  speedOverride,
  sessionId,
  initialQuestions,
  initialResults,
  initialIndex,
  initialCorrectCount,
  initialIncorrectCount,
  initialStartTime,
}: InterviewSessionProps) {
  const { showBurmese, mode: languageMode } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { speak, cancel: cancelTTS, settings: ttsSettings } = useTTS();

  // Effective speed: Real mode always normal, Practice mode uses override or global setting
  const effectiveSpeed = mode === 'realistic' ? 'normal' : (speedOverride ?? ttsSettings.rate);
  const numericRate = RATE_MAP[effectiveSpeed];
  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useInterviewSpeech();
  const {
    startRecording,
    stopRecording,
    clearRecording,
    stream,
    isRecording,
    cleanup: cleanupRecorder,
  } = useAudioRecorder();

  // --- Session state ---
  const [questions] = useState<Question[]>(
    () => initialQuestions ?? fisherYatesShuffle(allQuestions).slice(0, QUESTIONS_PER_SESSION)
  );
  const isResuming = (initialIndex ?? 0) > 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex ?? 0);
  const [results, setResults] = useState<InterviewResult[]>(initialResults ?? []);
  const [correctCount, setCorrectCount] = useState(initialCorrectCount ?? 0);
  const [incorrectCount, setIncorrectCount] = useState(initialIncorrectCount ?? 0);
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>(
    isResuming ? 'chime' : 'greeting'
  );
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [recordAttempt, setRecordAttempt] = useState(1);
  const [showQuitDialog, setShowQuitDialog] = useState(false);
  const [startTime] = useState(() => initialStartTime ?? Date.now());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [examinerState, setExaminerState] = useState<'idle' | 'speaking' | 'nodding' | 'listening'>(
    'idle'
  );
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const msgIdCounter = useRef(0);

  // Stable ref for onComplete
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const currentQuestion = questions[currentIndex];

  // --- Helpers ---

  const nextMsgId = useCallback(() => {
    msgIdCounter.current += 1;
    return `msg-${msgIdCounter.current}`;
  }, []);

  const addMessage = useCallback(
    (sender: 'examiner' | 'user', text: string, isCorrect?: boolean, confidence?: number) => {
      setChatMessages(prev => [...prev, { id: nextMsgId(), sender, text, isCorrect, confidence }]);
    },
    [nextMsgId]
  );

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    const el = chatEndRef.current;
    if (el) {
      el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
    }
  }, [chatMessages, questionPhase, shouldReduceMotion]);

  // --- Safe speak wrapper (applies session speed override) ---
  const safeSpeakLocal = useCallback(
    async (text: string) => {
      try {
        await speak(text, { rate: numericRate });
        return 'completed' as const;
      } catch (err) {
        if (err instanceof TTSCancelledError) return 'cancelled' as const;
        return 'error' as const;
      }
    },
    [speak, numericRate]
  );

  // --- Silence detection: auto-stop recording after 2s silence ---
  const handleSilenceDetected = useCallback(() => {
    if (questionPhase === 'responding' && isListening) {
      stopListening();
      stopRecording();
      setQuestionPhase('transcription');
    }
  }, [questionPhase, isListening, stopListening, stopRecording]);

  useSilenceDetection({
    stream,
    onSilence: handleSilenceDetected,
    enabled: questionPhase === 'responding' && isRecording,
    silenceMs: 2000,
  });

  // --- Cleanup on unmount ---
  useEffect(() => {
    return () => {
      cleanupRecorder();
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
    };
  }, [cleanupRecorder]);

  // --- Phase: GREETING ---
  useEffect(() => {
    if (questionPhase !== 'greeting') return;

    // eslint-disable-next-line no-console
    console.debug('[analytics] interview_session_started', {
      interviewMode: mode,
      languageMode,
    });

    let cancelled = false;
    const greeting = getRandomGreeting();

    setExaminerState('speaking');
    addMessage('examiner', greeting);

    safeSpeakLocal(greeting).then(speakResult => {
      if (cancelled) return;
      setExaminerState('idle');
      if (speakResult === 'completed') {
        transitionTimerRef.current = setTimeout(() => {
          if (!cancelled) setQuestionPhase('chime');
        }, 800);
      }
    });

    return () => {
      cancelled = true;
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [questionPhase, safeSpeakLocal, addMessage, mode, languageMode]);

  // --- Phase: CHIME ---
  useEffect(() => {
    if (questionPhase !== 'chime') return;

    playChime();
    transitionTimerRef.current = setTimeout(() => {
      setQuestionPhase('typing');
    }, 200);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [questionPhase]);

  // --- Phase: TYPING (show typing indicator, then transition to reading) ---
  useEffect(() => {
    if (questionPhase !== 'typing') return;

    transitionTimerRef.current = setTimeout(() => {
      setQuestionPhase('reading');
    }, TYPING_INDICATOR_MS);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [questionPhase]);

  // --- Phase: READING (TTS reads question, then responding) ---
  useEffect(() => {
    if (questionPhase !== 'reading') return;
    if (!currentQuestion) return;

    let cancelled = false;
    const questionText = currentQuestion.question_en;

    setExaminerState('speaking');
    addMessage('examiner', questionText);

    safeSpeakLocal(questionText).then(speakResult => {
      if (cancelled) return;
      setExaminerState('listening');
      if (speakResult === 'completed') {
        setResponseStartTime(Date.now());
        // Start speech recognition if supported
        if (speechSupported && micPermission) {
          resetTranscript();
          startListening().catch(() => {});
          startRecording();
        }
        setQuestionPhase('responding');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    questionPhase,
    currentQuestion,
    safeSpeakLocal,
    addMessage,
    speechSupported,
    micPermission,
    resetTranscript,
    startListening,
    startRecording,
  ]);

  // --- Manual submit (stop recording + move to transcription) ---
  const handleManualSubmit = useCallback(() => {
    stopListening();
    stopRecording();
    setQuestionPhase('transcription');
  }, [stopListening, stopRecording]);

  // --- Timer expired (realistic mode) ---
  const handleTimerExpired = useCallback(() => {
    stopListening();
    stopRecording();
    // In realistic mode, timer expiry means skipped (incorrect)
    setQuestionPhase('grading');
  }, [stopListening, stopRecording]);

  // --- Advance to next question or finish ---
  const advanceToNext = useCallback(() => {
    if (currentIndex >= QUESTIONS_PER_SESSION - 1) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      onCompleteRef.current(results, duration, 'complete');
      return;
    }

    setQuestionPhase('transition');
    transitionTimerRef.current = setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setReplaysUsed(0);
      setRecordAttempt(1);
      resetTranscript();
      setQuestionPhase('chime');
    }, TRANSITION_DELAY_MS);
  }, [currentIndex, startTime, results, resetTranscript]);

  // --- Transcription: user confirms or re-records ---
  const handleTranscriptConfirm = useCallback(() => {
    // Calculate response time
    const responseTimeMs = responseStartTime ? Date.now() - responseStartTime : undefined;

    // Add user's answer to chat
    const userText = transcript.trim() || '(no answer)';
    addMessage('user', userText);

    // If speech recognition available, grade automatically
    if (speechSupported && currentQuestion) {
      const gradeResult: GradeResult = gradeAnswer(transcript, currentQuestion.studyAnswers);

      // Store result
      const interviewResult: InterviewResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        correctAnswers: currentQuestion.studyAnswers.map(a => ({
          text_en: a.text_en,
          text_my: a.text_my,
        })),
        selfGrade: gradeResult.isCorrect ? 'correct' : 'incorrect',
        category: currentQuestion.category,
        confidence: gradeResult.confidence,
        responseTimeMs,
      };

      const newResults = [...results, interviewResult];
      const newCorrect = gradeResult.isCorrect ? correctCount + 1 : correctCount;
      const newIncorrect = gradeResult.isCorrect ? incorrectCount : incorrectCount + 1;

      setResults(newResults);
      setCorrectCount(newCorrect);
      setIncorrectCount(newIncorrect);

      // Save session snapshot
      if (sessionId) {
        const snapshot: InterviewSnapshot = {
          id: sessionId,
          type: 'interview',
          savedAt: new Date().toISOString(),
          version: SESSION_VERSION,
          questions,
          results: newResults,
          currentIndex: currentIndex + 1,
          correctCount: newCorrect,
          incorrectCount: newIncorrect,
          mode,
          startTime,
        };
        saveSession(snapshot).catch(() => {});
      }

      clearRecording();
      setQuestionPhase('feedback');

      // Check early termination (real mode)
      if (mode === 'realistic') {
        if (newCorrect >= PASS_THRESHOLD) {
          transitionTimerRef.current = setTimeout(() => {
            addMessage('examiner', "Congratulations! You've passed the civics test.");
            setExaminerState('speaking');
            safeSpeakLocal("Congratulations! You've passed the civics test.").then(() => {
              setExaminerState('idle');
              const duration = Math.round((Date.now() - startTime) / 1000);
              onCompleteRef.current(newResults, duration, 'passThreshold');
            });
          }, 500);
          return;
        }
        if (newIncorrect >= FAIL_THRESHOLD) {
          transitionTimerRef.current = setTimeout(() => {
            addMessage('examiner', "Unfortunately, you didn't reach the passing score this time.");
            setExaminerState('speaking');
            safeSpeakLocal("Unfortunately, you didn't reach the passing score this time.").then(
              () => {
                setExaminerState('idle');
                const duration = Math.round((Date.now() - startTime) / 1000);
                onCompleteRef.current(newResults, duration, 'failThreshold');
              }
            );
          }, 500);
          return;
        }
      }

      // Check if all questions answered
      if (currentIndex >= QUESTIONS_PER_SESSION - 1) {
        transitionTimerRef.current = setTimeout(() => {
          const duration = Math.round((Date.now() - startTime) / 1000);
          onCompleteRef.current(newResults, duration, 'complete');
        }, TRANSITION_DELAY_MS);
        return;
      }
    } else {
      // No speech recognition - fall through to self-grade
      setQuestionPhase('grading');
    }
  }, [
    transcript,
    speechSupported,
    currentQuestion,
    results,
    correctCount,
    incorrectCount,
    responseStartTime,
    addMessage,
    clearRecording,
    sessionId,
    questions,
    currentIndex,
    mode,
    startTime,
    safeSpeakLocal,
  ]);

  const handleReRecord = useCallback(() => {
    setRecordAttempt(prev => prev + 1);
    resetTranscript();
    if (speechSupported && micPermission) {
      startListening().catch(() => {});
      startRecording();
    }
    setQuestionPhase('responding');
  }, [resetTranscript, speechSupported, micPermission, startListening, startRecording]);

  // --- Phase: FEEDBACK (Practice: show detailed, Real: brief ack) ---
  useEffect(() => {
    if (questionPhase !== 'feedback') return;
    if (!currentQuestion) return;

    let cancelled = false;
    const lastResult = results[results.length - 1];
    if (!lastResult) return;

    setExaminerState('nodding');

    // Brief nod then back to idle
    transitionTimerRef.current = setTimeout(() => {
      if (cancelled) return;
      setExaminerState('idle');
    }, 600);

    if (mode === 'practice') {
      // Practice: show correct answer and feedback
      const primaryAnswer = currentQuestion.studyAnswers[0]?.text_en ?? '';
      const feedbackText =
        lastResult.selfGrade === 'correct'
          ? `Correct! The answer is: ${primaryAnswer}`
          : `The correct answer is: ${primaryAnswer}`;

      addMessage('examiner', feedbackText, lastResult.selfGrade === 'correct');

      safeSpeakLocal(feedbackText).then(_speakResult => {
        if (cancelled) return;
        // Auto-advance after feedback
        transitionTimerRef.current = setTimeout(() => {
          if (!cancelled) advanceToNext();
        }, TRANSITION_DELAY_MS);
      });
    } else {
      // Real mode: brief acknowledgment
      const acks = ['Thank you.', 'Next question.', 'Alright.'];
      const ackText = acks[currentIndex % acks.length];
      addMessage('examiner', ackText);

      transitionTimerRef.current = setTimeout(() => {
        if (!cancelled) advanceToNext();
      }, 800);
    }

    return () => {
      cancelled = true;
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionPhase]);

  // --- Self-grade fallback (no speech recognition) ---
  const handleSelfGrade = useCallback(
    (grade: 'correct' | 'incorrect') => {
      if (!currentQuestion) return;

      const interviewResult: InterviewResult = {
        questionId: currentQuestion.id,
        questionText_en: currentQuestion.question_en,
        questionText_my: currentQuestion.question_my,
        correctAnswers: currentQuestion.studyAnswers.map(a => ({
          text_en: a.text_en,
          text_my: a.text_my,
        })),
        selfGrade: grade,
        category: currentQuestion.category,
      };

      const newResults = [...results, interviewResult];
      const newCorrect = grade === 'correct' ? correctCount + 1 : correctCount;
      const newIncorrect = grade === 'incorrect' ? incorrectCount + 1 : incorrectCount;

      setResults(newResults);
      setCorrectCount(newCorrect);
      setIncorrectCount(newIncorrect);

      // Save session snapshot
      if (sessionId) {
        const snapshot: InterviewSnapshot = {
          id: sessionId,
          type: 'interview',
          savedAt: new Date().toISOString(),
          version: SESSION_VERSION,
          questions,
          results: newResults,
          currentIndex: currentIndex + 1,
          correctCount: newCorrect,
          incorrectCount: newIncorrect,
          mode,
          startTime,
        };
        saveSession(snapshot).catch(() => {});
      }

      clearRecording();

      // Check thresholds (realistic mode)
      if (mode === 'realistic') {
        if (newCorrect >= PASS_THRESHOLD) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          onCompleteRef.current(newResults, duration, 'passThreshold');
          return;
        }
        if (newIncorrect >= FAIL_THRESHOLD) {
          const duration = Math.round((Date.now() - startTime) / 1000);
          onCompleteRef.current(newResults, duration, 'failThreshold');
          return;
        }
      }

      if (currentIndex >= QUESTIONS_PER_SESSION - 1) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        onCompleteRef.current(newResults, duration, 'complete');
        return;
      }

      setQuestionPhase('transition');
      transitionTimerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setReplaysUsed(0);
        setRecordAttempt(1);
        resetTranscript();
        setQuestionPhase('chime');
      }, TRANSITION_DELAY_MS);
    },
    [
      currentQuestion,
      results,
      correctCount,
      incorrectCount,
      clearRecording,
      mode,
      currentIndex,
      startTime,
      sessionId,
      questions,
      resetTranscript,
    ]
  );

  // --- Repeat question (TTS re-read) ---
  const handleRepeat = useCallback(async () => {
    if (!currentQuestion || replaysUsed >= MAX_REPLAYS) return;

    // Stop recording during repeat
    stopListening();
    stopRecording();
    setReplaysUsed(prev => prev + 1);

    setExaminerState('speaking');
    await new Promise(resolve => setTimeout(resolve, 500));
    const speakResult = await safeSpeakLocal(currentQuestion.question_en);
    setExaminerState('listening');

    if (speakResult === 'completed' && speechSupported && micPermission) {
      resetTranscript();
      startListening().catch(() => {});
      startRecording();
    }
  }, [
    currentQuestion,
    replaysUsed,
    stopListening,
    stopRecording,
    safeSpeakLocal,
    speechSupported,
    micPermission,
    resetTranscript,
    startListening,
    startRecording,
  ]);

  // --- Quit handler ---
  const handleQuit = useCallback(() => {
    cancelTTS();
    stopListening();
    stopRecording();
    cleanupRecorder();
    const duration = Math.round((Date.now() - startTime) / 1000);
    onCompleteRef.current(results, duration, 'quit');
  }, [cancelTTS, stopListening, stopRecording, cleanupRecorder, results, startTime]);

  // --- Render helpers ---
  const isGreeting = questionPhase === 'greeting';
  const isTransition = questionPhase === 'transition';
  const showTimer = mode === 'realistic' && questionPhase === 'responding';
  const showSelfGradeButtons = questionPhase === 'grading' && !speechSupported;
  const showRecordingArea = questionPhase === 'responding' && micPermission && speechSupported;
  const showTranscriptionReview = questionPhase === 'transcription' && speechSupported;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col">
      {/* Dark interview background */}
      <div className="flex flex-1 flex-col bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 rounded-t-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/70">
              Question {currentIndex + 1} of {QUESTIONS_PER_SESSION}
            </span>
            {mode === 'practice' && (
              <span className="text-xs text-white/50">{correctCount} correct</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mode === 'practice' && (
              <button
                type="button"
                onClick={() => setShowQuitDialog(true)}
                className={clsx(
                  'flex items-center gap-1 rounded-lg px-2.5 py-1.5',
                  'text-xs text-white/50',
                  'transition-colors hover:bg-white/10 hover:text-white/80',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                )}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-white/5">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / QUESTIONS_PER_SESSION) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Timer for realistic mode */}
        {showTimer && (
          <div className="px-4 pt-2" key={currentIndex}>
            <InterviewTimer
              duration={REALISTIC_TIMER_SECONDS}
              onExpired={handleTimerExpired}
              isActive
            />
          </div>
        )}

        {/* ExaminerCharacter */}
        <div className="flex justify-center py-4">
          <ExaminerCharacter state={examinerState} size="md" />
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
          <AnimatePresence>
            {chatMessages.map(msg => (
              <ChatBubble
                key={msg.id}
                sender={msg.sender}
                isCorrect={msg.isCorrect}
                confidence={msg.confidence}
              >
                {msg.text}
              </ChatBubble>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {questionPhase === 'typing' && <TypingIndicator />}

          {/* Transcription review */}
          {showTranscriptionReview && (
            <TranscriptionReview
              transcript={transcript}
              attemptNumber={recordAttempt}
              maxAttempts={MAX_RECORD_ATTEMPTS}
              onConfirm={handleTranscriptConfirm}
              onReRecord={handleReRecord}
            />
          )}

          {/* Self-grade fallback (no speech recognition) */}
          {showSelfGradeButtons && (
            <div className="py-2">
              <p className="mb-2 text-center text-xs text-white/50">Did you answer correctly?</p>
              <SelfGradeButtons onGrade={handleSelfGrade} />
            </div>
          )}

          {/* Transition indicator */}
          {isTransition && (
            <div className="flex items-center justify-center py-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="text-xs text-white/40"
              >
                {strings.interview.nextQuestion.en}
              </motion.div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom recording area */}
        <div className="border-t border-white/10 px-4 py-3">
          {showRecordingArea ? (
            <div className="space-y-3">
              {/* Waveform */}
              <AudioWaveform stream={stream} isActive={isRecording} />

              {/* Controls row */}
              <div className="flex items-center justify-center gap-3">
                {/* Repeat button */}
                {questionPhase === 'responding' && replaysUsed < MAX_REPLAYS && (
                  <button
                    type="button"
                    onClick={handleRepeat}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-xl border border-white/20 px-3 py-2',
                      'text-xs text-white/60',
                      'transition-colors hover:bg-white/10 hover:text-white/80',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'
                    )}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>
                      Repeat ({replaysUsed}/{MAX_REPLAYS})
                    </span>
                  </button>
                )}

                {/* Manual submit button */}
                {questionPhase === 'responding' && isListening && (
                  <button
                    type="button"
                    onClick={handleManualSubmit}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2',
                      'text-xs font-semibold text-white',
                      'transition-colors hover:bg-primary/90',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                    )}
                  >
                    <Square className="h-3 w-3" />
                    <span>Done</span>
                  </button>
                )}
              </div>

              {/* Listening indicator */}
              {isListening && (
                <div className="flex items-center justify-center gap-2">
                  <Mic className="h-3.5 w-3.5 animate-pulse text-primary" />
                  <span className="text-xs text-white/50">Listening...</span>
                </div>
              )}
            </div>
          ) : questionPhase === 'responding' && !speechSupported ? (
            <div className="flex items-center justify-center gap-2 py-2 text-white/40">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">
                Speech recognition unavailable. Answer aloud, then self-grade.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center py-2">
              <span className="text-xs text-white/30">
                {isGreeting
                  ? 'The examiner is greeting you...'
                  : questionPhase === 'grading' || questionPhase === 'feedback'
                    ? 'Reviewing your answer...'
                    : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quit confirmation dialog */}
      <Dialog open={showQuitDialog} onOpenChange={setShowQuitDialog}>
        <DialogContent>
          <DialogTitle>
            {strings.interview.confirmEndTitle.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-base font-normal text-muted-foreground">
                {strings.interview.confirmEndTitle.my}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {strings.interview.confirmEndMessage.en}
            {showBurmese && (
              <span className="mt-0.5 block font-myanmar text-xs">
                {strings.interview.confirmEndMessage.my}
              </span>
            )}
          </DialogDescription>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowQuitDialog(false)}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'border border-border text-foreground',
                'transition-colors hover:bg-muted/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
              )}
            >
              {strings.interview.cancel.en}
            </button>
            <button
              type="button"
              onClick={handleQuit}
              className={clsx(
                'rounded-xl px-4 py-2 text-sm font-semibold',
                'bg-warning text-white',
                'transition-colors hover:bg-warning-600',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning'
              )}
            >
              {strings.interview.confirm.en}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
