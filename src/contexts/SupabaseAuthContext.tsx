'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { PostgrestError, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { captureError } from '@/lib/sentry';
import { createSaveSessionGuard } from '@/lib/saveSession';
import { queueTestResult } from '@/lib/pwa/offlineDb';
import { loadSettingsFromSupabase } from '@/lib/settings';
import {
  loadBookmarksFromSupabase,
  mergeBookmarks,
  getAllBookmarkIds,
  setBookmark,
} from '@/lib/bookmarks';
import type {
  QuestionResult,
  TestEndReason,
  TestSession,
  User,
  MockTestRow,
  MockTestResponseRow,
  UserMetadata,
} from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  authError: string | null;
  isSavingSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogleIdToken: (credential: string, nonce?: string) => Promise<void>;
  sendPasswordReset: (email: string, redirectTo: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  saveTestSession: (payload: Omit<TestSession, 'id'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PASS_THRESHOLD = 12;
const END_REASONS: TestEndReason[] = ['passThreshold', 'failThreshold', 'time', 'complete'];
const isEndReason = (value: unknown): value is TestEndReason =>
  typeof value === 'string' && END_REASONS.includes(value as TestEndReason);

const mapResponses = (test: MockTestRow): TestSession => {
  const results: QuestionResult[] = (test.mock_test_responses ?? []).map(
    (response: MockTestResponseRow): QuestionResult => ({
      questionId: response.question_id,
      questionText_en: response.question_en,
      questionText_my: response.question_my,
      selectedAnswer: {
        text_en: response.selected_answer_en,
        text_my: response.selected_answer_my,
        correct: Boolean(response.is_correct),
      },
      correctAnswer: {
        text_en: response.correct_answer_en,
        text_my: response.correct_answer_my,
        correct: true,
      },
      isCorrect: response.is_correct,
      category: response.category,
    })
  );

  const derivedScore = results.length
    ? results.filter(result => result.isCorrect).length
    : (test.score ?? 0);
  const totalQuestions = test.total_questions ?? (results.length || 20);
  const derivedIncorrect = test.incorrect_count ?? Math.max(totalQuestions - derivedScore, 0);
  const normalizedReason = isEndReason(test.end_reason) ? test.end_reason : 'complete';
  const passed = typeof test.passed === 'boolean' ? test.passed : derivedScore >= PASS_THRESHOLD;

  return {
    id: test.id,
    date: test.completed_at,
    score: derivedScore,
    totalQuestions,
    durationSeconds: test.duration_seconds ?? 0,
    passed,
    incorrectCount: derivedIncorrect,
    endReason: normalizedReason,
    results,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const saveGuardRef = useRef(createSaveSessionGuard());

  const syncProfile = useCallback(
    async (payload: { id: string; email: string; full_name: string }) => {
      const { error } = await supabase.from('profiles').upsert(payload);
      if (error && (error as PostgrestError).code !== '42501') {
        throw error;
      }
    },
    []
  );

  const hydrateFromSupabase = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    const authUser: SupabaseUser = session.user;
    const [profileResult, testsResult] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', authUser.id).maybeSingle(),
      supabase
        .from('mock_tests')
        .select(
          `id, completed_at, score, total_questions, duration_seconds, incorrect_count, end_reason, passed, mock_test_responses (
              question_id, question_en, question_my, category, selected_answer_en, selected_answer_my,
              correct_answer_en, correct_answer_my, is_correct
            )`
        )
        .eq('user_id', authUser.id)
        .order('completed_at', { ascending: false }),
    ]);

    // Log query errors but still hydrate the user with available data
    if (profileResult.error) {
      captureError(profileResult.error, { operation: 'AuthContext.hydrateFromSupabase.profile' });
    }
    if (testsResult.error) {
      captureError(testsResult.error, { operation: 'AuthContext.hydrateFromSupabase.tests' });
    }

    const history: TestSession[] = ((testsResult.data ?? []) as MockTestRow[]).map(mapResponses);

    setUser({
      id: authUser.id,
      email: authUser.email ?? '',
      name: profileResult.data?.full_name ?? authUser.email ?? 'Learner',
      testHistory: history,
    });
    setIsLoading(false);

    // Pull settings from Supabase (server wins) -- Phase 46
    loadSettingsFromSupabase(authUser.id)
      .then(remoteSettings => {
        if (!remoteSettings) return;
        // Write synced values to existing localStorage keys
        // so contexts hydrate correctly on next mount
        try {
          localStorage.setItem('civic-theme', remoteSettings.theme);
          localStorage.setItem('civic-test-language-mode', remoteSettings.languageMode);
          localStorage.setItem(
            'civic-prep-tts-settings',
            JSON.stringify({
              rate: remoteSettings.ttsRate,
              pitch: remoteSettings.ttsPitch,
              autoRead: remoteSettings.ttsAutoRead,
              autoReadLang: remoteSettings.ttsAutoReadLang,
              // Preserve device-local preferredVoiceName
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
          if (remoteSettings.testDate) {
            localStorage.setItem('civic-prep-test-date', remoteSettings.testDate);
          } else {
            localStorage.removeItem('civic-prep-test-date');
          }
        } catch {
          // localStorage unavailable
        }
      })
      .catch(() => {
        /* silent -- settings pull failure is non-critical */
      });

    // Pull and merge bookmarks from Supabase (add-wins) -- Phase 46
    Promise.all([loadBookmarksFromSupabase(authUser.id), getAllBookmarkIds()])
      .then(async ([remoteIds, localIds]) => {
        const merged = mergeBookmarks(localIds, remoteIds);

        // Write merged set to IndexedDB (add any remote IDs not in local)
        const localSet = new Set(localIds);
        for (const id of merged) {
          if (!localSet.has(id)) {
            await setBookmark(id, true);
          }
        }

        // Push merged set back to Supabase for consistency
        if (merged.length > localIds.length || merged.length > remoteIds.length) {
          const { syncBookmarksToSupabase } = await import('@/lib/bookmarks');
          syncBookmarksToSupabase(authUser.id, merged);
        }
      })
      .catch(() => {
        /* silent -- bookmark pull failure is non-critical */
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        await hydrateFromSupabase(data.session ?? null);
      } catch (error) {
        captureError(error, { operation: 'AuthContext.bootstrap' });
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };
    bootstrap();

    // IMPORTANT: Supabase holds a lock during onAuthStateChange processing.
    // Making async Supabase API calls (e.g. .from().select()) inside this
    // callback creates a deadlock. Defer with setTimeout(0) so the lock is
    // released before hydrateFromSupabase runs its queries.
    // See: https://supabase.com/docs/reference/javascript/auth-onauthstatechange
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        if (!mounted) return;
        hydrateFromSupabase(session).catch((error: unknown) => {
          captureError(error, { operation: 'AuthContext.onAuthStateChange' });
        });
      }, 0);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [hydrateFromSupabase]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      if (data.user) {
        await syncProfile({ id: data.user.id, email, full_name: name });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          await hydrateFromSupabase(sessionData.session);
        }
      }
    },
    [hydrateFromSupabase, syncProfile]
  );

  const loginWithGoogleIdToken = useCallback(
    async (credential: string, nonce?: string) => {
      setAuthError(null);
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
        nonce,
      });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      if (data?.user) {
        await syncProfile({
          id: data.user.id,
          email: data.user.email ?? '',
          full_name:
            (data.user.user_metadata as UserMetadata)?.full_name ?? data.user.email ?? 'Learner',
        });
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          await hydrateFromSupabase(sessionData.session);
        }
      }
    },
    [hydrateFromSupabase, syncProfile]
  );

  const sendPasswordReset = useCallback(async (email: string, redirectTo: string) => {
    setAuthError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const updatePassword = useCallback(
    async (newPassword: string) => {
      setAuthError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setAuthError(error.message);
        throw error;
      }
      const { data } = await supabase.auth.getSession();
      await hydrateFromSupabase(data.session ?? null);
    },
    [hydrateFromSupabase]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const saveTestSession = useCallback(
    async (session: Omit<TestSession, 'id'>) => {
      if (!user) {
        throw new Error('User must be signed in to save a mock test');
      }

      const guard = saveGuardRef.current;

      await guard.save(async () => {
        setIsSavingSession(true);
        try {
          await syncProfile({ id: user.id, email: user.email, full_name: user.name });

          const { data, error } = await supabase
            .from('mock_tests')
            .insert({
              user_id: user.id,
              completed_at: session.date,
              score: session.score,
              total_questions: session.totalQuestions,
              duration_seconds: session.durationSeconds,
              incorrect_count: session.incorrectCount,
              end_reason: session.endReason,
              passed: session.passed,
            })
            .select(
              'id, completed_at, score, total_questions, duration_seconds, incorrect_count, end_reason, passed'
            )
            .single();

          if (error || !data?.id) {
            throw error ?? new Error('Unable to persist mock test');
          }

          const responsesPayload = session.results.map(result => ({
            mock_test_id: data.id,
            question_id: result.questionId,
            question_en: result.questionText_en,
            question_my: result.questionText_my,
            category: result.category,
            selected_answer_en: result.selectedAnswer.text_en,
            selected_answer_my: result.selectedAnswer.text_my,
            correct_answer_en: result.correctAnswer.text_en,
            correct_answer_my: result.correctAnswer.text_my,
            is_correct: result.isCorrect,
          }));

          if (responsesPayload.length) {
            const { error: responsesError } = await supabase
              .from('mock_test_responses')
              .insert(responsesPayload);
            if (responsesError) throw responsesError;
          }

          const persistedSession: TestSession = {
            ...session,
            id: data.id,
            date: data.completed_at ?? session.date,
            incorrectCount: data.incorrect_count ?? session.incorrectCount,
            endReason: isEndReason(data.end_reason) ? data.end_reason : session.endReason,
            passed: typeof data.passed === 'boolean' ? data.passed : session.passed,
          };

          setUser(prev =>
            prev ? { ...prev, testHistory: [persistedSession, ...prev.testHistory] } : prev
          );
          await hydrateFromSupabase((await supabase.auth.getSession()).data.session ?? null);
        } catch (error) {
          // Detect network/offline errors and queue for later sync
          const isNetworkError =
            !navigator.onLine ||
            (error instanceof TypeError &&
              (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) ||
            (error instanceof Error && error.message.includes('NetworkError'));

          if (isNetworkError) {
            // Queue for offline sync via IndexedDB
            await queueTestResult({
              userId: user.id,
              completedAt: session.date,
              score: session.score,
              totalQuestions: session.totalQuestions,
              durationSeconds: session.durationSeconds,
              incorrectCount: session.incorrectCount,
              passed: session.passed,
              endReason: session.endReason,
              responses: session.results.map(r => ({
                questionId: r.questionId,
                questionText_en: r.questionText_en,
                questionText_my: r.questionText_my,
                category: r.category,
                selectedAnswer_en: r.selectedAnswer.text_en,
                selectedAnswer_my: r.selectedAnswer.text_my,
                correctAnswer_en: r.correctAnswer.text_en,
                correctAnswer_my: r.correctAnswer.text_my,
                isCorrect: r.isCorrect,
              })),
            });

            // Add to local testHistory immediately so the user sees the result
            const offlineSession: TestSession = {
              ...session,
              id: `offline-${Date.now()}`,
            };
            setUser(prev =>
              prev ? { ...prev, testHistory: [offlineSession, ...prev.testHistory] } : prev
            );
            // Return normally — caller shows success as usual
            return;
          }

          // Non-network errors still propagate
          captureError(error, { operation: 'AuthContext.saveTestSession' });
          throw error;
        } finally {
          setIsSavingSession(false);
        }
      });

      // Reset guard for next test
      guard.reset();
    },
    [hydrateFromSupabase, syncProfile, user]
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      authError,
      isSavingSession,
      login,
      register,
      loginWithGoogleIdToken,
      sendPasswordReset,
      updatePassword,
      logout,
      saveTestSession,
    }),
    [
      authError,
      isLoading,
      isSavingSession,
      login,
      loginWithGoogleIdToken,
      logout,
      register,
      saveTestSession,
      sendPasswordReset,
      updatePassword,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context. Throws if used outside AuthProvider
 * because callers depend on auth state (user, login, session saving).
 *
 * Convention: THROWS (caller needs success)
 *
 * @throws Error if used outside AuthProvider
 * @returns AuthContextValue
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
