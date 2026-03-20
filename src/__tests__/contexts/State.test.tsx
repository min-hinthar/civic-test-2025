/**
 * Unit tests for StateContext / StateProvider.
 *
 * Covers: initialization, state selection, derived stateInfo,
 * localStorage persistence, and invalid state handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
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

// Mock state-representatives data with a fixture of 2 states
vi.mock('@/data/state-representatives.json', () => ({
  default: {
    CA: {
      name: 'California',
      capital: 'Sacramento',
      governor: 'Gavin Newsom',
      senators: ['Alex Padilla', 'Laphonza Butler'],
      lastUpdated: '2024-01-01',
    },
    NY: {
      name: 'New York',
      capital: 'Albany',
      governor: 'Kathy Hochul',
      senators: ['Chuck Schumer', 'Kirsten Gillibrand'],
      lastUpdated: '2024-01-01',
    },
  },
}));

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

import { useUserState } from '@/contexts/StateContext';

function StateConsumer() {
  const { selectedState, stateInfo, setSelectedState, allStates } = useUserState();

  return (
    <div>
      <div data-testid="selected-state">{selectedState ?? 'none'}</div>
      <div data-testid="state-name">{stateInfo?.name ?? 'no-info'}</div>
      <div data-testid="state-capital">{stateInfo?.capital ?? 'no-capital'}</div>
      <div data-testid="state-governor">{stateInfo?.governor ?? 'no-governor'}</div>
      <div data-testid="state-senators">
        {stateInfo?.senators ? stateInfo.senators.join(', ') : 'no-senators'}
      </div>
      <div data-testid="all-states-count">{allStates.length}</div>
      <button data-testid="select-ca" onClick={() => setSelectedState('CA')}>
        Select CA
      </button>
      <button data-testid="select-ny" onClick={() => setSelectedState('NY')}>
        Select NY
      </button>
      <button data-testid="select-invalid" onClick={() => setSelectedState('ZZ')}>
        Select Invalid
      </button>
      <button data-testid="clear-state" onClick={() => setSelectedState(null)}>
        Clear
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StateContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with null selectedState initially', () => {
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    expect(screen.getByTestId('selected-state')).toHaveTextContent('none');
    expect(screen.getByTestId('state-name')).toHaveTextContent('no-info');
  });

  it('renders with persisted state from localStorage', () => {
    localStorage.setItem('civic-prep-user-state', 'CA');
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    expect(screen.getByTestId('selected-state')).toHaveTextContent('CA');
    expect(screen.getByTestId('state-name')).toHaveTextContent('California');
  });

  it('setSelectedState updates selectedState and stateInfo', async () => {
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    fireEvent.click(screen.getByTestId('select-ca'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-state')).toHaveTextContent('CA');
      expect(screen.getByTestId('state-name')).toHaveTextContent('California');
    });
  });

  it('setSelectedState(null) clears selection', async () => {
    localStorage.setItem('civic-prep-user-state', 'CA');
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    expect(screen.getByTestId('selected-state')).toHaveTextContent('CA');

    fireEvent.click(screen.getByTestId('clear-state'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-state')).toHaveTextContent('none');
      expect(screen.getByTestId('state-name')).toHaveTextContent('no-info');
    });
  });

  it('stateInfo derives governor, senators, and capital from selected state', async () => {
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    fireEvent.click(screen.getByTestId('select-ny'));
    await waitFor(() => {
      expect(screen.getByTestId('state-capital')).toHaveTextContent('Albany');
      expect(screen.getByTestId('state-governor')).toHaveTextContent('Kathy Hochul');
      expect(screen.getByTestId('state-senators')).toHaveTextContent(
        'Chuck Schumer, Kirsten Gillibrand'
      );
    });
  });

  it('localStorage.setItem called when state changes', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    fireEvent.click(screen.getByTestId('select-ca'));
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith('civic-prep-user-state', 'CA');
    });
  });

  it('localStorage.removeItem called when state cleared', async () => {
    localStorage.setItem('civic-prep-user-state', 'CA');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    fireEvent.click(screen.getByTestId('clear-state'));
    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith('civic-prep-user-state');
    });
  });

  it('invalid state code produces null stateInfo', async () => {
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    fireEvent.click(screen.getByTestId('select-invalid'));
    await waitFor(() => {
      expect(screen.getByTestId('selected-state')).toHaveTextContent('ZZ');
      expect(screen.getByTestId('state-name')).toHaveTextContent('no-info');
    });
  });

  it('allStates lists all available states from data', () => {
    renderWithProviders(<StateConsumer />, { preset: 'full' });
    expect(screen.getByTestId('all-states-count')).toHaveTextContent('2');
  });
});
