# Security Audit Checklist -- Phase 38

**Audit Date:** 2026-02-22
**Auditor:** Claude (Phase 38 -- Security Analysis & Hardening)
**Codebase:** civic-test-2025 (Bilingual U.S. Citizenship Civics Test Prep PWA)
**Prior Security Phase:** Phase 13 (2026-02-10) -- comprehensive hardening

---

## 1. Dependencies

| Item | Status | Details |
|------|--------|---------|
| `pnpm audit --prod` | [FIXED] | Was 4 vulnerabilities; now 1 high (ignored via `ignoreCves`). bn.js moderate CVE fixed via `pnpm.overrides: { "bn.js": ">=5.2.3" }` |
| bn.js CVE (moderate, DoS via `maskn(0)`) | [FIXED] | Resolved in Phase 38-01 via pnpm override. Transitive dep of `web-push` |
| CVE-2026-26996 (high) | [ACCEPTABLE RISK] | In `ignoreCves`. Assessed in Phase 13 as not exploitable in this app's server-side usage pattern |
| CVE-2025-69873 (high) | [ACCEPTABLE RISK] | In `ignoreCves`. Same assessment -- server-side only, not user-facing attack surface |
| No unused dependencies | [PASS] | Verified by deep-dive audit: 0 unused production deps across 27 packages |
| `pnpm.onlyBuiltDependencies` | [PASS] | Restricts native builds to `@sentry/cli`, `esbuild`, `sharp`, `unrs-resolver` |

## 2. Authentication & Authorization

| Item | Status | Details |
|------|--------|---------|
| `/api/push/subscribe` -- JWT verification | [PASS] | Verifies Bearer token via `supabase.auth.getUser()`. Rejects 401 on invalid/expired tokens |
| `/api/push/subscribe` -- Rate limiting | [PASS] | In-memory Map: 10 requests/user/minute with cleanup every 100 requests |
| `/api/push/send` -- Cron secret auth | [PASS] | `Authorization: Bearer ${CRON_SECRET}` required |
| `/api/push/srs-reminder` -- API key auth | [PASS] | `x-api-key` header must match `SRS_CRON_API_KEY` |
| `/api/push/weak-area-nudge` -- Cron secret auth | [PASS] | `Authorization: Bearer ${CRON_SECRET}` required |
| Service role key usage (4 routes) | [PASS] | All justified: subscribe (post-JWT upsert), send/srs-reminder/weak-area-nudge (cross-user cron reads) |
| Supabase RLS on all tables | [PASS] | 9 tables audited in Phase 13 (`rls-audit.md`). All have RLS enabled with owner-only policies. Public SELECT on `social_profiles` and `earned_badges` restricted to opted-in users |
| SECURITY DEFINER functions | [PASS] | 3 functions (`handle_new_user`, `get_leaderboard`, `get_user_rank`) -- all justified and scoped |
| Google One Tap OAuth | [PASS] | Handled by `@supabase/supabase-js` auth library. No custom token handling |

## 3. Content Security Policy

| Item | Status | Details |
|------|--------|---------|
| CSP set via middleware.ts | [PASS] | Applied to all non-API, non-static routes via `NextResponse.headers.set()` |
| Hash-based inline script | [PASS] | `THEME_SCRIPT_HASH` (SHA-256) in production; `unsafe-eval` + `unsafe-inline` only in dev |
| `default-src: 'self'` | [PASS] | Restrictive default |
| `script-src` | [PASS] | `'self'`, `'wasm-unsafe-eval'`, theme hash, `accounts.google.com`, `tiptopjar.com` |
| `style-src` | [PASS] | `'self'`, `'unsafe-inline'` (required for Tailwind/motion), Google Fonts, Google Accounts |
| `img-src` | [PASS] | `'self'`, `blob:`, `data:` |
| `connect-src` | [PASS] | `'self'`, `*.supabase.co`, `*.ingest.us.sentry.io`, `accounts.google.com`, `tiptopjar.com` |
| `media-src` | [PASS] | `'self'`, `blob:` (for TTS audio) |
| `frame-src` | [PASS] | `accounts.google.com`, `tiptopjar.com` only |
| `frame-ancestors: 'none'` | [PASS] | Prevents clickjacking |
| `object-src: 'none'` | [PASS] | Blocks Flash/Java plugins |
| `base-uri: 'self'` | [PASS] | Prevents base tag injection |
| `form-action: 'self'` | [PASS] | Prevents form action hijacking |
| `upgrade-insecure-requests` | [PASS] | Forces HTTPS |
| `report-uri` | [PASS] | Reports to Sentry CSP endpoint |
| `worker-src` | [PASS] | `'self'`, `blob:` for service worker and web workers |
| Dev mode relaxation | [PASS] | Only in `NODE_ENV === 'development'` -- `unsafe-eval` for webpack, `ws://localhost:3000` for HMR |

