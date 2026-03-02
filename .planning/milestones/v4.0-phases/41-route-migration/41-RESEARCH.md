# Phase 41: Route Migration - Research

**Researched:** 2026-02-24
**Domain:** Next.js App Router migration (react-router-dom removal, file-based routing, Route Handlers)
**Confidence:** HIGH

## Summary

This phase migrates all 15+ routes from react-router-dom (v7.13) hash routing to Next.js App Router file-based routing, removes react-router-dom entirely, migrates 4 API routes to Route Handlers, implements enter-only page transitions via `template.tsx`, and ensures clean URLs work without hash prefixes. The existing `app/layout.tsx` and `app/(protected)/layout.tsx` already exist from Phase 40, providing the root layout with ClientProviders and the auth guard.

The migration touches 39 files that import from react-router-dom. The primary work is: (1) creating thin `page.tsx` wrappers for each route, (2) mechanically replacing react-router-dom hooks/components with next/navigation equivalents across 34 component files, (3) converting 4 API routes from `NextApiRequest/NextApiResponse` to Web `Request/Response`, (4) building the `template.tsx` enter animation, (5) deleting Pages Router files, and (6) adding legacy redirect support.

**Primary recommendation:** Execute as a big-bang migration in ordered waves -- route structure first, then component-by-component API migration, then API routes, then animation/polish, then cleanup/deletion. Each wave should build and pass typecheck.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Big bang approach: create all App Router page.tsx files, migrate all 34 files from react-router-dom to next/navigation, delete AppShell + catch-all + Pages Router, remove react-router-dom
- Page components stay in `src/pages/` -- each `app/` page.tsx is a thin `'use client'` wrapper that imports the real component
- Delete `pages/` directory entirely (including `_app.tsx`, `_document.tsx`, catch-all, and API routes after migration)
- Remove `routerWrapper` prop from ClientProviders (no longer needed)
- Delete `ProtectedRoute` component (replaced by `(protected)/layout.tsx`)
- Remove `HIDDEN_ROUTES` from navConfig (route groups make it redundant)
- Delete redundant `<Head>` import from AppShell (root layout metadata handles it)
- Audit + replace all Link destinations while migrating (not just mechanical swap)
- Two route groups: `(public)/` and `(protected)/`
- Public routes: `/` (landing), `/auth`, `/auth/forgot`, `/auth/update-password`, `/op-ed`, `/about`
- Auth routes nested under `(public)/auth/` with shared directory
- Protected routes: `/home`, `/hub/**`, `/test`, `/study`, `/practice`, `/interview`, `/settings`
- `/practice` stays as own route under `(protected)/practice/page.tsx`
- Custom 404 page via `not-found.tsx`
- NavigationShell lives in `(protected)/layout.tsx` only
- NavigationProvider stays in ClientProviders
- Enter-only directional slide animation in `(protected)/template.tsx`
- Direction determined via sessionStorage: store current pathname before navigation, template.tsx reads prevPath on mount
- No exit animation (accepted App Router constraint)
- Protected routes only -- public routes render instantly with no animation
- Static links: use next/link `<Link>` component
- Dynamic navigation: use `useRouter().push()` / `.replace()` from next/navigation
- `useLocation` -> `usePathname`, `useNavigate` -> `useRouter`, `<Link to=...>` -> `<Link href=...>`
- `<Navigate>` -> `router.replace()` or server-side `redirect()`
- Unified `useNavigationGuard` hook for both TestPage and InterviewPage
- Hub: single page with client-side tabs at `(protected)/hub/[[...tab]]/page.tsx`
- Bare `/hub` redirected to `/hub/overview` via server-side `redirect()` in page.tsx
- Badge deep-linking via search params: `/hub/achievements?focusBadge=xyz`
- `location.state.from` in AuthPage removed -- consolidated to `returnTo` search param only
- LandingPage authenticated redirect: client-side `router.replace('/home')`
- Minimal centered spinner in `(protected)/loading.tsx` only
- Both layers: keep ErrorBoundary in ClientProviders + add `error.tsx` per route group
- Hash redirect script in root layout: detect `#/` URLs, redirect to clean URL equivalent
- next.config.js permanent redirects for old clean URLs: `/dashboard`->`/home`, `/progress`->`/hub/overview`, `/history`->`/hub/history`, `/social`->`/hub/achievements`
- All 4 push notification routes migrated to App Router Route Handlers
- Handler signature changes from `(req, res)` to Web API `Request`/`Response`
- Global overlays (CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator) all live in root layout.tsx alongside ClientProviders
- Mock next/navigation in test setup (vi.mock for useRouter, usePathname, useSearchParams)
- Remove BrowserRouter wrappers from component tests

