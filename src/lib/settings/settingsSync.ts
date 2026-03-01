/**
 * Settings Sync - Supabase sync layer for user settings.
 *
 * Provides functions to sync user settings (theme, language, TTS, test date)
 * to/from Supabase for cross-device persistence. Follows the fire-and-forget
 * pattern from streakSync.ts: sync failures are logged but never break UX.
 *
 * NOTE: Does NOT sync `preferredVoiceName` -- voices differ by device/OS.
 * Only syncs portable TTS settings: rate, pitch, autoRead, autoReadLang.
 *
 * Sync strategy:
 * - On sign-in: load remote settings (server wins), overwrite local
 * - On setting change: upsert to Supabase (fire-and-forget)
 */

import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/async';
import { captureError } from '@/lib/sentry';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Client-side settings shape (camelCase) */
export interface UserSettings {
  theme: 'light' | 'dark';
  languageMode: 'bilingual' | 'english-only';
  ttsRate: 'slow' | 'normal' | 'fast';
  ttsPitch: number;
  ttsAutoRead: boolean;
  ttsAutoReadLang: 'english' | 'burmese' | 'both';
  testDate: string | null;
}

/** Row shape from the user_settings Supabase table (snake_case) */
export interface UserSettingsRow {
  user_id: string;
  theme: string;
  language_mode: string;
  tts_rate: string;
  tts_pitch: number;
  tts_auto_read: boolean;
  tts_auto_read_lang: string;
  test_date: string | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Pure mapping functions
// ---------------------------------------------------------------------------

/**
 * Map a snake_case DB row to a camelCase UserSettings object.
 * Returns defaults for missing/null fields.
 */
export function mapRowToSettings(row: UserSettingsRow): UserSettings {
  return {
    theme: (row.theme as UserSettings['theme']) ?? 'light',
    languageMode: (row.language_mode as UserSettings['languageMode']) ?? 'bilingual',
    ttsRate: (row.tts_rate as UserSettings['ttsRate']) ?? 'normal',
    ttsPitch: row.tts_pitch ?? 1.02,
    ttsAutoRead: row.tts_auto_read ?? true,
    ttsAutoReadLang: (row.tts_auto_read_lang as UserSettings['ttsAutoReadLang']) ?? 'both',
    testDate: row.test_date ?? null,
  };
}

/**
 * Map a camelCase UserSettings object to a snake_case DB row for upsert.
 */
export function mapSettingsToRow(userId: string, settings: UserSettings): Record<string, unknown> {
  return {
    user_id: userId,
    theme: settings.theme,
    language_mode: settings.languageMode,
    tts_rate: settings.ttsRate,
    tts_pitch: settings.ttsPitch,
    tts_auto_read: settings.ttsAutoRead,
    tts_auto_read_lang: settings.ttsAutoReadLang,
    test_date: settings.testDate,
    updated_at: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Gather current settings from localStorage
// ---------------------------------------------------------------------------

/**
 * Read all current settings from their respective localStorage keys.
 *
 * Centralizes localStorage key knowledge so each context/hook doesn't
 * need to know about other settings' storage format.
 * Pure localStorage reader -- no side effects beyond reading.
 */
export function gatherCurrentSettings(): UserSettings {
  const theme = (localStorage.getItem('civic-theme') as UserSettings['theme']) ?? 'light';
  const languageMode =
    (localStorage.getItem('civic-test-language-mode') as UserSettings['languageMode']) ??
    'bilingual';

  let ttsRate: UserSettings['ttsRate'] = 'normal';
  let ttsPitch: UserSettings['ttsPitch'] = 1.02;
  let ttsAutoRead: UserSettings['ttsAutoRead'] = true;
  let ttsAutoReadLang: UserSettings['ttsAutoReadLang'] = 'both';

  try {
    const raw = localStorage.getItem('civic-prep-tts-settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      ttsRate = parsed.rate ?? 'normal';
      ttsPitch = parsed.pitch ?? 1.02;
      ttsAutoRead = parsed.autoRead ?? true;
      ttsAutoReadLang = parsed.autoReadLang ?? 'both';
    }
  } catch {
    // Corrupted TTS settings -- use defaults
  }

  const testDate = localStorage.getItem('civic-prep-test-date');

  return { theme, languageMode, ttsRate, ttsPitch, ttsAutoRead, ttsAutoReadLang, testDate };
}

// ---------------------------------------------------------------------------
// Sync to Supabase
// ---------------------------------------------------------------------------

/**
 * Upsert user settings to the user_settings table.
 *
 * Maps UserSettings fields to snake_case columns.
 * Skips silently if offline (fire-and-forget pattern).
 * On error: logs to Sentry, does not throw.
 */
export async function syncSettingsToSupabase(
  userId: string,
  settings: UserSettings
): Promise<void> {
  // Skip if offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    await withRetry(
      async () => {
        const { error } = await supabase
          .from('user_settings')
          .upsert(mapSettingsToRow(userId, settings));

        if (error) throw error;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    captureError(err, { operation: 'settingsSync.push', userId });
  }
}

// ---------------------------------------------------------------------------
// Load from Supabase
// ---------------------------------------------------------------------------

/**
 * Load user settings from Supabase.
 *
 * Used on sign-in to load remote settings (server wins).
 * Returns null if no data exists or on error (graceful degradation).
 */
export async function loadSettingsFromSupabase(userId: string): Promise<UserSettings | null> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapRowToSettings(data as UserSettingsRow);
  } catch (err) {
    captureError(err, { operation: 'settingsSync.pull', userId });
    return null;
  }
}
