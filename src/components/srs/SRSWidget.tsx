'use client';

/**
 * SRSWidget - Dashboard widget for the spaced repetition system.
 *
 * Compact mode: due card count, review streak, expand chevron.
 * Expanded mode: category breakdown, review heatmap, collapse chevron.
 *
 * Tapping the compact widget navigates to the study guide review tab.
 * Empty states: deck empty vs all caught up.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, BookOpen, Flame, CheckCircle2, Plus } from 'lucide-react';
import clsx from 'clsx';

import { useSRSWidget } from '@/hooks/useSRSWidget';
import { useSRS } from '@/contexts/SRSContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { USCIS_CATEGORY_NAMES, CATEGORY_COLORS } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import { ReviewHeatmap } from './ReviewHeatmap';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SRSWidgetProps {
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SRSWidget({ className }: SRSWidgetProps) {
  const router = useRouter();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    dueCount,
    reviewStreak,
    categoryBreakdown,
    isEmpty,
    isAllCaughtUp,
    nextDueText,
    isLoading,
  } = useSRSWidget();

  const { deck } = useSRS();

  const toggleExpanded = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  }, []);

  const navigateToStudy = useCallback(() => {
    router.push('/study#deck');
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className={`text-sm text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
            {showBurmese ? 'ပြန်လည်သုံးသပ်ကတ်များ တင်နေပါသည်...' : 'Loading review cards...'}
          </span>
        </div>
      </div>
    );
  }

  // Empty deck state
  if (isEmpty) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10',
          className
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p
                className={`text-sm font-semibold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? 'ပြန်လည်သုံးသပ်ကဒ်တွဲကို စတင်ပါ' : 'Start your review deck'}
              </p>
              <p className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
                {showBurmese
                  ? 'မေးခွန်းများထည့်ပြီး ပြန်လည်သုံးသပ်ပါ!'
                  : 'Add questions to start reviewing!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={navigateToStudy}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary min-h-[44px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className={showBurmese ? 'font-myanmar' : ''}>
              {showBurmese ? 'ထည့်ပါ' : 'Add'}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // All caught up state
  if (isAllCaughtUp && !isExpanded) {
    return (
      <div
        className={clsx(
          'rounded-2xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10 cursor-pointer',
          className
        )}
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-subtle">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p
                className={`text-sm font-semibold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese ? 'အားလုံး ပြန်လည်ပြီးပါပြီ!' : 'All caught up!'}
              </p>
              {nextDueText && (
                <p className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
                  {showBurmese
                    ? `နောက်လာမည့် ပြန်လည်ချိန်: ${nextDueText.my}`
                    : `Next review: ${nextDueText.en}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reviewStreak > 0 && (
              <div className="flex items-center gap-1 text-xs text-warning">
                <Flame className="h-3.5 w-3.5" />
                <span className="font-semibold">{reviewStreak}</span>
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  // Normal state: compact or expanded
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border/60 bg-card shadow-lg shadow-primary/10 overflow-hidden',
        className
      )}
    >
      {/* Compact header - always visible */}
      <div
        role="button"
        tabIndex={0}
        className="flex w-full items-center justify-between p-5 text-left min-h-[44px] hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={isExpanded ? toggleExpanded : navigateToStudy}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            (isExpanded ? toggleExpanded : navigateToStudy)(e as unknown as React.MouseEvent);
          }
        }}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p
                className={`text-sm font-semibold text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
              >
                {showBurmese
                  ? `ပြန်လည်ရန် ${dueCount} ခု`
                  : `${dueCount} card${dueCount !== 1 ? 's' : ''} due`}
              </p>
              {reviewStreak > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-warning">
                  <Flame className="h-3 w-3" />
                  <span className="font-semibold">{reviewStreak}</span>
                </div>
              )}
            </div>
            <p className={`text-xs text-muted-foreground ${showBurmese ? 'font-myanmar' : ''}`}>
              {showBurmese ? 'ကဒ်တွဲကို ပြန်လည်သုံးသပ်ရန် နှိပ်ပါ' : 'Tap to review your deck'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleExpanded}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/40 transition-colors min-h-[44px] min-w-[44px]"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <ChevronDown
            className={clsx(
              'h-4 w-4 text-muted-foreground transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Review streak message */}
              {reviewStreak > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-warning-subtle px-3 py-2">
                  <Flame className="h-4 w-4 text-warning" />
                  <span
                    className={`text-sm font-medium text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese
                      ? `${reviewStreak} ရက်ဆက်တိုက် ပြန်လည်နေပါသည်!`
                      : `${reviewStreak} day streak! Keep going!`}
                  </span>
                </div>
              )}

              {/* All caught up banner (when expanded from caught-up state) */}
              {isAllCaughtUp && nextDueText && (
                <div className="flex items-center gap-2 rounded-xl bg-success-subtle px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span
                    className={`text-sm font-medium text-foreground ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese
                      ? `အားလုံး ပြန်လည်ပြီးပါပြီ! နောက်: ${nextDueText.my}`
                      : `All caught up! Next review: ${nextDueText.en}`}
                  </span>
                </div>
              )}

              {/* Category breakdown */}
              {categoryBreakdown.length > 0 && (
                <div className="space-y-2">
                  <p
                    className={`text-xs font-medium text-muted-foreground uppercase tracking-wider ${showBurmese ? 'font-myanmar' : ''}`}
                  >
                    {showBurmese ? 'ကဏ်္ဋအလိုက်' : 'By Category'}
                  </p>
                  <div className="space-y-1.5">
                    {categoryBreakdown.map(entry => {
                      const catName = USCIS_CATEGORY_NAMES[entry.categoryId as USCISCategory];
                      const color = CATEGORY_COLORS[entry.categoryId as USCISCategory] ?? 'blue';
                      const pct =
                        entry.totalCount > 0
                          ? Math.round((entry.dueCount / entry.totalCount) * 100)
                          : 0;

                      return (
                        <div
                          key={entry.categoryId}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={clsx(
                                'h-2.5 w-2.5 rounded-full shrink-0',
                                color === 'blue' && 'bg-primary',
                                color === 'amber' && 'bg-amber-500',
                                color === 'emerald' && 'bg-success'
                              )}
                            />
                            <span
                              className={`text-foreground truncate ${showBurmese && catName ? 'font-myanmar' : ''}`}
                            >
                              {showBurmese && catName
                                ? catName.my
                                : (catName?.en ?? entry.categoryId)}
                            </span>
                          </div>
                          <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                            {entry.dueCount}/{entry.totalCount}
                            {entry.dueCount > 0 && <span className="text-xs ml-1">({pct}%)</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review heatmap */}
              <div className="space-y-2">
                <p
                  className={`text-xs font-medium text-muted-foreground uppercase tracking-wider ${showBurmese ? 'font-myanmar' : ''}`}
                >
                  {showBurmese ? 'ပြန်လည်ချိန် မှတ်တမ်း' : 'Review Activity'}
                </p>
                <ReviewHeatmap deck={deck} />
              </div>

              {/* Go to review button */}
              <button
                type="button"
                onClick={navigateToStudy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary min-h-[44px]"
              >
                <BookOpen className="h-4 w-4" />
                <span className={showBurmese ? 'font-myanmar' : ''}>
                  {showBurmese ? 'ပြန်လည်သုံးသပ်ကဒ်တွဲသို့' : 'Go to Review Deck'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
