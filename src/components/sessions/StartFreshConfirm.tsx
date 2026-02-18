'use client';

/**
 * StartFreshConfirm - Inline confirmation when "Start Fresh" is clicked.
 *
 * Replaces the action buttons in ResumePromptModal with a warning message
 * and Discard/Cancel buttons. Uses AnimatePresence for crossfade transition.
 * Bilingual text follows language mode.
 */

import { AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

import { useLanguage } from '@/contexts/LanguageContext';

// ---------------------------------------------------------------------------
// Bilingual strings
// ---------------------------------------------------------------------------

const TEXT = {
  message: {
    en: 'Are you sure? Your progress will be lost.',
    my: 'သေချာပါသလား? တိုးတက်မှုတွေ ဆုံးရှုံးပါမယ်။',
  },
  discard: {
    en: 'Discard',
    my: 'ဖျက်မယ်',
  },
  cancel: {
    en: 'Cancel',
    my: 'မလုပ်ပါ',
  },
} as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StartFreshConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function StartFreshConfirm({ onConfirm, onCancel }: StartFreshConfirmProps) {
  const { showBurmese } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center gap-3 py-2"
    >
      {/* Warning icon */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-subtle">
        <AlertTriangle className="h-5 w-5 text-warning" />
      </div>

      {/* Warning message */}
      <p className="text-center text-sm text-foreground">{TEXT.message.en}</p>
      {showBurmese && (
        <p className="-mt-2 text-center font-myanmar text-xs text-muted-foreground">
          {TEXT.message.my}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <span className={showBurmese ? 'font-myanmar' : ''}>
            {showBurmese ? TEXT.cancel.my : TEXT.cancel.en}
          </span>
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground transition-colors hover:bg-destructive-hover"
        >
          <span className={showBurmese ? 'font-myanmar' : ''}>
            {showBurmese ? TEXT.discard.my : TEXT.discard.en}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
