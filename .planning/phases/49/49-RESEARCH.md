# Phase 49: Error Handling + Security - Research

**Researched:** 2026-03-19
**Domain:** React error boundaries, error sanitization, bilingual error UX, provider ordering validation
**Confidence:** HIGH

## Summary

Phase 49 hardens user-facing error handling across a bilingual (English + Burmese) Next.js 16 App Router PWA. The codebase already has mature error infrastructure -- `errorSanitizer.ts` (363 LOC, 19 pattern groups), `sentry.ts` (216 LOC, PII stripping + fingerprinting), and a class-based `ErrorBoundary.tsx` (195 LOC) with bilingual fallback. The work is connecting these existing assets: sanitizing the 3 `error.tsx` files that currently expose raw `error.message`, adding component-level error boundaries to 4 session components with cleanup callbacks, implementing a dev-mode provider ordering guard, and migrating 5-7 high-impact `console.error` calls to structured `captureError()`.

The key architectural challenge is bridging React's class-component ErrorBoundary requirement with functional hooks needed for session cleanup (nav lock release, audio cancellation, TTS cancel). The HOC wrapper pattern (`withSessionErrorBoundary`) solves this by having a functional wrapper capture refs and pass an `onError` callback to the class boundary. All 4 target session components auto-save to IndexedDB every 5 seconds, so the error boundary does NOT need to re-save -- it relies on the existing snapshot being max 5 seconds old.

**Primary recommendation:** Extract a `SharedErrorFallback` presentational component from the existing `ErrorBoundary.tsx` inline fallback, then reuse it in both error.tsx files and component-level boundaries. Use the existing `sanitizeError()` and `captureError()` functions as-is -- they are battle-tested with 90%+ coverage.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Create shared `SharedErrorFallback` presentational component -- both ErrorBoundary (class) and error.tsx (functional) import it
- Props: `message: BilingualMessage`, `showBurmese: boolean`, `onRetry?: () => void`, `onGoHome?: () => void`
- Language detection: `useLanguage()` hook in error.tsx (it IS inside provider tree) with localStorage fallback for safety
- Both "Try again" and "Return home" buttons on all error pages -- matches existing ErrorBoundary pattern
- Warm, anxiety-reducing tone matching existing errorSanitizer messages -- "Something went wrong" not "FATAL ERROR"
- error.tsx calls `sanitizeError(error)` before rendering -- never display raw error.message
- global-error.tsx and not-found.tsx also get bilingual treatment
- Myanmar text uses `font-myanmar` class, min 12px, line-height 1.6, no letter-spacing
- Both page-level AND session-level boundaries for defense in depth
- HOC wrapper pattern (`withSessionErrorBoundary`) bridges class-based ErrorBoundary with functional hooks
- Session save strategy: rely on existing 5-second auto-save interval -- snapshot already in IndexedDB, don't re-save in error handler
- CelebrationOverlay gets boundary in GlobalOverlays with `fallback={null}` -- silent failure, post-session, no data to save
- Validation hook rendered as `<ProviderOrderGuard />` null component at bottom of provider tree in ClientProviders.tsx
- Dev-mode only (`process.env.NODE_ENV === 'development'`) -- zero production overhead
- Console.warn with correct ordering reference and link to learnings file -- will NOT crash the app
- Convert 5-7 high-impact `console.error` calls to `captureError(error, { context })` for structured Sentry observability
- Target: session save catch blocks (TestPage, InterviewSession, PracticePage), auth errors (AuthPage), social errors (SocialOptInFlow)
- Leave dev-only debug logging with `// keep for dev` comment

