# Codebase Structure

**Analysis Date:** 2026-03-19

## Directory Layout

```
civic-test-2025/
├── app/                          # Next.js App Router root
│   ├── (protected)/              # Auth-gated routes (layout enforces auth)
│   │   ├── drill/page.tsx
│   │   ├── home/page.tsx
│   │   ├── hub/[[...tab]]/       # Catch-all for hub tabs
│   │   │   ├── page.tsx          # Server component — redirects /hub to /hub/overview
│   │   │   └── HubPageClient.tsx # Client component renders tab content
│   │   ├── interview/page.tsx
│   │   ├── practice/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── study/page.tsx
│   │   ├── test/page.tsx
│   │   ├── error.tsx             # Error boundary for protected routes
│   │   ├── layout.tsx            # Auth guard + NavigationShell
│   │   ├── loading.tsx           # Suspense fallback for protected routes
│   │   └── template.tsx          # Page slide transition (remounts per nav)
│   ├── (public)/                 # No auth required
│   │   ├── about/page.tsx
│   │   ├── auth/page.tsx         # Sign in / sign up
│   │   │   ├── forgot/page.tsx
│   │   │   └── update-password/page.tsx
│   │   ├── op-ed/page.tsx
│   │   ├── page.tsx              # Landing page (root /)
│   │   └── error.tsx
│   ├── api/push/                 # Web Push API server routes
│   │   ├── send/route.ts
│   │   ├── srs-reminder/route.ts
│   │   ├── subscribe/route.ts    # POST/DELETE with JWT auth + rate limiting
│   │   └── weak-area-nudge/route.ts
│   ├── dev-sentry-test/page.tsx  # Dev-only Sentry testing
│   ├── error.tsx                 # Root error boundary
│   ├── global-error.tsx          # Catches errors in root layout
│   ├── layout.tsx                # Root layout: metadata, font loading, ClientProviders
│   └── not-found.tsx
├── src/
│   ├── views/                    # Full-page components (14 files, one per route)
│   ├── components/               # Feature + UI components (30+ subdirs)
│   ├── contexts/                 # React Context providers (8 files)
│   ├── hooks/                    # Custom hooks (37 files)
│   ├── lib/                      # Business logic and utilities (18+ subdirs)
│   ├── constants/                # Static question bank + content (3 subdirs)
│   ├── data/                     # Static JSON data files
│   ├── styles/                   # Global CSS + design tokens (4 files)
│   └── types/                    # TypeScript definitions (6 files)
├── public/
│   ├── audio/                    # Pre-generated MP3 files (768 total)
│   │   ├── en-US/ava/            # English audio: question, answer, explanation per card
│   │   └── my-MM/                # Burmese audio (female/ and male/ subdirs)
│   ├── icons/                    # PWA icons (icon-192.png, icon-512.png, etc.)
│   ├── manifest.json             # PWA manifest
│   └── offline.html              # Service worker offline fallback page
├── supabase/
│   └── schema.sql                # Database schema (reference only)
├── docs/                         # PRD and milestone docs
├── scripts/                      # Build/generation scripts (audio generation, question export)
├── .planning/                    # GSD planning artifacts
│   ├── codebase/                 # This directory — architecture analysis docs
│   └── milestones/               # v1.0 through v4.0 phase plans
├── instrumentation.ts            # Sentry server initialization (Next.js instrumentation hook)
├── instrumentation-client.ts     # Sentry client initialization
├── next.config.mjs               # Next.js config (Serwist PWA, Sentry, bundle analyzer)
├── tailwind.config.js            # Tailwind config with design token extension
├── tsconfig.json                 # TypeScript config (strict, @/* = src/*)
├── vitest.config.ts              # Vitest config
└── proxy.ts                      # Dev HTTPS proxy (for PWA/service worker testing)
```

## Directory Purposes

**`app/`:**
- Purpose: Next.js App Router — routing, layouts, API routes only
- Key files: `layout.tsx` (root), `(protected)/layout.tsx` (auth guard), `(protected)/template.tsx` (page transitions)
- Rule: Page components here are thin wrappers — 3-10 lines — that import from `src/views/`

