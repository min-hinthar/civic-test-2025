'use client';

/**
 * Social Context Provider
 *
 * Provides centralized social identity state: opt-in status, display name,
 * and social profile data. Syncs streak data and social profile with Supabase
 * when the user is authenticated.
 *
 * Features:
 * - Loads social profile from Supabase on mount (when authenticated)
 * - Syncs streak data bidirectionally on sign-in (merge local + remote)
 * - Exposes opt-in/opt-out, display name update, and profile refresh
 * - Works for unauthenticated users (returns safe defaults, no-op functions)
 * - Follows SRSContext.tsx patterns for context structure
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { captureError } from '@/lib/sentry';
import type { SocialProfile } from '@/lib/social/socialProfileSync';
import {
  getSocialProfile,
  toggleSocialOptIn,
  upsertSocialProfile,
} from '@/lib/social/socialProfileSync';
import {
  loadStreakFromSupabase,
  mergeStreakData,
  syncStreakToSupabase,
} from '@/lib/social/streakSync';
import { getStreakData, saveStreakData } from '@/lib/social/streakStore';
import { useVisibilitySync } from '@/hooks/useVisibilitySync';
import { loadSettingsFromSupabase } from '@/lib/settings';
import {
  loadBookmarksFromSupabase,
  mergeBookmarks,
  getAllBookmarkIds,
  setBookmark as persistBookmark,
} from '@/lib/bookmarks';

// ---------------------------------------------------------------------------
// Context value interface
// ---------------------------------------------------------------------------

interface SocialContextValue {
  /** The user's social profile (null if not loaded or unauthenticated) */
  socialProfile: SocialProfile | null;
  /** Whether the user has opted in to social features */
  isOptedIn: boolean;
  /** The user's display name for leaderboard */
  displayName: string;
  /** Whether the social profile is loading from Supabase */
  isLoading: boolean;
  /** Opt in to social features with a display name */
  optIn: (displayName: string) => Promise<void>;
  /** Opt out of social features (immediately hides from leaderboard) */
  optOut: () => Promise<void>;
  /** Update the display name */
  updateDisplayName: (name: string) => Promise<void>;
  /** Reload the social profile from Supabase */
  refreshProfile: () => Promise<void>;
}

const SocialContext = createContext<SocialContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface SocialProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for social identity state management.
 *
 * Place inside AuthProvider in the provider hierarchy (needs auth for user ID).
 * Integration into AppShell will happen in Plan 08.
 */
