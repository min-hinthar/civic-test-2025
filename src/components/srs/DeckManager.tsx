'use client';

/**
 * DeckManager - SRS deck management view.
 *
 * Displays all cards in the user's review deck with status labels (New/Due/Done),
 * supports removing cards, bulk-adding weak area questions, and launching review.
 * Integrated as a sub-view within StudyGuidePage via #deck hash route.
 */

import { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, Trash2, Plus, BookOpen } from 'lucide-react';
import clsx from 'clsx';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StaggeredList, StaggeredItem } from '@/components/animations/StaggeredList';
import { useSRSDeck } from '@/hooks/useSRSDeck';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { allQuestions } from '@/constants/questions';
import { getCardStatusLabel, getIntervalStrengthColor, isDue } from '@/lib/srs';
import type { SRSCardRecord } from '@/lib/srs';
import type { Question } from '@/types';
import type { CategoryMasteryEntry } from '@/lib/mastery';
import { USCIS_CATEGORIES, getCategoryQuestionIds } from '@/lib/mastery';
import type { USCISCategory } from '@/lib/mastery';
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
  const { deck, dueCount, isLoading, removeCard, bulkAddCards, getWeakQuestionIds } = useSRSDeck();

  const { categoryMasteries } = useCategoryMastery();

  const [bulkAddLoading, setBulkAddLoading] = useState(false);
  const [bulkAddResult, setBulkAddResult] = useState<string | null>(null);

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
  // Sorted deck
  // -------------------------------------------------------------------------

  const sortedDeck = useMemo(() => [...deck].sort((a, b) => sortOrder(a) - sortOrder(b)), [deck]);

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
          <span className="block font-myanmar">သင့်ကတ်များတင်နေသည်...</span>
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Empty state
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
            <span className="font-myanmar ml-1">/ လေ့လာရန်သို့</span>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Your Review Deck is Empty</h2>
          <p className="text-muted-foreground mb-1">
            Add questions while studying to build your personalized review deck.
          </p>
          <p className="text-muted-foreground font-myanmar mb-6">
            သင်၏ကိုယ်ပိုင်ပြန်လည်သုံးသပ်ကတ်စုဆောင်းရန် လေ့လာစဉ်မေးခွန်းများထည့်ပါ။
          </p>

          {/* Bulk-add weak area questions CTA */}
          <Button variant="primary" onClick={handleBulkAddWeak} loading={bulkAddLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Add Weak Area Questions
          </Button>
          {bulkAddResult && <p className="mt-3 text-sm text-muted-foreground">{bulkAddResult}</p>}
        </div>
      </div>
    );
  }

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
          <span className="font-myanmar ml-1">/ လေ့လာရန်သို့</span>
        </button>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-1">Review Deck</h2>
      <p className="text-base text-muted-foreground font-myanmar mb-4">ပြန်လည်သုံးသပ်ကတ်များ</p>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Total" labelMy="စုစုပေါင်း" value={stats.total} color="text-foreground" />
        <StatCard label="Due" labelMy="ပြန်လည်ရန်" value={stats.due} color="text-warning-500" />
        <StatCard label="New" labelMy="အသစ်" value={stats.new} color="text-blue-500" />
        <StatCard label="Done" labelMy="ပြီးဆုံး" value={stats.reviewed} color="text-success-500" />
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
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

      {/* Card list */}
      <StaggeredList className="space-y-3">
        {sortedDeck.map(record => (
          <StaggeredItem key={record.questionId}>
            <DeckCardItem
              record={record}
              question={questionsById.get(record.questionId)}
              onRemove={handleRemove}
            />
          </StaggeredItem>
        ))}
      </StaggeredList>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  labelMy: string;
  value: number;
  color: string;
}

function StatCard({ label, labelMy, value, color }: StatCardProps) {
  return (
    <Card className="p-3 text-center">
      <p className={clsx('text-2xl font-bold', color)}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground font-myanmar">{labelMy}</p>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// DeckCardItem sub-component
// ---------------------------------------------------------------------------

interface DeckCardItemProps {
  record: SRSCardRecord;
  question: Question | undefined;
  onRemove: (questionId: string) => void;
}

function DeckCardItem({ record, question, onRemove }: DeckCardItemProps) {
  const status = getCardStatusLabel(record.card);
  const strengthColor = getIntervalStrengthColor(record.card);

  // Next review date for reviewed cards
  const nextReviewDate = record.lastReviewedAt
    ? new Date(record.card.due).toLocaleDateString()
    : null;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        {/* Interval strength indicator */}
        <div
          className={clsx('mt-1.5 h-3 w-3 rounded-full flex-shrink-0', strengthColor)}
          title={`Interval: ${record.card.scheduled_days} days`}
        />

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">
            {question?.question_en ?? `Question ${record.questionId}`}
          </p>
          {question?.question_my && (
            <p className="text-xs text-muted-foreground font-myanmar mt-0.5 leading-relaxed">
              {question.question_my}
            </p>
          )}

          {/* Status + next review */}
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span
              className={clsx(
                'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full',
                status.color,
                status.label === 'New' && 'bg-blue-500/10',
                status.label === 'Due' && 'bg-warning-500/10',
                status.label === 'Done' && 'bg-success-500/10'
              )}
            >
              {status.label}
              <span className="font-myanmar ml-1">{status.labelMy}</span>
            </span>
            {nextReviewDate && (
              <span className="text-xs text-muted-foreground">Next: {nextReviewDate}</span>
            )}
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(record.questionId)}
          className="flex-shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg hover:bg-destructive/10"
          aria-label={`Remove ${question?.question_en ?? record.questionId} from deck`}
          title="Remove from deck"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
