'use client';

import { motion, AnimatePresence } from 'motion/react';
import { ChatBubble } from '@/components/interview/ChatBubble';
import { TypingIndicator } from '@/components/interview/TypingIndicator';
import { TranscriptionReview } from '@/components/interview/TranscriptionReview';
import { SelfGradeButtons } from '@/components/interview/SelfGradeButtons';
import { TTSFallbackBadge } from '@/components/interview/TTSFallbackBadge';
import { KeywordHighlight } from '@/components/interview/KeywordHighlight';
import { BurmeseSpeechButton } from '@/components/ui/BurmeseSpeechButton';
import { MAX_RECORD_ATTEMPTS, type QuestionPhase, type ChatMessage } from '@/lib/interview/interviewStateMachine';
import { strings } from '@/lib/i18n/strings';
import type { GradeResult } from '@/lib/interview/answerGrader';
import type { InterviewMode } from '@/types';

interface InterviewChatAreaProps {
  chatMessages: ChatMessage[];
  questionPhase: QuestionPhase;
  mode: InterviewMode;
  showBurmese: boolean;
  usingTTSFallback: boolean;
  effectiveSpeed: 'slow' | 'normal' | 'fast';
  showTranscriptionReview: boolean;
  previousTranscription: string;
  recordAttempt: number;
  onTranscriptConfirm: () => void;
  onReRecord: () => void;
  showSelfGradeButtons: boolean;
  onSelfGrade: (grade: 'correct' | 'incorrect') => void;
  lastGradeResult: GradeResult | null;
  lastTranscript: string;
  isTransition: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  shouldReduceMotion: boolean;
}

const BUBBLE_INITIAL = { opacity: 0, y: 8, scale: 0.95 };
const BUBBLE_ANIMATE = { opacity: 1, y: 0, scale: 1 };
const BUBBLE_TRANSITION = { type: 'spring' as const, stiffness: 200, damping: 20 };

export function InterviewChatArea({
  chatMessages, questionPhase, mode, showBurmese, usingTTSFallback,
  effectiveSpeed, showTranscriptionReview, previousTranscription, recordAttempt,
  onTranscriptConfirm, onReRecord, showSelfGradeButtons, onSelfGrade,
  lastGradeResult, lastTranscript, isTransition, chatEndRef, shouldReduceMotion,
}: InterviewChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-3 min-h-0">
      <AnimatePresence>
        {chatMessages.map(msg => {
          const Wrapper = shouldReduceMotion ? 'div' : motion.div;
          const motionProps = shouldReduceMotion ? {} : { initial: BUBBLE_INITIAL, animate: BUBBLE_ANIMATE, transition: BUBBLE_TRANSITION };
          return (
            <Wrapper key={msg.id} {...motionProps}>
              <ChatBubble sender={msg.sender} isCorrect={msg.isCorrect} confidence={msg.confidence}>
                {msg.text}
              </ChatBubble>
              {msg.sender === 'examiner' && msg.questionId && usingTTSFallback && (
                <div className="mt-0.5 ml-10"><TTSFallbackBadge visible compact /></div>
              )}
              {msg.questionId && msg.sender === 'examiner' && showBurmese && mode === 'practice' && (
                <div className="mt-1 ml-10">
                  <BurmeseSpeechButton
                    questionId={msg.questionId} audioType="q" label="မြန်မာ"
                    className="!py-1 !px-2.5 !text-caption !min-h-[44px]"
                    showSpeedLabel speedLabel={effectiveSpeed === 'normal' ? undefined : effectiveSpeed}
                  />
                </div>
              )}
              {msg.gradeResult && mode === 'practice' && msg.sender === 'examiner' && lastTranscript && (
                <div className="mt-2 ml-10 mr-4">
                  <KeywordHighlight
                    userAnswer={lastTranscript}
                    matchedKeywords={msg.gradeResult.matchedKeywords}
                    missingKeywords={msg.gradeResult.missingKeywords}
                    compact
                  />
                </div>
              )}
            </Wrapper>
          );
        })}
      </AnimatePresence>

      {questionPhase === 'typing' && <TypingIndicator />}

      {showTranscriptionReview && (
        <TranscriptionReview
          transcript={previousTranscription} attemptNumber={recordAttempt}
          maxAttempts={MAX_RECORD_ATTEMPTS} onConfirm={onTranscriptConfirm} onReRecord={onReRecord}
        />
      )}

      {showSelfGradeButtons && (
        <div className="py-2">
          <p className="mb-2 text-center text-xs text-white/50">
            Did you answer correctly?
            {showBurmese && (
              <span className="block font-myanmar mt-0.5">မှန်ကန်စွာ ဖြေဆိုနိုင်ခဲ့ပါသလား?</span>
            )}
          </p>
          <SelfGradeButtons onGrade={onSelfGrade} />
        </div>
      )}

      {isTransition && (
        <div className="flex items-center justify-center py-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="text-xs text-white/40">
            {strings.interview.nextQuestion.en}
          </motion.div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}
