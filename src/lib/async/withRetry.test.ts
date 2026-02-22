import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry, isRetryableError } from './withRetry';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns result immediately when fn succeeds first try', async () => {
    const fn = vi.fn().mockResolvedValue('success');

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries after baseDelayMs when fn fails once then succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('success');

    const promise = withRetry(fn, { baseDelayMs: 1000 });
    // Advance past the first delay (1000ms)
    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws the last error after all attempts exhausted', async () => {
    const error = new TypeError('Failed to fetch');
    const fn = vi.fn().mockRejectedValue(error);

    let caughtError: unknown;
    const promise = withRetry(fn, { maxAttempts: 3, baseDelayMs: 100 }).catch(e => {
      caughtError = e;
    });

    // Advance timers for all retry delays (100ms + 200ms = 300ms total)
    await vi.advanceTimersByTimeAsync(300);
    await promise;

    expect(caughtError).toBe(error);
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('retries on TypeError("Failed to fetch") as network error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { baseDelayMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry on 401 auth error', async () => {
    const error = new Error('Unauthorized');
    Object.assign(error, { status: 401 });

    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxAttempts: 3 })).rejects.toThrow('Unauthorized');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry on DOMException QuotaExceededError', async () => {
    const error = new DOMException('Quota exceeded', 'QuotaExceededError');

    const fn = vi.fn().mockRejectedValue(error);

    await expect(withRetry(fn, { maxAttempts: 3 })).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries when navigator.onLine is false', async () => {
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockImplementation(() => {
        // Restore online status before resolving
        Object.defineProperty(navigator, 'onLine', {
          value: originalOnLine,
          writable: true,
        });
        return Promise.resolve('recovered');
      });

    const promise = withRetry(fn, { baseDelayMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    const result = await promise;

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);

    // Cleanup
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, writable: true });
  });

  it('respects custom shouldRetry returning false', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('custom error'));

    await expect(
      withRetry(fn, {
        maxAttempts: 3,
        shouldRetry: () => false,
      })
    ).rejects.toThrow('custom error');

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls onRetry callback with attempt and error on each retry', async () => {
    const onRetry = vi.fn();
    const error = new TypeError('Failed to fetch');
    const fn = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValue('ok');

    const promise = withRetry(fn, { maxAttempts: 3, baseDelayMs: 100, onRetry });
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    await promise;

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1, error);
    expect(onRetry).toHaveBeenCalledWith(2, error);
  });

  it('uses exponential backoff: delays double each attempt', async () => {
    const fn = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    // Spy on setTimeout to verify delay values
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    let caughtError: unknown;
    const promise = withRetry(fn, { maxAttempts: 4, baseDelayMs: 1000 }).catch(e => {
      caughtError = e;
    });

    // Advance past all delays: 1000 + 2000 + 4000 = 7000ms total
    await vi.advanceTimersByTimeAsync(7000);
    await promise;

    expect(caughtError).toBeInstanceOf(TypeError);
    expect(fn).toHaveBeenCalledTimes(4);

    // Extract the delay values passed to setTimeout by withRetry
    const retryDelays = setTimeoutSpy.mock.calls
      .map(call => call[1])
      .filter((delay): delay is number => typeof delay === 'number' && delay >= 1000);

    expect(retryDelays).toEqual([1000, 2000, 4000]);

    setTimeoutSpy.mockRestore();
  });
});

describe('isRetryableError', () => {
  it('returns true for TypeError with "fetch" in message', () => {
    expect(isRetryableError(new TypeError('Failed to fetch'))).toBe(true);
  });

  it('returns true for network/timeout errors', () => {
    expect(isRetryableError(new Error('network error'))).toBe(true);
    expect(isRetryableError(new Error('Request timeout'))).toBe(true);
    expect(isRetryableError(new Error('ECONNREFUSED'))).toBe(true);
  });

  it('returns false for DOMException QuotaExceededError', () => {
    expect(isRetryableError(new DOMException('Quota exceeded', 'QuotaExceededError'))).toBe(false);
  });

  it('returns false for generic errors when online', () => {
    expect(isRetryableError(new Error('Something went wrong'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isRetryableError('string error')).toBe(false);
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });

  it('returns true when navigator.onLine is false', () => {
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

    expect(isRetryableError(new Error('anything'))).toBe(true);

    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, writable: true });
  });

  it('returns false for auth errors (status 401)', () => {
    const error = new Error('Unauthorized');
    Object.assign(error, { status: 401 });
    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for validation errors (status 400)', () => {
    const error = new Error('Bad request');
    Object.assign(error, { status: 400 });
    expect(isRetryableError(error)).toBe(false);
  });
});