**`src/views/`:**
- Purpose: Full-page view components; the real implementation of each route
- Key files: `Dashboard.tsx` (21 hooks, complex NBA + readiness display), `TestPage.tsx` (35k lines, full quiz engine UI), `StudyGuidePage.tsx`, `HubPage.tsx` (tabs), `DrillPage.tsx`, `InterviewPage.tsx`, `SettingsPage.tsx` (29k lines)
- Pattern: Views are the only place that orchestrate multiple domain hooks together

**`src/components/`:**
- Purpose: Reusable UI components, organized by feature domain
- Subdirectories:
  - `about/` — DedicationCard
  - `animations/` — StaggeredList, StaggeredItem (motion/react wrappers)
  - `bilingual/` — BilingualText, BilingualButton, BilingualHeading (the core bilingual display primitives)
  - `celebrations/` — CelebrationOverlay, Confetti, CountUpScore, DotLottieAnimation
  - `dashboard/` — NBAHeroCard, CategoryPreviewCard, TestDateCountdownCard, StudyPlanCard, RecentActivityCard, etc.
  - `decorative/` — AmericanFlag, MyanmarFlag (SVG)
  - `drill/` — DrillConfig, DrillResults, DrillBadge, StudyTipCard
  - `explanations/` — ExplanationCard, RelatedQuestions, WhyButton
  - `hub/` — ReadinessRing, CategoryDonut, HubTabBar, HistoryTab, AchievementsTab, OverviewTab, GlassCard
  - `icons/` — MyanmarFlag, USFlag (icon-sized SVG)
  - `interview/` — InterviewSession, InterviewSetup, AnswerReveal, ChatBubble, ExaminerCharacter, AudioWaveform, TranscriptionReview, etc.
  - `navigation/` — NavigationShell, Sidebar, BottomTabBar, GlassHeader, NavigationProvider, NavBadge
  - `nudges/` — WeakAreaNudge, StudyGuideHighlight
  - `onboarding/` — OnboardingTour, TourTooltip, GreetingFlow
  - `practice/` — Practice session components
  - `progress/` — MasteryMilestone
  - `pwa/` — InstallPrompt, PWAOnboardingFlow, OfflineBanner, SyncStatusIndicator, NotificationSettings
  - `quiz/` — Quiz question/answer display components
  - `readiness/` — ReadinessHeroCard
  - `results/` — Test result display components
  - `sessions/` — ResumeSessionCard, UnfinishedBanner, StartFreshConfirm
  - `settings/` — VoicePicker
  - `social/` — BadgeGrid, BadgeCelebration, LeaderboardTable, ShareButton, StreakHeatmap, SocialOptInFlow
  - `sort/` — SwipeableCard, SwipeableStack, KnowDontKnowButtons, RoundSummary, SRSBatchAdd
  - `srs/` — AddToDeckButton, ReviewSession, ReviewCard, DeckManager, RatingButtons, SRSWidget
  - `study/` — Flashcard3D, FlashcardStack, FlashcardToolbar, AutoPlayControls, CategoryChipRow
  - `test/` — PreTestScreen, CircularTimer, AnswerFeedback
  - `ui/` — Primitive components: Button, Card, Dialog, Progress, Skeleton, GlassCard, SpeechButton, BurmeseSpeechButton, PillTabBar, EmptyState, ErrorFallback, FlagToggle, LanguageToggle
  - `update/` — UpdateBanner, WhatsNewModal
  - Top-level: `ClientProviders.tsx`, `GlobalOverlays.tsx`, `ErrorBoundary.tsx`, `BilingualToast.tsx`, `GoogleOneTapSignIn.tsx`, `ThemeToggle.tsx`, `TipJarWidget.tsx`

**`src/contexts/`:**
- Purpose: React Context providers for global app state (8 files)
- Files:
  - `SupabaseAuthContext.tsx` — user auth state, test session saving, settings hydration
  - `LanguageContext.tsx` — bilingual / english-only toggle, localStorage sync, Alt+L shortcut
  - `ThemeContext.tsx` — light/dark theme, View Transitions API, cross-device sync
  - `TTSContext.tsx` — TTS engine instance, voice list, settings, Supabase sync
  - `OfflineContext.tsx` — online status, questions cache, pending sync count, auto-sync
  - `SRSContext.tsx` — SRS deck state, due count, optimistic add/remove/grade, Supabase sync
  - `SocialContext.tsx` — social profile, opt-in status, streak sync
  - `StateContext.tsx` — user's US state selection for personalized answers (governor, senators)

