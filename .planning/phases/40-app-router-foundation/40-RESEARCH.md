# Phase 40: App Router Foundation - Research

**Researched:** 2026-02-24
**Domain:** Next.js 16 App Router shell, client provider extraction, auth guard layout
**Confidence:** HIGH

## Summary

Phase 40 builds the App Router shell infrastructure that Phase 41 will migrate routes into. The work involves three main areas: (1) a production-ready `app/layout.tsx` Server Component root with metadata, viewport, fonts, CSS, and theme script; (2) a `ClientProviders.tsx` component that extracts all 10 context providers from AppShell into a reusable `'use client'` boundary; and (3) a `(protected)/layout.tsx` auth guard using the existing `useAuth()` hook with `redirect()` from `next/navigation`.

The existing `app/layout.tsx` is currently a minimal stub serving only the Sentry test page and global-error.tsx. It will be replaced with a full layout. The key architectural insight is that `redirect()` from `next/navigation` can be called during render in client components (confirmed in Next.js 16.1.6 docs), making the auth guard layout straightforward. All context providers already guard against SSR via `typeof window === 'undefined'` checks in their lazy initializers, so no additional `useIsClient()` guard is needed in ClientProviders.

**Primary recommendation:** Extract providers to ClientProviders with a conditional router wrapper prop, refactor AppShell to consume it, build app/layout.tsx with full metadata/viewport/fonts/CSS, and create an empty (protected) route group with auth guard layout.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Single `ClientProviders.tsx`** file with all 10 context providers nested in current order
- Include NavigationProvider AND NavigationShell (they still work during coexistence since react-router-dom is still active)
- **Conditional router wrapper**: ClientProviders accepts an optional router wrapper prop. AppShell passes `BrowserRouter`, App Router layout passes nothing. Providers nest inside, router is opt-in
- **Outer ErrorBoundary only** inside ClientProviders. Inner ErrorBoundary stays in AppShell around routes content
- Overlays (CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator) stay in AppShell — they depend on react-router-dom internally and move in Phase 41
- **Refactor AppShell to use ClientProviders** in Phase 40. Validates extraction works with existing routes. Single source of truth for providers
- `installHistoryGuard()` stays in AppShell (tied to react-router-dom, not a provider concern)
- `not-found.tsx` and `loading.tsx` deferred to Phase 41
- Build `app/layout.tsx` **production-ready** in Phase 40: fonts, CSS, viewport, PWA meta, theme script, metadata export
- `pages/_document.tsx` and `pages/_app.tsx` left **completely untouched** (theme script shared via import, not modified)
  - Wait: _document.tsx IS modified to import shared themeScript constant (content unchanged)
- Both shells coexist safely — each serves its own router's routes
- CSS imports in both `_app.tsx` AND `app/layout.tsx` — redundant but safe during coexistence
- `global-error.tsx` stays minimal with inline styles — no Tailwind dependency
- **Extract theme script to shared constant** (`src/lib/themeScript.ts`) — both `_document.tsx` and `app/layout.tsx` import it
- Same CSP hash in proxy.ts — no recalculation needed since content is identical
- Use Next.js App Router `export const viewport: Viewport` export in `app/layout.tsx`
- `app/(protected)/layout.tsx` is a **`'use client'` component** using `useAuth()` + `redirect()` from `next/navigation` + `usePathname()` for returnTo
- **Full-screen centered spinner** matching existing ProtectedRoute UX
- Created in Phase 40 as "ready but empty" directory — no routes in it yet
- **URL param for returnTo** (`?returnTo=/intended-path`) for both routers
- Update existing `ProtectedRoute.tsx` to also use URL param instead of react-router state
- AuthPage reads returnTo from URL param (single pattern during coexistence)
- **Validate relative paths only** — reject returnTo values that don't start with `/` (open redirect prevention)
- Public pages go directly in `app/` (no `(public)` group)
- Protected pages use `(protected)` route group
- `next.config.mjs` unchanged — Next.js 16 auto-detects app/ directory
- `npm run build` + `npm run test:run` to verify nothing breaks
- No new unit tests — components are thin wrappers, tested through existing suite

