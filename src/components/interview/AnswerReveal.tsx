'use client';

import { useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { clsx } from 'clsx';
import { Card } from '@/components/ui/Card';
import { BilingualText } from '@/components/bilingual/BilingualText';
import { WhyButton } from '@/components/explanations/WhyButton';
import { AddToDeckButton } from '@/components/srs/AddToDeckButton';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { allQuestions } from '@/constants/questions';
import type { Question, InterviewMode } from '@/types';

interface AnswerRevealProps {
  /** The question being revealed */
  question: Question;
  /** URL of the user's audio recording (null if no recording) */
  audioURL: string | null;
  /** Current interview mode */
  mode: InterviewMode;
}

/**
 * Answer reveal card showing correct answers after the user responds.
 *
 * Features:
 * - Primary answer prominently displayed
 * - "Also accepted" section for multiple correct answers
 * - Play recording button if audioURL available
 * - WhyButton and AddToDeckButton in practice mode
 * - Bilingual text throughout
 */
export function AnswerReveal({ question, audioURL, mode }: AnswerRevealProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const primaryAnswer = question.studyAnswers[0];
  const alternativeAnswers = question.studyAnswers.slice(1);

  const handlePlayRecording = useCallback(() => {
    if (!audioURL) return;

    // Stop previous playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioURL);
    audioRef.current = audio;
    audio.play().catch(() => {
      // Silently ignore playback errors
    });
  }, [audioURL]);

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
    >
      <Card className="space-y-4">
        {/* Primary correct answer */}
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">
            {strings.interview.correct.en}
          </div>
          <p className="text-lg font-semibold text-foreground">{primaryAnswer.text_en}</p>
          {showBurmese && (
            <p className="mt-0.5 font-myanmar text-sm text-muted-foreground">
              {primaryAnswer.text_my}
            </p>
          )}
        </div>

        {/* Alternative accepted answers */}
        {alternativeAnswers.length > 0 && (
          <div>
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">
              <BilingualText text={strings.interview.alsoAccepted} size="xs" />
            </div>
            <ul className="space-y-1.5">
              {alternativeAnswers.map((answer, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>
                    <span className="text-foreground">{answer.text_en}</span>
                    {showBurmese && (
                      <span className="ml-1 font-myanmar text-muted-foreground">
                        · {answer.text_my}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Play recording */}
        {audioURL && (
          <button
            type="button"
            onClick={handlePlayRecording}
            className={clsx(
              'flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2',
              'text-sm text-muted-foreground',
              'transition-colors hover:bg-muted/40 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            <Play className="h-4 w-4" />
            <BilingualText text={strings.interview.yourAnswer} size="xs" />
          </button>
        )}

        {/* Practice mode extras: WhyButton + AddToDeck */}
        {mode === 'practice' && (
          <div className="flex flex-col gap-3 border-t border-border/40 pt-3">
            {question.explanation && (
              <WhyButton explanation={question.explanation} compact allQuestions={allQuestions} />
            )}
            <div className="flex justify-end">
              <AddToDeckButton questionId={question.id} compact stopPropagation />
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
