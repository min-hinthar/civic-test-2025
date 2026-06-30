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
import {
  loadSettingsRowFromSupabase,
  gatherCurrentSettings,
  mapRowToSettings,
  syncSettingsToSupabase,
} from '@/lib/settings';
import {
  getSettingsTimestamps,
  getDirtyFlags,
  clearDirtyFlags,
  mergeSettingsWithTimestamps,
} from '@/lib/settings/settingsTimestamps';
import {
  loadBookmarksFromSupabase,
  mergeBookmarks,
  getAllBookmarkIds,
  setBookmark,
} from '@/lib/bookmarks';
import { getGuestTestHistory, addGuestTestSession } from '@/lib/testHistory/guestTestHistory';
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
  /**
   * Mock-test history for the current visitor. For signed-in users this is
   * `user.testHistory` (synced with Supabase); for guests it is their
   * locally-stored history. Consumers should read this instead of
   * `user?.testHistory` so guest progress surfaces too.
   */
  testHistory: TestSession[];
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
/** Max wait for the initial session fetch AND for profile/history hydration
 *  before falling back to guest mode (local history) so study still works.
 *  A session that hydrates later is picked up by the late-recovery path or
 *  the next onAuthStateChange event. */
const AUTH_FETCH_TIMEOUT_MS = 8000;
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
  // Locally-stored mock-test history for guests (no account). Ignored once
  // a Supabase user is present, where user.testHistory is the source of truth.
  const [guestHistory, setGuestHistory] = useState<TestSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSavingSession, setIsSavingSession] = useState(false);
  const saveGuardRef = useRef(createSaveSessionGuard());
  // Tracks whether a real signed-in user has been hydrated, so the bootstrap
  // timeout/error fallback never clobbers an active session with guest mode.
  const hydratedRef = useRef(false);
  // Monotonic counter bumped on every hydrate call AND on sign-out. A hydrate
  // captures its value up front; an async result (notably the post-timeout late
  // recovery) only applies if the counter is unchanged, so a stale in-flight
  // query can never resurrect a signed-out session or clobber a newer hydrate.
  const hydrationGenerationRef = useRef(0);
  // Identity of the underlying Supabase session, tracked independently of the
  // hydrated `user`. During a guest-fallback window (session valid but
  // profile/history hydration timed out) `user` is null yet a real account
  // exists; saveTestSession reads this so a signed-in user's mock test still
  // targets their account (queued offline if the backend is down) instead of
  // being orphaned in local guest storage. Null only for genuine guests.
  const sessionIdentityRef = useRef<{ id: string; email: string; name: string } | null>(null);

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
    // Claim this hydration's generation so async results can detect if a newer
    // hydrate (or a sign-out) has since superseded them.
    const generation = ++hydrationGenerationRef.current;
    if (!session?.user) {
      sessionIdentityRef.current = null;
      setUser(null);
      // Guest visitor: surface any locally-stored mock-test history so the
      // app works fully without an account (and even if Supabase is down).
      setGuestHistory(getGuestTestHistory());
      setIsLoading(false);
      return;
    }
    const authUser: SupabaseUser = session.user;
    // Record the session identity before any timeout, so saves during a
    // guest-fallback window still target this account.
    sessionIdentityRef.current = {
      id: authUser.id,
      email: authUser.email ?? '',
      name: (authUser.user_metadata as UserMetadata)?.full_name ?? authUser.email ?? 'Learner',
    };

    // Bound the profile/history queries with the same timeout as getSession, so
    // a paused/unreachable backend can't pin a cached signed-in user on the
    // loading spinner. On timeout, fall back to GUEST mode (local history) so
    // the app stays fully usable, but keep awaiting the in-flight queries: if
    // they finish (a transient slow network, not a full outage), promote to the
    // real signed-in user. A full outage simply leaves the queries pending and
    // the user in guest mode until the next auth event re-runs hydration.
    const HYDRATE_TIMEOUT = { timedOut: true } as const;
    let hydrateTimeoutId: ReturnType<typeof setTimeout> | undefined;
    const hydrateTimeout = new Promise<typeof HYDRATE_TIMEOUT>(resolve => {
      hydrateTimeoutId = setTimeout(() => resolve(HYDRATE_TIMEOUT), AUTH_FETCH_TIMEOUT_MS);
    });
    const queriesPromise = Promise.all([
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
    const queryResult = await Promise.race([
      queriesPromise.then(results => ({ timedOut: false as const, results })),
      hydrateTimeout,
    ]);
    if (hydrateTimeoutId) clearTimeout(hydrateTimeoutId);

    let resolved: Awaited<typeof queriesPromise>;
    if (queryResult.timedOut) {
      // Backend hung past the timeout: fall back to guest mode NOW so the app is
      // fully usable with local history instead of stuck loading. Guard on the
      // hydrated flag so a concurrent hydrate that already populated a real user
      // is never downgraded to guest.
      if (!hydratedRef.current) {
        setUser(null);
        setGuestHistory(getGuestTestHistory());
        setIsLoading(false);
      }
      // The queries are still in flight. Keep waiting: if they finish (a
      // transient slow network rather than a full outage), promote to the real
      // signed-in user below instead of leaving the user as a guest until the
      // next token refresh. If they reject, stay in guest mode. Mock tests saved
      // while in guest mode persist to local history (guest->account migration
      // is a separate, deferred concern).
      try {
        resolved = await queriesPromise;
      } catch (error) {
        captureError(error, { operation: 'AuthContext.hydrateFromSupabase.lateRecover' });
        return;
      }
      // A newer hydrate or a sign-out superseded this one while we waited: a
      // stale result must not resurrect a signed-out session or clobber it.
      if (generation !== hydrationGenerationRef.current) return;
    } else {
      resolved = queryResult.results;
    }

    const [profileResult, testsResult] = resolved;

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
    hydratedRef.current = true;
    setIsLoading(false);

    // Pull settings with per-field LWW merge (Phase 50: ARCH-03)
    loadSettingsRowFromSupabase(authUser.id)
      .then(remoteRow => {
        if (!remoteRow) return;

        const local = gatherCurrentSettings();
        const localTimestamps = getSettingsTimestamps();
        const localDirty = getDirtyFlags();
        const remote = mapRowToSettings(remoteRow);

        const { merged, changedFields } = mergeSettingsWithTimestamps({
          local,
          localTimestamps,
          localDirty,
          remote,
          remoteUpdatedAt: remoteRow.updated_at,
        });

        // Only write changed fields to localStorage
        if (changedFields.length > 0) {
          try {
            if (changedFields.includes('theme')) {
              localStorage.setItem('civic-theme', merged.theme);
            }
            if (changedFields.includes('languageMode')) {
              localStorage.setItem('civic-test-language-mode', merged.languageMode);
            }
            if (
              changedFields.includes('ttsRate') ||
              changedFields.includes('ttsPitch') ||
              changedFields.includes('ttsAutoRead') ||
              changedFields.includes('ttsAutoReadLang')
            ) {
              localStorage.setItem(
                'civic-prep-tts-settings',
                JSON.stringify({
                  rate: merged.ttsRate,
                  pitch: merged.ttsPitch,
                  autoRead: merged.ttsAutoRead,
                  autoReadLang: merged.ttsAutoReadLang,
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
            }
            if (changedFields.includes('testDate')) {
              if (merged.testDate) {
                localStorage.setItem('civic-prep-test-date', merged.testDate);
              } else {
                localStorage.removeItem('civic-prep-test-date');
              }
            }
          } catch {
            // localStorage unavailable
          }
        }

        // Clear dirty flags after successful merge
        clearDirtyFlags();

        // Push merged result back to Supabase for consistency
        syncSettingsToSupabase(authUser.id, merged);
      })
      .catch(() => {
        /* silent -- settings merge failure is non-critical */
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
        // Guard against a hung/unreachable auth backend (e.g. a paused or
        // suspended Supabase project): if getSession doesn't resolve quickly,
        // fall back to guest mode so study still works. A real session that
        // arrives later is still picked up by onAuthStateChange below — and the
        // fallback must never clobber a user that has already been hydrated.
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const sessionTimeout = new Promise<{ session: Session | null; timedOut: true }>(resolve => {
          timeoutId = setTimeout(
            () => resolve({ session: null, timedOut: true }),
            AUTH_FETCH_TIMEOUT_MS
          );
        });
        const result = await Promise.race([
          supabase.auth
            .getSession()
            .then(r => ({ session: r.data.session ?? null, timedOut: false as const })),
          sessionTimeout,
        ]);
        if (timeoutId) clearTimeout(timeoutId);
        if (!mounted) return;
        if (result.timedOut) {
          // getSession hung. Only drop to guest mode if nothing has hydrated a
          // signed-in user yet; otherwise leave the active session intact.
          if (!hydratedRef.current) {
            setUser(null);
            setGuestHistory(getGuestTestHistory());
            setIsLoading(false);
          }
          return;
        }
        await hydrateFromSupabase(result.session);
      } catch (error) {
        captureError(error, { operation: 'AuthContext.bootstrap' });
        if (mounted && !hydratedRef.current) {
          setUser(null);
          setGuestHistory(getGuestTestHistory());
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
        // Supersede any in-flight hydrate (incl. a post-timeout late recovery)
        // so its stale result can't resurrect this signed-out session.
        hydrationGenerationRef.current += 1;
        sessionIdentityRef.current = null;
        // Clear the hydrated latch so a later sign-in whose hydration times out
        // can still fall back to guest mode (the guard is a "real user already
        // present" check; after sign-out no real user is present).
        hydratedRef.current = false;
        setUser(null);
        // Re-read local guest history so the post-sign-out view reflects this
        // device's actual stored history (not a stale value from boot).
        setGuestHistory(getGuestTestHistory());
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
      // Resolve the account to save under. Prefer the hydrated `user`, but fall
      // back to the underlying session identity so a signed-in user whose
      // hydration timed out (guest-fallback window) still saves to their
      // account — not to local guest storage, which would orphan the result.
      const account = user ?? sessionIdentityRef.current;
      if (!account) {
        // Genuine guest (no account): persist the mock test locally so anyone
        // can study with full functionality without signing in.
        const updated = addGuestTestSession(session);
        setGuestHistory(updated);
        return;
      }

      const guard = saveGuardRef.current;

      await guard.save(async () => {
        setIsSavingSession(true);
        try {
          await syncProfile({ id: account.id, email: account.email, full_name: account.name });

          const { data, error } = await supabase
            .from('mock_tests')
            .insert({
              user_id: account.id,
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
              userId: account.id,
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
      testHistory: user?.testHistory ?? guestHistory,
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
      guestHistory,
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
