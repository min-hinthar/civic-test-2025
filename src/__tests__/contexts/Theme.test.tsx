/**
 * Unit tests for ThemeContext / ThemeProvider.
 *
 * Covers: initialization, theme toggle, View Transitions API (with fallback),
 * system preference listener, DOM class application, meta theme-color,
 * localStorage persistence, and auth-triggered settings sync.
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
// matchMedia mock helper
// ---------------------------------------------------------------------------

type MediaQueryHandler = (e: { matches: boolean }) => void;

let darkListeners: MediaQueryHandler[] = [];
let reducedMotionMatches = false;

function createMatchMediaMock(overrides: { darkMatches?: boolean } = {}): typeof window.matchMedia {
  return vi.fn().mockImplementation((query: string) => {
    if (query === '(prefers-color-scheme: dark)') {
      return {
        matches: overrides.darkMatches ?? false,
        media: query,
        addEventListener: vi.fn((_: string, handler: MediaQueryHandler) => {
          darkListeners.push(handler);
        }),
        removeEventListener: vi.fn((_: string, handler: MediaQueryHandler) => {
          darkListeners = darkListeners.filter(h => h !== handler);
        }),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      };
    }
    if (query === '(prefers-reduced-motion: reduce)') {
      return {
        matches: reducedMotionMatches,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        onchange: null,
        dispatchEvent: vi.fn(),
      };
    }
    return {
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    };
  });
}

// ---------------------------------------------------------------------------
// Consumer component
// ---------------------------------------------------------------------------

import { useThemeContext } from '@/contexts/ThemeContext';

function ThemeConsumer() {
  const { theme, setTheme, toggleTheme } = useThemeContext();

  return (
    <div>
      <div data-testid="theme-value">{theme}</div>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="toggle-theme" onClick={e => toggleTheme(e)}>
        Toggle
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ThemeContext', () => {
  let originalStartViewTransition: typeof document.startViewTransition;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    darkListeners = [];
    reducedMotionMatches = false;
    originalStartViewTransition = document.startViewTransition;
    // Default: no View Transitions API
    (document as unknown as Record<string, unknown>).startViewTransition = undefined;
    // Set up matchMedia mock
    window.matchMedia = createMatchMediaMock();
    // Create meta theme-color tag for tests
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      meta.setAttribute('content', '#002868');
      document.head.appendChild(meta);
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (document as unknown as Record<string, unknown>).startViewTransition =
      originalStartViewTransition;
  });

  it('initializes with light theme by default (no localStorage, system preference=light)', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });
  });

  it('initializes with persisted theme from localStorage', async () => {
    localStorage.setItem('civic-theme', 'dark');
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });
  });

  it('respects system preference dark when no localStorage', async () => {
    window.matchMedia = createMatchMediaMock({ darkMatches: true });
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });
  });

  it('setTheme("dark") updates theme state', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });
  });

  it('toggleTheme flips between light and dark', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });
  });

  it('theme change persists to localStorage', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });
    await waitFor(() => {
      expect(localStorage.getItem('civic-theme')).toBe('dark');
    });
  });

  it('document.documentElement.classList contains dark when theme is dark', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('document.documentElement.classList does not contain dark when theme is light', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('meta theme-color tag updated on theme change', async () => {
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });
    await waitFor(() => {
      const meta = document.querySelector('meta[name="theme-color"]');
      expect(meta?.getAttribute('content')).toBe('#1a1f36');
    });
  });

  it('View Transitions API used when available (startViewTransition called on toggle)', async () => {
    const mockTransition = {
      ready: Promise.resolve(),
    };
    (document as unknown as Record<string, unknown>).startViewTransition = vi.fn(
      (cb: () => void) => {
        cb();
        return mockTransition;
      }
    );
    // Need to also mock document.documentElement.animate
    document.documentElement.animate = vi.fn();

    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });

    expect(document.startViewTransition).toHaveBeenCalled();
  });

  it('fallback works when View Transitions API unavailable', async () => {
    // startViewTransition is undefined (set in beforeEach)
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });
  });

  it('fallback when prefers-reduced-motion is active', async () => {
    reducedMotionMatches = true;
    window.matchMedia = createMatchMediaMock();
    const mockStartViewTransition = vi.fn();
    (document as unknown as Record<string, unknown>).startViewTransition = mockStartViewTransition;

    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });
    // Should NOT have used view transitions since reduced motion is active
    expect(mockStartViewTransition).not.toHaveBeenCalled();
  });

  it('setFieldTimestamp called on theme change', async () => {
    const { setFieldTimestamp } = await import('@/lib/settings/settingsTimestamps');
    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await act(async () => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });
    await waitFor(() => {
      expect(setFieldTimestamp).toHaveBeenCalledWith('theme');
    });
  });

  it('system preference change listener updates theme when no manual override', async () => {
    window.matchMedia = createMatchMediaMock({ darkMatches: false });

    renderWithProviders(<ThemeConsumer />, { preset: 'full' });
    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('light');
    });

    // Simulate system preference change to dark
    // No manual override since we haven't set localStorage directly
    localStorage.removeItem('civic-theme');

    await act(async () => {
      for (const listener of darkListeners) {
        listener({ matches: true });
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-value')).toHaveTextContent('dark');
    });
  });
});
