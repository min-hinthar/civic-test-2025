# Architecture

**Analysis Date:** 2026-03-19

## Pattern Overview

**Overall:** Next.js App Router + Client-Side SPA Hybrid

The app uses Next.js 16 App Router for routing and SSR shell, but all interactive UI runs as a client-side SPA behind `'use client'` boundaries. Pages are thin wrappers that delegate immediately to view components. The architecture is intentionally offline-first: all data flows through IndexedDB first, syncing to Supabase opportunistically when online.

**Key Characteristics:**
- App Router handles routing, CSP nonce injection, and metadata; all UI logic is client-side
- 11-provider context tree wraps the entire app — order is load-bearing (see Provider Hierarchy)
- Offline-first: IndexedDB (idb-keyval) is the source of truth for SRS deck, sessions, questions, and sync queue
- Two route groups: `(public)` (no auth required) and `(protected)` (auth-gated by layout)
- Views in `src/views/` are the real page components; `app/*/page.tsx` files are thin Next.js wrappers

## Layers

**App Router Shell:**
- Purpose: Next.js routing, metadata, CSP nonce injection, PWA manifest
- Location: `app/`
- Contains: `layout.tsx`, route groups `(public)/` and `(protected)/`, API routes `api/push/`, `template.tsx` for page transitions
- Depends on: `src/components/ClientProviders`, `src/components/GlobalOverlays`
- Used by: Browser/Next.js runtime

**Provider Layer (Client):**
- Purpose: Global state — auth, language, theme, TTS engine, offline status, SRS deck, social identity, state personalization, navigation
- Location: `src/components/ClientProviders.tsx`, `src/contexts/`, `src/components/navigation/NavigationProvider.tsx`, `src/components/BilingualToast.tsx`
- Contains: 11 context providers (see Provider Hierarchy section)
- Depends on: `src/lib/`, `src/types/`
- Used by: All view and component layers

**View Layer:**
- Purpose: Full-page components, one per route; own their layout and orchestrate data
- Location: `src/views/`
- Contains: 14 page components (`Dashboard.tsx`, `TestPage.tsx`, `StudyGuidePage.tsx`, etc.)
- Depends on: Context hooks, feature hooks (`src/hooks/`), feature components (`src/components/`)
- Used by: `app/*/page.tsx` wrappers

**Component Layer:**
- Purpose: Reusable, feature-scoped UI building blocks
- Location: `src/components/` (30+ subdirectories)
- Contains: Feature components (quiz, interview, srs, hub, etc.) and UI primitives (`src/components/ui/`)
- Depends on: Context hooks, `src/lib/`, `src/types/`
- Used by: View layer, other components

**Hook Layer:**
- Purpose: Encapsulated stateful logic; bridge between context and components
- Location: `src/hooks/` (37 hook files)
- Contains: Domain hooks (SRS, readiness, streak, study plan, TTS, push notifications) and utility hooks (viewport height, scroll direction, reduced motion)
- Depends on: Context hooks, `src/lib/`
- Used by: View and component layers

**Library Layer:**
- Purpose: Pure business logic, algorithms, and data persistence utilities
- Location: `src/lib/` (18+ subdirectories)
- Contains: FSRS engine, TTS core, mastery calculation, readiness engine, IndexedDB wrappers, Supabase sync, i18n strings, session management, NBA (next best action), study plan engine
- Depends on: `src/types/`, external packages (ts-fsrs, idb-keyval, supabase-js)
- Used by: Hook and context layers; NOT imported by views directly

**Data / Constants Layer:**
- Purpose: Static question bank, bilingual strings, state representatives data
- Location: `src/constants/` (questions, about, opEd), `src/data/state-representatives.json`, `src/lib/i18n/strings.ts`
- Contains: 128 USCIS questions across 7 category files + 2025 additions file; state data for all 50 states/territories
- Depends on: `src/types/`
- Used by: Context layer (OfflineProvider), hooks, components

**API Layer (Server):**
- Purpose: Push notification server-side endpoints; Supabase admin operations
- Location: `app/api/push/`
- Contains: `subscribe/route.ts`, `send/route.ts`, `srs-reminder/route.ts`, `weak-area-nudge/route.ts`
- Depends on: Supabase service role client, web-push, Sentry
- Used by: Client `usePushNotifications` hook

## Provider Hierarchy

The 11-provider nesting order is enforced in `src/components/ClientProviders.tsx`. **Order is load-bearing** — moving any provider breaks dependency chains.

```
ErrorBoundary                    # Class component; must be outermost for React error catching
  AuthProvider                   # Supabase auth; bootstraps user state + hydrates from remote
    LanguageProvider             # Calls useAuth() for cross-device settings sync
      ThemeProvider              # Calls useAuth() for cross-device settings sync
        TTSProvider              # Calls useAuth() for settings sync; async engine init
          ToastProvider          # Must be before OfflineProvider
            OfflineProvider      # Calls useToast() — MUST be inside ToastProvider
              SocialProvider     # Needs auth (user ID) for Supabase profile
                SRSProvider      # Needs auth for remote sync; loads IndexedDB on mount
                  StateProvider  # State personalization (US state data); no auth required
                    NavigationProvider  # Sidebar state, media tier, scroll direction
```

