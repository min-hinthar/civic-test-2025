'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNavigation } from '@/components/navigation/NavigationProvider';
import { PracticeConfig, type PracticeConfigType } from '@/components/practice/PracticeConfig';
import { PracticeSession } from '@/components/practice/PracticeSession';
import { PracticeResults } from '@/components/practice/PracticeResults';
import { selectPracticeQuestions, getWeakQuestions } from '@/lib/practice/questionSelection';
import {
  getCategoryQuestionIds,
  CATEGORY_COLORS,
  USCIS_CATEGORIES,
  USCIS_CATEGORY_NAMES,
  SUB_CATEGORY_NAMES,
} from '@/lib/mastery';
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { allQuestions } from '@/constants/questions';
import { getSessionsByType, deleteSession } from '@/lib/sessions/sessionStore';
import type { PracticeSnapshot } from '@/lib/sessions/sessionTypes';
import { ResumePromptModal } from '@/components/sessions/ResumePromptModal';
import { SessionCountdown } from '@/components/sessions/SessionCountdown';
import type { Question, QuestionResult, Category } from '@/types';
import type { USCISCategory, CategoryName } from '@/lib/mastery';
import type { SessionSnapshot } from '@/lib/sessions/sessionTypes';

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
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const initialCategory: USCISCategory | Category | null = useMemo(() => {
    if (!categoryParam) return null;
    if (categoryParam in USCIS_CATEGORY_NAMES) return categoryParam as USCISCategory;
    if (categoryParam in SUB_CATEGORY_NAMES) return categoryParam as Category;
    return null;
  }, [categoryParam]);

  const [phase, setPhase] = useState<PracticePhase>('config');
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [practiceResults, setPracticeResults] = useState<QuestionResult[]>([]);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [categoryName, setCategoryName] = useState<CategoryName>({ en: '', my: '' });
  const [categoryColor, setCategoryColor] = useState('text-primary');
  const [previousMastery, setPreviousMastery] = useState(0);
  const { overallMastery, categoryMasteries } = useCategoryMastery();

  // --- Session persistence state ---
  const [savedSessions, setSavedSessions] = useState<PracticeSnapshot[]>([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [sessionId] = useState(() => `session-practice-${Date.now()}`);
  const [initialResults, setInitialResults] = useState<QuestionResult[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);
  const [initialSkippedIndices, setInitialSkippedIndices] = useState<number[]>([]);
  const [practiceConfig, setPracticeConfig] = useState<PracticeSnapshot['config'] | null>(null);
  const [speedOverride, setSpeedOverride] = useState<'slow' | 'normal' | 'fast' | undefined>();
  const [autoReadOverride, setAutoReadOverride] = useState<boolean | undefined>();

  // Check for saved sessions on mount
  useEffect(() => {
    let cancelled = false;
    getSessionsByType('practice')
      .then(sessions => {
        if (!cancelled && sessions.length > 0) {
          setSavedSessions(sessions as PracticeSnapshot[]);
          setShowResumeModal(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Resume / Start Fresh / Not Now handlers ---

  const handleResume = useCallback((session: SessionSnapshot) => {
    const snap = session as PracticeSnapshot;
    setPracticeQuestions(snap.questions);
    setInitialResults(snap.results);
    setInitialIndex(snap.currentIndex);
    setInitialSkippedIndices(snap.skippedIndices ?? []);
    setTimerEnabled(snap.timerEnabled);
    setCategoryName(snap.config.categoryName);
    setPracticeConfig(snap.config);
    setShowResumeModal(false);

    // If timer enabled, show countdown before session; otherwise go straight to session
    if (snap.timerEnabled) {
      setShowCountdown(true);
    } else {
      setPhase('session');
    }
  }, []);

  const handleStartFresh = useCallback((session: SessionSnapshot) => {
    deleteSession(session.id).catch(() => {});
    setSavedSessions([]);
    setShowResumeModal(false);
  }, []);

  const handleNotNow = useCallback(() => {
    setShowResumeModal(false);
  }, []);

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    setPhase('session');
  }, []);

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
      setSpeedOverride(config.speedOverride);
      setAutoReadOverride(config.autoReadOverride);

      // Save practice config for session persistence
      setPracticeConfig({
        category: config.category,
        categoryName: config.categoryName,
        count: config.count,
      });

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

      // Reset resume state for new session
      setInitialResults([]);
      setInitialIndex(0);
      setInitialSkippedIndices([]);

      // If timer enabled, show countdown; otherwise go straight to session
      if (config.timerEnabled) {
        setShowCountdown(true);
      } else {
        setPhase('session');
      }
    },
    [overallMastery, categoryMasteries]
  );

  const handleComplete = useCallback(
    (results: QuestionResult[]) => {
      setPracticeResults(results);
      setPhase('results');
      // Delete session from IndexedDB on completion
      deleteSession(sessionId).catch(() => {});
    },
    [sessionId]
  );

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

  // Build countdown subtitle
  const countdownSubtitle = practiceConfig
    ? initialIndex > 0
      ? `Practice: ${practiceConfig.categoryName.en} \u2014 Q${initialIndex + 1}/${practiceConfig.count}`
      : `Practice: ${practiceConfig.categoryName.en} \u2014 ${practiceConfig.count} Questions`
    : undefined;

  return (
    <div className="page-shell">
      {/* Resume prompt modal (config phase only) */}
      {phase === 'config' && savedSessions.length > 0 && (
        <ResumePromptModal
          sessions={savedSessions}
          open={showResumeModal}
          onResume={handleResume}
          onStartFresh={handleStartFresh}
          onNotNow={handleNotNow}
        />
      )}

      {/* Session countdown (timer enabled) */}
      {showCountdown && (
        <SessionCountdown onComplete={handleCountdownComplete} subtitle={countdownSubtitle} />
      )}

      {phase === 'config' && (
        <PracticeConfig onStart={handleStart} initialCategory={initialCategory} />
      )}
      {phase === 'session' && practiceQuestions.length > 0 && (
        <PracticeSession
          questions={practiceQuestions}
          timerEnabled={timerEnabled}
          onComplete={handleComplete}
          sessionId={sessionId}
          practiceConfig={practiceConfig ?? undefined}
          initialResults={initialResults.length > 0 ? initialResults : undefined}
          initialIndex={initialIndex > 0 ? initialIndex : undefined}
          initialSkippedIndices={
            initialSkippedIndices.length > 0 ? initialSkippedIndices : undefined
          }
          speedOverride={speedOverride}
          autoReadOverride={autoReadOverride}
        />
      )}
      {phase === 'results' && (
        <PracticeResults
          results={practiceResults}
          questions={practiceQuestions}
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