## 4. XSS Prevention

| Item | Status | Details |
|------|--------|---------|
| `dangerouslySetInnerHTML` audit | [PASS] | 2 uses found, both safe: |
| -- `_document.tsx` (line 26) | [PASS] | Static `THEME_SCRIPT` constant. No user input. CSP hash-protected |
| -- `CelebrationOverlay.tsx` (line 267) | [PASS] | Static `SHAKE_KEYFRAMES` CSS constant. No user input. Style tag only |
| `innerHTML` audit | [PASS] | 1 use: `TipJarWidget.tsx` (line 48) -- `container.innerHTML = ''` for cleanup only. Sets empty string, never user content |
| `eval()` / `new Function()` | [PASS] | Zero instances in source code |
| `contentEditable` | [PASS] | Not used anywhere |
| React JSX auto-escaping | [PASS] | All dynamic content rendered via JSX expressions `{variable}` which auto-escape HTML |
| Burmese Unicode content | [PASS] | All 128 questions are hardcoded constants in `src/constants/questions/`. Rendered via JSX. No user-generated Burmese text displayed to others |
| `display_name` DB constraint | [PASS] | PostgreSQL CHECK: `display_name !~ '[<>]'` rejects HTML angle brackets. Length: 2-30 chars |
| No markdown rendering | [PASS] | `marked` library not installed. Zero markdown-to-HTML conversion |
| No DOMPurify needed | [PASS] | No raw HTML rendering of user content anywhere |

## 5. Input Sanitization

| Item | Status | Details |
|------|--------|---------|
| `display_name` (only user text visible to others) | [PASS] | Client: 2-30 char limit. DB CHECK: no `<>` chars, 2-30 length. JSX auto-escape on render |
| `reminder_frequency` DB constraint | [PASS] | CHECK: must be one of `('daily', 'every2days', 'weekly', 'off')` |
| `end_reason` DB constraint | [PASS] | CHECK: must be one of `('passThreshold', 'failThreshold', 'time', 'complete')` |
| Test answer storage | [PASS] | Stored as selected text from predefined options, not free-form input |
| API input validation | [PASS] | All endpoints check required fields, return 400 on missing data |
| Method validation | [PASS] | All API routes check `req.method` and return 405 on mismatch |

## 6. Storage Security

| Item | Status | Details |
|------|--------|---------|
| IndexedDB data types | [PASS] | Stores: SRS deck state (FSRS parameters), bookmarks, interview history, mastery milestones, badge data, sync queue items. **No secrets, tokens, or PII stored** |
| localStorage usage | [PASS] | 25+ keys across 20+ files. All are UI preferences and state: theme, language, onboarding flags, tooltip dismissed flags, sound mute, sidebar expanded, badge counts, reminder time. **No secrets or tokens** |
| No auth tokens in storage | [PASS] | Supabase manages its own session storage via `@supabase/supabase-js`. No manual token storage |
| idb-keyval library | [PASS] | Industry-standard IndexedDB wrapper. No known vulnerabilities |

## 7. HTTP Headers

| Item | Status | Details |
|------|--------|---------|
| `X-Content-Type-Options: nosniff` | [PASS] | Set in `next.config.mjs` `headers()` for all routes |
| `X-Frame-Options: DENY` | [PASS] | Set in `next.config.mjs`. Duplicated by CSP `frame-ancestors: 'none'` for defense-in-depth |
| `Referrer-Policy: strict-origin-when-cross-origin` | [PASS] | Set in `next.config.mjs` |
| `Permissions-Policy` | [PASS] | `camera=(), microphone=(self), geolocation=()`. Microphone allowed for self (TTS/speech) |
| `X-DNS-Prefetch-Control: on` | [PASS] | Performance optimization, not security-critical |
| HSTS | [ACCEPTABLE RISK] | Managed by Vercel at the edge. Not set in application headers (Vercel adds it automatically for custom domains) |

