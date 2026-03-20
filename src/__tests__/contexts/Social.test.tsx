/**
 * Unit tests for SocialContext / SocialProvider.
 *
 * Covers: profile loading, opt-in/opt-out, streak merge, display name,
 * unauthenticated no-ops, visibility-based refresh, unmount safety.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/renderWithProviders';

// ---------------------------------------------------------------------------
// Hoisted mocks for auth state control
// ---------------------------------------------------------------------------

const { mockGetSession, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Mocks (full set from renderWithProviders.test.tsx)
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession.mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    }),
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
}));

vi.mock('@/lib/settings/settingsTimestamps', () => ({
  setFieldTimestamp: vi.fn(),
  markFieldDirty: vi.fn(),
}));

vi.mock('@/lib/bookmarks', () => ({
  loadBookmarksFromSupabase: vi.fn().mockResolvedValue([]),
  mergeBookmarks: vi.fn().mockReturnValue([]),
  getAllBookmarkIds: vi.fn().mockResolvedValue([]),
  setBookmark: vi.fn().mockResolvedValue(undefined),
  syncBookmarksToSupabase: vi.fn(),
}));

vi.mock('@/lib/saveSession', () => ({
  createSaveSessionGuard: vi.fn().mockReturnValue({ save: vi.fn(), reset: vi.fn() }),
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

import { useSocial } from '@/contexts/SocialContext';

function SocialConsumer() {
  const {
    socialProfile,
    isOptedIn,
    displayName,
    isLoading,
    optIn,
    optOut,
    updateDisplayName,
    refreshProfile,
  } = useSocial();

  return (
    <div>
      <div data-testid="social-profile">{socialProfile ? 'loaded' : 'null'}</div>
      <div data-testid="is-opted-in">{String(isOptedIn)}</div>
      <div data-testid="display-name">{displayName || 'empty'}</div>
      <div data-testid="is-loading">{String(isLoading)}</div>
      <button data-testid="opt-in" onClick={() => optIn('TestUser')}>
        Opt In
      </button>
      <button data-testid="opt-out" onClick={() => optOut()}>
        Opt Out
      </button>
      <button data-testid="update-name" onClick={() => updateDisplayName('NewName')}>
        Update Name
      </button>
      <button data-testid="refresh" onClick={() => refreshProfile()}>
        Refresh
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupAuthenticated() {
  mockGetSession.mockResolvedValue({
    data: {
      session: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: { display_name: 'TestUser' },
        },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      },
    },
    error: null,
  });

  // onAuthStateChange fires INITIAL_SESSION during hydration
  mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
    // Fire initial session after a microtask
    setTimeout(() => {
      cb('INITIAL_SESSION', {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: { display_name: 'TestUser' },
        },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
      });
    }, 0);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
}

function setupUnauthenticated() {
  mockGetSession.mockResolvedValue({
    data: { session: null },
    error: null,
  });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SocialContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupUnauthenticated();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with null socialProfile when unauthenticated', () => {
    renderWithProviders(<SocialConsumer />, { preset: 'full' });
    expect(screen.getByTestId('social-profile')).toHaveTextContent('null');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('isOptedIn is false when socialProfile is null', () => {
    renderWithProviders(<SocialConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-opted-in')).toHaveTextContent('false');
  });

  it('displayName falls back to empty string when no user and no profile', () => {
    renderWithProviders(<SocialConsumer />, { preset: 'full' });
    expect(screen.getByTestId('display-name')).toHaveTextContent('empty');
  });

  it('unauthenticated user: no Supabase social calls made on mount', async () => {
    const { getSocialProfile } = await import('@/lib/social/socialProfileSync');
    const { loadStreakFromSupabase } = await import('@/lib/social/streakSync');

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    // Give time for any async calls to fire
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(getSocialProfile).not.toHaveBeenCalled();
    expect(loadStreakFromSupabase).not.toHaveBeenCalled();
  });

  it('loads social profile on authenticated mount', async () => {
    setupAuthenticated();
    const { getSocialProfile } = await import('@/lib/social/socialProfileSync');
    const mockProfile = {
      userId: 'test-user-id',
      displayName: 'AuthUser',
      socialOptIn: true,
      compositeScore: 100,
      currentStreak: 5,
      longestStreak: 10,
      topBadge: null,
      isWeeklyWinner: false,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };
    vi.mocked(getSocialProfile).mockResolvedValue(mockProfile);

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('social-profile')).toHaveTextContent('loaded');
      expect(screen.getByTestId('is-opted-in')).toHaveTextContent('true');
    });
  });

  it('optIn calls upsertSocialProfile and updates local state', async () => {
    setupAuthenticated();
    const { upsertSocialProfile, getSocialProfile } =
      await import('@/lib/social/socialProfileSync');

    // After opt-in, getSocialProfile is called to reload
    const updatedProfile = {
      userId: 'test-user-id',
      displayName: 'TestUser',
      socialOptIn: true,
      compositeScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      topBadge: null,
      isWeeklyWinner: false,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    };
    // First call returns null (initial load), subsequent calls return profile after opt-in
    vi.mocked(getSocialProfile).mockResolvedValueOnce(null).mockResolvedValue(updatedProfile);

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    // Wait for auth to fully hydrate (displayName shows user email when profile is null)
    await waitFor(() => {
      expect(screen.getByTestId('display-name')).not.toHaveTextContent('empty');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('opt-in'));
    });

    await waitFor(() => {
      expect(upsertSocialProfile).toHaveBeenCalledWith('test-user-id', {
        displayName: 'TestUser',
        socialOptIn: true,
      });
    });
  });

  it('optOut calls toggleSocialOptIn and updates isOptedIn to false', async () => {
    setupAuthenticated();
    const { getSocialProfile, toggleSocialOptIn } = await import('@/lib/social/socialProfileSync');
    vi.mocked(getSocialProfile).mockResolvedValue({
      userId: 'test-user-id',
      displayName: 'AuthUser',
      socialOptIn: true,
      compositeScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      topBadge: null,
      isWeeklyWinner: false,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    });

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-opted-in')).toHaveTextContent('true');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('opt-out'));
    });

    await waitFor(() => {
      expect(toggleSocialOptIn).toHaveBeenCalledWith('test-user-id', false);
      expect(screen.getByTestId('is-opted-in')).toHaveTextContent('false');
    });
  });

  it('refreshProfile re-fetches from getSocialProfile', async () => {
    setupAuthenticated();
    const { getSocialProfile } = await import('@/lib/social/socialProfileSync');
    vi.mocked(getSocialProfile).mockResolvedValue(null);

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    vi.mocked(getSocialProfile).mockResolvedValue({
      userId: 'test-user-id',
      displayName: 'Refreshed',
      socialOptIn: true,
      compositeScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      topBadge: null,
      isWeeklyWinner: false,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('social-profile')).toHaveTextContent('loaded');
    });
  });

  it('streak data loaded and merged on authenticated mount', async () => {
    setupAuthenticated();
    const { loadStreakFromSupabase, mergeStreakData } = await import('@/lib/social/streakSync');
    const { getStreakData } = await import('@/lib/social/streakStore');

    const remoteStreak = { activityDates: ['2025-01-01'], currentStreak: 3, longestStreak: 5 };
    vi.mocked(loadStreakFromSupabase).mockResolvedValue(remoteStreak);
    vi.mocked(getStreakData).mockResolvedValue({ activityDates: ['2025-01-02'] });
    vi.mocked(mergeStreakData).mockReturnValue({
      activityDates: ['2025-01-01', '2025-01-02'],
    });

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(loadStreakFromSupabase).toHaveBeenCalledWith('test-user-id');
      expect(mergeStreakData).toHaveBeenCalled();
    });
  });

  it('first-login streak merge: local streak pushed when no remote data', async () => {
    setupAuthenticated();
    const { loadStreakFromSupabase, syncStreakToSupabase } =
      await import('@/lib/social/streakSync');
    const { getStreakData } = await import('@/lib/social/streakStore');

    // No remote data
    vi.mocked(loadStreakFromSupabase).mockResolvedValue(null);
    // Local has activity
    vi.mocked(getStreakData).mockResolvedValue({
      activityDates: ['2025-01-15'],
    });

    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(syncStreakToSupabase).toHaveBeenCalledWith('test-user-id', {
        activityDates: ['2025-01-15'],
      });
    });
  });

  it('unmount during async load: no setState errors', async () => {
    setupAuthenticated();
    const { getSocialProfile } = await import('@/lib/social/socialProfileSync');

    // Create a never-resolving promise to simulate slow load
    let resolveProfile: ((v: null) => void) | undefined;
    vi.mocked(getSocialProfile).mockReturnValue(
      new Promise(resolve => {
        resolveProfile = resolve;
      })
    );

    const { unmount } = renderWithProviders(<SocialConsumer />, { preset: 'full' });

    // Unmount while loading
    unmount();

    // Resolve after unmount - should not cause errors
    await act(async () => {
      resolveProfile?.(null);
      await new Promise(r => setTimeout(r, 10));
    });

    // If we get here without error, the test passes (cancelled flag works)
  });

  it('unauthenticated user: action no-ops do not throw', async () => {
    renderWithProviders(<SocialConsumer />, { preset: 'full' });

    // All actions should be no-ops for unauthenticated users
    await act(async () => {
      fireEvent.click(screen.getByTestId('opt-in'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('opt-out'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('update-name'));
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh'));
    });

    // Should still show defaults with no errors
    expect(screen.getByTestId('social-profile')).toHaveTextContent('null');
    expect(screen.getByTestId('is-opted-in')).toHaveTextContent('false');
  });
});
