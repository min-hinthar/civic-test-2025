# Phase 49: Error Handling + Security — Precontext Research

**Generated:** 2026-03-19 via 12-agent deep research protocol
**Phase Goal:** Users never see raw error messages or English-only error screens, and feature-level crashes are contained without killing the entire app

---

## 1. Resolved Assumptions

### Technical Approach
- **Error.tsx sanitization**: All 3 error.tsx files (`app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`) call `sanitizeError()` and render bilingual messages. error.tsx IS inside provider tree (Next.js segment boundary), so `useLanguage()` works with localStorage fallback.
- **Component error boundaries**: Wrap InterviewSession, PracticeSession, TestPage, CelebrationOverlay in dedicated `<ErrorBoundary>` instances at the session level within each page component.
- **Session save on catch**: Use HOC wrapper pattern to bridge class-based ErrorBoundary with functional hooks — pass `onError` callback that calls `saveSession()` before fallback renders.
- **Provider ordering guard**: useEffect-based validation hook rendered as last child in provider tree; calls all context hooks and logs violations in dev mode.
- **DX-03 scope**: Convert 5-7 high-impact console.error calls in session save / auth / social catch blocks to `captureError()`. Defer bulk replacement.

### Scope Boundaries
- **IN**: ERRS-01, ERRS-02, ERRS-03, ERRS-04, ERRS-06, DX-03 (partial)
- **OUT**: New Sentry fingerprint categories (Phase 48 covers), E2E error tests (Phase 52), provider unit tests (Phase 51), bulk console migration
- **AMBIGUOUS → RESOLVED**: DX-03 = high-impact only (5-7 calls), not all 30

---

## 2. Realistic Data/Scale Analysis

### Current Error Infrastructure
| Metric | Value |
|--------|-------|
| error.tsx files | 3 (app/, global-error, not-found) |
| ErrorBoundary.tsx | 195 LOC, class component, bilingual fallback |
| errorSanitizer.ts | 363 LOC, 19 pattern groups, 16 sensitive filters |
| sentry.ts | 216 LOC, 5 fingerprint categories, PII stripping |
| Session components to wrap | 4 (Interview, Practice, Test, Celebration) |
| Console.error/warn calls | 30 total, 5-7 high-impact |
| Existing tests | 643 passing across 35 files |
| Coverage thresholds | 40% global floor, 26 per-file thresholds |

### Component Complexity
| Component | Lines | State Machine | Timers | Audio | Session Save |
|-----------|-------|--------------|--------|-------|-------------|
| InterviewSession | 1474 | 9 phases | 2 refs | 3 players + TTS + recorder | Yes (per-answer) |
| PracticeSession | 1020 | 5 phases | 2 refs | None (FeedbackPanel) | Yes (per-answer + skip) |
| TestPage | 960 | 4 phases | 2 refs + interval | None (FeedbackPanel) | Yes (per-answer) |
| CelebrationOverlay | 352 | Queue-based | 2 refs | Sound effects | No (transient) |

---

## 3. Cross-Phase Contract Inventory

### From Phase 48 (predecessor)
| Deliverable | Contract | Phase 49 Usage |
|-------------|----------|----------------|
| renderWithProviders | 3 presets (minimal/core/full), PROVIDER_ORDER array | Use `core` preset for error boundary tests |
| Coverage thresholds | 40% global, 26 per-file, ErrorBoundary at 70% | Maintain or improve; add thresholds for new files |
| CI pipeline | 9 steps: lint → css-lint → format → build → test → e2e | All Phase 49 changes must pass full pipeline |
| Sentry fingerprinting | 5 categories verified with 16 tests | Don't break; use `captureError()` for new error paths |
| Test count | 643 tests passing | Must not decrease |

### From Phase 46 (provider ordering fix)
| Deliverable | Contract |
|-------------|----------|
| AuthProvider above Language/Theme/TTS | CRITICAL: never reorder; Phase 49 guard enforces this |
| setTimeout deferral in onAuthStateChange | Never make async Supabase calls in auth callback |

