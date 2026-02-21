'use client';

import { useState, useCallback, KeyboardEvent, MouseEvent } from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import { Star } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useUserState } from '@/contexts/StateContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SpeechButton from '@/components/ui/SpeechButton';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { ExplanationCard } from '@/components/explanations/ExplanationCard';
import { getSubCategoryColors, SUB_CATEGORY_NAMES } from '@/lib/mastery';
import type { Category, DynamicAnswerMeta, Explanation, Question } from '@/types';
import { hapticMedium } from '@/lib/haptics';

/**
 * Spring config for the flashcard flip: slight overshoot past 180 degrees.
 * Lower damping (18) compared to standard SPRING_BOUNCY (15) gives
 * a visible settle at the target while stiffness 250 keeps it snappy.
 */
const FLIP_SPRING = { type: 'spring' as const, stiffness: 250, damping: 22, mass: 0.8 };

/** Mastery state label for FSRS card tracking */
export type MasteryLevel = 'New' | 'Learning' | 'Review' | 'Mastered' | null;

/** Difficulty tier for display */
type DifficultyTier = 'Beginner' | 'Intermediate' | 'Advanced';

/** Map difficulty tier to color + Burmese label */
const DIFFICULTY_CONFIG: Record<DifficultyTier, { color: string; labelMy: string; dots: number }> =
  {
    Beginner: { color: 'text-success-500', labelMy: 'အစပြု', dots: 1 },
    Intermediate: { color: 'text-warning-500', labelMy: 'အလယ်အလတ်', dots: 2 },
    Advanced: { color: 'text-destructive', labelMy: 'အဆင့်မြင့်', dots: 3 },
  };

/** Map mastery level to color */
const MASTERY_CONFIG: Record<string, { color: string; labelMy: string }> = {
  New: { color: 'text-muted-foreground', labelMy: 'အသစ်' },
  Learning: { color: 'text-warning-500', labelMy: 'လေ့လာနေဆဲ' },
  Review: { color: 'text-blue-500', labelMy: 'ပြန်လည်သုံးသပ်' },
  Mastered: { color: 'text-success-500', labelMy: 'ကျွမ်းကျင်ပြီး' },
};

interface Flashcard3DProps {
  /** Question ID for Burmese audio lookup */
  questionId?: string;
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
  /** Sub-category strip background class (e.g. 'bg-primary') - overrides categoryColor */
  subCategoryStripBg?: string;
  /** Optional explanation to show on back of card */
  explanation?: Explanation;
  /** All questions for RelatedQuestions lookup */
  allQuestions?: Question[];
  /** Dynamic answer metadata for time/state-varying questions */
  dynamic?: DynamicAnswerMeta;
  /** Called when card is flipped */
  onFlip?: (isFlipped: boolean) => void;
  /** Show speed label on speech buttons */
  showSpeedLabel?: boolean;
  /** Speed label text (e.g. '1x', '0.75x') */
  speedLabel?: string;
  /** Difficulty tier for this question */
  difficulty?: DifficultyTier;
  /** FSRS mastery state label */
  masteryState?: MasteryLevel;
  /** Whether this card is bookmarked */
  isBookmarked?: boolean;
  /** Callback to toggle bookmark */
  onToggleBookmark?: (questionId: string) => void;
  /** Controlled flip state — when provided, parent controls flip */
  controlledFlipped?: boolean;
  /** Additional class names */
  className?: string;
}

