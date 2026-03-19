# External Integrations

**Analysis Date:** 2026-03-19

## APIs & External Services

**Authentication:**
- Supabase Auth - email/password + Google One Tap OAuth
  - SDK: `@supabase/supabase-js ^2.97.0`
  - Client: `src/lib/supabaseClient.ts` — singleton `supabase` client, `persistSession: true`, `detectSessionInUrl: true`
  - Auth context: `src/contexts/SupabaseAuthContext.tsx` — wraps login, register, Google ID token, password reset, logout, saveTestSession
  - Google One Tap: `src/components/GoogleOneTapSignIn.tsx` — loads `https://accounts.google.com/gsi/client` script, calls `loginWithGoogleIdToken` on credential receipt
  - Auth env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

**Error Tracking:**
- Sentry — `@sentry/nextjs ^10.39.0`
  - Three init points: `instrumentation-client.ts` (browser), `sentry.server.config.ts` (Node.js), `sentry.edge.config.ts` (edge)
  - Sentry org: `mandalay-morning-star`, project: `civic-test-prep-2025`
  - Browser integrations: `browserTracingIntegration()`, `replayIntegration()`
  - Trace sample rate: 20% production / 100% development
  - Session replay: 10% sampling (100% on error)
  - PII policy: `sendDefaultPii: false` everywhere; `beforeSendHandler` in `src/lib/sentry.ts` strips emails, UUIDs, hashes user IDs (djb2), applies error fingerprinting for hydration, chunk-load, network, IndexedDB, TTS error categories
  - Helper utilities: `captureError()`, `setUserContext()`, `clearUserContext()`, `isSentryEnabled()` in `src/lib/sentry.ts`
  - CSP: `connect-src` allows `https://*.ingest.us.sentry.io`; security report-uri points to Sentry endpoint
  - Env: `NEXT_PUBLIC_SENTRY_DSN`

**Donation:**
- TipTopJar — `https://tiptopjar.com/minsanity`
  - Opens in new window from BottomTabBar tip button: `src/components/navigation/BottomTabBar.tsx`
  - `frame-src` in CSP allows `https://tiptopjar.com`

## Data Storage

**Databases:**
- Supabase Postgres
  - Connection env: `NEXT_PUBLIC_SUPABASE_URL` (public, used in browser client and server-side)
  - Anon client: `NEXT_PUBLIC_SUPABASE_ANON_KEY` — used in browser-side queries, RLS-enforced
  - Service role client: `SUPABASE_SERVICE_ROLE_KEY` — used only in `app/api/push/` server routes (bypasses RLS after JWT verification)
  - ORM/client: `@supabase/supabase-js` PostgREST client (no Drizzle/Prisma)
  - Schema file: `supabase/schema.sql`

**Tables (all with RLS enabled):**

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User identity, auto-populated by trigger on `auth.users` insert | `id` (uuid PK), `email`, `full_name` |
| `mock_tests` | Timed mock test outcomes | `user_id`, `score`, `total_questions`, `duration_seconds`, `passed`, `end_reason`, `incorrect_count` |
| `mock_test_responses` | Per-question results linked to mock_tests | `mock_test_id`, `question_id`, `category`, bilingual question/answer fields, `is_correct` |
| `srs_cards` | FSRS card state per user per question | `user_id`, `question_id`, FSRS fields (due, stability, difficulty, state, reps, lapses), `unique(user_id, question_id)` |
| `interview_sessions` | Interview simulation history | `user_id`, `mode`, `score`, `passed`, `end_reason`, `duration_seconds` |
| `social_profiles` | Opt-in leaderboard identity | `user_id`, `display_name`, `social_opt_in`, `composite_score`, streak fields, `top_badge` |
| `streak_data` | Cross-device streak sync | `user_id`, `activity_dates[]`, `freezes_available`, `longest_streak` |
| `earned_badges` | Achievement badges per user | `user_id`, `badge_id`, `earned_at`, `unique(user_id, badge_id)` |
| `push_subscriptions` | Web Push VAPID subscriptions | `user_id` (PK), `endpoint`, `keys` (jsonb), `reminder_frequency` |
| `user_settings` | Cross-device settings sync | `user_id` (PK), `theme`, `language_mode`, TTS settings, `test_date` |
| `user_bookmarks` | Cross-device bookmark sync | `user_id` (PK), `question_ids[]` |

**Database Functions (security definer):**
- `get_leaderboard(board_type, result_limit)` — returns ranked opted-in social profiles; granted to `authenticated, anon`
- `get_user_rank(target_user_id)` — returns a user's rank; granted to `authenticated`
- `handle_new_user()` — trigger function on `auth.users` INSERT to auto-populate `profiles`

**RLS Policy Patterns:**
- Personal data tables: `using (auth.uid() = user_id)` for SELECT/UPDATE/DELETE; `with check (auth.uid() = user_id)` for INSERT
- Social/public data: `social_profiles` and `earned_badges` allow SELECT for opted-in users (`social_opt_in = true`)
- Push subscriptions: users manage own row; push send endpoints use service role key bypassing RLS