### From Phase 38 (security)
| Deliverable | Contract |
|-------------|----------|
| errorSanitizer.ts (90% coverage) | Use `sanitizeError()` for user display; don't modify patterns |
| PII stripping (djb2 hash) | All Sentry events through `beforeSendHandler` |

### From Phase 20 (session persistence)
| Deliverable | Contract |
|-------------|----------|
| saveSession() | Fire-and-forget IndexedDB write; 1-per-type enforcement |
| Session types | MockTest, Practice, Interview, Sort snapshots |
| 24-hour expiry | Auto-cleanup on app startup |

### Feeds Into Future Phases
| Phase | What Phase 49 Delivers |
|-------|----------------------|
| Phase 51 (Unit Tests) | Provider ordering guard for context testing; error boundary pattern |
| Phase 52 (E2E) | Error flows verified via boundaries; bilingual error screens for E2E validation |

---

## 4. Prototype/Design Deep Analysis

### Error Fallback UI Pattern (from ErrorBoundary.tsx)
```
┌─────────────────────────────────────┐
│         [AlertCircle icon]          │  h-16 w-16, text-muted-foreground
│              mt-6                   │
│    "Something went wrong"           │  text-xl font-semibold
│    "တစ်ခုခု မှားယွင်းသွားသည်"       │  text-lg font-myanmar mt-1
│              mt-8                   │
│  [Try Again]  [Return to Home]      │  44px min-height, gap-3
└─────────────────────────────────────┘
  max-w-[28rem], p-8, rounded-2xl, bg-muted/30
```

### Glass-Morphism Tiers for Error UI
| Surface | Tier | Blur | Use Case |
|---------|------|------|----------|
| Inline error card | glass-light | 16px | ErrorFallback in page content |
| Error modal overlay | glass-heavy | 32px | Full-page error boundary fallback |
| Error toast | N/A (solid bg) | — | `bg-destructive text-white` |