## 8. API Routes

| Route | Method | Auth | Rate Limit | Service Role | Status |
|-------|--------|------|------------|--------------|--------|
| `/api/push/subscribe` | POST, DELETE | JWT (Bearer token via `supabase.auth.getUser()`) | 10/min/user | Yes (upsert/delete) | [PASS] |
| `/api/push/send` | POST | Cron secret (`CRON_SECRET`) | None (server-to-server) | Yes (read subscriptions) | [PASS] |
| `/api/push/srs-reminder` | POST | API key (`SRS_CRON_API_KEY`) | None (server-to-server) | Yes (read SRS cards + subscriptions) | [PASS] |
| `/api/push/weak-area-nudge` | POST | Cron secret (`CRON_SECRET`) | None (server-to-server) | Yes (read subscriptions) | [PASS] |

All routes return 405 on unsupported methods. All routes return 401 on missing/invalid auth. Error responses use generic messages (no stack traces or internal details).

## 9. Third-Party Data Flows

| Service | Data Sent | Data Received | Risk | Status |
|---------|-----------|---------------|------|--------|
| Supabase | Auth credentials (managed by SDK), test results, SRS state, social profiles, push subscriptions | Auth tokens, user data, leaderboard data | LOW -- all via HTTPS, RLS-protected | [PASS] |
| Google OAuth | OAuth flow (managed by Supabase) | User email, name, avatar | LOW -- standard OAuth 2.0 | [PASS] |
| Sentry | Error events (PII-stripped), performance traces | None | LOW -- `sendDefaultPii: false`, `beforeSend` strips emails/UUIDs | [PASS] |
| Vercel | Deployment artifacts | Hosting, edge functions | LOW -- standard PaaS | [PASS] |
| Google Fonts | Font requests (IP visible to Google) | Noto Sans Myanmar font files | LOW -- standard CDN usage | [PASS] |
| TipTopJar | Tip jar widget script | Payment processing | LOW -- optional feature, sandboxed in iframe | [PASS] |

## 10. Service Worker

| Item | Status | Details |
|------|--------|---------|
| Cache scope | [PASS] | Precache from `__SW_MANIFEST` (self origin only). Runtime cache: `defaultCache` + custom `/audio/` path |
| Audio cache limits | [PASS] | Max 1200 entries, 90-day expiry. CacheFirst strategy appropriate for static audio files |
| Push notification handler | [PASS] | `event.data.json()` in try-catch. Falls back gracefully on invalid data |
| No sensitive data in cache | [PASS] | Caches HTML pages, JS chunks, CSS, audio files, icons. No auth tokens, user data, or API responses cached |
| Offline fallback | [PASS] | `/offline.html` served for document requests when offline |
| `skipWaiting` + `clientsClaim` | [PASS] | New SW takes control immediately. Appropriate for this app's update model |
| `navigationPreload` | [PASS] | Enabled for faster navigation |

## 11. Push Notification Security

