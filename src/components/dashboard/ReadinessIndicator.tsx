'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { strings } from '@/lib/i18n/strings';

interface ReadinessIndicatorProps {
  /** Total questions answered correctly (unique) */
  correctCount: number;
  /** Total unique questions in the bank */
  totalQuestions: number;
  /** Recent test accuracy (last 5 tests average) */
  recentAccuracy: number;
  /** Current study streak in days */
  streakDays: number;
  /** Callback when user clicks "Start Test" */
  onStartTest: () => void;
}

type ReadinessLevel = 'not-ready' | 'getting-there' | 'almost-ready' | 'ready';

/**
 * "Am I ready?" readiness confidence indicator for dashboard.
 *
 * Features:
 * - Visual readiness gauge based on progress metrics
 * - Bilingual encouraging messages based on level
 * - Quick "Start Test" CTA when ready
 * - Anxiety-reducing: always positive framing
 *
 * Readiness calculation:
 * - Coverage: % of unique questions answered correctly (50% weight)
 * - Accuracy: Recent test performance (40% weight)
 * - Consistency: Study streak bonus (max 10%)
 */
export function ReadinessIndicator({
  correctCount,
  totalQuestions,
  recentAccuracy,
  streakDays,
  onStartTest,
}: ReadinessIndicatorProps) {
  const shouldReduceMotion = useReducedMotion();

  // Calculate readiness score (0-100)
  const { readinessScore, level, message } = useMemo(() => {
    const coveragePercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const accuracyWeight = recentAccuracy * 0.4;
    const coverageWeight = coveragePercent * 0.5;
    const streakBonus = Math.min(streakDays * 2, 10); // Max 10% bonus

    const score = Math.min(100, Math.round(accuracyWeight + coverageWeight + streakBonus));

    let level: ReadinessLevel;
    let message: { en: string; my: string };

    if (score >= 80) {
      level = 'ready';
      message = {
        en: "You're ready! Your hard work is paying off.",
        my: 'သင်အဆင်သင့်ဖြစ်ပါပြီ! သင့်ကြိုးစားမှုက အကျိုးပေးနေပါပြီ။',
      };
    } else if (score >= 60) {
      level = 'almost-ready';
      message = {
        en: "Almost there! A little more practice and you'll be confident.",
        my: 'နီးပါပြီ! နည်းနည်းလေ့ကျင့်ရင် ယုံကြည်မှုရပါမယ်။',
      };
    } else if (score >= 30) {
      level = 'getting-there';
      message = {
        en: "You're making great progress! Keep studying.",
        my: 'သင်ကောင်းကောင်းတိုးတက်နေပါတယ်! ဆက်လေ့လာပါ။',
      };
    } else {
      level = 'not-ready';
      message = {
        en: "You're just getting started! Every question helps.",
        my: 'သင်စတင်နေပါပြီ! မေးခွန်းတိုင်းက အကူအညီဖြစ်ပါတယ်။',
      };
    }

    return { readinessScore: score, level, message };
  }, [correctCount, totalQuestions, recentAccuracy, streakDays]);

  const levelColors: Record<ReadinessLevel, string> = {
    'not-ready': 'text-muted-foreground',
    'getting-there': 'text-amber-500',
    'almost-ready': 'text-primary-500',
    ready: 'text-emerald-500',
  };

  // Map readiness levels to available Progress variant types
  const progressVariants: Record<ReadinessLevel, 'default' | 'success' | 'warning'> = {
    'not-ready': 'default',
    'getting-there': 'warning',
    'almost-ready': 'default',
    ready: 'success',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={shouldReduceMotion || level !== 'ready' ? {} : { scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {level === 'ready' ? (
              <Sparkles className="h-6 w-6 text-emerald-500" />
            ) : level === 'almost-ready' ? (
              <CheckCircle className="h-6 w-6 text-primary-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            )}
          </motion.div>
          <BilingualHeading text={strings.dashboard.readyForTest} level={3} size="md" />
        </div>

        {/* Readiness gauge */}
        <div className="mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <span className={clsx('text-3xl font-bold tabular-nums', levelColors[level])}>
              {readinessScore}%
            </span>
            <span className="text-sm text-muted-foreground">
              Readiness /{' '}
              <span className="font-myanmar">
                {
                  'အဆင်သင့်ဖြစ်မှု'
                }
              </span>
            </span>
          </div>
          <Progress value={readinessScore} variant={progressVariants[level]} size="lg" />
        </div>

        {/* Encouraging message */}
        <p className="text-sm text-muted-foreground mb-4">
          {message.en}
          <span className="block font-myanmar mt-0.5">{message.my}</span>
        </p>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
          <div className="rounded-xl bg-muted/50 p-2">
            <div className="font-bold text-foreground">
              {correctCount}/{totalQuestions}
            </div>
            <div className="text-xs text-muted-foreground">Mastered</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-2">
            <div className="font-bold text-foreground">{Math.round(recentAccuracy)}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="rounded-xl bg-muted/50 p-2">
            <div className="font-bold text-foreground">{streakDays}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>

        {/* CTA Button */}
        <BilingualButton
          label={strings.actions.startTest}
          variant={level === 'ready' ? 'primary' : 'secondary'}
          fullWidth
          onClick={onStartTest}
        />
      </CardContent>
    </Card>
  );
}
