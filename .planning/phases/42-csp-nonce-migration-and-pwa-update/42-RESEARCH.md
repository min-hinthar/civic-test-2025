# Phase 42: CSP Nonce Migration and PWA Update - Research

**Researched:** 2026-02-25
**Domain:** Content Security Policy (nonce-based), Next.js 16 proxy, Serwist service worker
**Confidence:** HIGH

## Summary

This phase migrates CSP from hash-based to nonce-based allowlisting using `strict-dynamic`, consolidates security headers into the proxy, and updates the service worker for App Router asset caching. The project already has a `proxy.ts` at the root (Next.js 16 convention) with hash-based CSP. The migration involves: (1) generating a per-request nonce in proxy.ts, (2) setting it on request headers so layout.tsx can read it, (3) applying nonce to inline scripts in layout.tsx, and (4) using `strict-dynamic` to propagate trust to dynamically-loaded scripts.

A critical finding is that Next.js 16 uses `proxy.ts` (not `middleware.ts`) as the file convention. The CONTEXT.md mentions renaming to `src/middleware.ts` but this is incorrect -- the project already has `proxy.ts` at the root, which is the correct Next.js 16 convention. The proxy uses Node.js runtime (not Edge), so `Buffer` and `crypto.randomUUID()` are available. Calling `await headers()` in the root layout forces all pages to dynamic rendering, but this is acceptable since all pages are `'use client'` thin wrappers in a client-rendered SPA.

The Serwist `defaultCache` from `@serwist/next/worker` v9.5.6 already includes App Router RSC caching entries (`pages-rsc-prefetch`, `pages-rsc`, `pages` cache buckets) with proper header-based matchers for `RSC: 1` and `Next-Router-Prefetch: 1`. The existing `sw.ts` uses `defaultCache` and adds a custom audio cache bucket. The main SW work is verifying these entries match actual App Router request patterns and adding the `public/sw.js` to `.gitignore`.

**Primary recommendation:** Modify the existing `proxy.ts` in-place (do NOT rename to middleware.ts), add nonce generation and `strict-dynamic`, make layout.tsx async to read the nonce, and verify Serwist's defaultCache handles App Router patterns correctly.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Nonce delivery to client components: Server wrapper component pattern; layout.tsx reads nonce from request headers via `headers().get('x-nonce')`, passes to thin server wrapper specific to GoogleOneTapSignIn
- strict-dynamic in script-src auto-propagates trust to dynamically-loaded scripts (Sentry, Google GSI sub-scripts)
- Theme script: add `nonce={nonce}` to existing `<script dangerouslySetInnerHTML>` in layout.tsx
- Hash redirect script (HASH_REDIRECT_SCRIPT): investigate if still needed after App Router migration, likely remove as dead code
- Nonce scope: page rendering only -- API routes don't need nonces
- No strict-dynamic fallback -- modern browsers only (95%+ support), CSP is defense-in-depth
- Google One Tap: add `nonce` prop to existing `next/script` in GoogleOneTapSignIn -- strict-dynamic covers dynamically-loaded GSI sub-scripts
- Inline `headers()` call -- no shared getNonce() utility, only one call site in layout.tsx
- Missing nonce: silently omit nonce attribute (no error) -- scripts still render, just without CSP protection
- Server wrapper: specific to GoogleOneTap (YAGNI), not a generic NoncedScript
- Nonce format: investigate Next.js 16 built-in nonce support first, fallback to crypto.randomUUID
- Nonce transport: middleware sets nonce on REQUEST headers only -- layout reads from request headers -- never exposed in response headers
- Rename proxy.ts to src/middleware.ts -- adjust to Next.js named export pattern (`export function middleware(request)` + `export const config`)
- Consolidate ALL security headers into middleware (CSP + X-Frame-Options + Referrer-Policy + etc.) -- remove from next.config.mjs headers()
- Hardcoded exclusion matcher: skip `_next/static`, `_next/image`, `favicon.ico`, `sw.js`, static assets
- No CORS in middleware -- that stays in API route handlers
- CSP violation reporting via `report-to` directive pointing to Sentry CSP endpoint
- Performance: no concern, crypto.randomUUID is sub-microsecond per request
- Edge Runtime compatibility: investigate during implementation, flag Node-specific code and adapt
- Delete proxy.ts after migration -- clean break, no re-exports
- Gitignore public/sw.js -- Serwist builds it automatically during `next build`, no manual commits
- Audit and update sw.ts cache bucket strategies for App Router request patterns (RSC matchers, prefetch headers)
- Different cache strategies per request type: StaleWhileRevalidate for RSC prefetch payloads, NetworkFirst for full page navigations
- offline.html stays as-is -- standalone HTML, no inline scripts, already precached and CSP-safe
- Verify and adjust Serwist `additionalPrecacheEntries` in next.config.mjs
- SW disabled in dev (existing `disable: dev` in Serwist config)
- Catch SW registration errors gracefully -- log warning if sw.js missing (dev/failed build), don't break app
- Serwist builds sw.js during `next build` -- no extra CI config needed for Vercel deployment
- `script-src`: `'strict-dynamic'` + nonce only -- drop all explicit domain allowlists
- `connect-src`: explicit allowlist per service (Sentry ingest, Supabase, Google APIs, VAPID push endpoint, TTS API)
- `style-src`: keep `'unsafe-inline'` for Tailwind runtime styles
- `img-src`: `'self'` + `data:` + `blob:`
- `media-src`: `'self'` + `blob:` + specific TTS API domains
- `frame-src`: `'self'` + `accounts.google.com` (Google One Tap iframe)
- `frame-ancestors`: `'self'` (prevent embedding)
- Dev vs prod: same base policy, add `'unsafe-eval'` in dev for webpack HMR
- Single `Content-Security-Policy` header, semicolon-separated directives

