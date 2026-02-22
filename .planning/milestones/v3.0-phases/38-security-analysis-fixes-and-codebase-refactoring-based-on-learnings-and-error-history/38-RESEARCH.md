# Phase 38: Security Analysis, Fixes, and Codebase Refactoring — Research

**Researched:** 2026-02-22
**Domain:** Security hardening, codebase refactoring, error handling, Sentry optimization
**Confidence:** HIGH

## Summary

Phase 38 is a code-health phase spanning four domains: security audit, systematic refactoring from 37 phases of accumulated learnings, Sentry error cleanup, and unified error handling. No new features, no new UI, no new capabilities.

The codebase is in good security posture following Phase 13's hardening: CSP is hash-based via middleware, all API routes have JWT/API-key auth with rate limiting, RLS covers all 9 Supabase tables, and PII stripping is comprehensive in Sentry events. The remaining security work is incremental: the DSN is hardcoded in Sentry configs (should use env var), `tracesSampleRate: 1` in server/edge configs wastes quota, `dangerouslySetInnerHTML` has two uses (both with static constants — safe), and `pnpm audit` shows 4 vulnerabilities (2 moderate in bn.js via web-push, 2 high that are already ignored via `auditConfig.ignoreCves`). The Burmese Unicode XSS concern is a non-issue — all content is rendered via JSX auto-escaping with zero `dangerouslySetInnerHTML` on user input.

The most impactful work is the error handling standardization. The codebase has 59 try-catch blocks across 30 files with inconsistent patterns: some `console.error` and swallow, some throw, some show toasts. Creating a shared `withRetry`/`safeAsync` utility and formalizing the throw-vs-fallback pattern will standardize the 18 files that use `useToast` and the 8 context providers that handle async errors.

**Primary recommendation:** Treat this as a systematic audit-and-fix phase. Do NOT hand-roll security scanning tools — use `pnpm audit`, ESLint, TypeScript compiler, and manual code review. Focus effort on the error handling utility (highest code-quality impact), then security checklist (documentation value), then refactoring (case-by-case from MEMORY.md learnings), then Sentry cleanup (dashboard work, mostly).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Claude conducts a **fresh, comprehensive security audit** — no specific user concerns beyond XSS in bilingual content
- All security surfaces evaluated: dependencies, auth flows, CSP directives, input sanitization, storage security, HTTP headers, API routes, third-party data flows, service worker caching, push notification security, SRI, env variable handling, console output, ErrorBoundary info leakage, OWASP-relevant vectors
- **Security checklist** artifact produced — document what was audited and what passed/failed
- **XSS in bilingual content** flagged as specific concern — Burmese Unicode content rendered dynamically
- Current errorSanitizer is sufficient — no extension needed
- Claude decides per case whether each learning warrants a **codebase-wide fix or documentation only**
- **Full dead code audit**, CSS anti-pattern audit, provider tree audit, bundle size audit, file structure audit, duplication audit, a11y audit, performance audit, React pattern audit, Tailwind audit, animation pattern audit, i18n coverage audit
- **Fix ErrorBoundary test failures** (9 pre-existing)
- **Audit CLAUDE.md** for accuracy
- Claude categorizes ~15 remaining stale/noise Sentry issues
- **Formalize throw-vs-fallback pattern** across all hooks
- **Add try-catch boundaries** around critical async paths
- **Silent retry first** (2-3 times) before showing error to user
- **Shared `withRetry`/`safeAsync` utility** — reusable wrapper for retry + error escalation