**Why order matters:**
- `LanguageProvider`, `ThemeProvider`, `TTSProvider` all call `useAuth()` — they must be inside `AuthProvider` or they throw
- `OfflineProvider` calls `useToast()` (for bilingual sync notifications) — it must be inside `ToastProvider`
- `SRSProvider` calls `useAuth()` for user ID to sync with Supabase — must be inside `AuthProvider`
- `SocialProvider` calls `useAuth()` and `useVisibilitySync` — must be inside `AuthProvider`
- `NavigationProvider` is innermost because nav badges read from SRS (`dueCount`) and offline state — it must be inside both

## Data Flow

**User Answers a Quiz Question:**

1. User taps answer in `TestPage.tsx` (view)
2. Quiz reducer (`src/lib/quiz/quizReducer.ts`) processes action, updates local state
3. After test completion, `saveTestSession` (from `useAuth()`) is called
4. If online: Supabase `mock_tests` + `mock_test_responses` tables updated; user state re-hydrated
5. If offline: result queued to IndexedDB via `queueTestResult()` (`src/lib/pwa/offlineDb.ts`)
6. When back online: `OfflineProvider.triggerSync()` flushes queue via `syncAllPendingResults()` (`src/lib/pwa/syncQueue.ts`)
7. Dashboard reads `user.testHistory` from `AuthProvider` state (already updated)

**SRS Card Graded:**

1. User taps Easy/Hard in `ReviewSession.tsx` component
2. `SRSContext.gradeCard()` called
3. FSRS engine (`src/lib/srs/fsrsEngine.ts`) computes new card schedule
4. Updated record written to IndexedDB via `setSRSCard()` (`src/lib/srs/srsStore.ts`)
5. Optimistic in-memory update: `setDeck(prev => prev.map(...))` in `SRSContext`
6. If logged in: `queueSRSSync()` adds pending sync entry to IndexedDB
7. On next mount or visibility change: `syncPendingSRSReviews()` pushes to Supabase `srs_cards` table

**Settings Changed (theme, language, TTS rate):**

1. User changes setting in `SettingsPage.tsx`
2. Context provider (Theme/Language/TTS) updates localStorage immediately
3. `gatherCurrentSettings()` (`src/lib/settings/`) reads all localStorage keys into one settings object
4. `syncSettingsToSupabase(userId, settings)` fire-and-forget call updates `user_settings` table
5. On next login (any device): `hydrateFromSupabase()` in `AuthProvider` loads remote settings → writes to localStorage → contexts re-read on next mount

**State Management:**
- Server state: Supabase (source of truth for test history, SRS cards, bookmarks, settings, social)
- Local persistent state: localStorage (theme, language mode, TTS settings, sidebar pref, test date) and IndexedDB (questions cache, SRS deck, sync queue, sessions, bookmarks)
- In-memory state: React context (current session UI state, derived data)
- Sync direction: Local-first with periodic push to Supabase; pull on login (server wins for settings, add-wins for bookmarks, merge for SRS)

## Key Abstractions

**Question (`src/types/index.ts`):**
- Central data structure: `id` (stable string like `GOV-P01`), `question_en`/`question_my`, `category`, `studyAnswers[]` (flip cards), `answers[]` (quiz with correct flag), optional `explanation`, optional `dynamic` (state-aware/time-sensitive answers)
- 128 questions + 2025 additions, all bilingual

**SRS Card Record (`src/lib/srs/srsTypes.ts`):**
- Wraps ts-fsrs `Card` type with `questionId`, `addedAt`, `lastReviewedAt`
- Persisted to IndexedDB store `'srs-cards'`; synced to Supabase `srs_cards` table

**User (`src/types/index.ts`):**
- `{ id, email, name, testHistory: TestSession[] }` — loaded from Supabase on auth, held in `AuthProvider` state

**BilingualString (`src/lib/i18n/strings.ts`):**
- `{ en: string; my: string }` — the universal bilingual data shape used throughout the app

**TTSEngine (`src/lib/ttsTypes.ts`):**
- Wrapper around Web Speech API handling cross-browser quirks (Chrome 15s cutoff, Safari cancel errors, utterance GC)
- Created once in `TTSProvider`, exposed via `TTSContext`

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page render
- Responsibilities: Injects CSP nonce script (THEME_SCRIPT to prevent FOUC), mounts `ClientProviders` and `GlobalOverlays`, loads Noto Sans Myanmar font

**Client Providers:**
- Location: `src/components/ClientProviders.tsx`
- Triggers: Root layout render
- Responsibilities: Mounts the full 11-provider tree; installs `historyGuard` (Safari rate limit fix); runs `cleanExpiredSessions()` on startup; calls `useViewportHeight()` for CSS variable

**Protected Layout:**
- Location: `app/(protected)/layout.tsx`
- Triggers: Any `/home`, `/hub/*`, `/study`, `/practice`, `/test`, `/interview`, `/drill`, `/settings` route
- Responsibilities: Auth check via `useAuth()`; redirects to `/auth?returnTo=...` if unauthenticated; wraps children with `NavigationShell`

