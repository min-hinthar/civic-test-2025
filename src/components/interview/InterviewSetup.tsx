'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, BookOpen, ChevronDown, Mic, MicOff, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { PillTabBar } from '@/components/ui/PillTabBar';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualText } from '@/components/bilingual/BilingualText';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { getInterviewHistory } from '@/lib/interview';
import { strings } from '@/lib/i18n/strings';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTS } from '@/hooks/useTTS';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import type { InterviewMode, InterviewSession } from '@/types';

/** Speech override for interview (speed only -- auto-read always on) */
export interface InterviewSpeechOverrides {
  speedOverride: 'slow' | 'normal' | 'fast';
}

interface InterviewSetupProps {
  onStart: (mode: InterviewMode, overrides?: InterviewSpeechOverrides) => void;
}

/** Speed pill options matching Settings page pattern */
const SPEED_OPTIONS: { value: 'slow' | 'normal' | 'fast'; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: '\u1014\u103E\u1031\u1038' },
  { value: 'normal', en: 'Normal', my: '\u1015\u102F\u1036\u1019\u103E\u1014\u103A' },
  { value: 'fast', en: 'Fast', my: '\u1019\u103C\u1014\u103A' },
];

/** Tips for each mode displayed in the "What to Expect" section */
const realisticTips: Array<{ en: string; my: string }> = [
  {
    en: '20 questions, 15 seconds each',
    my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1042\u1040\u104D \u1010\u1005\u103A\u1001\u102F\u101C\u103B\u103E\u1004\u103A \u1041\u1045 \u1005\u1000\u1039\u1000\u1014\u1037\u103A',
  },
  {
    en: 'Like the real USCIS interview',
    my: '\u1010\u1000\u101A\u103A\u1037 USCIS \u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1000\u1032\u1037\u101E\u102D\u102F\u1037',
  },
  {
    en: 'Cannot pause or quit',
    my: '\u101B\u1015\u103A\u1010\u1014\u1037\u103A\u1001\u103C\u1004\u103A\u1038 \u101E\u102D\u102F\u1037\u1019\u101F\u102F\u1010\u103A \u1011\u103D\u1000\u103A\u1001\u103C\u1004\u103A\u1038\u1019\u1015\u103C\u102F\u1014\u102D\u102F\u1004\u103A\u1015\u102B',
  },
  {
    en: 'Stops when you pass (12 correct) or fail (9 incorrect)',
    my: '\u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u101B\u1004\u103A (\u1041\u1042 \u1001\u102F\u1019\u103E\u1014\u103A) \u101E\u102D\u102F\u1037 \u1000\u103B\u101B\u103E\u102F\u1036\u1038\u101B\u1004\u103A (\u1049 \u1001\u102F\u1019\u103E\u102C\u1038) \u101B\u1015\u103A\u1015\u102B\u1019\u100A\u103A',
  },
];

const practiceTips: Array<{ en: string; my: string }> = [
  {
    en: '20 questions at your own pace',
    my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1042\u1040 \u101E\u1004\u1037\u103A\u1021\u1001\u103B\u102D\u1014\u103A\u1021\u1010\u102D\u102F\u1004\u103A\u1038',
  },
  {
    en: 'See explanations after each question',
    my: '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1010\u1005\u103A\u1001\u102F\u1015\u103C\u102E\u1038\u1010\u102D\u102F\u1004\u103A\u1038 \u101B\u103E\u1004\u103A\u1038\u101C\u1004\u103A\u1038\u1001\u103B\u1000\u103A\u1000\u103C\u100A\u1037\u103A\u1015\u102B',
  },
  {
    en: 'Pause or quit anytime',
    my: '\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u101B\u103D\u1031\u1038 \u101B\u1015\u103A\u1010\u1014\u1037\u103A\u1014\u102D\u102F\u1004\u103A \u101E\u102D\u102F\u1037 \u1011\u103D\u1000\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A',
  },
  {
    en: 'Add cards to your review deck',
    my: '\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A \u1000\u1010\u103A\u1019\u103B\u102C\u1038\u1011\u100A\u1037\u103A\u1015\u102B',
  },
];

