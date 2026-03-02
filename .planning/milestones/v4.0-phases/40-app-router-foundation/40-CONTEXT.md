# Phase 40: App Router Foundation - Context

**Gathered:** 2026-02-24 (updated)
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the App Router shell (root layout, ClientProviders, auth guard layout) so Phase 41 can migrate routes into it. The Pages Router remains fully functional — no routes move yet. AppShell is refactored to use the new ClientProviders for single source of truth.

</domain>

<decisions>
## Implementation Decisions

### Provider Extraction Strategy
- **Single `ClientProviders.tsx`** file with all 10 context providers nested in current order
- Include NavigationProvider AND NavigationShell (they still work during coexistence since react-router-dom is still active)
- **Conditional router wrapper**: ClientProviders accepts an optional router wrapper prop. AppShell passes `BrowserRouter`, App Router layout passes nothing. Providers nest inside, router is opt-in
- **Outer ErrorBoundary only** inside ClientProviders. Inner ErrorBoundary stays in AppShell around routes content
- Overlays (CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator) stay in AppShell — they depend on react-router-dom internally and move in Phase 41
- **Refactor AppShell to use ClientProviders** in Phase 40. Validates extraction works with existing routes. Single source of truth for providers
- `installHistoryGuard()` stays in AppShell (tied to react-router-dom, not a provider concern)
- `not-found.tsx` and `loading.tsx` deferred to Phase 41

### Claude's Discretion
- SSR guard (`useIsClient()`) inclusion in ClientProviders — Claude evaluates whether providers access `window`/`localStorage` on mount
- Side effects (`useViewportHeight()`, `cleanExpiredSessions()`) placement — Claude decides based on separation of concerns
- `next/head` placement in refactored AppShell — Claude arranges within children slot
- Myanmar font CSS import strategy — Claude picks whatever ensures fonts work in both routers
- `<Head>` metadata in AppShell — Claude decides whether to keep or remove during refactor (metadata moves to App Router `metadata` export)

### Layout Coexistence
- Build `app/layout.tsx` **production-ready** in Phase 40: fonts, CSS, viewport, PWA meta, theme script, metadata export
- `pages/_document.tsx` and `pages/_app.tsx` left **completely untouched** (theme script shared via import, not modified)
- Both shells coexist safely — each serves its own router's routes
- CSS imports in both `_app.tsx` AND `app/layout.tsx` — redundant but safe during coexistence
- No CSS ordering concern — they serve different routes, no overlap in Phase 40
- `global-error.tsx` stays minimal with inline styles — no Tailwind dependency for catastrophic error boundary

### Theme Script
- **Extract to shared constant** (`src/lib/themeScript.ts`) — both `_document.tsx` and `app/layout.tsx` import it
- Same CSP hash in proxy.ts — no recalculation needed since content is identical
- Phase 42 switches from hash to nonce anyway

### Viewport
- Use Next.js App Router `export const viewport: Viewport` export in `app/layout.tsx`
- Matches the current viewport config: `width=device-width, initial-scale=1, viewport-fit=cover`

### app/layout.tsx Structure
- Server Component root with `metadata` export and `viewport` export
- Wraps `{children}` in `ClientProviders` (client boundary handles providers)
- Inline theme script via `dangerouslySetInnerHTML`
- No `not-found.tsx` or `loading.tsx` in Phase 40

### Auth Guard Pattern
- `app/(protected)/layout.tsx` is a **`'use client'` component**
- Uses `useAuth()` from existing AuthProvider context (guaranteed available — ClientProviders wraps all routes in app/layout.tsx)
- Uses `redirect()` from `next/navigation` + `usePathname()` for returnTo
- **Full-screen centered spinner** matching existing ProtectedRoute UX (same Tailwind classes)
- Renders `{children}` directly after auth check — no inner ErrorBoundary or PageTransition (Phase 41 concerns)
- Created in Phase 40 as "ready but empty" directory — no routes in it yet