### Claude's Discretion
- Exact CSP directive ordering and formatting
- Edge Runtime compatibility adaptations
- SW cache bucket naming conventions
- Error logging format for missing nonce / failed SW registration
- Serwist config adjustments for precache entries

### Deferred Ideas (OUT OF SCOPE)
- i18n/locale detection in middleware -- future phase (user expressed interest)
- Generic NoncedScript wrapper component -- only if more third-party scripts are added later
- CSP Report-Only dual-header rollout -- could be useful for cautious deployment but not needed now
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MIGR-09 | CSP upgraded from hash-based to nonce-based using proxy nonce injection | Nonce generation in proxy.ts, `strict-dynamic` propagation, layout.tsx async headers() pattern, inline script nonce attributes |
| MIGR-10 | Service worker updated for App Router asset paths | Serwist defaultCache already has RSC matchers; verify patterns, gitignore sw.js, verify precache entries |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.6 | Framework with proxy.ts convention | Project's framework, proxy replaces middleware |
| @serwist/next | 9.5.6 | Service worker build pipeline | Already integrated, generates sw.js from sw.ts |
| serwist | 9.5.6 | Service worker runtime (caching strategies) | Already in use for defaultCache, CacheFirst, etc. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/server | (bundled) | NextRequest, NextResponse, headers() | proxy.ts for request handling, layout.tsx for nonce reading |
| next/script | (bundled) | Script component with nonce prop | GoogleOneTapSignIn for third-party script loading |
| crypto (Node.js) | (built-in) | randomUUID() for nonce generation | proxy.ts runs in Node.js runtime |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Nonce-based CSP | SRI (experimental) | SRI preserves static rendering but is experimental/webpack-only; nonce is the standard approach and user decision |
| crypto.randomUUID | Next.js built-in nonce | Next.js 16 does NOT have built-in nonce generation; the docs show manual generation in proxy.ts |

## Architecture Patterns

### Critical: proxy.ts Convention (NOT middleware.ts)

**IMPORTANT CORRECTION:** The CONTEXT.md mentions "Rename proxy.ts to src/middleware.ts" -- this is INCORRECT for Next.js 16. The correct convention is:

- File: `proxy.ts` at project root (or `src/proxy.ts` if using `src` directory)
- Export: `export function proxy(request: NextRequest)` (named export `proxy`, not `middleware`)
- Config: `export const config = { matcher: [...] }`
- Runtime: Node.js (NOT Edge Runtime -- Edge is not supported in proxy)

The project already has `proxy.ts` at the root with the correct export name. **Keep it as `proxy.ts` -- do NOT rename to middleware.ts.**

Source: [Next.js 16 proxy.ts docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy)

### Pattern 1: Nonce Generation and Transport

**What:** Generate a per-request nonce in proxy.ts, transport via request headers, read in layout.tsx
**When to use:** Every page request (excluding static assets per matcher)

