# External Integrations

**Analysis Date:** 2026-02-05

## APIs & External Services

**Google OAuth:**
- Google Sign-In (One Tap & OAuth) - User authentication via Google accounts
  - SDK/Client: `@supabase/supabase-js` (via Supabase OAuth provider)
  - Native SDK: Google Identity Services (`https://accounts.google.com/gsi/client`)
  - Auth: `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - Implementation: `src/components/GoogleOneTapSignIn.tsx`

**Google Fonts:**
- Loads Inter and Noto Sans Myanmar fonts
  - URL: `https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Myanmar:wght@400;500;600`
  - Used in: `src/styles/globals.css`

## Data Storage

**Databases:**
- Supabase PostgreSQL
  - Connection: Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` v2.81.1
  - Configuration: `src/lib/supabaseClient.ts`

**Tables Used:**
- `profiles` - User profile information (full_name, id, email)
- `mock_tests` - Test session metadata (user_id, completed_at, score, total_questions, duration_seconds, incorrect_count, end_reason, passed)
- `mock_test_responses` - Individual question responses (mock_test_id, question_id, question_en, question_my, category, selected_answer_en, selected_answer_my, correct_answer_en, correct_answer_my, is_correct)

**File Storage:**
- Not detected - Application uses only database storage

**Caching:**
- None detected - No Redis or caching layer configured

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (PostgreSQL-backed)
  - Implementation: `src/contexts/SupabaseAuthContext.tsx`
  - Supported methods:
    - Email/Password registration and login
    - Google OAuth (both One Tap and redirect flow fallback)
    - Password reset via email
    - Password update
  - Session persistence: Enabled in client configuration
  - Session detection in URL: Enabled (for OAuth callback handling)

**Auth Methods:**
- `supabase.auth.signUpWithPassword()` - Email/password registration
- `supabase.auth.signInWithPassword()` - Email/password login
- `supabase.auth.signInWithIdToken()` - Google One Tap sign-in with ID token
- `supabase.auth.signInWithOAuth()` - OAuth redirect fallback
- `supabase.auth.resetPasswordForEmail()` - Password reset initiation
- `supabase.auth.updateUser()` - Password change

## Monitoring & Observability

**Error Tracking:**
- Sentry (application monitoring)
  - Organization: `mandalay-morning-star`
  - Project: `civic-test-prep-2025`
  - DSN: `https://c957cad31df16711843d5241cb2d6515@o4507212955254784.ingest.us.sentry.io/4510406083346432`
  - Configuration: `sentry.server.config.ts`, `sentry.edge.config.ts`, `next.config.mjs`
  - Client Integration: `@sentry/nextjs` v10.26.0
  - Features enabled:
    - Server and client-side error tracking
    - User PII collection enabled
    - Automatic Vercel Cron Monitors integration
    - Wide source map uploads for stack trace quality
    - Built-in Next.js tracing

**Logs:**
- Sentry logs integration enabled (`enableLogs: true`)
- Console logging in development via `process.env.NODE_ENV` checks
- Default approach: Sentry captures server errors, browser errors

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js configuration and Sentry Vercel Cron Monitors)
  - Automatic CI with GitHub integration
  - Function-as-a-Service deployment model

**CI Pipeline:**
- Vercel CI/CD (implicit)
  - Auto-triggers on git commits/merges
  - Runs `npm run build` and `npm start`

## Environment Configuration

**Required env vars (Public):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (exposed to client)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (exposed to client)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID (exposed to client)

**Inferred env vars (Private/Server):**
- Sentry configuration (DSN baked into `sentry.server.config.ts`)
- Additional Supabase keys may be needed for server-side operations

**Secrets location:**
- `.env.local` file (development)
- Vercel environment variables (production)
- `.env.sentry-build-plugin` (Sentry build integration)

## Webhooks & Callbacks

**Incoming:**
- Supabase Auth callbacks:
  - Password reset redirects to `{origin}/auth/update-password`
  - Google OAuth redirects to `{origin}/dashboard`
  - Auth state changes trigger hydration via `onAuthStateChange()` listener

**Outgoing:**
- None detected - No outbound webhook calls or event forwarding

## Browser APIs Used

**Speech Synthesis:**
- Native Web Speech Synthesis API
  - Implementation: `src/lib/useSpeechSynthesis.ts`
  - Supports text-to-speech for question content
  - Platform support: iOS (Samantha, Siri, Ava, Allison, Alex, Victoria, Karen), Android (Google US English)

**Storage:**
- Supabase session persistence (browser localStorage)
- Handled automatically by `@supabase/supabase-js`

---

*Integration audit: 2026-02-05*