### ReturnTo Pattern
- **URL param for both** routers: `?returnTo=/intended-path`
- Update existing `ProtectedRoute.tsx` to also use URL param instead of react-router state
- AuthPage reads returnTo from URL param (single pattern during coexistence)
- **Validate relative paths only** — reject returnTo values that don't start with `/` (open redirect prevention)

### Route Organization
- Public pages go directly in `app/` (no `(public)` group)
- Protected pages use `(protected)` route group
- API routes migrate in Phase 41, not Phase 40

### Testing
- `npm run build` + `npm run test:run` to verify nothing breaks
- No new unit tests — components are thin wrappers, tested through existing suite
- Existing routes verified working via build validation

### Config
- `next.config.mjs` unchanged — Next.js 16 auto-detects app/ directory, no new config needed

</decisions>

<specifics>
## Specific Ideas

- Provider nesting order is critical and must be preserved exactly from AppShell.tsx
- The conditional router wrapper pattern keeps ClientProviders framework-agnostic — ready for Phase 41 to drop react-router-dom
- Refactoring AppShell to use ClientProviders in Phase 40 (not waiting for Phase 41) validates the extraction immediately and ensures single source of truth

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/AppShell.tsx`: Source of truth for provider nesting order (10 context providers + BrowserRouter)
- `src/components/ProtectedRoute.tsx`: Reference implementation for auth guard UX (spinner + redirect)
- `src/components/ErrorBoundary.tsx`: Existing error boundary component, reused in ClientProviders
- `pages/_document.tsx`: Theme script source (will be shared constant)
- `proxy.ts`: CSP hash for theme script (`THEME_SCRIPT_HASH`)

### Established Patterns
- `'use client'` directive on all interactive components
- `useSyncExternalStore` for hydration-safe client detection
- Tailwind CSS with `bg-background`, `border-primary` design tokens
- Context hooks throw when used outside provider (critical operations)
- `installHistoryGuard()` patches pushState/replaceState for Safari

### Integration Points
- `app/layout.tsx` replaces the current minimal stub
- `ClientProviders` slots into both AppShell (with BrowserRouter) and layout.tsx (without)
- `(protected)/layout.tsx` sits between root layout and protected page routes
- `_document.tsx` modified only to import shared themeScript constant
- `ProtectedRoute.tsx` modified only to switch from router state to URL param

### Files to Create
- `app/layout.tsx` — Full Server Component root layout (replaces minimal stub)
- `app/(protected)/layout.tsx` — Client-side auth guard layout
- `src/components/ClientProviders.tsx` — 10 providers + ErrorBoundary + optional router wrapper
- `src/lib/themeScript.ts` — Shared theme script constant

### Files to Modify
- `src/AppShell.tsx` — Refactor to use ClientProviders (with BrowserRouter wrapper)
- `src/components/ProtectedRoute.tsx` — Switch returnTo from router state to URL param
- `pages/_document.tsx` — Import shared themeScript constant (content unchanged)

### Files NOT to Touch
- `pages/_app.tsx` — Leave untouched
- `pages/[[...slug]].tsx` — Leave untouched
- `src/components/navigation/BottomTabBar.tsx` — Leave untouched
- `src/components/navigation/Sidebar.tsx` — Leave untouched
- `src/components/navigation/GlassHeader.tsx` — Leave untouched
- `src/components/navigation/NavItem.tsx` — Leave untouched
- `src/components/navigation/NavigationShell.tsx` — Leave untouched
- `app/global-error.tsx` — Keep minimal, as-is
- `app/dev-sentry-test/page.tsx` — Keep as-is
- `next.config.mjs` — No changes needed

### Auth Infrastructure
- `supabase.auth.getSession()` is client-side only (localStorage tokens)
- No `@supabase/ssr` package — server-side auth not available
- AuthProvider exposes `{ user, isLoading }` via `useAuth()` hook

### Provider Dependencies
- NavigationShell children (BottomTabBar, Sidebar, NavItem, GlassHeader) import react-router-dom
- NavigationProvider itself does NOT import react-router-dom
- All navigation components rewritten in Phase 41

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 40-app-router-foundation*
*Context gathered: 2026-02-24*
