'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  BookOpen,
  ChevronDown,
  Mic,
  MicOff,
  Volume2,
  Star,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { PillTabBar } from '@/components/ui/PillTabBar';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualText } from '@/components/bilingual/BilingualText';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { getInterviewHistory } from '@/lib/interview';
import { checkNetworkQuality, type NetworkQuality } from '@/lib/audio/networkCheck';
import { strings } from '@/lib/i18n/strings';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTTS } from '@/hooks/useTTS';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import type { InterviewMode, InterviewSession } from '@/types';

/** Speech override for interview */
export interface InterviewSpeechOverrides {
  speedOverride: 'slow' | 'normal' | 'fast';
  /** Whether mic permission was granted during setup (avoids redundant getUserMedia) */
  micGranted: boolean;
}

interface InterviewSetupProps {
  onStart: (mode: InterviewMode, overrides?: InterviewSpeechOverrides) => void;
}

/** Speed pill options matching Settings page pattern */
const SPEED_OPTIONS: { value: 'slow' | 'normal' | 'fast'; en: string; my: string }[] = [
  { value: 'slow', en: 'Slow', my: 'နှေး' },
  { value: 'normal', en: 'Normal', my: 'ပုံမှန်' },
  { value: 'fast', en: 'Fast', my: 'မြန်' },
];

/** Tips for each mode displayed in the "What to Expect" section */
const realisticTips: Array<{ en: string; my: string }> = [
  {
    en: '20 questions, 15 seconds each',
    my: 'မေးခွန်း ၂၀၊ တစ်ခုလျှင် ၁၅ စက္ကန့်',
  },
  {
    en: 'Like the real USCIS interview',
    my: 'တကယ့် USCIS အင်တာဗျူးကဲ့သို့',
  },
  {
    en: 'Cannot pause or quit',
    my: 'ရပ်တန့်ခြင်း သို့မဟုတ် ထွက်ခြင်းမပြုနိုင်ပါ',
  },
  {
    en: 'Stops when you pass (12 correct) or fail (9 incorrect)',
    my: 'အောင်မြင်ရင် (၁၂ ခုမှန်) သို့ ကျရှုံးရင် (၉ ခုမှား) ရပ်ပါမည်',
  },
];