**File Storage:**
- Local filesystem only — `public/audio/` contains 256+ pre-generated MP3 files:
  - `public/audio/en-US/ava/` — English audio (Ava voice): question (`-q`), answer (`-a`), explanation (`-e`) per question ID
  - `public/audio/my-MM/female/` — Burmese audio (Nilar/female voice): same naming pattern
  - `public/audio/en-US/ava/interview/` — interview simulation audio clips

**Caching:**
- IndexedDB via `idb-keyval ^6.2.2` — four named stores:
  - `civic-prep-questions/questions` — offline question cache (`src/lib/pwa/offlineDb.ts`)
  - `civic-prep-sync/pending-results` — offline mock test sync queue (`src/lib/pwa/offlineDb.ts`)
  - `civic-prep-srs/cards` — SRS card state (`src/lib/srs/srsStore.ts`)
  - `civic-prep-srs-sync/pending-reviews` — offline SRS sync queue (`src/lib/srs/srsSync.ts`)
- Service Worker cache (Serwist):
  - Precache: all Next.js build assets + `/offline.html`
  - Runtime: `audio-v2` cache (CacheFirst, max 1200 entries, 90-day TTL) for `/audio/*`

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (built-in, not a separate provider)
  - Email/password: `login()`, `register()` in `src/contexts/SupabaseAuthContext.tsx`
  - Google One Tap: `loginWithGoogleIdToken()` — passes Google credential JWT to Supabase `signInWithIdToken`
  - Session persistence: `localStorage` (Supabase default), restored on page load
  - Password reset: `sendPasswordReset()` with `redirectTo` URL param
  - Auth state: `onAuthStateChange` listener in `SupabaseAuthContext`

**Cross-Device Settings Sync (v4.0):**
- On sign-in: `loadSettingsFromSupabase()` reads `user_settings`, overwrites local state (server wins)
- On setting change: fire-and-forget upsert to `user_settings` via `src/lib/settings/settingsSync.ts`
- Same pattern for `user_bookmarks` via `src/lib/bookmarks/` (not syncing voice preference — device-specific)

## Push Notifications

**Web Push API + VAPID:**
- Client-side subscription: `src/lib/pwa/pushNotifications.ts`
  - `subscribeToPush(accessToken, reminderFrequency)` — calls `pushManager.subscribe()` with VAPID key, POSTs to `/api/push/subscribe`
  - `unsubscribeFromPush(accessToken)` — DELETEs from server
  - Authorization: Supabase JWT Bearer token in `Authorization` header
- Server-side management: `app/api/push/subscribe/route.ts`
  - JWT verification via per-request Supabase client before any DB write
  - Rate limiting: 10 requests/user/minute (in-memory map)
  - Uses `SUPABASE_SERVICE_ROLE_KEY` for upsert/delete (bypasses RLS)
- Server-side send endpoints (cron-triggered, protected by secret keys):
  - `app/api/push/send/route.ts` — study reminders; auth: `Authorization: Bearer ${CRON_SECRET}`
  - `app/api/push/srs-reminder/route.ts` — SRS due-card reminders; auth: `x-api-key: ${SRS_CRON_API_KEY}`
  - `app/api/push/weak-area-nudge/route.ts` — weak-area study nudges; same auth pattern
  - All use `web-push ^3.6.7` with VAPID details from env vars
  - Expired subscriptions (HTTP 410) auto-deleted from DB
- Service worker push handler: `src/lib/pwa/sw.ts` — `push` event listener displays bilingual notifications with vibrate pattern; `notificationclick` opens or focuses app window

**Required push env vars:**
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — browser subscription key
- `VAPID_PRIVATE_KEY` — server signing key
- `VAPID_EMAIL` — VAPID contact email
- `CRON_SECRET` — protects `/api/push/send`
- `SRS_CRON_API_KEY` — protects SRS/weak-area push endpoints

## Sync Architecture (IndexedDB ↔ Supabase)

**Mock Test Results:**
- Online path: `saveTestSession()` in `SupabaseAuthContext` writes directly to `mock_tests` + `mock_test_responses`
- Offline path: `queueTestResult()` in `src/lib/pwa/offlineDb.ts` stores in `civic-prep-sync` IndexedDB
- Sync-on-reconnect: `syncAllPendingResults()` in `src/lib/pwa/syncQueue.ts` — processes queue on `online` event, exponential backoff (max 5 retries: 2s, 4s, 8s, 16s)

**SRS Cards:**
- Local store: `civic-prep-srs/cards` via `src/lib/srs/srsStore.ts`
- Offline queue: `civic-prep-srs-sync/pending-reviews` via `src/lib/srs/srsSync.ts`
- Sync operations: `pushSRSCards()` (batch upsert), `pullSRSCards()` (full fetch), `syncPendingSRSReviews()` (queue flush)
- Conflict resolution: last-write-wins on `lastReviewedAt` (falls back to `addedAt`) via `mergeSRSDecks()`
- All operations use `withRetry()` (max 3 attempts, 1s base delay) from `src/lib/async/withRetry.ts`
- Upsert key: `unique(user_id, question_id)` on `srs_cards` table

