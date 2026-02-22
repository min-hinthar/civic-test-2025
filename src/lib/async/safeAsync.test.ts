import { describe, it, expect, vi } from 'vitest';
import { safeAsync } from './safeAsync';

// Mock Sentry's captureError
vi.mock('@/lib/sentry', () => ({
  captureError: vi.fn(),
}));

// Import after mock setup
import { captureError } from '@/lib/sentry';

const mockedCaptureError = vi.mocked(captureError);

describe('safeAsync', () => {
  beforeEach(() => {
    mockedCaptureError.mockClear();
  });

  it('returns [result, null] when fn succeeds', async () => {
    const [result, error] = await safeAsync(() => Promise.resolve('hello'));

    expect(result).toBe('hello');
    expect(error).toBeNull();
  });

  it('returns [null, Error] when fn throws an Error', async () => {
    const err = new Error('something broke');
    const [result, error] = await safeAsync(() => Promise.reject(err));

    expect(result).toBeNull();
    expect(error).toBe(err);
  });

  it('wraps string errors in Error objects', async () => {
    const [result, error] = await safeAsync(() => Promise.reject('string error'));

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('string error');
  });

  it('reports errors to Sentry via captureError', async () => {
    const err = new Error('sentry test');
    await safeAsync(() => Promise.reject(err));

    expect(mockedCaptureError).toHaveBeenCalledTimes(1);
    expect(mockedCaptureError).toHaveBeenCalledWith(err, undefined);
  });

  it('passes context string as operation extra to Sentry', async () => {
    const err = new Error('context test');
    await safeAsync(() => Promise.reject(err), 'loadUserProfile');

    expect(mockedCaptureError).toHaveBeenCalledWith(err, { operation: 'loadUserProfile' });
  });

  it('passes undefined extras when no context provided', async () => {
    const err = new Error('no context');
    await safeAsync(() => Promise.reject(err));

    expect(mockedCaptureError).toHaveBeenCalledWith(err, undefined);
  });

  it('does not call captureError on success', async () => {
    await safeAsync(() => Promise.resolve(42));

    expect(mockedCaptureError).not.toHaveBeenCalled();
  });

  it('handles non-Error thrown values', async () => {
    const [result, error] = await safeAsync(() => Promise.reject(42));

    expect(result).toBeNull();
    expect(error).toBeInstanceOf(Error);
    expect(error?.message).toBe('42');
  });
});