### Claude's Discretion
- Security audit prioritization based on actual risk assessment
- Which learnings warrant codebase-wide refactoring vs. documentation only
- ESLint rule additions for React Compiler patterns
- JSDoc annotations on complex functions
- MEMORY.md cleanup and consolidation
- Sync layer re-audit scope
- Test coverage gap assessment
- TypeScript type safety audit scope
- Sentry configuration optimizations (alerting rules, performance monitoring, source maps, sampling rates, error fingerprinting)
- Error aggregation architecture
- Error path automated test selection
- withRetry retry strategy and Sentry integration
- Retry strategy (exponential vs. fixed), unhandled rejection handling

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @sentry/nextjs | ^10.26.0 (current) | Error tracking + performance monitoring | Already installed; beforeSend PII stripping already implemented |
| pnpm audit | built-in | Dependency vulnerability scanning | pnpm's native audit, already configured with `auditConfig.ignoreCves` |
| TypeScript strict | ~5.8.2 (current) | Type safety audit | `--noEmit` catches type errors; `no-explicit-any: error` already enforced |
| ESLint | ^9.17.0 (current) | Static analysis for React patterns | React Compiler rules already catching setState-in-effect, ref-in-render |
| Vitest | ^4.0.18 (current) | Test runner for error handling tests | Already configured with jsdom, coverage thresholds |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @next/bundle-analyzer | ^16.1.6 (current) | Bundle size audit | Run with `ANALYZE=true npm run build` |
| depcheck | latest (npx) | Unused dependency detection | One-time audit, no install |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual security audit | Automated scanner (Snyk, npm audit signatures) | Manual audit is more thorough for this app size; automated scanners find dependency CVEs but miss logic issues |
| Custom withRetry utility | ts-retry library | Custom is simpler for this use case (no dependency), the utility is ~30 lines; ts-retry adds a dependency for marginal benefit |
| pnpm overrides for bn.js | Replacing web-push | bn.js vuln is moderate (DoS via maskn(0)), low risk for server-side push usage; override to >=5.2.3 is simplest fix |

**Installation:**
```bash
# No new dependencies needed
# Fix bn.js vulnerability via pnpm override in package.json:
# "pnpm": { "overrides": { "bn.js": ">=5.2.3" } }
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── async/              # NEW: withRetry, safeAsync utilities
│   │   ├── withRetry.ts    # Retry wrapper with exponential backoff
│   │   ├── safeAsync.ts    # Safe async wrapper with Sentry reporting
│   │   └── withRetry.test.ts
│   ├── errorSanitizer.ts   # EXISTING: Keep as-is per user decision
│   └── sentry.ts           # EXISTING: Add error fingerprinting
├── contexts/               # EXISTING: Audit for async error handling consistency
└── hooks/                  # EXISTING: Formalize throw-vs-fallback
.planning/
└── security/
    ├── rls-audit.md        # EXISTING: Already comprehensive from Phase 13
    └── security-checklist.md # NEW: Phase 38 comprehensive audit artifact
```

### Pattern 1: withRetry Utility
**What:** Generic retry wrapper that silently retries async operations 2-3 times with exponential backoff before escalating
**When to use:** All async operations that interact with IndexedDB, Supabase, or network resources
**Example:**
```typescript
// src/lib/async/withRetry.ts
interface RetryOptions {
  maxAttempts?: number;     // Default: 3
  baseDelayMs?: number;     // Default: 1000
  onRetry?: (attempt: number, error: unknown) => void;
  shouldRetry?: (error: unknown) => boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 1000,
    onRetry,
    shouldRetry = isRetryableError,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error)) {
        throw error;
      }
      onRetry?.(attempt, error);
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError; // TypeScript: unreachable but satisfies return type
}

function isRetryableError(error: unknown): boolean {
  if (!navigator.onLine) return true;
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return false;
  if (error instanceof Error && /network|timeout|ECONNREFUSED/i.test(error.message)) return true;
  return false;
}
```

### Pattern 2: safeAsync Utility
**What:** Wrapper that catches errors, optionally reports to Sentry, and returns a result tuple
**When to use:** Fire-and-forget async operations where failure should not crash the app
**Example:**
```typescript
// src/lib/async/safeAsync.ts
import { captureError } from '@/lib/sentry';

type SafeResult<T> = [T, null] | [null, Error];

async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<SafeResult<T>> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    captureError(err, context ? { operation: context } : undefined);
    return [null, err];
  }
}
```

