'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, ChevronDown, AlertTriangle, Brain, BookOpen, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { strings } from '@/lib/i18n/strings';
import { RelatedQuestions } from './RelatedQuestions';
import type { Explanation, Question } from '@/types';

export interface ExplanationCardProps {
  /** Explanation content to display */
  explanation: Explanation;
  /** Whether the user answered correctly (affects which sections show) */
  isCorrect?: boolean;
  /** Start expanded instead of collapsed */
  defaultExpanded?: boolean;
  /** Hide the collapsible header (when parent already provides expand/collapse) */
  hideHeader?: boolean;
  /** All questions (needed for RelatedQuestions lookups) */
  allQuestions?: Question[];
  /** Additional class names */
  className?: string;
}

/**
 * Expandable bilingual explanation display.
 *
 * Features:
 * - Collapsed: "Why? / burmese" header with Lightbulb icon and chevron
 * - Expanded: brief explanation, common mistake, mnemonic, citation, fun fact
 * - All text is bilingual (EN on top, MY below)
 * - Respects prefers-reduced-motion
 * - 44px minimum touch target on trigger
 * - Uses design token classes (bg-card, text-foreground, etc.)
 */
export function ExplanationCard({
  explanation,
  isCorrect,
  defaultExpanded = false,
  hideHeader = false,
  allQuestions = [],
  className,
}: ExplanationCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || hideHeader);
  const shouldReduceMotion = useReducedMotion();
  const { showBurmese } = useLanguage();

  const hasCommonMistake = isCorrect === false && !!explanation.commonMistake_en;
  const hasMnemonic = !!explanation.mnemonic_en;
  const hasCitation = !!explanation.citation;
  const hasFunFact = !!explanation.funFact_en;
  const hasRelated = !!explanation.relatedQuestionIds && explanation.relatedQuestionIds.length > 0;

  // When hideHeader is true, content is always shown (parent handles expand/collapse)
  const showContent = hideHeader || isExpanded;

  return (
    <div className={clsx('rounded-2xl border border-border/60 bg-card overflow-hidden', className)}>
      {/* Trigger button - hidden when parent provides its own header */}
      {!hideHeader && (
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className={clsx(
            'flex w-full items-center gap-3 px-4 text-left',
            'min-h-[44px] py-3',
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
          <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
          <span className="flex flex-1 flex-col">
            <span className="text-sm font-semibold text-foreground">
              {strings.explanations.why.en}
            </span>
            {showBurmese && (
              <span className="font-myanmar text-xs text-muted-foreground">
                {strings.explanations.why.my}
              </span>
            )}
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        </button>
      )}

      {/* Expandable content */}
      <AnimatePresence initial={false}>
        {showContent && (
          <motion.div
            initial={
              hideHeader
                ? { height: 'auto', opacity: 1 }
                : shouldReduceMotion
                  ? { opacity: 1 }
                  : { height: 0, opacity: 0 }
            }
            animate={{ height: 'auto', opacity: 1 }}
            exit={
              hideHeader
                ? { opacity: 0 }
                : shouldReduceMotion
                  ? { opacity: 0 }
                  : { height: 0, opacity: 0 }
            }
            transition={
              shouldReduceMotion || hideHeader
                ? { duration: 0 }
                : { duration: 0.25, ease: 'easeInOut' }
            }
            className="overflow-hidden"
          >
            <div className="space-y-3 px-4 pb-4">
              {/* Divider - only when header is shown */}
              {!hideHeader && <div className="border-t border-border/40" />}

              {/* Brief explanation */}
              <div>
                <p className="text-sm text-foreground leading-relaxed">{explanation.brief_en}</p>
                {showBurmese && (
                  <p className="mt-1 font-myanmar text-xs text-muted-foreground leading-relaxed">
                    {explanation.brief_my}
                  </p>
                )}
              </div>

              {/* Common mistake (only when incorrect AND data exists) */}
              {hasCommonMistake && (
                <div className="rounded-xl border border-warning/30 bg-warning-subtle p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {strings.explanations.commonMistake.en}
                      </p>
                      {showBurmese && (
                        <p className="font-myanmar text-xs text-muted-foreground">
                          {strings.explanations.commonMistake.my}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-foreground leading-relaxed">
                        {explanation.commonMistake_en}
                      </p>
                      {showBurmese && explanation.commonMistake_my && (
                        <p className="mt-0.5 font-myanmar text-xs text-muted-foreground leading-relaxed">
                          {explanation.commonMistake_my}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mnemonic / Memory tip */}
              {hasMnemonic && (
                <div className="rounded-xl border border-primary-500/30 bg-primary-subtle p-3">
                  <div className="flex items-start gap-2">
                    <Brain className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {strings.explanations.memoryTip.en}
                      </p>
                      {showBurmese && (
                        <p className="font-myanmar text-xs text-muted-foreground">
                          {strings.explanations.memoryTip.my}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-foreground leading-relaxed">
                        {explanation.mnemonic_en}
                      </p>
                      {showBurmese && explanation.mnemonic_my && (
                        <p className="mt-0.5 font-myanmar text-xs text-muted-foreground leading-relaxed">
                          {explanation.mnemonic_my}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Citation */}
              {hasCitation && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5 shrink-0" />
                  <span className="italic">{explanation.citation}</span>
                </div>
              )}

              {/* Fun fact */}
              {hasFunFact && (
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {strings.explanations.funFact.en}
                      </p>
                      {showBurmese && (
                        <p className="font-myanmar text-xs text-muted-foreground">
                          {strings.explanations.funFact.my}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-foreground leading-relaxed">
                        {explanation.funFact_en}
                      </p>
                      {showBurmese && explanation.funFact_my && (
                        <p className="mt-0.5 font-myanmar text-xs text-muted-foreground leading-relaxed">
                          {explanation.funFact_my}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Related questions */}
              {hasRelated && (
                <RelatedQuestions
                  questionIds={explanation.relatedQuestionIds!}
                  allQuestions={allQuestions}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
