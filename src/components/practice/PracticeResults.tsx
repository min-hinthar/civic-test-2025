'use client';

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestResultsScreen } from '@/components/results/TestResultsScreen';
import { useLanguage } from '@/contexts/LanguageContext';
import { allQuestions } from '@/constants/questions';
import type { QuestionResult, Question } from '@/types';
import type { CategoryName } from '@/lib/mastery';

interface PracticeResultsProps {
  /** Results from the practice session */
  results: QuestionResult[];
  /** Questions used in this practice session */
  questions?: Question[];
  /** Display name for the practiced category */
  categoryName: CategoryName;
  /** Mastery percentage before this practice session */
  previousMastery: number;
  /** Color class for the category ring */
  categoryColor?: string;
  /** Called when user clicks Done/Retry */
  onDone: () => void;
}

/**
 * Post-practice results screen.
 *
 * Delegates to the shared TestResultsScreen with practice-specific configuration.
 * The shared screen provides score animation, confetti, category breakdown,
 * filterable question review with SRS integration, and action buttons.
 */
export function PracticeResults({
  results,
  questions,
  categoryName: _categoryName,
  previousMastery: _previousMastery,
  categoryColor: _categoryColor,
  onDone,
}: PracticeResultsProps) {
  const { showBurmese } = useLanguage();
  const navigate = useNavigate();

  // Use provided questions or fall back to full question pool for explanation lookup
  const questionsForReview = questions ?? allQuestions;

  const handleHome = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <TestResultsScreen
      results={results}
      questions={questionsForReview}
      mode="practice"
      endReason="complete"
      showBurmese={showBurmese}
      onRetry={onDone}
      onReviewWrongOnly={() => {
        /* scroll handled by TestResultsScreen */
      }}
      onHome={handleHome}
    />
  );
}
