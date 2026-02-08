/**
 * Social Profile Sync - Supabase sync layer for social profiles.
 *
 * Manages the social_profiles table which controls leaderboard visibility,
 * display names, and composite scores. Follows fire-and-forget pattern:
 * sync failures are logged but never break UX.
 *
 * RLS policies on social_profiles:
 * - SELECT: anyone can view opted-in profiles; users can view own profile
 * - INSERT/UPDATE: users can only manage their own profile
 */

import { supabase } from '@/lib/supabaseClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Social profile as consumed by the app (camelCase) */
export interface SocialProfile {
  userId: string;
  displayName: string;
  socialOptIn: boolean;
  compositeScore: number;
  currentStreak: number;
  longestStreak: number;
  topBadge: string | null;
  isWeeklyWinner: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Row shape from the social_profiles Supabase table */
interface SocialProfileRow {
  user_id: string;
  display_name: string;
  social_opt_in: boolean;
  composite_score: number;
  current_streak: number;
  longest_streak: number;
  top_badge: string | null;
  is_weekly_winner: boolean;
  weekly_score_updated_at: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/**
 * Get a user's social profile from Supabase.
 *
 * Returns null if no profile exists or on error.
 * Note: RLS allows users to view their own profile regardless of opt-in status.
 */
export async function getSocialProfile(userId: string): Promise<SocialProfile | null> {
  try {
    const { data, error } = await supabase
      .from('social_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[socialProfileSync] Failed to get social profile:', error.message);
      return null;
    }

    if (!data) return null;

    const row = data as SocialProfileRow;

    return {
      userId: row.user_id,
      displayName: row.display_name,
      socialOptIn: row.social_opt_in,
      compositeScore: Number(row.composite_score),
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      topBadge: row.top_badge,
      isWeeklyWinner: row.is_weekly_winner,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (err) {
    console.error('[socialProfileSync] Unexpected error getting social profile:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

/**
 * Upsert a user's social profile with display name and opt-in status.
 *
 * Creates the profile if it doesn't exist, updates if it does.
 * Skips silently when offline.
 */
export async function upsertSocialProfile(
  userId: string,
  data: { displayName: string; socialOptIn: boolean }
): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    const { error } = await supabase.from('social_profiles').upsert({
      user_id: userId,
      display_name: data.displayName,
      social_opt_in: data.socialOptIn,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error('[socialProfileSync] Failed to upsert social profile:', error.message);
    }
  } catch (err) {
    console.error('[socialProfileSync] Unexpected error upserting social profile:', err);
  }
}

/**
 * Update composite score and streak data on the social profile.
 *
 * Called after activity completion to keep leaderboard data current.
 * Skips silently when offline.
 */
export async function updateCompositeScore(
  userId: string,
  score: number,
  streak: number,
  topBadge: string | null
): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    const { error } = await supabase
      .from('social_profiles')
      .update({
        composite_score: score,
        current_streak: streak,
        top_badge: topBadge,
        weekly_score_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('[socialProfileSync] Failed to update composite score:', error.message);
    }
  } catch (err) {
    console.error('[socialProfileSync] Unexpected error updating composite score:', err);
  }
}

/**
 * Toggle social opt-in status.
 *
 * When opting out (optIn=false), this immediately hides the user from the
 * leaderboard (RLS policies filter by social_opt_in = true).
 * Skips silently when offline.
 */
export async function toggleSocialOptIn(userId: string, optIn: boolean): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    const { error } = await supabase
      .from('social_profiles')
      .update({
        social_opt_in: optIn,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('[socialProfileSync] Failed to toggle social opt-in:', error.message);
    }
  } catch (err) {
    console.error('[socialProfileSync] Unexpected error toggling social opt-in:', err);
  }
}
