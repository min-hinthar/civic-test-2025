/**
 * Unit tests for SupabaseAuthContext / AuthProvider.
 *
 * Covers: login/register/logout, session hydration, auth state change handling,
 * saveTestSession, isLoading lifecycle, error reporting, offline queueing,
 * settings merge on login, bookmark merge on login.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/renderWithProviders';

// ---------------------------------------------------------------------------
// Hoisted mocks for fine-grained control
// ---------------------------------------------------------------------------

const {
  mockGetSession,
  mockOnAuthStateChange,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
  mockFromChain,
} = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
  mockFromChain: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mocks (full set)
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      signInWithIdToken: vi
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Not configured' } }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
    },
    from: mockFromChain,
  },
}));

vi.mock('idb-keyval', () => ({
  get: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  keys: vi.fn().mockResolvedValue([]),
  entries: vi.fn().mockResolvedValue([]),
}));

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/sentry', () => ({ captureError: vi.fn() }));

vi.mock('@/lib/settings', () => ({
  gatherCurrentSettings: vi.fn().mockReturnValue({}),
  syncSettingsToSupabase: vi.fn(),
  loadSettingsFromSupabase: vi.fn().mockResolvedValue(null),
  loadSettingsRowFromSupabase: vi.fn().mockResolvedValue(null),
  mapRowToSettings: vi.fn().mockReturnValue({}),
}));

vi.mock('@/lib/settings/settingsTimestamps', () => ({
  setFieldTimestamp: vi.fn(),
  markFieldDirty: vi.fn(),
  getSettingsTimestamps: vi.fn().mockReturnValue({}),
  getDirtyFlags: vi.fn().mockReturnValue({}),
  clearDirtyFlags: vi.fn(),
  mergeSettingsWithTimestamps: vi.fn().mockReturnValue({ merged: {}, changedFields: [] }),
}));

vi.mock('@/lib/bookmarks', () => ({
  loadBookmarksFromSupabase: vi.fn().mockResolvedValue([]),
  mergeBookmarks: vi.fn().mockReturnValue([]),
  getAllBookmarkIds: vi.fn().mockResolvedValue([]),
  setBookmark: vi.fn().mockResolvedValue(undefined),
  syncBookmarksToSupabase: vi.fn(),
}));

vi.mock('@/lib/saveSession', () => ({
  createSaveSessionGuard: vi.fn().mockReturnValue({
    save: vi.fn((fn: () => Promise<void>) => fn()),
    reset: vi.fn(),
  }),
}));

vi.mock('@/lib/pwa/offlineDb', () => ({
  cacheQuestions: vi.fn().mockResolvedValue(undefined),
  getCachedQuestions: vi.fn().mockResolvedValue([]),
  hasQuestionsCache: vi.fn().mockResolvedValue(false),
  queueTestResult: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/pwa/syncQueue', () => ({
  syncAllPendingResults: vi.fn().mockResolvedValue({ synced: 0, failed: 0 }),
  getPendingSyncCount: vi.fn().mockResolvedValue(0),
}));

vi.mock('@/constants/questions', () => ({ allQuestions: [] }));
vi.mock('@/lib/async', () => ({ withRetry: vi.fn((fn: () => Promise<unknown>) => fn()) }));

vi.mock('@/lib/srs', () => ({
  createNewSRSCard: vi.fn(),
  gradeCard: vi.fn(),
  isDue: vi.fn().mockReturnValue(false),
  getNextReviewText: vi.fn(),
  getAllSRSCards: vi.fn().mockResolvedValue([]),
  setSRSCard: vi.fn().mockResolvedValue(undefined),
  removeSRSCard: vi.fn().mockResolvedValue(undefined),
  syncPendingSRSReviews: vi.fn().mockResolvedValue(undefined),
  pullSRSCards: vi.fn().mockResolvedValue([]),
  pushSRSCards: vi.fn().mockResolvedValue(undefined),
  mergeSRSDecks: vi.fn().mockReturnValue([]),
  queueSRSSync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/social/socialProfileSync', () => ({
  getSocialProfile: vi.fn().mockResolvedValue(null),
  toggleSocialOptIn: vi.fn().mockResolvedValue(undefined),
  upsertSocialProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/social/streakSync', () => ({
  loadStreakFromSupabase: vi.fn().mockResolvedValue(null),
  mergeStreakData: vi.fn().mockReturnValue({ activityDates: [] }),
  syncStreakToSupabase: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/social/streakStore', () => ({
  getStreakData: vi.fn().mockResolvedValue({ activityDates: [] }),
  saveStreakData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/hooks/useVisibilitySync', () => ({ useVisibilitySync: vi.fn() }));
vi.mock('@/lib/haptics', () => ({ hapticLight: vi.fn(), hapticMedium: vi.fn() }));
vi.mock('@/lib/sessions/sessionStore', () => ({
  cleanExpiredSessions: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/lib/historyGuard', () => ({ installHistoryGuard: vi.fn() }));
vi.mock('@/lib/useViewportHeight', () => ({ useViewportHeight: vi.fn() }));

vi.mock('@/lib/ttsCore', () => ({
  createTTSEngine: vi.fn().mockReturnValue({
    isSupported: vi.fn().mockReturnValue(true),
    onStateChange: vi.fn().mockReturnValue(vi.fn()),
    destroy: vi.fn(),
    refreshVoices: vi.fn().mockResolvedValue([]),
    setDefaults: vi.fn(),
  }),
  loadVoices: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/errorSanitizer', () => ({
  sanitizeError: vi.fn().mockReturnValue({ en: 'Error', my: 'Error' }),
  sanitizeForSentry: vi.fn().mockReturnValue({ error: { message: 'Error' }, context: {} }),
}));

vi.mock('@/components/navigation/useMediaTier', () => ({
  useMediaTier: vi.fn().mockReturnValue('mobile'),
}));

vi.mock('@/components/navigation/useNavBadges', () => ({
  useNavBadges: vi.fn().mockReturnValue({ srs: 0 }),
}));

vi.mock('@/lib/useScrollDirection', () => ({
  useScrollDirection: vi.fn().mockReturnValue(true),
}));

vi.mock('@/data/state-representatives.json', () => ({ default: {} }));

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ref }: { children?: React.ReactNode; ref?: React.Ref<HTMLDivElement> }) => (
      <div ref={ref}>{children}</div>
    ),
  },
  useMotionValue: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(0),
    set: vi.fn(),
    on: vi.fn().mockReturnValue(vi.fn()),
  }),
  useTransform: vi.fn().mockReturnValue({ get: vi.fn().mockReturnValue(1) }),
  useAnimate: vi.fn().mockReturnValue([{ current: null }, vi.fn().mockResolvedValue(undefined)]),
}));

// requestIdleCallback polyfill for jsdom
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  (window as unknown as Record<string, unknown>).requestIdleCallback = (cb: () => void) =>
    setTimeout(cb, 0);
  (window as unknown as Record<string, unknown>).cancelIdleCallback = (id: number) =>
    clearTimeout(id);
}

// Enhanced speechSynthesis mock
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'speechSynthesis', {
    writable: true,
    configurable: true,
    value: {
      speak: vi.fn(),
      cancel: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onvoiceschanged: null,
      paused: false,
      pending: false,
      speaking: false,
    },
  });
}

// ---------------------------------------------------------------------------
// Consumer component
// ---------------------------------------------------------------------------

import { useAuth } from '@/contexts/SupabaseAuthContext';

function AuthConsumer() {
  const {
    user,
    testHistory,
    isLoading,
    authError,
    isSavingSession,
    login,
    register,
    logout,
    saveTestSession,
  } = useAuth();

  return (
    <div>
      <div data-testid="user-id">{user?.id ?? 'no-user'}</div>
      <div data-testid="user-name">{user?.name ?? 'no-name'}</div>
      <div data-testid="user-email">{user?.email ?? 'no-email'}</div>
      <div data-testid="is-loading">{String(isLoading)}</div>
      <div data-testid="auth-error">{authError ?? 'no-error'}</div>
      <div data-testid="is-saving">{String(isSavingSession)}</div>
      <div data-testid="test-history-count">{user?.testHistory?.length ?? 0}</div>
      <div data-testid="ctx-test-history-count">{testHistory.length}</div>
      <button
        data-testid="login"
        onClick={() => login('test@example.com', 'password').catch(() => {})}
      >
        Login
      </button>
      <button
        data-testid="register"
        onClick={() => register('Test User', 'test@example.com', 'password').catch(() => {})}
      >
        Register
      </button>
      <button data-testid="logout" onClick={() => logout()}>
        Logout
      </button>
      <button
        data-testid="save-guest-test"
        onClick={() =>
          saveTestSession({
            date: '2026-06-30T00:00:00.000Z',
            score: 18,
            totalQuestions: 20,
            durationSeconds: 300,
            passed: true,
            incorrectCount: 2,
            endReason: 'complete',
            results: [],
          }).catch(() => {})
        }
      >
        Save Guest Test
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a standard Supabase `from()` chain mock */
function buildFromMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsert: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockReturnThis(),
  };
  return chain;
}

