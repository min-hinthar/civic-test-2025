# Phase 54: Route-Group Error Files + Constant Deduplication - Research

**Researched:** 2026-03-21
**Domain:** Next.js App Router error boundaries, error sanitization, constant deduplication
**Confidence:** HIGH

## Summary

This is a straightforward gap-closure phase. Two route-group error.tsx files (`app/(protected)/error.tsx` and `app/(public)/error.tsx`) expose raw `error.message` in English-only rendering. They need to match the pattern already established in `app/error.tsx` -- using `sanitizeError()` + `SharedErrorFallback` + bilingual rendering with Sentry reporting via `captureError()`.

A secondary task deduplicates `QUESTIONS_PER_SESSION` which is defined locally in `InterviewPage.tsx:29` as well as canonically exported from `interviewStateMachine.ts:50`. The local definition should be replaced with an import.

**Primary recommendation:** Clone the `app/error.tsx` pattern verbatim into both route-group error files. Replace the local `QUESTIONS_PER_SESSION` constant with an import from the canonical source.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ERRS-01 | All 3 error.tsx files use `sanitizeError()` to prevent raw message exposure | Reference pattern in `app/error.tsx` already implements this. Route-group files need identical treatment. |
| ERRS-02 | All 3 error.tsx files render bilingual error messages with "Return home" navigation | `SharedErrorFallback` component handles bilingual rendering + "Return home" button. Route-group files need to use it. |
</phase_requirements>

## Standard Stack

### Core (already in codebase -- no new dependencies)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `@/lib/errorSanitizer` | n/a (local) | `sanitizeError()` producing `BilingualMessage` | Already exists |
| `@/components/ui/SharedErrorFallback` | n/a (local) | Presentational bilingual error component | Already exists |
| `@/lib/sentry` | n/a (local) | `captureError()` wrapper with PII sanitization | Already exists |
| `@/contexts/LanguageContext` | n/a (local) | `useLanguage()` for bilingual state | Already exists |
| `@/lib/interview/interviewStateMachine` | n/a (local) | Canonical `QUESTIONS_PER_SESSION` export | Already exists |

**No new packages required.** This phase exclusively uses existing codebase infrastructure.

## Architecture Patterns

### Pattern 1: Route-Group Error File (Clone-from-Root)

**What:** Every `error.tsx` in a Next.js App Router route group follows an identical pattern since they all render inside the root layout's `<ClientProviders>` wrapper.

**Why route-group error files share the same pattern as root:**
- `app/layout.tsx` wraps `{children}` in `<ClientProviders>` which contains all providers
- Route groups `(protected)` and `(public)` are organizational -- they do NOT create separate provider trees
- `(protected)/layout.tsx` adds auth guard + NavigationShell but is INSIDE root layout
- `(public)` has NO layout.tsx -- inherits root layout directly
- Therefore: `useLanguage()` is available in both route-group error files via the same try/catch pattern

**Critical distinction from `global-error.tsx`:**
- `global-error.tsx` renders OUTSIDE the root layout (replaces it entirely) -- cannot use providers, must use inline styles, uses `Sentry.captureException` directly
- `error.tsx` and route-group `error.tsx` files render INSIDE root layout -- providers available, can use Tailwind/components, use `captureError()` wrapper

**Reference implementation (`app/error.tsx` -- already correct):**
```typescript
'use client';

import { useEffect } from 'react';
import { sanitizeError } from '@/lib/errorSanitizer';
import { captureError } from '@/lib/sentry';
import { SharedErrorFallback } from '@/components/ui/SharedErrorFallback';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RouteGroupError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  let showBurmese = true;
  try {
    const lang = useLanguage();
    showBurmese = lang.showBurmese;
  } catch {
    try {
      showBurmese = localStorage.getItem('civic-test-language-mode') !== 'english-only';
    } catch {
      // localStorage blocked -- default true
    }
  }

  useEffect(() => {
    captureError(error, { source: 'error-source-name', digest: error.digest });
  }, [error]);

  const message = sanitizeError(error);

  return (
    <SharedErrorFallback
      message={message}
      showBurmese={showBurmese}
      onRetry={reset}
      onGoHome={() => {
        window.location.href = '/';
      }}
    />
  );
}
```