### Claude's Discretion
- SSR guard (`useIsClient()`) inclusion in ClientProviders — evaluate whether providers access `window`/`localStorage` on mount
- Side effects (`useViewportHeight()`, `cleanExpiredSessions()`) placement — decide based on separation of concerns
- `next/head` placement in refactored AppShell — arrange within children slot
- Myanmar font CSS import strategy — pick whatever ensures fonts work in both routers
- `<Head>` metadata in AppShell — decide whether to keep or remove during refactor (metadata moves to App Router `metadata` export)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MIGR-04 | App Router root layout with Server Component shell and ClientProviders wrapper | Full layout.tsx pattern with metadata, viewport, fonts, CSS, theme script, and ClientProviders documented. Viewport type verified with viewportFit support. |
| MIGR-07 | Auth guard implemented via `(protected)/layout.tsx` route group | redirect() from next/navigation confirmed working in 'use client' components during render. Pattern documented with useAuth() + usePathname() + URL param returnTo. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App Router framework | Already installed, provides layout.tsx, metadata, viewport exports |
| react | 19.2.4 | UI framework | Already installed |
| next/navigation | (bundled) | `redirect()`, `usePathname()`, `useRouter()` for App Router | Official App Router navigation API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @fontsource/noto-sans-myanmar | 5.2.7 | Myanmar font CSS imports | Already installed, import in app/layout.tsx for font availability |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `redirect()` during render | `useRouter().push()` in useEffect | redirect() is simpler, works during render, no effect needed. useRouter is for event handlers only |
| `export const viewport` | `<meta>` tags in layout | viewport export is the official App Router pattern, generates proper meta tags |
| `next/font/google` | `@fontsource` CSS imports | Project already uses @fontsource for offline PWA support; next/font would require migration |

**Installation:**
No new packages needed. All dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
app/
├── layout.tsx                    # Server Component root (metadata, viewport, fonts, CSS, theme script, ClientProviders)
├── global-error.tsx              # Existing — no changes
├── dev-sentry-test/page.tsx      # Existing — no changes
├── (protected)/
│   └── layout.tsx                # 'use client' auth guard (useAuth + redirect)
src/
├── components/
│   └── ClientProviders.tsx       # NEW: 10 providers + ErrorBoundary + optional router wrapper
├── lib/
│   └── themeScript.ts            # NEW: Shared theme script constant
├── AppShell.tsx                  # MODIFIED: Refactored to use ClientProviders
├── components/
│   └── ProtectedRoute.tsx        # MODIFIED: returnTo via URL param
pages/
├── _document.tsx                 # MODIFIED: Import shared themeScript constant
├── _app.tsx                      # UNTOUCHED
└── [[...slug]].tsx               # UNTOUCHED
```

### Pattern 1: ClientProviders with Conditional Router Wrapper
**What:** A `'use client'` component that wraps all 10 context providers and accepts an optional `routerWrapper` prop for framework-agnostic usage.
**When to use:** Both AppShell (with BrowserRouter) and app/layout.tsx (without router) consume this.
**Example:**
```typescript
// Source: CONTEXT.md decisions + AppShell.tsx provider order
'use client';

import { type ReactNode, type ComponentType } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { TTSProvider } from '@/contexts/TTSContext';
import { ToastProvider } from '@/components/BilingualToast';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { SocialProvider } from '@/contexts/SocialContext';
import { SRSProvider } from '@/contexts/SRSContext';
import { StateProvider } from '@/contexts/StateContext';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';

interface ClientProvidersProps {
  children: ReactNode;
  routerWrapper?: ComponentType<{ children: ReactNode }>;
}