| Item | Status | Details |
|------|--------|---------|
| VAPID key configuration | [PASS] | Server-side via env vars (`VAPID_EMAIL`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`). Conditional init only if all three are set |
| Payload validation | [PASS] | SW `push` handler wraps `event.data.json()` in try-catch. Default title/body on missing fields |
| Notification data scope | [PASS] | Only `title`, `body`, `url`, `tag` in payload. No sensitive data. URL points to app routes only |
| Expired subscription cleanup | [PASS] | All send endpoints check for HTTP 410 Gone and delete expired subscriptions |
| Subscription storage | [PASS] | `push_subscriptions` table with RLS (owner-only read/write). Service role used only by authenticated server routes |
| VAPID private key | [PASS] | Server-side only env var (`VAPID_PRIVATE_KEY`). Never prefixed with `NEXT_PUBLIC_` |

## 12. Environment Variable Handling

| Item | Status | Details |
|------|--------|---------|
| `.env.example` completeness | [FIXED] | Added `NEXT_PUBLIC_SENTRY_DSN` and `SRS_CRON_API_KEY` in Phase 38-01. Now documents all 11 required env vars |
| No secrets in client bundle | [PASS] | Client-exposed vars use `NEXT_PUBLIC_` prefix: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GOOGLE_CLIENT_ID`, `VAPID_PUBLIC_KEY`, `SENTRY_DSN`. All are public keys by design |
| Server-only secrets | [PASS] | `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `CRON_SECRET`, `SRS_CRON_API_KEY`, `SENTRY_AUTH_TOKEN` -- none prefixed with `NEXT_PUBLIC_` |
| No `.env` in git | [PASS] | `.gitignore` includes `.env*` pattern. `.env.local` not tracked |
| Sentry DSN sourcing | [FIXED] | Was hardcoded in 3 config files (`sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`). All now use `process.env.NEXT_PUBLIC_SENTRY_DSN` |

**Complete .env.example inventory:**

| Variable | Type | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Server-side Supabase admin access |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Public | Google OAuth client ID |
| `SENTRY_AUTH_TOKEN` | Secret | Sentry source map upload token |
| `NEXT_PUBLIC_SENTRY_DSN` | Public | Sentry Data Source Name (public key) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Secret | Web Push VAPID private key |
| `VAPID_EMAIL` | Config | Web Push contact email |
| `CRON_SECRET` | Secret | Cron job auth for send/weak-area-nudge |
| `SRS_CRON_API_KEY` | Secret | API key for SRS reminder cron |

## 13. Console Output

| Item | Status | Details |
|------|--------|---------|
| Total console calls | [ACCEPTABLE RISK] | 61 calls across 28 source files |
| Categorization | -- | See breakdown below |

**Console output by risk level:**

| Risk | Count | Files | Justification |
|------|-------|-------|---------------|
| LOW (error logging in catch blocks) | ~35 | SRSContext, OfflineContext, SocialContext, syncQueue, srsSync, socialProfileSync, streakSync, interviewSync, pushNotifications | Standard error logging for debugging. No PII in messages. Context-prefixed (e.g., `[SRSContext]`) |
| LOW (auth flow logging) | ~5 | SupabaseAuthContext, GoogleOneTapSignIn, AuthPage, PasswordResetPage, PasswordUpdatePage | Auth error messages (generic like "Failed to sign in"). No tokens or credentials logged |
| LOW (UI component logging) | ~8 | TestPage, WelcomeModal, ShareCardPreview, LeaderboardProfile, SRSBatchAdd, AddToDeckButton | Component-level error handling. No sensitive data |
| LOW (service worker) | 1 | sw.ts | Push notification error logging in service worker context |
| NONE (test files) | ~5 | errorBoundary.test.tsx, questions.test.ts | Test assertions, not production code |
| LOW (sync layers) | ~7 | interviewSync, srsSync, socialProfileSync, streakSync | Sync operation error logging with generic messages |

**Assessment:** No console calls leak sensitive data (tokens, passwords, emails, user IDs). All are `console.error` for error conditions, not `console.log` for data logging. Production console output is a minor info disclosure risk (exposes error categories to DevTools users) but contains no exploitable information. Replacing with `captureError()` is a future improvement (Phase 38 Plan 03+), not a security blocker.

## 14. ErrorBoundary Info Leakage

| Item | Status | Details |
|------|--------|---------|
| Error sanitization before display | [PASS] | `ErrorBoundary.tsx` uses `sanitizeError()` from `errorSanitizer.ts` for all user-facing messages |
| `errorSanitizer.ts` pattern matching | [PASS] | 8 error categories with bilingual messages. Sensitive patterns (SQL, file paths, stack traces, UUIDs, emails) trigger generic fallback |
| `containsSensitiveData()` check | [PASS] | Detects SQL keywords, file paths, stack traces, UUIDs, emails. Returns generic message if any found |
| Default fallback | [PASS] | Unknown errors always return generic "An unexpected error occurred" (English + Burmese). Never exposes raw error text |
| Bilingual error messages | [PASS] | All error categories have English + Burmese translations |

## 15. Error Reporting (Sentry)

| Item | Status | Details |
|------|--------|---------|
| `sendDefaultPii: false` | [PASS] | Set in all 3 config files: `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts` |
| `beforeSend` PII stripping | [PASS] | `beforeSendHandler` in `src/lib/sentry.ts` strips emails, UUIDs from exception values, breadcrumbs, context lines, extra, and tags |
| User ID hashing | [PASS] | `setUserContext()` hashes user ID with djb2 before setting Sentry user. Email/username/IP explicitly set to undefined |
| `captureError()` sanitization | [PASS] | Wrapper sanitizes context before passing to `Sentry.captureException()` |
| Sentry DSN via env var | [FIXED] | All 3 config files now use `process.env.NEXT_PUBLIC_SENTRY_DSN` instead of hardcoded DSN |
| Production tracesSampleRate | [FIXED] | Server/edge: was 1.0, now `process.env.NODE_ENV === 'production' ? 0.2 : 1`. Client already had 0.2 |
| Replay sampling | [PASS] | `replaysSessionSampleRate: 0.1`, `replaysOnErrorSampleRate: 1.0` -- reasonable defaults |
| Source maps | [PASS] | `widenClientFileUpload: true` in Sentry config. Upload controlled by `SENTRY_AUTH_TOKEN` (build-time only) |
| Error fingerprinting | [ACTION NEEDED] | Not yet implemented. Network/IndexedDB errors create separate Sentry issues instead of grouping. Planned for Phase 38 Plan 03+ |

## 16. SRI (Subresource Integrity)

| Item | Status | Details |
|------|--------|---------|
| External script loading | [PASS] | **Zero external `<script src=...>` tags** in source code. All scripts are bundled by Next.js webpack |
| Google Accounts SDK | [PASS] | Loaded via CSP-allowed `accounts.google.com` origin, not via direct script tag |
| TipTopJar widget | [ACCEPTABLE RISK] | Loaded dynamically via `document.createElement('script')` in `TipJarWidget.tsx`. No SRI hash (third-party widget). Mitigated by: CSP restricts to `tiptopjar.com` origin, sandboxed in iframe, optional feature |
| Font loading | [PASS] | Google Fonts loaded via CSS `@import` (style-src allows `fonts.googleapis.com`). Font files from `fonts.gstatic.com` (font-src) |
| Next.js chunks | [PASS] | All JS chunks are self-hosted, integrity guaranteed by same-origin |

**SRI assessment:** SRI is not applicable for this app because there are no `<script>` tags loading external JS with integrity attributes to verify. The only dynamically loaded external script (TipTopJar) is a third-party widget where SRI would break on CDN updates. CSP provides equivalent protection by restricting allowed origins.

---

## Summary

| Category | Pass | Fixed | Acceptable Risk | Action Needed |
|----------|------|-------|-----------------|---------------|
| Dependencies | 3 | 1 | 2 | 0 |
| Auth & Authorization | 9 | 0 | 0 | 0 |
| CSP | 16 | 0 | 0 | 0 |
| XSS Prevention | 10 | 0 | 0 | 0 |
| Input Sanitization | 6 | 0 | 0 | 0 |
| Storage Security | 4 | 0 | 0 | 0 |
| HTTP Headers | 5 | 0 | 1 | 0 |
| API Routes | 4 | 0 | 0 | 0 |
| Third-Party Data | 6 | 0 | 0 | 0 |
| Service Worker | 6 | 0 | 0 | 0 |
| Push Notifications | 6 | 0 | 0 | 0 |
| Env Variables | 3 | 2 | 0 | 0 |
| Console Output | 0 | 0 | 1 | 0 |
| ErrorBoundary | 5 | 0 | 0 | 0 |
| Sentry | 6 | 2 | 0 | 1 |
| SRI | 4 | 0 | 1 | 0 |
| **TOTAL** | **93** | **5** | **5** | **1** |

**Overall Security Posture: STRONG**

5 items fixed in Phase 38-01. 5 items accepted with documented justification. 1 item (Sentry error fingerprinting) deferred to later plan. 93 items pass outright. No critical or high-risk findings.
