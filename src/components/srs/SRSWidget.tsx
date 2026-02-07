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
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  BookOpen,
  Flame,
  CheckCircle2,
  Plus,
} from 'lucide-react';
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
  const navigate = useNavigate();
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

  const toggleExpanded = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded((prev) => !prev);
    },
    []
  );

  const navigateToStudy = useCallback(() => {
    navigate({ pathname: '/study', hash: '#deck' });
  }, [navigate]);

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
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          <span className="text-sm text-muted-foreground">
            {showBurmese
              ? '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1019\u103B\u102C\u1038 \u1010\u1004\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A...'
              : 'Loading review cards...'}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
              <BookOpen className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1000\u102D\u102F \u1005\u1010\u1004\u103A\u1015\u102B'
                  : 'Start your review deck'}
              </p>
              <p className="text-xs text-muted-foreground">
                {showBurmese
                  ? '\u1019\u1031\u1038\u1001\u103D\u1014\u103A\u1038\u1019\u103B\u102C\u1038 \u1011\u100A\u103A\u1037\u101E\u103D\u1004\u103A\u1038\u104A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A \u1005\u1010\u1004\u103A\u1015\u102B!'
                  : 'Add questions to start reviewing!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={navigateToStudy}
            className="flex h-9 items-center gap-1.5 rounded-full bg-primary-500 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 min-h-[44px]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showBurmese ? '\u1011\u100A\u103A\u1037\u1015\u102B' : 'Add'}</span>
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50">
              <CheckCircle2 className="h-5 w-5 text-success-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? '\u1021\u102C\u1038\u101C\u102F\u1036\u1038 \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E!'
                  : 'All caught up!'}
              </p>
              {nextDueText && (
                <p className="text-xs text-muted-foreground">
                  {showBurmese
                    ? `\u1014\u1031\u102C\u1000\u103A\u101C\u102C\u1019\u100A\u103A\u1037 \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1001\u103B\u102D\u1014\u103A: ${nextDueText.my}`
                    : `Next review: ${nextDueText.en}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {reviewStreak > 0 && (
              <div className="flex items-center gap-1 text-xs text-warning-500">
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
      <button
        type="button"
        className="flex w-full items-center justify-between p-5 text-left min-h-[44px] hover:bg-muted/20 transition-colors"
        onClick={isExpanded ? toggleExpanded : navigateToStudy}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <BookOpen className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {showBurmese
                  ? `\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A ${dueCount} \u1001\u102F`
                  : `${dueCount} card${dueCount !== 1 ? 's' : ''} due`}
              </p>
              {reviewStreak > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-warning-500">
                  <Flame className="h-3 w-3" />
                  <span className="font-semibold">{reviewStreak}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {showBurmese
                ? '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1019\u103B\u102C\u1038\u1000\u102D\u102F \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A \u1014\u103E\u102D\u1015\u103A\u1015\u102B'
                : 'Tap to review your deck'}
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
      </button>

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
                <div className="flex items-center gap-2 rounded-xl bg-warning-50 px-3 py-2">
                  <Flame className="h-4 w-4 text-warning-500" />
                  <span className="text-sm font-medium text-foreground">
                    {showBurmese
                      ? `${reviewStreak} \u101B\u1000\u103A\u1006\u1000\u103A\u1010\u102D\u102F\u1000\u103A \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1014\u1031\u1015\u102B\u101E\u100A\u103A!`
                      : `${reviewStreak} day streak! Keep going!`}
                  </span>
                </div>
              )}

              {/* All caught up banner (when expanded from caught-up state) */}
              {isAllCaughtUp && nextDueText && (
                <div className="flex items-center gap-2 rounded-xl bg-success-50 px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-success-500" />
                  <span className="text-sm font-medium text-foreground">
                    {showBurmese
                      ? `\u1021\u102C\u1038\u101C\u102F\u1036\u1038 \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1015\u103C\u102E\u1038\u1015\u102B\u1015\u103C\u102E! \u1014\u1031\u102C\u1000\u103A: ${nextDueText.my}`
                      : `All caught up! Next review: ${nextDueText.en}`}
                  </span>
                </div>
              )}

              {/* Category breakdown */}
              {categoryBreakdown.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {showBurmese
                      ? '\u1000\u100f\u103a\u1039\u100b\u1021\u101C\u102D\u102F\u1000\u103A'
                      : 'By Category'}
                  </p>
                  <div className="space-y-1.5">
                    {categoryBreakdown.map((entry) => {
                      const catName = USCIS_CATEGORY_NAMES[entry.categoryId as USCISCategory];
                      const color = CATEGORY_COLORS[entry.categoryId as USCISCategory] ?? 'blue';
                      const pct = entry.totalCount > 0
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
                                color === 'blue' && 'bg-blue-500',
                                color === 'amber' && 'bg-amber-500',
                                color === 'emerald' && 'bg-emerald-500'
                              )}
                            />
                            <span className="text-foreground truncate">
                              {showBurmese && catName
                                ? catName.my
                                : catName?.en ?? entry.categoryId}
                            </span>
                          </div>
                          <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                            {entry.dueCount}/{entry.totalCount}
                            {entry.dueCount > 0 && (
                              <span className="text-xs ml-1">({pct}%)</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Review heatmap */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {showBurmese
                    ? '\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1001\u103B\u102D\u1014\u103A \u1019\u103E\u1010\u103A\u1010\u1019\u103A\u1038'
                    : 'Review Activity'}
                </p>
                <ReviewHeatmap deck={deck} />
              </div>

              {/* Go to review button */}
              <button
                type="button"
                onClick={navigateToStudy}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 min-h-[44px]"
              >
                <BookOpen className="h-4 w-4" />
                <span>
                  {showBurmese
                    ? '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1019\u103B\u102C\u1038 \u1000\u103C\u100A\u103A\u1037\u101B\u1014\u103A'
                    : 'Go to Review Deck'}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
