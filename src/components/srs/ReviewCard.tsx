'use client';

import { useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { SPRING_BOUNCY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flashcard3D } from '@/components/study/Flashcard3D';
import { allQuestions } from '@/constants/questions';
import type { SRSCardRecord } from '@/lib/srs';
import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Higher threshold than navigation swipe (50) for intentional rating */
const SWIPE_THRESHOLD = 80;
const SWIPE_VELOCITY = 400;

// Build question lookup map once at module level
const questionsById: Map<string, Question> = new Map(allQuestions.map(q => [q.id, q]));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Rating feedback data shown after user rates a card */
export interface RatingFeedback {
  isEasy: boolean;
  intervalText: { en: string; my: string };
}

export interface ReviewCardProps {
  /** SRS card record with question ID and scheduling data */
  record: SRSCardRecord;
  /** Callback when user rates Easy (true) or Hard (false) */
  onRate: (isEasy: boolean) => void;
  /** Whether the card is currently flipped to show the answer */
  isFlipped: boolean;
  /** Callback to flip the card */
  onFlip: () => void;
  /** Rating feedback overlay data (null when not showing) */
  showRatingFeedback: RatingFeedback | null;
  /** Additional class names */
  className?: string;
}

/**
 * SRS review card with 3D flip and swipe-to-rate gesture.
 *
 * Features:
 * - Reuses Flashcard3D for 3D flip effect
 * - Swipe right = Easy (green gradient), swipe left = Hard (orange gradient)
 * - Progressive color gradient during swipe with bilingual edge labels
 * - Rating feedback overlay with colored flash + interval text
 * - Hard rating shows bilingual encouragement message
 * - Reduced motion: disables drag, relies on RatingButtons
 */
export function ReviewCard({
  record,
  onRate,
  isFlipped: _isFlipped,
  onFlip,
  showRatingFeedback,
  className,
}: ReviewCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  // Look up full question data
  const question = questionsById.get(record.questionId);

  // Get answer text (same pattern as FlashcardStack)
  const answer = useMemo(() => {
    if (!question) return { en: '', my: '' };
    if (question.studyAnswers && question.studyAnswers.length > 0) {
      return {
        en: question.studyAnswers.map(a => a.text_en).join(', '),
        my: question.studyAnswers.map(a => a.text_my).join(', '),
      };
    }
    const correctAnswer = question.answers.find(a => a.correct);
    return {
      en: correctAnswer?.text_en ?? '',
      my: correctAnswer?.text_my ?? '',
    };
  }, [question]);

  // ---------------------------------------------------------------------------
  // Swipe gesture
  // ---------------------------------------------------------------------------

  const x = useMotionValue(0);

  // Progressive background color during swipe
  const swipeBgColor = useTransform(
    x,
    [-200, -50, 0, 50, 200],
    [
      'rgba(251, 146, 60, 0.3)', // orange-400/0.3
      'rgba(251, 146, 60, 0.1)', // orange-400/0.1
      'rgba(0, 0, 0, 0)', // transparent
      'rgba(74, 222, 128, 0.1)', // green-400/0.1
      'rgba(74, 222, 128, 0.3)', // green-400/0.3
    ]
  );

  // Edge label opacity: show when |x| > 30
  const hardLabelOpacity = useTransform(x, [-150, -30, 0], [1, 0, 0]);
  const easyLabelOpacity = useTransform(x, [0, 30, 150], [0, 0, 1]);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const offset = info.offset.x;
      const velocity = info.velocity.x;

      if (offset > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY) {
        onRate(true); // Easy - swipe right
      } else if (offset < -SWIPE_THRESHOLD || velocity < -SWIPE_VELOCITY) {
        onRate(false); // Hard - swipe left
      }
    },
    [onRate]
  );

  // Notify parent when Flashcard3D flips internally
  const handleFlip = useCallback(
    (_flipped: boolean) => {
      // Only allow flip if not showing feedback
      if (!showRatingFeedback) {
        onFlip();
      }
    },
    [onFlip, showRatingFeedback]
  );

  if (!question) {
    return null;
  }

  return (
    <div className={clsx('relative glass-light prismatic-border rounded-2xl', className)}>
      {/* Swipe color gradient overlay */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none z-10"
          style={{ backgroundColor: swipeBgColor }}
        />
      )}

      {/* Edge labels during swipe */}
      {!shouldReduceMotion && (
        <>
          {/* Hard label - left edge */}
          <motion.div
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{ opacity: hardLabelOpacity }}
          >
            <div className="flex flex-col items-center text-warning font-bold">
              <span className="text-lg">Hard</span>
              {showBurmese && <span className="font-myanmar text-lg">ခက်သည်</span>}
            </div>
          </motion.div>

          {/* Easy label - right edge */}
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{ opacity: easyLabelOpacity }}
          >
            <div className="flex flex-col items-center text-success-600 dark:text-success font-bold">
              <span className="text-lg">Easy</span>
              {showBurmese && <span className="font-myanmar text-lg">လွယ်သည်</span>}
            </div>
          </motion.div>
        </>
      )}

      {/* Draggable card wrapper */}
      <motion.div
        style={{ x }}
        drag={shouldReduceMotion || showRatingFeedback ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        dragTransition={{
          bounceStiffness: SPRING_BOUNCY.stiffness,
          bounceDamping: SPRING_BOUNCY.damping,
        }}
        whileTap={shouldReduceMotion || showRatingFeedback ? {} : { scale: 0.98 }}
        onDragEnd={handleDragEnd}
        className={clsx(
          !shouldReduceMotion && !showRatingFeedback && 'cursor-grab active:cursor-grabbing'
        )}
      >
        <Flashcard3D
          questionEn={question.question_en}
          questionMy={question.question_my}
          answerEn={answer.en}
          answerMy={answer.my}
          category={question.category}
          explanation={question.explanation}
          allQuestions={allQuestions}
          tricky={question.tricky}
          onFlip={handleFlip}
        />
      </motion.div>

      {/* Rating feedback overlay */}
      <AnimatePresence>
        {showRatingFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'absolute inset-0 rounded-2xl z-30',
              'flex flex-col items-center justify-center',
              'backdrop-blur-sm',
              showRatingFeedback.isEasy ? 'bg-green-400/20' : 'bg-orange-400/20'
            )}
          >
            <div className="text-center px-4">
              {/* Interval text */}
              <p
                className={clsx(
                  'text-lg font-bold',
                  showRatingFeedback.isEasy ? 'text-success-600 dark:text-success' : 'text-warning'
                )}
              >
                Next review: {showRatingFeedback.intervalText.en}
              </p>
              {showBurmese && (
                <p
                  className={clsx(
                    'font-myanmar text-lg mt-1',
                    showRatingFeedback.isEasy
                      ? 'text-success-600 dark:text-success'
                      : 'text-warning'
                  )}
                >
                  {'နောက်ပြန်လှည့်'}: {showRatingFeedback.intervalText.my}
                </p>
              )}

              {/* Hard encouragement message */}
              {!showRatingFeedback.isEasy && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-foreground/80">
                    Keep going, you&apos;ve got this!
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-sm text-foreground/60 mt-0.5">
                      ဆက်ကြိုးစားပါ။ သင်လုပ်နိုင်ပါတယ်!
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
