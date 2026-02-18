'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { SwipeableCard } from './SwipeableCard';
import { getSubCategoryColors } from '@/lib/mastery';
import { SUB_CATEGORY_NAMES } from '@/lib/mastery/categoryMapping';
import type { Question } from '@/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SwipeableStackProps {
  cards: Question[];
  currentIndex: number;
  isAnimating: boolean;
  onSwipe: (direction: 'know' | 'dont-know') => void;
  onAnimationComplete: () => void;
  /** Direction for button-initiated sort under reduced motion */
  pendingDirection?: 'know' | 'dont-know' | null;
  showBurmese: boolean;
  speedLabel: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Stack card transform constants
// ---------------------------------------------------------------------------

/** Scale reduction per stack level (i=0 is 1, i=1 is 0.96, i=2 is 0.92) */
const SCALE_STEP = 0.04;
/** Vertical offset per stack level in pixels */
const OFFSET_STEP = 8;
/** Opacity reduction per stack level (0 = fully opaque deck cards) */
const OPACITY_STEP = 0;

// ---------------------------------------------------------------------------
// Static Card Preview (lightweight behind-card rendering)
// ---------------------------------------------------------------------------

/**
 * Lightweight preview for cards behind the active card in the stack.
 * Shows only category color strip, category name, and question text.
 * Does NOT render full Flashcard3D (too expensive for hidden cards).
 */
function StaticCardPreview({
  question,
  showBurmese,
}: {
  question: Question;
  showBurmese: boolean;
}) {
  const subCategoryColors = getSubCategoryColors(question.category);
  const categoryName = SUB_CATEGORY_NAMES[question.category];

  return (
    <div
      className={clsx(
        'w-full aspect-[3/4] max-w-sm mx-auto',
        'rounded-2xl',
        'glass-light prismatic-border',
        'shadow-[0_6px_0_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]',
        'dark:shadow-[0_6px_0_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.3)]',
        'flex flex-col overflow-hidden'
      )}
      aria-hidden="true"
    >
      {/* Category color strip */}
      <div className={clsx('h-[5px] w-full shrink-0', subCategoryColors.stripBg)} />

      {/* Card content */}
      <div className="flex-1 flex flex-col p-6">
        {/* Category hint tag */}
        <span
          className={clsx(
            'inline-flex self-start px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-3',
            'bg-muted/60 text-muted-foreground'
          )}
        >
          {categoryName?.en ?? question.category}
        </span>

        {/* Question text preview */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-lg font-semibold text-foreground leading-relaxed line-clamp-4">
            {question.question_en}
          </p>
          {showBurmese && (
            <p className="mt-2 text-lg font-myanmar text-muted-foreground leading-relaxed line-clamp-3">
              {question.question_my}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Stacked deck rendering 2-3 visible cards with the active card on top.
 *
 * Features:
 * - Active card rendered as full SwipeableCard with drag interaction
 * - Behind cards as lightweight StaticCardPreview (category strip + question text)
 * - Decreasing scale and increasing vertical offset for depth effect
 * - Only top card receives pointer events
 * - Subtle scale-up animation when card in front is swiped away
 * - Reduced motion: behind cards use simple fade-in instead of spring entrance
 * - Category hint tags on all visible cards
 * - Background zone labels behind the stack
 * - Empty state when no cards remain
 */
export function SwipeableStack({
  cards,
  currentIndex,
  isAnimating,
  onSwipe,
  onAnimationComplete,
  pendingDirection,
  showBurmese,
  speedLabel,
  className,
}: SwipeableStackProps) {
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese: contextShowBurmese } = useLanguage();
  const isBurmese = showBurmese ?? contextShowBurmese;

  // Visible cards: up to 3 from currentIndex
  const maxVisible = 3;
  const visibleCards: Question[] = [];
  for (let i = 0; i < maxVisible; i++) {
    const idx = currentIndex + i;
    if (idx < cards.length) {
      visibleCards.push(cards[idx]);
    }
  }

  // Empty state: no cards remaining
  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Background zone labels (always visible at low opacity) */}
      <div
        className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none z-0"
        aria-hidden="true"
      >
        {/* Don't Know label - left side */}
        <div className="text-center opacity-20">
          <span className="text-sm font-bold text-warning">Don&apos;t Know</span>
          {isBurmese && <span className="block text-xs font-myanmar text-warning/80">မသိပါ</span>}
        </div>

        {/* Know label - right side */}
        <div className="text-center opacity-20">
          <span className="text-sm font-bold text-success">Know</span>
          {isBurmese && <span className="block text-xs font-myanmar text-success/80">သိပါတယ်</span>}
        </div>
      </div>

      {/* Card stack (rendered in reverse so active card DOM is last = on top visually with z-index) */}
      <div className="relative">
        {visibleCards.map((card, i) => {
          const isActive = i === 0;
          const scale = 1 - i * SCALE_STEP;
          const translateY = i * OFFSET_STEP;
          const opacity = 1 - i * OPACITY_STEP;
          const zIndex = maxVisible - i;

          if (isActive) {
            // Active card: full SwipeableCard with drag interaction
            return (
              <div
                key={card.id}
                style={{
                  position: 'relative',
                  zIndex,
                }}
              >
                <SwipeableCard
                  question={card}
                  onSwipe={onSwipe}
                  onAnimationComplete={onAnimationComplete}
                  isAnimating={isAnimating}
                  pendingDirection={pendingDirection}
                  showBurmese={isBurmese}
                  speedLabel={speedLabel}
                />
              </div>
            );
          }

          // Behind cards: lightweight static previews with depth transforms
          // Reduced motion: simple fade-in instead of spring scale+translate entrance
          return (
            <motion.div
              key={card.id}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { scale: scale - SCALE_STEP, y: translateY + OFFSET_STEP }
              }
              animate={
                shouldReduceMotion
                  ? { opacity, scale, y: translateY }
                  : { scale, y: translateY, opacity }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.15 }
                  : { type: 'spring', stiffness: 300, damping: 25 }
              }
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex,
                pointerEvents: 'none',
              }}
            >
              <StaticCardPreview question={card} showBurmese={isBurmese} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default SwipeableStack;
