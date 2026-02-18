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
    my: 'စာမေးပွဲမှထွက်မလား?',
  },
  practice: {
    en: 'Exit Practice?',
    my: 'လေ့ကျင့်မှုမှထွက်မလား?',
  },
  interview: {
    en: 'Exit Interview?',
    my: 'အင်တာဗျူးမှထွက်မလား?',
  },
  sort: {
    en: 'Exit Sort?',
    my: 'အမျိုးအစားခွဲမှထွက်မလား?',
  },
};

const message = {
  en: 'Your progress is saved. You can resume this session later.',
  my: 'သင့်တိုးတက်မှုကို သိမ်းဆည်းထားပါတယ်။ နောက်မှ ပြန်လည်ဆက်လုပ်နိုင်ပါတယ်။',
};

const keepGoing = {
  en: 'Keep Going',
  my: 'ဆက်လက်ပါ',
};
const exitLabel = {
  en: 'Exit',
  my: 'ထွက်ရန်',
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
            <p className="mt-0.5 font-myanmar text-xl text-muted-foreground">{title.my}</p>
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
                <span className="block font-myanmar text-sm text-muted-foreground">
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
                <span className="block font-myanmar text-sm text-white/80">{exitLabel.my}</span>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
