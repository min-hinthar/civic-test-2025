import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { precacheInterviewAudio, isAudioCached, INTERVIEW_AUDIO_NAMES } from './audioPrecache';
import { checkNetworkQuality } from './networkCheck';

// ---------------------------------------------------------------------------
// Mock Cache API
// ---------------------------------------------------------------------------

function createMockCache(failUrls: string[] = []) {
  return {
    add: vi.fn((url: string) => {
      if (failUrls.includes(url)) {
        return Promise.reject(new Error(`Failed to fetch ${url}`));
      }
      return Promise.resolve();
    }),
    match: vi.fn((url: string): Promise<Response | undefined> => {
      // Default: return undefined (not cached)
      void url;
      return Promise.resolve(undefined);
    }),
  };
}

let mockCache: ReturnType<typeof createMockCache>;

beforeEach(() => {
  mockCache = createMockCache();
  vi.stubGlobal('caches', {
    open: vi.fn().mockResolvedValue(mockCache),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// precacheInterviewAudio
// ---------------------------------------------------------------------------

describe('precacheInterviewAudio', () => {
  const questionIds = Array.from({ length: 20 }, (_, i) => `Q-${i + 1}`);

  it('builds correct URL count for English-only (20 questions x 2 + 17 interview = 57)', async () => {
    const result = await precacheInterviewAudio(questionIds);

    // 20 questions * 2 (q + a) = 40, plus 17 interview audio = 57
    expect(result.total).toBe(57);
    expect(result.loaded).toBe(57);
    expect(result.failed).toHaveLength(0);
  });

  it('builds correct URL count with Burmese (20*2 + 20*2 + 17 = 97)', async () => {
    const result = await precacheInterviewAudio(questionIds, {
      includeBurmese: true,
    });

    expect(result.total).toBe(97);
    expect(result.loaded).toBe(97);
    expect(result.failed).toHaveLength(0);
  });

  it('fires progress callback after each batch', async () => {
    const onProgress = vi.fn();
    await precacheInterviewAudio(questionIds, {}, onProgress);

    // 57 URLs / batch of 6 = 10 batches (9 full + 1 partial)
    expect(onProgress).toHaveBeenCalledTimes(10);

    // First batch should report 6 loaded
    expect(onProgress.mock.calls[0][0].loaded).toBe(6);

    // Last batch should report all 57 loaded
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1];
    expect(lastCall[0].loaded).toBe(57);
    expect(lastCall[0].total).toBe(57);
  });

  it('tracks partial failures in failed array without throwing', async () => {
    const failUrl1 = '/audio/en-US/ava/Q-1-q.mp3';
    const failUrl2 = '/audio/en-US/ava/Q-3-a.mp3';
    mockCache = createMockCache([failUrl1, failUrl2]);
    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue(mockCache),
    });

    const result = await precacheInterviewAudio(questionIds);

    expect(result.loaded).toBe(55);
    expect(result.failed).toHaveLength(2);
    expect(result.failed).toContain(failUrl1);
    expect(result.failed).toContain(failUrl2);
  });

  it('returns all URLs as failed when Cache API is unavailable', async () => {
    vi.stubGlobal('caches', undefined);

    const result = await precacheInterviewAudio(questionIds);

    expect(result.loaded).toBe(0);
    expect(result.failed).toHaveLength(57);
    expect(result.total).toBe(57);
  });

  it('includes all 17 interview audio names (11 base + 6 feedback)', () => {
    expect(INTERVIEW_AUDIO_NAMES).toHaveLength(17);
    expect(INTERVIEW_AUDIO_NAMES).toContain('greeting-01');
    expect(INTERVIEW_AUDIO_NAMES).toContain('pass-announce');
    expect(INTERVIEW_AUDIO_NAMES).toContain('fail-announce');
    expect(INTERVIEW_AUDIO_NAMES).toContain('correct-prefix');
    expect(INTERVIEW_AUDIO_NAMES).toContain('incorrect-prefix');
    expect(INTERVIEW_AUDIO_NAMES).toContain('feedback-correct-01');
    expect(INTERVIEW_AUDIO_NAMES).toContain('feedback-correct-03');
    expect(INTERVIEW_AUDIO_NAMES).toContain('feedback-incorrect-01');
    expect(INTERVIEW_AUDIO_NAMES).toContain('feedback-incorrect-03');
  });
});

// ---------------------------------------------------------------------------
// isAudioCached
// ---------------------------------------------------------------------------

describe('isAudioCached', () => {
  it('returns true when cache.match resolves with a response', async () => {
    mockCache.match.mockResolvedValue(new Response('audio data'));
    const result = await isAudioCached('/audio/en-US/ava/Q-1-q.mp3');
    expect(result).toBe(true);
  });

  it('returns false when cache.match resolves with undefined', async () => {
    mockCache.match.mockResolvedValue(undefined);
    const result = await isAudioCached('/audio/en-US/ava/Q-1-q.mp3');
    expect(result).toBe(false);
  });

  it('returns false when Cache API is unavailable', async () => {
    vi.stubGlobal('caches', undefined);
    const result = await isAudioCached('/audio/en-US/ava/Q-1-q.mp3');
    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkNetworkQuality
// ---------------------------------------------------------------------------

describe('checkNetworkQuality', () => {
  it('returns fast with good connection via Network Information API', async () => {
    Object.defineProperty(navigator, 'connection', {
      value: { downlink: 10 },
      configurable: true,
      writable: true,
    });

    const result = await checkNetworkQuality();
    expect(result).toBe('fast');

    // Clean up
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  it('returns slow with poor connection via Network Information API', async () => {
    Object.defineProperty(navigator, 'connection', {
      value: { downlink: 0.5 },
      configurable: true,
      writable: true,
    });

    const result = await checkNetworkQuality();
    expect(result).toBe('slow');

    // Clean up
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true,
      writable: true,
    });
  });

  it('returns offline when fetch fails and navigator is offline', async () => {
    // Ensure no Network Information API
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    // Mock navigator.onLine as false
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      configurable: true,
      writable: true,
    });

    // Mock fetch to reject
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const result = await checkNetworkQuality();
    expect(result).toBe('offline');

    // Clean up
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      configurable: true,
      writable: true,
    });
    vi.unstubAllGlobals();
  });

  it('returns fast when fetch succeeds quickly (fallback path)', async () => {
    // Ensure no Network Information API
    Object.defineProperty(navigator, 'connection', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    // Mock fast fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 200 })));

    const result = await checkNetworkQuality();
    expect(result).toBe('fast');

    vi.unstubAllGlobals();
  });
});