### Pattern 3: Throw-vs-Fallback Convention
**What:** Formalized rule for when context hooks throw vs. return no-ops
**When to use:** Every context hook in the app
**Convention:**
```typescript
// THROW: Caller NEEDS success to continue (TTS speak, auth login)
export function useTTS() {
  const ctx = useContext(TTSContext);
  if (!ctx) throw new Error('useTTS must be used within TTSProvider');
  return ctx;
}

// NO-OP FALLBACK: Fire-and-forget (toast, haptics, announcements)
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  return context ?? TOAST_FALLBACK;
}
```

### Pattern 4: Sentry Error Fingerprinting
**What:** Custom fingerprints to group related errors instead of Sentry's default stack-trace grouping
**When to use:** Network errors, IndexedDB errors, and other high-volume error categories
**Example:**
```typescript
// In beforeSendHandler, add fingerprinting:
if (event.exception?.values?.[0]?.value?.match(/network|fetch|ECONNREFUSED/i)) {
  event.fingerprint = ['network-error'];
}
if (event.exception?.values?.[0]?.value?.match(/IndexedDB|QuotaExceeded/i)) {
  event.fingerprint = ['indexeddb-error'];
}
```

### Anti-Patterns to Avoid
- **Swallowing errors with empty catch:** `catch (error) { console.error(error); }` loses the error for callers. Either re-throw or use safeAsync.
- **Inconsistent error reporting:** Some catch blocks report to Sentry, others only console.error. Standardize via safeAsync utility.
- **console.error in production:** 63 console.log/error/warn/info calls across 29 source files. Production builds should strip console output or route through Sentry.
- **Retrying non-retryable errors:** Don't retry auth failures (401), validation errors (400), or quota exceeded. Only retry network/timeout errors.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dependency vulnerability scanning | Custom CVE checker | `pnpm audit` + `pnpm overrides` | Covers transitive deps, integrates with lockfile |
| XSS sanitization | Custom HTML sanitizer | React JSX auto-escaping (already in place) | React escapes all interpolated values by default |
| CSP management | Custom header builder | Existing middleware.ts pattern (already in place) | Hash-based CSP is working; don't switch to nonce for Pages Router |
| PII stripping | Custom regex for each case | Existing errorSanitizer.ts + sentry.ts beforeSendHandler | Already comprehensive; user decision says don't extend |
| Rate limiting | Redis/external store | Existing in-memory Map (already in subscribe.ts) | Sufficient for serverless per-instance; this app's traffic doesn't need distributed rate limiting |
| JWT verification | Custom token parsing | `supabase.auth.getUser()` (already in subscribe.ts) | Already implemented in Phase 13 |

**Key insight:** Phase 13 already addressed the critical security gaps. Phase 38's security work is an incremental audit and documentation exercise, not a greenfield implementation. The highest-value new code is the error handling utilities.

## Common Pitfalls

### Pitfall 1: Breaking CSP with Refactored Code
**What goes wrong:** Moving inline scripts or adding new external resources breaks CSP
**Why it happens:** CSP hash in middleware.ts is computed from exact script content; changing the theme script breaks the hash
**How to avoid:** If the theme script in `_document.tsx` is modified, regenerate the SHA-256 hash: `echo -n 'script content' | openssl dgst -sha256 -binary | openssl base64`. Update `THEME_SCRIPT_HASH` in middleware.ts.
**Warning signs:** Console errors about CSP violations, theme FOUC in production

