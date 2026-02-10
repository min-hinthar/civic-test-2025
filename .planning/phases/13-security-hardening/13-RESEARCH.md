# Phase 13: Security Hardening - Research

**Researched:** 2026-02-09
**Domain:** Web application security (CSP, API auth, RLS, dependency audit)
**Confidence:** HIGH

## Summary

Phase 13 hardens four distinct security surfaces: Content Security Policy headers, push subscription API authentication, Supabase Row Level Security audit, and npm dependency vulnerabilities. The codebase has significant security gaps to close.

The **most critical finding** is that the push subscription API endpoint (`/api/push/subscribe`) uses `SUPABASE_SERVICE_ROLE_KEY` (admin access) with zero authentication -- any unauthenticated request can create, modify, or delete push subscriptions for arbitrary users. The send/srs-reminder/weak-area-nudge endpoints use simple Bearer/API-key checks (cron secrets), which is acceptable for server-to-server cron calls but the subscribe endpoint needs user JWT verification urgently.

For CSP, the app uses Next.js Pages Router with a `dangerouslySetInnerHTML` inline theme script in `_document.tsx` and loads Google's GSI script externally. The recommended approach is nonce-based CSP via Next.js middleware, which the official docs fully support for Pages Router. The Sentry DSN points to `o4507212955254784.ingest.us.sentry.io` which needs CSP allowlisting, and the Supabase URL is loaded from `NEXT_PUBLIC_SUPABASE_URL`.

For dependencies, `next@15.1.11` has **7 known vulnerabilities** including 1 critical (authorization bypass in middleware) and 1 high (DoS via RSC). Upgrading to at least `next@15.5.10` (latest 15.x patch line) resolves all. Depcheck found 6 unused production dependencies and 5 unused dev dependencies that should be pruned.

**Primary recommendation:** Address the four security domains in order of severity: (1) push API auth, (2) Next.js upgrade, (3) CSP headers, (4) RLS audit + documentation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Content Security Policy (CSP)
- **Strict allowlist-only** policy -- only explicitly listed origins (Supabase, Sentry, service worker, self)
- **CSP violation reporting to Sentry** via report-uri/report-to directive
- **upgrade-insecure-requests** directive enforced -- auto-upgrade HTTP to HTTPS
- **form-action** and **base-uri** restricted to `'self'`

#### Push Subscription Auth
- Invalid/missing JWT returns **HTTP 401 with JSON error body** (not silent rejection)
- **Per-user rate limiting** on subscription operations (e.g., max N per minute)
- Failed auth attempts **logged to Sentry** for monitoring unusual patterns

#### Supabase RLS Audit
- **Review AND fix** -- audit all tables, document policies, and tighten overly permissive ones
- Documentation in **both** markdown (.planning/security/rls-audit.md) and SQL comments
- Missing RLS: evaluate each table's purpose and add appropriate policy
- Audit breadth: **Full Supabase audit** -- tables, Storage buckets, AND Edge Functions

#### Dependency Audit
- Fix strategy: **auto-fix first** (npm audit fix), then manual review for remaining issues
- **Prune unused dependencies** -- use depcheck or similar to reduce attack surface
- Ongoing protection: **Both** Dependabot config + npm audit in CI pipeline

### Claude's Discretion

#### CSP
- Inline script handling: nonce-based vs hash-based (based on Pages Router/SSR setup)
- CSP scope: uniform vs per-route based on route audit
- Font/image origins: audit codebase to discover all external resource origins
- Service worker caching scope: based on current SW caching strategy
- **frame-ancestors**: based on iframe usage audit

#### Push Auth
- Client-side 401 handling: auto-retry vs user notification
- Multi-device subscription limit: based on typical usage patterns
- Sign-out subscription cleanup: based on existing auth/sign-out flow
- Token handling (expired vs forged): based on JWT best practices

#### RLS
- Service role usage: evaluate each usage, replace with anon key + RLS where feasible
- Public tables: review which need public access
- Migration safety/rollback strategy: based on current Supabase setup
- Column-level security, cross-table join leaks, RLS performance

