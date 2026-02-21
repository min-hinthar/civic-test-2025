# Phase 13: Security Hardening - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the app's API endpoints, client-side inputs, and dependency chain against known vulnerability classes. Covers CSP headers, push subscription JWT verification, Supabase RLS audit, and npm dependency security. No new features — security layer on top of existing functionality.

</domain>

<decisions>
## Implementation Decisions

### Content Security Policy (CSP)
- **Strict allowlist-only** policy — only explicitly listed origins (Supabase, Sentry, service worker, self)
- Inline script handling: Claude's discretion (nonce-based vs hash-based, based on Pages Router/SSR setup)
- **CSP violation reporting to Sentry** via report-uri/report-to directive
- CSP scope (uniform vs per-route): Claude's discretion based on route audit
- **upgrade-insecure-requests** directive enforced — auto-upgrade HTTP to HTTPS
- Font/image origins: Claude audits codebase to discover all external resource origins and adds to allowlist
- Service worker caching scope: Claude's discretion based on current SW caching strategy
- **frame-ancestors**: Claude's discretion based on iframe usage audit
- **form-action** and **base-uri** restricted to `'self'`

### Push Subscription Auth
- Invalid/missing JWT returns **HTTP 401 with JSON error body** (not silent rejection)
- **Per-user rate limiting** on subscription operations (e.g., max N per minute)
- Failed auth attempts **logged to Sentry** for monitoring unusual patterns
- Client-side 401 handling: Claude's discretion (auto-retry vs user notification, based on existing auth flow)
- Multi-device subscription limit: Claude's discretion based on typical usage patterns
- Sign-out subscription cleanup: Claude's discretion based on existing auth/sign-out flow
- Token handling (expired vs forged): Claude's discretion based on JWT best practices

### Supabase RLS Audit
- **Review AND fix** — audit all tables, document policies, and tighten overly permissive ones
- Documentation in **both** markdown (.planning/security/rls-audit.md) and SQL comments
- Missing RLS: Claude evaluates each table's purpose and adds appropriate policy
- Audit breadth: **Full Supabase audit** — tables, Storage buckets, AND Edge Functions
- Service role usage: Claude evaluates each usage, replaces with anon key + RLS where feasible
- Public tables (e.g., leaderboard): Claude reviews which need public access and handles appropriately
- Migration safety (rollback strategy): Claude's discretion based on current Supabase setup
- Column-level security, cross-table join leaks, RLS performance: Claude handles as part of comprehensive audit

### Dependency Audit
- Fix strategy: **auto-fix first** (npm audit fix), then manual review for remaining issues
- Transitive vulnerabilities: Claude evaluates each and picks safest approach (update parent, override, or accept)
- **Prune unused dependencies** — use depcheck or similar to reduce attack surface
- Ongoing protection: **Both** Dependabot config + npm audit in CI pipeline
- License compliance: Claude checks and flags problematic licenses for a web app
- Lockfile integrity and supply chain checks: Claude verifies as part of comprehensive audit

</decisions>

<specifics>
## Specific Ideas

- CSP violations should show up in the existing Sentry dashboard (no new monitoring infrastructure)
- Push auth failures also to Sentry — single monitoring surface for all security events
- RLS audit produces both a reference document and in-code SQL comments for maintainability
- Dependabot + CI audit = belt-and-suspenders ongoing dependency protection
- User wants comprehensive security posture: column-level, join safety, performance impact of RLS policies all evaluated

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 13-security-hardening*
*Context gathered: 2026-02-09*
