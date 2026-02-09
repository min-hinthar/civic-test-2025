'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Filter, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { BilingualHeading } from '@/components/bilingual/BilingualHeading';
import { BilingualButton } from '@/components/bilingual/BilingualButton';
import { Confetti } from '@/components/celebrations/Confetti';
import { CountUpScore } from '@/components/celebrations/CountUpScore';
import { CategoryRing } from '@/components/progress/CategoryRing';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import SpeechButton from '@/components/ui/SpeechButton';
import { ShareButton } from '@/components/social/ShareButton';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { useStreak } from '@/hooks/useStreak';
import { strings } from '@/lib/i18n/strings';
import { allQuestions } from '@/constants/questions';
import { playLevelUp } from '@/lib/audio/soundEffects';
import type { ShareCardData } from '@/lib/social/shareCardRenderer';
import type { QuestionResult } from '@/types';
import type { CategoryName } from '@/lib/mastery';

interface PracticeResultsProps {
  /** Results from the practice session */
  results: QuestionResult[];
  /** Display name for the practiced category */
  categoryName: CategoryName;
  /** Mastery percentage before this practice session */
  previousMastery: number;
  /** Color class for the category ring */
  categoryColor?: string;
  /** Called when user clicks Done */
  onDone: () => void;
}

/**
 * Post-practice results screen.
 *
 * Features:
 * - Score display with CountUpScore animation
 * - Animated mastery ring updating from previousMastery to new mastery
 * - Review section with filter toggle (incorrect/all)
 * - ExplanationCard per result
 * - "Done" button to return to practice config
 * - No retry option (per CONTEXT.md)
 */
