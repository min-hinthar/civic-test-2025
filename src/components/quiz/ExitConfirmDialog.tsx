'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExitConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  mode: 'mock-test' | 'practice' | 'interview' | 'sort';
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Bilingual labels per mode
// ---------------------------------------------------------------------------

const titles: Record<ExitConfirmDialogProps['mode'], { en: string; my: string }> = {
  'mock-test': {
    en: 'Exit Quiz?',
    my: '\u1005\u102C\u1019\u1031\u1038\u1015\u103D\u1032\u1019\u103E\u1011\u103D\u1000\u103A\u1019\u101C\u102C\u1038',
  },
  practice: {
    en: 'Exit Practice?',
    my: '\u101C\u1031\u1037\u1000\u103B\u1004\u1037\u103A\u1019\u103E\u1011\u103D\u1000\u103A\u1019\u101C\u102C\u1038',
  },
  interview: {
    en: 'Exit Interview?',
    my: '\u1021\u1004\u103A\u1010\u102C\u1017\u103B\u1030\u1038\u1019\u103E\u1011\u103D\u1000\u103A\u1019\u101C\u102C\u1038',
  },
  sort: {
    en: 'Exit Sort?',
    my: '\u1021\u1019\u103B\u102D\u102F\u1038\u1021\u1005\u102C\u1038\u1001\u103D\u1032\u1019\u103E\u1011\u103D\u1000\u103A\u1019\u101C\u102C\u1038',
  },
};

const message = {
  en: 'Your progress is saved. You can resume this session later.',
  my: '\u101E\u1004\u103A\u1037\u1010\u102D\u102F\u1038\u1010\u1000\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u101E\u102D\u1019\u103A\u1038\u1006\u100A\u103A\u1038\u1011\u102C\u1038\u1015\u102B\u1010\u101A\u103A\u104B \u1014\u1031\u102C\u1000\u103A\u1019\u103E \u1015\u103C\u1014\u103A\u101C\u100A\u103A\u1006\u1000\u103A\u101C\u1000\u103A\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u1010\u101A\u103A\u104B',
};

const keepGoing = {
  en: 'Keep Going',
  my: '\u1006\u1000\u103A\u101C\u1000\u103A\u1015\u102B',
};
const exitLabel = {
  en: 'Exit',
  my: '\u1011\u103D\u1000\u103A\u101B\u1014\u103A',
};

// ---------------------------------------------------------------------------
// ExitConfirmDialog
// ---------------------------------------------------------------------------

/**
 * Radix Dialog exit confirmation for quiz mid-session exit.
 *
 * Features:
 * - Focus trap and Escape key handling via Radix primitives
 * - Portal rendering above all content
 * - Two buttons: Keep Going (secondary) and Exit (warning primary)
 * - Bilingual content when showBurmese is true
 * - Session save messaging to reassure users
 */
export function ExitConfirmDialog({
  open,
  onClose,
  onConfirmExit,
  mode,
  showBurmese,
}: ExitConfirmDialogProps) {
  const title = titles[mode];

  return (
    <Dialog.Root open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={clsx(
            'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-border bg-card p-6 shadow-xl',
            'focus:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          {/* Close button */}
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {/* Title */}
          <Dialog.Title className="text-xl font-bold text-foreground">{title.en}</Dialog.Title>
          {showBurmese && (
            <p className="mt-0.5 font-myanmar text-base text-muted-foreground">{title.my}</p>
          )}

          {/* Message */}
          <Dialog.Description className="mt-3 text-sm text-muted-foreground leading-relaxed">
            {message.en}
          </Dialog.Description>
          {showBurmese && (
            <p className="mt-1 font-myanmar text-sm text-muted-foreground leading-relaxed">
              {message.my}
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            {/* Keep Going (secondary) */}
            <button
              onClick={onClose}
              className={clsx(
                'flex-1 rounded-xl px-4 py-3 text-sm font-semibold',
                'border-2 border-border bg-transparent text-foreground',
                'shadow-[0_3px_0_hsl(var(--border))]',
                'active:shadow-[0_1px_0_hsl(var(--border))] active:translate-y-[2px]',
                'hover:bg-muted/30 transition-all duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
              )}
            >
              <span className="block">{keepGoing.en}</span>
              {showBurmese && (
                <span className="block font-myanmar text-xs text-muted-foreground">
                  {keepGoing.my}
                </span>
              )}
            </button>

            {/* Exit (warning primary) */}
            <button
              onClick={onConfirmExit}
              className={clsx(
                'flex-1 rounded-xl px-4 py-3 text-sm font-semibold',
                'bg-warning text-white',
                'shadow-[0_3px_0_hsl(var(--warning-700,30_80%_35%))]',
                'active:shadow-[0_1px_0_hsl(var(--warning-700,30_80%_35%))] active:translate-y-[2px]',
                'hover:bg-warning/90 transition-all duration-100',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-offset-2'
              )}
            >
              <span className="block">{exitLabel.en}</span>
              {showBurmese && (
                <span className="block font-myanmar text-xs opacity-90">{exitLabel.my}</span>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
