'use client';

import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { SPRING_GENTLE } from '@/lib/motion-config';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ChatBubbleProps {
  /** Who sent this message */
  sender: 'examiner' | 'user';
  /** Message content */
  children: React.ReactNode;
  /** Whether the answer was correct (for results transcript coloring) */
  isCorrect?: boolean;
  /** Match quality 0-1 (shows confidence badge) */
  confidence?: number;
  /** Avatar element (examiner avatar or user initials) */
  avatar?: React.ReactNode;
  /** Optional timestamp */
  timestamp?: string;
}

/**
 * Chat message bubble with sender-based alignment.
 *
 * - Examiner messages: left-aligned, muted background, rounded-tl-sm
 * - User answers: right-aligned, primary background, rounded-tr-sm
 * - In results: color border green/red based on isCorrect + Check/X icon
 * - Confidence badge when confidence prop provided
 * - Motion entrance with SPRING_GENTLE
 * - max-w-[80%] for visual breathing room
 */
export function ChatBubble({
  sender,
  children,
  isCorrect,
  confidence,
  avatar,
  timestamp,
}: ChatBubbleProps) {
  const shouldReduceMotion = useReducedMotion();
  const isExaminer = sender === 'examiner';

  // Border color for results view
  const resultBorderClass =
    isCorrect === true
      ? 'border-2 border-success'
      : isCorrect === false
        ? 'border-2 border-destructive'
        : '';

  const bubbleClasses = isExaminer
    ? `rounded-2xl rounded-tl-sm bg-muted/40 text-foreground ${resultBorderClass}`
    : `rounded-2xl rounded-tr-sm bg-primary text-primary-foreground ${resultBorderClass}`;

  const motionProps = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 8, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: SPRING_GENTLE,
      };

  return (
    <motion.div
      className={`flex items-end gap-2 ${isExaminer ? 'justify-start' : 'flex-row-reverse justify-start'}`}
      {...motionProps}
    >
      {/* Avatar slot */}
      {avatar && <div className="mb-1 flex-shrink-0">{avatar}</div>}

      {/* Bubble content */}
      <div className="max-w-[80%]">
        <div className={`relative px-4 py-2.5 ${bubbleClasses}`}>
          {/* Result icon */}
          {isCorrect !== undefined && (
            <span
              className={`absolute -top-2 ${isExaminer ? '-right-2' : '-left-2'} flex h-5 w-5 items-center justify-center rounded-full ${
                isCorrect
                  ? 'bg-success text-success-foreground'
                  : 'bg-destructive text-destructive-foreground'
              }`}
            >
              {isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
          )}

          {/* Message text */}
          <div className="text-sm leading-relaxed">{children}</div>

          {/* Confidence badge */}
          {confidence !== undefined && confidence > 0 && (
            <div
              className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                isExaminer ? 'bg-primary/10 text-primary' : 'bg-white/20 text-primary-foreground'
              }`}
            >
              {Math.round(confidence * 100)}% match
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <p
            className={`mt-0.5 text-caption text-muted-foreground ${isExaminer ? 'text-left' : 'text-right'}`}
          >
            {timestamp}
          </p>
        )}
      </div>
    </motion.div>
  );
}
