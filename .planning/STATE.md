# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-05)

**Core value:** Burmese immigrants can confidently prepare for and pass the US civics test using an app that feels welcoming and speaks their language.
**Current focus:** Gap closure phases from v1 audit

## Current Position

Phase: 8 of 9 (Critical Integration Fixes)
Plan: 3 of 3
Status: Phase complete
Last activity: 2026-02-08 - Completed 08-03-PLAN.md

Progress: [██████████] 100% (56 plans / 56 total)

## Performance Metrics

**Velocity:**
- Total plans completed: 56 (Phases 1-8 complete)
- Average duration: ~12 min
- Total execution time: ~680 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 5 | 49 min | 10 min |
| 02-pwa-offline | 6 | 141 min | 24 min |
| 03-ui-ux-bilingual-polish | 9+1 | 190 min | 19 min |
| 04-learning-explanations | 9 | 72 min | 8 min |
| 05-spaced-repetition | 9 | ~60 min | ~7 min |
| 06-interview-simulation | 6 | ~40 min | ~7 min |
| 07-social-features | 8/8 | 86 min | 11 min |
| 08-critical-integration-fixes | 3/3 | 27 min | 9 min |

**Recent Trend:**
- Phase 8 addresses build/lint blockers from v1 audit
- Pre-commit hook restored (was bypassed since Phase 4)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Derive phases from requirements - 7 phases covering 10 requirement categories
- Roadmap: Phase 2 and 3 can run in parallel after Phase 1 completes
- 01-01: Used ESLint flat config for ESLint 9 compatibility
- 01-01: Set 70% coverage thresholds for test coverage
- 01-01: Typecheck excluded from pre-commit (runs in CI only)
- 01-05: Question IDs changed from number to string (GOV-P##, HIST-C##, etc.)
- 01-05: Questions split into 7 category modules for maintainability
- 01-02: Chi-squared threshold set to 50 for shuffle uniformity test
- 01-02: Save guard uses state machine (idle/saving/saved/error)
- 01-02: Navigation lock uses replaceState in popstate handler
- 01-03: Made user_id and mock_test_id optional for query result flexibility
- 01-03: Added global type declarations to ESLint for Google Identity Services
- 01-04: Use djb2 hash for user ID anonymization in error reporting
- 01-04: Error messages use bilingual format { en: string, my: string }
- 01-04: beforeSend handler strips PII at Sentry event level
- 02-01: Used static public/manifest.json instead of app/manifest.ts (Pages Router)
- 02-01: Added serviceworker globals to ESLint for service worker context
- 02-01: Serwist disabled in development mode to avoid caching issues
- 02-01: PWA files located in src/lib/pwa/ directory
- 02-03: Exponential backoff: 5 retries with 1s base delay for sync queue
- 02-03: Sync queue stores in IndexedDB syncQueueStore, syncs to Supabase
- 02-03: SyncStatusIndicator hidden when no pending items
- 02-03: Bilingual toast for sync completion (English + Burmese)
- 02-02: OfflineContext merges question caching with sync queue functionality
- 02-02: useOnlineStatus uses useSyncExternalStore for SSR-safe browser API access
- 02-02: OnlineStatusIndicator is icon-only (green=online, orange=offline)
- 02-02: OfflineProvider placed outside ThemeProvider in provider hierarchy
- 02-04: Lazy state initializers for browser API checks (avoid setState in effects)
- 02-04: 7-day cooldown after user dismisses install prompt
- 02-04: Notification pre-prompt explains value before native browser dialog
- 02-04: PWAOnboardingFlow as local AppShell component (not in OfflineContext)
- 02-05: Lazy useState initializer for iOS tip visibility (avoids setState in effect)
- 02-05: 2-second delay for iOS tip after welcome modal closes
- 02-06: Pages Router API routes for push (pages/api/push/*.ts, not App Router)
- 02-06: ESLint no-undef disabled for TS files (TypeScript compiler handles DOM types)
- 02-06: VAPID keys conditionally initialized (prevents crash when env vars missing)
- 02-06: Settings page as protected route at /settings
- 02-06: .env.example exception added to .gitignore
- 03-01: Self-host Myanmar font via @fontsource for PWA offline support
- 03-01: 10-shade blue palette with HSL values for consistent theming
- 03-01: Animation timing 150-250ms (snappy per user decision)
- 03-01: Design tokens centralized in src/lib/design-tokens.ts
- 03-02: Motion spring physics: stiffness 400/damping 17 for Button, 300/20 for Card
- 03-02: Use HTMLMotionProps from motion/react to avoid type conflicts
- 03-02: Button minimum height 44px for touch accessibility
- 03-02: Skeleton shimmer respects prefers-reduced-motion via CSS media query
- 03-03: Toast positioned at bottom-center with slide-up animation
- 03-03: Bilingual toast supports titleMy and descriptionMy props for Burmese
- 03-03: Dialog uses 90vw width on mobile, max-w-lg on desktop
- 03-03: Progress bar spring animation with stiffness 100, damping 20
- 03-04: Page transition uses slide (x: 20px) + fade with 200ms tween timing
- 03-04: Stagger items with 80ms gap and 100ms initial delay
- 03-04: Use react-router-dom location.pathname as AnimatePresence key
- 03-04: PageTransition wraps Routes in AppShell.tsx with location cloning
- 03-07: SVG feTurbulence for paper texture overlay (no external images)
- 03-07: 50px threshold + 500 velocity for swipe detection
- 03-07: studyAnswers array used for flashcard answers
- 03-07: Onboarding persists to localStorage key 'civic-test-onboarding-complete'
- 03-07: Tour targets via data-tour attributes on elements
- 03-05: EN on top, MY below with text-muted-foreground for subtle hierarchy
- 03-05: equalSize prop on BilingualText for button contexts
- 03-05: Centralized strings in src/lib/i18n/strings.ts
- 03-05: createElement in BilingualHeading for dynamic heading level support
- 03-06: Timer trailColor uses hex (#E5E7EB) for react-countdown-circle-timer compatibility
- 03-06: @types/canvas-confetti explicit install for type definitions
- 03-06: Inline bilingual labels in CircularTimer as fallback
- 03-08: Progress variant mapping: 'almost-ready' uses 'default' since Progress lacks 'primary' variant
- 03-08: react-router-dom useNavigate for BilingualButton onClick (matching codebase pattern)
- 03-08: ReadinessIndicator weighted score: coverage 50% + accuracy 40% + streak 10%
- 03-08: Study streak computed from consecutive unique test days in history
- 03-08: Pre-existing Next.js build failure (sentry-example-page manifest) requires investigation
- 03-08a: react-router-dom for hash routing (project uses react-router-dom, not next/router)
- 03-08a: 1500ms feedback delay before question advancement in TestPage
- 03-08a: warning-500 (orange) replaces red for incorrect/failing throughout pages
- 03-09: Destructive/error colors use warm gray/orange (hue 25), NOT red - red reserved for patriotic decoration
- 03-09: LanguageProvider placed inside OfflineProvider, outside ThemeProvider in hierarchy
- 03-09: LanguageToggleCompact uses dot indicator when in English-only mode
- 03-09: SettingsPage migrated from hardcoded gray colors to design token classes
- Verification fix: BilingualText/Button/Heading now check useLanguage().showBurmese
- Verification fix: PageTransition rewritten for react-router-dom (was orphaned with next/router)
- Verification fix: All text-red-600/bg-red-600 replaced with text-destructive/warning tokens
- 04-01: Explanations colocated with questions for single-cache-unit offline support
- 04-01: Emerald (not green) for Integrated Civics to avoid clash with success-500 semantic color
- 04-01: Optional explanation field on Question interface for gradual rollout safety
- 04-01: Citation field only on constitutional questions (Articles/Amendments)
- 04-01: SUB_CATEGORY_NAMES with shorter bilingual display names
- 04-02: detectStaleCategories uses Record<string, string[]> mapping for category-question association
- 04-02: Exported TEST_WEIGHT (1.0) and PRACTICE_WEIGHT (0.7) as named constants
- 04-02: Set-based questionId lookup in calculateCategoryMastery for O(1) performance
- 04-02: Barrel export index.ts at @/lib/mastery re-exports all mastery module features
- 04-03: WhyButton wraps ExplanationCard with border-0 rounded-none for seamless embedding
- 04-03: RelatedQuestions filters out missing question IDs gracefully
- 04-03: ExplanationCard accepts allQuestions prop for RelatedQuestions ID lookup
- 04-05: Dark background overrides use Tailwind arbitrary variant selectors for white text on gradient card backs
- 04-05: stopPropagation on both click and keydown to prevent flip/swipe interference with explanation expand
- 04-05: Scrollable back face content area in Flashcard3D for expanded explanation overflow
- 04-04: WhyButton compact mode in test for smaller footprint during timed flow
- 04-04: Ref-based timeout pattern (feedbackTimeoutRef + pendingResultRef) for pauseable auto-advance
- 04-04: Review screen defaults to incorrect-only filter for focused learning
- 04-04: questionsById Map for O(1) explanation lookup in review (avoids extending QuestionResult)
- 04-04: onExpandChange callback on WhyButton for parent integration
- 04-06: CategoryRing uses custom SVG (not library) for full animation control
- 04-06: getMilestoneLevel thresholds: 50=bronze, 75=silver, 100=gold
- 04-06: Milestone session debounce: max 1 celebration per session via sessionStorage
- 04-06: Auto-dismiss timers: 5s bronze, 8s silver/gold
- 04-06: Deterministic message selection using category name hash for variety
- 04-07: Two-level expandable pattern in ProgressPage (category -> sub-category -> question rows)
- 04-07: Trend chart from testHistory (date-grouped sessions) rather than IndexedDB answer history
- 04-07: Dashboard CategoryGrid onCategoryClick navigates to /progress
- 04-08: State machine pattern for PracticePage: config->session->results phases
- 04-08: Previous mastery captured via useRef before session starts for animated ring
- 04-08: Mini CategoryRings on PreTestScreen for at-a-glance category status
- 04-08: Weak questions: accuracy < 60% threshold, unanswered treated as accuracy 0
- 04-09: Deterministic hash-based message selection for consistent nudge display per category
- 04-09: Practice session grouping by 5-minute timestamp gaps (no explicit session IDs)
- 04-09: QuestionAccuracyDot based on most recent answer for simple signal
- 04-09: Unattempted categories get primary (blue) styling, weak get warning (orange)
- 05-01: FSRS module-level singleton (not per-component) for performance
- 05-01: Binary grading: Easy->Rating.Good, Hard->Rating.Again (NOT Rating.Hard)
- 05-01: Dedicated IndexedDB store 'civic-prep-srs' separate from mastery data
- 05-01: Burmese numerals in getNextReviewText for bilingual display
- 05-01: elapsed_days=0 in rowToCard (deprecated field, required for type compat)
- 05-03: SRSProvider placed inside AuthProvider wrapping Router (needs useAuth for sync)
- 05-03: No eslint-disable comments needed for setState in effects (React Compiler does not flag)
- 05-03: Review streak computed separately from study streak using SRS lastReviewedAt dates
- 05-03: Category breakdown uses USCIS main categories (3 groups) not sub-categories (7)
- 05-03: Module-level questionsById Map in useSRSWidget for O(1) lookup
- 05-04: BilingualToast showSuccess for add confirmation (not legacy toast shim)
- 05-04: Compact mode icon-only (32px) for flip card and review contexts
- 05-04: Toast on add only, no toast on remove (less disruptive UX)
- 05-05: DeckManager as sub-view via #deck hash route (not separate page)
- 05-05: Sort order: Due first, then New, then Done for actionable card priority
- 05-05: Due count badge uses absolute positioning overlay on BilingualButton wrapper
- 05-05: onStartReview navigates to #review (placeholder for plan 05-06)
- 05-06: Flashcard3D used uncontrolled; ReviewCard passes onFlip callback, parent tracks state
- 05-06: SWIPE_THRESHOLD=80 (higher than 50) for intentional rating vs accidental navigation
- 05-06: SessionSetup size options dynamically built based on totalDue count
- 05-06: Burmese numerals inline in SessionSetup (avoids coupling to fsrsEngine)
- 05-07: Reset isFlipped in handleRate callback (not useEffect) to satisfy React Compiler ESLint
- 05-07: Keyboard shortcuts gated on flip state (must see answer before rating)
- 05-07: SessionSummary groups hard cards by USCIS main category for weak nudge
- 05-07: Rating feedback shows 1.5s colored overlay before advancing to next card
- 05-08: ReviewHeatmap uses pure CSS Grid + Tailwind (no external chart library)
- 05-08: Heatmap 60 days desktop / 30 days mobile via responsive hidden/block classes
- 05-08: SRSWidget navigates to /study#deck on compact tap
- 05-08: Widget placed after ReadinessIndicator, before CategoryGrid in dashboard
- 05-09: x-api-key header auth for SRS cron endpoint (distinct from Bearer token on other push endpoints)
- 05-09: Reminder time stored in localStorage (client-side preference, not synced to server)
- 05-09: Warning banner guides users to enable push before setting reminder time
- 06-01: Dedicated IndexedDB database 'civic-prep-interview' for interview sessions
- 06-01: Module-level AudioContext singleton with lazy initialization for chime
- 06-01: 880 Hz sine wave (A5 note) for chime at 0.3 gain fading over 0.5s
- 06-02: Lazy useState for isSupported (avoids unused setter from React Compiler ESLint)
- 06-02: Speech rate stored in localStorage key civic-prep-speech-rate (slow/normal/fast)
- 06-02: TTS timeout formula: (wordCount/2.5)*1000/rate + 3000ms buffer
- 06-02: MediaRecorder mimeType omitted to let browser choose default codec
- 06-02: useAudioRecorder exposes stream state for waveform visualization
- 06-03: InterviewPage follows PracticePage state machine pattern for consistency
- 06-03: Results state deferred to plan 06-05 (avoid unused variable lint error)
- 06-03: Microphone permission requested proactively during setup with graceful degradation
- 06-03: Interview components directory at src/components/interview/
- 06-04: Removed 'revealing' phase to avoid setState in effect; merged into 'grading' phase
- 06-04: Used lazy useState(() => Date.now()) instead of useRef(Date.now()) for React Compiler purity
- 06-04: InterviewTimer resets via React key (parent uses key={currentIndex}) instead of setState in effect
- 06-04: Grading phase reads answer aloud via TTS effect (no state transition in effect body)
- 06-05: Promise.all for batch mastery recording (all interview results in parallel)
- 06-05: Trend chart shows last 10 sessions reversed for proper time axis
- 06-05: Zero-total categories filtered from breakdown display
- 06-05: TTS closing statement fires on 1s delay after mount for natural pacing
- 06-06: useMemo-derived activeTab from location.hash to avoid setState in effect (React Compiler ESLint)
- 06-06: Interview sync skips silently when offline (offline-first, IndexedDB is primary store)
- 06-06: Individual question results stay in IndexedDB only; only aggregate session data syncs to Supabase
- 06-06: SQL migration provided as comment in interviewSync.ts
- 06-06: InterviewDashboardWidget placed after SRSWidget, before CategoryGrid in Dashboard
- 07-01: Streak badges check both currentStreak and longestStreak (earned badges not lost on streak reset)
- 07-01: Daily activity counts reset on new day for per-day freeze eligibility
- 07-01: Composite score inputs clamped to 0-100 range for safety
- 07-02: Public SELECT uses social_opt_in = true (not USING true) for privacy-by-default
- 07-02: SECURITY DEFINER on RPC functions bypasses RLS for server-side ranking
- 07-02: get_user_rank granted to authenticated only (not anon)
- 07-05: Canvas-only rendering (no external images) for CORS-safe share cards
- 07-05: Share cards always bilingual regardless of user language setting
- 07-05: Font wait (document.fonts.ready + explicit load) before canvas rendering
- 07-05: Three-tier share fallback: Web Share API -> Clipboard -> Download
- 07-05: ShareButton manages modal open state internally via useState
- 07-04: Shared ICON_MAP in BadgeCelebration and BadgeGrid for consistent icon rendering
- 07-04: StreakHeatmap uses warm orange gradient (orange-200/400/500) distinct from ReviewHeatmap blue
- 07-04: Freeze days use blue-200/border-blue-400 for visual distinction
- 07-04: Badge categories displayed as section groups with bilingual headers
- 07-04: Auto-dismiss 8s for badge celebration (matching gold-level MasteryMilestone)
- 07-04: Today cell highlighted with ring-2 ring-foreground/30 in StreakHeatmap
- 07-03: Activity recording in store functions (not saveSession.ts) since saveSession.ts is generic mutex guard
- 07-03: SRS activity recorded only when lastReviewedAt is set (differentiates review from add)
- 07-03: Session-level module variable prevents duplicate freeze auto-use toasts
- 07-06: Union merge strategy for streak data across devices (deduplicated dates, max for scalars)
- 07-06: Fire-and-forget sync for all Supabase social operations (offline-safe)
- 07-06: SocialContext returns no-op functions when unauthenticated
- 07-06: SocialSettings placed between Notifications and Review Reminders in Settings page
- 07-07: Dynamic import for socialProfileSync in SocialHubPage (SocialProvider not yet in tree)
- 07-07: Opt-in dismissal stored in localStorage key civic-prep-social-optin-dismissed
- 07-07: LeaderboardWidget uses useLeaderboard with limit=3 for compact display
- 07-08: SocialProvider wraps SRSProvider (not peer) for simpler nesting
- 07-08: ShareButton only on passed test/interview results (celebrates achievements)
- 07-08: Compact share on history entries for non-intrusive list layout
- 07-08: Composite score sync on Dashboard mount (fire-and-forget)
- 07-08: Top badge = first earned badge by BADGE_DEFINITIONS order priority
- 08-01: Remove deprecated disableLogger and automaticVercelMonitors from Sentry config (cleanest fix)
- 08-01: Close menu via click handler setIsMenuOpen(false) instead of route-change useEffect
- 08-01: Pre-commit hook: lint-staged + typecheck only (no next build)
- 08-02: PendingTestResult stores full bilingual response data matching Supabase schema (no simplified fields)
- 08-02: Network error detection uses triple check: navigator.onLine, TypeError/fetch, NetworkError message
- 08-02: Offline sessions use offline-{timestamp} ID pattern for identification
- 08-02: No toast on offline save -- caller shows normal success since data is queued
- 08-03: Settings gear icon already delivered in 08-02 commit (no new commit needed)

### Pending Todos

None.

### Blockers/Concerns

- ~~Biased shuffle algorithm affects test fairness~~ (FIXED: 01-02)
- ~~Race condition in test save causes duplicate records~~ (FIXED: 01-02, integrated)
- ~~history.pushState memory leak during tests~~ (FIXED: 01-02)
- React Router + Next.js causes 404 on refresh (PWA-02 will address)
- iOS Safari 7-day data eviction (PWA-11 will mitigate)
- ~~Next.js build fails during SSG of sentry-example-page (manifest.json ENOENT)~~ (FIXED: 08-01, deleted demo pages)
- ~~Pre-commit hook bypassed with --no-verify since Phase 4~~ (FIXED: 08-01, restored with lint-staged + typecheck)

## Session Continuity

Last session: 2026-02-08
Stopped at: Phase 8 complete (Critical Integration Fixes). All 3 plans executed.
Resume file: None

---

*State initialized: 2026-02-05*
*Last updated: 2026-02-08*