### Claude's Discretion
- Exact SharedErrorFallback component styling (within design system constraints)
- Provider guard exact error message wording
- Which specific console.error calls beyond the 5 core targets to convert
- Whether to add per-file coverage thresholds for new src/lib/ files created in this phase
- Test structure for providerOrderGuard (co-located vs centralized)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ERRS-01 | All 3 error.tsx files use `sanitizeError()` to prevent raw message exposure | SharedErrorFallback component pattern; sanitizeError() exists and is tested (363 LOC, 90%+ coverage); error.tsx currently displays `error.message` raw on line 22 |
| ERRS-02 | All 3 error.tsx files render bilingual error messages with "Return home" navigation | SharedErrorFallback with BilingualMessage type; useLanguage() works in error.tsx (inside provider tree per layout.tsx); localStorage fallback for global-error.tsx |
| ERRS-03 | Component-level error boundaries on InterviewSession, PracticeSession, TestPage, CelebrationOverlay | withSessionErrorBoundary HOC pattern; existing ErrorBoundary class component already has onError prop; wrap in page components (InterviewPage, PracticePage, TestPage, GlobalOverlays) |
| ERRS-04 | Error boundaries trigger session save in `componentDidCatch` to prevent data loss | Resolved: rely on existing 5-second auto-save. Error boundary cleanup focuses on resource release (audio, timers, nav lock), not re-saving. Snapshot is max 5s old |
| ERRS-06 | Provider ordering dev-mode runtime guard validates mount order in ClientProviders.tsx | ProviderOrderGuard null component; calls all 11 context hooks in try-catch; renders as last child inside NavigationProvider; dev-mode console.warn only |
| DX-03 | Console output in production replaced with structured `captureError()` where impactful | 5-7 high-impact targets identified: TestPage:359, AuthPage:58, SocialOptInFlow:71, AddToDeckButton:73, GoogleOneTapSignIn:30/89; use existing captureError() from sentry.ts |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.x | Error boundaries (class components) | React 19 still requires class components for error boundaries; getDerivedStateFromError + componentDidCatch lifecycle |
| @sentry/nextjs | (existing) | Error capture + PII stripping | Already installed, captureError() wrapper exists in src/lib/sentry.ts |
| errorSanitizer.ts | N/A (local) | BilingualMessage error mapping | 19 pattern groups, 16 sensitive data filters, 90%+ test coverage -- DO NOT MODIFY |
| lucide-react | (existing) | Error icons (AlertCircle, Home, RefreshCw) | Already used throughout app |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| idb-keyval | (existing) | IndexedDB session persistence | Session snapshot reads for auto-save verification |
| vitest | (existing) | Test framework | Unit tests for ProviderOrderGuard, SharedErrorFallback, error.tsx |
| @testing-library/react | (existing) | Component testing | Render error boundaries with ThrowError test component |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Class ErrorBoundary | react-error-boundary | Would add dependency; existing class component is 195 LOC, well-tested, and already handles bilingual fallback. Not worth the migration risk. |
| HOC wrapper | Render props | HOC is cleaner for this case -- each page wraps its session component once. Render props would require restructuring page components. |
| Runtime provider guard | ESLint rule | Compile-time can't catch dynamic ordering. Runtime guard catches actual mount-time violations in dev mode. |

**Installation:**
```bash
# No new dependencies needed. All libraries already installed.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    ui/
      SharedErrorFallback.tsx   # NEW: shared presentational error UI
    ErrorBoundary.tsx            # MODIFY: import SharedErrorFallback, keep onError prop
    ClientProviders.tsx          # MODIFY: add ProviderOrderGuard as last child
    GlobalOverlays.tsx           # MODIFY: wrap CelebrationOverlay in ErrorBoundary
  lib/
    providerOrderGuard.ts       # NEW: dev-mode provider ordering validation
    errorSanitizer.ts            # READ ONLY: do not modify
    sentry.ts                    # READ ONLY: use captureError()
  views/
    InterviewPage.tsx            # MODIFY: wrap InterviewSession with error boundary
    PracticePage.tsx             # MODIFY: wrap PracticeSession with error boundary
    TestPage.tsx                 # MODIFY: wrap content with error boundary, cleanup
  __tests__/
    providerOrderGuard.test.ts   # NEW: guard unit tests
app/
  error.tsx                      # MODIFY: sanitizeError + SharedErrorFallback
  global-error.tsx               # MODIFY: bilingual inline HTML fallback
  not-found.tsx                  # MODIFY: bilingual 404
```