export function ClientProviders({ children, routerWrapper: RouterWrapper }: ClientProvidersProps) {
  const content = RouterWrapper ? <RouterWrapper>{children}</RouterWrapper> : children;

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <TTSProvider>
            <ToastProvider>
              <OfflineProvider>
                <AuthProvider>
                  <SocialProvider>
                    <SRSProvider>
                      <StateProvider>
                        <NavigationProvider>
                          {content}
                        </NavigationProvider>
                      </StateProvider>
                    </SRSProvider>
                  </SocialProvider>
                </AuthProvider>
              </OfflineProvider>
            </ToastProvider>
          </TTSProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
```

**Key design decisions:**
- Router wraps the innermost content (inside all providers, outside NavigationProvider's children)
- Wait: Per AppShell, Router wraps NavigationProvider. The router wrapper must wrap around NavigationProvider since NavigationProvider's children (NavigationShell) use `useLocation()` from react-router-dom.
- Actually, per the CONTEXT decision: "Providers nest inside, router is opt-in". The router wrapper should be placed at the same position as `<Router>` is in AppShell — between StateProvider and NavigationProvider.

**Corrected nesting (matching AppShell exactly):**
```
ErrorBoundary → LanguageProvider → ThemeProvider → TTSProvider → ToastProvider
→ OfflineProvider → AuthProvider → SocialProvider → SRSProvider → StateProvider
→ [RouterWrapper if provided] → NavigationProvider → {children}
```

### Pattern 2: App Router Root Layout with Server Component
**What:** Server Component root layout with metadata export, viewport export, CSS/font imports, and theme script.
**When to use:** `app/layout.tsx` — serves all App Router routes.
**Example:**
```typescript
// Source: Next.js 16.1.6 docs (Context7 verified)
import type { Metadata, Viewport } from 'next';
import { ClientProviders } from '@/components/ClientProviders';

// Self-hosted Myanmar font (PWA offline support)
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/500.css';
import '@fontsource/noto-sans-myanmar/700.css';

import '../src/styles/globals.css';

import { THEME_SCRIPT } from '@/lib/themeScript';

export const metadata: Metadata = {
  title: 'Civic Test Prep - Master Your U.S. Citizenship Test',
  description: 'Bilingual English-Burmese civic test preparation app...',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'US Civics',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#002868',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
```

### Pattern 3: Auth Guard Layout with redirect()
**What:** `'use client'` layout that checks auth state and redirects unauthenticated users.
**When to use:** `app/(protected)/layout.tsx` — wraps all protected routes.
**Example:**
```typescript
// Source: Next.js 16.1.6 docs (confirmed redirect() works in client component render)
'use client';

import { redirect, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const returnTo = pathname.startsWith('/') ? pathname : undefined;
    const authUrl = returnTo ? `/auth?returnTo=${encodeURIComponent(returnTo)}` : '/auth';
    redirect(authUrl);
  }

  return <>{children}</>;
}
```

### Pattern 4: Shared Theme Script Constant
**What:** Extract the inline theme script from `_document.tsx` to a shared module.
**When to use:** Both `_document.tsx` and `app/layout.tsx` import the same constant.
**Example:**
```typescript
// src/lib/themeScript.ts
export const THEME_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('civic-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var theme = stored || (prefersDark ? 'dark' : 'light');
    document.documentElement.classList.add(theme);
    document.documentElement.style.setProperty('color-scheme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#1a1f36' : '#002868';
  } catch(e) {}
})();
`;
```

### Anti-Patterns to Avoid
- **Moving overlays to ClientProviders:** CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow, SyncStatusIndicator depend on react-router-dom. They must stay in AppShell until Phase 41.
- **Wrapping ClientProviders in useIsClient():** All 10 providers already guard against SSR via `typeof window === 'undefined'` checks in their useState lazy initializers. Adding another guard would cause unnecessary flash/delay.
- **Using `useRouter().push()` instead of `redirect()` in auth guard:** `redirect()` works during render and throws (halting render), while `useRouter().push()` requires useEffect and allows a flash of protected content.
- **Putting router-specific imports in ClientProviders:** ClientProviders must not import from `react-router-dom` or `next/navigation` — it is framework-agnostic. The router is injected via prop.
- **Modifying `pages/_app.tsx`:** Leave completely untouched. CSS imports are duplicated in both `_app.tsx` and `app/layout.tsx` intentionally.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Viewport meta tags | Manual `<meta>` tags in layout | `export const viewport: Viewport` | Next.js generates correct meta tags, handles deduplication |
| Page metadata | `<Head>` component in App Router | `export const metadata: Metadata` | Server-side metadata API, better SEO, automatic management |
| Auth redirect | Custom `window.location` redirect | `redirect()` from `next/navigation` | Integrates with App Router streaming, proper HTTP status codes |
| Theme script deduplication | Copy-paste between files | Shared `THEME_SCRIPT` constant | Single source of truth, CSP hash stays valid |
| SSR detection | Custom `typeof window` checks in layout | Existing provider-level guards | Providers already handle this; layout is Server Component |

