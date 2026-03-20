import { describe, it, expect, beforeEach } from 'vitest';
import type { UserSettings } from '@/lib/settings/settingsSync';
import {
  getSettingsTimestamps,
  setFieldTimestamp,
  getDirtyFlags,
  markFieldDirty,
  clearDirtyFlags,
  mergeSettingsWithTimestamps,
  SETTINGS_FIELDS,
  type MergeInput,
} from '@/lib/settings/settingsTimestamps';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSettings(overrides: Partial<UserSettings> = {}): UserSettings {
  return {
    theme: 'light',
    languageMode: 'bilingual',
    ttsRate: 'normal',
    ttsPitch: 1.02,
    ttsAutoRead: true,
    ttsAutoReadLang: 'both',
    testDate: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

describe('settingsTimestamps localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('getSettingsTimestamps returns empty object when localStorage key missing', () => {
    expect(getSettingsTimestamps()).toEqual({});
  });

  it('setFieldTimestamp stores ISO timestamp for given field', () => {
    const ts = '2026-03-20T10:00:00.000Z';
    setFieldTimestamp('theme', ts);
    const result = getSettingsTimestamps();
    expect(result.theme).toBe(ts);
  });

  it('setFieldTimestamp auto-generates timestamp when none provided', () => {
    const before = new Date().toISOString();
    setFieldTimestamp('languageMode');
    const result = getSettingsTimestamps();
    expect(result.languageMode).toBeDefined();
    expect(new Date(result.languageMode!).getTime()).toBeGreaterThanOrEqual(
      new Date(before).getTime()
    );
  });

  it('markFieldDirty sets dirty flag for given field', () => {
    markFieldDirty('theme');
    const flags = getDirtyFlags();
    expect(flags.theme).toBe(true);
  });

  it('markFieldDirty preserves existing dirty flags', () => {
    markFieldDirty('theme');
    markFieldDirty('languageMode');
    const flags = getDirtyFlags();
    expect(flags.theme).toBe(true);
    expect(flags.languageMode).toBe(true);
  });

  it('clearDirtyFlags removes all dirty entries', () => {
    markFieldDirty('theme');
    markFieldDirty('ttsRate');
    clearDirtyFlags();
    expect(getDirtyFlags()).toEqual({});
  });

  it('getSettingsTimestamps returns empty object on corrupted JSON', () => {
    localStorage.setItem('civic-settings-timestamps', 'NOT_JSON');
    expect(getSettingsTimestamps()).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// SETTINGS_FIELDS constant
// ---------------------------------------------------------------------------

describe('SETTINGS_FIELDS', () => {
  it('contains all 7 UserSettings fields', () => {
    expect(SETTINGS_FIELDS).toHaveLength(7);
    expect(SETTINGS_FIELDS).toContain('theme');
    expect(SETTINGS_FIELDS).toContain('languageMode');
    expect(SETTINGS_FIELDS).toContain('ttsRate');
    expect(SETTINGS_FIELDS).toContain('ttsPitch');
    expect(SETTINGS_FIELDS).toContain('ttsAutoRead');
    expect(SETTINGS_FIELDS).toContain('ttsAutoReadLang');
    expect(SETTINGS_FIELDS).toContain('testDate');
  });
});

// ---------------------------------------------------------------------------
// Pure merge function
// ---------------------------------------------------------------------------

describe('mergeSettingsWithTimestamps', () => {
  const OLDER = '2026-03-19T10:00:00.000Z';
  const NEWER = '2026-03-20T10:00:00.000Z';

  it('local field with newer timestamp wins over remote', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'dark' }),
      localTimestamps: { theme: NEWER },
      localDirty: {},
      remote: makeSettings({ theme: 'light' }),
      remoteUpdatedAt: OLDER,
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged.theme).toBe('dark');
    expect(changedFields).not.toContain('theme');
  });

  it('remote field with newer timestamp wins over local', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'light' }),
      localTimestamps: { theme: OLDER },
      localDirty: {},
      remote: makeSettings({ theme: 'dark' }),
      remoteUpdatedAt: NEWER,
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged.theme).toBe('dark');
    expect(changedFields).toContain('theme');
  });

  it('dirty local field wins even if remote timestamp is newer', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'dark' }),
      localTimestamps: { theme: OLDER },
      localDirty: { theme: true },
      remote: makeSettings({ theme: 'light' }),
      remoteUpdatedAt: NEWER,
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged.theme).toBe('dark');
    expect(changedFields).not.toContain('theme');
  });

  it('field with no local timestamp defaults to remote', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'light' }),
      localTimestamps: {}, // no theme timestamp
      localDirty: {},
      remote: makeSettings({ theme: 'dark' }),
      remoteUpdatedAt: NEWER,
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged.theme).toBe('dark');
    expect(changedFields).toContain('theme');
  });

  it('field with no remote updated_at defaults to local', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'dark' }),
      localTimestamps: { theme: OLDER },
      localDirty: {},
      remote: makeSettings({ theme: 'light' }),
      remoteUpdatedAt: '', // empty = no remote timestamp
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged.theme).toBe('dark');
    expect(changedFields).not.toContain('theme');
  });

  it('changedFields lists only fields that changed from local state', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'light', languageMode: 'bilingual' }),
      localTimestamps: { theme: OLDER, languageMode: NEWER },
      localDirty: {},
      remote: makeSettings({ theme: 'dark', languageMode: 'english-only' }),
      remoteUpdatedAt: NEWER,
    };
    const { changedFields } = mergeSettingsWithTimestamps(input);
    // theme: local OLDER < remote NEWER -> remote wins -> changed
    expect(changedFields).toContain('theme');
    // languageMode: local NEWER >= remote NEWER -> local wins -> not changed
    expect(changedFields).not.toContain('languageMode');
  });

  it('independent fields: changing theme does not affect languageMode', () => {
    const input: MergeInput = {
      local: makeSettings({ theme: 'light', languageMode: 'bilingual' }),
      localTimestamps: { theme: OLDER, languageMode: NEWER },
      localDirty: {},
      remote: makeSettings({ theme: 'dark', languageMode: 'english-only' }),
      remoteUpdatedAt: NEWER,
    };
    const { merged } = mergeSettingsWithTimestamps(input);
    // theme: remote wins (remote newer)
    expect(merged.theme).toBe('dark');
    // languageMode: local wins (local newer or equal)
    expect(merged.languageMode).toBe('bilingual');
  });

  it('handles all 7 fields independently in a single merge', () => {
    const input: MergeInput = {
      local: makeSettings({
        theme: 'dark',
        languageMode: 'english-only',
        ttsRate: 'slow',
        ttsPitch: 0.8,
        ttsAutoRead: false,
        ttsAutoReadLang: 'english',
        testDate: '2026-06-01',
      }),
      localTimestamps: {
        theme: NEWER, // local wins
        languageMode: OLDER, // remote wins
        ttsRate: NEWER, // local wins
        ttsPitch: OLDER, // remote wins
        ttsAutoRead: NEWER, // local wins
        // ttsAutoReadLang: no timestamp -> remote wins
        // testDate: no timestamp -> remote wins
      },
      localDirty: { ttsAutoRead: true }, // dirty overrides
      remote: makeSettings({
        theme: 'light',
        languageMode: 'bilingual',
        ttsRate: 'fast',
        ttsPitch: 1.5,
        ttsAutoRead: true,
        ttsAutoReadLang: 'burmese',
        testDate: '2026-12-01',
      }),
      remoteUpdatedAt: NEWER,
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged.theme).toBe('dark'); // local newer
    expect(merged.languageMode).toBe('bilingual'); // remote newer
    expect(merged.ttsRate).toBe('slow'); // local newer
    expect(merged.ttsPitch).toBe(1.5); // remote newer
    expect(merged.ttsAutoRead).toBe(false); // dirty local
    expect(merged.ttsAutoReadLang).toBe('burmese'); // no local ts -> remote
    expect(merged.testDate).toBe('2026-12-01'); // no local ts -> remote
    expect(changedFields).toContain('languageMode');
    expect(changedFields).toContain('ttsPitch');
    expect(changedFields).toContain('ttsAutoReadLang');
    expect(changedFields).toContain('testDate');
    expect(changedFields).not.toContain('theme');
    expect(changedFields).not.toContain('ttsRate');
    expect(changedFields).not.toContain('ttsAutoRead');
  });

  it('returns empty changedFields when local and remote are identical', () => {
    const settings = makeSettings();
    const input: MergeInput = {
      local: settings,
      localTimestamps: {},
      localDirty: {},
      remote: { ...settings },
      remoteUpdatedAt: NEWER,
    };
    const { merged, changedFields } = mergeSettingsWithTimestamps(input);
    expect(merged).toEqual(settings);
    expect(changedFields).toHaveLength(0);
  });
});