#### Dependencies
- Transitive vulnerabilities: evaluate each, pick safest approach
- License compliance: check and flag problematic licenses

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | >=15.5.10 | Framework (upgrade from 15.1.11) | Resolves all 7 known CVEs including critical auth bypass |
| @supabase/supabase-js | ^2.81.1 (current) | Auth token verification via `getUser()` | Built-in JWT verification against Supabase Auth server |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| depcheck | latest (npx) | Find unused dependencies | One-time audit, no install needed |
| pnpm audit | built-in | Vulnerability scanning | CI pipeline step |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Nonce-based CSP via middleware | Hash-based CSP in next.config.js | Hash approach simpler but does not work with dynamic inline scripts; the theme script in `_document.tsx` changes rarely so hash would work, BUT nonce approach is more future-proof and recommended by Next.js docs for Pages Router |
| `supabase.auth.getUser()` for JWT verify | `supabase.auth.getClaims()` | getClaims() is faster (caches JWKS) but only works with asymmetric JWT keys; getUser() is safer default |
| Manual rate limiting in API route | Vercel edge middleware rate limiting | Vercel built-in is simpler but requires Edge Runtime; in-memory Map with cleanup works fine for API routes |

**Installation:**
```bash
# No new dependencies needed for security hardening
# Upgrade existing:
pnpm update next@^15.5.10
```

## Architecture Patterns

### Recommended Project Structure
```
pages/
├── api/
│   └── push/
│       ├── subscribe.ts    # Add JWT verification + rate limiting
│       ├── send.ts         # Already has cron auth (keep)
│       ├── srs-reminder.ts # Already has API key auth (keep)
│       └── weak-area-nudge.ts # Already has cron auth (keep)
├── _document.tsx           # Convert to class component for nonce support
middleware.ts               # NEW: CSP nonce generation + header injection
next.config.mjs             # Add security headers (non-CSP ones)
supabase/
└── schema.sql              # Add push_subscriptions table + RLS policies
.github/
├── dependabot.yml          # NEW: Dependabot config for npm
└── workflows/
    └── ci.yml              # Add pnpm audit step
.planning/
└── security/
    └── rls-audit.md        # NEW: RLS audit documentation
```

### Pattern 1: JWT Verification in API Route
**What:** Extract and verify Supabase JWT from Authorization header before processing
**When to use:** Any API route that accepts user-specific data
**Example:**
```typescript
// Source: Supabase official docs - auth.getUser()
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create a per-request client with the user's JWT
const supabaseUser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    global: {
      headers: { Authorization: `Bearer ${token}` },
    },
  }
);

// Verify token server-side
const { data: { user }, error } = await supabaseUser.auth.getUser();
if (error || !user) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Use user.id (verified) instead of req.body.userId (untrusted)
```

### Pattern 2: Nonce-Based CSP in Pages Router
**What:** Generate nonce in middleware, pass via headers, apply in _document.tsx
**When to use:** Pages Router apps with inline scripts
**Example:**
```typescript
// Source: Next.js official docs - Pages Router CSP
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://accounts.google.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    report-uri https://o4507212955254784.ingest.us.sentry.io/api/4510406083346432/security/?sentry_key=c957cad31df16711843d5241cb2d6515;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
}

// pages/_document.tsx - read nonce from headers
class MyDocument extends Document<{ nonce?: string }> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    const nonce = ctx.req?.headers?.['x-nonce'] as string | undefined;
    return { ...initialProps, nonce };
  }
  render() {
    const { nonce } = this.props;
    return (
      <Html lang="en">
        <Head nonce={nonce}>
          <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        </Head>
        <body>
          <Main />
          <NextScript nonce={nonce} />
        </body>
      </Html>
    );
  }
}
```

### Pattern 3: In-Memory Rate Limiter for API Routes
**What:** Track per-user request counts with TTL cleanup
**When to use:** API routes needing per-user rate limiting without external dependencies
**Example:**
```typescript
// Simple in-memory rate limiter for serverless (per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > MAX_REQUESTS;
}
```

### Anti-Patterns to Avoid
- **Trusting client-provided userId:** The subscribe endpoint currently takes `userId` from `req.body` -- an attacker can overwrite anyone's push subscription. Always derive userId from the verified JWT.
- **Using `'unsafe-inline'` for scripts in CSP:** Defeats the purpose of CSP for XSS protection. Use nonces instead.
- **Storing CSP nonces in client-side state:** Nonces must be generated server-side per request and never exposed to client JavaScript.
- **Using service role key when anon key + RLS would work:** The subscribe endpoint uses service role to bypass RLS. After adding JWT verification, it should use the user's own token + RLS policies.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JWT verification | Custom JWT parsing/validation | `supabase.auth.getUser()` | Handles token expiry, key rotation, revocation checks |
| CSP nonce generation | Custom random string generator | `crypto.randomUUID()` + Base64 | Cryptographically secure, built-in |
| Dependency vulnerability scanning | Manual CVE checking | `pnpm audit` + Dependabot | Automated, covers transitive deps |
| CSP report collection | Custom reporting endpoint | Sentry's built-in CSP report collection | Already have Sentry, `report-uri` directive just works |

