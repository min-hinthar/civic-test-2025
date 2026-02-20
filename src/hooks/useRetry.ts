'use client';

import { useState, useCallback, useEffect } from 'react';

export interface UseRetryOptions {
  /** Maximum number of automatic silent retries before surfacing error (default: 2) */
  maxSilentRetries?: number;
  /** Maximum number of manual retries before escalation message (default: 3) */
  maxManualRetries?: number;
  /** Delay in ms between silent retry attempts (default: 1000) */
  silentRetryDelay?: number;
}

export interface UseRetryResult<T> {
  /** Fetched data, or null if not yet loaded or errored */
  data: T | null;
  /** Error from most recent failed attempt, or null */
  error: Error | null;
  /** True while fetching (including silent retries) */
  isLoading: boolean;
  /** Trigger a manual retry */
  retry: () => void;
  /** Number of manual retries performed */
  retryCount: number;
  /** True when retryCount >= maxManualRetries (user should check connection) */
  isEscalated: boolean;
}

/**
 * Hook that auto-retries a fetcher function silently before surfacing errors.
 *
 * On mount, calls the fetcher. If it fails, silently retries up to
 * `maxSilentRetries` times with a delay between attempts. After silent
 * retries are exhausted, surfaces the error for UI display.
 *
 * The `retry()` function allows manual retries. After `maxManualRetries`
 * manual attempts, `isEscalated` becomes true to show an escalation message.
 *
 * Uses closure-local cancellation pattern (not useRef) per project conventions.
 *
 * @param fetcher - Async function that returns data
 * @param options - Configuration for retry behavior
 */
export function useRetry<T>(
  fetcher: () => Promise<T>,
  options?: UseRetryOptions
): UseRetryResult<T> {
  const maxSilentRetries = options?.maxSilentRetries ?? 2;
  const maxManualRetries = options?.maxManualRetries ?? 3;
  const silentRetryDelay = options?.silentRetryDelay ?? 1000;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  // Trigger re-fetches by incrementing this counter
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const isEscalated = retryCount >= maxManualRetries;

  // Manual retry function
  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    setFetchTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function attemptFetch(silentAttempt: number): Promise<void> {
      try {
        const result = await fetcher();
        if (!cancelled) {
          setData(result);
          setError(null);
          setIsLoading(false);
        }
      } catch (err) {
        if (cancelled) return;

        // Still have silent retries left
        if (silentAttempt < maxSilentRetries) {
          await new Promise<void>(resolve => {
            const timer = setTimeout(() => resolve(), silentRetryDelay);
            // If cancelled during delay, clean up
            if (cancelled) {
              clearTimeout(timer);
              resolve();
            }
          });
          if (!cancelled) {
            await attemptFetch(silentAttempt + 1);
          }
        } else {
          // All silent retries exhausted — surface error
          if (!cancelled) {
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsLoading(false);
          }
        }
      }
    }

    setIsLoading(true);
    attemptFetch(0);

    return () => {
      cancelled = true;
    };
    // fetchTrigger drives re-execution on manual retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrigger]);

  return { data, error, isLoading, retry, retryCount, isEscalated };
}