### Pattern 1: SharedErrorFallback (Presentational Component)
**What:** A single presentational component used by both class ErrorBoundary and functional error.tsx files.
**When to use:** All error display surfaces -- ErrorBoundary, error.tsx, not-found.tsx.
**Example:**
```typescript
// src/components/ui/SharedErrorFallback.tsx
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import type { BilingualMessage } from '@/lib/errorSanitizer';

interface SharedErrorFallbackProps {
  message: BilingualMessage;
  showBurmese: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function SharedErrorFallback({
  message,
  showBurmese,
  onRetry,
  onGoHome,
}: SharedErrorFallbackProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl bg-muted/30 p-8 text-center">
        {/* Amber warning icon -- NOT red/destructive */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-8 w-8 text-warning" />
        </div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">{message.en}</h2>
        {showBurmese && (
          <p className="mb-8 text-lg text-foreground font-myanmar">{message.my}</p>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Try again</span>
            </button>
          )}
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Home className="h-5 w-5" />
              <span>Return home</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Pattern 2: Session Error Boundary HOC
**What:** Functional HOC that bridges hooks (useNavigation, audio refs) with class ErrorBoundary's onError callback.
**When to use:** Wrapping InterviewSession, PracticeSession, TestPage content where cleanup is needed on error.
**Example:**
```typescript
// Pattern: wrap session content in page component
function InterviewPage() {
  const { setLock } = useNavigation();

  const handleSessionError = useCallback((error: Error, errorInfo: ErrorInfo) => {
    // Release navigation lock so user isn't trapped
    setLock(false);
    // Report to Sentry with context
    captureError(error, {
      component: 'InterviewSession',
      componentStack: errorInfo.componentStack || 'unknown',
    });
  }, [setLock]);

  return (
    <ErrorBoundary onError={handleSessionError}>
      <InterviewSession {...props} />
    </ErrorBoundary>
  );
}
```

### Pattern 3: ProviderOrderGuard (Dev-Mode Null Component)
**What:** A component that renders null but validates provider ordering by calling all context hooks.
**When to use:** Placed as last child inside NavigationProvider in ClientProviders.tsx.
**Example:**
```typescript
// src/lib/providerOrderGuard.ts
export function ProviderOrderGuard(): null {
  if (process.env.NODE_ENV !== 'development') return null;

  const EXPECTED_ORDER = [
    'ErrorBoundary', 'AuthProvider', 'LanguageProvider', 'ThemeProvider',
    'TTSProvider', 'ToastProvider', 'OfflineProvider', 'SocialProvider',
    'SRSProvider', 'StateProvider', 'NavigationProvider',
  ];

  // Each hook call validates its provider is mounted above this point
  try { useAuth(); } catch { console.warn(`[ProviderOrderGuard] AuthProvider missing or misordered.\nExpected: ${EXPECTED_ORDER.join(' > ')}`); }
  try { useLanguage(); } catch { console.warn(`[ProviderOrderGuard] LanguageProvider missing or misordered.`); }
  // ... repeat for all context hooks

  return null;
}
```

### Pattern 4: error.tsx Sanitization
**What:** Next.js App Router error.tsx receives `error` and `reset`. Must sanitize before display.
**When to use:** All 3 error files.
**Example:**
```typescript
// app/error.tsx
'use client';
import { useEffect } from 'react';
import { sanitizeError } from '@/lib/errorSanitizer';
import { captureError } from '@/lib/sentry';
import { SharedErrorFallback } from '@/components/ui/SharedErrorFallback';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Language from hook (error.tsx is inside provider tree per layout.tsx)
  let showBurmese = true;
  try {
    const lang = useLanguage();
    showBurmese = lang.showBurmese;
  } catch {
    // Fallback to localStorage if hook fails
    try {
      showBurmese = localStorage.getItem('civic-test-language-mode') !== 'english-only';
    } catch {}
  }

  useEffect(() => {
    captureError(error, { source: 'error.tsx', digest: error.digest });
  }, [error]);

  const message = sanitizeError(error);

  return (
    <SharedErrorFallback
      message={message}
      showBurmese={showBurmese}
      onRetry={reset}
      onGoHome={() => { window.location.href = '/'; }}
    />
  );
}
```

### Pattern 5: global-error.tsx (Minimal HTML Fallback)
**What:** Catastrophic error page with inline styles only (CSS may be broken). Hardcoded bilingual text.
**When to use:** When root layout itself crashes.
**Example:**
```typescript
// app/global-error.tsx -- NO Tailwind, NO hooks, NO providers
'use client';
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto', marginTop: '20vh' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            {'\u1010\u1005\u103A\u1001\u102F\u1001\u102F \u1019\u103E\u102C\u1038\u101A\u103D\u1004\u103A\u1038\u101E\u103D\u102C\u1038\u101E\u100A\u103A\u104B'}
          </p>
          <button onClick={reset} style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', cursor: 'pointer', borderRadius: '0.5rem', border: 'none', background: 'hsl(217, 91%, 60%)', color: 'white' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
