# Phase 49: Error Handling + Security - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Users never see raw error messages or English-only error screens, and feature-level crashes are contained without killing the entire app. Specifically: sanitize all 3 error.tsx files with bilingual messages, add component-level error boundaries on 4 high-risk components with session save, implement provider ordering dev-mode guard, and convert high-impact console.error calls to structured captureError().

Requirements: ERRS-01, ERRS-02, ERRS-03, ERRS-04, ERRS-06, DX-03.

</domain>

<decisions>
## Implementation Decisions

### Error Message Presentation
- Create shared `SharedErrorFallback` presentational component — both ErrorBoundary (class) and error.tsx (functional) import it
- Props: `message: BilingualMessage`, `showBurmese: boolean`, `onRetry?: () => void`, `onGoHome?: () => void`
- Language detection: `useLanguage()` hook in error.tsx (it IS inside provider tree) with localStorage fallback for safety
- Both "Try again" and "Return home" buttons on all error pages — matches existing ErrorBoundary pattern
- Warm, anxiety-reducing tone matching existing errorSanitizer messages — "Something went wrong" not "FATAL ERROR"
- error.tsx calls `sanitizeError(error)` before rendering — never display raw error.message
- global-error.tsx and not-found.tsx also get bilingual treatment
- Myanmar text uses `font-myanmar` class, min 12px, line-height 1.6, no letter-spacing

### Error Boundary Scope
- Both page-level AND session-level boundaries for defense in depth
- Page-level: catches setup/config errors before session starts
- Session-level: catches mid-session crashes, triggers cleanup
- HOC wrapper pattern (`withSessionErrorBoundary`) bridges class-based ErrorBoundary with functional hooks
- HOC calls `useNavigation()` for nav lock release, captures audio/timer refs for cleanup
- Passes `onError` callback to ErrorBoundary class component
- Session save strategy: rely on existing 5-second auto-save interval — snapshot already in IndexedDB, don't re-save in error handler
- CelebrationOverlay gets boundary in GlobalOverlays with `fallback={null}` — silent failure, post-session, no data to save

### Component Cleanup on Error
- InterviewSession: cancel TTS, cancel 3 audio players, stop speech recognition, stop recording, clear 2 timeout refs
- PracticeSession: clear checkDelayRef, clear streakTimerRef
- TestPage: CRITICAL — `setLock(false)` to release navigation lock, clear checkDelayRef, clear streakTimerRef
- CelebrationOverlay: clear peakTimeoutRef, clear gapTimeoutRef, reset queue

### Provider Ordering Guard
- Validation hook rendered as `<ProviderOrderGuard />` null component at bottom of provider tree in ClientProviders.tsx
- Calls every context hook (useAuth, useLanguage, useTheme, useTTS, useToast, useOffline, etc.)
- Each hook call wrapped in try-catch with specific error message naming the violated constraint
- Dev-mode only (`process.env.NODE_ENV === 'development'`) — zero production overhead
- Console.warn with correct ordering reference and link to learnings file
- Will NOT crash the app — warning only

### Console Migration (DX-03)
- Convert 5-7 high-impact `console.error` calls to `captureError(error, { context })` for structured Sentry observability
- Target: session save catch blocks (TestPage, InterviewSession, PracticePage), auth errors (AuthPage), social errors (SocialOptInFlow)
- Leave dev-only debug logging with `// keep for dev` comment
- Do NOT bulk-convert all 30 calls — "where impactful" per REQUIREMENTS.md

### Claude's Discretion
- Exact SharedErrorFallback component styling (within design system constraints)
- Provider guard exact error message wording
- Which specific console.error calls beyond the 5 core targets to convert
- Whether to add per-file coverage thresholds for new src/lib/ files created in this phase
- Test structure for providerOrderGuard (co-located vs centralized)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — ERRS-01, ERRS-02, ERRS-03, ERRS-04, ERRS-06, DX-03 definitions and acceptance criteria

### Error Handling Infrastructure
- `src/lib/errorSanitizer.ts` — sanitizeError() function, BilingualMessage type, 19 error pattern groups, sensitive data filters (DO NOT MODIFY — use as-is)
- `src/lib/sentry.ts` — captureError() wrapper, beforeSendHandler with fingerprinting, PII stripping
- `src/components/ErrorBoundary.tsx` — Existing class-based error boundary with bilingual fallback, localStorage language detection, Sentry reporting