**Only differences between route-group error files:**
1. Function name: `ProtectedError` vs `PublicError` (matching current naming)
2. `captureError` source tag: `'(protected)/error.tsx'` vs `'(public)/error.tsx'`

### Pattern 2: Constant Deduplication (Import-from-Canonical)

**What:** Replace local constant definition with import from canonical source.

**Current state:**
- `src/lib/interview/interviewStateMachine.ts:50` -- `export const QUESTIONS_PER_SESSION = 20` (canonical)
- `src/views/InterviewPage.tsx:29` -- `const QUESTIONS_PER_SESSION = 20` (duplicate, local)

**Target state:**
- `InterviewPage.tsx` imports from `interviewStateMachine.ts`
- Other consumers already import correctly: `InterviewSession.tsx`, `useInterviewPhaseEffects.ts`

### Anti-Patterns to Avoid

- **Direct Sentry import in route-group error files:** Use `captureError()` from `@/lib/sentry`, NOT `Sentry.captureException()` directly. The wrapper handles PII sanitization. Exception: `global-error.tsx` uses Sentry directly for catastrophic resilience.
- **Exposing `error.message` in JSX:** Never render raw error text. Always use `sanitizeError()` to produce a `BilingualMessage`.
- **Calling `useLanguage()` without try/catch:** The provider might have crashed before the error boundary renders. Always wrap in try/catch with localStorage fallback.
- **Using `<Link>` for "Return home":** Use `window.location.href = '/'` for hard navigation. Error state may have corrupted React tree -- a full page reload is safer.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bilingual error messages | Inline English/Burmese strings | `sanitizeError()` | Pattern-matched, sensitive data filtered, consistent across all error surfaces |
| Error UI rendering | Custom `<div>` with Tailwind | `SharedErrorFallback` | Consistent design (amber icon, 44px touch targets, bilingual layout) |
| Sentry reporting | `Sentry.captureException()` | `captureError()` from `@/lib/sentry` | PII sanitization, context sanitization |
| Language detection in error context | Custom state check | `useLanguage()` + localStorage fallback | Handles provider crash, localStorage blocked, default-true |

## Common Pitfalls

### Pitfall 1: Rules of Hooks Violation in Error Files
**What goes wrong:** Wrapping `useLanguage()` in a conditional or early-return creates Rules of Hooks violation.
**Why it happens:** Developer thinks "if provider crashed, skip the hook call."
**How to avoid:** Always call `useLanguage()` unconditionally. Wrap the value extraction in try/catch, not the hook call itself. This is the established pattern in `app/error.tsx`.
**Warning signs:** ESLint `react-hooks/rules-of-hooks` error.

### Pitfall 2: Forgetting Sentry Reporting
**What goes wrong:** Error files render the user-facing fallback but don't report to Sentry.
**Why it happens:** Focus on UI, forget telemetry.
**How to avoid:** Always include the `useEffect` with `captureError()`. Include `source` and `digest` in context.
**Warning signs:** Route-group errors not appearing in Sentry dashboard.

### Pitfall 3: Using Wrong localStorage Key
**What goes wrong:** Fallback language check reads wrong key, defaults incorrectly.
**Why it happens:** Key is not obvious -- `'civic-test-language-mode'` with value `'english-only'` (not `'burmese'`/`'english'`).
**How to avoid:** Copy the exact key and comparison from `app/error.tsx`: `localStorage.getItem('civic-test-language-mode') !== 'english-only'`.
**Warning signs:** Burmese text showing when user has English-only mode set.

### Pitfall 4: Import Path Collision After Deduplication
**What goes wrong:** After removing local `QUESTIONS_PER_SESSION`, other local references break.
**Why it happens:** Forgetting to add the import statement.
**How to avoid:** Replace the `const QUESTIONS_PER_SESSION = 20;` line with `import { QUESTIONS_PER_SESSION } from '@/lib/interview/interviewStateMachine';` in the imports section.
**Warning signs:** TypeScript error on undefined variable.

## Code Examples

