'use client';

import { type ReactNode } from 'react';
import { CloudOff, RefreshCw, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/Button';

export interface ErrorFallbackProps {
  /** Error icon (default: CloudOff) */
  icon?: LucideIcon;
  /** Bilingual error message (defaults to friendly generic message) */
  message?: { en: string; my: string };
  /** Retry handler */
  onRetry: () => void;
  /** Number of manual retries performed (for escalation display) */
  retryCount?: number;
  /** Whether to show escalated message (after multiple retries) */
  isEscalated?: boolean;
  /** Optional stale/cached content to render below the error */
  fallbackContent?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_MESSAGE = {
  en: "Hmm, something went wrong loading your data. Let's try again!",
  my: '\u101F\u1019\u103A\u1038\u1014\u1032\u1037\u1014\u1032\u1037 \u1019\u103E\u102C\u1038\u101E\u103D\u102C\u1038\u1015\u102B\u1010\u101A\u103A\u104B \u1011\u1015\u103A\u1005\u1019\u103A\u1038\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1000\u103C\u100A\u1037\u103A\u1015\u102B\u104B',
};

const ESCALATED_MESSAGE = {
  en: 'Still having trouble? Check your connection or try again later.',
  my: '\u1015\u103C\u103E\u102C\u1014\u102C\u101B\u103E\u102D\u1014\u1031\u1015\u102B\u101E\u1031\u1038\u101C\u102C\u1038\u104B \u1021\u1004\u103A\u1010\u102C\u1014\u1000\u103A\u1001\u103E\u1000\u103A\u1019\u103E\u102F\u1000\u102D\u102F \u1005\u1005\u103A\u1006\u1031\u1038\u1015\u102B\u104B',
};

const STALE_BANNER_EN = 'Showing cached data';
const STALE_BANNER_MY =
  '\u101E\u102D\u1019\u103A\u1038\u1011\u102C\u1038\u1019\u103E\u102F\u1000\u102D\u102F \u1015\u103C\u101E\u1014\u102D\u102F\u1004\u103A\u1015\u102B\u101E\u100A\u103A\u104B';
const RETRY_LABEL_EN = 'Try Again';
const RETRY_LABEL_MY =
  '\u1011\u1015\u103A\u1005\u1019\u103A\u1038\u1000\u103C\u102D\u102F\u1038\u1005\u102C\u1038\u1015\u102B';

/**
 * Inline error recovery component with friendly bilingual messaging.
 *
 * Features:
 * - Cloud-offline icon (non-alarming, suggests connectivity)
 * - Friendly bilingual error messages (English + Burmese)
 * - Escalation: message changes after multiple retry attempts
 * - Retry button with refresh icon
 * - Optional stale/cached data display with subtle banner
 * - Uses app palette muted colors (no red/amber)
 */
export function ErrorFallback({
  icon: Icon = CloudOff,
  message,
  onRetry,
  retryCount: _retryCount,
  isEscalated = false,
  fallbackContent,
  className,
}: ErrorFallbackProps) {
  const { showBurmese } = useLanguage();

  const currentMessage = isEscalated ? ESCALATED_MESSAGE : (message ?? DEFAULT_MESSAGE);

  return (
    <div className={clsx('flex flex-col items-center text-center', className)}>
      {/* Error card */}
      <div className="flex flex-col items-center rounded-2xl bg-muted/30 p-8">
        {/* Icon */}
        <Icon className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />

        {/* Message */}
        <div className="mt-4 max-w-sm">
          <p className="text-foreground">{currentMessage.en}</p>
          {showBurmese && (
            <p className="mt-1 text-sm text-muted-foreground font-myanmar">{currentMessage.my}</p>
          )}
        </div>

        {/* Retry button */}
        <div className="mt-6">
          <Button variant="outline" size="md" onClick={onRetry}>
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>{RETRY_LABEL_EN}</span>
              {showBurmese && (
                <span className="text-sm font-myanmar opacity-80">{RETRY_LABEL_MY}</span>
              )}
            </span>
          </Button>
        </div>
      </div>

      {/* Stale/cached data fallback */}
      {fallbackContent && (
        <div className="mt-6 w-full">
          {/* Subtle stale data banner */}
          <button
            onClick={onRetry}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-muted/20 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{STALE_BANNER_EN}</span>
            {showBurmese && <span className="font-myanmar">{STALE_BANNER_MY}</span>}
          </button>
          {fallbackContent}
        </div>
      )}
    </div>
  );
}