### Pitfall 2: Retry Loops on Non-Retryable Errors
**What goes wrong:** withRetry retries a 401 auth failure 3 times, adding 7 seconds of delay
**Why it happens:** `shouldRetry` defaults to retrying everything if not configured
**How to avoid:** Default `shouldRetry` to `isRetryableError` which only retries network/timeout errors. Auth failures (401), validation errors (400), and quota exceeded are not retryable.
**Warning signs:** User sees long delays before error messages on auth failures

### Pitfall 3: Sentry Quota Exhaustion from Noisy Errors
**What goes wrong:** High-volume errors (network flaps, IndexedDB quota) consume entire Sentry quota
**Why it happens:** `tracesSampleRate: 1` in server/edge configs sends ALL traces; no error fingerprinting means each network error creates a separate issue
**How to avoid:** Reduce server `tracesSampleRate` to 0.2 (matching client). Add fingerprinting for network-error, indexeddb-error categories. Consider `beforeSend` filtering for known-noise errors.
**Warning signs:** Sentry dashboard shows "Rate Limited" warnings, identical errors as separate issues

### Pitfall 4: ErrorBoundary Test Environment Mismatch
**What goes wrong:** Tests pass locally but MEMORY.md reports 9 failures
**Why it happens:** The 9 failures were from a localStorage mock issue in the test environment; they appear to be fixed (all 11 tests pass as of current run)
**How to avoid:** Run `npx vitest run src/__tests__/errorBoundary.test.tsx` to verify. If passing, update MEMORY.md to remove the known issue.
**Warning signs:** N/A — appears already resolved

### Pitfall 5: Dead Code Removal Breaking Dynamic Imports
**What goes wrong:** Removing an "unused" export breaks a lazy-loaded component
**Why it happens:** Dynamic `import()` and `React.lazy()` references aren't caught by simple grep-based dead code detection
**How to avoid:** Use TypeScript's `--noUnusedLocals` for compile-time detection. For exports, search for both static imports (`import { X }`) and dynamic imports (`import('path')`) before removing.
**Warning signs:** Runtime errors on lazy-loaded routes, blank pages

### Pitfall 6: Console Output Removal Breaking Dev Workflow
**What goes wrong:** Removing all `console.error` calls makes development debugging impossible
**Why it happens:** Over-aggressive cleanup treats development logging as production leak
**How to avoid:** Replace `console.error(...)` with `if (process.env.NODE_ENV === 'development') console.error(...)` only in hot paths. Better: Route through `captureError()` which automatically strips PII and handles env branching.
**Warning signs:** Developers can't debug issues locally

### Pitfall 7: Refactoring Provider Tree Breaks Ordering
**What goes wrong:** Consolidating providers changes nesting order, breaking cross-provider dependencies
**Why it happens:** OfflineProvider must be inside ToastProvider (needs toast for sync notifications); TTSProvider must wrap TTS consumers
**How to avoid:** Document the provider dependency graph in the audit. Any consolidation must preserve: ErrorBoundary > LanguageProvider > ThemeProvider > TTSProvider > ToastProvider > OfflineProvider > AuthProvider > SocialProvider > SRSProvider > StateProvider > NavigationProvider
**Warning signs:** "useX must be used within XProvider" errors at runtime

## Code Examples

### Existing Error Handling Patterns (Codebase Audit)

```typescript
// Pattern A: throw for critical ops (useTTS, useAuth)
// Found in: src/hooks/useTTS.ts, src/contexts/SupabaseAuthContext.tsx
export function useTTS() {
  const ctx = useContext(TTSContext);
  if (!ctx) throw new Error('useTTS must be used within TTSProvider');
  return ctx;
}

// Pattern B: no-op fallback for convenience ops (useToast)
// Found in: src/components/BilingualToast.tsx
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  return context ?? TOAST_FALLBACK; // Never throws
}

// Pattern C: console.error + swallow (contexts)
// Found in: src/contexts/SRSContext.tsx, OfflineContext.tsx, SocialContext.tsx
// 12 instances across 4 context files
catch (error) {
  console.error('[SRSContext] Failed to load deck:', error);
  // Error swallowed — caller never knows
}

// Pattern D: detect network error + queue offline (AuthContext.saveTestSession)
// Found in: src/contexts/SupabaseAuthContext.tsx
const isNetworkError = !navigator.onLine || (error instanceof TypeError && ...);
if (isNetworkError) {
  await queueTestResult(data); // Queue for later sync
  return; // Succeed silently
}
throw error; // Non-network errors propagate
```

