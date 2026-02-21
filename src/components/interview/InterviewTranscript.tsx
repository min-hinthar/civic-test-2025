'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { ChatBubble } from '@/components/interview/ChatBubble';
import { ExaminerCharacter } from '@/components/interview/ExaminerCharacter';
import { KeywordHighlight } from '@/components/interview/KeywordHighlight';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { AddToDeckButton } from '@/components/srs/AddToDeckButton';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { SPRING_GENTLE } from '@/lib/motion-config';
import type { InterviewResult, InterviewMode, InterviewEndReason } from '@/types';

interface InterviewTranscriptProps {
  results: InterviewResult[];
  mode: InterviewMode;
  endReason: InterviewEndReason;
  earlyTerminationIndex?: number;
  showBurmese: boolean;
  /** Speed label for speech buttons (e.g., "slow", "fast") */
  speedLabel?: string;
}

/** Map end reasons to termination messages */
function getTerminationMessage(
  endReason: InterviewEndReason,
  index: number
): { en: string; my: string } {
  switch (endReason) {
    case 'passThreshold':
      return {
        en: `Interview ended at question ${index + 1} -- you passed!`,
        my: `မေးခွန်း ${index + 1} တွင် အင်တာဗျူးအဆုံးသတ်ပြီ -- အောင်မြင်ပါတယ်!`,
      };
    case 'failThreshold':
      return {
        en: `Interview ended at question ${index + 1}`,
        my: `မေးခွန်း ${index + 1} တွင် အင်တာဗျူးအဆုံးသတ်ပြီ`,
      };
    case 'quit':
      return {
        en: `Interview ended early at question ${index + 1}`,
        my: `မေးခွန်း ${index + 1} တွင် အင်တာဗျူးကို ရပ်ဆိုင်းပြီ`,
      };
    default:
      return { en: '', my: '' };
  }
}

/**
 * Full scrollable transcript of the interview session using ChatBubble components.
 *
 * Features:
 * - Examiner ChatBubble (left) with question text
 * - User ChatBubble (right) with transcript or "[Self-graded]"
 * - Green/red border + check/X icon per result
 * - Confidence badge showing match quality
 * - Expandable correct answer on incorrect items
 * - Early termination divider
 * - Auto-scroll to first incorrect answer
 * - AddToDeckButton on each incorrect answer
 */
