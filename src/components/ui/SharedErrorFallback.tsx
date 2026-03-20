'use client';

import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import type { BilingualMessage } from '@/lib/errorSanitizer';

/**
 * Props for the SharedErrorFallback component.
 */
export interface SharedErrorFallbackProps {
  /** Sanitized bilingual error message */
  message: BilingualMessage;
  /** Whether to show Burmese text */
  showBurmese: boolean;
  /** Handler for "Try again" button (renders button when provided) */
  onRetry?: () => void;
  /** Handler for "Return home" button (renders button when provided) */
  onGoHome?: () => void;
}

/**
 * Shared presentational error fallback component.
 * Used by ErrorBoundary (class component) and error.tsx (functional).
 *
 * Design: warm amber icon, bilingual messages, 44px touch targets.
 * Never displays raw error.message -- always receives sanitized BilingualMessage.
 */
export function SharedErrorFallback({
  message,
  showBurmese,
  onRetry,
  onGoHome,
}: SharedErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-muted/30 p-8 text-center">
        {/* Icon - friendly amber, not alarming red */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-8 w-8 text-warning" />
        </div>

        {/* English message */}
        <h2 className="mb-2 text-xl font-semibold text-foreground">{message.en}</h2>

        {/* Burmese message */}
        {showBurmese && <p className="mb-8 text-lg text-foreground font-myanmar">{message.my}</p>}

        {/* Action buttons */}
        {(onRetry || onGoHome) && (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Try again</span>
              </button>
            )}
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Home className="h-5 w-5" />
                <span>Return home</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
