'use client';

import { useState, useCallback, KeyboardEvent, MouseEvent } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import SpeechButton from '@/components/ui/SpeechButton';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import type { Explanation, Question } from '@/types';

interface Flashcard3DProps {
  /** Question text (front of card) */
  questionEn: string;
  questionMy: string;
  /** Answer text (back of card) */
  answerEn: string;
  answerMy: string;
  /** Category for gradient styling */
  category?: string;
  /** USCIS main category color: 'blue' | 'amber' | 'emerald' */
  categoryColor?: 'blue' | 'amber' | 'emerald';
  /** Sub-category strip background class (e.g. 'bg-blue-600') - overrides categoryColor */
  subCategoryStripBg?: string;
  /** Optional explanation to show on back of card */
  explanation?: Explanation;
  /** All questions for RelatedQuestions lookup */
  allQuestions?: Question[];
  /** Called when card is flipped */
  onFlip?: (isFlipped: boolean) => void;
  /** Additional class names */
  className?: string;
}

// Category color header strip classes (fallback when subCategoryStripBg not provided)
const CATEGORY_STRIP_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  emerald: 'bg-emerald-500',
};

// Category to gradient mapping (vibrant gradients at low opacity for front face)
const categoryGradients: Record<string, string> = {
  'Principles of American Democracy': 'from-rose-500/10 to-pink-500/10',
  'System of Government': 'from-blue-500/10 to-cyan-500/10',
  'Rights and Responsibilities': 'from-emerald-500/10 to-lime-500/10',
  'American History: Colonial Period and Independence': 'from-amber-500/10 to-orange-500/10',
  'American History: 1800s': 'from-fuchsia-500/10 to-purple-500/10',
  'Recent American History and Other Important Historical Information':
    'from-sky-500/10 to-indigo-500/10',
  'Civics: Symbols and Holidays': 'from-slate-500/10 to-stone-500/10',
};

/**
 * 3D flip flashcard with physical paper-like texture.
 *
 * Features:
 * - 3D rotation in Y-axis space
 * - Paper-like texture with subtle shadow
 * - Tap/click to flip
 * - Keyboard accessible (Enter/Space to flip)
 * - TTS buttons for both languages
 * - Respects prefers-reduced-motion (instant flip)
 *
 * Usage:
 * ```tsx
 * <Flashcard3D
 *   questionEn="What is the supreme law of the land?"
 *   questionMy="တိုင်းပြည်၏အမြင့်ဆုံးဥပဒေကားအဘယ်နည်း။"
 *   answerEn="The Constitution"
 *   answerMy="ဖွဲ့စည်းပုံအခြေခံဥပဒေ"
 * />
 * ```
 */
export function Flashcard3D({
  questionEn,
  questionMy,
  answerEn,
  answerMy,
  category,
  categoryColor,
  subCategoryStripBg,
  explanation,
  allQuestions = [],
  onFlip,
  className,
}: Flashcard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleFlip = useCallback(() => {
    const newState = !isFlipped;
    setIsFlipped(newState);
    onFlip?.(newState);
  }, [isFlipped, onFlip]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      }
    },
    [handleFlip]
  );

  // Stop propagation on TTS button click to prevent card flip
  const handleTTSClick = useCallback((e: MouseEvent) => {
    e.stopPropagation();
  }, []);

  const gradient = category ? categoryGradients[category] : 'from-primary-500/10 to-primary-600/10';

  // Prefer sub-category strip color, fall back to main category color
  const stripColorClass =
    subCategoryStripBg ?? (categoryColor ? CATEGORY_STRIP_COLORS[categoryColor] : null);

  // Common card styles
  const cardFaceClasses = clsx(
    'absolute inset-0 w-full h-full',
    'rounded-2xl border border-border/60',
    'bg-card',
    'shadow-[0_6px_0_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]',
    'dark:shadow-[0_6px_0_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.3)]',
    'flex flex-col overflow-hidden',
    'backface-hidden' // CSS for hiding back face
  );

  // Category color header strip
  const colorStrip = stripColorClass ? (
    <div className={clsx('h-[5px] w-full shrink-0', stripColorClass)} aria-hidden="true" />
  ) : null;

  // Paper texture overlay
  const paperTexture = (
    <div
      className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    />
  );

  return (
    <div
      className={clsx(
        'relative w-full aspect-[3/4] max-w-sm mx-auto cursor-pointer',
        'perspective-1000', // Enable 3D space
        className
      )}
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isFlipped}
      aria-label={isFlipped ? 'Flip to question' : 'Flip to answer'}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={
          shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 25 }
        }
      >
        {/* Front - Question */}
        <div
          className={cardFaceClasses}
          style={{ backfaceVisibility: 'hidden', pointerEvents: isFlipped ? 'none' : 'auto' }}
        >
          {colorStrip}
          <div className={clsx('absolute inset-0 rounded-2xl bg-gradient-to-br', gradient)} />
          {paperTexture}

          <div className="relative z-10 flex-1 flex flex-col p-6">
            {/* Category badge */}
            {category && (
              <span className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {category}
              </span>
            )}

            {/* Question label */}
            <div className="text-sm font-medium text-primary-500 mb-2">Question / မေးခွန်း</div>

            {/* Question text */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-lg font-semibold text-foreground leading-relaxed">{questionEn}</p>
              <p className="mt-2 text-base font-myanmar text-muted-foreground leading-relaxed">
                {questionMy}
              </p>
            </div>

            {/* TTS and flip hint */}
            <div className="flex items-center justify-between mt-4">
              <div onClick={handleTTSClick}>
                <SpeechButton
                  text={questionEn}
                  label="Listen"
                  ariaLabel="Listen to question in English"
                  lang="en-US"
                  stopPropagation
                />
              </div>
              <span className="text-xs text-muted-foreground">Tap to flip / လှည့်ရန် နှိပ်ပါ</span>
            </div>
          </div>
        </div>

        {/* Back - Answer */}
        <div
          className={cardFaceClasses}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {colorStrip}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success-500/10 to-emerald-500/10" />
          {paperTexture}

          <div className="relative z-10 flex-1 flex flex-col overflow-hidden p-6">
            {/* Answer label */}
            <div className="text-sm font-medium text-success-500 mb-2 shrink-0">Answer / အဖြေ</div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
              {/* Answer text */}
              <div>
                <p className="text-xl font-bold text-foreground leading-relaxed">{answerEn}</p>
                <p className="mt-3 text-lg font-myanmar text-muted-foreground leading-relaxed">
                  {answerMy}
                </p>
              </div>

              {/* Explanation card - stopPropagation prevents flip on interact */}
              {explanation && (
                <div
                  className="mt-3"
                  role="region"
                  aria-label="Explanation"
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                  onPointerDown={e => e.stopPropagation()}
                >
                  <ExplanationCard
                    explanation={explanation}
                    allQuestions={allQuestions}
                    className="text-sm"
                  />
                </div>
              )}
            </div>

            {/* TTS and flip hint */}
            <div className="flex items-center justify-between mt-4 shrink-0">
              <div className="flex gap-2" onClick={handleTTSClick}>
                <SpeechButton
                  text={answerEn}
                  label="EN"
                  ariaLabel="Listen to answer in English"
                  lang="en-US"
                  stopPropagation
                />
                <SpeechButton
                  text={answerMy}
                  label="MY"
                  ariaLabel="Listen to answer in Burmese"
                  lang="my"
                  stopPropagation
                />
              </div>
              <span className="text-xs text-muted-foreground">Tap to flip / လှည့်ရန် နှိပ်ပါ</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Flashcard3D;