export function InterviewTranscript({
  results,
  mode,
  endReason,
  earlyTerminationIndex,
  showBurmese,
  speedLabel,
}: InterviewTranscriptProps) {
  const shouldReduceMotion = useReducedMotion();

  // Track which incorrect answers have their correct answer expanded
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Ref for auto-scrolling to first incorrect
  const firstIncorrectRef = useRef<HTMLDivElement | null>(null);
  const hasScrolled = useRef(false);

  // Find first incorrect index
  const firstIncorrectIndex = useMemo(
    () => results.findIndex(r => r.selfGrade === 'incorrect'),
    [results]
  );

  // Auto-scroll to first incorrect answer
  useEffect(() => {
    if (firstIncorrectIndex >= 0 && firstIncorrectRef.current && !hasScrolled.current) {
      hasScrolled.current = true;
      const timer = setTimeout(() => {
        firstIncorrectRef.current?.scrollIntoView({
          behavior: shouldReduceMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      }, 600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [firstIncorrectIndex, shouldReduceMotion]);

  // Determine where early termination marker goes
  const terminationIndex: number | undefined = useMemo(() => {
    if (endReason === 'complete') return undefined;
    return earlyTerminationIndex ?? results.length - 1;
  }, [endReason, earlyTerminationIndex, results.length]);

  const toggleExpand = useCallback((index: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      {results.map((result, index) => {
        const isCorrect = result.selfGrade === 'correct';
        const isExpanded = expandedItems.has(index);
        const isFirstIncorrect = index === firstIncorrectIndex;
        const showTerminationMarker = terminationIndex !== undefined && index === terminationIndex;

        return (
          <div key={`${result.questionId}-${index}`}>
            {/* Question/Answer pair */}
            <div ref={isFirstIncorrect ? firstIncorrectRef : undefined} className="space-y-2">
              {/* Examiner question bubble (left) */}
              <ChatBubble sender="examiner" avatar={<ExaminerCharacter state="idle" size="sm" />}>
                <p className="font-medium">
                  <span className="mr-1.5 text-xs font-normal text-muted-foreground">
                    Q{index + 1}
                  </span>
                  {result.questionText_en}
                </p>
                {showBurmese && (
                  <p className="mt-1 font-myanmar text-sm text-muted-foreground">
                    {result.questionText_my}
                  </p>
                )}
                {showBurmese && (
                  <div className="mt-1.5">
                    <BurmeseSpeechButton
                      questionId={result.questionId}
                      audioType="q"
                      label="မြန်မာ"
                      className="!py-1 !px-2.5 !text-caption !min-h-[28px]"
                      showSpeedLabel={!!speedLabel}
                      speedLabel={speedLabel}
                    />
                  </div>
                )}
              </ChatBubble>

              {/* User answer bubble (right) with keyword highlights */}
              <ChatBubble sender="user" isCorrect={isCorrect} confidence={result.confidence}>
                {result.transcript &&
                result.matchedKeywords &&
                result.matchedKeywords.length > 0 ? (
                  <KeywordHighlight
                    userAnswer={result.transcript}
                    matchedKeywords={result.matchedKeywords}
                    missingKeywords={result.missingKeywords ?? []}
                    showMissing={false}
                    compact
                  />
                ) : (
                  <p>
                    {result.transcript
                      ? `"${result.transcript}"`
                      : isCorrect
                        ? '[Self-graded: Correct]'
                        : '[Self-graded: Incorrect]'}
                  </p>
                )}
                {result.responseTimeMs !== undefined && (
                  <p className="mt-0.5 text-xs opacity-60">
                    {(result.responseTimeMs / 1000).toFixed(1)}s response time
                  </p>
                )}
              </ChatBubble>

              {/* Incorrect answer: expandable correct answer section (Practice mode only) */}
              {!isCorrect && mode === 'practice' && (
                <div className="ml-12 mr-4">
                  <button
                    type="button"
                    onClick={() => toggleExpand(index)}
                    className={clsx(
                      'flex w-full items-center gap-1.5 rounded-lg px-3 py-2',
                      'text-xs font-medium text-primary',
                      'transition-colors hover:bg-primary/5',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                    )}
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    {isExpanded ? 'Hide correct answer' : 'Show correct answer'}
                    {showBurmese && (
                      <span className="font-myanmar ml-1">
                        {isExpanded ? 'မှန်ကန်တဲ့အဖြေဝှက်ပါ' : 'မှန်ကန်တဲ့အဖြေပြပါ'}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : SPRING_GENTLE}
                        className="overflow-hidden"
                      >
                        <div className="rounded-lg border border-success/30 bg-success-subtle/30 px-3 py-2.5">
                          <p className="text-xs font-semibold text-success">
                            Correct answer:
                            {showBurmese && (
                              <span className="font-myanmar ml-1">မှန်ကန်တဲ့အဖြေ:</span>
                            )}
                          </p>
                          {result.correctAnswers.map((answer, i) => (
                            <p key={i} className="mt-0.5 text-sm text-foreground">
                              {answer.text_en}
                              {showBurmese && (
                                <span className="ml-1 font-myanmar text-sm text-muted-foreground">
                                  ({answer.text_my})
                                </span>
                              )}
                            </p>
                          ))}

                          {/* Matched/missing keywords with bilingual labels */}
                          {result.matchedKeywords && result.matchedKeywords.length > 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium text-success">
                                Matched:
                                {showBurmese && (
                                  <span className="font-myanmar ml-1">ကိုက်ညီသော:</span>
                                )}
                              </span>{' '}
                              {result.matchedKeywords.join(', ')}
                            </p>
                          )}
                          {result.missingKeywords && result.missingKeywords.length > 0 && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              <span className="font-medium text-destructive">
                                Missing:
                                {showBurmese && (
                                  <span className="font-myanmar ml-1">လွတ်နေသော:</span>
                                )}
                              </span>{' '}
                              {result.missingKeywords.join(', ')}
                            </p>
                          )}
                        </div>

                        {/* SRS button for incorrect answers */}
                        <div className="mt-2">
                          <AddToDeckButton questionId={result.questionId} compact />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Early termination marker */}
            {showTerminationMarker && (
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="whitespace-nowrap rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {getTerminationMessage(endReason, index).en}
                  {showBurmese && (
                    <span className="ml-1 font-myanmar">
                      {getTerminationMessage(endReason, index).my}
                    </span>
                  )}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