// Category color header strip classes (fallback when subCategoryStripBg not provided)
const CATEGORY_STRIP_COLORS: Record<string, string> = {
  blue: 'bg-primary',
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
 * Bilingual dynamic answer note for time/state-varying questions.
 * Exported for reuse across study, test, and interview pages.
 */
export function DynamicAnswerNote({
  dynamic,
  stateInfo,
  showBurmese = true,
}: {
  dynamic: DynamicAnswerMeta;
  stateInfo: {
    name: string;
    governor: string;
    senators: [string, string] | null;
    capital: string;
  } | null;
  showBurmese?: boolean;
}) {
  if (dynamic.type === 'time') {
    return (
      <div className="bg-warning-subtle rounded-lg p-2 mt-2">
        <p className="text-xs text-foreground/80">
          This answer may change with elections. Last verified: {dynamic.lastVerified}
        </p>
        {showBurmese && (
          <p className="text-xs text-foreground/60 font-myanmar mt-0.5">
            {'ဤအဖြေသည် ရွေးကောက်ပွဲများနှင့်အတူ ပြောင်းလဲနိုင်ပါသည်။ နောက်ဆုံးအတည်ပြုချိန်: '}
            {dynamic.lastVerified}
          </p>
        )}
      </div>
    );
  }

  // dynamic.type === 'state'
  if (stateInfo) {
    let answer: string;
    const field = dynamic.field;
    if (field === 'governor') {
      answer = stateInfo.governor;
    } else if (field === 'senators') {
      answer = stateInfo.senators ? stateInfo.senators.join(', ') : 'N/A';
    } else if (field === 'capital') {
      answer = stateInfo.capital;
    } else if (field === 'representative') {
      answer = 'Visit house.gov to find your representative';
    } else {
      answer = '';
    }
    return (
      <div className="bg-warning-subtle rounded-lg p-2 mt-2">
        <p className="text-xs text-foreground/80">
          For {stateInfo.name}: {answer}
        </p>
        {showBurmese && (
          <p className="text-xs text-foreground/60 font-myanmar mt-0.5">
            {stateInfo.name}
            {'အတွက်: '}
            {answer}
          </p>
        )}
      </div>
    );
  }

  // No state selected
  return (
    <div className="bg-warning-subtle rounded-lg p-2 mt-2">
      <p className="text-xs text-foreground/80">
        Go to Settings to select your state for a personalized answer.
      </p>
      {showBurmese && (
        <p className="text-xs text-foreground/60 font-myanmar mt-0.5">
          {'ပုဂ္ဂိုလ်ရေးအဖြေအတွက် ဆက်တင်တွင် သင့်ပြည်နယ်ကို ရွေးချယ်ပါ။'}
        </p>
      )}
    </div>
  );
}

/**
 * 3D flip flashcard with physical paper-like texture.
 *
 * Features:
 * - 3D rotation in Y-axis space
 * - Paper-like texture with subtle shadow
 * - Tap/click to flip
 * - Keyboard accessible (Enter/Space to flip)
 * - TTS buttons for both languages
 * - Respects prefers-reduced-motion (crossfade between faces, no 3D rotation)
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
  questionId,
  questionEn,
  questionMy,
  answerEn,
  answerMy,
  category,
  categoryColor,
  subCategoryStripBg,
  explanation,
  allQuestions = [],
  dynamic,
  onFlip,
  showSpeedLabel = false,
  speedLabel,
  difficulty,
  masteryState,
  isBookmarked = false,
  onToggleBookmark,
  controlledFlipped,
  className,
}: Flashcard3DProps) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipControlled = controlledFlipped !== undefined;
  const isFlipped = isFlipControlled ? controlledFlipped : internalFlipped;
  const shouldReduceMotion = useReducedMotion();
  const { stateInfo } = useUserState();
  const { showBurmese } = useLanguage();

  const handleFlip = useCallback(() => {
    hapticMedium();
    const newState = !isFlipped;
    if (!isFlipControlled) {
      setInternalFlipped(newState);
    }
    onFlip?.(newState);
  }, [isFlipped, isFlipControlled, onFlip]);

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

  // Bookmark toggle — stops propagation to prevent card flip
  const handleBookmarkClick = useCallback(
    (e: MouseEvent) => {
      e.stopPropagation();
      if (questionId && onToggleBookmark) {
        onToggleBookmark(questionId);
      }
    },
    [questionId, onToggleBookmark]
  );

  // Sub-category colors for category badge on back
  const subCatColors = category ? getSubCategoryColors(category as Category) : null;
  const subCatName = category ? SUB_CATEGORY_NAMES[category as Category] : null;

  const gradient = category ? categoryGradients[category] : 'from-primary/10 to-primary-600/10';

  // Prefer sub-category strip color, fall back to main category color
  const stripColorClass =
    subCategoryStripBg ?? (categoryColor ? CATEGORY_STRIP_COLORS[categoryColor] : null);

  // Card face styles — avoid glass-light (backdrop-filter) and prismatic-border
  // (position:relative, isolation:isolate) inside preserve-3d context.
  // These properties break 3D transforms on mobile browsers.
  // backfaceVisibility applied via inline style only (highest specificity for 3D transforms)
  const cardFaceClasses = clsx(
    'absolute inset-0 w-full h-full',
    'rounded-2xl',
    'bg-card border border-border/60',
    'shadow-[0_6px_0_0_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.12)]',
    'dark:shadow-[0_6px_0_0_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.3)]',
    'flex flex-col overflow-hidden'
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
      style={{ perspective: '1000px', isolation: 'isolate' }}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isFlipped}
      aria-label={isFlipped ? 'Flip to question' : 'Flip to answer'}
    >
      <motion.div
        className="relative w-full h-full"
        style={{
          // Under reduced motion, skip 3D transforms (crossfade instead)
          transformStyle: shouldReduceMotion ? undefined : 'preserve-3d',
          willChange: shouldReduceMotion ? undefined : 'transform',
          transformOrigin: 'center center',
        }}
        animate={shouldReduceMotion ? {} : { rotateY: isFlipped ? 180 : 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : FLIP_SPRING}
      >
        {/* Front - Question */}
        <div
          className={cardFaceClasses}
          style={{
            // Reduced motion: crossfade via CSS opacity transition (200ms)
            // Normal: hide back face via 3D backfaceVisibility
            ...(shouldReduceMotion
              ? { opacity: isFlipped ? 0 : 1, transition: 'opacity 200ms ease-in-out' }
              : {
                  WebkitBackfaceVisibility: 'hidden' as const,
                  backfaceVisibility: 'hidden' as const,
                  // Explicit transform required — mobile browsers only honor
                  // backface-visibility on elements that participate in 3D transforms
                  transform: 'rotateY(0deg)',
                }),
            pointerEvents: isFlipped ? 'none' : 'auto',
          }}
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
            <div className="text-sm font-medium text-primary mb-2">
              Question{showBurmese && <span className="font-myanmar"> / မေးခွန်း</span>}
            </div>

            {/* Question text */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-lg font-semibold text-foreground leading-relaxed">{questionEn}</p>
              {showBurmese && (
                <p className="mt-2 text-lg font-myanmar text-muted-foreground leading-relaxed">
                  {questionMy}
                </p>
              )}
            </div>

            {/* TTS and flip hint */}
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-4">
              <div
                className="flex gap-2"
                onClick={handleTTSClick}
                style={{ isolation: 'isolate', transform: 'translateZ(0)' }}
              >
                <SpeechButton
                  text={questionEn}
                  questionId={questionId}
                  audioType="q"
                  label="Question"
                  ariaLabel="Listen to question in English"
                  lang="en-US"
                  stopPropagation
                  showSpeedLabel={showSpeedLabel}
                  speedLabel={speedLabel}
                />
                {showBurmese && questionId && (
                  <BurmeseSpeechButton
                    questionId={questionId}
                    audioType="q"
                    label="မေးခွန်း"
                    stopPropagation
                    showSpeedLabel={showSpeedLabel}
                    speedLabel={speedLabel}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Tap to flip{showBurmese && <span className="font-myanmar"> / လှည့်ရန်</span>}
              </span>
            </div>
          </div>
        </div>

        {/* Back - Answer */}
        <div
          className={cardFaceClasses}
          style={{
            // Reduced motion: crossfade via CSS opacity transition (200ms)
            // Normal: rotate 180deg in 3D space, hide back face
            ...(shouldReduceMotion
              ? { opacity: isFlipped ? 1 : 0, transition: 'opacity 200ms ease-in-out' }
              : {
                  WebkitBackfaceVisibility: 'hidden' as const,
                  backfaceVisibility: 'hidden' as const,
                  transform: 'rotateY(180deg)',
                }),
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {colorStrip}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-success/10 to-emerald-500/10" />
          {paperTexture}

          <div className="relative z-10 flex-1 flex flex-col overflow-hidden p-6">
            {/* Top bar: Answer label + bookmark star */}
            <div className="flex items-center justify-between mb-2 shrink-0">
              <div className="text-sm font-medium text-success">
                Answer{showBurmese && <span className="font-myanmar"> / အဖြေ</span>}
              </div>
              {questionId && onToggleBookmark && (
                <motion.button
                  type="button"
                  onClick={handleBookmarkClick}
                  whileTap={{ scale: 0.85 }}
                  className={clsx(
                    'h-11 w-11 flex items-center justify-center rounded-xl',
                    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                  aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                  aria-pressed={isBookmarked}
                >
                  <Star
                    className={clsx(
                      'h-5 w-5 transition-colors',
                      isBookmarked ? 'fill-current text-primary' : 'text-muted-foreground'
                    )}
                  />
                </motion.button>
              )}
            </div>

            {/* Metadata badges: category + difficulty + mastery */}
            <div className="flex flex-wrap items-center gap-2 mb-3 shrink-0">
              {/* Category badge */}
              {subCatColors && subCatName && (
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                    subCatColors.textColor,
                    'bg-muted/60'
                  )}
                >
                  <span
                    className={clsx('h-1.5 w-1.5 rounded-full', subCatColors.stripBg)}
                    aria-hidden="true"
                  />
                  {subCatName.en}
                </span>
              )}

              {/* Difficulty indicator */}
              {difficulty && (
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/60',
                    DIFFICULTY_CONFIG[difficulty].color
                  )}
                >
                  {/* Dots indicator */}
                  <span className="flex gap-0.5" aria-hidden="true">
                    {[1, 2, 3].map(dot => (
                      <span
                        key={dot}
                        className={clsx(
                          'h-1.5 w-1.5 rounded-full',
                          dot <= DIFFICULTY_CONFIG[difficulty].dots
                            ? 'bg-current'
                            : 'bg-current opacity-20'
                        )}
                      />
                    ))}
                  </span>
                  {difficulty}
                  {showBurmese && (
                    <span className="font-myanmar ml-0.5">
                      {DIFFICULTY_CONFIG[difficulty].labelMy}
                    </span>
                  )}
                </span>
              )}

              {/* Mastery level */}
              {masteryState && MASTERY_CONFIG[masteryState] && (
                <span
                  className={clsx(
                    'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted/60',
                    MASTERY_CONFIG[masteryState].color
                  )}
                >
                  {masteryState}
                  {showBurmese && (
                    <span className="font-myanmar ml-0.5">
                      {MASTERY_CONFIG[masteryState].labelMy}
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
              {/* Answer text */}
              <div>
                <p className="text-xl font-bold text-foreground leading-relaxed">{answerEn}</p>
                {showBurmese && (
                  <p className="mt-3 text-xl font-myanmar text-muted-foreground leading-relaxed">
                    {answerMy}
                  </p>
                )}
              </div>

              {/* Dynamic answer note for time/state-varying questions */}
              {dynamic && (
                <DynamicAnswerNote
                  dynamic={dynamic}
                  stateInfo={stateInfo}
                  showBurmese={showBurmese}
                />
              )}

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
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mt-4 shrink-0">
              <div
                className="flex gap-2"
                onClick={handleTTSClick}
                style={{ isolation: 'isolate', transform: 'translateZ(0)' }}
              >
                <SpeechButton
                  text={answerEn}
                  questionId={questionId}
                  audioType="a"
                  label="Answer"
                  ariaLabel="Listen to answer in English"
                  lang="en-US"
                  stopPropagation
                  showSpeedLabel={showSpeedLabel}
                  speedLabel={speedLabel}
                />
                {showBurmese && questionId && (
                  <BurmeseSpeechButton
                    questionId={questionId}
                    audioType="a"
                    label="အဖြေ"
                    stopPropagation
                    showSpeedLabel={showSpeedLabel}
                    speedLabel={speedLabel}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Tap to flip{showBurmese && <span className="font-myanmar"> / လှည့်ရန်</span>}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Flashcard3D;
