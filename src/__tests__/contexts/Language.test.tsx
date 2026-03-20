/**
 * Unit tests for LanguageContext / LanguageProvider.
 *
 * Covers: initialization, mode toggle, showBurmese, persistence,
 * Alt+L shortcut, document.lang, multi-tab sync, settings sync.
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

import { useLanguage } from '@/contexts/LanguageContext';

function LanguageConsumer() {
  const { mode, showBurmese, setMode, toggleMode } = useLanguage();

  return (
    <div>
      <div data-testid="mode">{mode}</div>
      <div data-testid="show-burmese">{String(showBurmese)}</div>
      <button data-testid="toggle-mode" onClick={toggleMode}>
        Toggle
      </button>
      <button data-testid="set-english" onClick={() => setMode('english-only')}>
        English Only
      </button>
      <button data-testid="set-bilingual" onClick={() => setMode('bilingual')}>
        Bilingual
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('LanguageContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset document lang
    document.documentElement.lang = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with bilingual mode by default', () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    expect(screen.getByTestId('mode')).toHaveTextContent('bilingual');
    expect(screen.getByTestId('show-burmese')).toHaveTextContent('true');
  });

  it('initializes with persisted mode from localStorage', () => {
    localStorage.setItem('civic-test-language-mode', 'english-only');
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    expect(screen.getByTestId('mode')).toHaveTextContent('english-only');
    expect(screen.getByTestId('show-burmese')).toHaveTextContent('false');
  });

  it('showBurmese is true when bilingual, false when english-only', async () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    expect(screen.getByTestId('show-burmese')).toHaveTextContent('true');

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-english'));
    });
    expect(screen.getByTestId('show-burmese')).toHaveTextContent('false');

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-bilingual'));
    });
    expect(screen.getByTestId('show-burmese')).toHaveTextContent('true');
  });

  it('setMode updates mode', async () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-english'));
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('english-only');
  });

  it('toggleMode flips between bilingual and english-only', async () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    expect(screen.getByTestId('mode')).toHaveTextContent('bilingual');

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-mode'));
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('english-only');

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-mode'));
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('bilingual');
  });

  it('mode change persists to localStorage', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-english'));
    });
    expect(setItemSpy).toHaveBeenCalledWith('civic-test-language-mode', 'english-only');
  });

  it('Alt+L keyboard shortcut toggles mode', async () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    expect(screen.getByTestId('mode')).toHaveTextContent('bilingual');

    await act(async () => {
      fireEvent.keyDown(window, { key: 'l', altKey: true });
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('english-only');

    await act(async () => {
      fireEvent.keyDown(window, { key: 'l', altKey: true });
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('bilingual');
  });

  it('document.documentElement.lang set correctly for each mode', async () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    // Initial mount sets lang to en-my for bilingual
    await waitFor(() => {
      expect(document.documentElement.lang).toBe('en-my');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-english'));
    });
    expect(document.documentElement.lang).toBe('en');

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-bilingual'));
    });
    expect(document.documentElement.lang).toBe('en-my');
  });

  it('multi-tab sync: storage event updates mode', async () => {
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });
    expect(screen.getByTestId('mode')).toHaveTextContent('bilingual');

    await act(async () => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'civic-test-language-mode',
          newValue: 'english-only',
        })
      );
    });
    expect(screen.getByTestId('mode')).toHaveTextContent('english-only');
  });

  it('setMode records field timestamp for LWW merge', async () => {
    const { setFieldTimestamp } = await import('@/lib/settings/settingsTimestamps');
    renderWithProviders(<LanguageConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-english'));
    });
    expect(setFieldTimestamp).toHaveBeenCalledWith('languageMode');
  });
});