### Claude's Discretion
- Spring physics tuning for enter-only animation
- GreetingFlow placement (root vs protected layout -- evaluate component's internal auth gating)
- Error page designs (error.tsx content/styling)
- Hash redirect script implementation details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MIGR-05 | All 15+ routes migrated from react-router-dom to Next.js file-based routing | App Router file conventions (page.tsx, layout.tsx, template.tsx), next/navigation hooks, route group patterns |
| MIGR-06 | `react-router-dom` removed from package.json | Complete import replacement guide for all 39 files, mechanical swap patterns |
| MIGR-08 | Page transitions work with App Router using `template.tsx` pattern | template.tsx remount behavior, enter-only animation with sessionStorage direction, motion/react integration |
| MIGR-11 | All API routes migrated to Route Handlers (`app/api/*/route.ts`) | Web Request/Response API patterns, NextApiRequest->Request conversion, header/body access |
| MIGR-12 | Clean URLs work without hash prefix (no more `#/dashboard`) | Hash redirect script, next.config.mjs permanent redirects, Supabase callback hash guard |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App Router file-based routing | Already installed, target framework |
| next/navigation | (built-in) | Client-side routing hooks | Replaces react-router-dom hooks |
| next/link | (built-in) | Static link component | Replaces react-router-dom `<Link>` |
| motion/react | 12.34.3 | Page transition animation | Already installed, used by 30+ components |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next/server | (built-in) | NextRequest/NextResponse in Route Handlers | API route migration for advanced headers |

### Removal
| Library | Action | Reason |
|---------|--------|--------|
| react-router-dom | `pnpm remove react-router-dom` | Replaced entirely by Next.js App Router |

## Architecture Patterns

### App Router Route Structure
```
app/
  layout.tsx                          # Root layout (already exists -- add overlays)
  not-found.tsx                       # Custom 404 page
  error.tsx                           # Root error boundary
  (public)/
    page.tsx                          # / landing
    auth/
      page.tsx                        # /auth
      forgot/
        page.tsx                      # /auth/forgot
      update-password/
        page.tsx                      # /auth/update-password
    op-ed/
      page.tsx                        # /op-ed
    about/
      page.tsx                        # /about
    error.tsx                         # Public route error boundary
  (protected)/
    layout.tsx                        # Auth guard + NavigationShell (modify existing)
    template.tsx                      # Enter-only page transition animation
    loading.tsx                       # Minimal spinner
    error.tsx                         # Protected route error boundary
    home/
      page.tsx                        # /home (Dashboard)
    hub/
      [[...tab]]/
        page.tsx                      # /hub, /hub/overview, /hub/history, /hub/achievements
    test/
      page.tsx                        # /test
    study/
      page.tsx                        # /study
    practice/
      page.tsx                        # /practice
    interview/
      page.tsx                        # /interview
    settings/
      page.tsx                        # /settings
  api/
    push/
      subscribe/
        route.ts                      # POST/DELETE /api/push/subscribe
      send/
        route.ts                      # POST /api/push/send
      srs-reminder/
        route.ts                      # POST /api/push/srs-reminder
      weak-area-nudge/
        route.ts                      # POST /api/push/weak-area-nudge
```

### Pattern 1: Thin Page Wrapper
**What:** Each `app/` page.tsx is a `'use client'` wrapper that imports the existing component from `src/pages/`.
**When to use:** All routes -- keeps existing components in place, minimizes diff.
**Example:**
```typescript
// app/(protected)/home/page.tsx
'use client';

import Dashboard from '@/pages/Dashboard';

export default function HomePage() {
  return <Dashboard />;
}
```

### Pattern 2: Hub Catch-All with Server Redirect
**What:** Optional catch-all `[[...tab]]` renders HubPage, bare `/hub` redirects server-side.
**When to use:** Hub route with tab sub-routes.
**Example:**
```typescript
// app/(protected)/hub/[[...tab]]/page.tsx
import { redirect } from 'next/navigation';
import HubPageClient from './HubPageClient';

export default async function HubPage({
  params,
}: {
  params: Promise<{ tab?: string[] }>;
}) {
  const { tab } = await params;

  // Bare /hub -> redirect to /hub/overview
  if (!tab || tab.length === 0) {
    redirect('/hub/overview');
  }

  return <HubPageClient initialTab={tab[0]} />;
}
```

**CRITICAL: Next.js 16 params are async.** The `params` prop in `page.tsx` is a Promise that must be awaited. This is a Next.js 16 change.

### Pattern 3: Route Handler Migration
**What:** Convert Pages API route `(req: NextApiRequest, res: NextApiResponse)` to Web API `(request: Request)`.
**When to use:** All 4 API routes.
**Example:**
```typescript
// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const authHeader = request.headers.get('authorization');

  // ... logic ...

  return NextResponse.json({ success: true }, { status: 200 });
}

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  // ... logic ...

  return NextResponse.json({ success: true }, { status: 200 });
}
```

**Key differences from Pages API routes:**
- No `req.method` check -- each HTTP method is a named export
- `req.body` -> `await request.json()`
- `req.headers.authorization` -> `request.headers.get('authorization')`
- `res.status(200).json({})` -> `NextResponse.json({}, { status: 200 })`
- `res.setHeader('Retry-After', val)` -> `new NextResponse(body, { headers: { 'Retry-After': val } })`
- `req.socket.remoteAddress` -> `request.headers.get('x-forwarded-for')` (no socket access)
- Route Handlers do NOT use bodyParser (it's automatic)

### Pattern 4: Enter-Only Page Transition
**What:** `template.tsx` remounts on navigation, triggering enter animation with direction from sessionStorage.
**When to use:** Protected routes only.
**Example:**
```typescript
// app/(protected)/template.tsx
'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getSlideDirection } from '@/components/navigation/navConfig';
import { SPRING_SNAPPY } from '@/lib/motion-config';

const PREV_PATH_KEY = 'civic-prev-pathname';

export default function ProtectedTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  // Read previous path from sessionStorage (set before navigation)
  const prevPath = typeof window !== 'undefined'
    ? sessionStorage.getItem(PREV_PATH_KEY) ?? '/home'
    : '/home';

  // Compute direction from tab order
  const direction = getSlideDirection(prevPath, pathname);

  // Store current path for next navigation
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(PREV_PATH_KEY, pathname);
  }

  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, scale: 0.97, x: direction === 'left' ? 30 : -30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={SPRING_SNAPPY}
    >
      {children}
    </motion.div>
  );
}
```

**CRITICAL:** template.tsx remounts on every navigation within its segment. This means:
- `key` is automatically applied by Next.js (unique per route segment)
- No `AnimatePresence` needed (no exit animation in App Router constraint)
- `useEffect` re-runs on every navigation (good for sessionStorage write)
- State inside template resets on each navigation

### Pattern 5: next/navigation Hook Mapping
**What:** Systematic replacement of react-router-dom hooks with next/navigation equivalents.

| react-router-dom | next/navigation | Notes |
|-------------------|-----------------|-------|
| `useLocation()` | `usePathname()` | Returns pathname string only (no state, search, hash) |
| `useLocation().search` | `useSearchParams()` | Returns read-only `URLSearchParams` |
| `useLocation().state` | N/A | Use search params or sessionStorage instead |
| `useNavigate()` | `useRouter()` | Methods: `.push()`, `.replace()`, `.back()`, `.refresh()` |
| `navigate(path)` | `router.push(path)` | Push new history entry |
| `navigate(path, { replace: true })` | `router.replace(path)` | Replace current entry |
| `<Link to={path}>` | `<Link href={path}>` | Import from `next/link` |
| `<Navigate to={path} replace />` | `redirect(path)` or `router.replace(path)` | Server: `redirect()`, Client event: `router.replace()` |
| `useSearchParams()` | `useSearchParams()` from next/navigation | Read-only; write via `router.push(pathname + '?' + params)` |

**Key difference for useSearchParams:** react-router-dom's `useSearchParams` returns `[searchParams, setSearchParams]` tuple. Next.js returns only read-only `searchParams`. To update, use `router.push()` or `router.replace()` with constructed URL.

### Pattern 6: Hash Redirect Script
**What:** Inline script in root layout detects `#/` hash URLs and redirects to clean equivalents.
**Example:**
```typescript
// Inline script content for root layout
const HASH_REDIRECT_SCRIPT = `
  (function() {
    var h = window.location.hash;
    if (h && h.startsWith('#/') && !h.startsWith('#access_token=')) {
      var clean = h.slice(1);
      window.location.replace(clean + window.location.search);
    }
  })();
`;
```

**Guard against Supabase auth callback:** Supabase OAuth returns with `#access_token=...` which must NOT be redirected.

### Pattern 7: NavigationShell in Protected Layout
**What:** Move NavigationShell from AppShell into `(protected)/layout.tsx` so only protected routes get nav chrome.
**Example:**
```typescript
// app/(protected)/layout.tsx (modify existing)
'use client';

import { redirect, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { NavigationShell } from '@/components/navigation/NavigationShell';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (/* spinner */);
  }

  if (!user) {
    const safeReturnTo = pathname && pathname.startsWith('/') && !pathname.startsWith('//') ? pathname : undefined;
    const authUrl = safeReturnTo ? `/auth?returnTo=${encodeURIComponent(safeReturnTo)}` : '/auth';
    redirect(authUrl);
  }

  return <NavigationShell>{children}</NavigationShell>;
}
```

### Anti-Patterns to Avoid
- **Using `useRouter` from `next/router`:** Must use `next/navigation` in App Router. The `next/router` version does not work in `app/` directory.
- **Mixing `redirect()` in event handlers:** `redirect()` can be called during render or in Server Actions, but NOT in onClick/onSubmit event handlers. Use `router.push()` / `router.replace()` in event handlers.
- **Reading `location.state` after migration:** App Router has no equivalent to react-router-dom's `location.state`. All state passing must use URL search params or sessionStorage.
- **Forgetting to await params in page.tsx:** Next.js 16 changed `params` to async (Promise). Must `await params` before accessing properties.
- **Using AnimatePresence in template.tsx:** Exit animations are not supported in App Router. template.tsx remounts (destroys old, creates new), so AnimatePresence exit never runs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route auth guard | Custom HOC wrapper | `(protected)/layout.tsx` | Already exists from Phase 40, covers all nested routes |
| Route redirects | Client-side redirect components | `next.config.mjs` `redirects()` | 301/308 handled at server level, better for SEO |
| Hash URL detection | Complex router middleware | Inline `<script>` in layout | Runs before React hydrates, instant redirect |
| API method routing | `if (req.method === 'POST')` | Named exports `export async function POST()` | App Router convention, automatic 405 for unsupported methods |
| Search param updates | Custom state sync | `router.push(pathname + '?' + params)` | Standard next/navigation pattern |

## Common Pitfalls

### Pitfall 1: Pages Router and App Router Route Conflicts
**What goes wrong:** Having both `pages/[[...slug]].tsx` catch-all AND `app/` routes causes routing conflicts.
**Why it happens:** Next.js resolves both routers; the catch-all in pages matches everything.
**How to avoid:** Delete `pages/[[...slug]].tsx` BEFORE or simultaneously with creating `app/` page routes. This is a big-bang migration.
**Warning signs:** 404s, wrong page rendering, console warnings about route conflicts.

### Pitfall 2: NavigationShell useLocation -> usePathname Scope
**What goes wrong:** `NavigationShell` currently uses `useLocation()` from react-router-dom and checks `HIDDEN_ROUTES`. After migration it must use `usePathname()`.
**Why it happens:** `NavigationShell` is now inside `(protected)/layout.tsx`, which means it ONLY renders for protected routes. The `HIDDEN_ROUTES` check becomes unnecessary.
**How to avoid:** Remove `HIDDEN_ROUTES` check from NavigationShell since route groups handle visibility. Always show nav in NavigationShell (it only renders in protected layout).
**Warning signs:** Missing nav bar, nav appearing on auth pages.

### Pitfall 3: useSearchParams Requires Suspense in Static Rendering
**What goes wrong:** Build fails with "Missing Suspense boundary with useSearchParams" error.
**Why it happens:** `useSearchParams()` in a statically-rendered route requires a `<Suspense>` boundary.
**How to avoid:** This project's pages are all `'use client'` and dynamically rendered (IndexedDB, auth checks). The page.tsx wrappers should ensure components are client-only. If build issues occur, wrap in `<Suspense>`.
**Warning signs:** Build error mentioning Suspense boundary.

### Pitfall 4: Hub Catch-All Params Are Async in Next.js 16
**What goes wrong:** `params.tab` is undefined because `params` is a Promise.
**Why it happens:** Next.js 16 made `params` async in page components.
**How to avoid:** Use `const { tab } = await params;` in the hub page component.
**Warning signs:** TypeScript error about Promise, undefined tab value at runtime.

### Pitfall 5: location.state Removal Breaks focusBadge
**What goes wrong:** `AchievementsTab` reads `location.state.focusBadge` which doesn't exist in App Router.
**Why it happens:** App Router has no `location.state` equivalent.
**How to avoid:** Migrate to `useSearchParams().get('focusBadge')`. Update `BadgeHighlights` to use `router.push('/hub/achievements?focusBadge=badgeId')`.
**Warning signs:** Badge deep-linking silently fails, no scroll-to-badge.

### Pitfall 6: Op-Ed Page Exists in Both pages/ and src/pages/
**What goes wrong:** `pages/op-ed.tsx` (119KB standalone Next.js page) coexists with `src/pages/OpEdPage.tsx` (react-router-dom version). Only one should survive.
**Why it happens:** The `pages/op-ed.tsx` was the Pages Router SSR version, while `src/pages/OpEdPage.tsx` is the SPA version rendered through the catch-all.
**How to avoid:** Create `app/(public)/op-ed/page.tsx` importing `src/pages/OpEdPage.tsx`. Delete `pages/op-ed.tsx`. The src component has better integration (GlassHeader, language context).
**Warning signs:** Wrong op-ed page rendering, missing styling.

### Pitfall 7: TestPage/InterviewPage Navigation Guards with App Router
**What goes wrong:** Back-button guards that use `history.pushState` may conflict with App Router's own history management.
**Why it happens:** App Router uses the History API internally. Custom pushState/replaceState calls can interfere.
**How to avoid:** The existing guard pattern (pushState with typed marker, popstate listener, replaceState on back) should work because it checks for specific state markers. Test carefully. The unified `useNavigationGuard` should use the same popstate/pushState pattern since App Router doesn't provide router events for back-button interception.
**Warning signs:** Guards not triggering, infinite back-button loops, guards triggering on normal navigation.

### Pitfall 8: AuthPage location.state.from Fallback
**What goes wrong:** After migration, the `location.state.from` fallback in AuthPage no longer receives values.
**Why it happens:** The protected layout uses `redirect()` with `returnTo` search param, not `location.state`.
**How to avoid:** Remove the `location.state.from` fallback entirely. Only use `searchParams.get('returnTo')` pattern.
**Warning signs:** After login, user always goes to `/home` instead of the page they tried to access.

### Pitfall 9: CSP Hash for Hash Redirect Script
**What goes wrong:** The new inline hash redirect script gets blocked by CSP.
**Why it happens:** The proxy.ts CSP only has a hash for the existing THEME_SCRIPT.
**How to avoid:** Either add a second CSP hash for the hash redirect script, or combine it with the theme script. The hash redirect script must be byte-identical to what's hashed.
**Warning signs:** Console CSP violation errors, hash redirects not working.

### Pitfall 10: Global Overlay Components Need Auth Context
**What goes wrong:** GreetingFlow uses `useAuth()`, which means it must be inside AuthProvider. If moved to wrong location, context is missing.
**Why it happens:** Root layout's ClientProviders wraps everything with AuthProvider, so overlays in root layout.tsx work fine.
**How to avoid:** Keep all global overlays inside the `<ClientProviders>` wrapper in root layout, which provides all context. Evaluate GreetingFlow: it uses `useAuth()` internally so it gates itself -- safe at root level.
**Warning signs:** "useAuth must be used within AuthProvider" runtime error.

## Code Examples

### API Route Handler Conversion (subscribe.ts)
```typescript
// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiting (same logic, adapted for Request API)
async function verifyJWT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing authorization header', statusCode: 401 };
  }
  const token = authHeader.slice(7);
  // ... same Supabase verification logic ...
  return { userId: data.user.id };
}

export async function POST(request: NextRequest) {
  const authResult = await verifyJWT(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode });
  }

  const body = await request.json();
  // ... subscription logic ...

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const authResult = await verifyJWT(request);
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode });
  }

  // ... delete logic ...
  return NextResponse.json({ success: true });
}
```

### next.config.mjs Redirects
```javascript
// Add to next.config.mjs
const nextConfig = {
  // ... existing config ...
  async redirects() {
    return [
      { source: '/dashboard', destination: '/home', permanent: true },
      { source: '/progress', destination: '/hub/overview', permanent: true },
      { source: '/history', destination: '/hub/history', permanent: true },
      { source: '/social', destination: '/hub/achievements', permanent: true },
    ];
  },
};
```

### useNavigationGuard (Unified Hook)
```typescript
// src/hooks/useNavigationGuard.ts
import { useEffect, useCallback } from 'react';

interface NavigationGuardOptions {
  active: boolean;
  onBackAttempt: () => void;
  markerKey: string; // 'navLock' | 'interviewGuard'
}

export function useNavigationGuard({ active, onBackAttempt, markerKey }: NavigationGuardOptions) {
  const stableOnBackAttempt = useCallback(() => {
    onBackAttempt();
  }, [onBackAttempt]);

  useEffect(() => {
    if (!active) return;

    const guardState = { [markerKey]: true };
    window.history.pushState(guardState, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as Record<string, unknown> | null;
      if (state && state[markerKey] === true) return;

      window.history.pushState(guardState, '');
      stableOnBackAttempt();
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);

      const currentState = window.history.state as Record<string, unknown> | null;
      if (currentState && currentState[markerKey] === true) {
        window.history.back();
      }
    };
  }, [active, stableOnBackAttempt, markerKey]);
}
```

### Test Mock Setup for next/navigation
```typescript
// Add to src/__tests__/setup.ts or create src/__tests__/mocks/next-navigation.ts
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/api/*.ts` with `NextApiRequest` | `app/api/*/route.ts` with Web `Request` | Next.js 13+ (stable 14+) | Named HTTP method exports, no manual method checking |
| `pages/_app.tsx` + `_document.tsx` | `app/layout.tsx` (root layout) | Next.js 13+ | Single file replaces both, Server Component by default |
| `pages/_error.tsx` | `app/error.tsx` + `app/global-error.tsx` | Next.js 13+ | Per-route-segment error boundaries |
| `pages/404.tsx` | `app/not-found.tsx` | Next.js 13+ | Automatic 404 handling |
| `useRouter()` from `next/router` | `useRouter()` from `next/navigation` | Next.js 13+ | Different API surface, no `query`/`asPath` |
| `params` as plain object | `params` as `Promise` | Next.js 16 | Must `await params` in page/layout components |
| `getStaticPaths` | `generateStaticParams` | Next.js 13+ | Not applicable here (no SSG) |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x with jsdom |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:run && pnpm typecheck && pnpm build` |
| Estimated runtime | ~15 seconds (test:run), ~45 seconds (full) |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIGR-05 | All routes accessible via clean URLs | build + smoke | `pnpm build` (validates all routes compile) | N/A (build verification) |
| MIGR-06 | react-router-dom removed | grep check | `! grep -r "react-router-dom" src/ --include="*.ts" --include="*.tsx"` | N/A (grep verification) |
| MIGR-08 | Page transitions with template.tsx | unit | `pnpm test:run` (existing animation tests adapt) | Needs update |
| MIGR-11 | API routes as Route Handlers | integration | `pnpm build` (validates Route Handler exports) | N/A (build verification) |
| MIGR-12 | Clean URLs, no hash prefix | config + build | `pnpm build` (validates redirect config) | N/A (build verification) |

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task -> run: `pnpm typecheck && pnpm test:run`
- **Full suite trigger:** Before merging final task of any plan wave: `pnpm lint && pnpm lint:css && pnpm format:check && pnpm typecheck && pnpm test:run && pnpm build`
- **Phase-complete gate:** Full build verification green before `/gsd:verify-work`
- **Estimated feedback latency per task:** ~15 seconds (typecheck + test), ~60 seconds (full build)

### Wave 0 Gaps (must be created before implementation)
- [ ] `src/__tests__/mocks/next-navigation.ts` -- shared mock for next/navigation hooks
- [ ] Update `src/__tests__/setup.ts` -- remove any react-router-dom test setup, add next/navigation mocks
- [ ] Update test files that wrap components in `<BrowserRouter>` (currently none found, but verify during execution)

## Open Questions

1. **GreetingFlow placement**
   - What we know: GreetingFlow uses `useAuth()` and shows WelcomeScreen on sign-in. It currently lives inside AppShell (inside BrowserRouter). It needs `useAuth` which is provided by ClientProviders.
   - What's unclear: Should it live in root layout (shows on any authenticated route) or protected layout (shows only when entering protected routes)? GreetingFlow already self-gates on `user` presence.
   - Recommendation: Keep in root layout since it gates itself and should show on any post-login navigation regardless of route group.

2. **Hash redirect script CSP impact**
   - What we know: proxy.ts whitelists THEME_SCRIPT by sha256 hash. A new inline script needs its own hash.
   - What's unclear: Whether to add a second hash or combine scripts.
   - Recommendation: Combine the hash redirect check with THEME_SCRIPT content (both are tiny, same purpose: runs before React). Generate new hash for combined content. Or keep separate and add second hash to CSP -- simpler to maintain.

3. **Op-Ed page: pages/op-ed.tsx vs src/pages/OpEdPage.tsx**
   - What we know: Two versions exist. pages/op-ed.tsx (119KB) is a standalone Pages Router page using next/link and next/head. src/pages/OpEdPage.tsx uses react-router-dom Link and GlassHeader.
   - What's unclear: Whether the pages/ version has content not in src/ version.
   - Recommendation: Use src/pages/OpEdPage.tsx (already integrated with app's design system). Create app/(public)/op-ed/page.tsx wrapper. Delete pages/op-ed.tsx. Verify content parity during execution.

## Sources

### Primary (HIGH confidence)
- [Next.js 16.1.6 Official Docs - App Router Migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration) - Complete migration guide
- [Next.js 16.1.6 Official Docs - Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) - API route migration patterns
- [Next.js 16.1.6 Official Docs - template.tsx](https://nextjs.org/docs/app/api-reference/file-conventions/template) - Template behavior and remounting
- [Next.js 16.1.6 Official Docs - useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params) - Search params API
- [Next.js 16.1.6 Official Docs - useRouter](https://nextjs.org/docs/app/api-reference/functions/use-router) - Router hook API
- [Next.js 16.1.6 Official Docs - redirect](https://nextjs.org/docs/app/api-reference/functions/redirect) - Server/client redirect
- [Next.js 16.1.6 Official Docs - Redirects Config](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects) - next.config.js redirects

### Secondary (MEDIUM confidence)
- Codebase analysis: 39 files with react-router-dom imports identified via grep
- Codebase analysis: Existing App Router foundation (layout.tsx, protected layout) from Phase 40

### Tertiary (LOW confidence)
- None -- all findings verified against official docs and codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Next.js App Router is well-documented, project already on 16.1.6
- Architecture: HIGH -- Route structure locked in CONTEXT.md, patterns verified against official docs
- Pitfalls: HIGH -- Identified from actual codebase analysis (39 files, specific patterns like location.state.focusBadge)
- API migration: HIGH -- Route Handler docs verified, conversion patterns are mechanical
- Page transitions: HIGH -- template.tsx behavior verified, enter-only animation pattern is standard

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable -- Next.js 16 is mature)