```

### Anti-Patterns to Avoid
- **Displaying raw error.message:** Never show `error.message` to users. Always pass through `sanitizeError()` first.
- **Re-saving session in error boundary:** The auto-save interval (5s) means state is already persisted. Re-saving in componentDidCatch risks race conditions with the interval.
- **Using hooks in class ErrorBoundary:** React error boundaries must be class components. Use the HOC wrapper pattern to bridge hooks.
- **Throwing in ProviderOrderGuard:** Guard must WARN, not crash. Use console.warn inside try-catch, not throw.
- **Using destructive (red) color for error cards:** Use warning (amber) for error icons. Destructive is reserved for data-loss actions only.
- **Adding letter-spacing to Myanmar text:** Myanmar is an abugida -- even 0.01em disrupts glyph connections.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Error message sanitization | Custom regex filters per error.tsx | `sanitizeError()` from errorSanitizer.ts | 19 pattern groups, 16 sensitive data filters, 90%+ test coverage. Battle-tested. |
| PII stripping for Sentry | Manual field-by-field cleanup | `captureError()` from sentry.ts | Handles hashing, PII stripping, fingerprinting. Already integrated with beforeSendHandler. |
| Bilingual message types | Inline `{ en: string, my: string }` | `BilingualMessage` from errorSanitizer.ts | Type consistency across all error surfaces. |
| Error boundary class component | Custom class from scratch | Extend existing `ErrorBoundary.tsx` | Already has getDerivedStateFromError, componentDidCatch, Sentry reporting, bilingual fallback, onError prop. |
| Provider ordering validation | ESLint plugin or build-time analysis | Runtime hook validation in dev mode | Catches actual mount-time violations. ESLint can't detect dynamic ordering. |

**Key insight:** The codebase already has 95% of the error handling infrastructure. Phase 49 is about connecting the dots -- making error.tsx use sanitizeError(), making session components use ErrorBoundary, and adding the provider guard.

## Common Pitfalls

### Pitfall 1: error.tsx Exposing Raw Error Messages
**What goes wrong:** `error.message` contains SQL queries, table names, stack traces, UUIDs, or email addresses. Displayed raw to users.
**Why it happens:** Next.js error.tsx receives the raw Error object. Default templates display error.message directly.
**How to avoid:** Always call `sanitizeError(error)` before rendering. Check `containsSensitiveData()` as safety net.
**Warning signs:** Any `{error.message}` or `{error.toString()}` in error.tsx JSX.

### Pitfall 2: Navigation Lock Not Released on Session Crash
**What goes wrong:** TestPage/InterviewPage crash while navigation is locked. User is trapped -- can't navigate away from broken page.
**Why it happens:** `setLock(true)` was called but error boundary doesn't call `setLock(false)` before showing fallback.
**How to avoid:** Error boundary's `onError` callback MUST call `setLock(false)`. This is the MOST CRITICAL cleanup item for TestPage.
**Warning signs:** User sees error fallback but back button / nav menu doesn't work.

### Pitfall 3: Class ErrorBoundary Can't Call Hooks
**What goes wrong:** Attempting to use `useNavigation()` or `useLanguage()` inside ErrorBoundary class methods.
**Why it happens:** React hooks only work in functional components. Error boundaries must be class components.
**How to avoid:** HOC wrapper pattern -- functional component captures hooks and passes callbacks via props/onError.
**Warning signs:** "Invalid hook call" error in componentDidCatch.

### Pitfall 4: global-error.tsx Using Tailwind Classes
**What goes wrong:** global-error.tsx styles don't render because CSS failed to load (the very reason this page is showing).
**Why it happens:** global-error.tsx fires when the root layout itself crashes. CSS imports in layout.tsx may not have loaded.
**How to avoid:** Use inline styles ONLY in global-error.tsx. Hardcode bilingual text (no hooks, no localStorage).
**Warning signs:** Unstyled HTML when root layout error occurs.

### Pitfall 5: Myanmar Typography Rules Violated in Error Messages
**What goes wrong:** Burmese text illegible, glyph connections broken, characters clipped.
**Why it happens:** Missing `font-myanmar` class, using letter-spacing, font-size below 12px, line-height below 1.6.
**How to avoid:** Always apply `font-myanmar` class. Never add letter-spacing. Use `text-lg` (18px) minimum for error messages. line-height 1.6.
**Warning signs:** Burmese text looks "spaced out" or characters appear disconnected.

### Pitfall 6: useLanguage() Called Unconditionally in error.tsx
**What goes wrong:** Hook rules violation if called conditionally inside try-catch.
**Why it happens:** Developer wraps useLanguage() in try-catch for safety, violating Rules of Hooks.
**How to avoid:** Call useLanguage() unconditionally at component top level. Handle the edge case by reading localStorage as a separate fallback mechanism outside the hook.
**Warning signs:** React warning about hooks called conditionally.

### Pitfall 7: Provider Guard Crashing the App
**What goes wrong:** ProviderOrderGuard throws instead of warning, crashing the entire app in development.
**Why it happens:** Forgetting to wrap hook calls in try-catch, or using throw instead of console.warn.
**How to avoid:** Every hook call in ProviderOrderGuard MUST be in try-catch. Use console.warn only. Guard must be no-op in production.
**Warning signs:** App crashes on mount with "useX must be used within XProvider" error.

### Pitfall 8: Testing Error Boundaries Without Suppressing Console
**What goes wrong:** Test output flooded with console.error from React's error boundary logging.
**Why it happens:** React logs errors to console when error boundaries catch them. This is expected behavior.
**How to avoid:** Use `console.error = vi.fn()` in beforeEach and restore in afterEach (pattern from existing errorBoundary.test.tsx).
**Warning signs:** Noisy test output that looks like failures but tests pass.

## Code Examples

### Error Boundary Cleanup Per Session Component

**InterviewSession cleanup (most complex):**
```typescript
const handleInterviewError = useCallback((error: Error, errorInfo: ErrorInfo) => {
  // 1. Release navigation lock
  setLock(false);
  // 2. Report to Sentry
  captureError(error, { component: 'InterviewSession', componentStack: errorInfo.componentStack });
}, [setLock]);
```
Note: Audio/TTS/timer cleanup happens automatically via React's useEffect cleanup when the component unmounts (which the error boundary triggers). The error boundary does NOT need to manually cancel audio -- unmounting the component tree handles it.

**TestPage cleanup (CRITICAL -- nav lock):**
```typescript
const handleTestError = useCallback((error: Error, errorInfo: ErrorInfo) => {
  setLock(false); // MUST release -- traps user otherwise
  captureError(error, { component: 'TestPage', componentStack: errorInfo.componentStack });
}, [setLock]);
```

**CelebrationOverlay (silent failure):**
```typescript
// In GlobalOverlays.tsx
<ErrorBoundary fallback={null}>
  <CelebrationOverlay />
