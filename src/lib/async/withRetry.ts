/**
 * Generic async retry utility with exponential backoff.
 *
 * Retries failed async operations with configurable attempts and delays.
 * Only retries network/transient errors by default — auth failures (401/400),
 * quota exceeded, and other non-retryable errors throw immediately.
 */

export interface RetryOptions {
  /** Maximum number of attempts (including first try). Default: 3 */
  maxAttempts?: number;
  /** Base delay in ms before first retry. Doubles each attempt. Default: 1000 */
  baseDelayMs?: number;
  /** Called on each retry with the attempt number and error */
  onRetry?: (attempt: number, error: unknown) => void;
  /** Custom function to determine if an error is retryable. Default: isRetryableError */
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Wraps an async function and retries it on failure with exponential backoff.
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration
 * @returns The result of fn() on success
 * @throws The last error if all attempts fail or error is non-retryable
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 1000, onRetry, shouldRetry = isRetryableError } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      onRetry?.(attempt, error);

      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // TypeScript: unreachable but satisfies return type
  throw lastError;
}

/**
 * Determines if an error is retryable (network/transient errors only).
 *
 * Non-retryable: auth failures (401), validation errors (400),
 * quota exceeded (QuotaExceededError).
 *
 * Retryable: network errors, timeouts, connection refused, offline state.
 */
export function isRetryableError(error: unknown): boolean {
  // Offline — always worth retrying when connectivity returns
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;

  // DOMException QuotaExceededError — storage full, retrying won't help
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return false;

  // Check for HTTP status codes on error objects (e.g., Supabase errors)
  if (error instanceof Error) {
    const statusError = error as Error & { status?: number };
    if (statusError.status === 401 || statusError.status === 400) return false;
  }

  // TypeError with "fetch" — network failure
  if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) return true;

  // Network/timeout/connection errors
  if (error instanceof Error && /network|timeout|ECONNREFUSED/i.test(error.message)) return true;

  return false;
}
