'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { DrillConfig, type DrillConfigType } from '@/components/drill/DrillConfig';
import { DrillBadge } from '@/components/drill/DrillBadge';
import { DrillResults } from '@/components/drill/DrillResults';
import { PracticeSession } from '@/components/practice/PracticeSession';
import { selectDrillQuestions } from '@/lib/readiness';
import { calculateReadiness } from '@/lib/readiness';
import {
  getCategoryQuestionIds,
  getAnswerHistory,
  USCIS_CATEGORIES,
  USCIS_CATEGORY_NAMES,
  SUB_CATEGORY_NAMES,
} from '@/lib/mastery';
import type { USCISCategory, CategoryName } from '@/lib/mastery';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { getAllSRSCards } from '@/lib/srs/srsStore';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions, totalQuestions } from '@/constants/questions';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Question, QuestionResult, Category } from '@/types';

type DrillPhase = 'config' | 'session' | 'results';

/**
 * Compute readiness score from current data.
 * Used to capture pre-drill and post-drill readiness inline.
 */
async function computeReadinessScore(
  subCategoryMasteries: Record<string, number>
): Promise<number> {
  try {
    const [cards, answers] = await Promise.all([getAllSRSCards(), getAnswerHistory()]);
    const attemptedIds = new Set(answers.map(a => a.questionId));

    // Build category question map for 60% cap check
    const categoryQuestionMap: Record<string, string[]> = {};
    const categories = Object.keys(USCIS_CATEGORIES) as USCISCategory[];
    for (const category of categories) {
      categoryQuestionMap[category] = getCategoryQuestionIds(category, allQuestions);
    }

    const mappedSrsCards = cards.map(record => ({
      questionId: record.questionId,
      card: {
        ...record.card,
        due: record.card.due instanceof Date ? record.card.due : new Date(record.card.due),
        last_review:
          record.card.last_review instanceof Date
            ? record.card.last_review
            : record.card.last_review
              ? new Date(record.card.last_review)
              : undefined,
      },
    }));

    const result = calculateReadiness({
      categoryMasteries: subCategoryMasteries,
      totalQuestions,
      attemptedQuestionIds: attemptedIds,
      srsCards: mappedSrsCards,
      categoryQuestionMap,
    });

    return result.score;
  } catch {
    return 0;
  }
}

/**
 * Drill mode page managing config -> session -> results flow.
 *
 * State machine:
 * - config: User selects drill count (5/10/20)
 * - session: PracticeSession with drill-specific weakest questions
 * - results: DrillResults with mastery delta, readiness ring, celebration
 *
 * Supports two modes:
 * - weak-all: All questions, weakest first (default)
 * - category: Questions from a specific USCIS category (/drill?category=X)
 */
const DrillPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showBurmese } = useLanguage();
  const { setLock } = useNavigation();
  const { overallMastery, categoryMasteries, subCategoryMasteries, refresh } = useCategoryMastery();

  const [phase, setPhase] = useState<DrillPhase>('config');
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [drillResults, setDrillResults] = useState<QuestionResult[]>([]);
  const [totalQuestionCount, setTotalQuestionCount] = useState(0);
  const [preDrillMastery, setPreDrillMastery] = useState(0);
  const [preDrillReadiness, setPreDrillReadiness] = useState(0);
  const [postDrillReadiness, setPostDrillReadiness] = useState(0);

  // Determine mode from URL search params
  const categoryParam = searchParams.get('category');

  const drillMode: 'weak-all' | 'category' = categoryParam ? 'category' : 'weak-all';

  // Look up category name
  const categoryName: CategoryName | undefined = useMemo(() => {
    if (!categoryParam) return undefined;
    // Check main USCIS category names first
    const mainMatch = USCIS_CATEGORY_NAMES[categoryParam as USCISCategory];
    if (mainMatch) return mainMatch;
    // Check sub-category names
    const subMatch = SUB_CATEGORY_NAMES[categoryParam as keyof typeof SUB_CATEGORY_NAMES];
    if (subMatch) return subMatch;
    // Fallback
    return { en: categoryParam, my: categoryParam };
  }, [categoryParam]);

  // Capture pre-drill readiness on mount
  useEffect(() => {
    let cancelled = false;
    computeReadinessScore(subCategoryMasteries).then(score => {
      if (!cancelled) {
        setPreDrillReadiness(score);
        setPostDrillReadiness(score); // Initialize post to same as pre
      }
    });
    return () => {
      cancelled = true;
    };
    // Only run once on mount (or when subCategoryMasteries first loads)
  }, [subCategoryMasteries]);

  // Handle drill start from config
  const handleStart = useCallback(
    async (config: DrillConfigType) => {
      // Capture pre-drill mastery
      if (config.mode === 'category' && config.category) {
        setPreDrillMastery(categoryMasteries[config.category] ?? overallMastery);
      } else {
        setPreDrillMastery(overallMastery);
      }

      // Load answer history for drill question selection
      let answerHistory: Awaited<ReturnType<typeof getAnswerHistory>>;
      try {
        answerHistory = await getAnswerHistory();
      } catch {
        answerHistory = [];
      }

      // Determine question pool
      let pool: Question[];
      if (config.mode === 'category' && config.category) {
        const questionIds = getCategoryQuestionIds(
          config.category as USCISCategory | Category,
          allQuestions
        );
        pool = allQuestions.filter(q => questionIds.includes(q.id));
      } else {
        pool = allQuestions;
      }

      // Select weakest questions
      const drillQuestions = selectDrillQuestions(pool, config.count, answerHistory);

      // Shuffle answer options for each question
      const shuffledQuestions = drillQuestions.map(q => ({
        ...q,
        answers: fisherYatesShuffle(q.answers),
      }));

      setTotalQuestionCount(config.count);
      setPracticeQuestions(shuffledQuestions);
      setPhase('session');
    },
    [categoryMasteries, overallMastery]
  );

  // Handle session completion
  const handleComplete = useCallback((results: QuestionResult[]) => {
    setDrillResults(results);
    setPhase('results');
  }, []);

  // Post-drill readiness: refresh mastery and recompute readiness
  useEffect(() => {
    if (phase !== 'results') return;
    // Refresh mastery data (triggers useCategoryMastery to re-fetch from IDB)
    refresh();
  }, [phase, refresh]);

  // After mastery refreshes, recompute readiness score
  useEffect(() => {
    if (phase !== 'results') return;
    let cancelled = false;
    computeReadinessScore(subCategoryMasteries).then(score => {
      if (!cancelled && score !== preDrillReadiness) {
        setPostDrillReadiness(score);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [phase, subCategoryMasteries, preDrillReadiness]);

  // Post-drill actions
  const handleNewDrill = useCallback(() => {
    setPracticeQuestions([]);
    setDrillResults([]);
    setPostDrillReadiness(preDrillReadiness);
    setPhase('config');
  }, [preDrillReadiness]);

  const handlePracticeCategory = useCallback(() => {
    // Navigate to practice the weakest category from drill results
    if (categoryParam) {
      router.push(`/practice?category=${encodeURIComponent(categoryParam)}`);
    } else {
      // Find weakest category from drill results
      const wrongByCategory: Record<string, number> = {};
      for (const r of drillResults) {
        if (!r.isCorrect && r.category) {
          wrongByCategory[r.category] = (wrongByCategory[r.category] ?? 0) + 1;
        }
      }
      const weakest = Object.entries(wrongByCategory).sort((a, b) => b[1] - a[1])[0];
      if (weakest) {
        router.push(`/practice?category=${encodeURIComponent(weakest[0])}`);
      } else {
        router.push('/practice');
      }
    }
  }, [router, categoryParam, drillResults]);

  const handleBackToDashboard = useCallback(() => {
    router.push('/home');
  }, [router]);

  // Navigation lock during active session
  useEffect(() => {
    setLock(phase === 'session', 'Complete or exit the drill first');
  }, [phase, setLock]);

  // Release nav lock on unmount
  useEffect(() => () => setLock(false), [setLock]);

  // Weakest category name for "Practice [Category]" button
  const weakestCategoryName: CategoryName | undefined = useMemo(() => {
    if (drillMode === 'category' && categoryName) return categoryName;

    // Find weakest category from drill results (most wrong answers)
    const wrongByCategory: Record<string, number> = {};
    for (const r of drillResults) {
      if (!r.isCorrect && r.category) {
        wrongByCategory[r.category] = (wrongByCategory[r.category] ?? 0) + 1;
      }
    }
    const weakest = Object.entries(wrongByCategory).sort((a, b) => b[1] - a[1])[0];
    if (!weakest) return undefined;

    const catName = SUB_CATEGORY_NAMES[weakest[0] as keyof typeof SUB_CATEGORY_NAMES];
    return catName ?? { en: weakest[0], my: weakest[0] };
  }, [drillMode, categoryName, drillResults]);

  return (
    <div className="page-shell">
      {phase === 'config' && (
        <DrillConfig
          onStart={handleStart}
          mode={drillMode}
          categoryName={categoryName}
          categoryKey={categoryParam ?? undefined}
          showBurmese={showBurmese}
        />
      )}

      {phase === 'session' && practiceQuestions.length > 0 && (
        <div>
          {/* Drill badge indicator above session */}
          <div className="mx-auto max-w-5xl px-4 pt-2 pb-1">
            <DrillBadge showBurmese={showBurmese} />
          </div>
          <PracticeSession
            questions={practiceQuestions}
            timerEnabled={false}
            onComplete={handleComplete}
          />
        </div>
      )}

      {phase === 'results' && (
        <DrillResults
          results={drillResults}
          questions={practiceQuestions}
          totalQuestionCount={totalQuestionCount}
          preDrillMastery={preDrillMastery}
          preDrillReadiness={preDrillReadiness}
          postDrillReadiness={postDrillReadiness}
          mode={drillMode}
          categoryName={weakestCategoryName}
          showBurmese={showBurmese}
          onNewDrill={handleNewDrill}
          onPracticeCategory={handlePracticeCategory}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
};

export default DrillPage;