### Error Pages
- `app/error.tsx` — Current root error page (English-only, raw error.message — needs fixing)
- `app/global-error.tsx` — Current global error page (English-only, minimal HTML — needs fixing)
- `app/not-found.tsx` — Current 404 page (English-only — needs bilingual)

### Session Components to Wrap
- `src/views/InterviewPage.tsx` — Interview session page (renders InterviewSession)
- `src/views/PracticePage.tsx` — Practice session page (renders PracticeSession)
- `src/views/TestPage.tsx` — Test session page (960 LOC, has nav lock via setLock)
- `src/components/GlobalOverlays.tsx` — Renders CelebrationOverlay (wrap here)

### Session Persistence
- `src/lib/sessions/sessionStore.ts` — saveSession(), getSessionsByType(), 1-per-type enforcement, 24h expiry
- `src/lib/sessions/sessionTypes.ts` — MockTestSnapshot, PracticeSnapshot, InterviewSnapshot, SortSnapshot types

### Provider Ordering
- `src/components/ClientProviders.tsx` — Canonical provider nesting order (guard validates this)
- `.claude/learnings/provider-ordering.md` — Provider ordering constraints, historical bugs, rules

### Bilingual Components
- `src/components/bilingual/BilingualText.tsx` — BilingualText component with showBurmese from useLanguage()
- `src/components/bilingual/BilingualButton.tsx` — BilingualButton with 3-tier press feedback

### Design System
- `.claude/learnings/myanmar-typography.md` — Myanmar font rules (12px min, 1.6 line-height, no letter-spacing)
- `src/styles/tokens.css` — Color tokens (destructive: warm coral, not bright red)

### Precontext Research
- `.planning/phases/49/49-PRECONTEXT-RESEARCH.md` — 12-agent deep analysis: gotcha inventory, data contracts, cleanup patterns, gray area resolutions
- `.planning/phases/49/49-ENHANCEMENT-RECOMMENDATIONS.md` — 12 ranked recommendations (MUST/SHOULD/NICE-TO-HAVE)

### Prior Phase
- `.planning/phases/48/48-CONTEXT.md` — Phase 48 decisions: renderWithProviders presets, coverage thresholds, CI pipeline

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ErrorBoundary.tsx` (195 LOC): Class component with bilingual fallback, Sentry reporting, localStorage language detection — extend with `onError` prop
- `errorSanitizer.ts` (363 LOC): 19 error pattern groups, BilingualMessage return type, PII filtering — use directly, don't modify
- `ErrorFallback.tsx`: Inline error recovery UI with retry escalation, stale data fallback — reference for SharedErrorFallback design
- `BilingualText/Button/Heading`: Bilingual component library — use in error fallback UI
- `sessionStore.ts`: IndexedDB session CRUD with 1-per-type enforcement, 24h expiry — existing auto-save already preserves state
- `renderWithProviders` (from Phase 48): 3 presets, PROVIDER_ORDER array — use `core` preset for error boundary tests

### Established Patterns
- ErrorBoundary reads language from localStorage directly (no context dependency) — preserve for class component
- Toast system has NO-OP fallback when called outside ToastProvider — safe pattern, don't replicate as captureError
- Sessions auto-save every 5 seconds in all session components — error boundary doesn't need to re-save
- Sentry PII stripping uses djb2 hash for user IDs, regex for emails/UUIDs — all error reporting goes through beforeSendHandler

### Integration Points
- `ClientProviders.tsx` (line ~70): Add ProviderOrderGuard as last child inside NavigationProvider
- `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`: Replace inline English-only UI with SharedErrorFallback
- `src/views/InterviewPage.tsx`, `PracticePage.tsx`, `TestPage.tsx`: Wrap session components in error boundary
- `src/components/GlobalOverlays.tsx`: Wrap CelebrationOverlay in error boundary

</code_context>

<specifics>
## Specific Ideas

No specific requirements — infrastructure phase with clear technical scope defined by REQUIREMENTS.md, precontext research, and auto-selected recommended patterns.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 49-error-handling-security*
*Context gathered: 2026-03-19*
