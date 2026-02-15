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
    my: '\u101E\u1031\u1001\u103B\u102C\u1015\u102B\u101E\u101C\u102C\u1038? \u101E\u1004\u1037\u103A\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F \u1006\u102F\u1036\u1038\u101B\u103E\u102F\u1036\u1038\u1015\u102B\u1019\u100A\u103A\u104B',
  },
  discard: {
    en: 'Discard',
    my: '\u1016\u103B\u1000\u103A\u1019\u100A\u103A',
  },
  cancel: {
    en: 'Cancel',
    my: '\u1019\u101C\u102F\u1015\u103A\u1015\u102B',
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
          {showBurmese ? TEXT.cancel.my : TEXT.cancel.en}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground transition-colors hover:bg-destructive-hover"
        >
          {showBurmese ? TEXT.discard.my : TEXT.discard.en}
        </button>
      </div>
    </motion.div>
  );
}