**Settings + Bookmarks + Streaks:**
- All sync via `src/lib/settings/settingsSync.ts`, `src/lib/bookmarks/`, `src/lib/social/streakSync.ts`
- Strategy: server-wins on sign-in load; fire-and-forget upsert on local change
- Streak sync: `streak_data` table; activity dates stored as `text[]` array

## Service Worker (Serwist PWA)

**Configuration:**
- `@serwist/next ^9.5.6` wraps Next.js build; SW disabled in development
- SW source: `src/lib/pwa/sw.ts` — compiled to `public/sw.js`
- SW tsconfig: `tsconfig.sw.json` (extends main, adds WebWorker lib)

**Caching Strategy:**
- Precache: Next.js build manifest (`__SW_MANIFEST`) + `/offline.html`
- Default runtime cache: `@serwist/next/worker`'s `defaultCache` (network-first for pages, stale-while-revalidate for assets)
- Audio cache: `CacheFirst` for `/audio/*` paths, `audio-v2` cache name, 1200 entry limit, 90-day TTL
- Offline fallback: `/offline.html` for document navigation requests
- `skipWaiting: true`, `clientsClaim: true`, `navigationPreload: true`

**PWA Manifest:** `public/manifest.json`
- `display: standalone`, `orientation: portrait`, theme `#002868`
- Icons: 192px + 512px (any + maskable variants)
- Screenshots: 5 JPEG screenshots in `public/`

## Text-to-Speech

**Browser Web Speech API:**
- Custom TTS engine in `src/lib/ttsCore.ts` — handles all known browser quirks:
  - Chrome 15s utterance cutoff (keep-alive interval every 14s, sentence-aware chunking at 30 words)
  - Safari cancel errors (async cancel with 100ms delay)
  - Firefox cancel race condition
  - Android pause/resume breakage (skip pause on Android)
  - Utterance GC (strong reference retained)
- Voice selection: prefers `APPLE_US_VOICES`, `EDGE_VOICES`, `ANDROID_US_VOICES` enhanced quality hints; falls back to any `en-US` voice
- Context: `src/contexts/TTSContext.tsx` — async engine init, throws when not ready

**Pre-generated Audio (Primary for Burmese):**
- 256+ MP3 files in `public/audio/`; URL helpers in `src/lib/audio/audioPlayer.ts`
  - English: `/audio/en-US/ava/{questionId}-{type}.mp3` (Ava voice)
  - Burmese: `/audio/my-MM/female/{questionId}-{type}.mp3` (female/Nilar voice)
  - Interview: `/audio/en-US/ava/interview/{name}.mp3`
- `HTMLAudioElement`-based player in `src/lib/audio/audioPlayer.ts` — play/pause/resume/cancel with subscriber state
- Mobile autoplay: persistent Audio elements + `unlockAudioSession()` on first user gesture

## Security Middleware

**CSP (Content Security Policy):**
- Implemented in `proxy.ts` as Next.js middleware
- Nonce-based: unique base64 nonce per request, injected via `x-nonce` header to `app/layout.tsx`
- `strict-dynamic` with nonce allows sub-script loading without domain allowlists
- Dev: adds `'unsafe-eval'` for webpack HMR; production: no unsafe directives
- `connect-src` allows: `self`, `*.supabase.co`, `*.ingest.us.sentry.io`, `accounts.google.com`, `tiptopjar.com`
- `frame-src` allows: `accounts.google.com`, `tiptopjar.com`
- Security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(self), geolocation=()`

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from `@sentry/nextjs` Vercel deployment docs, Supabase URL format, Next.js 16 app)

**CI Pipeline:**
- No CI config file detected in repo root (GitHub Actions or similar not committed)
- Husky pre-commit: `npx lint-staged` → ESLint + Prettier on staged files

**Pre-commit Verification:**
```bash
pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build
```

## Environment Configuration

**Required env vars:**

| Variable | Visibility | Purpose |
|----------|-----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role key for push API (bypasses RLS) |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Sentry DSN for all three runtimes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Public | Google One Tap OAuth client ID |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public | VAPID public key for push subscription |
| `VAPID_PRIVATE_KEY` | Server only | VAPID private key for push send |
| `VAPID_EMAIL` | Server only | VAPID contact email |
| `CRON_SECRET` | Server only | Auth for `/api/push/send` (study reminders) |
| `SRS_CRON_API_KEY` | Server only | Auth for `/api/push/srs-reminder` and `/api/push/weak-area-nudge` |

**Secrets location:**
- Runtime environment variables (not committed); no `.env` file in repo
- Supabase service role key used server-side only in `app/api/push/` route handlers

---

*Integration audit: 2026-03-19*
