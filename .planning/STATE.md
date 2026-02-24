# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 41 - Route Migration

## Current Position

Phase: 41 of 47 (Route Migration)
Plan: 5 of 5 in current phase
Status: Phase 41 COMPLETE
Last activity: 2026-02-24 -- Completed 41-05 (Final cleanup: removed react-router-dom, deleted Pages Router, wired layouts)

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 248 (across v1.0-v3.0)
- v4.0 plans completed: 9
- Total execution time: 123min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 39 | 4/4 | 58min | 15min |
| 40 | 3/3 | 23min | 8min |
| 41 | 2/5 | 42min | 21min |

**Recent Trend:**
- 39-01: 12min (dependency upgrade, 1 task)
- 39-02: 20min (Next.js 16 upgrade, 2 tasks)
- 39-03: 18min (Sentry App Router reconfiguration, 2 tasks)
- 39-04: 8min (full verification suite and smoke test, 2 tasks)
- 40-01: 4min (shared foundations: theme script + ClientProviders, 2 tasks)
- 40-02: 7min (root layout & AppShell refactor, 2 tasks)
- 40-03: 12min (auth guard layout & returnTo pattern, 2 tasks)
- 41-01: 32min (route scaffolding: page wrappers, template, hub catch-all, redirects, 2 tasks)
- 41-02: 10min (push notification route migration, 2 tasks)

*Updated after each plan completion*
| Phase 41 P04 | 7min | 2 tasks | 20 files |
| Phase 41 P03 | 17min | 2 tasks | 19 files |
| Phase 41 P05 | 28min | 2 tasks | 36 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v4.0: Use `--webpack` flag for Next.js 16 build (Turbopack incompatible with Sentry + Serwist plugin chain)
- v4.0: Migrate all routes in one phase (mixed Pages/App Router causes hard navigations destroying state)
- v4.0: Accept enter-only page transitions (App Router does not support AnimatePresence exit animations)
- v4.0: English-only mnemonics initially (Burmese mnemonics need native speaker - BRMSE-01)
- 39-01: Keep tailwindcss at v3 (v4 requires architectural rewrite), eslint at v9, @types/node at v22
- 39-01: Upgrade TypeScript 5.8->5.9, all other non-Next deps to latest
- 39-02: Use @next/codemod for middleware-to-proxy rename
- 39-02: Replace custom Sentry inline types with ErrorEvent/EventHint from @sentry/nextjs
- 39-02: ESLint flat config must ignore generated files when using eslint . instead of next lint
- 39-03: App Router layout.tsx required even for minimal app/ directory usage
- 39-03: AbortError events dropped entirely from Sentry (pure navigation noise)
- 39-03: App Router and Pages Router coexist via Next.js dual-routing
- 39-04: Stylelint 17.3 requires block-level disable/enable for multi-line vendor-prefix properties
- [Phase 40]: THEME_SCRIPT extracted as byte-for-byte identical string to preserve CSP hash
- [Phase 40]: ClientProviders uses optional routerWrapper prop for framework agnosticism
- [Phase 40]: App Router layout uses metadata/viewport exports (not manual meta tags)
- [Phase 40]: Dual theme-color array with prefers-color-scheme media queries
- [Phase 40]: ClientProviders in app/layout.tsx has no routerWrapper (App Router doesn't use react-router-dom)
- [Phase 40]: URL param returnTo replaces react-router state for redirect-after-login (cross-router compatible)
- [Phase 40]: All returnTo values validated: must start with / and not // (open redirect prevention)
- [Phase 41]: Remove old pages/api files immediately when App Router route exists (Next.js build fails on conflicts)
- [Phase 41]: Route Handlers use request.headers.get('x-forwarded-for') only (no socket.remoteAddress)
- [Phase 41]: SPRING_GENTLE for enter-only page transitions (smooth without exit counterpart)
- [Phase 41]: HubPageClient receives initialTab but defers forwarding to HubPage until Plan 03/04
- [Phase 41]: usePathname null coalesced to /home (Next.js types return string|null)
- [Phase 41]: Badge deep-linking uses search params (?focusBadge=id) instead of location.state for cross-page data
- [Phase 41]: InterviewResults navigate('/') corrected to canonical /home to avoid redirect chain
- [Phase 41]: Unified useNavigationGuard hook replaces separate TestPage/InterviewPage guard implementations
- [Phase 41]: HIDDEN_ROUTES removed from NavigationShell/Sidebar/BottomTabBar (only render in protected layout)
- [Phase 41]: AuthPage searchParams-only returnTo (location.state fallback removed)
- [Phase 41]: StudyGuidePage hash tracking via useState+hashchange (usePathname excludes hash)
- [Phase 41]: src/pages renamed to src/views because Next.js detects src/pages as Pages Router directory conflicting with app/
- [Phase 41]: GlobalOverlays client component for ssr:false dynamic overlay imports (not allowed in Server Components)
- [Phase 41]: Suspense boundaries required for pages using useSearchParams (App Router static generation)

### Pending Todos

None yet.

### Blockers/Concerns

- FSRS retrievability projection API needs verification before Phase 43 (readiness engine)
- Serwist Turbopack stability uncertain -- keep `--webpack` fallback through Phase 47
- Exit animation regression accepted for v4.0 (revisit with ViewTransition API later)

## Session Continuity

Last session: 2026-02-24T14:58:57.406Z
Stopped at: Completed 41-05-PLAN.md
Resume file: None
