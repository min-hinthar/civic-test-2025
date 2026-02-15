/**
 * Session Store -- IndexedDB CRUD for Session Snapshots
 *
 * Uses idb-keyval with a dedicated store for session persistence.
 * Follows the exact pattern from offlineDb.ts: createStore for isolation,
 * iterate keys() + get() for filtering.
 *
 * Enforces:
 * - Max 1 session per type (3 total max)
 * - 24-hour expiry on load
 * - Version mismatch discards stale snapshots
 */

import { createStore, del, get, keys, set } from 'idb-keyval';

import { SESSION_VERSION } from './sessionTypes';
import type { SessionSnapshot } from './sessionTypes';

/** Dedicated IndexedDB database + object store for session snapshots */
export const sessionStore = createStore('civic-prep-sessions', 'active-sessions');

/** Sessions older than 24 hours are automatically discarded */
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Save a session snapshot to IndexedDB.
 *
 * Enforces max 1 session per type: before saving, deletes any existing
 * snapshot of the same type. This means at most 3 snapshots can exist
 * (one per session type).
 */
export async function saveSession(snapshot: SessionSnapshot): Promise<void> {
  // Enforce 1-per-type: delete any existing session of the same type
  const allKeys = await keys(sessionStore);
  for (const key of allKeys) {
    const existing = await get<SessionSnapshot>(key, sessionStore);
    if (existing && existing.type === snapshot.type && existing.id !== snapshot.id) {
      await del(key, sessionStore);
    }
  }

  await set(
    snapshot.id,
    { ...snapshot, version: SESSION_VERSION, savedAt: new Date().toISOString() },
    sessionStore
  );
}

/**
 * Get all sessions of a specific type.
 * Discards expired and version-mismatched entries (deletes them from store).
 */
export async function getSessionsByType(type: SessionSnapshot['type']): Promise<SessionSnapshot[]> {
  const allKeys = await keys(sessionStore);
  const sessions: SessionSnapshot[] = [];
  const now = Date.now();

  for (const key of allKeys) {
    const snap = await get<SessionSnapshot>(key, sessionStore);
    if (!snap) continue;

    // Version mismatch -- discard
    if (snap.version !== SESSION_VERSION) {
      await del(key, sessionStore);
      continue;
    }

    // Expired -- discard
    if (now - new Date(snap.savedAt).getTime() > SESSION_EXPIRY_MS) {
      await del(key, sessionStore);
      continue;
    }

    if (snap.type === type) {
      sessions.push(snap);
    }
  }

  return sessions;
}

/**
 * Get all valid (non-expired, version-matched) sessions.
 * Used by dashboard banner and nav badges.
 */
export async function getAllSessions(): Promise<SessionSnapshot[]> {
  const allKeys = await keys(sessionStore);
  const sessions: SessionSnapshot[] = [];
  const now = Date.now();

  for (const key of allKeys) {
    const snap = await get<SessionSnapshot>(key, sessionStore);
    if (!snap) continue;

    // Version mismatch -- discard
    if (snap.version !== SESSION_VERSION) {
      await del(key, sessionStore);
      continue;
    }

    // Expired -- discard
    if (now - new Date(snap.savedAt).getTime() > SESSION_EXPIRY_MS) {
      await del(key, sessionStore);
      continue;
    }

    sessions.push(snap);
  }

  return sessions;
}

/**
 * Delete a session by ID.
 * Called when a session is completed/submitted or when user chooses "Start Fresh".
 */
export async function deleteSession(id: string): Promise<void> {
  await del(id, sessionStore);
}

/**
 * Clean all expired and version-mismatched sessions.
 * Called on app startup to prevent stale data accumulation.
 */
export async function cleanExpiredSessions(): Promise<void> {
  const allKeys = await keys(sessionStore);
  const now = Date.now();

  for (const key of allKeys) {
    const snap = await get<SessionSnapshot>(key, sessionStore);
    if (!snap) {
      await del(key, sessionStore);
      continue;
    }

    if (snap.version !== SESSION_VERSION) {
      await del(key, sessionStore);
      continue;
    }

    if (now - new Date(snap.savedAt).getTime() > SESSION_EXPIRY_MS) {
      await del(key, sessionStore);
    }
  }
}
