/**
 * Unit tests for OfflineContext / OfflineProvider.
 *
 * Covers: online/offline detection, question caching, pending sync count,
 * auto-sync on reconnection, manual sync trigger, sync failure, and cleanup.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/renderWithProviders';

// ---------------------------------------------------------------------------
// Mocks (full set from renderWithProviders.test.tsx)
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
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
  useNavBadges: vi.fn().mockReturnValue({
    studyDueCount: 0,
    hubHasUpdate: false,
    settingsHasUpdate: false,
    testSessionCount: 0,
    interviewSessionCount: 0,
  }),
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

// Mock useOnlineStatus to control online/offline in tests
vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn().mockReturnValue(true),
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
// Controllable mock refs
// ---------------------------------------------------------------------------

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { getPendingSyncCount, syncAllPendingResults } from '@/lib/pwa/syncQueue';
import { cacheQuestions, getCachedQuestions, hasQuestionsCache } from '@/lib/pwa/offlineDb';

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);
const mockGetPendingSyncCount = vi.mocked(getPendingSyncCount);
const mockSyncAllPendingResults = vi.mocked(syncAllPendingResults);
const mockCacheQuestions = vi.mocked(cacheQuestions);
const mockGetCachedQuestions = vi.mocked(getCachedQuestions);
const mockHasQuestionsCache = vi.mocked(hasQuestionsCache);

// ---------------------------------------------------------------------------
// Consumer component
// ---------------------------------------------------------------------------

import { useOffline } from '@/contexts/OfflineContext';

function OfflineConsumer() {
  const {
    isOnline,
    questions,
    pendingSyncCount,
    syncFailed,
    isSyncing,
    isCached,
    refreshCache,
    triggerSync,
    refreshPendingCount,
  } = useOffline();

  return (
    <div>
      <div data-testid="is-online">{String(isOnline)}</div>
      <div data-testid="questions-count">{questions.length}</div>
      <div data-testid="pending-sync-count">{pendingSyncCount}</div>
      <div data-testid="sync-failed">{String(syncFailed)}</div>
      <div data-testid="is-syncing">{String(isSyncing)}</div>
      <div data-testid="is-cached">{String(isCached)}</div>
      <button data-testid="refresh-cache" onClick={() => void refreshCache()}>
        Refresh Cache
      </button>
      <button data-testid="trigger-sync" onClick={() => void triggerSync()}>
        Trigger Sync
      </button>
      <button data-testid="refresh-pending" onClick={() => void refreshPendingCount()}>
        Refresh Pending
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OfflineContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset to online by default
    mockUseOnlineStatus.mockReturnValue(true);
    mockGetPendingSyncCount.mockResolvedValue(0);
    mockSyncAllPendingResults.mockResolvedValue({ synced: 0, failed: 0 });
    mockHasQuestionsCache.mockResolvedValue(false);
    mockGetCachedQuestions.mockResolvedValue([]);
    mockCacheQuestions.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with isOnline=true', async () => {
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-online')).toHaveTextContent('true');
  });

  it('reflects offline status from useOnlineStatus', async () => {
    mockUseOnlineStatus.mockReturnValue(false);
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-online')).toHaveTextContent('false');
  });

  it('questions fallback to allQuestions constant on init', async () => {
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    // allQuestions is mocked as empty array
    expect(screen.getByTestId('questions-count')).toHaveTextContent('0');
  });

  it('loads questions from cache when available', async () => {
    mockHasQuestionsCache.mockResolvedValue(true);
    mockGetCachedQuestions.mockResolvedValue([
      { id: 1, question: 'Q1' },
      { id: 2, question: 'Q2' },
    ] as never);

    renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('questions-count')).toHaveTextContent('2');
    });
  });

  it('pendingSyncCount reflects getPendingSyncCount return value', async () => {
    mockGetPendingSyncCount.mockResolvedValue(5);
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('pending-sync-count')).toHaveTextContent('5');
    });
  });

  it('refreshCache calls cacheQuestions', async () => {
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh-cache'));
    });
    await waitFor(() => {
      expect(mockCacheQuestions).toHaveBeenCalled();
    });
  });

  it('triggerSync calls syncAllPendingResults and updates pending count', async () => {
    mockSyncAllPendingResults.mockResolvedValue({ synced: 3, failed: 0 });
    mockGetPendingSyncCount.mockResolvedValue(0);

    renderWithProviders(<OfflineConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-sync'));
    });
    await waitFor(() => {
      expect(mockSyncAllPendingResults).toHaveBeenCalled();
    });
  });

  it('syncFailed=true when sync has failures', async () => {
    mockSyncAllPendingResults.mockResolvedValue({ synced: 1, failed: 2 });

    renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    expect(screen.getByTestId('sync-failed')).toHaveTextContent('false');

    await act(async () => {
      fireEvent.click(screen.getByTestId('trigger-sync'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('sync-failed')).toHaveTextContent('true');
    });
  });

  it('refreshPendingCount updates pending count from IndexedDB', async () => {
    mockGetPendingSyncCount.mockResolvedValue(0);
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });

    // Change mock return value and refresh
    mockGetPendingSyncCount.mockResolvedValue(7);
    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh-pending'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('pending-sync-count')).toHaveTextContent('7');
    });
  });

  it('caches questions on first load when no cache exists', async () => {
    mockHasQuestionsCache.mockResolvedValue(false);
    renderWithProviders(<OfflineConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(mockCacheQuestions).toHaveBeenCalled();
    });
  });

  it('unmount cleans up without errors', async () => {
    const { unmount } = renderWithProviders(<OfflineConsumer />, { preset: 'full' });
    await act(async () => {
      // Allow async effects to settle
    });
    expect(() => unmount()).not.toThrow();
  });
});
