/**
 * Per-field timestamp management for LWW settings sync.
 *
 * Stores per-field timestamps in localStorage under 'civic-settings-timestamps'.
 * Stores dirty flags under 'civic-settings-dirty' for fields changed while offline.
 *
 * The merge function is pure (takes inputs, returns outputs) for easy testing.
 * Only localStorage helpers have side effects.
 */
import type { UserSettings } from './settingsSync';

const TIMESTAMPS_KEY = 'civic-settings-timestamps';
const DIRTY_KEY = 'civic-settings-dirty';

/** All settings field names that participate in per-field LWW */
export const SETTINGS_FIELDS: (keyof UserSettings)[] = [
  'theme',
  'languageMode',
  'ttsRate',
  'ttsPitch',
  'ttsAutoRead',
  'ttsAutoReadLang',
  'testDate',
];

export type SettingsTimestamps = Partial<Record<keyof UserSettings, string>>;
export type SettingsDirtyFlags = Partial<Record<keyof UserSettings, boolean>>;

// ---------------------------------------------------------------------------
// localStorage helpers (side effects)
// ---------------------------------------------------------------------------

export function getSettingsTimestamps(): SettingsTimestamps {
  try {
    const raw = localStorage.getItem(TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setFieldTimestamp(field: keyof UserSettings, timestamp?: string): void {
  try {
    const current = getSettingsTimestamps();
    current[field] = timestamp ?? new Date().toISOString();
    localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(current));
  } catch {
    // localStorage unavailable
  }
}

export function getDirtyFlags(): SettingsDirtyFlags {
  try {
    const raw = localStorage.getItem(DIRTY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function markFieldDirty(field: keyof UserSettings): void {
  try {
    const current = getDirtyFlags();
    current[field] = true;
    localStorage.setItem(DIRTY_KEY, JSON.stringify(current));
  } catch {
    // localStorage unavailable
  }
}

export function clearDirtyFlags(): void {
  try {
    localStorage.removeItem(DIRTY_KEY);
  } catch {
    // localStorage unavailable
  }
}

// ---------------------------------------------------------------------------
// Pure merge function (no side effects)
// ---------------------------------------------------------------------------

export interface MergeInput {
  local: UserSettings;
  localTimestamps: SettingsTimestamps;
  localDirty: SettingsDirtyFlags;
  remote: UserSettings;
  remoteUpdatedAt: string; // ISO timestamp from Supabase row updated_at
}

export interface MergeResult {
  merged: UserSettings;
  changedFields: (keyof UserSettings)[];
}

/**
 * Per-field last-write-wins merge.
 *
 * For each field:
 * 1. If local is dirty (changed offline), local wins regardless of timestamp
 * 2. If local timestamp > remote updated_at, local wins
 * 3. Otherwise, remote wins
 *
 * Returns merged settings and list of fields that changed from local state.
 */
export function mergeSettingsWithTimestamps(input: MergeInput): MergeResult {
  const { local, localTimestamps, localDirty, remote, remoteUpdatedAt } = input;
  const merged = { ...local };
  const changedFields: (keyof UserSettings)[] = [];

  for (const field of SETTINGS_FIELDS) {
    // Dirty field: local always wins (changed offline, not yet synced)
    if (localDirty[field]) {
      // Keep local value (already in merged)
      continue;
    }

    const localTs = localTimestamps[field];
    // If no local timestamp, remote wins (field was never locally modified with tracking)
    if (!localTs) {
      if (local[field] !== remote[field]) {
        (merged as Record<string, unknown>)[field] = remote[field];
        changedFields.push(field);
      }
      continue;
    }

    // If no remote timestamp, local wins (remote has no data)
    if (!remoteUpdatedAt) {
      continue;
    }

    // Compare timestamps: local wins if newer, remote wins otherwise
    const localTime = new Date(localTs).getTime();
    const remoteTime = new Date(remoteUpdatedAt).getTime();

    if (remoteTime > localTime) {
      if (local[field] !== remote[field]) {
        (merged as Record<string, unknown>)[field] = remote[field];
        changedFields.push(field);
      }
    }
    // else: local is newer or equal, keep local (already in merged)
  }

  return { merged, changedFields };
}