**Key insight:** The App Router's metadata and viewport APIs replace manual `<Head>` and `<meta>` tags. Using these APIs ensures proper deduplication, streaming support, and SEO optimization without hand-rolling HTML head management.

## Common Pitfalls

### Pitfall 1: Router Wrapper Placement in Provider Tree
**What goes wrong:** Placing the router wrapper outside all providers means providers can't access router context. Placing it inside NavigationProvider means NavigationShell (which uses `useLocation()`) won't have router context.
**Why it happens:** The provider nesting order is critical and the router must be at the exact same position as in AppShell.
**How to avoid:** The router wrapper must sit between StateProvider and NavigationProvider, exactly where `<Router>` sits in the current AppShell. NavigationProvider's children (NavigationShell) call `useLocation()`, so the router must be above NavigationProvider.
**Warning signs:** "useLocation() must be used within a Router" error at runtime.

### Pitfall 2: CSS Import Order in app/layout.tsx
**What goes wrong:** If globals.css is imported before font CSS, Tailwind reset styles may override font declarations. Or if the import order differs from `_app.tsx`, visual inconsistencies appear.
**Why it happens:** CSS import order determines cascade priority.
**How to avoid:** Match the exact import order from `_app.tsx`: Myanmar font CSS first, then `globals.css`. Since the two routers serve different routes during coexistence, actual CSS conflicts are impossible, but consistency prevents confusion.
**Warning signs:** Myanmar text rendering differently between Pages Router and App Router routes.

### Pitfall 3: redirect() Throws — Don't Wrap in try/catch
**What goes wrong:** `redirect()` works by throwing a special `NEXT_REDIRECT` error. Wrapping it in try/catch swallows the redirect.
**Why it happens:** redirect() uses Next.js internal error-based flow control.
**How to avoid:** Call `redirect()` outside any try/catch block. It should be the last statement in a conditional branch. TypeScript return type is `never`.
**Warning signs:** Auth redirect silently fails, protected content briefly visible.

### Pitfall 4: `suppressHydrationWarning` on `<html>` Tag
**What goes wrong:** The theme script adds a class to `<html>` before React hydrates. Without `suppressHydrationWarning`, React warns about the mismatch between server-rendered HTML (no class) and client state (has `light` or `dark` class).
**Why it happens:** The inline theme script runs before hydration to prevent FOUC, but this creates a deliberate mismatch.
**How to avoid:** Add `suppressHydrationWarning` to the `<html>` tag in `app/layout.tsx`.
**Warning signs:** Console warning "Extra attributes from the server: class" during development.

### Pitfall 5: Metadata viewport-fit Not in Metadata Export
**What goes wrong:** `viewport-fit: cover` must be in the `viewport` export, not the `metadata` export. Putting viewport-related config in the wrong export causes it to be silently ignored.
**Why it happens:** Next.js 14+ separated viewport config from metadata into its own export.
**How to avoid:** Use `export const viewport: Viewport = { viewportFit: 'cover', ... }` — verified the `ViewportLayout` type includes `viewportFit: 'auto' | 'cover' | 'contain'`.
**Warning signs:** Safe-area-inset CSS variables don't work on iOS devices.

