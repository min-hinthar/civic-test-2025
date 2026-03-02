# Phase 41: Route Migration - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Migrate all 15+ routes from react-router-dom to Next.js App Router file-based routing in one pass. Remove react-router-dom entirely. Migrate 4 API routes to Route Handlers. Delete Pages Router files. Clean URLs work without hash prefix.

</domain>

<decisions>
## Implementation Decisions

### Migration Strategy
- Big bang approach: create all App Router page.tsx files, migrate all 34 files from react-router-dom to next/navigation, delete AppShell + catch-all + Pages Router, remove react-router-dom
- Page components stay in `src/pages/` — each `app/` page.tsx is a thin `'use client'` wrapper that imports the real component
- Delete `pages/` directory entirely (including `_app.tsx`, `_document.tsx`, catch-all, and API routes after migration)
- Remove `routerWrapper` prop from ClientProviders (no longer needed)
- Delete `ProtectedRoute` component (replaced by `(protected)/layout.tsx`)
- Remove `HIDDEN_ROUTES` from navConfig (route groups make it redundant)
- Delete redundant `<Head>` import from AppShell (root layout metadata handles it)
- Audit + replace all Link destinations while migrating (not just mechanical swap)

### Route Structure
- Two route groups: `(public)/` and `(protected)/`
- Public routes: `/` (landing), `/auth`, `/auth/forgot`, `/auth/update-password`, `/op-ed`, `/about`
- Auth routes nested under `(public)/auth/` with shared directory
- Protected routes: `/home`, `/hub/**`, `/test`, `/study`, `/practice`, `/interview`, `/settings`
- `/practice` stays as own route under `(protected)/practice/page.tsx` (not nested under study)
- `/op-ed` stays at current path
- Custom 404 page via `not-found.tsx` (friendly message + link back, not silent redirect)

### Navigation Shell
- NavigationShell lives in `(protected)/layout.tsx` only — public routes have no nav shell
- NavigationProvider stays in ClientProviders (usePathname works anywhere in client components)
- `useViewportHeight` hook called from root layout client component
- `cleanExpiredSessions()` stays as root-level client useEffect
- `installHistoryGuard()` kept as Safari safety net

### Page Transitions
- Enter-only directional slide animation in `(protected)/template.tsx`
- Direction determined via sessionStorage: store current pathname before navigation, template.tsx reads prevPath on mount, uses existing `getSlideDirection()`
- No exit animation (accepted App Router constraint)
- Protected routes only — public routes render instantly with no animation
- Cross-group navigation (public → protected, e.g., /auth → /home) is instant, no animation
- Spring timing: Claude's discretion to tune for natural feel without exit animation

### Navigation API Migration
- Static links: use next/link `<Link>` component (tabs, nav items, static links)
- Dynamic navigation: use `useRouter().push()` / `.replace()` for programmatic navigation (login redirect, logout, etc.)
- `useLocation` → `usePathname` from next/navigation
- `useSearchParams` → next/navigation `useSearchParams` (read-only) + `router.replace()` for writes
- `useFocusOnNavigation` hook: migrate to `usePathname` (stays in NavigationShell)
- `useNavigate` → `useRouter` from next/navigation
- `<Link to=...>` → `<Link href=...>` from next/link
- `<Navigate>` → `router.replace()` or server-side `redirect()`

### Navigation Guards
- Unified `useNavigationGuard` hook for both TestPage and InterviewPage
- Migrate from raw history.pushState to App Router router events
- Single shared approach for back-button guards during active sessions

### Hub Sub-Routes
- Single page with client-side tabs at `(protected)/hub/[[...tab]]/page.tsx`
- Catch-all preserves existing URLs: `/hub/overview`, `/hub/history`, `/hub/achievements`
- Page component passes `params.tab[0]` as `initialTab` prop to HubPage
- Bare `/hub` redirected to `/hub/overview` via server-side `redirect()` in page.tsx
- Tab animation (AnimatePresence with directional slides) preserved as-is
- Swipe gestures preserved
- Scroll memory preserved (hub tabs only, not global route transitions)
- Tab navigation uses `router.push()` (back button cycles tabs)
- Badge deep-linking via search params: `/hub/achievements?focusBadge=xyz` (not hash fragments)
- `location.state.focusBadge` → `useSearchParams` `?focusBadge=` param

