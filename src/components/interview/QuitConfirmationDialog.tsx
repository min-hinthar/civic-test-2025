'use client';

import { clsx } from 'clsx';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { strings } from '@/lib/i18n/strings';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface QuitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onQuit: () => void;
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuitConfirmationDialog({
  open,
  onOpenChange,
  onCancel,
  onQuit,
  showBurmese,
}: QuitConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>
          {strings.interview.confirmEndTitle.en}
          {showBurmese && (
            <span className="mt-0.5 block font-myanmar text-base font-normal text-muted-foreground">
              {strings.interview.confirmEndTitle.my}
            </span>
          )}
        </DialogTitle>
        <DialogDescription>
          {strings.interview.confirmEndMessage.en}
          {showBurmese && (
            <span className="mt-0.5 block font-myanmar text-sm">
              {strings.interview.confirmEndMessage.my}
            </span>
          )}
        </DialogDescription>
        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            className={clsx(
              'rounded-xl px-4 py-2 text-sm font-semibold',
              'border border-border text-foreground',
              'transition-colors hover:bg-muted/40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            {strings.interview.cancel.en}
          </button>
          <button
            type="button"
            onClick={onQuit}
            className={clsx(
              'rounded-xl px-4 py-2 text-sm font-semibold',
              'bg-warning text-white',
              'transition-colors hover:bg-warning-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning'
            )}
          >
            {strings.interview.confirm.en}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