### Color Tokens for Error States
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-destructive` | `10 50% 45%` (warm coral) | `10 45% 50%` (brighter) | Error surfaces |
| `--color-warning` | `32 95% 52%` (amber) | `32 95% 58%` (brighter) | Non-critical |
| `--color-muted-foreground` | slate-500 | slate-400 | Error icons, secondary text |
| Never use | bright red (0 100% 50%) | — | Patriotic decoration only |

### Typography for Error Messages
| Element | Class | Min Size | Line Height |
|---------|-------|----------|-------------|
| English title | `text-xl font-semibold` | 1.25rem | 1.5 |
| Burmese subtitle | `text-lg font-myanmar` | 0.875rem (12px floor) | 1.6 |
| Button text | `text-base font-bold` | 1rem | 1.5 |

---

## 5. Gotcha Inventory

### CRITICAL (must address or Phase 49 fails)

| ID | Gotcha | Fix | Source | Confidence |
|----|--------|-----|--------|-----------|
| G-01 | error.tsx renders raw `error.message` — exposes SQL, stack traces, PII | Call `sanitizeError(error)` before render; never display raw message | errorSanitizer.ts, CONCERNS audit | HIGH |
| G-02 | error.tsx/global-error.tsx are English-only — violates bilingual requirement | Read language from `useLanguage()` with localStorage fallback; render both en/my | ErrorBoundary.tsx pattern | HIGH |
| G-03 | ErrorBoundary reads language from localStorage — can't use `useLanguage()` hook (class component) | Keep localStorage pattern in class; error.tsx (functional) can use hook | provider-ordering.md | HIGH |
| G-04 | Provider ordering: AuthProvider must be above Language/Theme/TTS | Provider guard validates at mount; never reorder ClientProviders.tsx | Phase 46 fix e2dfdb9 | HIGH |
| G-05 | OfflineProvider must be inside ToastProvider — calls `useToast()` | Provider guard checks this constraint; useToast has NO-OP fallback | provider-ordering.md | HIGH |

### HIGH (will cause bugs if ignored)

| ID | Gotcha | Fix | Source | Confidence |
|----|--------|-----|--------|-----------|
| G-06 | Myanmar text in error messages needs `font-myanmar` class, min 12px, line-height 1.6 | Always apply class; never add letter-spacing to Myanmar text | myanmar-typography.md | HIGH |
| G-07 | InterviewSession has 3 audio players + TTS + recorder — all must cancel on error | Error boundary catch: `cancelTTS()`, cancel all player refs, `stopRecording()` | InterviewSession.tsx | HIGH |
| G-08 | TestPage navigation lock (`setLock`) must release on error — traps user otherwise | Error boundary: `setLock(false)` in cleanup before fallback | TestPage.tsx | HIGH |
| G-09 | Session auto-save every 5s means last snapshot is max 5s old — safe to rely on | Don't re-save in error boundary; snapshot already exists in IndexedDB | sessionStore.ts | HIGH |
| G-10 | TTSProvider throws (not no-op) when engine not ready — error boundary may catch this | Catch TTS init errors gracefully; TTS is optional for error messages | provider-ordering.md | HIGH |
| G-11 | `.prismatic-border` overrides `position: fixed/absolute` — error card positioning at risk | Use explicit `.prismatic-border.fixed { position: fixed; }` if combining | css-specificity.md | HIGH |
| G-12 | Error boundary `componentDidCatch` can't call hooks — needs HOC wrapper for session save | Wrap in functional component that passes `onError` callback to class boundary | React 19 class requirement | HIGH |

### MEDIUM

| ID | Gotcha | Fix | Source | Confidence |
|----|--------|-----|--------|-----------|
| G-13 | Burmese text 20-40% longer than English — error card layout must handle expansion | Use `max-w-sm` + natural wrapping; test with longest Burmese messages | myanmar-typography.md | HIGH |
| G-14 | Tailwind `landscape:` fires on desktop (1920x1080) — error overlay may show incorrectly | Pair with `max-md:landscape:` for mobile-only; test on desktop | css-specificity.md | HIGH |
| G-15 | Audio player cancel-retry can restart audio after error boundary resets | Call `cancelAllPlayers()` BEFORE session save in error handler | tts-voice-selection.md | MEDIUM |
| G-16 | PracticeSession `checkDelayRef` orphaned = answer locked permanently | Clear all timeout refs in error boundary cleanup | PracticeSession.tsx | HIGH |
| G-17 | CelebrationOverlay `peakTimeoutRef` orphaned = overlay blocking forever | Clear timeout refs; set queue/current to null | CelebrationOverlay.tsx | MEDIUM |
| G-18 | Coverage thresholds must be maintained — new src/lib/ files need thresholds | Run `pnpm test:coverage`, floor actual values, add to vitest.config.ts | Phase 48 contract | HIGH |
| G-19 | Toast fire-and-forget fallback (NO-OP) is correct pattern — don't convert to captureError | Only capture actual errors (throws), not expected degradation | provider-ordering.md | MEDIUM |

---

## 6. Data Contracts

### BilingualMessage (user-facing errors)
```typescript
interface BilingualMessage {
  en: string;  // English, clear and friendly
  my: string;  // Burmese, natural phrasing (not literal translation)
}
```

### SanitizedSentryData (Sentry reporting)
```typescript
interface SanitizedSentryData {
  error: { message: string; name?: string; stack?: string };
  user?: { id: string };  // djb2-hashed
  context?: Record<string, unknown>;
}
```

### SessionSnapshot (IndexedDB persistence)
```typescript
type SessionSnapshot =
  | MockTestSnapshot    // questions, results, currentIndex, timeLeft
  | PracticeSnapshot    // + timerEnabled, skippedIndices, config
  | InterviewSnapshot   // + correctCount, incorrectCount, mode, startTime
  | SortSnapshot;       // + knownIds, unknownIds, round, roundHistory
```

### Error Propagation Flow
```
Component throw → Component ErrorBoundary (session save + localized fallback)
                    ↓ (if not caught)
                → Root ErrorBoundary (bilingual fallback)
                    ↓ (if not caught)
                → app/error.tsx (sanitized bilingual)
                    ↓ (if not caught)
                → app/global-error.tsx (minimal HTML fallback)

