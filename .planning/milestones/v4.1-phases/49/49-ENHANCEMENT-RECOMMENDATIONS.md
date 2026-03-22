# Phase 49: Error Handling + Security — Enhancement Recommendations

**Generated:** 2026-03-19 via 12-agent deep research protocol

---

## Priority Matrix Summary

| Priority | Count | Items |
|----------|-------|-------|
| MUST-HAVE | 4 | E-01, E-02, E-03, E-04 |
| SHOULD-HAVE | 4 | E-05, E-06, E-07, E-08 |
| NICE-TO-HAVE | 4 | E-09, E-10, E-11, E-12 |

---

## MUST-HAVE

### E-01: Shared Error Fallback Presentational Component

**What:** Extract the error fallback UI from ErrorBoundary.tsx into a standalone `SharedErrorFallback` component. Both ErrorBoundary (class) and error.tsx (functional) import and render it.

**Why:** Currently ErrorBoundary.tsx has the bilingual fallback UI inline. error.tsx files have completely different English-only UI. This creates copy-paste drift. A shared component ensures visual consistency and reduces maintenance.

**Design compliance:** Glass-morphism tiers (glass-light for cards), 44px touch targets, warm coral destructive color, Myanmar typography rules, anxiety-reducing microcopy.

**Implementation hint:** Create `src/components/ui/SharedErrorFallback.tsx`. Accept props: `message: BilingualMessage`, `showBurmese: boolean`, `onRetry?: () => void`, `onGoHome?: () => void`, `icon?: ReactNode`. ErrorBoundary wraps it with localStorage language detection; error.tsx wraps it with `useLanguage()` hook.

---

### E-02: Session-Aware Error Boundary HOC

**What:** Create a `withSessionErrorBoundary` HOC that wraps session components, bridging functional hooks (session save, navigation lock release) with the class-based ErrorBoundary.

**Why:** ErrorBoundary is a class component (React 19 requirement) and can't call hooks. Session components need `saveSession()`, `setLock(false)`, and audio cleanup on error. The HOC pattern solves this cleanly.

**Design compliance:** No UI changes — this is architecture. Enables ERRS-03 (component boundaries) and ERRS-04 (session save on catch).

**Implementation hint:** Functional component calls `useNavigation()`, `useSessionPersistence()`, captures refs to cleanup functions. Passes `onError` callback to `<ErrorBoundary onError={handleSessionError}>`. In `handleSessionError`: clear audio, release nav lock, save session snapshot.

---

### E-03: Provider Ordering Validation Hook

**What:** Create `useProviderOrderValidation` hook, rendered as a `<ProviderOrderGuard />` null component at the bottom of the provider tree in ClientProviders.tsx. In dev mode, calls every context hook and logs violations.

**Why:** Provider ordering bugs have caused production crashes twice (Phase 46: useAuth outside AuthProvider). Current enforcement is only via test utility (renderWithProviders). Runtime guard catches issues during development before they reach CI or production.

**Design compliance:** Dev-mode only, zero production overhead. Clear console.warn messages with correct ordering reference.

**Implementation hint:** Create `src/lib/providerOrderGuard.ts`. Export `ProviderOrderGuard` component that calls `useAuth()`, `useLanguage()`, `useTheme()`, `useTTS()`, `useToast()`, `useOffline()`, `useSocial()`, `useSRS()`, `useState()`, `useNavigation()`. Each wrapped in try-catch with specific error message. Render as last child in NavigationProvider.

---

### E-04: DX-03 High-Impact Console Migration

**What:** Replace 5-7 high-impact `console.error` calls in session save, auth, and social catch blocks with `captureError(error, { context })` for structured Sentry observability.

**Why:** These catch blocks handle user-impacting failures (lost test data, failed login, social opt-in failure) but only log to browser console. Production users' errors are invisible without Sentry capture.

**Design compliance:** No UI changes. Improves observability for debugging bilingual error flows.

**Implementation hint:** Target files: TestPage.tsx (session save), InterviewSession.tsx (session save), PracticePage.tsx (session save), AuthPage (password reset, OAuth), SocialOptInFlow (opt-in), AddToDeckButton (SRS). Pattern: `catch (error) { captureError(error, { operation: 'saveSession', component: 'TestPage' }); }`. Leave dev-only logging with `// keep for dev` comment.

---

## SHOULD-HAVE

### E-05: Error Boundary Timeout Cleanup Utility

**What:** Create a `cleanupSessionResources(refs)` utility that systematically clears all timeout refs, cancels audio players, stops recording, and releases nav lock.

**Why:** Each session component (Interview, Practice, Test) has 2-4 timeout refs, 0-3 audio players, and optional speech recognition. Error boundary catch must clean ALL of them. Without a utility, cleanup logic is duplicated and easy to miss.

**Design compliance:** No UI — architecture utility. Prevents resource leaks (orphan timers, zombie audio, locked navigation).

**Implementation hint:** Create `src/lib/cleanupSessionResources.ts`. Accept config: `{ timeoutRefs: RefObject[], audioPlayers: RefObject[], tts: boolean, recording: boolean, navLock: () => void }`. Call in `onError` callback from session-aware error boundary HOC. Each session page passes its specific refs.

---

### E-06: Bilingual 404 Page

**What:** Update `app/not-found.tsx` to show bilingual "Page not found" message with Myanmar typography and a "Return home" button.

