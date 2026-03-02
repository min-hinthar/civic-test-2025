import { useState, useEffect, useCallback, useRef } from 'react';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  getAllBookmarkIds,
  setBookmark as persistBookmark,
  syncBookmarksToSupabase,
} from '@/lib/bookmarks';

export function useBookmarks() {
  const { user } = useAuth();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load all bookmarks on mount
  useEffect(() => {
    let cancelled = false;
    getAllBookmarkIds()
      .then(ids => {
        if (!cancelled) {
          setBookmarkedIds(new Set(ids));
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBookmark = useCallback(
    async (questionId: string) => {
      const wasBookmarked = bookmarkedIds.has(questionId);

      // Optimistic update - instant UI feedback
      setBookmarkedIds(prev => {
        const next = new Set(prev);
        if (wasBookmarked) {
          next.delete(questionId);
        } else {
          next.add(questionId);
        }
        return next;
      });

      // Persist to IndexedDB
      try {
        await persistBookmark(questionId, !wasBookmarked);

        // Fire-and-forget sync to Supabase after successful persist
        if (userRef.current?.id) {
          getAllBookmarkIds().then(allIds => {
            syncBookmarksToSupabase(userRef.current!.id, allIds);
          });
        }
      } catch {
        // Revert optimistic update on failure
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (wasBookmarked) {
            next.add(questionId);
          } else {
            next.delete(questionId);
          }
          return next;
        });
      }
    },
    [bookmarkedIds]
  );

  const isBookmarked = useCallback(
    (questionId: string) => bookmarkedIds.has(questionId),
    [bookmarkedIds]
  );

  return {
    isBookmarked,
    toggleBookmark,
    bookmarkedIds,
    bookmarkCount: bookmarkedIds.size,
    isLoading,
  };
}
