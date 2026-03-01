/**
 * Tests for bookmarkSync - Bookmark push/pull/merge functions.
 *
 * Tests cover:
 * - mergeBookmarks: union of two string arrays, deduplicated and sorted
 * - mergeBookmarks edge cases (empty arrays, duplicates)
 * - syncBookmarksToSupabase skips when offline
 * - loadBookmarksFromSupabase returns empty array when no row exists
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergeBookmarks, syncBookmarksToSupabase, loadBookmarksFromSupabase } from './bookmarkSync';

// ---------------------------------------------------------------------------
// Mock Supabase
// ---------------------------------------------------------------------------

const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'user_bookmarks') {
        return {
          upsert: mockUpsert,
          select: mockSelect,
        };
      }
      return {};
    }),
  },
}));

vi.mock('@/lib/async', () => ({
  withRetry: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}));

vi.mock('@/lib/sentry', () => ({
  captureError: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Pure function tests: mergeBookmarks
// ---------------------------------------------------------------------------

describe('mergeBookmarks', () => {
  it('produces union of local and remote bookmark IDs', () => {
    const result = mergeBookmarks(['A', 'B'], ['B', 'C']);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  it('handles first-time sync (empty local)', () => {
    const result = mergeBookmarks([], ['A']);
    expect(result).toEqual(['A']);
  });

  it('handles no remote data', () => {
    const result = mergeBookmarks(['A'], []);
    expect(result).toEqual(['A']);
  });

  it('handles both empty', () => {
    const result = mergeBookmarks([], []);
    expect(result).toEqual([]);
  });

  it('deduplicates within same array', () => {
    const result = mergeBookmarks(['A', 'A', 'B'], ['B', 'C', 'C']);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  it('returns sorted results', () => {
    const result = mergeBookmarks(['C', 'A'], ['B']);
    expect(result).toEqual(['A', 'B', 'C']);
  });

  it('handles numeric question IDs', () => {
    const result = mergeBookmarks(['10', '2', '1'], ['3', '2']);
    expect(result).toEqual(['1', '10', '2', '3']);
  });
});

// ---------------------------------------------------------------------------
// Async function tests: syncBookmarksToSupabase
// ---------------------------------------------------------------------------

describe('syncBookmarksToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  it('skips silently when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    await syncBookmarksToSupabase('user-123', ['A', 'B']);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('calls upsert with question_ids array when online', async () => {
    mockUpsert.mockResolvedValue({ error: null });

    await syncBookmarksToSupabase('user-123', ['A', 'B', 'C']);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        question_ids: ['A', 'B', 'C'],
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Async function tests: loadBookmarksFromSupabase
// ---------------------------------------------------------------------------

describe('loadBookmarksFromSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  });

  it('returns empty array when no row exists', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await loadBookmarksFromSupabase('user-123');
    expect(result).toEqual([]);
  });

  it('returns question_ids when row exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        user_id: 'user-123',
        question_ids: ['Q1', 'Q5', 'Q10'],
        updated_at: '2026-03-01T00:00:00Z',
      },
      error: null,
    });

    const result = await loadBookmarksFromSupabase('user-123');
    expect(result).toEqual(['Q1', 'Q5', 'Q10']);
  });
});
