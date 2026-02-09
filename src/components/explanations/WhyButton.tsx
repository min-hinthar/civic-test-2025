'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import { ExplanationCard } from './ExplanationCard';
import type { Explanation, Question } from '@/types';

export interface WhyButtonProps {
  /** Explanation content to display when expanded */
  explanation: Explanation;
  /** Whether the user answered correctly */
  isCorrect?: boolean;
  /** Compact mode: smaller footprint, icon + "Why?" only in header */
  compact?: boolean;
  /** All questions (passed through to ExplanationCard for RelatedQuestions) */
  allQuestions?: Question[];
  /** Callback when expand/collapse state changes */
  onExpandChange?: (expanded: boolean) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Auto-visible collapsed explanation card with "Why?" header.
 *
 * IMPORTANT: This component is VISIBLE automatically after user answers.
 * It is NOT hidden behind a separate action -- it renders as a small
 * expandable card that the user taps to reveal the full ExplanationCard.
 *
 * Features:
 * - Collapsed: small card with Lightbulb icon + "Why?" text + chevron
 * - Expanded: full ExplanationCard content revealed inline
 * - compact mode: just icon + "Why?" text without Burmese in header
 * - Min height 44px for touch accessibility
 * - Respects prefers-reduced-motion
 */
export function WhyButton({
  explanation,
  isCorrect,
  compact = false,
  allQuestions = [],
  onExpandChange,
  className,
}: WhyButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  return (
    <div className={clsx('rounded-2xl border border-border/60 bg-card overflow-hidden', className)}>
      {/* Trigger header */}
      <button
        type="button"
        onClick={() => {
          setIsExpanded(prev => {
            const next = !prev;
            onExpandChange?.(next);
            return next;
          });
        }}
        className={clsx(
          'flex w-full items-center gap-2.5 px-4 text-left',
          'min-h-[44px] py-2.5',
          'transition-colors duration-150',
          'hover:bg-muted/50',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
        )}
        aria-expanded={isExpanded}
        aria-label={
          isExpanded
            ? strings.explanations.hideExplanation.en
            : strings.explanations.showExplanation.en
        }
      >
        <Lightbulb className={clsx('shrink-0 text-primary', compact ? 'h-4 w-4' : 'h-5 w-5')} />
        <span className="flex flex-1 flex-col">
          <span className={clsx('font-semibold text-foreground', compact ? 'text-xs' : 'text-sm')}>
            {strings.explanations.why.en}
          </span>
          {!compact && showBurmese && (
            <span className="font-myanmar text-xs text-muted-foreground">
              {strings.explanations.why.my}
            </span>
          )}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        >
          <ChevronDown
            className={clsx('text-muted-foreground', compact ? 'h-3.5 w-3.5' : 'h-4 w-4')}
          />
        </motion.span>
      </button>

      {/* Expanded ExplanationCard content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeInOut' }
            }
            className="overflow-hidden"
          >
            <ExplanationCard
              explanation={explanation}
              isCorrect={isCorrect}
              defaultExpanded
              hideHeader
              allQuestions={allQuestions}
              className="border-0 rounded-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
