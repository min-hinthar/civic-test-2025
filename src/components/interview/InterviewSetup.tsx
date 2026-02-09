'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, BookOpen, ChevronDown, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualText } from '@/components/bilingual/BilingualText';
import { InterviewerAvatar } from '@/components/interview/InterviewerAvatar';
import { getInterviewHistory } from '@/lib/interview';
import { strings } from '@/lib/i18n/strings';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import type { InterviewMode, InterviewSession } from '@/types';

interface InterviewSetupProps {
  onStart: (mode: InterviewMode) => void;
}

/** Tips for each mode displayed in the "What to Expect" section */
const realisticTips: Array<{ en: string; my: string }> = [
  {
    en: '20 questions, 15 seconds each',
    my: 'မေးခွန်း ၂၀၍ တစ်ခုလျှင် ၁၅ စက္ကန့်',
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
 * Interview setup screen with Duolingo-style mode selection cards.
 *
 * Features:
 * - 3D chunky mode selection cards with hover lift
 * - Rounded-2xl cards, bold typography
 * - Bilingual tips section
 * - Recent score chips
 * - Proactive microphone permission
 */
export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();
  const [tipsExpanded, setTipsExpanded] = useState(false);
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

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
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(stream => {
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(t => t.stop());
        if (!cancelled) {
          setMicPermission('granted');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMicPermission('denied');
        }
      });
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
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

      {/* Mode selection cards - 3D chunky with Duolingo treatment */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Realistic mode */}
        <Card
          interactive
          onClick={() => onStart('realistic')}
          className="group border-2 border-transparent transition-colors hover:border-primary-400"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400">
              <Shield className="h-7 w-7" />
            </div>
            <div>
              <BilingualText
                text={strings.interview.realisticMode}
                size="md"
                className="font-bold"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <BilingualText text={strings.interview.realisticTip} size="sm" />
            </p>
            {/* 3D Start button */}
            <span
              className={clsx(
                'mt-2 inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white min-h-[44px]',
                'shadow-[0_4px_0_hsl(var(--primary-700))] group-hover:shadow-[0_4px_0_hsl(var(--primary-800))]',
                'group-active:shadow-[0_1px_0_hsl(var(--primary-800))] group-active:translate-y-[3px]',
                'transition-[box-shadow,transform] duration-100'
              )}
            >
              {showBurmese ? (
                <span className="font-myanmar">{'စတင်ပါ'}</span>
              ) : (
                'Start'
              )}
            </span>
          </div>
        </Card>

        {/* Practice mode */}
        <Card
          interactive
          onClick={() => onStart('practice')}
          className="group border-2 border-transparent transition-colors hover:border-accent"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/20 text-accent-foreground">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <BilingualText
                text={strings.interview.practiceMode}
                size="md"
                className="font-bold"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              <BilingualText text={strings.interview.practiceTip} size="sm" />
            </p>
            {/* 3D Start button */}
            <span
              className={clsx(
                'mt-2 inline-flex items-center justify-center rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-bold text-white min-h-[44px]',
                'shadow-[0_4px_0_hsl(var(--primary-700))] group-hover:shadow-[0_4px_0_hsl(var(--primary-800))]',
                'group-active:shadow-[0_1px_0_hsl(var(--primary-800))] group-active:translate-y-[3px]',
                'transition-[box-shadow,transform] duration-100'
              )}
            >
              {showBurmese ? (
                <span className="font-myanmar">{'စတင်ပါ'}</span>
              ) : (
                'Start'
              )}
            </span>
          </div>
        </Card>
      </div>

      {/* Microphone permission notice */}
      <div className="mb-6">
        <Card
          elevated={false}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground !p-3"
        >
          {micPermission === 'granted' ? (
            <>
              <Mic className="h-4 w-4 text-success-500" />
              <span className="font-bold">Microphone ready</span>
              {showBurmese && (
                <span className="font-myanmar text-xs">
                  · မိုက်ခြိုဖုန်း အဆင်သင့်
                </span>
              )}
            </>
          ) : micPermission === 'denied' ? (
            <>
              <MicOff className="h-4 w-4 text-warning-500" />
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
                {/* Realistic tips */}
                <Card elevated={false}>
                  <h3 className="mb-2 text-sm font-bold text-foreground">
                    {strings.interview.realisticMode.en}
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
                    {strings.interview.practiceMode.en}
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
            <p className="mt-1 font-myanmar text-xs text-muted-foreground">
              {
                'ပထမဆုံးအကြိမ်လား? စမ်းကြည့်ပါ!'
              }
            </p>
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
                  <Shield className="h-3.5 w-3.5 text-primary-500" />
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
                      ? 'bg-success-100 text-success-600 dark:bg-success-500/15 dark:text-success-400'
                      : 'bg-warning-100 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400'
                  )}
                >
                  {session.passed ? strings.interview.passed.en : strings.interview.failed.en}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
