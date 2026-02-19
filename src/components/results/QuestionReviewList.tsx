'use client';

/**
 * QuestionReviewList
 *
 * Filterable, color-coded list of answered questions for the results screen.
 * Each card shows question text (bilingual), user answer vs. correct answer,
 * SpeechButton for audio, AddToDeckButton for SRS, and ExplanationCard when
 * explanation data exists.
 *
 * Features:
 * - Filter tabs: All / Incorrect Only / Skipped
 * - Color-coded borders: green (correct), red-amber (incorrect), amber-yellow (skipped)
 * - Batch SRS offer: "Add all X wrong answers to your review deck" banner
 * - Staggered entrance animation
 */

import { useState, useCallback, useMemo } from 'react';
import { Filter, Plus, BookOpen } from 'lucide-react';
import { clsx } from 'clsx';
import SpeechButton from '@/components/ui/SpeechButton';
import { AddToDeckButton } from '@/components/srs/AddToDeckButton';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import { DynamicAnswerNote } from '@/components/study/Flashcard3D';
import { FadeIn } from '@/components/animations/StaggeredList';
import { useSRS } from '@/contexts/SRSContext';
import { useToast } from '@/components/BilingualToast';
import { useUserState } from '@/contexts/StateContext';
import { strings } from '@/lib/i18n/strings';
import type { QuestionResult, Question } from '@/types';

type ReviewFilter = 'all' | 'incorrect' | 'skipped';

interface QuestionReviewListProps {
  results: QuestionResult[];
  skippedQuestionIds?: string[];
  questions: Question[];
  mode: 'mock-test' | 'practice';
  showBurmese: boolean;
  filter: ReviewFilter;
  onFilterChange: (filter: ReviewFilter) => void;
}

/**
 * Filterable color-coded question review list with SRS integration.
 */