**`src/hooks/`:**
- Purpose: Stateful logic encapsulation; 37 hooks total
- Key hooks:
  - `useAutoRead.ts` — auto-reads question text via TTS when displayed
  - `useAutoPlay.ts` — audio file auto-play for study mode
  - `useBadges.ts` — badge checking and milestone detection
  - `useCategoryMastery.ts` — per-category mastery percentages from answer history
  - `useCelebration.ts` — triggers celebration overlays
  - `useInstallPrompt.ts` — PWA install prompt state
  - `useLeaderboard.ts` — fetches leaderboard from Supabase
  - `useMasteryMilestones.ts` — detects milestone achievements
  - `useNextBestAction.ts` — NBA recommendation algorithm
  - `usePerQuestionTimer.ts` — per-question countdown timer
  - `usePushNotifications.ts` — Web Push subscription management
  - `useReadinessScore.ts` — composite readiness score computation
  - `useSortSession.ts` — Know/Don't Know card sorting session (18k lines, complex)
  - `useSpeechRecognition.ts` — Web Speech Recognition API wrapper
  - `useStreak.ts` — study streak tracking
  - `useStudyPlan.ts` — daily study plan generation
  - `useSyncQueue.ts` — monitors IndexedDB sync queue
  - `useTestDate.ts` — test date + countdown management
  - `useTTS.ts` — per-component TTS speak/stop
  - `useSRSDeck.ts`, `useSRSReview.ts`, `useSRSWidget.ts` — SRS UI state
  - `useBookmarks.ts` — question bookmark management
  - `useOrientationLock.ts` — screen orientation API (interview portrait lock)
  - `useNavigationGuard.ts` — prevents accidental navigation during active sessions
  - `useInterviewGuard.ts` — interview-specific navigation guard
  - `useVisibilityPause.ts` — pauses timers when tab is hidden
  - `useVisibilitySync.ts` — triggers data sync on tab visibility restore
  - `useScrollDirection.ts`, `useScrollSnapCenter.ts` — scroll utilities
  - `useViewportHeight.ts` — sets `--app-viewport-height` CSS variable (iOS Safari fix)
  - `useReducedMotion.ts` — `prefers-reduced-motion` media query
  - `useRovingFocus.ts` — keyboard roving focus for grouped controls
  - `useFocusOnNavigation.ts` — focus management on page transition
  - `useOnlineStatus.ts` — navigator.onLine + event listener
  - `useSilenceDetection.ts` — silence detection for interview audio recording
  - `useAudioRecorder.ts` — MediaRecorder API wrapper
  - `useOnboarding.ts` — onboarding tour state
  - `useAudioRecorder.ts` — audio recording for interview voice mode