### Pitfall 6: NavigationShell Imports react-router-dom
**What goes wrong:** NavigationShell calls `useLocation()` from react-router-dom. In App Router routes (Phase 41+), this will throw because there's no BrowserRouter.
**Why it happens:** NavigationShell was built for the hash-router SPA.
**How to avoid:** In Phase 40, this is fine because no routes are served by the App Router yet. NavigationShell stays in AppShell's subtree where BrowserRouter exists. In Phase 41, navigation components will be rewritten.
**Warning signs:** N/A for Phase 40 — this becomes relevant in Phase 41.

### Pitfall 7: returnTo Open Redirect Vulnerability
**What goes wrong:** If the returnTo URL param accepts arbitrary URLs, an attacker can craft a link like `?returnTo=https://evil.com` that redirects the user to a malicious site after login.
**Why it happens:** Failing to validate that returnTo is a relative path.
**How to avoid:** Validate that returnTo starts with `/` and does not contain `//` (which browsers interpret as protocol-relative). Reject any value that doesn't match.
**Warning signs:** Security scanner flags open redirect on the auth page.

### Pitfall 8: `<head>` in App Router Layout
**What goes wrong:** Adding a `<head>` element directly in app/layout.tsx is valid for `<script>` tags but metadata/viewport must use the export API. Mixing both can cause duplicate meta tags.
**Why it happens:** Different mechanisms generate head content in App Router vs Pages Router.
**How to avoid:** Use `export const metadata` and `export const viewport` for standard meta tags. Only use `<head>` for the inline theme script (which has no equivalent in the metadata API) and apple-touch-icon link.
**Warning signs:** Duplicate `<meta name="theme-color">` tags, duplicate viewport tags.

## Code Examples

Verified patterns from official sources:

### Root Layout with Metadata and Viewport (Next.js 16.1.6)
```typescript
// Source: Context7 /vercel/next.js/v16.1.6 — metadata and viewport exports
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Civic Test Prep - Master Your U.S. Citizenship Test',
  description:
    'Bilingual English-Burmese civic test preparation app with timed practice tests, interactive study guides, and comprehensive score tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'US Civics',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#002868' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1f36' },
  ],
};
```

### Client Component redirect() During Render
```typescript
// Source: Next.js 16.1.6 docs — redirect in client components
// https://nextjs.org/docs/app/api-reference/functions/redirect
'use client';

import { redirect, usePathname } from 'next/navigation';

// redirect() can be called during render in client components
// It throws a NEXT_REDIRECT error that halts rendering
// Do NOT wrap in try/catch

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // redirect() during render — this is the documented pattern
    // It will perform a server-side redirect on initial SSR page load
    redirect(`/auth?returnTo=${encodeURIComponent(pathname)}`);
  }

  return <>{children}</>;
}
```

### Refactored AppShell Using ClientProviders
```typescript
// Source: CONTEXT.md decisions — AppShell refactored to use ClientProviders
'use client';

import { BrowserRouter as Router } from 'react-router-dom';
import { ClientProviders } from '@/components/ClientProviders';
import { NavigationShell } from '@/components/navigation/NavigationShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
// ... other imports

installHistoryGuard();

const AppShell = () => {
  const isClient = useIsClient();
  useViewportHeight();

  useEffect(() => {
    cleanExpiredSessions().catch(() => {});
  }, []);

  if (!isClient) return null;

  return (
    <ClientProviders routerWrapper={Router}>
      <Head>
        <title>Civic Test Prep - Master Your U.S. Citizenship Test</title>
        <meta name="description" content="..." />
      </Head>
      <ErrorBoundary>
        <NavigationShell>
          <PageTransition>
            <Routes>
              {/* ... all routes ... */}
            </Routes>
          </PageTransition>
        </NavigationShell>
      </ErrorBoundary>
      <CelebrationOverlay />
      <PWAOnboardingFlow />
      <OnboardingTour />
      <GreetingFlow />
      <SyncStatusIndicator />
    </ClientProviders>
  );
};
```

## Discretion Decisions (Research Recommendations)

### 1. SSR Guard (`useIsClient()`) in ClientProviders — NOT NEEDED