All paths → sanitizeError() → BilingualMessage (display)
All paths → sanitizeForSentry() → SanitizedSentryData → Sentry
```

---

## 7. Design Compliance Matrix

| Principle | Phase 49 Compliance | Verified |
|-----------|-------------------|----------|
| Bilingual (en/my) | All error messages BilingualMessage type | ✓ errorSanitizer patterns |
| 44px touch targets | Error boundary buttons min-h-[44px] | ✓ Button.tsx enforces |
| Glass-morphism tiers | glass-light for cards, glass-heavy for modals | ✓ globals.css defines |
| 4px spacing grid | Error card padding: p-8 (32px = 8×4) | ✓ tokens.css grid |
| Warm coral (not red) | `--color-destructive: 10 50% 45%` | ✓ tokens.css |
| Reduced motion | `prefers-reduced-motion` respected | ✓ globals.css + animations.css |
| Anxiety-reducing | Friendly language, solution-focused, no blame | ✓ errorSanitizer messages |
| Myanmar typography | font-myanmar, 12px min, 1.6 line-height, no letter-spacing | ✓ globals.css .font-myanmar |
| PII sanitization | hashUserId, stripPII, containsSensitiveData | ✓ errorSanitizer + sentry.ts |

---

## 8. Identity/Brand Ethical Framework

### Brand Voice for Error States
- **Warm Coach**: "Don't worry — let's try again" not "An error has occurred"
- **Solution-focused**: Immediately show what to do next, not what went wrong
- **Empowering**: Users feel in control — "Try again" or "Return home" are clear choices
- **No blame**: "Connection interrupted" not "You closed the app"

### Forbidden Copy Patterns
- No technical jargon (SQL, database, authentication token)
- No ALL CAPS alarming text (FATAL, CRASH, FAILED)
- No raw error codes displayed to users
- No English-only text in bilingual mode
- No bright red for errors (warm coral only)

### Cultural Sensitivity (Burmese Users)
- High test anxiety (citizenship stakes) — errors feel catastrophic
- Burmese translations must be natural, not literal
- Always show both languages in bilingual mode
- Reassurance matters more than technical precision
- Privacy-first: never expose user data in error messages

---

## 9. Architectural Decisions

### Decision 1: Error Boundary Placement
| Option | Pros | Cons | Chosen |
|--------|------|------|--------|
| Page-level only | Simple, one boundary per page | Misses session-level save opportunity | ✗ |
| Session-level only | Saves session state | Misses pre-session errors | ✗ |
| **Both levels** | Defense-in-depth, session save + setup error catch | Slight complexity | **✓** |

### Decision 2: Session State Access in Class Boundary
| Option | Pros | Cons | Chosen |
|--------|------|------|--------|
| Props drilling | Simple, explicit | Requires prop threading through tree | ✗ |
| **HOC wrapper** | Functional wrapper bridges hooks to class | One extra component layer | **✓** |
| Context ref | Direct access | Anti-pattern in React | ✗ |

### Decision 3: Provider Guard Approach
| Option | Pros | Cons | Chosen |
|--------|------|------|--------|
| Compile-time analysis | Catches at build | Complex tooling | ✗ |
| **Runtime validation hook** | Simple, immediate feedback | Dev-mode only | **✓** |
| React DevTools integration | Rich debugging | Not universally available | ✗ |

### Decision 4: Shared Error Fallback
| Option | Pros | Cons | Chosen |
|--------|------|------|--------|
| Duplicate UI in error.tsx + ErrorBoundary | Independent, no deps | Copy-paste drift | ✗ |
| **Shared presentational component** | Single source of truth | Import in both locations | **✓** |
| Merge into single boundary | Simplest | Can't serve both class + functional needs | ✗ |

---

## 10. File Map

### Create
| File | Purpose | Est. LOC |
|------|---------|----------|
| `src/lib/providerOrderGuard.ts` | Dev-mode provider ordering validation | 40-60 |
| `src/__tests__/providerOrderGuard.test.ts` | Guard unit tests | 60-80 |

### Modify
| File | Change | Impact |
|------|--------|--------|
| `app/error.tsx` | sanitizeError + bilingual rendering + "Return home" | ~40 LOC |
| `app/global-error.tsx` | sanitizeError + bilingual rendering | ~30 LOC |
| `app/not-found.tsx` | Bilingual 404 message | ~15 LOC |
| `src/components/ErrorBoundary.tsx` | Add `onError` prop for session save callback | ~20 LOC |
| `src/components/ClientProviders.tsx` | Add provider ordering guard call | ~10 LOC |
| `src/views/InterviewPage.tsx` | Wrap InterviewSession in ErrorBoundary with session save | ~15 LOC |
| `src/views/PracticePage.tsx` | Wrap PracticeSession in ErrorBoundary with session save | ~15 LOC |
| `src/views/TestPage.tsx` | Wrap content in ErrorBoundary with nav lock release | ~15 LOC |
| `src/components/GlobalOverlays.tsx` | Wrap CelebrationOverlay in ErrorBoundary | ~5 LOC |
| 5-7 files with console.error | Replace with captureError() | ~2 LOC each |

### Read (reference only)
| File | Purpose |
|------|---------|
| `src/lib/errorSanitizer.ts` | Sanitization patterns (don't modify) |
| `src/lib/sentry.ts` | Sentry integration (don't modify) |
| `src/lib/sessions/sessionStore.ts` | Session save API |
| `src/lib/sessions/sessionTypes.ts` | Snapshot type definitions |
| `.claude/learnings/provider-ordering.md` | Provider ordering rules |

---

## 11. Gray Area Resolutions

| # | Gray Area | Resolution | Confidence |
|---|-----------|-----------|-----------|
| 1 | Error boundary placement | Both page-level and session-level; page catches setup errors, session catches mid-session and saves state | HIGH |
| 2 | Class component accessing hooks | HOC wrapper: functional component calls hooks, passes callbacks to class ErrorBoundary via `onError` prop | HIGH |
| 3 | Provider guard approach | Validation hook as last child in provider tree; calls all context hooks; dev-mode console.warn on failure | HIGH |
| 4 | error.tsx vs ErrorBoundary overlap | Shared presentational fallback component; error.tsx uses it with hook-based language; ErrorBoundary uses it with localStorage | HIGH |
| 5 | CelebrationOverlay boundary scope | Wrap in GlobalOverlays; no session save needed (post-session); fallback={null} (silent failure) | HIGH |
| 6 | DX-03 console conversion scope | 5-7 high-impact calls only (session save, auth, social); defer bulk | MEDIUM |
| 7 | Phase 49 test scope | Extend existing errorBoundary.test.tsx; add providerOrderGuard.test.ts; no new integration test files | HIGH |
| 8 | Bilingual error.tsx language access | `useLanguage()` works (error.tsx is inside provider tree); localStorage fallback for safety | HIGH |

---

## 12. Animation/Ceremony Cleanup Patterns

### Resource Cleanup per Component on Error Boundary Catch

**InterviewSession** (MOST COMPLEX):
```
1. cancelTTS()
2. englishPlayerRef.current?.cancel()
3. burmesePlayerRef.current?.cancel()
4. interviewPlayerRef.current?.cancel()
5. stopListening() — Web Speech API
6. stopRecording() + cleanupRecorder() — MediaRecorder
7. clearTimeout(transitionTimerRef)
8. clearTimeout(advanceTimerRef)
```

**PracticeSession**:
```
1. clearTimeout(checkDelayRef)
2. clearTimeout(streakTimerRef)
3. Timer interval handled by effect cleanup
```

**TestPage** (CRITICAL: nav lock):
```
1. setLock(false) — MUST release navigation lock
2. clearTimeout(checkDelayRef)
3. clearTimeout(streakTimerRef)
4. Timer interval handled by effect cleanup
```

**CelebrationOverlay**:
```
1. clearTimeout(peakTimeoutRef)
2. clearTimeout(gapTimeoutRef)
3. setQueue([]), setCurrent(null)
```

---

## 13. Core Domain Architecture

### Error Sanitization Pipeline
```
Error thrown
  → sanitizeError(error)
    → Match against 19 pattern groups (network, auth, permission, rate limit, DB, validation, server)
    → containsSensitiveData(message) check (16 regex filters)
    → Return BilingualMessage { en, my }

  → sanitizeForSentry(error, userInfo, context)
    → hashUserId(userId) via djb2 → "user_XXXXX"
    → stripPII(text) → emails → [EMAIL_REDACTED], UUIDs → [UUID_REDACTED]
    → Return SanitizedSentryData

  → beforeSendHandler(event, hint)
    → Fingerprint: hydration/chunk-load/abort/network/indexeddb/tts
    → Drop: AbortError (navigation noise)
    → Strip PII from all event fields
