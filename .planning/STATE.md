---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-02T00:13:53.188Z"
progress:
  total_phases: 10
  completed_phases: 10
  total_plans: 30
  completed_plans: 30
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T23:50:49.014Z"
progress:
  total_phases: 10
  completed_phases: 9
  total_plans: 30
  completed_plans: 28
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: unknown
last_updated: "2026-03-01T22:37:26.584Z"
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 27
  completed_plans: 27
---

---
gsd_state_version: 1.0
milestone: v4.0
milestone_name: Next-Gen Architecture
status: in-progress
last_updated: "2026-03-01T14:35:33Z"
progress:
  total_phases: 10
  completed_phases: 8
  total_plans: 25
  completed_plans: 25
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Phase 45 Complete - Content Enrichment

## Current Position

Phase: 46 of 47 (Cross-Device Sync)
Plan: 3 of 3 in current phase
Status: Phase Complete
Last activity: 2026-03-01 -- Completed 46-03 (Visibility sync & login hydration pull)

Progress: [██████████] 98%

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
| Phase 42 P01 | 4min | 2 tasks | 7 files |
| Phase 42 P02 | 6min | 2 tasks | 1 files |
| Phase 43 P01 | 7min | 2 tasks | 7 files |
| Phase 43 P04 | 9min | 2 tasks | 2 files |
| Phase 43 P02 | 28min | 2 tasks | 5 files |
| Phase 43 P03 | 34min | 2 tasks | 5 files |
| Phase 44 P01 | 7min | 2 tasks | 6 files |
| Phase 44 P02 | 9min | 2 tasks | 9 files |
| Phase 45 P01 | 142min | 2 tasks | 9 files |
| Phase 45 P02 | 3min | 2 tasks | 6 files |
| Phase 45 P03 | 6min | 2 tasks | 9 files |
| Phase 46 P01 | 8min | 2 tasks | 10 files |
| Phase 46 P02 | 11min | 2 tasks | 9 files |
| Phase 46 P03 | 8min | 2 tasks | 3 files |

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
- [Phase 42]: Nonce-based CSP with strict-dynamic replaces hash-based allowlisting
- [Phase 42]: Security headers consolidated in proxy.ts (removed from next.config.mjs headers())
- [Phase 42]: HASH_REDIRECT_SCRIPT removed as dead code after App Router migration
- [Phase 42]: Auth page.tsx converted to async Server Component for nonce forwarding to GoogleOneTapSignIn
- [Phase 42]: await headers() forces dynamic rendering -- acceptable for client-rendered SPA
- [Phase 42]: SW caching needs no code changes -- defaultCache from @serwist/next/worker v9.5.6 already covers App Router RSC patterns
- [Phase 43]: Export FSRS singleton as fsrsInstance (not duplicate instance) for retrievability projection
- [Phase 43]: Accuracy dimension weighted by sub-category question count (matches calculateOverallMastery pattern)
- [Phase 43]: 60% cap uses 3 main USCIS categories (not 7 sub-categories) for zero-coverage check
- [Phase 43]: drillSelection is synchronous -- caller pre-loads answer history for purity/testability
- [Phase 43]: Drill CTA visibility uses categoryMasteries.some(m < 70) -- derives from existing prop
- [Phase 43]: End-of-practice drill suggestion gated by mode === 'practice' (mock tests excluded)
- [Phase 43]: Both drill CTAs navigate to /drill (weak-all mode) via router.push
- [Phase 43]: useReadinessScore hook composes useCategoryMastery + IndexedDB data for readiness engine
- [Phase 43]: Tier gradient backgrounds shift per score range with brighter dark mode variants
- [Phase 43]: Single animPhase counter for staggered DrillResults animation avoids React Compiler setState-in-effect
- [Phase 43]: Inline computeReadinessScore() for drill pre/post comparison (avoids useReadinessScore hook instance sharing)
- [Phase 43]: PracticeSession reused with timerEnabled=false and no session persistence for drill mode
- [Phase 44]: Drill recommendation count fixed at 10 (DRILL_MAX) per weakest category
- [Phase 44]: Pace status uses approximate totalDays = max(daysRemaining+14, 30) since start date not stored
- [Phase 44]: No-date mode newQuestionTarget uses clamp(unpracticedCount, 3, 10) for default daily pacing
- [Phase 44]: Weak categories derived from 3 main USCIS categories (not 7 sub-categories) matching readiness engine
- [Phase 44]: Native <input type='date'> for test date picker (zero new dependencies)
- [Phase 44]: NBA test-date awareness raises weak category threshold to 70% when test within 7 days
- [Phase 45]: 11 tricky flags (within 10-25 range) targeting questions with confusable answers
- [Phase 45]: Programmatic enrichment injection for large files (47+28 questions) over manual editing
- [Phase 45]: Burmese enrichment content is culturally adapted, not literal translation
- [Phase 45]: Amber color scheme for mnemonic sections (distinct from primary blue and warning orange)
- [Phase 45]: Permanent localStorage dismissal for study tips (not session-based)
- [Phase 45]: StudyTipCard only shown in category drill mode (when categoryParam present)
- [Phase 45]: TrickyBadge placed after mastery badge in Flashcard3D for consistent badge ordering
- [Phase 45]: TrickyBadge in FeedbackPanel uses flex-wrap layout alongside streak badge
- [Phase 46]: Separate user_settings and user_bookmarks tables (not extending profiles) to avoid trigger conflicts
- [Phase 46]: Individual columns for settings (not JSONB) matching project pattern for type safety
- [Phase 46]: Freeze recalculation removes freezes on dates with activity after merge, returns freed to pool capped at 3
- [Phase 46]: Longest streak recomputed from merged dates via calculateStreak (not max of both)
- [Phase 46]: useRef+useEffect pattern for user ID to satisfy React Compiler react-hooks/refs rule
- [Phase 46]: gatherCurrentSettings() centralized in settingsSync.ts for single-source localStorage key mapping
- [Phase 46]: callbacksRef synced in useEffect for React Compiler compliance (not during render)
- [Phase 46]: 5-second throttle on visibility sync to prevent rapid-fire pulls from quick tab switches
- [Phase 46]: SRS visibility sync (SYNC-01) confirmed already working via existing SRSContext handler

### Pending Todos

None yet.

### Blockers/Concerns

- FSRS retrievability projection API verified in Phase 43 P01 -- get_retrievability(card, now, false) returns 0-1 number
- Serwist Turbopack stability uncertain -- keep `--webpack` fallback through Phase 47
- Exit animation regression accepted for v4.0 (revisit with ViewTransition API later)

## Session Continuity

Last session: 2026-03-02T00:04:39Z
Stopped at: Completed 46-02-PLAN.md (46-03 also complete)
Resume file: None