**Protected Template:**
- Location: `app/(protected)/template.tsx`
- Triggers: Every protected route navigation
- Responsibilities: Enter-only page slide transition using sessionStorage to determine direction; remounts on every navigation

**Service Worker:**
- Location: `src/lib/pwa/sw.ts` → compiled to `public/sw.js`
- Triggers: Browser registration on app load
- Responsibilities: Precaches app shell; CacheFirst strategy for `/audio/*` (up to 1200 entries, 90-day TTL); serves `offline.html` fallback for navigation when offline

## Routing Strategy

**Route Groups:**

`app/(public)/` — No authentication, no navigation chrome:
- `/` (LandingPage) — marketing landing
- `/auth` (AuthPage) — sign in / sign up with Google One Tap
- `/auth/forgot` (PasswordResetPage)
- `/auth/update-password` (PasswordUpdatePage)
- `/about` (AboutPage)
- `/op-ed` (OpEdPage) — bilingual editorial

`app/(protected)/` — Auth-gated, wrapped in NavigationShell:
- `/home` → `Dashboard`
- `/hub/[[...tab]]` (overview | history | achievements | leaderboard | srs) → `HubPage`
- `/study` → `StudyGuidePage`
- `/practice` → `PracticePage`
- `/test` → `TestPage`
- `/interview` → `InterviewPage`
- `/drill` → `DrillPage`
- `/settings` → `SettingsPage`

`app/api/push/` — Next.js Route Handlers (server):
- `subscribe` — register/unregister Web Push subscription
- `send` — send ad-hoc push notification
- `srs-reminder` — SRS due reminder
- `weak-area-nudge` — targeted study nudge

**Legacy Redirects (next.config.mjs):**
- `/dashboard` → `/home`
- `/progress` → `/hub/overview`
- `/history` → `/hub/history`
- `/social` → `/hub/achievements`

**Hub Sub-Navigation:**
Hub uses Next.js catch-all `[[...tab]]` route. `/hub` redirects to `/hub/overview`. Tab switching uses `router.push()` with URL changes. `HubPageClient.tsx` renders tab content based on `initialTab` prop.

## Error Handling

**Strategy:** Class-based `ErrorBoundary` at root + Next.js `error.tsx` per route group + Sentry for production reporting with PII stripping before transmission.

**Patterns:**
- `ErrorBoundary` (`src/components/ErrorBoundary.tsx`): catches React render errors, shows bilingual fallback, reports to Sentry via `sanitizeForSentry()`
- `app/error.tsx` and `app/(protected)/error.tsx`: Next.js error boundaries for server/hydration errors
- `app/global-error.tsx`: catches errors in root layout itself
- `captureError(error, context)` from `src/lib/sentry.ts`: all async error reporting goes through this wrapper — strips emails and UUIDs from error messages before Sentry capture
- Offline detection: `saveTestSession` in `AuthProvider` catches `TypeError` with fetch-related messages and reroutes to IndexedDB queue instead of throwing
- Context hooks that call `useContext` throw if used outside their provider (convention: THROWS pattern — see JSDoc on each hook)

## Cross-Cutting Concerns

**Logging:** No console logging in production code. All error reporting via `captureError()` → Sentry with PII stripped. Sentry initialized in `instrumentation.ts` (server), `instrumentation-client.ts` (client), `sentry.edge.config.ts` (edge).

**Validation:** Input sanitization via `src/lib/errorSanitizer.ts`. Push API routes: JWT verification + in-memory rate limiting (10 req/min/user). Open redirect prevention in `(protected)/layout.tsx` (validates `returnTo` starts with `/`).

**Authentication:** Supabase Auth with email/password and Google One Tap (ID token flow). Session persisted by Supabase client. `useAuth()` hook is the universal access point — throws outside `AuthProvider`.

**Bilingualism:** Every user-visible string has `{ en: string; my: string }` shape. `useLanguage()` context exposes `showBurmese: boolean`. Components toggle Burmese display via `showBurmese` flag. Centralized strings in `src/lib/i18n/strings.ts`.

**Animation:** Two-layer motion system. JS springs in `src/lib/motion-config.ts` (SPRING_BOUNCY, SPRING_SNAPPY, SPRING_GENTLE, SPRING_PRESS_DOWN) consumed by motion/react. CSS transitions in `src/styles/tokens.css` for non-React elements. `prefers-reduced-motion` respected via `useReducedMotion()` hook.

**Theme:** FOUC prevention via inline `<script>` (`src/lib/themeScript.ts`) injected in `app/layout.tsx` before React hydrates. Theme class applied to `<html>` (`light` | `dark`). Toggle uses View Transitions API for circular reveal animation.

**PWA:** Serwist service worker (`src/lib/pwa/sw.ts`). Offline HTML fallback at `public/offline.html`. Install prompt handled by `useInstallPrompt` hook and `PWAOnboardingFlow` component. Push notifications via `app/api/push/` routes.

---

*Architecture analysis: 2026-03-19*
