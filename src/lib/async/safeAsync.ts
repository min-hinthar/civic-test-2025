/**
 * Safe async wrapper that catches errors, reports to Sentry, and returns result tuples.
 *
 * Use for fire-and-forget async operations where failure should not crash the app.
 * Errors are normalized to Error objects and reported via captureError with optional context.
 */

import { captureError } from '@/lib/sentry';

/** Success or failure result tuple — no exceptions thrown to caller */
export type SafeResult<T> = [T, null] | [null, Error];

/**
 * Wraps an async function, catches all errors, reports to Sentry, and returns a result tuple.
 *
 * @param fn - Async function to execute
 * @param context - Optional operation name for Sentry context (e.g., 'loadUserProfile')
 * @returns [result, null] on success, [null, Error] on failure
 */
export async function safeAsync<T>(fn: () => Promise<T>, context?: string): Promise<SafeResult<T>> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    captureError(err, context ? { operation: context } : undefined);
    return [null, err];
  }
}
