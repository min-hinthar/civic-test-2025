'use client';

/**
 * SessionSummary - End-of-session stats and weak category nudge.
 *
 * Displays review results with easy/hard breakdown, encouraging bilingual
 * messages, and links to practice weak categories (Phase 4 integration).
 */

import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy, Target, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { allQuestions } from '@/constants/questions';
import { getUSCISCategory, USCIS_CATEGORY_NAMES } from '@/lib/mastery';
import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionResult {
  questionId: string;
  rating: 'easy' | 'hard';
  intervalText: { en: string; my: string };
}

export interface SessionSummaryProps {
  /** Array of review results from the session */
  results: SessionResult[];
  /** Callback to return to deck manager */
  onDone: () => void;
  /** Callback to navigate to practice for a weak category */
  onPracticeWeak: (category: string) => void;
  /** Additional class names */
  className?: string;
}

// ---------------------------------------------------------------------------
// Question lookup (module-level for performance)
// ---------------------------------------------------------------------------

const questionsById: Map<string, Question> = new Map(allQuestions.map(q => [q.id, q]));

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * End-of-session summary with stats, encouragement, and weak category nudge.
 *
 * Features:
 * - Total reviewed, easy count (green), hard count (orange)
 * - Encouraging bilingual messages based on performance
 * - Weak category nudge: groups hard questions by USCIS category
 * - Links to /practice?category=X for targeted practice
 * - FadeIn animation for stats reveal
 */
export function SessionSummary({
  results,
  onDone,
  onPracticeWeak,
  className,
}: SessionSummaryProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  const easyCount = useMemo(() => results.filter(r => r.rating === 'easy').length, [results]);
  const hardCount = useMemo(() => results.filter(r => r.rating === 'hard').length, [results]);
  const totalCount = results.length;

  // Group hard questions by USCIS main category
  const weakCategories = useMemo(() => {
    const hardResults = results.filter(r => r.rating === 'hard');
    const categoryMap = new Map<string, number>();

    for (const result of hardResults) {
      const question = questionsById.get(result.questionId);
      if (!question) continue;
      const mainCategory = getUSCISCategory(question.category);
      categoryMap.set(mainCategory, (categoryMap.get(mainCategory) ?? 0) + 1);
    }

    return Array.from(categoryMap.entries())
      .map(([category, count]) => ({
        category,
        count,
        name: USCIS_CATEGORY_NAMES[category as keyof typeof USCIS_CATEGORY_NAMES],
      }))
      .sort((a, b) => b.count - a.count);
  }, [results]);

  // Encouraging message based on performance
  const encouragement = useMemo(() => {
    if (totalCount === 0) {
      return {
        en: 'No cards reviewed this session.',
        my: 'ဤစစ်ဆေးခြင်းတွင် ကတ်မပြန်လှည်ပါ။',
      };
    }
    if (hardCount === 0) {
      return {
        en: 'Great memory! Keep it up!',
        my: 'မှတ်ဉာဏ်ကောင်းတယ်! ဆက်ကြိုးစားပါ!',
      };
    }
    if (easyCount === 0) {
      return {
        en: 'Every review helps! Keep going!',
        my: 'ပြန်လှည့်တိုင်းက အကူအညီပေးတယ်! ဆက်ကြိုးစားပါ!',
      };
    }
    return {
      en: 'Good effort! Review builds strength.',
      my: 'ကောင်းတဲ့ကြိုးစားမှု! ပြန်လှည့်ခြင်းက အားတည်ဆောက်ပေးတယ်!',
    };
  }, [totalCount, hardCount, easyCount]);

  const fadeVariants = {
    hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: shouldReduceMotion ? 0 : 0.1 },
        },
      }}
      className={clsx('flex flex-col gap-6', className)}
    >
      {/* Header */}
      <motion.div variants={fadeVariants} className="text-center">
        <Trophy className="h-12 w-12 text-success-500 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-foreground">Session Complete</h2>
        {showBurmese && (
          <p className="font-myanmar text-base text-muted-foreground mt-1">
            {'စစ်ဆေးခြင်းပြီးပါပြီ'}
          </p>
        )}
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={fadeVariants}>
        <div className="grid grid-cols-3 gap-3">
          {/* Total */}
          <Card className="text-center py-4 px-2">
            <p className="text-3xl font-bold text-foreground">{totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Reviewed</p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground">{'ပြန်လှည့်ပြီး'}</p>
            )}
          </Card>

          {/* Easy */}
          <Card className="text-center py-4 px-2">
            <p className="text-3xl font-bold text-success-600 dark:text-success-400">{easyCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Easy</p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground">{'လွယ်သည်'}</p>
            )}
          </Card>

          {/* Hard */}
          <Card className="text-center py-4 px-2">
            <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">{hardCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Hard</p>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground">{'ခက်သည်'}</p>
            )}
          </Card>
        </div>
      </motion.div>

      {/* Encouraging message */}
      <motion.div variants={fadeVariants} className="text-center">
        <p className="text-base font-medium text-foreground">{encouragement.en}</p>
        {showBurmese && (
          <p className="font-myanmar text-sm text-muted-foreground mt-1">{encouragement.my}</p>
        )}
      </motion.div>

      {/* Weak category nudge */}
      {weakCategories.length > 0 && (
        <motion.div variants={fadeVariants}>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-warning-500 shrink-0" />
              <p className="text-sm font-semibold text-foreground">Practice these categories</p>
            </div>
            {showBurmese && (
              <p className="font-myanmar text-xs text-muted-foreground mb-3">
                {'ဤအမျိုးအစားများကို လေ့ကျင့်ပါ'}
              </p>
            )}

            <div className="space-y-2">
              {weakCategories.map(({ category, count, name }) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onPracticeWeak(category)}
                  className={clsx(
                    'w-full flex items-center justify-between gap-3',
                    'p-3 rounded-xl',
                    'bg-warning-50 dark:bg-warning-500/10',
                    'border border-warning-500/20',
                    'hover:bg-warning-100 dark:hover:bg-warning-500/20',
                    'transition-colors duration-150',
                    'min-h-[44px]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-500'
                  )}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <BookOpen className="h-4 w-4 text-warning-600 dark:text-warning-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{name.en}</p>
                      {showBurmese && (
                        <p className="font-myanmar text-xs text-muted-foreground">{name.my}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-warning-600 dark:text-warning-400 whitespace-nowrap">
                    {count} hard
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Done button */}
      <motion.div variants={fadeVariants}>
        <Button variant="primary" size="lg" fullWidth onClick={onDone}>
          <span className="flex flex-col items-center">
            <span>Back to Deck</span>
            {showBurmese && (
              <span className="font-myanmar text-sm opacity-80">{'ကတ်များဆီသို့ပြန်သွားပါ'}</span>
            )}
          </span>
        </Button>
      </motion.div>
    </motion.div>
  );
}