### Sentry Configuration Fixes

```typescript
// sentry.server.config.ts and sentry.edge.config.ts
// CURRENT (wasteful):
tracesSampleRate: 1,

// FIX: Match client-side sampling
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1,

// CURRENT: DSN hardcoded
dsn: 'https://c957cad31df16711843d5241cb2d6515@o4507212955254784.ingest.us.sentry.io/...',

// FIX: Use env var (Sentry SDK supports this natively)
dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
// Note: The DSN is a public key, not a secret. But using env var allows
// different DSNs per environment and easier rotation.
```

### Security Checklist Artifact Structure

```markdown
# Security Audit Checklist — Phase 38

## Dependencies
- [ ] `pnpm audit` — 4 vulnerabilities (2 ignored, 2 bn.js moderate)
- [ ] Fix bn.js via pnpm override
- [ ] Verify no new CVEs since last audit

## Authentication & Authorization
- [ ] All API routes require auth (JWT or API key) — PASS (Phase 13)
- [ ] Rate limiting on user-facing endpoints — PASS (subscribe.ts)
- [ ] Service role key usage justified — PASS (4 routes, documented)
- [ ] Supabase RLS on all tables — PASS (9 tables, documented)

## Content Security Policy
- [ ] CSP set via middleware — PASS
- [ ] Hash-based for inline theme script — PASS
- [ ] All external origins whitelisted — PASS
- [ ] frame-ancestors: none — PASS
- [ ] upgrade-insecure-requests — PASS

## XSS Prevention
- [ ] No dangerouslySetInnerHTML with user input — PASS
- [ ] 2 uses of dangerouslySetInnerHTML: _document.tsx (theme), CelebrationOverlay.tsx (shake keyframes) — both static constants
- [ ] 1 use of innerHTML: TipJarWidget.tsx (cleanup only, sets to '') — safe
- [ ] Burmese Unicode content: all via JSX auto-escaping — PASS
- [ ] display_name: DB CHECK constraint rejects < > — PASS

## Error Handling & Information Leakage
- [ ] ErrorBoundary sanitizes all displayed errors — PASS
- [ ] Sentry PII stripping in beforeSend — PASS
- [ ] sendDefaultPii: false in all configs — PASS
- [ ] Console output audit — 63 calls across 29 files (needs cleanup)

## HTTP Headers
- [ ] X-Content-Type-Options: nosniff — PASS
- [ ] X-Frame-Options: DENY — PASS
- [ ] Referrer-Policy: strict-origin-when-cross-origin — PASS
- [ ] Permissions-Policy — PASS (camera=(), microphone=(self), geolocation=())

## Service Worker
- [ ] SW only caches from 'self' origin + /audio/ path — PASS
- [ ] Push notification handler validates data.json() — PASS
- [ ] No sensitive data in SW cache — PASS
```

### Bundle Analysis Command

```bash
# Run bundle analyzer to identify heavy imports
ANALYZE=true pnpm run build
# Opens browser with treemap visualization
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tracesSampleRate: 1` everywhere | Environment-specific: 0.2 prod, 1.0 dev | Sentry best practice 2024+ | 80% reduction in Sentry quota usage |
| Hardcoded Sentry DSN | `process.env.NEXT_PUBLIC_SENTRY_DSN` | Standard practice | Easier rotation, per-environment config |
| `console.error` in catch blocks | `captureError()` from sentry.ts | Better alternative available now | Structured reporting, PII stripping, env branching |
| Ad-hoc retry per call site | Shared `withRetry` utility | Common TypeScript pattern | Consistent behavior, configurable, testable |
| `report-uri` CSP directive only | `report-uri` + `report-to` together | 2023+ transition | `report-to` is the standard; `report-uri` for backward compat |

