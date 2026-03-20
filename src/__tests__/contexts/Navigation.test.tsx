/**
 * Unit tests for NavigationProvider.
 *
 * Covers: tier detection, sidebar toggle, lock mechanism,
 * click-outside dismiss, localStorage persistence, and cleanup.
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

// Mock state data
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

vi.mock('@/lib/useScrollDirection', () => ({
  useScrollDirection: vi.fn().mockReturnValue(true),
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
// Controllable mocks for useMediaTier and useNavBadges
// ---------------------------------------------------------------------------

import { useMediaTier } from '@/components/navigation/useMediaTier';
import { useNavBadges } from '@/components/navigation/useNavBadges';

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

const mockUseMediaTier = vi.mocked(useMediaTier);
const mockUseNavBadges = vi.mocked(useNavBadges);

// ---------------------------------------------------------------------------
// Consumer component
// ---------------------------------------------------------------------------

import { useNavigation } from '@/components/navigation/NavigationProvider';

function NavConsumer() {
  const {
    isExpanded,
    isLocked,
    lockMessage,
    tier,
    toggleSidebar,
    setLock,
    setExpanded,
    sidebarRef,
  } = useNavigation();

  return (
    <div>
      <nav data-testid="sidebar" ref={sidebarRef as React.RefObject<HTMLElement>}>
        Sidebar
      </nav>
      <div data-testid="is-expanded">{String(isExpanded)}</div>
      <div data-testid="is-locked">{String(isLocked)}</div>
      <div data-testid="lock-message">{lockMessage ?? 'none'}</div>
      <div data-testid="tier">{tier}</div>
      <button data-testid="toggle-sidebar" onClick={toggleSidebar}>
        Toggle
      </button>
      <button data-testid="set-lock" onClick={() => setLock(true, 'Test in progress')}>
        Lock
      </button>
      <button data-testid="clear-lock" onClick={() => setLock(false)}>
        Unlock
      </button>
      <button data-testid="expand" onClick={() => setExpanded(true)}>
        Expand
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NavigationProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Reset to default mobile tier
    mockUseMediaTier.mockReturnValue('mobile');
    mockUseNavBadges.mockReturnValue({
      studyDueCount: 0,
      hubHasUpdate: false,
      settingsHasUpdate: false,
      testSessionCount: 0,
      interviewSessionCount: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with default values (mobile: collapsed, unlocked)', () => {
    renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('false');
    expect(screen.getByTestId('is-locked')).toHaveTextContent('false');
    expect(screen.getByTestId('lock-message')).toHaveTextContent('none');
  });

  it('tier reflects useMediaTier mock value (mobile)', () => {
    renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(screen.getByTestId('tier')).toHaveTextContent('mobile');
  });

  it('tier reflects desktop when useMediaTier mocked to desktop', () => {
    mockUseMediaTier.mockReturnValue('desktop');
    renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(screen.getByTestId('tier')).toHaveTextContent('desktop');
  });

  it('toggleSidebar flips isExpanded state', async () => {
    renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('false');

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
    });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('true');

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
    });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('false');
  });

  it('setLock(true, message) sets isLocked and lockMessage', async () => {
    renderWithProviders(<NavConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('set-lock'));
    });
    expect(screen.getByTestId('is-locked')).toHaveTextContent('true');
    expect(screen.getByTestId('lock-message')).toHaveTextContent('Test in progress');
  });

  it('setLock(false) clears lock and lockMessage', async () => {
    renderWithProviders(<NavConsumer />, { preset: 'full' });

    // Lock first
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-lock'));
    });
    expect(screen.getByTestId('is-locked')).toHaveTextContent('true');

    // Unlock
    await act(async () => {
      fireEvent.click(screen.getByTestId('clear-lock'));
    });
    expect(screen.getByTestId('is-locked')).toHaveTextContent('false');
    expect(screen.getByTestId('lock-message')).toHaveTextContent('none');
  });

  it('click-outside on mobile collapses expanded sidebar', async () => {
    // Add an outside element to click on
    const outside = document.createElement('div');
    outside.setAttribute('data-testid', 'outside');
    document.body.appendChild(outside);

    renderWithProviders(<NavConsumer />, { preset: 'full' });

    // Expand sidebar first
    await act(async () => {
      fireEvent.click(screen.getByTestId('expand'));
    });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('true');

    // Click outside the sidebar ref element
    await act(async () => {
      fireEvent.pointerDown(outside);
    });
    await waitFor(() => {
      expect(screen.getByTestId('is-expanded')).toHaveTextContent('false');
    });

    document.body.removeChild(outside);
  });

  it('sidebar state persists to localStorage on toggle', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    renderWithProviders(<NavConsumer />, { preset: 'full' });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
    });
    expect(setItemSpy).toHaveBeenCalledWith('sidebar-expanded', 'true');
  });

  it('desktop tier defaults to expanded sidebar', () => {
    mockUseMediaTier.mockReturnValue('desktop');
    renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('true');
  });

  it('desktop respects localStorage preference for collapsed', () => {
    mockUseMediaTier.mockReturnValue('desktop');
    localStorage.setItem('sidebar-expanded', 'false');
    renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(screen.getByTestId('is-expanded')).toHaveTextContent('false');
  });

  it('unmount cleans up without errors', () => {
    const { unmount } = renderWithProviders(<NavConsumer />, { preset: 'full' });
    expect(() => unmount()).not.toThrow();
  });
});