export function QuestionReviewList({
  results,
  skippedQuestionIds = [],
  questions,
  mode: _mode,
  showBurmese,
  filter,
  onFilterChange,
}: QuestionReviewListProps) {
  const { addCard, isInDeck } = useSRS();
  const { showSuccess } = useToast();
  const { stateInfo } = useUserState();
  const [isAddingAll, setIsAddingAll] = useState(false);

  // Build question lookup map
  const questionsById = useMemo(() => new Map(questions.map(q => [q.id, q])), [questions]);

  // Wrong results (for batch SRS)
  const wrongResults = useMemo(() => results.filter(r => !r.isCorrect), [results]);

  // How many wrong answers are NOT already in the deck
  const wrongNotInDeck = useMemo(
    () => wrongResults.filter(r => !isInDeck(r.questionId)),
    [wrongResults, isInDeck]
  );

  // Skipped questions (questions that were skipped and not answered)
  const skippedQuestions = useMemo(
    () =>
      skippedQuestionIds
        .map(id => questionsById.get(id))
        .filter((q): q is Question => q !== undefined),
    [skippedQuestionIds, questionsById]
  );

  // Filter results
  const filteredResults = useMemo(() => {
    switch (filter) {
      case 'incorrect':
        return wrongResults;
      case 'skipped':
        return [];
      case 'all':
      default:
        return results;
    }
  }, [filter, results, wrongResults]);

  // Batch add all wrong answers to SRS deck
  const handleAddAllWrong = useCallback(async () => {
    if (isAddingAll) return;
    setIsAddingAll(true);
    try {
      let addedCount = 0;
      for (const result of wrongNotInDeck) {
        await addCard(result.questionId);
        addedCount++;
      }
      if (addedCount > 0) {
        showSuccess({
          en: `Added ${addedCount} question${addedCount > 1 ? 's' : ''} to review deck`,
          my: `ပြန်လှည့်စာရင်းသို့ ${addedCount} ခုထည့်ပြီး`,
        });
      }
    } catch {
      // Silent fail - individual AddToDeckButton still works
    } finally {
      setIsAddingAll(false);
    }
  }, [isAddingAll, wrongNotInDeck, addCard, showSuccess]);

  // Filter tab counts
  const incorrectCount = wrongResults.length;
  const skippedCount = skippedQuestionIds.length;
  const totalCount = results.length;

  return (
    <div>
      {/* Filter toggle tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={clsx(
                'rounded-xl px-3 py-2 text-xs font-semibold transition-colors min-h-[44px]',
                filter === 'all'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {strings.test.showAll.en} ({totalCount})
              {showBurmese && <span className="ml-1 font-myanmar">{strings.test.showAll.my}</span>}
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('incorrect')}
              className={clsx(
                'rounded-xl px-3 py-2 text-xs font-semibold transition-colors min-h-[44px]',
                filter === 'incorrect'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {strings.test.incorrectOnly.en} ({incorrectCount})
              {showBurmese && (
                <span className="ml-1 font-myanmar">{strings.test.incorrectOnly.my}</span>
              )}
            </button>
            {skippedCount > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange('skipped')}
                className={clsx(
                  'rounded-xl px-3 py-2 text-xs font-semibold transition-colors min-h-[44px]',
                  filter === 'skipped'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Skipped ({skippedCount})
                {showBurmese && <span className="ml-1 font-myanmar">ကျော်ထားသော</span>}
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {strings.test.showing.en} {filter === 'skipped' ? skippedCount : filteredResults.length}{' '}
          {strings.test.ofQuestions.en} {totalCount + skippedCount} {strings.test.questions.en}
        </p>
      </div>

      {/* Batch SRS offer banner */}
      {wrongNotInDeck.length > 0 && filter !== 'skipped' && (
        <FadeIn delay={200}>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary-500/30 bg-primary-subtle/40 p-4">
            <BookOpen className="h-5 w-5 shrink-0 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                You got {wrongNotInDeck.length} question{wrongNotInDeck.length > 1 ? 's' : ''}{' '}
                wrong. Add {wrongNotInDeck.length > 1 ? 'them' : 'it'} to your review deck?
              </p>
              {showBurmese && (
                <p className="text-sm text-muted-foreground font-myanmar">
                  {wrongNotInDeck.length} ခု မှားပါတယ်။ ပြန်လေ့လာစာရင်းသို့ ထည့်မလား?
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddAllWrong}
              disabled={isAddingAll}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-xl px-4 py-2',
                'min-h-[44px] text-sm font-bold',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              <Plus className="h-4 w-4" />
              Add All
              {showBurmese && <span className="font-myanmar ml-1">အားလုံးထည့်</span>}
            </button>
          </div>
        </FadeIn>
      )}

      {/* Question cards */}
      <div className="mt-4 space-y-4">
        {/* Show skipped questions when skipped filter is active */}
        {filter === 'skipped' &&
          skippedQuestions.map((question, index) => (
            <FadeIn key={question.id} delay={index * 60}>
              <div className="rounded-2xl border-2 border-amber-400/40 bg-card/80 p-5 shadow-sm">
                <p className="text-sm font-semibold text-foreground">{question.question_en}</p>
                {showBurmese && (
                  <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                    {question.question_my}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <SpeechButton
                    text={question.question_en}
                    questionId={question.id}
                    audioType="q"
                    label="Question"
                    ariaLabel={`Play English question audio for ${question.question_en}`}
                  />
                  <AddToDeckButton questionId={question.id} compact />
                </div>
                <p className="mt-3 text-sm font-semibold text-amber-500">
                  Skipped
                  {showBurmese && <span className="ml-1 font-myanmar">ကျော်ထားသည်</span>}
                </p>

                {/* Show correct answer for skipped questions */}
                <div className="mt-3 rounded-2xl border border-border/60 bg-muted/40 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {strings.test.correctAnswer.en}
                    {showBurmese && (
                      <span className="font-myanmar"> · {strings.test.correctAnswer.my}</span>
                    )}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {question.answers.find(a => a.correct)?.text_en}
                  </p>
                  {showBurmese && (
                    <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                      {question.answers.find(a => a.correct)?.text_my}
                    </p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}

        {/* Show answered questions for all/incorrect filter */}
        {filter !== 'skipped' &&
          filteredResults.map((result, index) => {
            const questionData = questionsById.get(result.questionId);
            const explanation = questionData?.explanation;

            return (
              <FadeIn key={result.questionId} delay={index * 60}>
                <div
                  className={clsx(
                    'rounded-2xl border-2 p-5 shadow-sm',
                    result.isCorrect
                      ? 'border-success/30 bg-card/80'
                      : 'border-warning/40 bg-card/80'
                  )}
                >
                  {/* Question text */}
                  <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
                  {showBurmese && (
                    <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                      {result.questionText_my}
                    </p>
                  )}

                  {/* Audio + SRS buttons */}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SpeechButton
                      text={result.questionText_en}
                      questionId={result.questionId}
                      audioType="q"
                      label="Question"
                      ariaLabel={`Play English question audio for ${result.questionText_en}`}
                    />
                    <SpeechButton
                      text={result.correctAnswer.text_en}
                      questionId={result.questionId}
                      audioType="a"
                      label="Answer"
                      ariaLabel={`Play English official answer for ${result.questionText_en}`}
                    />
                    <AddToDeckButton questionId={result.questionId} compact />
                  </div>

                  {/* Your answer vs. Correct answer */}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div
                      className={clsx(
                        'rounded-2xl border p-3',
                        result.isCorrect
                          ? 'border-success/30 bg-success-subtle'
                          : 'border-warning/30 bg-warning-subtle'
                      )}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {strings.test.yourAnswer.en}
                        {showBurmese && (
                          <span className="font-myanmar"> · {strings.test.yourAnswer.my}</span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {result.selectedAnswer.text_en}
                      </p>
                      {showBurmese && (
                        <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                          {result.selectedAnswer.text_my}
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-muted/40 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {strings.test.correctAnswer.en}
                        {showBurmese && (
                          <span className="font-myanmar"> · {strings.test.correctAnswer.my}</span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {result.correctAnswer.text_en}
                      </p>
                      {showBurmese && (
                        <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                          {result.correctAnswer.text_my}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Correct/Incorrect label */}
                  <p
                    className={clsx(
                      'mt-3 text-sm font-semibold',
                      result.isCorrect ? 'text-success' : 'text-warning'
                    )}
                  >
                    {result.isCorrect ? strings.test.correct.en : strings.test.reviewAnswer.en}
                    {showBurmese && (
                      <span className="ml-1 font-myanmar">
                        {result.isCorrect ? strings.test.correct.my : strings.test.reviewAnswer.my}
                      </span>
                    )}
                  </p>

                  {/* Dynamic answer note */}
                  {questionData?.dynamic && (
                    <DynamicAnswerNote dynamic={questionData.dynamic} stateInfo={stateInfo} />
                  )}

                  {/* Explanation card */}
                  {explanation && (
                    <div className="mt-3">
                      <ExplanationCard
                        explanation={explanation}
                        isCorrect={result.isCorrect}
                        defaultExpanded={!result.isCorrect}
                        allQuestions={questions}
                      />
                    </div>
                  )}
                </div>
              </FadeIn>
            );
          })}

        {/* Empty state */}
        {filter !== 'skipped' && filteredResults.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">
              {filter === 'incorrect'
                ? 'No incorrect answers - great job!'
                : 'No results to display.'}
            </p>
            {showBurmese && (
              <p className="text-sm font-myanmar mt-1">
                {filter === 'incorrect'
                  ? 'မှားတဲ့အဖြေမရှိပါ - အရမ်းကောင်းပါတယ်!'
                  : 'ပြစရာရလဒ်မရှိပါ။'}
              </p>
            )}
          </div>
        )}
        {filter === 'skipped' && skippedQuestions.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-sm">No skipped questions.</p>
            {showBurmese && <p className="text-sm font-myanmar mt-1">ကျော်ထားတဲ့မေးခွန်းမရှိပါ။</p>}
          </div>
        )}
      </div>
    </div>
  );
}