**Evidence:** All 10 context providers already handle SSR safety:
- `ThemeContext`: `useState('light')` with `useEffect` to read localStorage (line 17-29)
- `LanguageContext`: `useState(() => { if (typeof window === 'undefined') return 'bilingual'; ... })` (line 40-43)
- `TTSContext`: `if (typeof window === 'undefined') return DEFAULT_SETTINGS` (line 51)
- `StateContext`: `if (typeof window === 'undefined') return null` (line 75)
- `NavigationProvider`: `if (typeof window === 'undefined') return 'mobile'` (line 106)
- `OfflineContext`, `AuthProvider`, `SocialProvider`, `SRSProvider`: All `'use client'` with effect-based initialization
- `ToastProvider`: Pure React state, no browser APIs on mount
- `ErrorBoundary`: Class component, no browser APIs

**Recommendation:** Do NOT add `useIsClient()` to ClientProviders. The providers already protect themselves. Adding it would cause an unnecessary blank frame during initial render.

### 2. Side Effects Placement — Keep in AppShell

**Evidence:**
- `useViewportHeight()` sets CSS custom properties on `document.documentElement` (line 16 of useViewportHeight.ts). This is a global side effect not tied to any provider.
- `cleanExpiredSessions()` is a fire-and-forget IndexedDB cleanup (line 192-194 of AppShell.tsx). It's app-startup behavior.

**Recommendation:** Keep both in AppShell. They are SPA lifecycle concerns, not provider concerns. When AppShell is removed in Phase 41, they move to the App Router layout's client component or a dedicated `AppLifecycle` component.

### 3. `next/head` (`<Head>`) in Refactored AppShell — Keep for Now

**Evidence:** The `<Head>` in AppShell sets `<title>` and `<meta name="description">`. In the App Router, `export const metadata` handles this. But during coexistence, Pages Router routes still need `<Head>` for their metadata.

**Recommendation:** Keep `<Head>` in AppShell's children slot. It only affects Pages Router routes. App Router routes use the metadata export. Remove `<Head>` from AppShell in Phase 41 when all routes migrate.

### 4. Myanmar Font CSS Import Strategy — Duplicate Imports

**Evidence:** `_app.tsx` imports `@fontsource/noto-sans-myanmar/{400,500,700}.css`. App Router layout needs the same fonts. Since the two routers serve different routes, each needs its own CSS imports.

**Recommendation:** Import the same three `@fontsource` CSS files in `app/layout.tsx`. This is redundant during coexistence but necessary for each router to independently have font access. The fonts are self-hosted so there's no network cost from duplication — it's just CSS declarations that won't conflict.

### 5. `<Head>` Metadata in AppShell — Keep During Coexistence

**Recommendation:** Same as point 3. Keep `<Head>` in AppShell for Pages Router routes. Remove in Phase 41.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<Head>` component for metadata | `export const metadata: Metadata` | Next.js 13.2+ | Server-side metadata, better SEO, streaming support |
| Viewport in `<meta>` tag | `export const viewport: Viewport` | Next.js 14.0+ | Separate viewport export, proper type safety |
| `getInitialProps` for nonce | `headers()` async function | Next.js 13+ | App Router async headers API |
| `_document.tsx` for HTML shell | `app/layout.tsx` Server Component | Next.js 13+ | Full React component tree in layout |
| `_app.tsx` for providers | Client component wrapper | Next.js 13+ | `'use client'` boundary for interactive providers |

**Deprecated/outdated:**
- `pages/_document.tsx`: Still functional in Pages Router, but App Router uses `app/layout.tsx`. Both coexist in Phase 40.
- `next/head`: Still functional in Pages Router, but App Router uses metadata export. Both coexist in Phase 40.

## Open Questions

1. **NavigationShell in App Router layout.tsx**
   - What we know: CONTEXT.md says "Include NavigationProvider AND NavigationShell" in ClientProviders. But NavigationShell imports `useLocation()` from react-router-dom.
   - What's unclear: If ClientProviders wraps `app/layout.tsx` children WITHOUT a router, NavigationShell will throw.
   - Recommendation: NavigationShell should NOT be in ClientProviders. It should remain in AppShell's children (inside the router wrapper). ClientProviders only includes NavigationProvider (which does NOT import react-router-dom). Phase 41 rewrites NavigationShell to use `usePathname()` from next/navigation. **This contradicts the CONTEXT decision but is technically necessary.** The CONTEXT says "Include NavigationProvider AND NavigationShell" but NavigationShell's `useLocation()` dependency makes this impossible without a router. **Resolution: Include NavigationProvider in ClientProviders, keep NavigationShell in AppShell's children where BrowserRouter exists.** In app/layout.tsx, NavigationShell is not rendered (no routes yet anyway).

2. **Theme Script CSP Hash Stability**
   - What we know: proxy.ts has `THEME_SCRIPT_HASH` that matches the inline script. Extracting to a shared constant preserves the exact same string content.
   - What's unclear: Whether whitespace differences between template literal in _document.tsx and the shared constant could change the hash.
   - Recommendation: Extract the exact string (byte-for-byte identical) from _document.tsx into themeScript.ts. Verify by checking that `npm run build` succeeds and the CSP header allows the script. The hash is of the script content, not the source file, so as long as the runtime string is identical, the hash is stable.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + jsdom + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` |