### Auth & State Migration
- `location.state.from` in AuthPage removed — consolidated to `returnTo` search param only
- LandingPage authenticated redirect: client-side `router.replace('/home')` (not middleware)
- Legacy redirect routes use `redirect()` (instant, no spinner)

### Loading States
- Minimal centered spinner in `(protected)/loading.tsx` only — matches auth guard spinner style
- No per-page skeleton layouts
- No loading.tsx for public routes
- Internal page loading states (Dashboard skeletons, TestPage pre-test screen) left unchanged

### Error Handling
- Both layers: keep ErrorBoundary in ClientProviders + add `error.tsx` per route group
- `global-error.tsx` already exists (Sentry)
- New: `error.tsx` at root, `(protected)/error.tsx`, `(public)/error.tsx`

### Legacy URL Redirects
- Hash redirect script in root layout: detect `#/` URLs, redirect to clean URL equivalent
- Guard against Supabase auth callback hashes (skip `#access_token=...`)
- next.config.js permanent (301) redirects for old clean URLs: `/dashboard`→`/home`, `/progress`→`/hub/overview`, `/history`→`/hub/history`, `/social`→`/hub/achievements`

### API Routes
- All 4 push notification routes migrated to App Router Route Handlers
- `pages/api/push/subscribe.ts` → `app/api/push/subscribe/route.ts`
- `pages/api/push/send.ts` → `app/api/push/send/route.ts`
- `pages/api/push/srs-reminder.ts` → `app/api/push/srs-reminder/route.ts`
- `pages/api/push/weak-area-nudge.ts` → `app/api/push/weak-area-nudge/route.ts`
- Handler signature changes from `(req, res)` to Web API `Request`/`Response`

### Global Overlays
- CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator all live in root layout.tsx alongside ClientProviders

### Testing
- Mock next/navigation in test setup (vi.mock for useRouter, usePathname, useSearchParams)
- Remove BrowserRouter wrappers from component tests

### Out of Scope (Deferred)
- Service worker precache updates → Phase 42
- CLAUDE.md architecture docs update → deferred until v4.0 complete

### Claude's Discretion
- Spring physics tuning for enter-only animation
- GreetingFlow placement (root vs protected layout — evaluate component's internal auth gating)
- Error page designs (error.tsx content/styling)
- Hash redirect script implementation details

</decisions>

<specifics>
## Specific Ideas

- "I want the hub tab animation (swipe + directional slides) to feel exactly the same after migration"
- Template.tsx enter animation should use sessionStorage for prevPath tracking
- Badge deep-linking should be bookmarkable via search params, not ephemeral state
- Test and interview navigation guards should be unified into a shared hook

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `PageTransition.tsx`: Direction-aware slide+scale animation — reusable logic for template.tsx enter animation
- `getSlideDirection()` in `navConfig.ts`: Tab order comparison — reuse directly in template.tsx
- `SPRING_SNAPPY` in `motion-config.ts`: Spring physics config — reuse for consistent feel
- `ClientProviders.tsx`: Already wraps all 12 providers — just remove routerWrapper prop
- `(protected)/layout.tsx`: Auth guard already in place from Phase 40
- `app/layout.tsx`: Root layout with providers already set up
- `installHistoryGuard()`: Safari replaceState guard — keep as-is
- `navConfig.ts`: NAV_TABS, tab ordering, slide direction — all reusable after removing HIDDEN_ROUTES

### Established Patterns
- All pages are `'use client'` components — no server-side rendering (browser API dependency)
- Provider nesting order is critical — documented in ClientProviders
- `useMemo` for derived state (no setState in effects) — React Compiler pattern
- `useState(() => ...)` lazy init for render purity
- Bilingual UI via `useLanguage()` hook throughout all components

### Integration Points
- `pages/[[...slug]].tsx` → DELETE (replaced by app/ routes)
- `pages/_app.tsx` → DELETE (replaced by app/layout.tsx)
- `src/AppShell.tsx` → DELETE (replaced by app/ route structure + layouts)
- `src/components/ProtectedRoute.tsx` → DELETE (replaced by (protected)/layout.tsx)
- `src/components/animations/PageTransition.tsx` → REPLACE with (protected)/template.tsx
- 34 files with react-router-dom imports → migrate to next/navigation
- 4 API routes in pages/api/ → migrate to app/api/ Route Handlers
- Test files → update mocks from react-router-dom to next/navigation

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 41-route-migration*
*Context gathered: 2026-02-24*