**Key insight:** Security primitives must use cryptographically sound implementations. Never hand-roll JWT verification, nonce generation, or hash comparisons.

## Common Pitfalls

### Pitfall 1: CSP Breaking Google Sign-In
**What goes wrong:** Strict CSP blocks the Google GSI script and iframe
**Why it happens:** Google One Tap loads `https://accounts.google.com/gsi/client` (script) and renders in an iframe from `accounts.google.com`
**How to avoid:** Add `https://accounts.google.com` to `script-src` and `frame-src` directives. The current component uses `next/script` with `src="https://accounts.google.com/gsi/client"`.
**Warning signs:** Google sign-in button disappears or One Tap popup doesn't appear

### Pitfall 2: CSP Breaking Sentry
**What goes wrong:** Sentry SDK cannot send error reports
**Why it happens:** `connect-src` doesn't include the Sentry ingest domain
**How to avoid:** Add `https://*.ingest.us.sentry.io` to `connect-src`. The DSN is `https://c957cad31df16711843d5241cb2d6515@o4507212955254784.ingest.us.sentry.io/4510406083346432`.
**Warning signs:** Errors stop appearing in Sentry dashboard after CSP deployment

### Pitfall 3: CSP Breaking Service Worker
**What goes wrong:** Service worker fails to register or fetch precached assets
**Why it happens:** `worker-src` not configured, or `connect-src` too restrictive for SW fetch
**How to avoid:** Add `worker-src 'self'` and ensure `connect-src` allows all origins the SW fetches from (the SW caches cross-origin assets from Google Fonts: `https://fonts.googleapis.com` and `https://fonts.gstatic.com`)
**Warning signs:** SW registration fails, offline mode broken

### Pitfall 4: Inline Theme Script Blocked by CSP
**What goes wrong:** Flash of unstyled content (FOUC) because theme script is blocked
**Why it happens:** The `_document.tsx` has `dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}` which is an inline script
**How to avoid:** Apply nonce to the inline script tag. Must convert `_document.tsx` to class component to access `getInitialProps` for reading nonce from headers.
**Warning signs:** Dark mode users see a white flash on page load

### Pitfall 5: Next.js Upgrade Breaking Changes
**What goes wrong:** Upgrading Next.js from 15.1.11 to 15.5.x introduces breaking changes
**Why it happens:** Multiple minor versions skipped, potential API changes
**How to avoid:** Upgrade incrementally, run full test suite after each step. Check Next.js release notes for 15.2 through 15.5 breaking changes. The project uses Pages Router only (no App Router), which reduces risk.
**Warning signs:** Build failures, type errors, changed behavior in middleware or API routes

### Pitfall 6: RLS Policies Breaking Existing Functionality
**What goes wrong:** Adding RLS to `push_subscriptions` breaks the cron-triggered send/reminder endpoints
**Why it happens:** Those endpoints use `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS -- but if accidentally switched to anon key, RLS would block
**How to avoid:** Keep `SUPABASE_SERVICE_ROLE_KEY` for server-to-server cron endpoints that need cross-user access. Only change the subscribe endpoint to use user JWT.
**Warning signs:** Push notifications stop being sent; cron jobs return empty subscription lists

### Pitfall 7: Rate Limiter Not Working in Serverless
**What goes wrong:** In-memory rate limiter resets on every cold start
**Why it happens:** Vercel serverless functions are ephemeral -- no shared memory across invocations
**How to avoid:** Accept that serverless rate limiting is per-instance and approximate. For this app's traffic level, it provides sufficient protection against rapid-fire abuse. For true rate limiting, would need Redis or similar (out of scope).
**Warning signs:** Rate limiter seems ineffective during traffic spikes

## Code Examples

### Verified CSP Origins Needed (from codebase audit)

```typescript
// Discovered external origins in this codebase:

// Scripts:
// - https://accounts.google.com/gsi/client (GoogleOneTapSignIn.tsx line 128)

// Connect (API calls):
// - https://*.supabase.co (supabaseClient.ts - NEXT_PUBLIC_SUPABASE_URL)
// - https://*.ingest.us.sentry.io (Sentry DSN in instrumentation-client.ts)

// Fonts:
// - https://fonts.googleapis.com (SW runtimeCaching in sw.ts/public/sw.js)
// - https://fonts.gstatic.com (SW runtimeCaching in sw.ts/public/sw.js)

// Frames (for Google One Tap):
// - https://accounts.google.com

// Images:
// - data: URIs (SVG noise texture in Flashcard3D.tsx)
// - blob: URIs (ShareCardPreview.tsx canvas export)

