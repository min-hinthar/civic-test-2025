/**
 * Tests for renderWithProviders test utility.
 *
 * Verifies preset system, provider override map, mock configuration,
 * and return value compatibility with @testing-library/react.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';

import {
  renderWithProviders,
  type RenderWithProvidersOptions,
  type ProviderName,
} from './renderWithProviders';

// ---------------------------------------------------------------------------
// Mock Supabase client (module-level, required by AuthProvider)
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

// Mock idb-keyval (used by SRS, Offline, etc.)
vi.mock('idb-keyval', () => ({
  get: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
  keys: vi.fn().mockResolvedValue([]),
  entries: vi.fn().mockResolvedValue([]),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

// Mock sentry helper
vi.mock('@/lib/sentry', () => ({
  captureError: vi.fn(),
}));

// Mock settings sync
vi.mock('@/lib/settings', () => ({
  gatherCurrentSettings: vi.fn().mockReturnValue({}),
  syncSettingsToSupabase: vi.fn(),
  loadSettingsFromSupabase: vi.fn().mockResolvedValue(null),
}));

// Mock bookmarks
vi.mock('@/lib/bookmarks', () => ({
  loadBookmarksFromSupabase: vi.fn().mockResolvedValue([]),
  mergeBookmarks: vi.fn().mockReturnValue([]),
  getAllBookmarkIds: vi.fn().mockResolvedValue([]),
  setBookmark: vi.fn().mockResolvedValue(undefined),
  syncBookmarksToSupabase: vi.fn(),
}));

// Mock saveSession
vi.mock('@/lib/saveSession', () => ({
  createSaveSessionGuard: vi.fn().mockReturnValue({
    save: vi.fn(),
    reset: vi.fn(),
  }),
}));

// Mock offline DB
vi.mock('@/lib/pwa/offlineDb', () => ({
  cacheQuestions: vi.fn().mockResolvedValue(undefined),
  getCachedQuestions: vi.fn().mockResolvedValue([]),
  hasQuestionsCache: vi.fn().mockResolvedValue(false),
  queueTestResult: vi.fn().mockResolvedValue(undefined),
}));

// Mock sync queue
vi.mock('@/lib/pwa/syncQueue', () => ({
  syncAllPendingResults: vi.fn().mockResolvedValue({ synced: 0, failed: 0 }),
  getPendingSyncCount: vi.fn().mockResolvedValue(0),
}));

// Mock questions constant
vi.mock('@/constants/questions', () => ({
  allQuestions: [],
}));

// Mock async utility
vi.mock('@/lib/async', () => ({
  withRetry: vi.fn((fn: () => Promise<unknown>) => fn()),
}));

// Mock SRS library
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

// Mock social profile sync
vi.mock('@/lib/social/socialProfileSync', () => ({
  getSocialProfile: vi.fn().mockResolvedValue(null),
  toggleSocialOptIn: vi.fn().mockResolvedValue(undefined),
  upsertSocialProfile: vi.fn().mockResolvedValue(undefined),
}));

// Mock streak sync
vi.mock('@/lib/social/streakSync', () => ({
  loadStreakFromSupabase: vi.fn().mockResolvedValue(null),
  mergeStreakData: vi.fn().mockReturnValue({ activityDates: [] }),
  syncStreakToSupabase: vi.fn().mockResolvedValue(undefined),
}));

// Mock streak store
vi.mock('@/lib/social/streakStore', () => ({
  getStreakData: vi.fn().mockResolvedValue({ activityDates: [] }),
  saveStreakData: vi.fn().mockResolvedValue(undefined),
}));

// Mock visibility sync hook
vi.mock('@/hooks/useVisibilitySync', () => ({
  useVisibilitySync: vi.fn(),
}));

// Mock haptics
vi.mock('@/lib/haptics', () => ({
  hapticLight: vi.fn(),
  hapticMedium: vi.fn(),
}));

// Mock sessions
vi.mock('@/lib/sessions/sessionStore', () => ({
  cleanExpiredSessions: vi.fn().mockResolvedValue(undefined),
}));

// Mock history guard
vi.mock('@/lib/historyGuard', () => ({
  installHistoryGuard: vi.fn(),
}));

// Mock useViewportHeight
vi.mock('@/lib/useViewportHeight', () => ({
  useViewportHeight: vi.fn(),
}));

// Mock TTS core
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

// Mock error sanitizer
vi.mock('@/lib/errorSanitizer', () => ({
  sanitizeError: vi.fn().mockReturnValue({ en: 'Error', my: 'Error' }),
  sanitizeForSentry: vi.fn().mockReturnValue({ error: { message: 'Error' }, context: {} }),
}));

// Mock navigation hooks
vi.mock('@/components/navigation/useMediaTier', () => ({
  useMediaTier: vi.fn().mockReturnValue('mobile'),
}));

vi.mock('@/components/navigation/useNavBadges', () => ({
  useNavBadges: vi.fn().mockReturnValue({ srs: 0 }),
}));

vi.mock('@/lib/useScrollDirection', () => ({
  useScrollDirection: vi.fn().mockReturnValue(true),
}));

// Mock state data
vi.mock('@/data/state-representatives.json', () => ({
  default: {},
}));

// Mock motion/react for Toast
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
  useTransform: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(1),
  }),
  useAnimate: vi.fn().mockReturnValue([{ current: null }, vi.fn().mockResolvedValue(undefined)]),
}));

// requestIdleCallback polyfill for jsdom
if (typeof window !== 'undefined' && !('requestIdleCallback' in window)) {
  (window as unknown as Record<string, unknown>).requestIdleCallback = (cb: () => void) =>
    setTimeout(cb, 0);
  (window as unknown as Record<string, unknown>).cancelIdleCallback = (id: number) =>
    clearTimeout(id);
}

// Enhance speechSynthesis mock with addEventListener/removeEventListener
// (global setup only provides speak/cancel/getVoices -- TTSContext needs event listeners)
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
// Tests
// ---------------------------------------------------------------------------

describe('renderWithProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders content with default preset (core)', () => {
    renderWithProviders(<div data-testid="content">test</div>);
    expect(screen.getByTestId('content')).toHaveTextContent('test');
  });

  it('renders with minimal preset (ErrorBoundary + State only)', () => {
    renderWithProviders(<div data-testid="minimal">minimal test</div>, {
      preset: 'minimal',
    });
    expect(screen.getByTestId('minimal')).toHaveTextContent('minimal test');
  });

  it('renders with full preset (all 11 providers)', () => {
    renderWithProviders(<div data-testid="full">full test</div>, {
      preset: 'full',
    });
    expect(screen.getByTestId('full')).toHaveTextContent('full test');
  });

  it('renders with core preset including Language, Theme, Auth, Toast, State', () => {
    renderWithProviders(<div data-testid="core">core test</div>, {
      preset: 'core',
    });
    expect(screen.getByTestId('core')).toHaveTextContent('core test');
  });

  it('provides language context inside core preset', async () => {
    const { useLanguage } = await import('@/contexts/LanguageContext');

    function LangConsumer() {
      const { mode } = useLanguage();
      return <div data-testid="lang-mode">{mode}</div>;
    }

    renderWithProviders(<LangConsumer />, { preset: 'core' });
    expect(screen.getByTestId('lang-mode')).toBeInTheDocument();
  });

  it('provides theme context inside core preset', async () => {
    const { useThemeContext } = await import('@/contexts/ThemeContext');

    function ThConsumer() {
      const { theme } = useThemeContext();
      return <div data-testid="theme-val">{theme}</div>;
    }

    renderWithProviders(<ThConsumer />, { preset: 'core' });
    expect(screen.getByTestId('theme-val')).toBeInTheDocument();
  });

  it('accepts provider overrides to add individual providers', () => {
    renderWithProviders(<div data-testid="override">override test</div>, {
      preset: 'core',
      providers: { TTS: true },
    });
    expect(screen.getByTestId('override')).toHaveTextContent('override test');
  });

  it('returns all @testing-library/react render utilities', () => {
    const result = renderWithProviders(<div>test</div>);
    expect(result).toHaveProperty('unmount');
    expect(result).toHaveProperty('container');
    expect(result).toHaveProperty('rerender');
    expect(result).toHaveProperty('asFragment');
    expect(result).toHaveProperty('baseElement');
  });

  it('exports ProviderName and RenderWithProvidersOptions types', () => {
    // Type-level test: these should compile without error
    const preset: RenderWithProvidersOptions = { preset: 'full' };
    const name: ProviderName = 'Auth';
    expect(preset.preset).toBe('full');
    expect(name).toBe('Auth');
  });
});