**`src/lib/`:**
- Purpose: Pure business logic, algorithms, and data access
- Subdirectories:
  - `a11y/` — `announcer.ts` (ARIA live region utility)
  - `async/` — `withRetry.ts`, `safeAsync.ts` (async utilities with retry logic)
  - `audio/` — `ttsCore.ts` (moved up), `audioPlayer.ts`, `burmeseAudio.ts` (MP3 URL resolution), `audioPrecache.ts`, `celebrationSounds.ts`, `soundEffects.ts`
  - `bookmarks/` — `bookmarkStore.ts` (IndexedDB), `bookmarkSync.ts` (Supabase)
  - `i18n/` — `strings.ts` (centralized bilingual string constants)
  - `interview/` — `answerGrader.ts`, `interviewFeedback.ts`, `interviewGreetings.ts`, `interviewStore.ts` (IndexedDB), `interviewSync.ts`, `questionSelection.ts`
  - `mastery/` — `calculateMastery.ts`, `masteryStore.ts` (IndexedDB), `categoryMapping.ts`, `weakAreaDetection.ts`, `nudgeMessages.ts`
  - `nba/` — `determineNBA.ts`, `nbaTypes.ts`, `nbaStrings.ts` (Next Best Action engine)
  - `practice/` — `questionSelection.ts` (practice question filtering)
  - `pwa/` — `sw.ts` (service worker), `offlineDb.ts` (IndexedDB stores for questions/sync), `syncQueue.ts`, `pushNotifications.ts`
  - `quiz/` — `quizReducer.ts` (pure reducer for quiz state), `quizTypes.ts`
  - `readiness/` — `readinessEngine.ts` (0-100 score from accuracy 40% + coverage 30% + FSRS consistency 30%), `types.ts`
  - `sessions/` — `sessionStore.ts` (IndexedDB), `sessionTypes.ts`, `useSessionPersistence.ts`, `timeAgo.ts`
  - `settings/` — `settingsSync.ts` (Supabase `user_settings` table read/write), `index.ts`
  - `social/` — `badgeDefinitions.ts`, `badgeEngine.ts`, `badgeStore.ts`, `compositeScore.ts`, `shareCardRenderer.ts`, `socialProfileSync.ts`, `streakStore.ts`, `streakSync.ts`, `streakTracker.ts`, `index.ts`
  - `sort/` — `sortReducer.ts` (Know/Don't Know card sort reducer), `sortTypes.ts`
  - `srs/` — `fsrsEngine.ts` (ts-fsrs wrapper), `srsStore.ts` (IndexedDB), `srsSync.ts` (Supabase), `srsTypes.ts`, `index.ts`
  - `studyPlan/` — `studyPlanEngine.ts`, `studyPlanTypes.ts`
  - Top-level utilities: `errorSanitizer.ts`, `formatRelativeDate.ts`, `haptics.ts`, `historyGuard.ts`, `motion-config.ts`, `saveSession.ts`, `sentry.ts`, `shuffle.ts`, `supabaseClient.ts`, `themeScript.ts`, `tokens.ts`, `ttsCore.ts`, `ttsTypes.ts`, `useScrollDirection.ts`, `useScrollSnapCenter.ts`, `useViewportHeight.ts`

**`src/constants/`:**
- Purpose: Static app content
- `questions/` — 7 category files + `index.ts` barrel; each category file exports typed `Question[]` with full bilingual content, `studyAnswers`, `answers` (with distractors), and `explanation` blocks
- `about/` — About page content constants
- `opEd/` — Op-Ed article content (bilingual editorial)
- `studyTips.ts` — Drill mode study tips (bilingual)

**`src/data/`:**
- `state-representatives.json` — Governor, senators (string[]), capital for all 50 US states + territories; loaded by `StateContext.tsx`

**`src/styles/`:**
- `globals.css` — Base styles, `page-shell` class, safe area insets, bottom tab height CSS var; imports tokens/animations/prismatic
- `tokens.css` — Full design token system as CSS custom properties (colors, radius, shadow, blur, spacing, animation durations); light/dark theme variants via `.dark` class
- `animations.css` — Keyframe animations (shimmer, fade, bounce, etc.)
- `prismatic-border.css` — Gradient border effect for premium cards

**`src/types/`:**
- `index.ts` — All core domain types: `Question`, `Answer`, `StudyAnswer`, `Explanation`, `DynamicAnswerMeta`, `QuestionResult`, `TestSession`, `TestEndReason`, `User`, `InterviewSession`, `InterviewResult`, `Category`, `MockTestMode`
- `supabase.ts` — Supabase table row types: `ProfileRow`, `MockTestRow`, `MockTestResponseRow`, `InterviewSessionRow`
- `speech-recognition.d.ts` — Web Speech API type declarations (not in TS lib)
- `google.accounts.d.ts` — Google Identity Services type declarations
- `global.d.ts` — Global type augmentations
- `vitest-axe.d.ts` — axe-core matchers for accessibility tests

**`public/audio/`:**
- `en-US/ava/` — English audio files; naming: `{QUESTION-ID}-q.mp3` (question), `{QUESTION-ID}-a.mp3` (answer), `{QUESTION-ID}-e.mp3` (explanation); 385 files total
- `my-MM/female/` and `my-MM/male/` — Burmese audio files, 384 files total; same naming convention

**`src/__tests__/`:**
- Purpose: Test files that don't co-locate with source (integration tests, accessibility tests)
- `errorBoundary.test.tsx`, `errorSanitizer.test.ts`, `navigationLock.test.ts`, `proxy.test.ts`, `saveSession.test.ts`, `shuffle.test.ts`
- `tts.integration.test.tsx` — TTS integration tests
- `a11y/` — `feedbackPanel.a11y.test.tsx`, `toast.a11y.test.tsx`
- `setup.ts` — Vitest setup file

**`supabase/`:**
- `schema.sql` — Reference schema for: `profiles`, `mock_tests`, `mock_test_responses`, `interview_sessions`, `srs_cards`, `push_subscriptions`, `user_settings`, `social_profiles`, `leaderboard` (view), `bookmarks`

## Key File Locations

**Entry Points:**
- `app/layout.tsx` — Root Next.js layout; THEME_SCRIPT injection, font loading, provider mount
- `src/components/ClientProviders.tsx` — Full provider tree; must match documented hierarchy exactly
- `src/components/GlobalOverlays.tsx` — Browser-only overlays (celebration, onboarding, PWA flow)
- `app/(protected)/layout.tsx` — Auth guard for all protected routes
- `src/lib/pwa/sw.ts` — Service worker source (compiled to `public/sw.js`)

**Configuration:**
- `next.config.mjs` — Serwist (PWA), Sentry, bundle analyzer, legacy redirects
- `tailwind.config.js` — Extends with design tokens, custom breakpoints, Noto Sans Myanmar
- `tsconfig.json` — `@/*` maps to `src/*`; strict mode; bundler module resolution
- `vitest.config.ts` — Test runner config (jsdom environment, setup file)
- `src/styles/tokens.css` — Master design token file (CSS custom properties)

**Core Logic:**
- `src/lib/ttsCore.ts` — TTS engine factory with all browser quirk handling
- `src/lib/srs/fsrsEngine.ts` — FSRS v5 algorithm wrapper (ts-fsrs)
- `src/lib/readiness/readinessEngine.ts` — 0-100 readiness score algorithm
- `src/lib/mastery/calculateMastery.ts` — Per-category mastery from answer history
- `src/lib/nba/determineNBA.ts` — Next Best Action recommendation logic
- `src/lib/quiz/quizReducer.ts` — Pure quiz state reducer
- `src/lib/sort/sortReducer.ts` — Know/Don't Know sort reducer
- `src/lib/pwa/offlineDb.ts` — IndexedDB store definitions (idb-keyval)
- `src/lib/pwa/syncQueue.ts` — Offline test result sync queue
- `src/lib/srs/srsSync.ts` — SRS deck sync with Supabase

**Testing:**
- Co-located: `*.test.ts` files next to source (e.g., `src/lib/mastery/calculateMastery.test.ts`)
- Separated: `src/__tests__/` for integration and a11y tests
- Hook tests: `src/hooks/useAutoRead.test.ts`
- Context tests: co-located with lib modules they test

## Naming Conventions

**Files:**
- React components: PascalCase `.tsx` (e.g., `NavigationShell.tsx`, `BilingualText.tsx`)
- Hooks: camelCase starting with `use` prefix `.ts` (e.g., `useReadinessScore.ts`)
- Pure lib modules: camelCase `.ts` (e.g., `readinessEngine.ts`, `quizReducer.ts`)
- Test files: `{filename}.test.ts` or `{filename}.test.tsx` co-located with source; a11y tests `{filename}.a11y.test.tsx`
- Type files: camelCase `.ts` (e.g., `srsTypes.ts`, `quizTypes.ts`)
- Barrel files: `index.ts` at folder root

**Directories:**
- Feature domains: camelCase (`studyPlan`, `srs`, `nba`) or lowercase (`quiz`, `sort`, `social`)
- Component subfolders: lowercase (matching feature: `interview`, `hub`, `navigation`)
- Route groups: parentheses convention `(protected)`, `(public)`

**Question IDs:**
- `GOV-P##` — Principles of American Democracy (17 questions)
- `GOV-S##` — System of Government (46 questions)
- `RR-##` — Rights and Responsibilities (13 questions)
- `HIST-C##` — American History: Colonial Period (16 questions)
- `HIST-1##` — American History: 1800s (9 questions)
- `HIST-R##` — Recent American History (12 questions)
- `SYM-##` — Symbols and Holidays (15 questions)

**Audio Files:**
- `{QUESTION-ID}-q.mp3` — question audio
- `{QUESTION-ID}-a.mp3` — answer audio
- `{QUESTION-ID}-e.mp3` — explanation audio

## Where to Add New Code

**New Route (protected):**
1. Create `app/(protected)/{route}/page.tsx` — thin wrapper importing from `src/views/`
2. Create `src/views/{PageName}.tsx` — full view component
3. Add route to navigation in `src/components/navigation/navConfig.ts`

**New Route (public):**
1. Create `app/(public)/{route}/page.tsx` with view component inline or import from `src/views/`

**New Feature Components:**
- Create subfolder in `src/components/{feature}/` matching existing domain names
- Export named exports (not default) from component files
- Use bilingual text via `useLanguage()` + `showBurmese` flag

**New Context Provider:**
- Add to `src/contexts/` following existing pattern (createContext, Provider component, named hook that throws)
- Insert into provider tree in `src/components/ClientProviders.tsx` at correct position (respect dependency order)
- Document nesting order reason in `ClientProviders.tsx` comment

**New Hook:**
- Add to `src/hooks/use{Feature}.ts`
- Consume context hooks internally; don't import from `src/views/`

**New Business Logic:**
- Add to `src/lib/{domain}/` — either new file in existing domain or new subdirectory
- Export from domain's `index.ts` barrel if one exists
- Keep pure where possible (no React imports)

**New TypeScript Types:**
- Core domain types: `src/types/index.ts`
- Feature-specific types: `src/lib/{domain}/{domain}Types.ts` (e.g., `src/lib/srs/srsTypes.ts`)
- Supabase row types: `src/types/supabase.ts`

**New Tests:**
- Unit tests: co-locate as `{filename}.test.ts` next to source
- Integration tests: `src/__tests__/{feature}.integration.test.tsx`
- Accessibility tests: `src/__tests__/a11y/{feature}.a11y.test.tsx`

**New Bilingual Strings:**
- Static UI strings: add to `src/lib/i18n/strings.ts` under appropriate namespace
- Question content: add to appropriate category file in `src/constants/questions/`

**New API Route:**
- Create `app/api/{domain}/{endpoint}/route.ts`
- Include JWT verification pattern (see `app/api/push/subscribe/route.ts`)
- Include rate limiting for write endpoints

## Special Directories

**`.planning/`:**
- Purpose: GSD planning system artifacts
- Contains: `milestones/` (v1.0-v4.0 phase plans), `codebase/` (architecture docs), `phases/`, `research/`, `security/`, `debug/`
- Generated: No — hand-maintained planning documents
- Committed: Yes

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes (by `pnpm build`)
- Committed: No (in `.gitignore`)

**`public/sw.js`:**
- Purpose: Compiled service worker (from `src/lib/pwa/sw.ts` via Serwist)
- Generated: Yes (by `pnpm build`)
- Committed: No in dev; yes in build output

**`public/audio/`:**
- Purpose: Pre-generated MP3 files for TTS (768 files total)
- Generated: Yes — via Python scripts in `scripts/` (Google Cloud TTS or Azure)
- Committed: Yes (large binary assets, required for offline PWA)
- Structure: `en-US/ava/` (English, 385 files) + `my-MM/female/` + `my-MM/male/` (Burmese, 384 files)

**`supabase/`:**
- Purpose: Database schema reference
- Generated: No — maintained by hand
- Committed: Yes

**`scripts/`:**
- Purpose: One-time / maintenance scripts (not run in CI)
- Contains: `generate-burmese-audio.py`, `generate-english-audio.py`, `generate-interview-audio.py` (TTS generation), `export-questions.ts`, `export-questions-english.ts`, `compress-audio.sh`
- Committed: Yes

---

*Structure analysis: 2026-03-19*