```typescript
// Source: https://nextjs.org/docs/app/guides/content-security-policy
// proxy.ts
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io https://accounts.google.com;
    media-src 'self' blob:;
    worker-src 'self' blob:;
    frame-src 'self' https://accounts.google.com;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `;

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}
```

**Key details:**
- `Buffer.from(crypto.randomUUID()).toString('base64')` -- safe in Node.js runtime
- Nonce set on BOTH request headers (for layout.tsx to read) and response headers (for browser to enforce)
- CSP set on BOTH request headers (Next.js extracts nonce from it) and response headers (browser enforcement)
- Next.js automatically applies the nonce to framework scripts, page bundles, and inline scripts it generates

### Pattern 2: Reading Nonce in Async Layout

**What:** Make RootLayout async, read nonce from headers, pass to inline scripts
**When to use:** Root layout only

```typescript
// Source: https://nextjs.org/docs/app/guides/content-security-policy
// app/layout.tsx
import { headers } from 'next/headers';
import { THEME_SCRIPT } from '@/lib/themeScript';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ClientProviders>
          {children}
          <GlobalOverlays />
        </ClientProviders>
      </body>
    </html>
  );
}
```

**Key details:**
- `await headers()` is async in Next.js 16 (returns Promise)
- This forces dynamic rendering for ALL pages using this layout
- Acceptable for this project: all pages are `'use client'` thin wrappers (client-rendered SPA)
- Null coalesce to `undefined` (not empty string) so nonce attribute is omitted when missing
- GoogleOneTapSignIn needs nonce passed via a server wrapper component

### Pattern 3: Server Wrapper for GoogleOneTap Nonce

**What:** A thin server component that reads the nonce and passes it to GoogleOneTapSignIn
**When to use:** Where GoogleOneTapSignIn is rendered (auth page)

```typescript
// app/(public)/auth/GoogleOneTapServer.tsx (Server Component, no 'use client')
import { headers } from 'next/headers';
import GoogleOneTapSignIn from '@/components/GoogleOneTapSignIn';

export default async function GoogleOneTapServer() {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <GoogleOneTapSignIn nonce={nonce} />;
}
```

Then GoogleOneTapSignIn adds `nonce={nonce}` to its `<Script>` tag. Note: with `strict-dynamic`, the GSI sub-scripts loaded dynamically by the Google script will be automatically trusted.

### Pattern 4: Matcher Configuration

**What:** Route-specific proxy matching to skip static assets and prefetches
**When to use:** proxy.ts config export

```typescript
// Source: https://nextjs.org/docs/app/guides/content-security-policy
export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