export function SocialProvider({ children }: SocialProviderProps) {
  const { user } = useAuth();
  const [socialProfile, setSocialProfile] = useState<SocialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const isOptedIn: boolean = useMemo(
    () => socialProfile?.socialOptIn ?? false,
    [socialProfile?.socialOptIn]
  );

  const displayName: string = useMemo(
    () => socialProfile?.displayName ?? user?.name ?? '',
    [socialProfile?.displayName, user?.name]
  );

  // -------------------------------------------------------------------------
  // Load social profile from Supabase on mount (when authenticated)
  // -------------------------------------------------------------------------
  const loadProfile = useCallback(async (userId: string): Promise<SocialProfile | null> => {
    const profile = await getSocialProfile(userId);
    return profile;
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setSocialProfile(null);
      return;
    }

    // Capture as const string for closure (TypeScript narrowing)
    const uid: string = user.id;
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      try {
        // Load social profile
        const profile = await loadProfile(uid);
        if (cancelled) return;

        if (profile) {
          setSocialProfile(profile);
        }

        // Sync streak data: load remote, merge with local, save merged
        const [remoteStreak, localStreak] = await Promise.all([
          loadStreakFromSupabase(uid),
          getStreakData(),
        ]);

        if (cancelled) return;

        if (remoteStreak) {
          const merged = mergeStreakData(localStreak, remoteStreak);
          await saveStreakData(merged);
          // Push merged data back to Supabase for consistency
          await syncStreakToSupabase(uid, merged);
        } else {
          // No remote data yet - push local to Supabase
          if (localStreak.activityDates.length > 0) {
            await syncStreakToSupabase(uid, localStreak);
          }
        }
      } catch (error) {
        captureError(error, { operation: 'SocialContext.init' });
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [user?.id, loadProfile]);

  // -------------------------------------------------------------------------
  // Visibility sync: re-pull all synced data when tab becomes visible
  // -------------------------------------------------------------------------
  useVisibilitySync(user?.id, {
    pullSettings: async () => {
      if (!user?.id) return;
      const remote = await loadSettingsFromSupabase(user.id);
      if (!remote) return;
      try {
        localStorage.setItem('civic-theme', remote.theme);
        localStorage.setItem('civic-test-language-mode', remote.languageMode);
        localStorage.setItem(
          'civic-prep-tts-settings',
          JSON.stringify({
            rate: remote.ttsRate,
            pitch: remote.ttsPitch,
            autoRead: remote.ttsAutoRead,
            autoReadLang: remote.ttsAutoReadLang,
            ...(() => {
              try {
                return {
                  preferredVoiceName: JSON.parse(
                    localStorage.getItem('civic-prep-tts-settings') ?? '{}'
                  ).preferredVoiceName,
                };
              } catch {
                return {};
              }
            })(),
          })
        );
        if (remote.testDate) {
          localStorage.setItem('civic-prep-test-date', remote.testDate);
        } else {
          localStorage.removeItem('civic-prep-test-date');
        }
      } catch {
        /* localStorage unavailable */
      }
    },
    pullBookmarks: async () => {
      if (!user?.id) return;
      const [remoteIds, localIds] = await Promise.all([
        loadBookmarksFromSupabase(user.id),
        getAllBookmarkIds(),
      ]);
      const merged = mergeBookmarks(localIds, remoteIds);
      const localSet = new Set(localIds);
      for (const id of merged) {
        if (!localSet.has(id)) {
          await persistBookmark(id, true);
        }
      }
    },
    pullStreaks: async () => {
      if (!user?.id) return;
      const [remoteStreak, localStreak] = await Promise.all([
        loadStreakFromSupabase(user.id),
        getStreakData(),
      ]);
      if (remoteStreak) {
        const merged = mergeStreakData(localStreak, remoteStreak);
        await saveStreakData(merged);
        syncStreakToSupabase(user.id, merged);
      }
    },
  });

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  /**
   * Opt in to social features with a display name.
   * Creates/updates the social profile with socialOptIn=true.
   */
  const optIn = useCallback(
    async (name: string) => {
      if (!user?.id) return;

      await upsertSocialProfile(user.id, {
        displayName: name,
        socialOptIn: true,
      });

      // Reload profile from Supabase to get the full row
      const updated = await getSocialProfile(user.id);
      if (updated) {
        setSocialProfile(updated);
      } else {
        // Optimistic fallback if reload fails
        setSocialProfile(prev => ({
          userId: user.id,
          displayName: name,
          socialOptIn: true,
          compositeScore: prev?.compositeScore ?? 0,
          currentStreak: prev?.currentStreak ?? 0,
          longestStreak: prev?.longestStreak ?? 0,
          topBadge: prev?.topBadge ?? null,
          isWeeklyWinner: prev?.isWeeklyWinner ?? false,
          createdAt: prev?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    },
    [user?.id]
  );

  /**
   * Opt out of social features.
   * Immediately hides from leaderboard (RLS handles visibility).
   */
  const optOut = useCallback(async () => {
    if (!user?.id) return;

    await toggleSocialOptIn(user.id, false);

    setSocialProfile(prev =>
      prev ? { ...prev, socialOptIn: false, updatedAt: new Date().toISOString() } : prev
    );
  }, [user?.id]);

  /**
   * Update the display name on the social profile.
   */
  const updateDisplayName = useCallback(
    async (name: string) => {
      if (!user?.id) return;

      await upsertSocialProfile(user.id, {
        displayName: name,
        socialOptIn: socialProfile?.socialOptIn ?? false,
      });

      setSocialProfile(prev =>
        prev ? { ...prev, displayName: name, updatedAt: new Date().toISOString() } : prev
      );
    },
    [user?.id, socialProfile?.socialOptIn]
  );

  /**
   * Reload the social profile from Supabase.
   */
  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      const profile = await getSocialProfile(user.id);
      if (profile) {
        setSocialProfile(profile);
      }
    } catch (error) {
      captureError(error, { operation: 'SocialContext.refreshProfile' });
    }
  }, [user?.id]);

  // -------------------------------------------------------------------------
  // No-op functions for unauthenticated users
  // -------------------------------------------------------------------------
  const noopAsync = useCallback(async () => {
    /* no-op */
  }, []);

  // -------------------------------------------------------------------------
  // Context value (memoized)
  // -------------------------------------------------------------------------
  const value: SocialContextValue = useMemo(() => {
    if (!user?.id) {
      return {
        socialProfile: null,
        isOptedIn: false,
        displayName: '',
        isLoading: false,
        optIn: noopAsync,
        optOut: noopAsync,
        updateDisplayName: noopAsync,
        refreshProfile: noopAsync,
      };
    }

    return {
      socialProfile,
      isOptedIn,
      displayName,
      isLoading,
      optIn,
      optOut,
      updateDisplayName,
      refreshProfile,
    };
  }, [
    user?.id,
    socialProfile,
    isOptedIn,
    displayName,
    isLoading,
    optIn,
    optOut,
    updateDisplayName,
    refreshProfile,
    noopAsync,
  ]);

  return <SocialContext.Provider value={value}>{children}</SocialContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Hook to access social context. Throws if used outside SocialProvider
 * because callers depend on social identity state (opt-in, display name, profile).
 *
 * Convention: THROWS (caller needs success)
 *
 * @throws Error if used outside SocialProvider
 * @returns SocialContextValue
 */
export function useSocial(): SocialContextValue {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}