// No iframes from other origins found in src/
// No external stylesheets (all Tailwind + inline)
// No <embed> or <object> tags found

// The 'unsafe-inline' for style-src is needed because:
// 1. Tailwind generates inline styles
// 2. motion/react (Framer Motion) applies inline transform styles
// 3. Various components use inline style objects
```

### Push Subscription Auth Rewrite Pattern

```typescript
// Current (INSECURE): trusts client-provided userId
const { subscription, userId, reminderFrequency } = req.body;
// userId could be any arbitrary string -- attacker can overwrite anyone's subscription

// Fixed: extract userId from verified JWT
const authHeader = req.headers.authorization;
if (!authHeader?.startsWith('Bearer ')) {
  return res.status(401).json({ error: 'Missing authorization header' });
}
const token = authHeader.split(' ')[1];

// Verify with Supabase Auth server
const { data: { user }, error } = await supabase.auth.getUser(token);
if (error || !user) {
  // Log to Sentry for monitoring
  captureError(new Error('Push subscribe auth failure'), {
    reason: error?.message ?? 'no user',
    ip: req.headers['x-forwarded-for'],
  });
  return res.status(401).json({ error: 'Invalid or expired token' });
}

// Use verified user.id -- NOT the client-provided one
const verifiedUserId = user.id;
```

### Client-Side Auth Header Pattern

```typescript
// Client must send the JWT with push subscribe requests
// In pushNotifications.ts:
const { data: { session } } = await supabase.auth.getSession();
if (!session?.access_token) {
  console.error('No auth session for push subscribe');
  return false;
}

const response = await fetch('/api/push/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  },
  body: JSON.stringify({
    subscription: subscription.toJSON(),
    reminderFrequency,
    // No longer sending userId -- server extracts from JWT
  }),
});
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
      day: monday
    open-pull-requests-limit: 10
    groups:
      production-deps:
        dependency-type: production
      dev-deps:
        dependency-type: development
    ignore:
      # Don't auto-update major versions
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]
```

### CI Audit Step

```yaml
# Add to .github/workflows/ci.yml after "Install dependencies":
- name: Security audit
  run: pnpm audit --audit-level=high