**Deprecated/outdated:**
- `report-uri` CSP directive: Deprecated in favor of `report-to`, but this app correctly uses `report-uri` which has broader browser support. Adding `report-to` alongside is the recommended approach but low priority.
- Nonce-based CSP for Pages Router: Phase 13 researched this and found hash-based is the correct approach for this Pages Router app. The MEMORY.md note about "nonce headers can't be forwarded to _document" is accurate and should stay.

## Current Security Posture (Codebase Audit Findings)

### Already Secure (from Phase 13)
1. **CSP via middleware.ts** — hash-based, covers all external origins
2. **API route auth** — subscribe.ts uses JWT verification, send/srs-reminder/weak-area-nudge use cron secrets
3. **RLS on all 9 tables** — documented in `.planning/security/rls-audit.md`
4. **PII stripping** — errorSanitizer.ts + sentry.ts beforeSendHandler
5. **HTTP security headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy in next.config.mjs
6. **XSS protection** — React JSX auto-escaping, no user-controlled dangerouslySetInnerHTML, display_name DB constraints
7. **Input validation** — DB CHECK constraints on display_name and reminder_frequency

### Needs Attention (Phase 38 Scope)
1. **Sentry DSN hardcoded** in 3 config files — move to `NEXT_PUBLIC_SENTRY_DSN` env var
2. **Server/edge tracesSampleRate: 1** — reduce to 0.2 for production
3. **4 audit vulnerabilities** — bn.js moderate (fix via override), 2 ignored CVEs (already in ignoreCves)
4. **63 console.* calls across 29 files** — audit for production info leakage
5. **Error handling inconsistency** — 12+ catch blocks that swallow errors with console.error only
6. **No error fingerprinting** — network errors create separate Sentry issues instead of grouping
7. **`SRS_CRON_API_KEY` missing from .env.example** — should be documented
8. **ErrorBoundary test failures: RESOLVED** — all 11 tests pass, MEMORY.md needs updating

### Burmese Unicode XSS Assessment
**Risk: NONE.** All Burmese text is:
- Hardcoded in `src/constants/questions/` (128 questions) — no user input
- Rendered via JSX expressions (`{question.text_my}`) which auto-escape
- Push notification bodies use Unicode escapes in static template strings
- No `eval()`, `new Function()`, or `innerHTML` with Burmese content
- The `\uXXXX` escapes in JSX are string literals, not code injection vectors

## Open Questions

1. **Sentry "Rendered more hooks" Issue (3 Events)**
   - What we know: Logged in MEMORY.md as "monitoring", likely React concurrent mode edge case
   - What's unclear: Whether it's reproducible or a transient race condition
   - Recommendation: Review the 3 Sentry events for common stack traces. If all point to the same component, investigate conditional hook usage. If scattered, mark as "concurrent mode noise" and resolve in dashboard.

2. **~15 Stale Sentry Issues from 2026-02-21 Triage**
   - What we know: 31 issues triaged, 6 code fixes committed, ~15 remain as stale/noise
   - What's unclear: Exact list of remaining issues and which need code fixes vs. dashboard resolution
   - Recommendation: Export remaining issues from Sentry, categorize as: (a) code fix needed, (b) resolve in dashboard, (c) already fixed by prior commits. Most will be (b) or (c).

3. **Console Output in Production**
   - What we know: 63 console calls across 29 files. Production Next.js does NOT strip console.* by default.
   - What's unclear: Whether any contain sensitive info (auth tokens, user data)
   - Recommendation: Audit each call. Replace error logging with `captureError()`. Keep `console.error` only in development guards. Do NOT remove all — some are intentional developer-facing diagnostics.