/**
 * Interview setup screen with Duolingo-style mode selection.
 *
 * Features:
 * - PillTabBar mode selector with Practice/Real tabs
 * - Mode info panel with badge, description, USCIS 2025 rules
 * - Rounded-2xl cards, bold typography
 * - Bilingual tips section
 * - Recent score chips
 * - Proactive microphone permission
 */
export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();
  const { isSupported: ttsSupported } = useTTS();
  const { settings: globalTTS } = useTTSSettings();
  const [selectedMode, setSelectedMode] = useState<InterviewMode>('practice');
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Per-session speed override (initialized from global, NOT synced back)
  // Only applicable in Practice mode; Real mode uses fixed normal speed
  const [sessionSpeed, setSessionSpeed] = useState<'slow' | 'normal' | 'fast'>(globalTTS.rate);

  // Load recent interview history
  useEffect(() => {
    let cancelled = false;
    getInterviewHistory().then(history => {
      if (!cancelled) {
        setRecentSessions(history.slice(0, 5));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Proactively request microphone permission
  useEffect(() => {
    let cancelled = false;
    const checkMic = async () => {
      if (!navigator.mediaDevices) {
        if (!cancelled) setMicPermission('denied');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        if (!cancelled) setMicPermission('granted');
      } catch {
        if (!cancelled) setMicPermission('denied');
      }
    };
    void checkMic();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTips = useCallback(() => {
    setTipsExpanded(prev => !prev);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-2xl px-4 py-8"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : SPRING_GENTLE}
    >
      {/* Page title */}
      <BilingualHeading
        text={strings.interview.practiceInterview}
        level={1}
        size="2xl"
        centered
        className="mb-6"
      />

      {/* Interviewer avatar (decorative) */}
      <div className="mb-8 flex justify-center">
        <InterviewerAvatar size={80} />
      </div>

      {/* USCIS simulation message */}
      <div className="mb-6 mx-auto max-w-md rounded-xl border border-primary/30 bg-primary-subtle/20 px-4 py-3">
        <p className="text-sm font-medium text-foreground text-center">
          This simulates the real USCIS civics test — questions are in English only.
        </p>
        {showBurmese && (
          <p className="font-myanmar mt-1 text-xs text-muted-foreground text-center">
            {
              '\u1024\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1001\u1014\u103A\u1038\u101E\u100A\u103A \u1010\u1000\u101A\u1037\u103A USCIS \u1014\u102D\u102F\u1004\u103A\u1004\u1036\u101E\u102C\u1038\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1000\u102D\u102F \u1010\u1030\u100A\u102E\u1005\u1031\u1015\u102B\u101E\u100A\u103A \u2014 \u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038\u101E\u100A\u103A \u1021\u1004\u1039\u1002\u101C\u102D\u1015\u103A\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u1037\u103A\u101E\u102C \u1016\u103C\u1005\u103A\u1015\u102B\u101E\u100A\u103A\u104B'
            }
          </p>
        )}
      </div>

      {/* Mode selector - PillTabBar */}
      <div className="mb-6">
        <PillTabBar
          tabs={[
            {
              id: 'practice',
              label: 'Practice',
              labelMy: strings.interview.practiceMode.my,
              icon: BookOpen,
            },
            {
              id: 'realistic',
              label: 'Real Exam',
              labelMy: strings.interview.realisticMode.my,
              icon: Shield,
            },
          ]}
          activeTab={selectedMode}
          onTabChange={id => setSelectedMode(id as InterviewMode)}
          ariaLabel="Interview mode"
          showBurmese={showBurmese}
        />
      </div>

      {/* Mode info panel - larger, more prominent */}
      <Card elevated={false} className="mb-6">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Mode badge */}
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                selectedMode === 'realistic'
                  ? 'bg-primary-subtle text-primary'
                  : 'bg-accent/20 text-accent-foreground'
              )}
            >
              {selectedMode === 'realistic' ? (
                <>
                  <Shield className="h-3.5 w-3.5" />
                  USCIS Simulation
                </>
              ) : (
                <>
                  <BookOpen className="h-3.5 w-3.5" />
                  Practice
                </>
              )}
            </span>
          </div>

          {/* Mode icon */}
          <div
            className={clsx(
              'flex h-16 w-16 items-center justify-center rounded-2xl',
              selectedMode === 'realistic'
                ? 'bg-primary-subtle text-primary'
                : 'bg-accent/20 text-accent-foreground'
            )}
          >
            {selectedMode === 'realistic' ? (
              <Shield className="h-8 w-8" />
            ) : (
              <BookOpen className="h-8 w-8" />
            )}
          </div>

          {/* Mode description */}
          {selectedMode === 'realistic' ? (
            <div className="space-y-2">
              <p className="text-base font-bold text-foreground">USCIS 2025 Rules</p>
              <p className="text-sm text-muted-foreground">
                20 questions. Pass at 12 correct. Fail at 9 incorrect.
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038 \u1042\u1040\u104B \u1041\u1042 \u1001\u102F\u1019\u103E\u1014\u103A\u101C\u103B\u103E\u1004\u103A \u1021\u1031\u102C\u1004\u103A\u1019\u103C\u1004\u103A\u104B \u1049 \u1001\u102F\u1019\u103E\u102C\u1038\u101C\u103B\u103E\u1004\u103A \u1000\u103B\u101B\u103E\u102F\u1036\u1038\u104B'
                  }
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  15s per question
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  No feedback until end
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Cannot quit
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-base font-bold text-foreground">Learn at Your Pace</p>
              <p className="text-sm text-muted-foreground">
                Get feedback after each question. Great for learning!
              </p>
              {showBurmese && (
                <p className="font-myanmar text-xs text-muted-foreground">
                  {
                    '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1010\u1005\u103A\u1001\u102F\u1015\u103C\u102E\u1038\u1010\u102D\u102F\u1004\u103A\u1038 \u1021\u1000\u103C\u1036\u1015\u103C\u102F\u1001\u103B\u1000\u103A\u101B\u101B\u103E\u102D\u1015\u102B\u101E\u100A\u103A\u104B \u101E\u1004\u103A\u101A\u1030\u101B\u1014\u103A \u1021\u1000\u1031\u102C\u1004\u103A\u1038\u1006\u102F\u1036\u1038\u104B'
                  }
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2 pt-1">
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  No time limit
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Explanations shown
                </span>
                <span className="rounded-lg bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground">
                  Quit anytime
                </span>
              </div>
            </div>
          )}

          {/* Speech speed selector (Practice mode only, TTS supported) */}
          {selectedMode === 'practice' && ttsSupported && (
            <div className="w-full border-t border-border/40 pt-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Volume2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">Speech Speed</p>
                {showBurmese && (
                  <span className="font-myanmar text-xs text-muted-foreground">
                    {
                      '\u1005\u1000\u102C\u1038\u1015\u103C\u1031\u102C\u1014\u103E\u102F\u1014\u103A\u1038'
                    }
                  </span>
                )}
              </div>
              <div className="flex gap-2" role="radiogroup" aria-label="Speech speed">
                {SPEED_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={sessionSpeed === option.value}
                    onClick={() => setSessionSpeed(option.value)}
                    className={clsx(
                      'flex-1 rounded-xl border-2 px-3 py-2.5 text-center text-sm font-bold transition-all duration-150 min-h-[44px]',
                      sessionSpeed === option.value
                        ? 'border-primary bg-primary-subtle text-primary shadow-[0_2px_0_0] shadow-primary-200'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                    )}
                  >
                    <span>{option.en}</span>
                    {showBurmese && (
                      <span className="block font-myanmar text-xs mt-0.5 font-normal">
                        {option.my}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={() =>
              onStart(
                selectedMode,
                selectedMode === 'practice'
                  ? { speedOverride: sessionSpeed }
                  : { speedOverride: 'normal' }
              )
            }
            className={clsx(
              'mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white min-h-[48px]',
              'shadow-[0_4px_0_hsl(var(--primary-700))] hover:shadow-[0_4px_0_hsl(var(--primary-800))]',
              'active:shadow-[0_1px_0_hsl(var(--primary-800))] active:translate-y-[3px]',
              'transition-[box-shadow,transform] duration-100'
            )}
          >
            {showBurmese ? (
              <span className="font-myanmar">{'\u1005\u1010\u1004\u103A\u1015\u102B'}</span>
            ) : (
              'Start Interview'
            )}
          </button>
        </div>
      </Card>

      {/* Answer in English guidance (Myanmar mode only) */}
      {showBurmese && (
        <div className="mb-4 text-center">
          <p className="font-myanmar text-xs text-muted-foreground">
            {
              '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1010\u103D\u1004\u103A \u1021\u1004\u1039\u1002\u101C\u102D\u1015\u103A\u1018\u102C\u101E\u102C\u1016\u103C\u1004\u1037\u103A \u1016\u103C\u1031\u1006\u102D\u102F\u1015\u102B'
            }
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">(Answer questions in English)</p>
        </div>
      )}

      {/* Microphone permission notice */}
      <div className="mb-6">
        <Card
          elevated={false}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground !p-3"
        >
          {micPermission === 'granted' ? (
            <>
              <Mic className="h-4 w-4 text-success" />
              <span className="font-bold">Microphone ready</span>
              {showBurmese && (
                <span className="font-myanmar text-xs">
                  {
                    '\u00B7 \u1019\u102D\u102F\u1000\u103A\u1001\u103C\u102D\u102F\u1016\u102F\u1014\u103A\u1038 \u1021\u1006\u1004\u103A\u101E\u1004\u1037\u103A'
                  }
                </span>
              )}
            </>
          ) : micPermission === 'denied' ? (
            <>
              <MicOff className="h-4 w-4 text-warning" />
              <span className="font-bold">Recording unavailable - answer verbally</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Requesting microphone access...</span>
            </>
          )}
        </Card>
      </div>

      {/* What to Expect section - rounded-2xl */}
      <div className="mb-6">
        <button
          type="button"
          onClick={toggleTips}
          className="flex w-full items-center justify-between rounded-2xl bg-card px-5 py-3.5 text-left border border-border/60 transition-colors hover:bg-muted/40 min-h-[44px]"
        >
          <BilingualText text={strings.interview.whatToExpect} size="sm" className="font-bold" />
          <motion.div animate={{ rotate: tipsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </button>

        <AnimatePresence>
          {tipsExpanded && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Real exam tips */}
                <Card elevated={false}>
                  <h3 className="mb-2 text-sm font-bold text-foreground">
                    Real Exam
                    {showBurmese && (
                      <span className="ml-1 font-myanmar font-normal text-xs text-muted-foreground">
                        {strings.interview.realisticMode.my}
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {realisticTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-400" />
                        <BilingualText text={tip} size="xs" />
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Practice tips */}
                <Card elevated={false}>
                  <h3 className="mb-2 text-sm font-bold text-foreground">
                    Practice
                    {showBurmese && (
                      <span className="ml-1 font-myanmar font-normal text-xs text-muted-foreground">
                        {strings.interview.practiceMode.my}
                      </span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {practiceTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent/60" />
                        <BilingualText text={tip} size="xs" />
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent scores section - rounded-2xl chips */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-muted-foreground">
          <BilingualText text={strings.interview.recentScores} size="sm" />
        </h3>

        {recentSessions.length === 0 ? (
          <Card elevated={false} className="text-center">
            <p className="text-4xl mb-2">🎤</p>
            <p className="text-sm font-bold text-muted-foreground">First time? Give it a try!</p>
            {showBurmese && (
              <p className="mt-1 font-myanmar text-xs text-muted-foreground">
                {
                  '\u1015\u1011\u1019\u1006\u102F\u1036\u1038\u1021\u1000\u103C\u102D\u1019\u103A\u101C\u102C\u1038? \u1005\u1019\u103A\u1038\u1000\u103C\u100A\u1037\u103A\u1015\u102B!'
                }
              </p>
            )}
          </Card>
        ) : (
          <div className="flex flex-wrap gap-3">
            {recentSessions.map((session, i) => (
              <div
                key={session.id ?? i}
                className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3.5 py-2.5 text-sm shadow-sm"
              >
                <span className="text-muted-foreground">{formatDate(session.date)}</span>
                {session.mode === 'realistic' ? (
                  <Shield className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <BookOpen className="h-3.5 w-3.5 text-accent-foreground" />
                )}
                <span className="font-bold">
                  {session.score}/{session.totalQuestions}
                </span>
                <span
                  className={clsx(
                    'rounded-full px-2.5 py-0.5 text-xs font-bold',
                    session.passed
                      ? 'bg-success-100 text-success-600 dark:text-success'
                      : 'bg-warning-100 text-warning'
                  )}
                >
                  {session.passed ? strings.interview.passed.en : strings.interview.failed.en}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