```

## Existing Security Posture (Codebase Audit)

### What Already Exists (Good)
1. **Error sanitization:** `src/lib/errorSanitizer.ts` strips PII from errors before Sentry
2. **Sentry PII stripping:** `beforeSendHandler` removes emails, UUIDs, user data from events
3. **Hashed user IDs in Sentry:** `setUserContext` uses djb2 hash, never stores raw IDs
4. **RLS on all schema.sql tables:** profiles, mock_tests, mock_test_responses, srs_cards, interview_sessions, social_profiles, streak_data, earned_badges -- all have `enable row level security` + policies
5. **Password minimum length:** 12 chars for registration, enforced client-side
6. **React's built-in XSS protection:** All user-visible text rendered via JSX (not `dangerouslySetInnerHTML`)
7. **Only one `dangerouslySetInnerHTML`:** The theme script in `_document.tsx` -- static, no user input
8. **Input types correct:** Email fields use `type="email"`, password fields use `type="password"`
9. **`sendDefaultPii: false`** in all Sentry configs

### What Needs Fixing (Gaps Found)
1. **CRITICAL: `/api/push/subscribe` has zero auth** -- trusts client-provided userId
2. **`push_subscriptions` table NOT in schema.sql** -- likely created manually without RLS
3. **No CSP headers at all** -- zero Content-Security-Policy configuration
4. **No middleware.ts file** -- needed for nonce-based CSP
5. **`next@15.1.11` has 7 CVEs** (1 critical, 1 high, 4 moderate, 1 low)
6. **No Dependabot configuration** -- no automated dependency monitoring
7. **No `pnpm audit` in CI pipeline** -- vulnerabilities not caught in PR checks
8. **6 unused production dependencies:** @radix-ui/react-toast, autoprefixer, dotenv, marked, postcss, react-swipeable
9. **5 unused dev dependencies:** @testing-library/user-event, @vitest/coverage-v8, eslint-config-next, lint-staged, stylelint-config-standard
10. **`security_definer` functions:** `get_leaderboard` and `get_user_rank` run as definer -- correct for public leaderboard queries but should be documented
11. **`display_name` in social_profiles:** User-provided string shown on leaderboard -- length limited (2-30 chars) client-side but needs server-side sanitization/validation via RLS check constraint
12. **No `frame-ancestors` header** -- no iframe usage found, should be set to `'none'`
13. **No Supabase Storage buckets** in use -- nothing to audit
14. **No Supabase Edge Functions** -- nothing to audit

### XSS Surface Area Assessment
The XSS risk is **LOW** for this application:
- All user input (email, password, display name) is rendered via React JSX which auto-escapes
- The `marked` library is in `package.json` but is **not imported anywhere in src/** (depcheck confirms unused) -- no markdown-to-HTML rendering
- No `dangerouslySetInnerHTML` with user-controlled content (only static theme script)
- Display names from the leaderboard are rendered as text content in JSX, not as HTML
- The study guide search input is a filter -- no rendering of raw search text as HTML

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash-based CSP | Nonce-based CSP | Next.js 13+ | Better security; nonces rotate per request |
| `supabase.auth.getUser()` (always network call) | `supabase.auth.getClaims()` (cached JWKS) | supabase-js late 2024 | Faster JWT verification, fewer network calls |
| npm audit fix | pnpm audit + Dependabot | Ongoing | pnpm ecosystem prefers `pnpm audit`; Dependabot automates PRs |
| CSP report-uri (deprecated) | CSP report-to (modern) | 2023+ | `report-uri` still works and has broader browser support; Sentry supports both |

**Deprecated/outdated:**
- `report-uri` CSP directive: Deprecated in favor of `report-to` but still widely supported. Use both for maximum coverage.
- npm v6 lockfile format: Project uses pnpm, so `npm audit` won't work (no package-lock.json). Use `pnpm audit` exclusively.

## Open Questions

1. **Next.js 15.5.x vs 16.x upgrade**
   - What we know: Current is 15.1.11, latest 15.x with all patches is likely ~15.5.10. Next.js 16.x is available (16.1.6).
   - What's unclear: Whether upgrading to 15.5.x resolves ALL vulnerabilities or if some only have patches in 16.x. The pnpm audit shows `>=15.5.10` fixes all currently known issues.
   - Recommendation: Upgrade to latest 15.x first (lower risk), verify all tests pass, consider 16.x as a separate effort.

2. **push_subscriptions table current state in Supabase**
   - What we know: The table is NOT in schema.sql but is referenced by 4 API routes. It was created manually in the Supabase dashboard.
   - What's unclear: Whether it already has RLS enabled in the live database (just not documented in schema.sql).
   - Recommendation: Add the full table definition + RLS policies to schema.sql regardless. Apply the SQL to the live database.

3. **depcheck false positives for unused deps**
   - What we know: depcheck reports autoprefixer, postcss, dotenv as unused -- but these may be used by PostCSS/Tailwind config or Next.js internals.
   - What's unclear: Whether removing them breaks the build.
   - Recommendation: Investigate each before removal. `autoprefixer` and `postcss` are likely used by `tailwind.config.js`/`postcss.config.js`. `dotenv` may be unused if Next.js handles env vars natively.

4. **`style-src 'unsafe-inline'` necessity**
   - What we know: Tailwind CSS and motion/react both inject inline styles at runtime.
   - What's unclear: Whether nonce-based style-src would work with Tailwind's runtime style injection.
   - Recommendation: Start with `style-src 'self' 'unsafe-inline'` -- this is standard practice and still prevents external stylesheet injection. True nonce-based style-src with Tailwind would require significant build pipeline changes.

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/nextjs` - CSP configuration for Pages Router (nonce-based + next.config.js approaches)
- Context7 `/websites/supabase` - JWT verification via `getUser()` and `getClaims()`
- Direct codebase audit of all files in `pages/api/push/`, `src/lib/`, `supabase/schema.sql`
- `pnpm audit` output (7 vulnerabilities in next@15.1.11)
- `npx depcheck` output (6 unused prod deps, 5 unused dev deps)

### Secondary (MEDIUM confidence)
- [Next.js security update December 2025](https://nextjs.org/blog/security-update-2025-12-11) - patched version information
- [Next.js endoflife.date](https://endoflife.date/nextjs) - version support status
- Next.js official docs for Pages Router CSP with nonce via middleware + `_document.tsx` `getInitialProps`
- Supabase official docs for server-side JWT verification patterns

### Tertiary (LOW confidence)
- depcheck results for `autoprefixer`, `postcss`, `dotenv` -- need manual verification before removal (may be false positives from non-JS config files)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against official Next.js/Supabase docs via Context7
- Architecture: HIGH - CSP nonce pattern verified in Next.js Pages Router docs; JWT verification pattern is standard Supabase
- Pitfalls: HIGH - discovered through direct codebase audit (inline scripts, Google GSI, Sentry domain, SW caching)
- Dependency audit: HIGH - `pnpm audit` and `depcheck` results are deterministic tooling output

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days -- stable security patterns, but check for new Next.js CVEs)
