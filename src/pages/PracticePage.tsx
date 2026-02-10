'use client';

import { useState, useCallback, useEffect } from 'react';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { PracticeConfig, type PracticeConfigType } from '@/components/practice/PracticeConfig';
import { PracticeSession } from '@/components/practice/PracticeSession';
import { PracticeResults } from '@/components/practice/PracticeResults';
import { selectPracticeQuestions, getWeakQuestions } from '@/lib/practice/questionSelection';
import { getCategoryQuestionIds, CATEGORY_COLORS, USCIS_CATEGORIES } from '@/lib/mastery';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions } from '@/constants/questions';
import type { Question, QuestionResult, Category } from '@/types';
import type { USCISCategory, CategoryName } from '@/lib/mastery';

type PracticePhase = 'config' | 'session' | 'results';

const categoryColorToTailwind: Record<string, string> = {
  blue: 'text-primary',
  amber: 'text-warning',
  emerald: 'text-success',
};

/**
 * Practice mode page managing config -> session -> results flow.
 *
 * State machine:
 * - config: User selects category, count, timer (rounded-2xl cards, 3D start)
 * - session: User answers with gamified feedback (icons, sounds, 3D buttons)
 * - results: Post-practice celebration with playLevelUp(), 3D done button
 */
const PracticePage = () => {
  const { setLock } = useNavigation();
  const [phase, setPhase] = useState<PracticePhase>('config');
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [practiceResults, setPracticeResults] = useState<QuestionResult[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [categoryName, setCategoryName] = useState<CategoryName>({ en: '', my: '' });
  const [categoryColor, setCategoryColor] = useState('text-primary');
  const [previousMastery, setPreviousMastery] = useState(0);
  const { overallMastery, categoryMasteries } = useCategoryMastery();

  const handleStart = useCallback(
    async (config: PracticeConfigType) => {
      // Capture mastery before session for animation
      if (config.category === 'weak') {
        setPreviousMastery(overallMastery);
      } else if (config.category in CATEGORY_COLORS) {
        setPreviousMastery(categoryMasteries[config.category] ?? 0);
      } else {
        // Sub-category - use overall as approximation
        setPreviousMastery(overallMastery);
      }

      setCategoryName(config.categoryName);
      setTimerEnabled(config.timerEnabled);

      // Determine color
      if (config.category !== 'weak') {
        const mainCat =
          config.category in USCIS_CATEGORIES ? (config.category as USCISCategory) : null;

        if (mainCat) {
          const color = CATEGORY_COLORS[mainCat];
          setCategoryColor(categoryColorToTailwind[color] ?? 'text-primary');
        } else {
          // Sub-category: find parent
          for (const [parentCat, def] of Object.entries(USCIS_CATEGORIES)) {
            if (def.subCategories.includes(config.category as Category)) {
              const color = CATEGORY_COLORS[parentCat as USCISCategory];
              setCategoryColor(categoryColorToTailwind[color] ?? 'text-primary');
              break;
            }
          }
        }
      }

      // Select questions
      let questions: Question[];

      if (config.category === 'weak') {
        const weakQs = await getWeakQuestions(allQuestions);
        questions = weakQs.slice(0, config.count);
      } else {
        // Get questions for selected category
        const questionIds = getCategoryQuestionIds(config.category, allQuestions);
        const categoryQuestions = allQuestions.filter(q => questionIds.includes(q.id));

        if (config.count >= categoryQuestions.length) {
          // Full: shuffle all category questions
          questions = fisherYatesShuffle(categoryQuestions);
        } else {
          // Use smart selection
          questions = await selectPracticeQuestions({
            questions: categoryQuestions,
            count: config.count,
          });
        }
      }

      // Shuffle answer options for each question
      const shuffledQuestions = questions.map(q => ({
        ...q,
        answers: fisherYatesShuffle(q.answers),
      }));

      setPracticeQuestions(shuffledQuestions);
      setPhase('session');
    },
    [overallMastery, categoryMasteries]
  );

  const handleComplete = useCallback((results: QuestionResult[]) => {
    setPracticeResults(results);
    setPhase('results');
  }, []);

  const handleDone = useCallback(() => {
    // Reset state and go back to config
    setPracticeQuestions([]);
    setPracticeResults([]);
    setPhase('config');
  }, []);

  // Navigation lock via context: lock during active practice session
  useEffect(() => {
    setLock(phase === 'session', 'Complete or exit the practice first');
  }, [phase, setLock]);

  // Release lock on unmount
  useEffect(() => () => setLock(false), [setLock]);

  return (
    <div className="page-shell">
      {phase === 'config' && <PracticeConfig onStart={handleStart} />}
      {phase === 'session' && practiceQuestions.length > 0 && (
        <PracticeSession
          questions={practiceQuestions}
          timerEnabled={timerEnabled}
          onComplete={handleComplete}
        />
      )}
      {phase === 'results' && (
        <PracticeResults
          results={practiceResults}
          categoryName={categoryName}
          previousMastery={previousMastery}
          categoryColor={categoryColor}
          onDone={handleDone}
        />
      )}
    </div>
  );
};

export default PracticePage;