```

### Session Persistence Pipeline
```
Session created → generateSessionId("session-{type}-{timestamp}")
  → saveSession(snapshot)
    → Enforce 1-per-type (delete old)
    → Add version + savedAt
    → IndexedDB write (civic-prep-sessions/active-sessions)
  → getSessionsByType(type)
    → Version check (SESSION_VERSION = 1)
    → Expiry check (24 hours)
  → cleanExpiredSessions()
    → Called on app startup (ClientProviders useEffect)
```

---

## 14. Expanded Gotcha Inventory (Wave 2 Findings)

| ID | Gotcha | Severity | Fix |
|----|--------|----------|-----|
| G-20 | onAuthStateChange deadlock: async Supabase calls inside callback lock auth client | CRITICAL | Always defer with setTimeout(fn, 0); Phase 49 must not modify auth callback |
| G-21 | Audio player zombie bug: cancel-retry restarts audio after error boundary resets | HIGH | Call `cancelAllPlayers()` BEFORE session save in error handler |
| G-22 | Persistent audio element pool may lose gesture blessing after error recovery | MEDIUM | Re-call `unlockAudioSession()` on resume after error boundary reset |
| G-23 | speechSynthesis mock needs addEventListener/removeEventListener for full preset tests | MEDIUM | Enhanced mock exists in renderWithProviders; use if testing with TTS |
| G-24 | Sentry fingerprint precedence: guard with `if (!event.fingerprint)` to avoid overwrite | MEDIUM | Already fixed in Phase 48-04; maintain pattern in any new fingerprint code |
| G-25 | Speech recognition active after error = microphone never released = mobile battery drain | HIGH | `stopListening()` + `cleanupRecorder()` in error boundary cleanup |

---

## 15. Design Token Audit Results

### Token Compliance: PASS (with 1 gap)

| Category | Status | Notes |
|----------|--------|-------|
| Error colors (destructive/warning) | ✅ PASS | tokens.css + tailwind.config.js aligned |
| Glass-morphism tiers | ✅ PASS | All 3 tiers defined in globals.css |
| Error icon sizes | ✅ PASS | h-12 w-12 (ErrorFallback), h-16 w-16 (ErrorBoundary) |
| Myanmar font class | ✅ PASS | CSS class `.font-myanmar` defined; works via className |
| Reduced motion queries | ✅ PASS | globals.css + animations.css cover all keyframes |
| Dark mode adjustments | ✅ PASS | Destructive brighter (+12% L), warning brighter (+6% L) |
| Spring animation tokens | ✅ PASS | JS (motion-config.ts) and CSS (tokens.css) aligned |
| Touch target minimum | ⚠️ GAP | No `min-h-[44px]` utility; use Tailwind arbitrary value `min-h-[44px]` |
| Destructive-active color | ⚠️ MINOR | Defined in tokens.css but not mapped in tailwind.config.js |

### Recommended Additions
- Use `min-h-[44px] min-w-[44px]` on all error boundary buttons (Tailwind arbitrary values work)
- No tailwind.config.js changes needed — existing utilities sufficient

---

*Research complete. 12 agents, 2 waves, all gray areas resolved to HIGH confidence.*