**Key details:**
- Exclude `sw.js`, `manifest.json`, `icons/`, `offline.html` from CSP processing
- The `missing` clause skips prefetch requests (they don't need nonces)
- This matches the official Next.js CSP documentation pattern

### Anti-Patterns to Avoid

- **Renaming proxy.ts to middleware.ts:** Next.js 16 uses `proxy.ts`. The middleware convention is deprecated and will show warnings.
- **Setting nonce on response headers only:** The nonce MUST be on request headers for layout.tsx `headers()` to read it. Use `NextResponse.next({ request: { headers } })`.
- **Using Edge Runtime:** Proxy in Next.js 16 uses Node.js runtime only. Edge Runtime is NOT supported.
- **Creating `src/middleware.ts`:** This would conflict with the proxy convention. Keep `proxy.ts` at the root.
- **Putting domain allowlists in script-src with strict-dynamic:** When `strict-dynamic` is present, browsers IGNORE domain allowlists in script-src. Only nonce/hash values and `strict-dynamic`/`unsafe-eval` are respected.
- **Forgetting to set CSP on BOTH request and response headers:** Request headers are for Next.js internal nonce extraction; response headers are for browser enforcement. Both are required.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Nonce generation | Custom random string generator | `Buffer.from(crypto.randomUUID()).toString('base64')` | Standard pattern from Next.js docs, cryptographically secure |
| SW cache strategies for App Router | Custom fetch interceptors | `@serwist/next/worker` `defaultCache` | Already handles RSC, prefetch, static assets, APIs correctly |
| Script nonce propagation | Manual nonce tracking for dynamic scripts | `strict-dynamic` CSP directive | Browser-native trust propagation to createElement'd scripts |
| CSP header formatting | String concatenation with manual escaping | Template literal with `.replace(/\s{2,}/g, ' ').trim()` | Handles whitespace cleanup consistently |

**Key insight:** Next.js 16 automatically applies the nonce to its own scripts and bundles when it detects a nonce in the CSP header. You only need to manually apply the nonce to YOUR inline scripts (THEME_SCRIPT) and third-party `<Script>` components.

## Common Pitfalls

### Pitfall 1: Dynamic Rendering from headers() in Layout
**What goes wrong:** Calling `await headers()` in root layout forces ALL pages to dynamic rendering, preventing static generation and CDN caching.
**Why it happens:** `headers()` is a Dynamic API that requires per-request evaluation.
**How to avoid:** This is acceptable for this project because all pages are `'use client'` thin wrappers. The SSR shell is minimal and the real rendering happens client-side. No performance regression expected.
**Warning signs:** If build output shows all pages as "dynamic" (lambda icon) instead of static (circle icon), this is expected behavior, not a bug.

### Pitfall 2: strict-dynamic Ignores Domain Allowlists
**What goes wrong:** Adding `https://accounts.google.com` or `https://tiptopjar.com` to `script-src` alongside `strict-dynamic` has no effect. These domains are silently ignored.
**Why it happens:** Per CSP spec, `strict-dynamic` causes browsers to rely ONLY on nonces/hashes, ignoring URI allowlists in script-src.
**How to avoid:** Don't add domain allowlists to script-src. Trust propagation via `strict-dynamic` handles dynamically loaded scripts. For external scripts loaded via `<Script>` component, add the `nonce` prop.
**Warning signs:** CSP violations for scripts from allowed domains despite being in the allowlist.

### Pitfall 3: TipJarWidget Dynamic Script Loading
**What goes wrong:** TipJarWidget uses `document.createElement('script')` to load from tiptopjar.com. Without proper trust chain, this gets blocked.
**Why it happens:** The widget loads scripts outside React's rendering pipeline.
**How to avoid:** With `strict-dynamic`, scripts created via `document.createElement('script')` by code running in a trusted (nonced) script are automatically trusted. Since TipJarWidget runs inside a React component (which is loaded from a nonced bundle), its dynamically created scripts inherit trust. No changes needed to TipJarWidget.
**Warning signs:** CSP violation reports for tiptopjar.com/widget.js -- would indicate strict-dynamic propagation isn't working (unlikely but test in production).

### Pitfall 4: Nonce Not Reaching Inline Scripts
**What goes wrong:** Inline `<script dangerouslySetInnerHTML>` tags run without CSP approval, producing console violations.
**Why it happens:** The `nonce` attribute was not added to the script tag, OR the nonce value doesn't match the CSP header.
**How to avoid:** Add `nonce={nonce}` attribute to every `<script>` tag in layout.tsx. The nonce variable comes from `(await headers()).get('x-nonce')`.
**Warning signs:** Browser console shows "Refused to execute inline script because it violates the following Content Security Policy directive: script-src..."

### Pitfall 5: HASH_REDIRECT_SCRIPT Dead Code
**What goes wrong:** Keeping the hash redirect script adds unnecessary complexity and an extra inline script requiring CSP approval.
**Why it happens:** The script was needed for the Pages Router hash-based routing (`#/path`). App Router uses clean URLs.
**How to avoid:** Investigate whether any external links or bookmarks still use `#/path` format. The `redirects` in next.config.mjs already handle `/dashboard` -> `/home` etc. The hash redirect script can likely be removed. However, if users have old bookmarks with `#/path`, removal could break them.
**Warning signs:** Users reporting broken links from old bookmarks.

### Pitfall 6: CSP Blocks Service Worker Registration
**What goes wrong:** Service worker at `/sw.js` fails to register due to CSP restrictions.
**Why it happens:** `worker-src` directive might not include `'self'`.
**How to avoid:** Include `worker-src 'self' blob:` in CSP. The `blob:` is needed for Serwist's internal worker creation. Ensure `sw.js` is excluded from the proxy matcher so it doesn't get CSP headers that might interfere.
**Warning signs:** Console errors about "Refused to create a worker" or service worker registration failure.

### Pitfall 7: report-uri vs report-to Confusion
**What goes wrong:** Using only `report-to` directive, which doesn't work with Sentry's query-parameter-based endpoint.
**Why it happens:** `report-to` requires a `Report-To` response header with a JSON group definition, and Sentry's endpoint uses query parameters that `report-to` doesn't support well.
**How to avoid:** Use `report-uri` (deprecated but widely supported) pointing to the Sentry CSP endpoint. Optionally add `report-to` for future compatibility.
**Warning signs:** No CSP violation reports appearing in Sentry.

### Pitfall 8: cacheComponents Incompatibility (Next.js 16)
**What goes wrong:** If `cacheComponents` is enabled, calling `headers()` at layout top level causes build failures with "Uncached data was accessed outside of Suspense."
**Why it happens:** `cacheComponents` expects static-compatible layouts; `headers()` is inherently dynamic.
**How to avoid:** This project does NOT currently use `cacheComponents` (verified: no `cacheComponents` config found in codebase). If it's enabled in the future, this will be a conflict to address.
**Warning signs:** Build error mentioning "Uncached data was accessed outside of Suspense."

## Code Examples

### Complete proxy.ts with Nonce and Security Headers

```typescript
// Source: https://nextjs.org/docs/app/guides/content-security-policy
// proxy.ts (root of project)
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  // Sentry CSP reporting endpoint
  const sentryReportUri =
    'https://o4507212955254784.ingest.us.sentry.io/api/4510406083346432/security/?sentry_key=c957cad31df16711843d5241cb2d6515';

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
    img-src 'self' blob: data:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io https://accounts.google.com https://tiptopjar.com${isDev ? ' ws://localhost:3000' : ''};
    media-src 'self' blob:;
    worker-src 'self' blob:;
    frame-src 'self' https://accounts.google.com https://tiptopjar.com;
    frame-ancestors 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
    report-uri ${sentryReportUri};
  `;

  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Security headers (consolidated from next.config.mjs)
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|sw.js.map|offline.html).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

