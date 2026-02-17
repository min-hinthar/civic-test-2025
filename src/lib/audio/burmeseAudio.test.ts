/**
 * Burmese Audio Adapter Tests
 *
 * Validates URL generation and player lifecycle for pre-generated Burmese MP3s.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { getBurmeseAudioUrl, createBurmesePlayer, type AudioType } from './burmeseAudio';

// ---------------------------------------------------------------------------
// URL Helper Tests
// ---------------------------------------------------------------------------

describe('getBurmeseAudioUrl', () => {
  it('returns correct path for female voice', () => {
    expect(getBurmeseAudioUrl('GOV-P01', 'q')).toBe('/audio/my-MM/female/GOV-P01-q.mp3');
  });

  it('handles answer type', () => {
    expect(getBurmeseAudioUrl('GOV-P01', 'a')).toBe('/audio/my-MM/female/GOV-P01-a.mp3');
  });

  it('handles explanation type', () => {
    expect(getBurmeseAudioUrl('GOV-P01', 'e')).toBe('/audio/my-MM/female/GOV-P01-e.mp3');
  });

  it('handles different question IDs', () => {
    expect(getBurmeseAudioUrl('RIGHTS-P05', 'q')).toBe('/audio/my-MM/female/RIGHTS-P05-q.mp3');
  });

  it('handles all audio type variants', () => {
    const types: AudioType[] = ['q', 'a', 'e'];
    types.forEach(type => {
      const url = getBurmeseAudioUrl('GOV-P01', type);
      expect(url).toContain(`GOV-P01-${type}.mp3`);
    });
  });
});

// ---------------------------------------------------------------------------
// createBurmesePlayer Tests
// ---------------------------------------------------------------------------

describe('createBurmesePlayer', () => {
  let mockPause: ReturnType<typeof vi.fn>;
  /** Whether the mock Audio auto-fires 'ended' after play() */
  let autoFireEnded: boolean;

  beforeEach(() => {
    mockPause = vi.fn();
    autoFireEnded = true;

    vi.stubGlobal(
      'Audio',
      class MockAudioElement {
        src = '';
        playbackRate = 1;
        private _listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

        pause = mockPause;
        load = vi.fn();
        removeAttribute = vi.fn();

        addEventListener(event: string, handler: (...args: unknown[]) => void) {
          if (!this._listeners[event]) this._listeners[event] = [];
          this._listeners[event].push(handler);
        }
        removeEventListener(event: string, handler: (...args: unknown[]) => void) {
          if (this._listeners[event]) {
            this._listeners[event] = this._listeners[event].filter(h => h !== handler);
          }
        }

        play(): Promise<void> {
          if (autoFireEnded) {
            // Schedule 'ended' event to fire asynchronously (simulates audio finishing)
            Promise.resolve().then(() => {
              const handlers = this._listeners['ended'] ?? [];
              handlers.forEach(h => h());
            });
          }
          return Promise.resolve();
        }

        /** Test helper: manually fire an event */
        _fireEvent(name: string) {
          const handlers = this._listeners[name] ?? [];
          handlers.forEach(h => h());
        }
      }
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns object with play/pause/resume/cancel/onStateChange/getState methods', () => {
    const player = createBurmesePlayer();
    expect(player.play).toBeTypeOf('function');
    expect(player.pause).toBeTypeOf('function');
    expect(player.resume).toBeTypeOf('function');
    expect(player.cancel).toBeTypeOf('function');
    expect(player.onStateChange).toBeTypeOf('function');
    expect(player.getState).toBeTypeOf('function');
  });

  it('play() sets isSpeaking to true and notifies subscribers', async () => {
    const player = createBurmesePlayer();
    const states: { isSpeaking: boolean; currentFile: string | null }[] = [];

    player.onStateChange(s => {
      states.push({ isSpeaking: s.isSpeaking, currentFile: s.currentFile });
    });

    await player.play('/audio/my-MM/female/GOV-P01-q.mp3');

    // Should have notified with isSpeaking=true (first notification)
    expect(states.length).toBeGreaterThanOrEqual(1);
    expect(states[0].isSpeaking).toBe(true);
    expect(states[0].currentFile).toBe('/audio/my-MM/female/GOV-P01-q.mp3');

    // After ended: state should be reset
    const finalState = player.getState();
    expect(finalState.isSpeaking).toBe(false);
    expect(finalState.currentFile).toBeNull();
  });

  it('cancel() resets state to idle', () => {
    // Disable auto-ended so play() hangs until we cancel
    autoFireEnded = false;

    const player = createBurmesePlayer();

    // Start play but don't await (will hang without ended event)
    const playPromise = player.play('/audio/my-MM/female/GOV-P01-q.mp3');

    expect(player.getState().isSpeaking).toBe(true);

    // Cancel
    player.cancel();

    expect(player.getState().isSpeaking).toBe(false);
    expect(player.getState().isPaused).toBe(false);
    expect(player.getState().currentFile).toBeNull();

    // Catch the unresolved promise to avoid warnings
    playPromise.catch(() => {
      // Expected: audio was cancelled
    });
  });

  it('initial state is idle', () => {
    const player = createBurmesePlayer();
    const state = player.getState();
    expect(state.isSpeaking).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.currentFile).toBeNull();
  });

  it('onStateChange returns unsubscribe function', () => {
    const player = createBurmesePlayer();
    const cb = vi.fn();

    const unsub = player.onStateChange(cb);
    expect(unsub).toBeTypeOf('function');

    // Cancel triggers state change
    player.cancel();

    const callsBefore = cb.mock.calls.length;

    // After unsubscribe, no more notifications
    unsub();
    player.cancel();

    expect(cb).toHaveBeenCalledTimes(callsBefore);
  });
});
