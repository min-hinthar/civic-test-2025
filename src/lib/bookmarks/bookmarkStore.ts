/**
 * Bookmark Store - IndexedDB storage for bookmarked/starred questions.
 *
 * Uses idb-keyval with a dedicated store ('civic-prep-bookmarks' / 'starred')
 * for persisting bookmark state across sessions. Each bookmark is keyed
 * by questionId for O(1) lookup.
 *
 * Follows the same pattern as src/lib/srs/srsStore.ts.
 */

import { createStore, get, set, del, keys } from 'idb-keyval';

// ---------------------------------------------------------------------------
// Dedicated IndexedDB store for bookmarks
// ---------------------------------------------------------------------------

const bookmarkDb = createStore('civic-prep-bookmarks', 'starred');

// ---------------------------------------------------------------------------
// CRUD operations
// ---------------------------------------------------------------------------

/** Check if a question is bookmarked. */
export async function isBookmarked(questionId: string): Promise<boolean> {
  const val = await get<boolean>(questionId, bookmarkDb);
  return val === true;
}

/** Set or remove a bookmark for a question. */
export async function setBookmark(questionId: string, starred: boolean): Promise<void> {
  if (starred) {
    await set(questionId, true, bookmarkDb);
  } else {
    await del(questionId, bookmarkDb);
  }
}

/** Get all bookmarked question IDs. */
export async function getAllBookmarkIds(): Promise<string[]> {
  const allKeys = await keys(bookmarkDb);
  return allKeys as string[];
}

/** Remove all bookmarks. */
export async function clearAllBookmarks(): Promise<void> {
  const allKeys = await keys(bookmarkDb);
  for (const key of allKeys) {
    await del(key as string, bookmarkDb);
  }
}
