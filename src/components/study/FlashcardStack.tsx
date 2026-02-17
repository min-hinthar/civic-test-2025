'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAutoRead } from '@/hooks/useAutoRead';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import { getBurmeseAudioUrl, getEnglishAudioUrl } from '@/lib/audio/burmeseAudio';
import { Flashcard3D } from './Flashcard3D';
import { getUSCISCategory, CATEGORY_COLORS, getSubCategoryColors } from '@/lib/mastery';
import type { Question } from '@/types';

interface FlashcardStackProps {
  /** Array of questions to display */
  questions: Question[];
  /** Starting index */
  startIndex?: number;
  /** Called when index changes */
  onIndexChange?: (index: number) => void;
  /** Additional class names */
  className?: string;
}

const SWIPE_THRESHOLD = 50;
const SWIPE_VELOCITY = 500;

/**
 * Swipeable flashcard stack for mobile.
 *
 * Features:
 * - Horizontal swipe left/right to navigate
 * - Stacked card visual (next card peeking behind)
 * - Navigation arrows for desktop
 * - Progress indicator with bilingual text
 * - Respects prefers-reduced-motion
 *
 * Usage:
 * ```tsx
 * <FlashcardStack questions={allQuestions} />
 * ```
 */
export function FlashcardStack({
  questions,
  startIndex = 0,
  onIndexChange,
  className,
}: FlashcardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [direction, setDirection] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();
  const { settings: tts } = useTTSSettings();

  // Speed label for speech buttons
  const speedLabel = { slow: '0.75x', normal: '1x', fast: '1.25x' }[tts.rate];
  const numericRate = { slow: 0.7, normal: 0.98, fast: 1.3 }[tts.rate];

  // Auto-read question text on card navigate (supports bilingual auto-read)
  const currentQuestion = questions[currentIndex];
  useAutoRead({
    text: currentQuestion?.question_en ?? '',
    enabled: tts.autoRead,
    triggerKey: currentIndex,
    lang: 'en-US',
    autoReadLang: tts.autoReadLang,
    englishAudioUrl: currentQuestion ? getEnglishAudioUrl(currentQuestion.id, 'q') : undefined,
    englishRate: numericRate,
    burmeseAudioUrl:
      showBurmese && currentQuestion ? getBurmeseAudioUrl(currentQuestion.id, 'q') : undefined,
    burmeseRate: numericRate,
  });

  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, questions.length, onIndexChange]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    }
  }, [currentIndex, onIndexChange]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (offset < -SWIPE_THRESHOLD || velocity < -SWIPE_VELOCITY) {
        goToNext();
      } else if (offset > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
        goToPrev();
      }
    },
    [goToNext, goToPrev]
  );

  if (!currentQuestion) {
    return null;
  }

  // Get the correct answer text from studyAnswers (for flashcards) or answers (fallback)
  const getAnswerText = (q: Question) => {
    // Prefer studyAnswers for flashcard display (may have multiple correct answers)
    if (q.studyAnswers && q.studyAnswers.length > 0) {
      return {
        en: q.studyAnswers.map(a => a.text_en).join(', '),
        my: q.studyAnswers.map(a => a.text_my).join(', '),
      };
    }
    // Fallback to answers array (find correct one)
    const correctAnswer = q.answers.find(a => a.correct);
    return {
      en: correctAnswer?.text_en ?? '',
      my: correctAnswer?.text_my ?? '',
    };
  };

  const answer = getAnswerText(currentQuestion);

  // Slide variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className={clsx('relative', className)}>
      {/* Progress indicator */}
      <div className="text-center mb-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{currentIndex + 1}</span>
        <span className="mx-1">/</span>
        <span>{questions.length}</span>
        {showBurmese && (
          <span className="ml-2 font-myanmar">
            ({currentIndex + 1} မှ {questions.length})
          </span>
        )}
      </div>

      {/* Card container with swipe */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={shouldReduceMotion ? undefined : variants}
            initial={shouldReduceMotion ? 'center' : 'enter'}
            animate="center"
            exit={shouldReduceMotion ? 'center' : 'exit'}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            drag={shouldReduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="cursor-grab active:cursor-grabbing"
          >
            <Flashcard3D
              questionId={currentQuestion.id}
              questionEn={currentQuestion.question_en}
              questionMy={currentQuestion.question_my}
              answerEn={answer.en}
              answerMy={answer.my}
              category={currentQuestion.category}
              categoryColor={
                CATEGORY_COLORS[getUSCISCategory(currentQuestion.category)] as
                  | 'blue'
                  | 'amber'
                  | 'emerald'
              }
              subCategoryStripBg={getSubCategoryColors(currentQuestion.category).stripBg}
              explanation={currentQuestion.explanation}
              allQuestions={questions}
              dynamic={currentQuestion.dynamic}
              showSpeedLabel
              speedLabel={speedLabel}
            />
          </motion.div>
        </AnimatePresence>

        {/* 3D chunky navigation arrows */}
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className={clsx(
            'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4',
            'h-12 w-12 rounded-xl bg-card border border-border/60',
            'shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px]',
            'dark:shadow-[0_4px_0_0_rgba(0,0,0,0.3)]',
            'flex items-center justify-center',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-all disabled:opacity-30 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            'hidden sm:flex'
          )}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className={clsx(
            'absolute right-0 top-1/2 -translate-y-1/2 translate-x-4',
            'h-12 w-12 rounded-xl bg-card border border-border/60',
            'shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[2px]',
            'dark:shadow-[0_4px_0_0_rgba(0,0,0,0.3)]',
            'flex items-center justify-center',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-all disabled:opacity-30 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            'hidden sm:flex'
          )}
          aria-label="Next card"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Swipe hint for mobile */}
      <p className="text-center text-xs text-muted-foreground mt-4 sm:hidden">
        Swipe left/right to navigate{showBurmese && ' / ဘယ်ညာပွတ်ဆွဲပါ'}
      </p>
    </div>
  );
}

export default FlashcardStack;
