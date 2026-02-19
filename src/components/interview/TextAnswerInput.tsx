'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * Detect iOS Safari: Safari + NOT Chrome + iPhone/iPad.
 * Used to show "For voice input, try Chrome" hint.
 */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome/.test(ua) && /iPhone|iPad/.test(ua);
}

interface TextAnswerInputProps {
  /** Called when user taps Send */
  onSubmit: (text: string) => void;
  /** Disables input during grading/transition */
  disabled?: boolean;
  /** Textarea placeholder text */
  placeholder?: string;
  /** Shows "For voice input, try Chrome" notice (auto-detected from iOS Safari) */
  showIOSSafariHint?: boolean;
  /** Shows what was previously heard (for re-record context) */
  previousTranscription?: string;
}

/**
 * Text input fallback for interview sessions when speech recognition
 * is unavailable (Firefox, Safari iOS, or after speech errors).
 *
 * Features:
 * - Multi-line textarea with Send button
 * - NO Enter key submit (textarea accepts multiline text naturally)
 * - iOS Safari hint for voice input suggestion
 * - Previous transcription display for re-record context
 * - Dark interview aesthetic matching ChatBubble styling
 * - WCAG touch target (min-h-[44px]) on Send button
 */
export function TextAnswerInput({
  onSubmit,
  disabled = false,
  placeholder = 'Type your answer...',
  showIOSSafariHint,
  previousTranscription,
}: TextAnswerInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-detect iOS Safari if not explicitly set
  const showHint = showIOSSafariHint ?? isIOSSafari();

  // Auto-focus textarea when mounted
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.focus({ preventScroll: true });
    }
  }, []);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText('');
  };

  const canSubmit = text.trim().length > 0 && !disabled;

  return (
    <div className="space-y-2">
      {/* iOS Safari hint */}
      {showHint && (
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5">
          <span className="text-[11px] text-white/40">For voice input, try Chrome</span>
        </div>
      )}

      {/* Previous transcription */}
      {previousTranscription && (
        <p className="text-xs text-white/30 px-1">
          Previously heard: <span className="italic text-white/50">{previousTranscription}</span>
        </p>
      )}

      {/* Textarea + Send button */}
      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className={clsx(
            'flex-1 resize-none rounded-xl border border-slate-600 bg-slate-800 px-3 py-2',
            'text-sm text-white placeholder:text-slate-400',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label="Send answer"
          className={clsx(
            'flex items-center justify-center self-end rounded-xl px-3',
            'min-h-[44px] min-w-[44px]',
            canSubmit
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
          )}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
