'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useRovingFocus } from '@/hooks/useRovingFocus';
import type { Answer } from '@/types';

// ---------------------------------------------------------------------------
// AnswerOption (individual option)
// ---------------------------------------------------------------------------

interface AnswerOptionProps {
  answer: Answer;
  isSelected: boolean;
  isFocused: boolean;
  isLocked: boolean;
  isCorrectReveal?: boolean;
  isIncorrectReveal?: boolean;
  onSelect: () => void;
  showBurmese: boolean;
  index: number;
  /** When true, this option gets tabIndex=0 for keyboard reachability but no focus ring */
  isDefaultTabTarget?: boolean;
}

/**
 * Selectable answer option with visual states and keyboard nav support.
 *
 * Features:
 * - 3D chunky button style with press-down effect
 * - Visible focus ring (always, not just focus-visible)
 * - Post-check color reveals: green for correct, amber for incorrect
 * - Staggered entrance animation
 * - Min height 56px for touch targets
 * - role="radio" with aria-checked
 * - Roving tabIndex from parent group
 */
function AnswerOption({
  answer,
  isSelected,
  isFocused,
  isLocked,
  isCorrectReveal = false,
  isIncorrectReveal = false,
  onSelect,
  showBurmese,
  index,
  isDefaultTabTarget = false,
}: AnswerOptionProps) {
  const shouldReduceMotion = useReducedMotion();
  const optionRef = useRef<HTMLDivElement>(null);

  // Focus the DOM element when this option receives roving focus
  useEffect(() => {
    if (isFocused && optionRef.current) {
      optionRef.current.focus({ preventScroll: true });
    }
  }, [isFocused]);

  const handleClick = useCallback(() => {
    if (!isLocked) {
      onSelect();
    }
  }, [isLocked, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Enter or Space selects the option (standard radio pattern)
      if ((e.key === 'Enter' || e.key === ' ') && !isLocked) {
        e.preventDefault();
        onSelect();
      }
    },
    [isLocked, onSelect]
  );

  // Determine visual state classes
  const isRevealed = isCorrectReveal || isIncorrectReveal;
  const isDimmedAfterCheck = isLocked && !isCorrectReveal && !isIncorrectReveal && !isSelected;

  return (
    <motion.div
      ref={optionRef}
      role="radio"
      aria-checked={isSelected}
      aria-disabled={isLocked}
      tabIndex={isFocused || isDefaultTabTarget ? 0 : -1}
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { ...SPRING_SNAPPY, delay: index * 0.05 }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clsx(
        // Base styles
        'relative w-full rounded-xl border-2 px-4 py-3 text-left transition-all duration-100',
        'min-h-[56px] flex items-center',
        // 3D chunky shadow
        !isLocked && 'shadow-[0_4px_0_hsl(var(--color-border))]',
        !isLocked && 'active:shadow-[0_1px_0_hsl(var(--color-border))] active:translate-y-[3px]',
        // Focus ring (always visible when focused, not just focus-visible)
        isFocused && !isRevealed && 'ring-2 ring-primary ring-offset-2',
        // --- State-based styling ---
        // Not yet checked
        !isLocked &&
          !isSelected &&
          'border-border bg-card cursor-pointer hover:border-primary/50 hover:bg-primary-subtle/30',
        !isLocked && isSelected && 'border-primary bg-primary-subtle cursor-pointer',
        // After check: correct option (green)
        isCorrectReveal && 'border-success bg-success-subtle',
        // After check: incorrect selected (amber)
        isIncorrectReveal && 'border-warning bg-warning-subtle',
        // After check: dimmed non-relevant options
        isDimmedAfterCheck && 'border-border bg-card opacity-50 pointer-events-none',
        // Locked after check
        isLocked && 'cursor-default',
        // Focus ring for revealed states
        isFocused && isCorrectReveal && 'ring-2 ring-success ring-offset-2',
        isFocused && isIncorrectReveal && 'ring-2 ring-warning ring-offset-2'
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground sm:text-base">{answer.text_en}</p>
        {showBurmese && answer.text_my && (
          <p className="mt-0.5 font-myanmar text-sm text-muted-foreground">{answer.text_my}</p>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AnswerOptionGroup (container with keyboard navigation)
// ---------------------------------------------------------------------------

interface AnswerOptionGroupProps {
  answers: Answer[];
  selectedAnswer: Answer | null;
  isLocked: boolean;
  correctAnswer?: Answer;
  onSelect: (answer: Answer) => void;
  showBurmese: boolean;
}

/**
 * Container for answer options with W3C radiogroup keyboard navigation.
 *
 * Features:
 * - role="radiogroup" with roving tabIndex
 * - Arrow keys navigate between options (circular wrapping)
 * - Arrow keys directly select the focused option (per locked decision)
 * - Visible focus ring on focused option (always, not just focus-visible)
 * - After check: correct option green, wrong pick amber, others dimmed
 */
function AnswerOptionGroup({
  answers,
  selectedAnswer,
  isLocked,
  correctAnswer,
  onSelect,
  showBurmese,
}: AnswerOptionGroupProps) {
  const {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown: rovingKeyDown,
  } = useRovingFocus(answers.length);

  // Arrow keys directly select the answer (per locked decision)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isLocked) return;

      const isArrow = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key);
      if (isArrow) {
        // Let roving focus handle index update first
        rovingKeyDown(e);

        // Calculate next index to determine which answer to select
        let nextIndex: number;
        if (focusedIndex < 0) {
          // First keyboard interaction — go to first or last
          nextIndex = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 0 : answers.length - 1;
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (focusedIndex + 1) % answers.length;
        } else {
          nextIndex = (focusedIndex - 1 + answers.length) % answers.length;
        }
        onSelect(answers[nextIndex]);
      }
    },
    [isLocked, rovingKeyDown, focusedIndex, answers, onSelect]
  );

  const handleOptionSelect = useCallback(
    (answer: Answer, index: number) => {
      setFocusedIndex(index);
      onSelect(answer);
    },
    [setFocusedIndex, onSelect]
  );

  return (
    <div
      role="radiogroup"
      aria-label="Answer options"
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3"
    >
      {answers.map((answer, index) => {
        const isSelected = selectedAnswer?.text_en === answer.text_en;
        const isCorrectReveal = isLocked && correctAnswer?.text_en === answer.text_en;
        const isIncorrectReveal =
          isLocked && isSelected && correctAnswer?.text_en !== answer.text_en;

        return (
          <AnswerOption
            key={answer.text_en}
            answer={answer}
            isSelected={isSelected}
            isFocused={focusedIndex === index}
            isLocked={isLocked}
            isCorrectReveal={isCorrectReveal}
            isIncorrectReveal={isIncorrectReveal}
            onSelect={() => handleOptionSelect(answer, index)}
            showBurmese={showBurmese}
            index={index}
            isDefaultTabTarget={focusedIndex < 0 && index === 0}
          />
        );
      })}
    </div>
  );
}

export { AnswerOption, AnswerOptionGroup };