| Quick run command | `pnpm test:run` |
| Full suite command | `pnpm test:run && pnpm build` |
| Estimated runtime | ~30s tests + ~120s build |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MIGR-04 | App Router root layout serves correctly with metadata, viewport, fonts, CSS, theme script, ClientProviders | build smoke | `pnpm build` (validates layout compiles and coexists with Pages Router) | N/A — build validation |
| MIGR-04 | ClientProviders wraps providers in correct order | existing unit suite | `pnpm test:run` (existing provider-dependent tests pass) | Yes — existing test files cover provider consumers |
| MIGR-07 | Auth guard layout redirects unauthenticated users | build smoke | `pnpm build` (validates layout compiles) | No — thin wrapper, tested through existing ProtectedRoute tests and build |

### Nyquist Sampling Rate
- **Minimum sample interval:** After every committed task -> run: `pnpm test:run`
- **Full suite trigger:** Before merging final task of any plan wave: `pnpm test:run && pnpm build`
- **Phase-complete gate:** Full suite green before `/gsd:verify-work` runs
- **Estimated feedback latency per task:** ~30 seconds (test:run)

### Wave 0 Gaps (must be created before implementation)
None — existing test infrastructure covers all phase requirements through build validation and existing provider consumer tests. No new unit tests per CONTEXT.md decision. The components are thin wrappers validated by `pnpm build` and `pnpm test:run` ensuring no regressions.

## Sources

### Primary (HIGH confidence)
- Context7 `/vercel/next.js/v16.1.6` — layout.tsx structure, metadata API, viewport API, CSS imports, font loading, redirect() in client components
- Next.js 16.1.6 official docs (redirect) — https://nextjs.org/docs/app/api-reference/functions/redirect — confirmed redirect() works in client component render
- Next.js 16.1.6 type definitions — `node_modules/next/dist/lib/metadata/types/extra-types.d.ts` — confirmed `ViewportLayout.viewportFit: 'auto' | 'cover' | 'contain'`
- Next.js 16.1.6 type definitions — `node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts` — confirmed `Viewport` extends `ViewportLayout` with `themeColor` and `colorScheme`

### Secondary (MEDIUM confidence)
- Next.js generateViewport docs — https://nextjs.org/docs/app/api-reference/functions/generate-viewport — viewport configuration fields and examples
- GitHub Discussion #46542 — https://github.com/vercel/next.js/discussions/46542 — viewport-fit support confirmation

### Tertiary (LOW confidence)
None — all findings verified with primary or secondary sources.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, APIs verified in Next.js 16.1.6 type definitions
- Architecture: HIGH — patterns verified via Context7 docs and codebase analysis, provider nesting order extracted from existing AppShell.tsx
- Pitfalls: HIGH — each pitfall derived from direct code inspection or official docs verification

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable — Next.js 16 LTS, no major API changes expected)