### Async Layout with Nonce

```typescript
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { ClientProviders } from '@/components/ClientProviders';
import { GlobalOverlays } from '@/components/GlobalOverlays';
import { THEME_SCRIPT } from '@/lib/themeScript';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ClientProviders>
          {children}
          <GlobalOverlays />
        </ClientProviders>
      </body>
    </html>
  );
}
```

### GoogleOneTapSignIn with Nonce Prop

```typescript
// GoogleOneTapSignIn.tsx (modified)
interface GoogleOneTapSignInProps {
  nonce?: string;
}

const GoogleOneTapSignIn = ({ nonce }: GoogleOneTapSignInProps) => {
  // ... existing code ...
  return (
    <div className="space-y-2">
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        nonce={nonce}
        onLoad={() => setScriptLoaded(true)}
      />
      {/* ... rest of component */}
    </div>
  );
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` file convention | `proxy.ts` file convention | Next.js 16.0 (2025) | Function named `proxy`, not `middleware`; uses Node.js runtime |
| Edge Runtime for middleware | Node.js runtime for proxy | Next.js 16.0 | `Buffer`, `crypto`, full Node.js APIs available |
| SHA-256 hash allowlisting | Nonce + `strict-dynamic` | CSP Level 3 (2018, now 95%+ support) | No need to recompute hashes when scripts change; dynamic scripts auto-trusted |
| `headers()` sync | `await headers()` async | Next.js 15+ | Must await; forces dynamic rendering |
| Serwist Pages Router caching | Serwist App Router RSC caching | @serwist/next 9.x | defaultCache includes RSC prefetch, RSC navigation, and HTML document matchers |

**Deprecated/outdated:**
- `middleware.ts`: Deprecated in Next.js 16, renamed to `proxy.ts`. Still works with deprecation warning.
- Hash-based CSP: Works but requires manual hash management when scripts change. Nonce-based is more maintainable.
- `report-uri` CSP directive: Officially deprecated in favor of `report-to`, but `report-to` has limited browser support and doesn't work well with Sentry's query-parameter endpoint. Use `report-uri` for now.

## Open Questions

1. **HASH_REDIRECT_SCRIPT removal**
   - What we know: App Router uses clean URLs (MIGR-12 complete). The redirect script handles `#/path` -> `/path` conversion.
   - What's unclear: Whether any external links, bookmarks, or search engine cached URLs still use `#/path` format from the old SPA router.
   - Recommendation: Remove it during this phase. The `redirects` in next.config.mjs handle the main route aliases. If edge cases arise, they can be handled with a simple redirect rule. The CONTEXT.md says "likely remove as dead code" -- agree.