4. **Bundle Size Impact of Existing Dependencies**
   - What we know: 27 production dependencies. @sentry/nextjs, recharts, motion, and react-joyride are typically the heaviest.
   - What's unclear: Actual bundle breakdown without running analyzer
   - Recommendation: Run `ANALYZE=true pnpm run build` and document findings. Prioritize any dependency contributing >100KB that isn't tree-shaken.

## Sources

### Primary (HIGH confidence)
- Direct codebase audit of all files in `src/`, `pages/`, middleware.ts, next.config.mjs, and Sentry config files
- `pnpm audit` output: 4 vulnerabilities (2 moderate bn.js, 2 high already in ignoreCves)
- `npx vitest run src/__tests__/errorBoundary.test.tsx`: all 11 tests passing
- Phase 13 security research (`.planning/milestones/v2.0-phases/13-security-hardening/13-RESEARCH.md`) — comprehensive prior security audit
- Phase 13 RLS audit (`.planning/security/rls-audit.md`) — 9 tables, all with RLS + policies
- Existing error handling patterns in src/contexts/ (12 catch blocks), src/hooks/ (throw vs. fallback), src/components/BilingualToast.tsx (no-op pattern)

### Secondary (MEDIUM confidence)
- [Sentry Next.js Sampling Best Practices](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/sampling/) — 0.2 prod traces, 0.1 replays, 1.0 error replays
- [Sentry Next.js Special Use Cases](https://docs.sentry.io/platforms/javascript/guides/nextjs/best-practices/) — fingerprinting, environment config
- [Next.js Security Checklist (Arcjet)](https://blog.arcjet.com/next-js-security-checklist/) — OWASP alignment
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) — hash-based vs nonce-based
- [TypeScript retry pattern](https://tusharf5.com/posts/type-safe-retry-function-in-typescript/) — withRetry utility pattern
- [pnpm audit docs](https://pnpm.io/cli/audit) — `--fix` adds overrides, `--prod` filters

### Tertiary (LOW confidence)
- "Rendered more hooks" Sentry issue — only 3 events, may be noise from React concurrent mode
- Stale ~15 Sentry issues — need dashboard access to enumerate

## Deep Dive: Codebase-Wide Audit Findings (2026-02-22)

Three parallel audit agents scanned 335 source files across React patterns, dead code, and CSS/Tailwind.

### React Patterns & Performance

**God Components (HIGH priority):**

| Component | Lines | Effects | Issue | Suggested Split |
|-----------|-------|---------|-------|-----------------|
| `InterviewSession.tsx` | 1478 | 15+ useEffect | Phase state machine + audio + TTS + recognition + UI + persistence | 5-6 files: orchestrator + useInterviewPhases + useAudioPlayback + useSpeechFlow + useInterviewGrading |
| `TestPage.tsx` | 976 | 13 useEffect | Quiz state + timer + nav lock + persistence + keyboard + SRS | 4 files: TestPage + TestQuizView + useTestSession + useTestGuards |
| `PracticeSession.tsx` | 578 | 8+ useEffect | Quiz state + timer + segment review + exit dialog | Extract usePracticeSession (hooks already partially extracted) |
| `TestResultsScreen.tsx` | 650+ | celebration + audio | Celebration orchestration + score + audio + share + weak areas | Extract useCelebrationChoreography + useResultsAudio |

**No Issues Found (good news):**
- No significant prop drilling — components use direct props or context
- No stale React patterns — React Compiler rules followed correctly throughout
- No unnecessary re-renders from context providers (all memoized properly)
- Only 1 medium-severity inline computation: `answerChoicesAudioText` in TestPage (should be useMemo)

### Dead Code & Duplication

**Overall: Remarkably clean.** Zero unused dependencies, zero orphaned files, zero unreachable branches.

**Consolidation Opportunities:**

1. **IndexedDB Store Boilerplate** (~250 LOC savings, HIGH priority)
   - 8 stores follow identical pattern: `createStore()` → `get/set/del` CRUD
   - Files: bookmarkStore.ts, interviewStore.ts, masteryStore.ts, badgeStore.ts, srsStore, syncQueue, etc.
   - Fix: Create `createIndexedDBStore<T>()` generic factory in `src/lib/pwa/createIndexedDBStore.ts`

2. **Frequency Sweep Audio Patterns** (~40 LOC savings, LOW priority)
   - 3 similar oscillator sweep patterns in soundEffects.ts
   - Fix: Extract `createFrequencySweep()` helper

**Safe Removal Candidates:**
- `OscillatorWaveType` export (soundEffects.ts:65) — only used internally
- `AudioPlayerState` export (audioPlayer.ts:17-19) — never imported
- Verify `nativeBridge.ts` usage — no imports found in source files

### CSS, Tailwind & Animations

**Overall: A+ (Excellent).** 98% design system compliance, zero hardcoded hex colors, proper reduced-motion support.

**Missing Dark Mode Variants (HIGH priority, low effort):**

| File | Issue | Fix |
|------|-------|-----|
| `NBAHeroCard.tsx` (lines 49-68) | `ICON_COLOR_MAP` uses `text-amber-500`, `text-orange-500`, etc. without `dark:` | Add `dark:text-amber-400`, `dark:text-orange-400` etc. |
| `CompactStatRow.tsx` (lines 44-48) | Some color functions missing dark variants | Add dark: pairs |
| `TTSFallbackBadge.tsx` (line 33) | `bg-amber-500/20 text-amber-400` without dark: | Add `dark:bg-amber-500/30 dark:text-amber-300` |
| `LeaderboardTable.tsx` (line 43) | `text-amber-700` for 3rd place — too dark in dark mode | Add `dark:text-amber-400` |
| `Flashcard3D.tsx` (lines 95-104) | Category gradient overlays at fixed opacity | Add `dark:` gradients with increased opacity |

**Animation Spring Inconsistency (LOW priority):**
- 4 presets defined in motion-config.ts, but some components use custom stiffness values (100, 250, 300, 600)
- Fix: Document or add 1-2 additional presets

**Compliant Patterns (no issues):**
- 3D flip card CSS — correct `preserve-3d` + `overflow:hidden` on faces only
- Glass-morphism tiers — proper blur/opacity/dark-mode variants
- Reduced motion — excellent coverage across 25+ components
- Border radius convention — consistent pills/buttons/cards/modals/inputs
- Spacing grid — 4px compliant with 4 documented exceptions

### Audit Statistics

| Metric | Result |
|--------|--------|
| Source files analyzed | 335 |
| Unused exports | 2 (minor type defs) |
| Orphaned files | 0 |
| Unreachable branches | 0 |
| Unused dependencies | 0 |
| Duplicate patterns (>10 lines) | 2 (IndexedDB stores, audio sweeps) |
| Missing dark: variants | 5 files |
| Hardcoded hex colors | 0 |
| Prop drilling issues | 0 |
| Stale React patterns | 0 |

## Metadata

**Confidence breakdown:**
- Security audit: HIGH — direct codebase audit + Phase 13 prior work verified
- Error handling: HIGH — all patterns documented from source code analysis
- Sentry optimization: HIGH — configuration files read directly, best practices verified against docs
- Refactoring scope: HIGH (upgraded) — three parallel audit agents scanned all 335 files
- Dead code/duplication: HIGH (upgraded) — all exports, dependencies, and files verified
- CSS/Tailwind: HIGH — 66+ component files and 4 CSS files reviewed

**Research date:** 2026-02-22
**Deep dive date:** 2026-02-22
**Valid until:** 2026-03-22 (30 days — stable security patterns; check for new dependency CVEs weekly)
