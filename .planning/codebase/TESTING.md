# Testing Patterns

**Analysis Date:** 2026-03-19

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vitest.config.ts`
- Environment: `jsdom` (browser simulation)
- Globals: enabled (`describe`, `it`, `expect`, `vi` available without imports, though most tests import explicitly)

**Assertion Library:**
- `@testing-library/jest-dom` (via `vitest` adapter) — `toBeInTheDocument`, `toHaveAttribute`, etc.
- `vitest-axe` — `toHaveNoViolations` for axe-based a11y assertions

**Run Commands:**
```bash
pnpm test              # Vitest watch mode
pnpm test:run          # Single run (CI)
pnpm test:coverage     # Single run with v8 coverage
```

## Test File Organization

**Location:** Mixed — two patterns coexist:
1. **Co-located**: `src/lib/**/*.test.ts` and `src/hooks/*.test.ts` live next to their source files
2. **Centralized**: `src/__tests__/` for cross-cutting tests (ErrorBoundary, integration, a11y)

**Naming:**
- `<filename>.test.ts` for pure TypeScript (lib functions, hooks without JSX)
- `<filename>.test.tsx` for components and hooks requiring JSX rendering
- a11y tests in `src/__tests__/a11y/` subdirectory: `<component>.a11y.test.tsx`
- Integration tests in `src/__tests__/`: `<feature>.integration.test.tsx`

**Structure:**
```
src/
  __tests__/
    a11y/
      feedbackPanel.a11y.test.tsx
      toast.a11y.test.tsx
    errorBoundary.test.tsx
    errorSanitizer.test.ts
    navigationLock.test.ts
    proxy.test.ts
    saveSession.test.ts
    shuffle.test.ts
    tts.integration.test.tsx
    setup.ts                        ← global setup file
  lib/
    async/
      safeAsync.test.ts             ← co-located with safeAsync.ts
      withRetry.test.ts
    social/
      streakTracker.test.ts
      streakSync.test.ts
      badgeEngine.test.ts
      compositeScore.test.ts
    srs/
      fsrsEngine.test.ts
    mastery/
      calculateMastery.test.ts
      weakAreaDetection.test.ts
      nudgeMessages.test.ts
    bookmarks/
      bookmarkSync.test.ts
    settings/
      settingsSync.test.ts
    readiness/
      readinessEngine.test.ts
      drillSelection.test.ts
    nba/
      determineNBA.test.ts
    sort/
      sortReducer.test.ts
    studyPlan/
      studyPlanEngine.test.ts
    audio/
      audioPrecache.test.ts
      burmeseAudio.test.ts
    ttsCore.test.ts
    interview/
      answerGrader.test.ts
  hooks/
    useAutoRead.test.ts
  components/
    interview/
      KeywordHighlight.test.tsx
  constants/
    questions/
      questions.test.ts
```

## Global Test Setup

File: `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom/vitest';
import * as matchers from 'vitest-axe/matchers';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';

// Register vitest-axe matchers globally
expect.extend(matchers);

// Cleanup DOM after each test
afterEach(() => { cleanup(); });

// window.matchMedia mock (media query support)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// window.speechSynthesis mock (configurable so ttsCore.test.ts can override)
Object.defineProperty(window, 'speechSynthesis', {
  writable: true, configurable: true,
  value: { speak: vi.fn(), cancel: vi.fn(), /* ... */ },
});
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('FeatureName', () => {
  describe('subcategory', () => {
    beforeEach(() => { /* setup */ });
    afterEach(() => { /* cleanup */ });

    it('does specific thing in specific scenario', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

**Fake timers pattern (time-dependent tests):**
```typescript
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-02-08T12:00:00')); });
afterEach(() => { vi.useRealTimers(); });

// Inside test:
const promise = withRetry(fn, { baseDelayMs: 1000 });
await vi.advanceTimersByTimeAsync(1000);
const result = await promise;
```

**Async React tests:**
```typescript
import { render, screen, fireEvent, act } from '@testing-library/react';

await act(async () => {
  render(<TTSProvider><SpeechButton text="Hello" label="Listen" /></TTSProvider>);
  vi.advanceTimersByTime(10); // flush idle callbacks
});
const button = screen.getByRole('button', { name: /listen/i });
```

**Hook testing:**
```typescript
import { renderHook, act } from '@testing-library/react';

const { rerender, unmount } = renderHook(
  ({ triggerKey }) => useAutoRead({ text: 'Hello', enabled: true, triggerKey }),
  { initialProps: { triggerKey: 0 } }
);
act(() => { vi.advanceTimersByTime(400); });
rerender({ triggerKey: 1 });
```

## Mocking

**Framework:** `vi.mock` (Vitest's module mocking)

**Mocking Supabase:**
```typescript
// Pattern used in bookmarkSync.test.ts, settingsSync.test.ts, streakSync.test.ts
const mockUpsert = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn((table: string) => ({
      upsert: mockUpsert,
      select: mockSelect,
    })),
  },
}));
```

**Mocking Sentry:**
```typescript
// Pattern used everywhere Sentry is called
vi.mock('@/lib/sentry', () => ({
  captureError: vi.fn(),
}));
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));
// Access mocked function:
const mockedCaptureError = vi.mocked(captureError);
```

**Mocking auth context (SupabaseAuthContext):**
```typescript
// Needed when testing components that use contexts depending on useAuth
vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({ user: null }),
}));
```

**Mocking hooks in component tests:**
```typescript
// Pattern from feedbackPanel.a11y.test.tsx
vi.mock('@/hooks/useTTS', () => ({
  useTTS: () => ({
    speak: vi.fn(), stop: vi.fn(), isSpeaking: false,
    currentText: null, error: null,
  }),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => true, // skip animations in tests
}));
```

**Mocking custom hook for isolated testing:**
```typescript
// Pattern from useAutoRead.test.ts
const mockSpeak = vi.fn<(text: string, opts?: { lang?: string }) => Promise<void>>();
const mockCancel = vi.fn();

vi.mock('./useTTS', () => ({
  useTTS: () => ({ speak: mockSpeak, cancel: mockCancel, /* ... */ }),
}));

// Import hook AFTER mock setup
import { useAutoRead } from './useAutoRead';

beforeEach(() => {
  mockSpeak.mockReset();
  mockSpeak.mockResolvedValue(undefined);
});
```

**Mocking SpeechSynthesis (TTS):**
```typescript
// Pattern from tts.integration.test.tsx — replaces global setup mock with detailed mock
class MockUtterance {
  text: string;
  onend: ((ev: SpeechSynthesisEvent) => void) | null = null;
  constructor(text = '') { this.text = text; }
}
(window as any).SpeechSynthesisUtterance = MockUtterance;

function installMock() {
  const mockSynth = {
    speak: vi.fn((utterance) => {
      storedUtterances.push(utterance);
      setTimeout(() => utterance.onend?.(new Event('end') as SpeechSynthesisEvent), 0);
    }),
    cancel: vi.fn(),
    getVoices: vi.fn().mockReturnValue([]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  (window as any).speechSynthesis = mockSynth;
  return mockSynth;
}
```

**Mocking localStorage:**
```typescript
// Pattern from KeywordHighlight.test.tsx when provider needs it
beforeAll(() => {
  const store: Record<string, string> = {};
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
      clear: vi.fn(() => { Object.keys(store).forEach(key => delete store[key]); }),
    },
    writable: true, configurable: true,
  });
});
```

**Mocking `withRetry` for sync-dependent tests:**
```typescript
vi.mock('@/lib/async', () => ({
  withRetry: vi.fn(async (fn: () => Promise<unknown>) => fn()),
}));
```

**What to Mock:**
- External services: Supabase client, Sentry
- Browser APIs not in jsdom: `speechSynthesis`, `requestIdleCallback`, `matchMedia`
- Context dependencies when testing a child component or hook in isolation
- Network/async operations in unit tests (mock resolved/rejected values)

**What NOT to Mock:**
- Pure logic functions under test (test them directly)
- The module being tested
- `vi.useFakeTimers()` + `vi.advanceTimersByTime()` preferred over mocking `setTimeout` directly

## Render Helper Pattern

Components that need providers use local wrapper functions:

```typescript
// Simple wrapper
function renderWithProviders(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

// Integration test: render inside real provider
function renderButton(props: { text: string; label: string }) {
  return render(
    <TTSProvider>
      <SpeechButton {...props} />
    </TTSProvider>
  );
}
```

No shared test utility file — each test file defines its own wrapper as needed.

## Accessibility Tests

**Framework:** `vitest-axe` (wraps axe-core)

**Pattern:**
```typescript
import { axe } from 'vitest-axe';

it('has no a11y violations', async () => {
  const { container } = render(<FeedbackPanel {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Location:** `src/__tests__/a11y/` for dedicated a11y suites (FeedbackPanel, Toast)

**What's tested:**
- Correct ARIA roles and attributes on interactive components
- No axe violations on feedback UI, toast notifications
- `aria-live` region presence on toast container
- `aria-pressed` state on speech buttons

## Coverage

**Provider:** V8 (native, fast)
**Reporters:** `text`, `json`, `json-summary`, `html`

**File-level thresholds (per-file enforced by Vitest):**
```
src/lib/shuffle.ts:           100% lines/functions/branches/statements
src/lib/errorSanitizer.ts:     90% lines/functions/branches/statements
src/components/ErrorBoundary.tsx: 70% lines/functions/branches/statements
src/lib/saveSession.ts:         70% lines/functions/branches/statements
```

**No global threshold** — coverage is enforced only on critical files listed above.

**View Coverage:**
```bash
pnpm test:coverage              # generates coverage/ directory
open coverage/index.html        # HTML report
```

## What's Tested

**Well-covered (dedicated test suite):**
- `src/lib/async/safeAsync.ts` — all branches, error wrapping, Sentry reporting
- `src/lib/async/withRetry.ts` — exponential backoff, retry conditions, custom `shouldRetry`
- `src/lib/shuffle.ts` — 100% threshold enforced
- `src/lib/errorSanitizer.ts` — 90% threshold enforced; PII stripping, bilingual messages
- `src/lib/social/streakTracker.ts` — date math, freeze mechanics, edge cases
- `src/lib/social/streakSync.ts` — Supabase mock, merge logic
- `src/lib/social/badgeEngine.ts` — badge unlock conditions
- `src/lib/srs/fsrsEngine.ts` — card creation, grading, due dates (with fake timers)
- `src/lib/mastery/calculateMastery.ts` — category mastery computation
- `src/lib/mastery/weakAreaDetection.ts` — weak area identification
- `src/lib/mastery/nudgeMessages.ts` — message selection logic
- `src/lib/bookmarks/bookmarkSync.ts` — Supabase mock, merge/dedup
- `src/lib/settings/settingsSync.ts` — mapping to/from DB rows, Supabase mock
- `src/lib/nba/determineNBA.ts` — next best action decision tree
- `src/lib/readiness/readinessEngine.ts` — readiness score calculation
- `src/lib/readiness/drillSelection.ts` — drill question selection
- `src/lib/sort/sortReducer.ts` — sort state machine
- `src/lib/studyPlan/studyPlanEngine.ts` — study plan generation
- `src/lib/audio/audioPrecache.ts` — audio precaching logic
- `src/lib/audio/burmeseAudio.ts` — Burmese audio URL resolution
- `src/lib/ttsCore.ts` — TTS engine (speak, cancel, state machine)
- `src/lib/interview/answerGrader.ts` — keyword matching, confidence scoring
- `src/hooks/useAutoRead.ts` — trigger/cleanup/retry/delay behavior
- `src/components/ErrorBoundary.tsx` — 70% threshold; error catch, fallback UI, bilingual display
- `src/components/interview/KeywordHighlight.tsx` — highlight rendering, provider integration
- `src/__tests__/tts.integration.test.tsx` — TTSProvider + SpeechButton end-to-end
- `src/__tests__/a11y/feedbackPanel.a11y.test.tsx` — axe violations, ARIA
- `src/__tests__/a11y/toast.a11y.test.tsx` — toast ARIA structure
- `src/constants/questions/questions.test.ts` — question data integrity

**Untested areas (no test files):**
- All Context providers except TTSContext (integration test)
- Most hooks: `useBadges`, `useSRSDeck`, `useBookmarks`, `useSRSReview`, `useStreak`, `useReadinessScore`, etc.
- Page-level components (`src/views/`)
- Most feature components (`src/components/quiz/`, `src/components/practice/`, etc.)
- Navigation system (`src/components/navigation/`)
- Dashboard, hub, settings views
- Supabase Auth flow (`src/contexts/SupabaseAuthContext.tsx`)
- `src/lib/saveSession.ts` — 70% threshold enforced but gaps possible

## CI Integration

**Workflow:** `.github/workflows/ci.yml` — runs on push/PR to `main`

**Steps (in order):**
1. `pnpm install --frozen-lockfile`
2. `pnpm audit --prod --audit-level=high` (security audit)
3. `pnpm run typecheck`
4. `pnpm run lint`
5. `pnpm run format:check`
6. `pnpm run build`
7. `pnpm run test:coverage`
8. Upload coverage report as artifact (7-day retention)

**Pre-commit hook (Husky + lint-staged):**
```json
// .lintstagedrc.json
{
  "*.{ts,tsx}": ["pnpm exec eslint --fix", "pnpm exec prettier --write"],
  "*.{js,mjs,json,css}": ["pnpm exec prettier --write"]
}
```

**Full verification command (run before completing work):**
```bash
pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build
```

---

*Testing analysis: 2026-03-19*