const practiceTips: Array<{ en: string; my: string }> = [
  {
    en: '20 questions at your own pace',
    my: 'မေးခွန်း ၂၀ သင့်အချိန်အတိုင်း',
  },
  {
    en: 'See explanations after each question',
    my: 'မေးခွန်းတစ်ခုပြီးတိုင်း ရှင်းလင်းချက်ကြည့်ပါ',
  },
  {
    en: 'Pause or quit anytime',
    my: 'အချိန်မရွေး ရပ်တန့်နိုင် သို့ ထွက်နိုင်ပါသည်',
  },
  {
    en: 'Add cards to your review deck',
    my: 'ပြန်လည်လေ့လာရန် ကတ်များထည့်ပါ',
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
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality | null>(null);

  // Per-session speed override (initialized from global, NOT synced back)
  // Only applicable in Practice mode; Real mode uses fixed normal speed
  const [sessionSpeed, setSessionSpeed] = useState<'slow' | 'normal' | 'fast'>(globalTTS.rate);

  // Load recent interview history + check network quality
  useEffect(() => {
    let cancelled = false;
    getInterviewHistory().then(history => {
      if (!cancelled) {
        setRecentSessions(history.slice(0, 5));
      }
    });
    checkNetworkQuality().then(quality => {
      if (!cancelled) {
        setNetworkQuality(quality);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Detect iOS Safari (UA check: Safari + NOT Chrome + iPhone/iPad)
  const isIOSSafari = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /iPhone|iPad/.test(ua) && /Safari/.test(ua) && !/CriOS|Chrome/.test(ua);
  }, []);

  // Best score identification: highest correct/total ratio
  const bestSessionIndex = useMemo(() => {
    if (recentSessions.length === 0) return -1;
    let bestIdx = 0;
    let bestRatio = recentSessions[0].score / (recentSessions[0].totalQuestions || 1);
    for (let i = 1; i < recentSessions.length; i++) {
      const ratio = recentSessions[i].score / (recentSessions[i].totalQuestions || 1);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIdx = i;
      }
    }
    return bestIdx;
  }, [recentSessions]);

  // Display sessions: last 3 recent + best (if best is outside the 3)
  const displaySessions = useMemo(() => {
    if (recentSessions.length === 0) return [];
    const last3 = recentSessions.slice(0, 3);
    // If best is within the 3 most recent, just show last 3
    if (bestSessionIndex < 3) return last3;
    // Otherwise, show last 3 + best session
    return [...last3, recentSessions[bestSessionIndex]];
  }, [recentSessions, bestSessionIndex]);

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
          <p className="font-myanmar mt-1 text-sm text-muted-foreground text-center">
            ဤလေ့ကျင့်ခန်းသည် တကယ့် USCIS နိုင်ငံသားစာမေးပွဲကို တူညီစေပါသည် — မေးခွန်းများသည်
            အင်္ဂလိပ်ဘာသာဖြင့်သာ ဖြစ်ပါသည်။
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
                <p className="font-myanmar text-sm text-muted-foreground">
                  မေးခွန်း ၂၀။ ၁၂ ခုမှန်လျှင် အောင်မြင်။ ၉ ခုမှားလျှင် ကျရှုံး။
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
                <p className="font-myanmar text-sm text-muted-foreground">
                  မေးခွန်းတစ်ခုပြီးတိုင်း အကြံပြုချက်ရရှိပါသည်။ သင်ယူရန် အကောင်းဆုံး။
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
                  <span className="font-myanmar text-sm text-muted-foreground">စကားပြောနှုန်း</span>
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
                      <span className="block font-myanmar text-sm mt-0.5 font-normal">
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
              onStart(selectedMode, {
                speedOverride: selectedMode === 'practice' ? sessionSpeed : 'normal',
                micGranted: micPermission === 'granted',
              })
            }
            className={clsx(
              'mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white min-h-[48px]',
              'shadow-[0_4px_0_hsl(var(--primary-700))] hover:shadow-[0_4px_0_hsl(var(--primary-800))]',
              'active:shadow-[0_1px_0_hsl(var(--primary-800))] active:translate-y-[3px]',
              'transition-[box-shadow,transform] duration-100'
            )}
          >
            {showBurmese ? <span className="font-myanmar">စတင်ပါ</span> : 'Start Interview'}
          </button>

          {/* Network quality warning */}
          {networkQuality === 'slow' && (
            <div className="mt-2 flex items-center gap-1.5 text-center">
              <Wifi className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-500">
                {strings.interview.slowConnection.en}
                {showBurmese && (
                  <span className="font-myanmar block mt-0.5">
                    {strings.interview.slowConnection.my}
                  </span>
                )}
              </p>
            </div>
          )}
          {networkQuality === 'offline' && (
            <div className="mt-2 flex items-center gap-1.5 text-center">
              <WifiOff className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
              <p className="text-xs text-destructive">
                {strings.interview.offlineAudio.en}
                {showBurmese && (
                  <span className="font-myanmar block mt-0.5">
                    {strings.interview.offlineAudio.my}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Answer in English guidance (Myanmar mode only) */}
      {showBurmese && (
        <div className="mb-4 text-center">
          <p className="font-myanmar text-xs text-muted-foreground">
            အင်တာဗျူးတွင် အင်္ဂလိပ်ဘာသာဖြင့် ဖြေဆိုပါ
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
                <span className="font-myanmar text-sm">· မိုက်ခရိုဖုန်း အဆင်သင့်</span>
              )}
            </>
          ) : micPermission === 'denied' ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <MicOff className="h-4 w-4 text-warning" />
                <span className="font-bold">
                  Recording unavailable - you can still type your answers
                </span>
              </div>
              {showBurmese && (
                <span className="font-myanmar text-xs text-muted-foreground">
                  အသံဖမ်း၍မရပါ - အဖြေများကို စာရိုက်နိုင်ပါသည်
                </span>
              )}
              {isIOSSafari && (
                <span className="text-xs text-muted-foreground mt-0.5">
                  {strings.interview.voiceInputHint.en}
                  {showBurmese && (
                    <span className="font-myanmar ml-1">{strings.interview.voiceInputHint.my}</span>
                  )}
                </span>
              )}
            </div>
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
                      <span className="ml-1 font-myanmar font-normal text-sm text-muted-foreground">
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
                      <span className="ml-1 font-myanmar font-normal text-sm text-muted-foreground">
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

        {displaySessions.length === 0 ? (
          <Card elevated={false} className="text-center">
            <p className="text-4xl mb-2">🎤</p>
            <p className="text-sm font-bold text-muted-foreground">First time? Give it a try!</p>
            {showBurmese && (
              <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                ပထမဆုံးအကြိမ်လား? စမ်းကြည့်ပါ!
              </p>
            )}
          </Card>
        ) : (
          <div className="flex flex-wrap gap-3">
            {displaySessions.map((session, i) => {
              // Determine if this session is the best overall
              const actualIndex = recentSessions.indexOf(session);
              const isBest = actualIndex === bestSessionIndex;
              const isBestFromOlder = isBest && bestSessionIndex >= 3;

              return (
                <div
                  key={session.id ?? i}
                  className={clsx(
                    'flex items-center gap-2 rounded-2xl border bg-card px-3.5 py-2.5 text-sm shadow-sm',
                    isBest ? 'border-2 border-amber-400' : 'border border-border/60'
                  )}
                >
                  {isBest && (
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                  )}
                  {isBestFromOlder && (
                    <span className="text-xs font-semibold text-amber-500">
                      {strings.interview.bestScore.en}:
                    </span>
                  )}
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
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
