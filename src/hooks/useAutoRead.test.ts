/**
 * useAutoRead Hook Tests
 *
 * Validates trigger/cleanup/retry/delay behavior of the auto-read hook.
 * Mocks useTTS to isolate hook logic from TTS engine internals.
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock useTTS
// ---------------------------------------------------------------------------

const mockSpeak = vi.fn<(text: string, opts?: { lang?: string }) => Promise<void>>();
const mockCancel = vi.fn();

vi.mock('./useTTS', () => ({
  useTTS: () => ({
    speak: mockSpeak,
    cancel: mockCancel,
    isSpeaking: false,
    isPaused: false,
    isSupported: true,
    error: null,
    voices: [],
    refreshVoices: vi.fn(),
    settings: {
      rate: 'normal',
      pitch: 1.02,
      lang: 'en-US',
      autoRead: false,
      autoReadLang: 'both',
    },
    updateSettings: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  }),
}));

import { useAutoRead } from './useAutoRead';

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.useFakeTimers();
  mockSpeak.mockReset();
  mockCancel.mockReset();
  mockSpeak.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useAutoRead', () => {
  it('does not speak when enabled is false', () => {
    renderHook(() => useAutoRead({ text: 'Hello', enabled: false, triggerKey: 0 }));

    // Advance past the default delay (300ms)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('speaks text after delay when enabled', () => {
    renderHook(() => useAutoRead({ text: 'Hello world', enabled: true, triggerKey: 0 }));

    // Before delay: not called
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(mockSpeak).not.toHaveBeenCalled();

    // After delay (default 300ms): called
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(mockSpeak).toHaveBeenCalledWith('Hello world', { lang: undefined });
  });

  it('cancels speech when triggerKey changes', () => {
    const { rerender } = renderHook(
      ({ triggerKey }: { triggerKey: number }) =>
        useAutoRead({ text: 'Question text', enabled: true, triggerKey }),
      { initialProps: { triggerKey: 0 } }
    );

    // Fire the first speak
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    mockCancel.mockClear();

    // Change trigger key -> should cancel and re-trigger
    rerender({ triggerKey: 1 });
    expect(mockCancel).toHaveBeenCalled();

    // After delay, speak called again with same text
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it('cancels speech on unmount', () => {
    const { unmount } = renderHook(() =>
      useAutoRead({ text: 'Goodbye', enabled: true, triggerKey: 0 })
    );

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    mockCancel.mockClear();
    unmount();
    expect(mockCancel).toHaveBeenCalled();
  });

  it('does not speak when text is empty', () => {
    renderHook(() => useAutoRead({ text: '', enabled: true, triggerKey: 0 }));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockSpeak).not.toHaveBeenCalled();
  });

  it('retries once on speak failure', async () => {
    // First call rejects, second resolves
    mockSpeak.mockRejectedValueOnce(new Error('TTS failed')).mockResolvedValueOnce(undefined);

    renderHook(() => useAutoRead({ text: 'Retry me', enabled: true, triggerKey: 0 }));

    // Advance past initial delay (300ms)
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    // First call should have happened
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Advance past retry delay (500ms)
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Second call (retry)
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it('does not retry after unmount', async () => {
    // First call rejects
    mockSpeak.mockRejectedValueOnce(new Error('TTS failed'));

    const { unmount } = renderHook(() =>
      useAutoRead({ text: 'No retry', enabled: true, triggerKey: 0 })
    );

    // Advance past initial delay
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Unmount before retry
    unmount();

    // Advance past retry delay
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Should NOT have retried (cancelled flag prevents it)
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });

  it('uses custom delay when provided', () => {
    renderHook(() =>
      useAutoRead({
        text: 'Custom delay',
        enabled: true,
        triggerKey: 0,
        delay: 1000,
      })
    );

    // At 500ms: should not have spoken yet
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(mockSpeak).not.toHaveBeenCalled();

    // At 1100ms: should have spoken
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(mockSpeak).toHaveBeenCalledWith('Custom delay', { lang: undefined });
  });
});