### Route-Group Error File (Protected)
```typescript
// Source: Adapted from app/error.tsx (existing codebase reference)
'use client';

import { useEffect } from 'react';
import { sanitizeError } from '@/lib/errorSanitizer';
import { captureError } from '@/lib/sentry';
import { SharedErrorFallback } from '@/components/ui/SharedErrorFallback';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  let showBurmese = true;
  try {
    const lang = useLanguage();
    showBurmese = lang.showBurmese;
  } catch {
    try {
      showBurmese = localStorage.getItem('civic-test-language-mode') !== 'english-only';
    } catch {
      // localStorage blocked (private browsing) -- default true
    }
  }

  useEffect(() => {
    captureError(error, { source: '(protected)/error.tsx', digest: error.digest });
  }, [error]);

  const message = sanitizeError(error);

  return (
    <SharedErrorFallback
      message={message}
      showBurmese={showBurmese}
      onRetry={reset}
      onGoHome={() => {
        window.location.href = '/';
      }}
    />
  );
}
```

### Constant Deduplication in InterviewPage.tsx
```typescript
// REMOVE line 29:
// const QUESTIONS_PER_SESSION = 20;

// ADD to imports:
import { QUESTIONS_PER_SESSION } from '@/lib/interview/interviewStateMachine';
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x + React Testing Library |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ERRS-01 | error.tsx files use sanitizeError() | typecheck + build | `pnpm typecheck && pnpm build` | n/a (static verification) |
| ERRS-02 | error.tsx files render bilingual with navigation | typecheck + build | `pnpm typecheck && pnpm build` | n/a (static verification) |

### Sampling Rate
- **Per task commit:** `pnpm typecheck && pnpm test:run`
- **Per wave merge:** `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Phase gate:** Full suite green before verification

### Wave 0 Gaps
None -- existing test infrastructure covers all phase requirements. The error sanitizer and SharedErrorFallback are already tested (`src/__tests__/errorSanitizer.test.ts`, `src/__tests__/errorBoundary.test.tsx`). The route-group error files are thin wiring that is verified by typecheck + build. The constant deduplication is verified by typecheck (import resolution) and existing `interviewStateMachine.test.ts` (constant value assertion).

## State of the Art

| Old Approach (current route-group files) | Current Approach (root error.tsx) | When Changed | Impact |
|------------------------------------------|-----------------------------------|--------------|--------|
| Raw `error.message` in JSX | `sanitizeError()` producing `BilingualMessage` | Phase 49 | Prevents PII/internal detail exposure |
| English-only hardcoded strings | `SharedErrorFallback` with bilingual rendering | Phase 49 | Burmese users see native language |
| Direct `Sentry.captureException` | `captureError()` wrapper with PII sanitization | Phase 49 | Consistent PII stripping |
| No "Return home" navigation | `onGoHome` with `window.location.href` | Phase 49 | Users can recover from error state |

## Open Questions

None. This phase has zero ambiguity:
- The reference pattern exists and is proven (`app/error.tsx`)
- The components and utilities are already built and tested
- The constant deduplication is a single-line change (remove local, add import)

## Sources

### Primary (HIGH confidence)
- `app/error.tsx` -- reference implementation (lines 1-48)
- `app/(protected)/error.tsx` -- current state showing gaps (lines 1-29)
- `app/(public)/error.tsx` -- current state showing gaps (lines 1-22)
- `src/components/ui/SharedErrorFallback.tsx` -- component API (lines 1-75)
- `src/lib/errorSanitizer.ts` -- sanitizeError() API (lines 1-235)
- `src/lib/sentry.ts` -- captureError() API (lines 167-185)
- `app/layout.tsx` -- confirms ClientProviders wraps all route groups (line 49)
- `app/(protected)/layout.tsx` -- confirms renders inside root layout (line 27)
- `src/lib/interview/interviewStateMachine.ts:50` -- canonical QUESTIONS_PER_SESSION export
- `src/views/InterviewPage.tsx:29` -- duplicate constant to remove

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` -- Phase 49 decisions confirming SharedErrorFallback pattern

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all components exist and are tested in the codebase
- Architecture: HIGH -- reference implementation exists as `app/error.tsx`
- Pitfalls: HIGH -- patterns documented in Phase 49 decisions and visible in code
- Constant deduplication: HIGH -- both definition sites confirmed, import path verified

**Research date:** 2026-03-21
**Valid until:** Indefinite (internal codebase patterns, no external dependency concerns)