function setupDefaultFromMock() {
  const chain = buildFromMock();
  mockFromChain.mockReturnValue(chain);
  return chain;
}

function setupSessionMock(userId = 'test-user-id', email = 'test@example.com') {
  const session = {
    user: {
      id: userId,
      email,
      user_metadata: { full_name: 'Test User' },
    },
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
  };

  mockGetSession.mockResolvedValue({
    data: { session },
    error: null,
  });

  mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
    setTimeout(() => {
      cb('INITIAL_SESSION', session);
    }, 0);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });

  return session;
}

function setupNoSession() {
  mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SupabaseAuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupNoSession();
    setupDefaultFromMock();
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockSignUp.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with user=null and isLoading=true', () => {
    // Override getSession to never resolve
    mockGetSession.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });

  it('session hydration: getSession returns session -> user populated', async () => {
    setupSessionMock();
    const chain = setupDefaultFromMock();
    chain.maybeSingle.mockResolvedValue({
      data: { full_name: 'Test User' },
      error: null,
    });

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('no session: getSession returns null -> user=null, isLoading=false', async () => {
    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('login calls supabase.auth.signInWithPassword with correct args', async () => {
    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('login'));
    });

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
  });

  it('login error: sets authError to error message', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid credentials' },
    });

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('register calls supabase.auth.signUp with metadata', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: 'new-user',
          email: 'test@example.com',
          user_metadata: { full_name: 'Test User' },
        },
      },
      error: null,
    });

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('register'));
    });

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
      options: { data: { full_name: 'Test User' } },
    });
  });

  it('logout calls supabase.auth.signOut and clears user state', async () => {
    setupSessionMock();

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('logout'));
    });

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
    });
  });

  it('onAuthStateChange SIGNED_OUT event clears user', async () => {
    let authChangeCallback: (event: string, session: unknown) => void;

    // Setup: user hydrated from getSession (synchronous path, no setTimeout race)
    setupSessionMock();
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      authChangeCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    // Wait for bootstrap to hydrate user from getSession
    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    });

    // Now fire SIGNED_OUT -- direct call, no deferred hydration for this event
    await act(async () => {
      authChangeCallback!('SIGNED_OUT', null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
    });
  });

  it('isLoading lifecycle: true on init, false after hydration', async () => {
    let resolveSession!: (v: unknown) => void;
    mockGetSession.mockReturnValue(
      new Promise(resolve => {
        resolveSession = resolve;
      })
    );

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    // isLoading starts true
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    // Resolve with no session
    await act(async () => {
      resolveSession({ data: { session: null }, error: null });
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('authError cleared on successful login after previous error', async () => {
    // First: login fails
    mockSignInWithPassword.mockResolvedValueOnce({
      error: { message: 'Bad creds' },
    });

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('Bad creds');
    });

    // Second: login succeeds
    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    await act(async () => {
      fireEvent.click(screen.getByTestId('login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-error')).toHaveTextContent('no-error');
    });
  });

  it('settings merge on login: loadSettingsRowFromSupabase called', async () => {
    setupSessionMock();
    const { loadSettingsRowFromSupabase } = await import('@/lib/settings');

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    });

    // Settings pull is fire-and-forget, give it time
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(loadSettingsRowFromSupabase).toHaveBeenCalledWith('test-user-id');
  });

  it('bookmark merge on login: loadBookmarksFromSupabase called', async () => {
    setupSessionMock();
    const { loadBookmarksFromSupabase } = await import('@/lib/bookmarks');

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    });

    // Bookmark pull is fire-and-forget
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(loadBookmarksFromSupabase).toHaveBeenCalledWith('test-user-id');
  });

  it('deferred hydration timing: setTimeout(0) for onAuthStateChange', async () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    setupSessionMock();

    renderWithProviders(<AuthConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
    });

    // Verify setTimeout was used (deferred hydration pattern - G4)
    expect(setTimeoutSpy).toHaveBeenCalled();
    setTimeoutSpy.mockRestore();
  });

  describe('hydration timeout', () => {
    // AUTH_FETCH_TIMEOUT_MS in SupabaseAuthContext (not exported).
    const AUTH_TIMEOUT = 8000;

    it('late recovery: queries resolving after the timeout promote guest -> signed-in', async () => {
      vi.useFakeTimers();
      try {
        const session = {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        };
        mockGetSession.mockResolvedValue({ data: { session }, error: null });
        // No INITIAL_SESSION emission -> only the bootstrap hydrate runs.
        mockOnAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        });

        // Profile + mock_tests queries stay pending until we resolve them, so the
        // hydrate races them against the timeout and loses.
        let resolveProfile!: (v: unknown) => void;
        let resolveTests!: (v: unknown) => void;
        const chain = buildFromMock();
        chain.maybeSingle.mockReturnValue(
          new Promise(r => {
            resolveProfile = r;
          })
        );
        chain.order.mockReturnValue(
          new Promise(r => {
            resolveTests = r;
          })
        );
        mockFromChain.mockReturnValue(chain);

        renderWithProviders(<AuthConsumer />, { preset: 'full' });

        // Fire the hydrate timeout -> fall back to guest mode.
        await act(async () => {
          await vi.advanceTimersByTimeAsync(AUTH_TIMEOUT + 100);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

        // The slow queries finally resolve -> late recovery promotes the user.
        await act(async () => {
          resolveProfile({ data: { full_name: 'Test User' }, error: null });
          resolveTests({ data: [], error: null });
          await vi.advanceTimersByTimeAsync(0);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('test-user-id');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      } finally {
        vi.useRealTimers();
      }
    });

    it('save during the guest-fallback window targets the account, not guest storage', async () => {
      vi.useFakeTimers();
      try {
        const session = {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        };
        mockGetSession.mockResolvedValue({ data: { session }, error: null });
        mockOnAuthStateChange.mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } },
        });

        // Hydration queries hang -> the hydrate times out into guest mode, but
        // the session identity is still recorded.
        const chain = buildFromMock();
        chain.maybeSingle.mockReturnValue(new Promise(() => {}));
        chain.order.mockReturnValue(new Promise(() => {}));
        chain.upsert.mockResolvedValue({ error: null });
        chain.single.mockResolvedValue({
          data: {
            id: 'mock-test-1',
            completed_at: '2026-06-30T00:00:00.000Z',
            incorrect_count: 2,
            end_reason: 'complete',
            passed: true,
          },
          error: null,
        });
        mockFromChain.mockReturnValue(chain);

        renderWithProviders(<AuthConsumer />, { preset: 'full' });

        // Timeout -> guest fallback: user is null but a session exists.
        await act(async () => {
          await vi.advanceTimersByTimeAsync(AUTH_TIMEOUT + 100);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');

        mockFromChain.mockClear();

        // Save a mock test while degraded to guest mode.
        await act(async () => {
          fireEvent.click(screen.getByTestId('save-guest-test'));
          await vi.advanceTimersByTimeAsync(0);
        });

        // Routed to the Supabase account (mock_tests insert), NOT persisted to
        // local guest storage where it would be orphaned from the account.
        expect(mockFromChain).toHaveBeenCalledWith('mock_tests');
        expect(localStorage.getItem('civic-prep-guest-test-history')).toBeNull();
      } finally {
        vi.useRealTimers();
      }
    });

    it('late recovery is suppressed after sign-out (no resurrection of a signed-out session)', async () => {
      vi.useFakeTimers();
      try {
        const session = {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { full_name: 'Test User' },
          },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
        };
        mockGetSession.mockResolvedValue({ data: { session }, error: null });
        let authChangeCallback: (event: string, session: unknown) => void = () => {};
        mockOnAuthStateChange.mockImplementation(
          (cb: (event: string, session: unknown) => void) => {
            authChangeCallback = cb;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
          }
        );

        let resolveProfile!: (v: unknown) => void;
        let resolveTests!: (v: unknown) => void;
        const chain = buildFromMock();
        chain.maybeSingle.mockReturnValue(
          new Promise(r => {
            resolveProfile = r;
          })
        );
        chain.order.mockReturnValue(
          new Promise(r => {
            resolveTests = r;
          })
        );
        mockFromChain.mockReturnValue(chain);

        renderWithProviders(<AuthConsumer />, { preset: 'full' });

        // Timeout -> guest fallback.
        await act(async () => {
          await vi.advanceTimersByTimeAsync(AUTH_TIMEOUT + 100);
        });

        // Sign out while the slow queries are still in flight.
        await act(async () => {
          authChangeCallback('SIGNED_OUT', null);
        });

        // Now the stale queries resolve: they must NOT resurrect the user.
        await act(async () => {
          resolveProfile({ data: { full_name: 'Test User' }, error: null });
          resolveTests({ data: [], error: null });
          await vi.advanceTimersByTimeAsync(0);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
      } finally {
        vi.useRealTimers();
      }
    });

    it('recovers a slow sign-in that follows a prior sign-out', async () => {
      vi.useFakeTimers();
      try {
        const sessionA = {
          user: {
            id: 'user-a',
            email: 'a@example.com',
            user_metadata: { full_name: 'User A' },
          },
          access_token: 'token-a',
          refresh_token: 'refresh-a',
        };
        mockGetSession.mockResolvedValue({ data: { session: sessionA }, error: null });
        let authChangeCallback: (event: string, session: unknown) => void = () => {};
        mockOnAuthStateChange.mockImplementation(
          (cb: (event: string, session: unknown) => void) => {
            authChangeCallback = cb;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
          }
        );

        // User A hydrates immediately (sets the hydrated latch).
        const chainA = buildFromMock();
        chainA.maybeSingle.mockResolvedValue({ data: { full_name: 'User A' }, error: null });
        chainA.order.mockResolvedValue({ data: [], error: null });
        mockFromChain.mockReturnValue(chainA);

        renderWithProviders(<AuthConsumer />, { preset: 'full' });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(0);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-a');

        // Sign out.
        await act(async () => {
          authChangeCallback('SIGNED_OUT', null);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');

        // Sign into B whose queries hang past the timeout. With the hydrated
        // latch reset on sign-out, this still falls back to guest cleanly and
        // the late recovery promotes B once the queries resolve.
        let resolveProfileB!: (v: unknown) => void;
        let resolveTestsB!: (v: unknown) => void;
        const chainB = buildFromMock();
        chainB.maybeSingle.mockReturnValue(
          new Promise(r => {
            resolveProfileB = r;
          })
        );
        chainB.order.mockReturnValue(
          new Promise(r => {
            resolveTestsB = r;
          })
        );
        mockFromChain.mockReturnValue(chainB);

        const sessionB = {
          user: {
            id: 'user-b',
            email: 'b@example.com',
            user_metadata: { full_name: 'User B' },
          },
          access_token: 'token-b',
          refresh_token: 'refresh-b',
        };
        await act(async () => {
          authChangeCallback('SIGNED_IN', sessionB);
          await vi.advanceTimersByTimeAsync(AUTH_TIMEOUT + 100);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

        // B's queries resolve -> promoted to the real signed-in user.
        await act(async () => {
          resolveProfileB({ data: { full_name: 'User B' }, error: null });
          resolveTestsB({ data: [], error: null });
          await vi.advanceTimersByTimeAsync(0);
        });
        expect(screen.getByTestId('user-id')).toHaveTextContent('user-b');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('guest (no account) test history', () => {
    it('exposes empty testHistory for a guest', async () => {
      renderWithProviders(<AuthConsumer />, { preset: 'full' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('user-id')).toHaveTextContent('no-user');
      expect(screen.getByTestId('ctx-test-history-count')).toHaveTextContent('0');
    });

    it('saveTestSession persists locally for a guest instead of throwing', async () => {
      renderWithProviders(<AuthConsumer />, { preset: 'full' });

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      await act(async () => {
        fireEvent.click(screen.getByTestId('save-guest-test'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('ctx-test-history-count')).toHaveTextContent('1');
      });

      // Persisted to localStorage so it survives a reload
      const stored = localStorage.getItem('civic-prep-guest-test-history');
      expect(stored).toBeTruthy();
      expect(JSON.parse(stored as string)).toHaveLength(1);
    });
  });
});
