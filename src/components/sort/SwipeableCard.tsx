'use client';

import { useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useAnimate, PanInfo } from 'motion/react';
import clsx from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Flashcard3D } from '@/components/study/Flashcard3D';
import { getUSCISCategory, CATEGORY_COLORS, getSubCategoryColors } from '@/lib/mastery';
import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SwipeableCardProps {
  question: Question;
  onSwipe: (direction: 'know' | 'dont-know') => void;
  onAnimationComplete: () => void;
  isAnimating: boolean;
  /** Direction for button-initiated sort under reduced motion (quick linear slide) */
  pendingDirection?: 'know' | 'dont-know' | null;
  showBurmese: boolean;
  speedLabel: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the answer text from studyAnswers (for flashcards) or answers (fallback) */
function getAnswerText(q: Question): { en: string; my: string } {
  if (q.studyAnswers && q.studyAnswers.length > 0) {
    return {
      en: q.studyAnswers.map(a => a.text_en).join(', '),
      my: q.studyAnswers.map(a => a.text_my).join(', '),
    };
  }
  const correctAnswer = q.answers.find(a => a.correct);
  return {
    en: correctAnswer?.text_en ?? '',
    my: correctAnswer?.text_my ?? '',
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A single draggable card with Tinder-style fling gesture.
 *
 * Features:
 * - Horizontal drag with rotation following finger position
 * - Green overlay (know) when dragged right, amber overlay (don't know) when left
 * - Velocity-based commit: fast flick always commits; slow drag needs ~25% card width
 * - Spring-physics fling off-screen with velocity inheritance
 * - Snap-back to center when drag does not commit
 * - Bilingual zone labels (FLSH-08)
 * - Reduced motion: disables drag, button sorts use quick 200ms linear slide (no rotation)
 * - Accessible: role="group" with aria-label, aria-live region for results
 */
export function SwipeableCard({
  question,
  onSwipe,
  onAnimationComplete,
  isAnimating,
  pendingDirection,
  showBurmese,
  speedLabel,
  className,
}: SwipeableCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese: contextShowBurmese } = useLanguage();

  // Use prop showBurmese (from parent context), fall back to context
  const isBurmese = showBurmese ?? contextShowBurmese;

  // Track dragging state to prevent click-to-flip during drag
  const isDraggingRef = useRef(false);

  // Motion values for drag
  const x = useMotionValue(0);

  // Derived transforms
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const knowOpacity = useTransform(x, [0, 100, 200], [0, 0.3, 0.6]);
  const dontKnowOpacity = useTransform(x, [-200, -100, 0], [0.6, 0.3, 0]);

  // Imperative animation via useAnimate
  const [scope, animate] = useAnimate<HTMLDivElement>();

  // Announce sort result for screen readers
  const announceRef = useRef<HTMLDivElement>(null);

  // Reduced motion: handle button-initiated sort with quick linear slide
  useEffect(() => {
    if (!shouldReduceMotion || !pendingDirection || !scope.current) return;

    const direction = pendingDirection;
    const exitX = direction === 'know' ? 300 : -300;

    // Quick 200ms linear slide off-screen, no rotation
    animate(scope.current, { x: exitX, opacity: 0 }, { duration: 0.2, ease: 'linear' })
      .then(() => {
        if (announceRef.current) {
          announceRef.current.textContent =
            direction === 'know' ? 'Sorted as: Know' : "Sorted as: Don't Know";
        }
        onAnimationComplete();
      })
      .catch(() => {
        // Component unmounted during animation
        onAnimationComplete();
      });
  }, [shouldReduceMotion, pendingDirection, scope, animate, onAnimationComplete]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (isAnimating) return;

      const { offset, velocity } = info;
      const cardWidth = scope.current?.offsetWidth ?? 300;

      // Lower distance threshold for comfortable mobile swipe (~75px on 300px card)
      const distanceThreshold = cardWidth * 0.25;
      // Lower velocity threshold for easier flick commits
      const velocityThreshold = 500;
      // Combined check: medium-speed + medium-distance catches gestures that fall through
      const combinedCommit = Math.abs(velocity.x) > 300 && Math.abs(offset.x) > cardWidth * 0.15;

      const isCommitted =
        Math.abs(velocity.x) > velocityThreshold ||
        Math.abs(offset.x) > distanceThreshold ||
        combinedCommit;
      const direction: 'know' | 'dont-know' = offset.x > 0 ? 'know' : 'dont-know';

      if (isCommitted) {
        // Fling off-screen with momentum
        const exitX = direction === 'know' ? window.innerWidth + 100 : -(window.innerWidth + 100);
        const exitRotation = direction === 'know' ? 30 : -30;

        // Guard against null scope (component may unmount during spring fling)
        if (!scope.current) {
          onSwipe(direction);
          onAnimationComplete();
          isDraggingRef.current = false;
          return;
        }

        // Timeout safety: force-complete if animation hangs longer than 1.5s
        const safetyTimeout = setTimeout(() => {
          onSwipe(direction);
          onAnimationComplete();
          isDraggingRef.current = false;
        }, 1500);

        animate(
          scope.current,
          { x: exitX, rotate: exitRotation },
          {
            type: 'spring',
            velocity: velocity.x,
            stiffness: 200,
            damping: 30,
          }
        )
          .then(() => {
            clearTimeout(safetyTimeout);
            // Announce result for screen readers
            if (announceRef.current) {
              announceRef.current.textContent =
                direction === 'know' ? 'Sorted as: Know' : "Sorted as: Don't Know";
            }
            onSwipe(direction);
            onAnimationComplete();
            isDraggingRef.current = false;
          })
          .catch(() => {
            // Component unmounted during animation -- expected on fast swipes
            clearTimeout(safetyTimeout);
            onSwipe(direction);
            onAnimationComplete();
            isDraggingRef.current = false;
          });
      } else {
        // Snap back to center
        if (!scope.current) {
          isDraggingRef.current = false;
          return;
        }
        animate(
          scope.current,
          { x: 0, rotate: 0 },
          {
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }
        )
          .then(() => {
            isDraggingRef.current = false;
          })
          .catch(() => {
            // Component unmounted during snap-back
            isDraggingRef.current = false;
          });
      }
    },
    [isAnimating, scope, animate, onSwipe, onAnimationComplete]
  );

  // Intercept clicks during drag to prevent Flashcard3D flip
  const handleCardClick = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const answer = getAnswerText(question);

  return (
    <div
      role="group"
      aria-label={`Sort card: ${question.question_en}`}
      className={clsx('relative', className)}
    >
      {/* Screen reader announcement region */}
      <div ref={announceRef} aria-live="polite" aria-atomic="true" className="sr-only" />

      {/* Draggable card wrapper */}
      <motion.div
        ref={scope}
        style={{ x, rotate: shouldReduceMotion ? 0 : rotate }}
        drag={shouldReduceMotion ? false : 'x'}
        dragElastic={0.6}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={clsx(
          'relative touch-none select-none',
          !shouldReduceMotion && 'cursor-grab active:cursor-grabbing'
        )}
      >
        {/* Green "Know" overlay -- hidden under reduced motion (no drag) */}
        {!shouldReduceMotion && (
          <motion.div
            style={{ opacity: knowOpacity }}
            className="absolute inset-0 bg-success/30 rounded-2xl pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Amber "Don't Know" overlay -- hidden under reduced motion */}
        {!shouldReduceMotion && (
          <motion.div
            style={{ opacity: dontKnowOpacity }}
            className="absolute inset-0 bg-warning/30 rounded-2xl pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Zone labels that appear during drag -- hidden under reduced motion */}
        {!shouldReduceMotion && (
          <>
            {/* Right side: "Know" */}
            <motion.div
              style={{ opacity: knowOpacity }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-right"
              aria-hidden="true"
            >
              <span className="text-lg font-bold text-success drop-shadow-md">Know</span>
              {isBurmese && (
                <span className="block text-sm font-myanmar text-success/80 drop-shadow-md">
                  {'\u101E\u102D\u1015\u102B\u1010\u101A\u103A'}
                </span>
              )}
            </motion.div>

            {/* Left side: "Don't Know" */}
            <motion.div
              style={{ opacity: dontKnowOpacity }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
              aria-hidden="true"
            >
              <span className="text-lg font-bold text-warning drop-shadow-md">Don&apos;t Know</span>
              {isBurmese && (
                <span className="block text-sm font-myanmar text-warning/80 drop-shadow-md">
                  {'\u1019\u101E\u102D\u1015\u102B'}
                </span>
              )}
            </motion.div>
          </>
        )}

        {/* Card content: Flashcard3D with click interception during drag */}
        <div onClickCapture={handleCardClick} className="relative">
          <Flashcard3D
            questionId={question.id}
            questionEn={question.question_en}
            questionMy={question.question_my}
            answerEn={answer.en}
            answerMy={answer.my}
            category={question.category}
            categoryColor={
              CATEGORY_COLORS[getUSCISCategory(question.category)] as 'blue' | 'amber' | 'emerald'
            }
            subCategoryStripBg={getSubCategoryColors(question.category).stripBg}
            explanation={question.explanation}
            dynamic={question.dynamic}
            showSpeedLabel
            speedLabel={speedLabel}
          />
        </div>
      </motion.div>
    </div>
  );
}

export default SwipeableCard;
