/**
 * Tests for IndexedDB cache versioning:
 * - STORAGE_VERSIONS centralized constants
 * - getCachedQuestions version validation + stale invalidation
 * - hasQuestionsCache version check
 * - cacheQuestions writes correct version
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

// Use vi.hoisted so mock fns are available inside vi.mock factories
const { mockGet, mockSet, mockDel, mockKeys, mockClear, mockCreateStore, mockCaptureError } =
  vi.hoisted(() => ({
    mockGet: vi.fn(),
    mockSet: vi.fn(),
    mockDel: vi.fn(),
    mockKeys: vi.fn(),
    mockClear: vi.fn(),
    mockCreateStore: vi.fn(() => 'mock-store'),
    mockCaptureError: vi.fn(),
  }));

vi.mock('idb-keyval', () => ({
  get: mockGet,
  set: mockSet,
  del: mockDel,
  keys: mockKeys,
  clear: mockClear,
  createStore: mockCreateStore,
}));

vi.mock('@/lib/sentry', () => ({
  captureError: mockCaptureError,
}));

import { STORAGE_VERSIONS } from '@/lib/db/storageVersions';
import { getCachedQuestions, hasQuestionsCache, cacheQuestions } from '@/lib/pwa/offlineDb';
import type { Question } from '@/types';

const mockQuestions = [
  {
    id: 'GOV-01',
    question_en: 'What is the supreme law of the land?',
    question_my: 'test',
    category: 'Principles of American Democracy',
    studyAnswers: [],
    answers: [],
  },
] as unknown as Question[];

describe('STORAGE_VERSIONS', () => {
  it('has keys for all 10 stores with value 1', () => {
    const expectedKeys = [
      'QUESTIONS',
      'SESSION',
      'SRS_CARD',
      'SRS_SYNC',
      'BOOKMARK',
      'PENDING_SYNC',
      'ANSWER_HISTORY',
      'INTERVIEW',
      'STREAK',
      'BADGE',
    ];

    expect(Object.keys(STORAGE_VERSIONS)).toHaveLength(10);
    for (const key of expectedKeys) {
      expect(STORAGE_VERSIONS).toHaveProperty(key, 1);
    }
  });
});

describe('getCachedQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns questions when CacheMeta.version matches STORAGE_VERSIONS.QUESTIONS', async () => {
    // First call: get meta (version matches)
    mockGet.mockResolvedValueOnce({
      cachedAt: new Date().toISOString(),
      count: 1,
      version: STORAGE_VERSIONS.QUESTIONS,
    });
    // Second call: get questions
    mockGet.mockResolvedValueOnce(mockQuestions);

    const result = await getCachedQuestions();
    expect(result).toEqual(mockQuestions);
    expect(mockCaptureError).not.toHaveBeenCalled();
  });

  it('returns undefined and clears cache when CacheMeta.version does NOT match', async () => {
    // Meta with mismatched version
    mockGet.mockResolvedValueOnce({
      cachedAt: new Date().toISOString(),
      count: 1,
      version: 999,
    });

    const result = await getCachedQuestions();
    expect(result).toBeUndefined();
    // Should have called clearQuestionsCache (del for questions key + meta key)
    expect(mockDel).toHaveBeenCalled();
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        operation: 'offlineDb.getCachedQuestions',
        component: 'questions-cache',
        context: { cached: 999, expected: STORAGE_VERSIONS.QUESTIONS },
      })
    );
  });

  it('returns questions when no CacheMeta exists (backwards compat)', async () => {
    // No meta (undefined)
    mockGet.mockResolvedValueOnce(undefined);
    // Questions still exist from pre-versioned cache
    mockGet.mockResolvedValueOnce(mockQuestions);

    const result = await getCachedQuestions();
    expect(result).toEqual(mockQuestions);
    expect(mockDel).not.toHaveBeenCalled();
  });
});

describe('cacheQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes CacheMeta with version set to STORAGE_VERSIONS.QUESTIONS', async () => {
    mockSet.mockResolvedValue(undefined);

    await cacheQuestions(mockQuestions);

    // Second set call is the meta
    const metaCall = mockSet.mock.calls[1];
    expect(metaCall[1]).toMatchObject({
      version: STORAGE_VERSIONS.QUESTIONS,
      count: mockQuestions.length,
    });
    expect(metaCall[1].cachedAt).toBeDefined();
  });
});

describe('hasQuestionsCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns false after version-mismatch invalidation', async () => {
    // Meta with mismatched version
    mockGet.mockResolvedValueOnce({
      cachedAt: new Date().toISOString(),
      count: 1,
      version: 999,
    });

    const result = await hasQuestionsCache();
    expect(result).toBe(false);
    expect(mockDel).toHaveBeenCalled();
  });

  it('returns true when version matches and questions exist', async () => {
    // Meta with matching version
    mockGet.mockResolvedValueOnce({
      cachedAt: new Date().toISOString(),
      count: 1,
      version: STORAGE_VERSIONS.QUESTIONS,
    });
    // Questions exist
    mockGet.mockResolvedValueOnce(mockQuestions);

    const result = await hasQuestionsCache();
    expect(result).toBe(true);
  });
});
