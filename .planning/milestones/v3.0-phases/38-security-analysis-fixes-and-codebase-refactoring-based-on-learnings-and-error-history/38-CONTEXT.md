# Phase 38: Security Analysis, Fixes, and Codebase Refactoring — Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the existing codebase through security analysis, systematic refactoring based on 37 phases of accumulated learnings, Sentry error cleanup, and unified error handling. This phase improves code health — no new features, no new UI, no new capabilities.

</domain>

<decisions>
## Implementation Decisions

### Security Audit Scope
- Claude conducts a **fresh, comprehensive security audit** — no specific user concerns beyond XSS in bilingual content
- All security surfaces evaluated by Claude based on actual risk: dependencies, auth flows, CSP directives, input sanitization, storage security, HTTP headers, API routes, third-party data flows, service worker caching, push notification security, SRI, env variable handling, console output, ErrorBoundary info leakage, OWASP-relevant vectors
- **Security checklist** artifact produced — document what was audited and what passed/failed
- **XSS in bilingual content** flagged as specific concern — Burmese Unicode content rendered dynamically across the app needs audit for injection vectors
- Current errorSanitizer is sufficient — no extension needed

### Refactoring from Learnings
- Claude decides per case whether each learning warrants a **codebase-wide fix or documentation only**
- **Full dead code audit** — scan for unused exports, unreachable branches, orphaned files, and prune everything
- **CSS anti-pattern audit** — check for remaining preserve-3d + overflow:hidden, backdrop-filter on 3D children, and other known pitfalls
- **Provider tree audit** — review all 8 Context providers for potential consolidation, simplification, or ordering issues
- **Bundle size audit** — analyze what contributes most to bundle, look for tree-shaking failures or heavy unused imports
- **File structure audit** — review directory organization, naming conventions, and file placement for consistency
- **Duplication audit** — find logic that evolved independently across phases and consolidate where it reduces maintenance burden
- **Quick a11y audit** — check for accessibility regressions introduced in Phases 29-37
- **Performance audit** — profile key flows for render bottlenecks and unnecessary re-renders
- **React pattern audit** — look for over-effectful components, excessive prop drilling, god-components needing splitting
- **Tailwind audit** — find arbitrary values, missing dark: variants, inconsistent class ordering
- **Animation pattern audit** — evaluate mixed CSS keyframes vs. motion variants vs. WAAPI for consistency
- **i18n coverage audit** — scan for hardcoded English strings that should have Burmese equivalents post-Phase 25
- **Fix ErrorBoundary test failures** — resolve the 9 pre-existing localStorage mock failures
- **Audit CLAUDE.md** — review every section for accuracy, remove outdated guidance, add missing patterns
- Claude decides: ESLint rule additions, JSDoc on complex functions, MEMORY.md cleanup, sync layer review, test coverage gaps, TypeScript type audit

### Sentry Error Cleanup
- Claude categorizes the ~15 remaining stale/noise issues and recommends code fixes vs. dashboard resolution
- Claude evaluates the "Rendered more hooks" issue (3 events) for investigation priority
- Current errorSanitizer is sufficient — don't extend
- Claude decides: alerting rules, performance monitoring, source map configuration, sampling rates, error fingerprinting/grouping quality

### Error Handling Consistency
- **Formalize throw-vs-fallback pattern** — critical operations throw (caller needs success), convenience operations fall back gracefully. Document and enforce across all hooks.
- **Add try-catch boundaries** around critical async paths (IndexedDB operations, Supabase calls, audio playback) with standardized error handlers
- **Silent retry first** — retry silently 2-3 times before showing error to user. Only escalate after all retries fail.
- **Shared `withRetry`/`safeAsync` utility** — create a reusable wrapper that standardizes retry + error escalation for all async operations
- Claude decides: retry strategy (exponential vs. fixed), Sentry auto-reporting from utility, unhandled rejection handling, error aggregation vs. isolation, error path test coverage

### Claude's Discretion
- Security audit prioritization based on actual risk assessment
- Which learnings warrant codebase-wide refactoring vs. documentation only
- ESLint rule additions for React Compiler patterns
- JSDoc annotations on complex functions
- MEMORY.md cleanup and consolidation
- Sync layer re-audit scope
- Test coverage gap assessment
- TypeScript type safety audit scope
- Sentry configuration optimizations
- Error aggregation architecture
- Error path automated test selection
- withRetry retry strategy and Sentry integration

</decisions>

<specifics>
## Specific Ideas

- XSS audit specifically on Burmese Unicode content — dynamic rendering across the app could be an injection vector
- The 30+ Common Pitfalls in MEMORY.md serve as the starting checklist for systematic refactoring
- Sentry debug session from 2026-02-21 is the baseline — 31 issues triaged, 6 code fixes committed, ~15 stale/noise remaining
- Error handling philosophy already partially established: TTS speak() throws, useToast returns no-op — extend this formalized pattern to all hooks/utilities
- Silent retry then escalate mirrors the existing sync queue's exponential backoff approach

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 38-security-analysis-fixes-and-codebase-refactoring-based-on-learnings-and-error-history*
*Context gathered: 2026-02-22*