2. **connect-src for TTS**
   - What we know: The app uses browser-native SpeechSynthesis API, not an external TTS service. No external TTS domains needed.
   - What's unclear: CONTEXT.md mentions "TTS API" in connect-src, but no external TTS API is used in the codebase.
   - Recommendation: Omit TTS-specific domains from connect-src. SpeechSynthesis is a browser API, not a network request.

3. **connect-src for VAPID push endpoint**
   - What we know: Push subscription happens via the browser Push API (not fetch). The client only calls `/api/push/subscribe` (same-origin). The server-side web-push library sends to FCM endpoints.
   - What's unclear: CONTEXT.md mentions "VAPID push endpoint" in connect-src.
   - Recommendation: No VAPID-specific external domains needed in client-side CSP. Push API communication is handled by the browser, not by client-side fetch.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test -- --run` |
| Full suite command | `pnpm test:run` |
| Estimated runtime | ~15 seconds |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIGR-09 | Nonce generated per request, CSP header contains nonce | unit | `pnpm test -- --run src/__tests__/proxy.test.ts` | No -- Wave 0 gap |
| MIGR-09 | Security headers consolidated in proxy response | unit | `pnpm test -- --run src/__tests__/proxy.test.ts` | No -- Wave 0 gap |
| MIGR-09 | Nonce applied to inline scripts in layout | manual | Visual inspection + browser CSP console (no violations) | N/A -- manual only |
| MIGR-09 | strict-dynamic allows dynamically loaded scripts | smoke | `pnpm build && pnpm start` + browser test | N/A -- manual only |
| MIGR-10 | SW caches App Router RSC payloads | smoke | `pnpm build` + manual offline test | N/A -- manual only |
| MIGR-10 | sw.js gitignored and built by Serwist | unit | Verify `.gitignore` contains `public/sw.js` | N/A -- build verification |
| MIGR-10 | Offline fallback page works | smoke | `pnpm build && pnpm start` + manual offline test | N/A -- manual only |

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task -> run: `pnpm test -- --run`
- **Full suite trigger:** Before merging final task of any plan wave
- **Phase-complete gate:** Full suite green + `pnpm build` succeeds before `/gsd:verify-work`
- **Estimated feedback latency per task:** ~15 seconds (unit tests) + ~60 seconds (build verification)

### Wave 0 Gaps (must be created before implementation)
- [ ] `src/__tests__/proxy.test.ts` -- unit tests for nonce generation, CSP header construction, security header consolidation, matcher exclusions
- [ ] Use `next/experimental/testing/server` `unstable_doesProxyMatch` for matcher testing (available since Next.js 15.1)

*(Note: Most MIGR-09 validation is CSP enforcement which can only be truly verified in-browser. MIGR-10 is SW behavior which requires a production build. Unit tests for proxy.ts provide the best automated coverage available.)*

## Sources

### Primary (HIGH confidence)
- [Next.js 16 CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) - Complete nonce implementation pattern, proxy.ts code, layout.tsx integration, matcher configuration
- [Next.js 16 proxy.ts File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) - proxy.ts API, Node.js runtime, matcher options, migration from middleware.ts
- @serwist/next v9.5.6 `dist/index.worker.js` - Verified defaultCache includes RSC prefetch/navigation matchers (`pages-rsc-prefetch`, `pages-rsc`, `pages` cache names)
- Existing codebase files: `proxy.ts`, `app/layout.tsx`, `src/lib/pwa/sw.ts`, `src/lib/themeScript.ts`, `next.config.mjs`

### Secondary (MEDIUM confidence)
- [MDN CSP strict-dynamic](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src) - strict-dynamic trust propagation behavior for dynamically created scripts
- [Google CSP docs](https://csp.withgoogle.com/docs/strict-csp.html) - strict-dynamic specification details
- [GitHub Issue #89754](https://github.com/vercel/next.js/issues/89754) - cacheComponents incompatibility with nonce-based CSP (open issue, not affecting this project)
- [Sentry CSP Reporting docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/security-policy-reporting/) - report-uri endpoint format

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, versions verified from package.json
- Architecture: HIGH - Official Next.js 16 docs provide exact patterns; proxy.ts convention verified
- Pitfalls: HIGH - Multiple sources cross-referenced; codebase analysis confirms applicability
- SW patterns: MEDIUM - defaultCache verified in node_modules source; App Router RSC matchers present but real-world cache behavior needs production verification

**Research date:** 2026-02-25
**Valid until:** 2026-03-25 (stable -- Next.js 16 proxy convention is finalized)