export function PracticeResults({
  results,
  categoryName,
  previousMastery,
  categoryColor = 'text-primary',
  onDone,
}: PracticeResultsProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const { overallMastery, refresh } = useCategoryMastery();
  const { currentStreak } = useStreak();
  const [showAllResults, setShowAllResults] = useState(false);
  const [displayMastery, setDisplayMastery] = useState(previousMastery);
  const [showConfetti, setShowConfetti] = useState(false);

  const correctCount = results.filter(r => r.isCorrect).length;
  const totalCount = results.length;

  // Share card data for social sharing
  const shareCardData: ShareCardData = useMemo(() => {
    const catMap: Record<string, { correct: number; total: number }> = {};
    for (const r of results) {
      if (!catMap[r.category]) catMap[r.category] = { correct: 0, total: 0 };
      catMap[r.category].total += 1;
      if (r.isCorrect) catMap[r.category].correct += 1;
    }

    return {
      score: correctCount,
      total: totalCount,
      sessionType: 'practice',
      streak: currentStreak,
      topBadge: null,
      categories: Object.entries(catMap).map(([name, stats]) => ({
        name,
        correct: stats.correct,
        total: stats.total,
      })),
      date: new Date().toISOString(),
    };
  }, [results, correctCount, totalCount, currentStreak]);

  // Build questionsById map for explanation lookup
  const questionsById = useMemo(() => new Map(allQuestions.map(q => [q.id, q])), []);

  // Refresh mastery data and animate ring update
  useEffect(() => {
    // Trigger refresh to recalculate mastery with new practice answers
    refresh();

    // Small delay then animate to new mastery
    const timer = setTimeout(() => {
      setDisplayMastery(overallMastery);
    }, 800);

    return () => clearTimeout(timer);
  }, [refresh, overallMastery]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Celebration sound handler (called from event-like callback, React Compiler safe)
  const handleScoreCountComplete = useCallback(() => {
    setShowConfetti(true);
    playLevelUp();
  }, []);

  const filteredResults = showAllResults ? results : results.filter(r => !r.isCorrect);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-8">
      <Confetti fire={showConfetti} intensity="burst" />

      <div className="glass-panel rounded-2xl p-6 shadow-2xl shadow-primary/20">
        {/* Header with trophy */}
        <div className="text-center py-8">
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }
            }
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-subtle"
          >
            <Trophy className="h-7 w-7 text-primary" />
          </motion.div>

          <BilingualHeading
            text={strings.practice.practiceComplete}
            level={1}
            size="2xl"
            centered
            className="mb-6"
          />

          {/* Score */}
          <CountUpScore
            score={correctCount}
            total={totalCount}
            onComplete={handleScoreCountComplete}
          />

          {/* Mastery ring animation */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm font-semibold text-foreground">
              {strings.practice.masteryUpdate.en}
              {showBurmese && (
                <span className="block font-myanmar text-muted-foreground font-normal">
                  {strings.practice.masteryUpdate.my}
                </span>
              )}
            </p>
            <CategoryRing
              percentage={displayMastery}
              color={categoryColor}
              size={120}
              strokeWidth={10}
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-foreground">{displayMastery}%</span>
                <span className="text-xs text-muted-foreground">{categoryName.en}</span>
              </div>
            </CategoryRing>
            {previousMastery !== displayMastery && (
              <p className="text-xs text-muted-foreground">
                {previousMastery}% &rarr; {displayMastery}%
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {strings.test.correct.en}
            </p>
            <p className="text-2xl font-bold text-success-500">{correctCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {strings.test.incorrect.en}
            </p>
            <p className="text-2xl font-bold text-warning-500">{totalCount - correctCount}</p>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {strings.dashboard.accuracy.en}
            </p>
            <p className="text-2xl font-bold text-foreground">
              {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <BilingualButton
            label={strings.actions.done}
            variant="chunky"
            size="md"
            onClick={onDone}
          />
          <ShareButton data={shareCardData} />
        </div>

        {/* Filter toggle */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
              <button
                onClick={() => setShowAllResults(false)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  !showAllResults
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {strings.test.incorrectOnly.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.test.incorrectOnly.my}</span>
                )}
              </button>
              <button
                onClick={() => setShowAllResults(true)}
                className={clsx(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  showAllResults
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {strings.test.showAll.en}
                {showBurmese && (
                  <span className="ml-1 font-myanmar">{strings.test.showAll.my}</span>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {strings.test.showing.en} {filteredResults.length} {strings.test.ofQuestions.en}{' '}
            {results.length} {strings.test.questions.en}
          </p>
        </div>

        {/* Result cards */}
        <div className="mt-4 space-y-6">
          {filteredResults.map(result => {
            const questionData = questionsById.get(result.questionId);
            const explanation = questionData?.explanation;

            return (
              <div
                key={result.questionId}
                className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-foreground">{result.questionText_en}</p>
                {showBurmese && (
                  <p className="text-sm text-muted-foreground font-myanmar leading-relaxed">
                    {result.questionText_my}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  <SpeechButton
                    text={result.questionText_en}
                    label="Play English question"
                    ariaLabel={`Play English question audio for ${result.questionText_en}`}
                  />
                  <SpeechButton
                    text={result.correctAnswer.text_en}
                    label="Play official answer"
                    ariaLabel={`Play English official answer for ${result.questionText_en}`}
                  />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div
                    className={clsx(
                      'rounded-2xl border p-3',
                      result.isCorrect
                        ? 'border-success-500/30 bg-success-50'
                        : 'border-warning-500/30 bg-warning-50'
                    )}
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {strings.test.yourAnswer.en}
                      {showBurmese && (
                        <span className="ml-1 font-myanmar">{strings.test.yourAnswer.my}</span>
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
                        <span className="ml-1 font-myanmar">{strings.test.correctAnswer.my}</span>
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
                <p
                  className={clsx(
                    'mt-3 text-sm font-semibold',
                    result.isCorrect ? 'text-success-500' : 'text-warning-500'
                  )}
                >
                  {result.isCorrect
                    ? `${strings.test.correct.en}`
                    : `${strings.test.reviewAnswer.en}`}
                  {showBurmese && (
                    <span className="ml-1 font-myanmar">
                      {result.isCorrect ? strings.test.correct.my : strings.test.reviewAnswer.my}
                    </span>
                  )}
                </p>

                {/* Explanation card for review */}
                {explanation && (
                  <div className="mt-3">
                    <ExplanationCard
                      explanation={explanation}
                      isCorrect={result.isCorrect}
                      defaultExpanded={!result.isCorrect}
                      allQuestions={allQuestions}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