</ErrorBoundary>
```

### DX-03 Console Migration Pattern

```typescript
// BEFORE (TestPage.tsx line 359):
} catch (error) {
  console.error(error);
  hasSavedSessionRef.current = false;
  showWarning({ ... });
}

// AFTER:
} catch (error) {
  captureError(error, { operation: 'saveTestSession', component: 'TestPage' });
  hasSavedSessionRef.current = false;
  showWarning({ ... });
}
```

Target files for DX-03 migration:
| File | Line | Operation | Impact |
|------|------|-----------|--------|
| `src/views/TestPage.tsx` | 359 | Session save failure | User loses test results |
| `src/views/AuthPage.tsx` | 58 | Auth redirect failure | User stuck on auth page |
| `src/components/social/SocialOptInFlow.tsx` | 71 | Social opt-in failure | Feature broken silently |
| `src/components/srs/AddToDeckButton.tsx` | 73 | SRS deck toggle failure | Study progress lost |
| `src/components/GoogleOneTapSignIn.tsx` | 30, 89 | Google OAuth failure | Auth broken silently |

### ProviderOrderGuard Test Pattern

```typescript
// src/__tests__/providerOrderGuard.test.ts
import { vi, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProviderOrderGuard } from '@/lib/providerOrderGuard';

describe('ProviderOrderGuard', () => {
  it('logs warning when providers are missing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'development');

    // Render without any providers -- should warn
    render(<ProviderOrderGuard />);

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it('does nothing in production', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubEnv('NODE_ENV', 'production');

    render(<ProviderOrderGuard />);

    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| English-only error pages | Bilingual error pages with sanitization | Phase 49 (now) | All error surfaces show en/my text |
| Raw error.message display | sanitizeError() -> BilingualMessage | Phase 38 (sanitizer created) | PII never exposed to users |
| No component-level boundaries | Session-aware error boundaries | Phase 49 (now) | Crashes contained to session, not full app |
| No provider ordering validation | Dev-mode runtime guard | Phase 49 (now) | Ordering bugs caught before production |
| console.error for observability | captureError() -> Sentry | Phase 38 (sentry.ts created), Phase 49 (migration) | Production errors visible in dashboard |

**Deprecated/outdated:**
- `react-error-boundary` npm package: Not needed. The codebase has a well-tested 195 LOC class component that already handles all project-specific requirements (bilingual fallback, onError prop, Sentry reporting, localStorage language detection).

## Open Questions

1. **useLanguage() in error.tsx hook rules compliance**
   - What we know: error.tsx is a functional component inside the provider tree (layout.tsx wraps children in ClientProviders). useLanguage() should work.
   - What's unclear: If error.tsx renders during provider initialization failure, useLanguage() may throw. The hook must be called unconditionally (Rules of Hooks) but may fail at runtime.
   - Recommendation: Call useLanguage() unconditionally at top level. If it throws during render, React will bubble up to global-error.tsx. Add a try-catch localStorage fallback OUTSIDE the hook call for the showBurmese value only, or use a wrapper approach.

2. **Whether InterviewSession audio cleanup needs explicit handling in error boundary**
   - What we know: React's useEffect cleanup runs when components unmount. Error boundary unmounts the child tree.
   - What's unclear: Whether all 3 audio player refs, speech recognition, and MediaRecorder cleanup in useEffect return functions run reliably during error boundary unmount.
   - Recommendation: Rely on React's cleanup. If testing reveals orphaned audio, add explicit cleanup in onError callback. Start simple.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x + @testing-library/react |
| Config file | vitest.config.ts |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:run && pnpm lint && pnpm typecheck && pnpm build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ERRS-01 | error.tsx uses sanitizeError, never shows raw message | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Partial (existing tests cover ErrorBoundary, not error.tsx) |
| ERRS-02 | error.tsx renders bilingual with "Return home" | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Partial (bilingual tests exist for ErrorBoundary) |
| ERRS-03 | Component-level boundaries on 4 session components | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Wave 0 (extend existing test file) |
| ERRS-04 | Error boundary triggers cleanup on catch | unit | `pnpm test:run -- src/__tests__/errorBoundary.test.tsx` | Wave 0 (add onError callback tests) |
| ERRS-06 | Provider ordering guard validates mount order | unit | `pnpm test:run -- src/__tests__/providerOrderGuard.test.ts` | Wave 0 (new file) |
| DX-03 | console.error replaced with captureError | manual-only | Visual inspection of code changes | N/A (code review, not behavioral test) |

### Sampling Rate
- **Per task commit:** `pnpm test:run`
- **Per wave merge:** `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/__tests__/providerOrderGuard.test.ts` -- covers ERRS-06
- [ ] Extend `src/__tests__/errorBoundary.test.tsx` -- add SharedErrorFallback tests, onError callback verification
- [ ] No framework install needed -- Vitest + RTL already configured

## Sources

### Primary (HIGH confidence)
- `src/components/ErrorBoundary.tsx` -- existing 195 LOC class component with bilingual fallback, onError prop
- `src/lib/errorSanitizer.ts` -- 363 LOC, 19 pattern groups, BilingualMessage type, containsSensitiveData
- `src/lib/sentry.ts` -- captureError(), beforeSendHandler with fingerprinting and PII stripping
- `src/components/ClientProviders.tsx` -- canonical provider nesting order (11 providers)
- `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx` -- current error pages (all English-only, raw message display)
- `src/views/InterviewPage.tsx`, `PracticePage.tsx`, `TestPage.tsx` -- session components needing boundaries
- `src/components/GlobalOverlays.tsx` -- CelebrationOverlay wrapper location
- `.claude/learnings/provider-ordering.md` -- provider ordering constraints and historical bugs
- `.claude/learnings/myanmar-typography.md` -- Myanmar font rules
- `.planning/phases/49/49-CONTEXT.md` -- locked decisions from discuss-phase
- `.planning/phases/49/49-PRECONTEXT-RESEARCH.md` -- 12-agent deep analysis with gotcha inventory
- `.planning/phases/49/49-UI-SPEC.md` -- visual contracts for error fallback UI
- `.planning/phases/49/49-ENHANCEMENT-RECOMMENDATIONS.md` -- prioritized recommendations

### Secondary (MEDIUM confidence)
- `src/__tests__/errorBoundary.test.tsx` -- existing test patterns for error boundary
- `src/__tests__/utils/renderWithProviders.tsx` -- provider presets for testing
- `src/components/ui/ErrorFallback.tsx` -- existing inline error fallback (different from SharedErrorFallback -- this is for data loading errors, not boundary crashes)

### Tertiary (LOW confidence)
- None. All findings verified against codebase sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- patterns derived from existing codebase patterns (ErrorBoundary.tsx, ClientProviders.tsx)
- Pitfalls: HIGH -- verified against actual code (raw error.message in error.tsx, setLock in TestPage, etc.)

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (stable -- no fast-moving dependencies)
