'use client';

import { motion } from 'motion/react';
import { Check, RotateCcw, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface TranscriptionReviewProps {
  /** Recognized transcript text */
  transcript: string;
  /** Current attempt number (1, 2, or 3) */
  attemptNumber: number;
  /** Maximum allowed attempts */
  maxAttempts: number;
  /** User accepts transcript */
  onConfirm: () => void;
  /** User wants to re-record */
  onReRecord: () => void;
  /** Show loading state while grading */
  isGrading?: boolean;
}

/**
 * Transcription review card shown after speech recognition.
 *
 * Displays the recognized text and lets the user confirm or re-record
 * (up to maxAttempts). On the final attempt, only confirm is available.
 * Empty transcripts show a "no speech detected" message with re-record only.
 *
 * Animated entrance with SPRING_GENTLE.
 */
export function TranscriptionReview({
  transcript,
  attemptNumber,
  maxAttempts,
  onConfirm,
  onReRecord,
  isGrading = false,
}: TranscriptionReviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const isEmpty = !transcript.trim();
  const isLastAttempt = attemptNumber >= maxAttempts;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : SPRING_GENTLE}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
    >
      {/* Attempt counter */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Your answer</span>
        <span className="text-xs text-muted-foreground">
          Attempt {attemptNumber} of {maxAttempts}
        </span>
      </div>

      {/* Transcript display */}
      {isEmpty ? (
        <div className="flex items-center gap-2 rounded-xl bg-warning-subtle/30 px-3 py-2.5">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-warning" />
          <p className="text-sm text-foreground">No speech detected. Try speaking more clearly.</p>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/20 px-3 py-2.5">
          <p className="text-sm leading-relaxed text-foreground">&ldquo;{transcript}&rdquo;</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {/* Re-record button: shown when not last attempt and not grading */}
        {!isLastAttempt && !isGrading && (
          <button
            type="button"
            onClick={onReRecord}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5',
              'border border-border/60 text-sm font-medium text-muted-foreground',
              'transition-colors hover:bg-muted/40 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'min-h-[44px]'
            )}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Re-record</span>
          </button>
        )}

        {/* Confirm button: shown when transcript is not empty */}
        {!isEmpty && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={isGrading}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5',
              'bg-primary text-sm font-semibold text-white',
              'transition-colors hover:bg-primary/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
              'min-h-[44px]',
              isGrading && 'opacity-70 cursor-wait'
            )}
          >
            {isGrading ? (
              <span>Grading...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Confirm</span>
              </>
            )}
          </button>
        )}

        {/* When empty and last attempt, show confirm as "Skip" */}
        {isEmpty && isLastAttempt && (
          <button
            type="button"
            onClick={onConfirm}
            className={clsx(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5',
              'border border-border/60 text-sm font-medium text-muted-foreground',
              'transition-colors hover:bg-muted/40 hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              'min-h-[44px]'
            )}
          >
            <span>Skip question</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
