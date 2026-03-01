/**
 * Tests for settingsSync - Settings push/pull/mapping functions.
 *
 * Tests cover:
 * - mapRowToSettings: snake_case DB row -> camelCase UserSettings
 * - mapSettingsToRow: camelCase UserSettings -> snake_case DB columns
 * - mapRowToSettings returns defaults for missing fields
 * - syncSettingsToSupabase skips when offline
 * - loadSettingsFromSupabase returns null when no row exists
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mapRowToSettings,
  mapSettingsToRow,
  syncSettingsToSupabase,
  loadSettingsFromSupabase,
} from './settingsSync';
import type { UserSettings, UserSettingsRow } from './settingsSync';

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
      if (table === 'user_settings') {
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
// Pure function tests: mapRowToSettings
// ---------------------------------------------------------------------------

describe('mapRowToSettings', () => {
  it('maps snake_case DB row to camelCase UserSettings', () => {
    const row: UserSettingsRow = {
      user_id: 'user-123',
      theme: 'dark',
      language_mode: 'english-only',
      tts_rate: 'fast',
      tts_pitch: 1.5,
      tts_auto_read: false,
      tts_auto_read_lang: 'english',
      test_date: '2026-06-15',
      updated_at: '2026-03-01T00:00:00Z',
    };

    const result = mapRowToSettings(row);

    expect(result).toEqual({
      theme: 'dark',
      languageMode: 'english-only',
      ttsRate: 'fast',
      ttsPitch: 1.5,
      ttsAutoRead: false,
      ttsAutoReadLang: 'english',
      testDate: '2026-06-15',
    });
  });

  it('returns defaults for missing/null fields', () => {
    const row = {
      user_id: 'user-123',
      updated_at: '2026-03-01T00:00:00Z',
    } as unknown as UserSettingsRow;

    const result = mapRowToSettings(row);

    expect(result).toEqual({
      theme: 'light',
      languageMode: 'bilingual',
      ttsRate: 'normal',
      ttsPitch: 1.02,
      ttsAutoRead: true,
      ttsAutoReadLang: 'both',
      testDate: null,
    });
  });

  it('preserves null test_date', () => {
    const row: UserSettingsRow = {
      user_id: 'user-123',
      theme: 'light',
      language_mode: 'bilingual',
      tts_rate: 'normal',
      tts_pitch: 1.02,
      tts_auto_read: true,
      tts_auto_read_lang: 'both',
      test_date: null,
      updated_at: '2026-03-01T00:00:00Z',
    };

    const result = mapRowToSettings(row);
    expect(result.testDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Pure function tests: mapSettingsToRow
// ---------------------------------------------------------------------------

describe('mapSettingsToRow', () => {
  it('maps camelCase UserSettings to snake_case DB columns', () => {
    const settings: UserSettings = {
      theme: 'dark',
      languageMode: 'english-only',
      ttsRate: 'slow',
      ttsPitch: 0.8,
      ttsAutoRead: false,
      ttsAutoReadLang: 'burmese',
      testDate: '2026-07-04',
    };

    const result = mapSettingsToRow('user-456', settings);

    expect(result).toEqual({
      user_id: 'user-456',
      theme: 'dark',
      language_mode: 'english-only',
      tts_rate: 'slow',
      tts_pitch: 0.8,
      tts_auto_read: false,
      tts_auto_read_lang: 'burmese',
      test_date: '2026-07-04',
      updated_at: expect.any(String),
    });
  });

  it('includes null test_date in output', () => {
    const settings: UserSettings = {
      theme: 'light',
      languageMode: 'bilingual',
      ttsRate: 'normal',
      ttsPitch: 1.02,
      ttsAutoRead: true,
      ttsAutoReadLang: 'both',
      testDate: null,
    };

    const result = mapSettingsToRow('user-789', settings);
    expect(result.test_date).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Async function tests: syncSettingsToSupabase
// ---------------------------------------------------------------------------

describe('syncSettingsToSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  it('skips silently when offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    await syncSettingsToSupabase('user-123', {
      theme: 'light',
      languageMode: 'bilingual',
      ttsRate: 'normal',
      ttsPitch: 1.02,
      ttsAutoRead: true,
      ttsAutoReadLang: 'both',
      testDate: null,
    });

    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('calls upsert when online', async () => {
    mockUpsert.mockResolvedValue({ error: null });

    await syncSettingsToSupabase('user-123', {
      theme: 'dark',
      languageMode: 'english-only',
      ttsRate: 'fast',
      ttsPitch: 1.5,
      ttsAutoRead: false,
      ttsAutoReadLang: 'english',
      testDate: '2026-06-15',
    });

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-123',
        theme: 'dark',
        language_mode: 'english-only',
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Async function tests: loadSettingsFromSupabase
// ---------------------------------------------------------------------------

describe('loadSettingsFromSupabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  });

  it('returns null when no row exists', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await loadSettingsFromSupabase('user-123');
    expect(result).toBeNull();
  });

  it('returns mapped settings when row exists', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        user_id: 'user-123',
        theme: 'dark',
        language_mode: 'english-only',
        tts_rate: 'fast',
        tts_pitch: 1.5,
        tts_auto_read: false,
        tts_auto_read_lang: 'english',
        test_date: '2026-06-15',
        updated_at: '2026-03-01T00:00:00Z',
      },
      error: null,
    });

    const result = await loadSettingsFromSupabase('user-123');

    expect(result).toEqual({
      theme: 'dark',
      languageMode: 'english-only',
      ttsRate: 'fast',
      ttsPitch: 1.5,
      ttsAutoRead: false,
      ttsAutoReadLang: 'english',
      testDate: '2026-06-15',
    });
  });
});
