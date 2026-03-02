# Phase 42: CSP Nonce Migration and PWA Update - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate CSP from hash-based to nonce-based allowlisting with strict-dynamic, and update the service worker to correctly cache App Router assets. The middleware entry point is created, all security headers consolidated, and public/sw.js becomes a build artifact. Scope: CSP nonce plumbing, middleware restructuring, SW cache strategy audit. NOT in scope: new security features, i18n, CORS changes, or new third-party integrations.

</domain>

<decisions>
## Implementation Decisions

### Nonce delivery to client components
- Server wrapper component pattern: layout.tsx reads nonce from request headers via `headers().get('x-nonce')`, passes to a thin server wrapper specific to GoogleOneTapSignIn
- strict-dynamic in script-src auto-propagates trust to dynamically-loaded scripts (Sentry, Google GSI sub-scripts)
- Theme script: add `nonce={nonce}` to existing `<script dangerouslySetInnerHTML>` in layout.tsx — no change to script content
- Hash redirect script (HASH_REDIRECT_SCRIPT): investigate if still needed after App Router migration, likely remove as dead code
- Nonce scope: page rendering only — API routes don't need nonces
- No strict-dynamic fallback — modern browsers only (95%+ support), CSP is defense-in-depth
- Google One Tap: add `nonce` prop to existing `next/script` in GoogleOneTapSignIn — strict-dynamic covers dynamically-loaded GSI sub-scripts
- Inline `headers()` call — no shared getNonce() utility, only one call site in layout.tsx
- Missing nonce: silently omit nonce attribute (no error) — scripts still render, just without CSP protection
- Server wrapper: specific to GoogleOneTap (YAGNI), not a generic NoncedScript
- Nonce format: investigate Next.js 16 built-in nonce support first, fallback to crypto.randomUUID
- Nonce transport: middleware sets nonce on REQUEST headers only — layout reads from request headers — never exposed in response headers

### Middleware entry point setup
- Keep proxy.ts at project root with `export function proxy()` — Next.js 16 uses proxy.ts as its middleware convention (CORRECTED from original "rename to middleware.ts" based on research)
- Consolidate ALL security headers into proxy.ts (CSP + X-Frame-Options + Referrer-Policy + etc.) — remove from next.config.mjs headers()
- Hardcoded exclusion matcher: skip `_next/static`, `_next/image`, `favicon.ico`, `sw.js`, static assets
- No CORS in proxy — that stays in API route handlers
- CSP violation reporting via `report-to` directive pointing to Sentry CSP endpoint
- Performance: no concern, crypto.randomUUID is sub-microsecond per request
- Edge Runtime compatibility: investigate during implementation, flag Node-specific code and adapt

### Service worker rebuild strategy
- Gitignore public/sw.js — Serwist builds it automatically during `next build`, no manual commits
- Audit and update sw.ts cache bucket strategies for App Router request patterns (RSC matchers, prefetch headers)
- Different cache strategies per request type: StaleWhileRevalidate for RSC prefetch payloads, NetworkFirst for full page navigations
- offline.html stays as-is — standalone HTML, no inline scripts, already precached and CSP-safe
- Verify and adjust Serwist `additionalPrecacheEntries` in next.config.mjs
- SW disabled in dev (existing `disable: dev` in Serwist config)
- Catch SW registration errors gracefully — log warning if sw.js missing (dev/failed build), don't break app
- Serwist builds sw.js during `next build` — no extra CI config needed for Vercel deployment

### CSP policy directives
- `script-src`: `'strict-dynamic'` + nonce only — drop all explicit domain allowlists
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

</decisions>

<specifics>
## Specific Ideas

- Investigate Next.js 16 built-in nonce support before implementing custom crypto.randomUUID generation
- Hash redirect script is likely dead code from Pages Router — confirm and remove to simplify CSP
- CSP report-to should point to Sentry's CSP report ingestion endpoint (already have Sentry)
- Request-header-only nonce transport is the cleanest pattern — avoids exposing nonce in response

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `proxy.ts`: Current CSP middleware with hash-based allowlisting — rename to middleware.ts, replace hashes with nonce
- `src/lib/themeScript.ts`: Exports THEME_SCRIPT and HASH_REDIRECT_SCRIPT with their SHA-256 hashes — nonce replaces hashes
- `src/lib/pwa/sw.ts`: Serwist service worker source with App Router RSC matchers already in place
- `src/components/GoogleOneTapSignIn.tsx`: Uses `next/script` — add `nonce` prop
- `app/layout.tsx`: Root Server Component, already injects inline scripts via dangerouslySetInnerHTML

### Established Patterns
- CSP delivery via middleware function in proxy.ts — needs renamed + restructured
- Inline script allowlisting via SHA-256 hashes — being replaced by nonces
- SW build pipeline: `withSerwistInit({ swSrc, swDest, disable: dev })` in next.config.mjs
- Non-CSP security headers split between proxy.ts and next.config.mjs headers() — consolidating into middleware

### Integration Points
- `app/layout.tsx`: reads nonce from request headers, passes to script tags and GoogleOneTap server wrapper
- `src/middleware.ts` (new): generates nonce, sets CSP header, sets nonce on request headers
- `next.config.mjs`: Serwist config for SW build, security headers moving OUT to middleware
- `public/sw.js`: becomes gitignored build artifact
- `public/offline.html`: unchanged, already precached

</code_context>

<deferred>
## Deferred Ideas

- i18n/locale detection in middleware — future phase (user expressed interest)
- Generic NoncedScript wrapper component — only if more third-party scripts are added later
- CSP Report-Only dual-header rollout — could be useful for cautious deployment but not needed now

</deferred>

---

*Phase: 42-csp-nonce-migration-and-pwa-update*
*Context gathered: 2026-02-24*
