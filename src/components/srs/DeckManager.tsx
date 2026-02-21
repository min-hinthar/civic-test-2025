'use client';

/**
 * DeckManager - SRS deck management view (overhauled).
 *
 * Displays all cards in the user's review deck with:
 * - Progress bar showing reviewed/total count
 * - Category dropdown filter
 * - Clickable ReviewDeckCard components with spring animations
 * - Enhanced celebration empty state when all cards reviewed
 * - Bulk-add for weak area questions and review launch
 *
 * Integrated as a sub-view within StudyGuidePage via #deck hash route.
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import * as Progress from '@radix-ui/react-progress';
import clsx from 'clsx';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { ReviewDeckCard } from '@/components/srs/ReviewDeckCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSRSDeck } from '@/hooks/useSRSDeck';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { allQuestions } from '@/constants/questions';
import { isDue, getNextReviewText } from '@/lib/srs';
import type { SRSCardRecord } from '@/lib/srs';
import type { Question } from '@/types';
import type { CategoryMasteryEntry } from '@/lib/mastery';
import { USCIS_CATEGORIES, getCategoryQuestionIds } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
import { SPRING_BOUNCY, SPRING_GENTLE } from '@/lib/motion-config';
import { State } from 'ts-fsrs';

// ---------------------------------------------------------------------------
// Module-level question lookup for O(1) access
// ---------------------------------------------------------------------------

const questionsById: Map<string, Question> = new Map(allQuestions.map(q => [q.id, q]));

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DeckManagerProps {
  onStartReview: () => void;
  onBack: () => void;
}

// ---------------------------------------------------------------------------
// Sorting: Due first, then New, then Done
// ---------------------------------------------------------------------------

function sortOrder(record: SRSCardRecord): number {
  const { card } = record;
  if (isDue(card)) return 0; // Due first
  if (card.state === State.New && card.reps === 0) return 1; // New second
  return 2; // Done last
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DeckManager({ onStartReview, onBack }: DeckManagerProps) {
  const navigate = useNavigate();
  const { deck, dueCount, isLoading, removeCard, bulkAddCards, getWeakQuestionIds } = useSRSDeck();

  const { categoryMasteries } = useCategoryMastery();
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const [bulkAddLoading, setBulkAddLoading] = useState(false);
  const [bulkAddResult, setBulkAddResult] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // -------------------------------------------------------------------------
  // Derived stats
  // -------------------------------------------------------------------------

  const stats = useMemo(() => {
    let newCount = 0;
    let reviewedCount = 0;

    for (const record of deck) {
      if (record.card.state === State.New && record.card.reps === 0) {
        newCount++;
      } else if (!isDue(record.card)) {
        reviewedCount++;
      }
    }

    return {
      total: deck.length,
      due: dueCount,
      new: newCount,
      reviewed: reviewedCount,
    };
  }, [deck, dueCount]);

  // -------------------------------------------------------------------------
  // Progress calculation
  // -------------------------------------------------------------------------

  const progressPercent = stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0;

  // -------------------------------------------------------------------------
  // Unique categories from deck
  // -------------------------------------------------------------------------

  const deckCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const record of deck) {
      const question = questionsById.get(record.questionId);
      if (question) {
        cats.add(question.category);
      }
    }
    return Array.from(cats).sort();
  }, [deck]);

  // -------------------------------------------------------------------------
  // Sorted & filtered deck
  // -------------------------------------------------------------------------

  const sortedDeck = useMemo(() => {
    const sorted = [...deck].sort((a, b) => sortOrder(a) - sortOrder(b));

    if (categoryFilter === 'all') return sorted;

    return sorted.filter(record => {
      const question = questionsById.get(record.questionId);
      return question?.category === categoryFilter;
    });
  }, [deck, categoryFilter]);

  // -------------------------------------------------------------------------
  // All-reviewed empty state data (earliest next due)
  // -------------------------------------------------------------------------

  const nextDueText = useMemo(() => {
    if (dueCount > 0 || deck.length === 0) return null;

    let earliest: SRSCardRecord | null = null;
    for (const record of deck) {
      if (!earliest || record.card.due < earliest.card.due) {
        earliest = record;
      }
    }

    if (!earliest) return null;

    // Calculate hours until next review
    const hoursUntil = Math.max(
      1,
      Math.ceil((earliest.card.due.getTime() - Date.now()) / (1000 * 60 * 60))
    );

    const reviewText = getNextReviewText(earliest.card);

    return {
      hours: hoursUntil,
      text: reviewText,
    };
  }, [deck, dueCount]);

  // -------------------------------------------------------------------------
  // Bulk-add weak area questions
  // -------------------------------------------------------------------------

  const handleBulkAddWeak = useCallback(async () => {
    setBulkAddLoading(true);
    setBulkAddResult(null);

    try {
      // Build CategoryMasteryEntry array from categoryMasteries
      const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
      const entries: CategoryMasteryEntry[] = categories.map(cat => ({
        categoryId: cat,
        mastery: categoryMasteries[cat] ?? 0,
        questionCount: getCategoryQuestionIds(cat, allQuestions).length,
      }));

      const weakIds = getWeakQuestionIds(entries);

      if (weakIds.length === 0) {
        setBulkAddResult('No weak areas detected. Keep studying!');
        return;
      }

      const added = await bulkAddCards(weakIds);
      if (added === 0) {
        setBulkAddResult('All weak area questions are already in your deck.');
      } else {
        setBulkAddResult(`Added ${added} question${added !== 1 ? 's' : ''} from weak areas.`);
      }
    } catch {
      setBulkAddResult('Failed to add questions. Please try again.');
    } finally {
      setBulkAddLoading(false);
    }
  }, [categoryMasteries, getWeakQuestionIds, bulkAddCards]);

  // -------------------------------------------------------------------------
  // Remove handler
  // -------------------------------------------------------------------------

  const handleRemove = useCallback(
    async (questionId: string) => {
      await removeCard(questionId);
    },
    [removeCard]
  );

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">
          Loading your deck...
          {showBurmese && <span className="block font-myanmar">သင့်ကတ်များတင်နေသည်...</span>}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Empty state (no cards at all)
  // -------------------------------------------------------------------------

  if (deck.length === 0) {
    return (
      <div>
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Study Guide</span>
            {showBurmese && (
              <span className="font-myanmar ml-1">
                {'/ \u101C\u1031\u1037\u101C\u102C\u101B\u1014\u103A\u101E\u102D\u102F\u1037'}
              </span>
            )}
          </button>
        </div>

        <EmptyState
          icon={Layers}
          iconColor="text-primary"
          title={{
            en: 'Your SRS deck is empty',
            my: '\u101E\u1004\u103A\u1037 SRS \u1000\u1010\u103A\u1005\u102F \u1021\u101C\u103D\u1010\u103A\u1015\u102B',
          }}
          description={{
            en: 'Spaced repetition helps you remember \u2014 cards come back at the right time. Add cards from study sessions!',
            my: '\u1021\u1001\u103B\u102D\u1014\u103A\u1001\u103C\u102C\u1038\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1015\u1031\u1038\u1001\u103C\u1004\u103A\u1038\u1000 \u1019\u103E\u1010\u103A\u1019\u102D\u101B\u1014\u103A \u1021\u1000\u1030\u100A\u102E\u1015\u1031\u1038\u1015\u102B\u1010\u101A\u103A \u2014 \u1000\u1010\u103A\u1019\u103B\u102C\u1038\u1000 \u1019\u103E\u1014\u103A\u1000\u1014\u103A\u1021\u1001\u103B\u102D\u1014\u103A\u1019\u103E\u102C \u1015\u103C\u1014\u103A\u101C\u102C\u1015\u102B\u1010\u101A\u103A\u104B \u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F\u1019\u103B\u102C\u1038\u1019\u103E \u1000\u1010\u103A\u1019\u103B\u102C\u1038\u1011\u100A\u103A\u1037\u1015\u102B!',
          }}
          action={{
            label: {
              en: 'Start Studying',
              my: '\u1005\u1010\u1004\u103A\u101C\u1031\u1037\u101C\u102C\u1015\u102B',
            },
            onClick: () => navigate('/study'),
          }}
        />

        {/* Additional bulk-add CTA for advanced users */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <Button variant="secondary" onClick={handleBulkAddWeak} loading={bulkAddLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Weak Area Questions
          </Button>
          {bulkAddResult && <p className="mt-2 text-sm text-muted-foreground">{bulkAddResult}</p>}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // All-reviewed celebration state
  // -------------------------------------------------------------------------

  const allReviewed = deck.length > 0 && dueCount === 0;

  // -------------------------------------------------------------------------
  // Main deck view
  // -------------------------------------------------------------------------

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-4">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Study Guide</span>
          {showBurmese && (
            <span className="font-myanmar ml-1">
              {
                '/ \u101C\u1031\u1037\u101C\u102C\u1019\u103E\u102F\u101C\u1019\u103A\u1038\u100A\u103D\u103E\u1014\u103A\u101E\u102D\u102F\u1037'
              }
            </span>
          )}
        </button>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-1">Review Deck</h2>
      {showBurmese && (
        <p className="text-base text-muted-foreground font-myanmar mb-4">
          {
            '\u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101E\u102F\u1036\u1038\u101E\u1015\u103A\u1000\u1010\u103A\u1019\u103B\u102C\u1038'
          }
        </p>
      )}

      {/* Progress bar */}
      <motion.div
        className="mb-6"
        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_GENTLE}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {stats.reviewed}/{stats.total} reviewed
          </span>
          <span className="text-sm text-muted-foreground">{progressPercent}%</span>
        </div>
        <Progress.Root
          className="relative h-3 overflow-hidden rounded-full bg-muted"
          value={progressPercent}
        >
          <Progress.Indicator
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </Progress.Root>
      </motion.div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Button variant="primary" onClick={onStartReview} disabled={dueCount === 0}>
          <BookOpen className="h-4 w-4 mr-2" />
          Start Review ({dueCount} due)
        </Button>
        <Button variant="secondary" onClick={handleBulkAddWeak} loading={bulkAddLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Weak Area Questions
        </Button>
      </div>

      {/* Bulk-add feedback */}
      {bulkAddResult && <p className="mb-4 text-sm text-muted-foreground">{bulkAddResult}</p>}

      {/* Category filter dropdown */}
      {deckCategories.length > 1 && (
        <div className="mb-4">
          <select
            className={clsx(
              'rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm font-medium',
              'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary',
              'transition-colors min-h-[44px] w-full sm:w-auto'
            )}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories ({deck.length})</option>
            {deckCategories.map(cat => {
              const count = deck.filter(
                r => questionsById.get(r.questionId)?.category === cat
              ).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* All-reviewed celebration state */}
      {allReviewed && (
        <motion.div
          className="mb-6 rounded-2xl border border-success/30 bg-success/5 p-6 text-center"
          initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING_BOUNCY}
        >
          <motion.div
            initial={shouldReduceMotion ? undefined : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ...SPRING_BOUNCY, delay: 0.1 }}
          >
            <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-3" />
          </motion.div>
          <h3 className="text-lg font-bold text-success mb-1">All caught up!</h3>
          {showBurmese && (
            <p className="text-base text-success/80 font-myanmar mb-2">
              {
                '\u1021\u102C\u1038\u101C\u102F\u1036\u1038 \u1015\u103C\u102E\u1038\u1006\u102F\u1036\u1038\u1015\u102B\u1015\u103C\u102E!'
              }
            </p>
          )}
          {nextDueText && (
            <p className="text-sm text-muted-foreground">
              Next review in {nextDueText.text.en}
              {showBurmese && (
                <span className="font-myanmar ml-1">
                  {'/ '}
                  {nextDueText.text.my}
                  {
                    '\u1019\u103E\u102C \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u101B\u1014\u103A'
                  }
                </span>
              )}
            </p>
          )}
        </motion.div>
      )}

      {/* Card list */}
      <StaggeredList className="space-y-3">
        {sortedDeck.map(record => {
          const question = questionsById.get(record.questionId);
          // Normalize FSRS difficulty (typically 1-10) to 0-1 range
          const normalizedDifficulty = Math.min(1, Math.max(0, (record.card.difficulty - 1) / 9));

          return (
            <StaggeredItem key={record.questionId}>
              <ReviewDeckCard
                questionId={record.questionId}
                questionText={question?.question_en ?? `Question ${record.questionId}`}
                questionTextMy={question?.question_my}
                category={question?.category ?? 'Unknown'}
                isDue={isDue(record.card)}
                difficulty={normalizedDifficulty}
                showBurmese={showBurmese}
                onRemove={handleRemove}
              />
            </StaggeredItem>
          );
        })}
      </StaggeredList>
    </div>
  );
}
