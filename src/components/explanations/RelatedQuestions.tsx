'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Link2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import type { Question } from '@/types';

export interface RelatedQuestionsProps {
  /** IDs of related questions to display */
  questionIds: string[];
  /** All questions to look up by ID */
  allQuestions: Question[];
  /** Additional class names */
  className?: string;
}

/**
 * "See also" section with inline-expandable related question links.
 *
 * Features:
 * - Header: "See also / Burmese equivalent"
 * - Each related question shown as a clickable link
 * - Clicking expands to show full question + answer + explanation inline
 * - Uses AnimatePresence for smooth expand/collapse
 * - Stays in current view (no page navigation)
 * - Respects prefers-reduced-motion
 */
export function RelatedQuestions({
  questionIds,
  allQuestions,
  className,
}: RelatedQuestionsProps) {
  const { showBurmese } = useLanguage();

  // Look up actual question data from IDs
  const relatedQuestions = questionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);

  if (relatedQuestions.length === 0) {
    return null;
  }

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Section header */}
      <div className="flex items-center gap-1.5">
        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          {strings.explanations.seeAlso.en}
        </span>
        {showBurmese && (
          <span className="font-myanmar text-xs text-muted-foreground/70">
            {strings.explanations.seeAlso.my}
          </span>
        )}
      </div>

      {/* Related question links */}
      <div className="space-y-1.5">
        {relatedQuestions.map((question) => (
          <RelatedQuestionItem
            key={question.id}
            question={question}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Single related question item with inline expand/collapse.
 */
function RelatedQuestionItem({ question }: { question: Question }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  // Get first correct study answer for display
  const primaryAnswer = question.studyAnswers[0];

  return (
    <div className="rounded-xl border border-border/30 bg-muted/20 overflow-hidden">
      {/* Clickable question link */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className={clsx(
          'flex w-full items-center gap-2 px-3 py-2 text-left',
          'min-h-[36px]',
          'transition-colors duration-150',
          'hover:bg-muted/40',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset'
        )}
        aria-expanded={isExpanded}
      >
        <motion.span
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }
          }
        >
          <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        </motion.span>
        <span className="flex flex-1 flex-col">
          <span className="text-xs text-primary-600 dark:text-primary-400 leading-snug">
            {question.question_en}
          </span>
          {showBurmese && (
            <span className="font-myanmar text-xs text-muted-foreground leading-snug">
              {question.question_my}
            </span>
          )}
        </span>
      </button>

      {/* Expanded content: answer + explanation */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: 'easeInOut' }
            }
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 px-3 py-2.5 pl-8 space-y-2">
              {/* Answer */}
              {primaryAnswer && (
                <div>
                  <p className="text-xs font-medium text-foreground">
                    {primaryAnswer.text_en}
                  </p>
                  {showBurmese && (
                    <p className="font-myanmar text-xs text-muted-foreground">
                      {primaryAnswer.text_my}
                    </p>
                  )}
                </div>
              )}

              {/* Brief explanation if available */}
              {question.explanation && (
                <div className="border-t border-border/20 pt-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {question.explanation.brief_en}
                  </p>
                  {showBurmese && (
                    <p className="mt-0.5 font-myanmar text-xs text-muted-foreground/80 leading-relaxed">
                      {question.explanation.brief_my}
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