**Why:** Current 404 page is English-only. Burmese-primary users hitting a broken link see only English text, violating the bilingual requirement. Low effort, high visibility.

**Design compliance:** BilingualText component, font-myanmar class, 44px touch target on home button, warm color palette (not error red — 404 is informational).

**Implementation hint:** Import `BilingualText` and `BilingualButton`. Read language from localStorage (not-found.tsx may render before providers mount). Message: `{ en: "Page not found", my: "စာမျက်နှာ မတွေ့ပါ" }`. Button: `{ en: "Return home", my: "ပင်မစာမျက်နှာသို့ ပြန်သွားပါ" }`.

---

### E-07: Error Escalation Pattern in Error Boundaries

**What:** Track retry count in component error boundaries. After 3 retries, escalate error message from "Try again" to "Still having trouble? Return to home page."

**Why:** ErrorFallback already has this pattern (retry count → escalated message). Component-level error boundaries should match. Prevents users from infinitely retrying a broken component.

**Design compliance:** Anxiety-reducing design — acknowledges difficulty without blame. Matches existing ErrorFallback escalation UI.

**Implementation hint:** Add `retryCount` state to error boundary. Increment on each `handleReset()`. After `MAX_RETRIES = 3`, change CTA from "Try again" to "Return home" and message to "We're sorry — please try again later" / "ဝမ်းနည်းပါတယ် — နောက်မှ ထပ်ကြိုးစားပါ".

---

### E-08: MockAudioElement in Global Test Setup

**What:** Add a `MockAudioElement` to `src/__tests__/setup.ts` that supports both property handlers (`el.onended`) and `addEventListener` patterns.

**Why:** Phase 48 enhancement recommendation (E-01). Audio-related tests timeout silently without proper mocking. Error boundary tests for InterviewSession (which uses audio players) will need this.

**Design compliance:** Test infrastructure only — no production impact.

**Implementation hint:** From Phase 48 precontext:
```typescript
class MockAudioElement {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}
globalThis.Audio = MockAudioElement as any;
```

---

## NICE-TO-HAVE

### E-09: Error Boundary Performance Monitoring

**What:** Add timing metrics to error boundary catches — measure time from error to fallback render, session save duration, and Sentry report latency.

**Why:** Error recovery speed directly affects user experience. If session save takes >500ms, fallback render delays. Monitoring ensures error handling stays fast.

**Design compliance:** No UI — observability infrastructure.

**Implementation hint:** In `componentDidCatch`: `const start = performance.now()`, then `captureError(error, { recoveryMs: performance.now() - start })`. Dashboard in Sentry shows recovery time distribution.

---

### E-10: Error Boundary Stale Data Fallback

**What:** When component error boundary catches a session crash, offer to display the last-saved session data (read-only) alongside the error fallback.

**Why:** Users may want to see their progress even after a crash. ErrorFallback already supports `fallbackContent` prop for stale data display. Extending this to session error boundaries improves UX.

**Design compliance:** Matches existing ErrorFallback stale data pattern. Muted banner "Showing saved data" with refresh button.

**Implementation hint:** In error boundary catch, read last session from IndexedDB via `getSessionsByType()`. Pass as `fallbackContent` to ErrorFallback. Show question count, score, time elapsed. User can choose to resume or start fresh.

---

### E-11: requestIdleCallback Mock for Full Preset Tests

**What:** Add `requestIdleCallback` / `cancelIdleCallback` mocks to test setup for TTSProvider async engine creation.

**Why:** TTSProvider uses `requestIdleCallback` for deferred engine init. Full preset tests may fail silently without this mock. Phase 48 enhancement recommendation (E-08).

**Design compliance:** Test infrastructure only.

**Implementation hint:**
```typescript
window.requestIdleCallback = (cb: IdleRequestCallback) =>
  setTimeout(() => cb({} as IdleDeadline), 0) as unknown as number;
window.cancelIdleCallback = (id: number) => clearTimeout(id);
```

---

### E-12: Error Boundary Visual Regression Baseline

**What:** Add Playwright screenshot assertions for the error boundary fallback UI in both light and dark mode.

**Why:** Error boundary UI is rarely seen by users but critical when it appears. Visual regression testing ensures bilingual text, button styling, and glass-morphism survive refactors.

**Design compliance:** Visual QA — validates glass-morphism contrast (VISC-05), Myanmar text rendering, button sizing.

**Implementation hint:** Create `e2e/error-boundary.spec.ts`. Navigate to test page, inject `throw new Error('test')` via `page.evaluate()`, screenshot error fallback. Compare against baseline. Run in both `prefers-color-scheme: light` and `dark`.

---

## Implementation Priority Order

```
Phase 49 Plans:
  Plan 1: E-01 (SharedErrorFallback) + ERRS-01 + ERRS-02 (error.tsx sanitization + bilingual)
  Plan 2: E-02 (SessionErrorBoundary HOC) + E-05 (cleanup utility) + ERRS-03 + ERRS-04
  Plan 3: E-03 (ProviderOrderGuard) + ERRS-06
  Plan 4: E-04 (DX-03 console migration) + E-06 (bilingual 404)
```

---

*12 recommendations ranked by impact on Phase 49 success criteria.*
*MUST-HAVE items are required for Phase 49 completion.*
*SHOULD-HAVE items significantly reduce risk.*
*NICE-TO-HAVE items improve quality but can defer.*
