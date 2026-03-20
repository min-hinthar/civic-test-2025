/**
 * Unit tests for SRSContext / SRSProvider.
 *
 * Covers: deck loading, add/remove/grade, dueCount memoization,
 * sync orchestration, visibility-based refresh, unauthenticated behavior,
 * error handling, and unmount safety.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils/renderWithProviders';

// ---------------------------------------------------------------------------
// Hoisted mocks
// ---------------------------------------------------------------------------

const { mockGetSession, mockOnAuthStateChange, mockGetAllSRSCards, mockIsDue } = vi.hoisted(() => ({
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockGetAllSRSCards: vi.fn(),
  mockIsDue: vi.fn(),
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
  createNewSRSCard: vi.fn().mockReturnValue({
    due: new Date(),
    stability: 0,
    difficulty: 0,
    elapsed_days: 0,
    scheduled_days: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    last_review: undefined,
    learning_steps: 0,
  }),
  gradeCard: vi.fn().mockReturnValue({
    card: {
      due: new Date(Date.now() + 86400000),
      stability: 1,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 1,
      reps: 1,
      lapses: 0,
      state: 1,
      learning_steps: 0,
    },
  }),
  isDue: mockIsDue.mockReturnValue(false),
  getNextReviewText: vi.fn().mockReturnValue({ en: '1 day', my: '1 day' }),
  getAllSRSCards: mockGetAllSRSCards.mockResolvedValue([]),
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
// Fixtures
// ---------------------------------------------------------------------------

function makeCard(questionId: string, dueOffset = 0) {
  return {
    questionId,
    card: {
      due: new Date(Date.now() + dueOffset),
      stability: 1,
      difficulty: 5,
      elapsed_days: 0,
      scheduled_days: 1,
      reps: 1,
      lapses: 0,
      state: 1,
      last_review: new Date(),
      learning_steps: 0,
    },
    addedAt: '2025-01-01T00:00:00Z',
  };
}

// ---------------------------------------------------------------------------
// Consumer component
// ---------------------------------------------------------------------------

import { useSRS } from '@/contexts/SRSContext';

function SRSConsumer() {
  const { deck, dueCount, isLoading, addCard, removeCard, gradeCard, isInDeck, refreshDeck } =
    useSRS();

  return (
    <div>
      <div data-testid="deck-length">{deck.length}</div>
      <div data-testid="due-count">{dueCount}</div>
      <div data-testid="is-loading">{String(isLoading)}</div>
      <div data-testid="is-in-deck-q1">{String(isInDeck('q1'))}</div>
      <div data-testid="is-in-deck-q99">{String(isInDeck('q99'))}</div>
      <button data-testid="add-card" onClick={() => addCard('q-new')}>
        Add Card
      </button>
      <button data-testid="remove-card" onClick={() => removeCard('q1')}>
        Remove Card
      </button>
      <button data-testid="grade-card" onClick={() => gradeCard('q1', true).catch(() => {})}>
        Grade Card
      </button>
      <button data-testid="refresh" onClick={() => refreshDeck()}>
        Refresh
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SRSContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default: unauthenticated
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockGetAllSRSCards.mockResolvedValue([]);
    mockIsDue.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with empty deck and isLoading=true, then loads deck', async () => {
    const cards = [makeCard('q1'), makeCard('q2'), makeCard('q3')];
    mockGetAllSRSCards.mockResolvedValue(cards);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    // Eventually loads
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('deck-length')).toHaveTextContent('3');
    });
  });

  it('dueCount reflects number of cards where isDue returns true', async () => {
    const dueCard = makeCard('q1', -86400000); // 1 day in the past (overdue)
    const notDueCards = [makeCard('q2', 86400000), makeCard('q3', 172800000)];
    const cards = [dueCard, ...notDueCards];
    mockGetAllSRSCards.mockResolvedValue(cards);
    // isDue returns true only for the card with reps=99 (our marker)
    dueCard.card.reps = 99;
    mockIsDue.mockImplementation((card: { reps: number }) => card.reps === 99);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('due-count')).toHaveTextContent('1');
    });
  });

  it('isInDeck returns true for known questionId, false for unknown', async () => {
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-in-deck-q1')).toHaveTextContent('true');
      expect(screen.getByTestId('is-in-deck-q99')).toHaveTextContent('false');
    });
  });

  it('addCard calls createNewSRSCard + setSRSCard and adds to deck', async () => {
    mockGetAllSRSCards.mockResolvedValue([]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });

    const { createNewSRSCard, setSRSCard } = await import('@/lib/srs');

    await act(async () => {
      fireEvent.click(screen.getByTestId('add-card'));
    });

    await waitFor(() => {
      expect(createNewSRSCard).toHaveBeenCalled();
      expect(setSRSCard).toHaveBeenCalled();
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
    });
  });

  it('removeCard calls removeSRSCard and removes from deck', async () => {
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1'), makeCard('q2')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('2');
    });

    const { removeSRSCard } = await import('@/lib/srs');

    await act(async () => {
      fireEvent.click(screen.getByTestId('remove-card'));
    });

    await waitFor(() => {
      expect(removeSRSCard).toHaveBeenCalledWith('q1');
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
    });
  });

  it('gradeCard calls gradeCard engine and returns updated card + intervalText', async () => {
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
    });

    const { gradeCard: gradeCardEngine, getNextReviewText, setSRSCard } = await import('@/lib/srs');

    await act(async () => {
      fireEvent.click(screen.getByTestId('grade-card'));
    });

    await waitFor(() => {
      expect(gradeCardEngine).toHaveBeenCalled();
      expect(getNextReviewText).toHaveBeenCalled();
      expect(setSRSCard).toHaveBeenCalled();
    });
  });

  it('refreshDeck re-fetches from getAllSRSCards', async () => {
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
    });

    // Update the mock to return more cards
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1'), makeCard('q2')]);

    await act(async () => {
      fireEvent.click(screen.getByTestId('refresh'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('2');
    });
  });

  it('isLoading transitions: true during load, false after completion', async () => {
    // Delay resolution to observe loading state
    let resolveCards!: (v: unknown[]) => void;
    mockGetAllSRSCards.mockReturnValue(
      new Promise(resolve => {
        resolveCards = resolve;
      })
    );

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    // isLoading starts true (initial state)
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    await act(async () => {
      resolveCards([makeCard('q1')]);
    });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  it('unauthenticated user: deck loads from local IndexedDB only (no pullSRSCards)', async () => {
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    const { pullSRSCards } = await import('@/lib/srs');

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
    });

    // Give time for any async sync to fire
    await act(async () => {
      await new Promise(r => setTimeout(r, 50));
    });

    expect(pullSRSCards).not.toHaveBeenCalled();
  });

  it('sync orchestration on authenticated mount: pullSRSCards and mergeSRSDecks called', async () => {
    // Setup authenticated
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user', email: 'test@example.com' },
          access_token: 'tok',
          refresh_token: 'ref',
        },
      },
      error: null,
    });
    mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
      setTimeout(() => {
        cb('INITIAL_SESSION', {
          user: { id: 'test-user', email: 'test@example.com' },
          access_token: 'tok',
          refresh_token: 'ref',
        });
      }, 0);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const localCards = [makeCard('q1')];
    const remoteCards = [makeCard('q2')];
    const mergedCards = [makeCard('q1'), makeCard('q2')];

    mockGetAllSRSCards.mockResolvedValue(localCards);

    const { pullSRSCards, mergeSRSDecks, pushSRSCards } = await import('@/lib/srs');
    vi.mocked(pullSRSCards).mockResolvedValue(remoteCards);
    vi.mocked(mergeSRSDecks).mockReturnValue(mergedCards);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(
      () => {
        expect(pullSRSCards).toHaveBeenCalledWith('test-user');
        expect(mergeSRSDecks).toHaveBeenCalled();
        expect(pushSRSCards).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it('visibility-based refresh on tab focus', async () => {
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
    });

    // Update mock for the refresh
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1'), makeCard('q2')]);

    // Simulate tab becoming visible
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    });

    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('2');
    });
  });

  it('withRetry passes through directly (no retry delay in tests)', async () => {
    const { withRetry } = await import('@/lib/async');
    mockGetAllSRSCards.mockResolvedValue([makeCard('q1')]);

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('deck-length')).toHaveTextContent('1');
      // withRetry was called (passes through directly per mock)
      expect(withRetry).toHaveBeenCalled();
    });
  });

  it('unmount during async deck load: no setState errors', async () => {
    let resolveCards!: (v: unknown[]) => void;
    mockGetAllSRSCards.mockReturnValue(
      new Promise(resolve => {
        resolveCards = resolve;
      })
    );

    const { unmount } = renderWithProviders(<SRSConsumer />, { preset: 'full' });

    // Unmount while loading
    unmount();

    // Resolve after unmount
    await act(async () => {
      resolveCards([makeCard('q1')]);
      await new Promise(r => setTimeout(r, 10));
    });

    // If we get here without error, the cancelled flag works
  });

  it('error in deck load: captureError called', async () => {
    const { captureError } = await import('@/lib/sentry');
    mockGetAllSRSCards.mockRejectedValue(new Error('IndexedDB failure'));

    renderWithProviders(<SRSConsumer />, { preset: 'full' });

    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
        operation: 'SRSContext.loadDeck',
      });
    });
  });
});
