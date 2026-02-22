/**
 * Interview Sync - Supabase sync layer for interview sessions.
 *
 * Provides functions to sync interview session data to Supabase for
 * cross-device persistence. Individual question results stay in IndexedDB
 * only for simplicity; only aggregate session data is synced.
 *
 * Follows graceful degradation: sync failures are logged but never break UX.
 */

/*
 * -----------------------------------------------------------------------
 * Supabase Migration: Interview Sessions
 * Run this in Supabase SQL Editor
 * -----------------------------------------------------------------------
 *
 * CREATE TABLE IF NOT EXISTS interview_sessions (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES auth.users(id) NOT NULL,
 *   completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *   mode TEXT NOT NULL CHECK (mode IN ('realistic', 'practice')),
 *   score INTEGER NOT NULL,
 *   total_questions INTEGER NOT NULL DEFAULT 20,
 *   duration_seconds INTEGER NOT NULL,
 *   passed BOOLEAN NOT NULL,
 *   end_reason TEXT NOT NULL,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
 *
 * CREATE POLICY "Users can view own interview sessions"
 *   ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
 * CREATE POLICY "Users can insert own interview sessions"
 *   ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
 *
 * -----------------------------------------------------------------------
 */

import { supabase } from '@/lib/supabaseClient';
import { withRetry } from '@/lib/async';
import { captureError } from '@/lib/sentry';
import type { InterviewSession } from '@/types';
import type { InterviewSessionRow } from '@/types/supabase';

/**
 * Sync an interview session to Supabase.
 *
 * Inserts aggregate session data into the interview_sessions table.
 * Skips silently when offline (offline-first, data is in IndexedDB).
 * On error: logs to console, does not throw (sync failure should not break UX).
 */
export async function syncInterviewSession(
  session: InterviewSession,
  userId: string
): Promise<void> {
  // Skip if user is offline (offline-first approach)
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return;
  }

  try {
    await withRetry(
      async () => {
        const { error } = await supabase.from('interview_sessions').insert({
          user_id: userId,
          completed_at: session.date,
          mode: session.mode,
          score: session.score,
          total_questions: session.totalQuestions,
          duration_seconds: session.durationSeconds,
          passed: session.passed,
          end_reason: session.endReason,
        });

        if (error) throw error;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );
  } catch (err) {
    captureError(err, { operation: 'interviewSync.syncInterviewSession' });
  }
}

/**
 * Load interview history from Supabase.
 *
 * Queries the interview_sessions table for the given user, ordered by
 * completed_at descending, limited to the 20 most recent sessions.
 *
 * Maps InterviewSessionRow to InterviewSession format.
 * Note: Does NOT include individual question results (those stay in IndexedDB only).
 *
 * On error: returns empty array (graceful degradation).
 */
export async function loadInterviewHistoryFromSupabase(
  userId: string
): Promise<InterviewSession[]> {
  try {
    const data = await withRetry(
      async () => {
        const { data: result, error } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return result;
      },
      { maxAttempts: 3, baseDelayMs: 1000 }
    );

    if (!data) return [];

    return (data as InterviewSessionRow[]).map(row => ({
      id: row.id,
      date: row.completed_at,
      mode: row.mode as InterviewSession['mode'],
      score: row.score,
      totalQuestions: row.total_questions,
      durationSeconds: row.duration_seconds,
      passed: row.passed,
      endReason: row.end_reason as InterviewSession['endReason'],
      results: [], // Individual results not synced (IndexedDB only)
    }));
  } catch (err) {
    captureError(err, { operation: 'interviewSync.loadInterviewHistory', userId });
    return [];
  }
}
