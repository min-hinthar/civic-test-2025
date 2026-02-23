# Architecture Research: Next.js 16 App Router Migration, Readiness Scoring, Content Enrichment

**Domain:** Bilingual Civics Test Prep PWA -- v4.0 Next-Gen Architecture
**Researched:** 2026-02-23
**Confidence:** HIGH (Next.js 16 official docs, Sentry/Serwist official docs, codebase analysis of 300+ source files)

---

## Executive Summary

The v4.0 milestone has four pillars: (1) Next.js 16 App Router migration replacing react-router-dom, (2) test readiness scoring synthesizing existing progress data, (3) content enrichment with mnemonics and deeper explanations, and (4) performance optimization. The migration is the highest-risk, highest-reward change -- it replaces the entire routing and navigation layer while preserving the offline-first PWA behavior, 12-deep provider hierarchy, and 70K+ LOC of client-side logic.

**Critical architectural insight:** This app is fundamentally a client-side SPA that happens to be served by Next.js. The current architecture uses Next.js purely as a shell (`pages/[[...slug]].tsx` -> dynamically imported `AppShell.tsx` with SSR disabled). The migration to App Router does NOT mean converting to server-rendered pages. Instead, it means replacing react-router-dom hash routes with Next.js file-based routes while keeping every page as a Client Component. The App Router's SPA guide explicitly supports this pattern.

**What changes:**
- `pages/` directory -> `app/` directory with file-based routes
- react-router-dom (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useLocation`) -> Next.js navigation (`next/link`, `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`)
- `pages/_document.tsx` + `pages/_app.tsx` -> `app/layout.tsx` (root layout)
- `middleware.ts` -> `proxy.ts` (Next.js 16 rename)
- CSP hash-based -> CSP nonce-based (App Router supports nonce forwarding that Pages Router could not)
- `next/head` in components -> `metadata` exports in layouts/pages

**What stays the same:**
- All 12 context providers (same hierarchy, same logic, same hooks)
- IndexedDB stores (10 stores, unchanged)
- Supabase auth + sync (unchanged)
- Service worker (@serwist/next, relocate sw.ts source)
- Sentry integration (update config file pattern)
- All components, hooks, utilities (unchanged internal logic)
- motion/react animations, Tailwind CSS, design tokens (unchanged)

**What's new (not migration):**
- Readiness score engine (pure function consuming existing data)
- Test date countdown (new UI component + localStorage persistence)
- Smart weak-area drill (new mode using existing mastery data)
- Mnemonics/memory aids (new content data per question)
- Deeper explanations with historical context (content enrichment)
- Study tips per category (new content data)
- Bundle optimization (dynamic imports, code splitting)

---

## Part 1: Next.js 16 App Router Migration Architecture

### 1.1 Current Architecture (Before)

```
pages/
  _app.tsx           -- CSS imports only, passes Component/pageProps through
  _document.tsx      -- <Html>, <Head> with theme script, viewport, PWA meta
  _error.tsx         -- Error page
  [[...slug]].tsx    -- Catch-all: dynamically imports AppShell with ssr:false
  op-ed.tsx          -- Static page (SSR)

middleware.ts        -- CSP headers with hash-based script allowlisting

src/AppShell.tsx     -- THE app: BrowserRouter -> 12 providers -> NavigationShell -> Routes
  - Defines all routes via react-router-dom <Route> elements
  - All pages are Client Components
  - Hash routing (#/home, #/test, etc.)

src/pages/           -- "Pages" that are actually SPA route components
  Dashboard.tsx      -- /home
  TestPage.tsx       -- /test
  StudyGuidePage.tsx -- /study
  PracticePage.tsx   -- /practice
  InterviewPage.tsx  -- /interview
  HubPage.tsx        -- /hub/*
  SettingsPage.tsx   -- /settings
  AuthPage.tsx       -- /auth
  LandingPage.tsx    -- /
  ...8 more
```

**Key characteristics:**
- Next.js is just a static shell; ALL routing is client-side
- react-router-dom v7 with BrowserRouter (hash routing)
- `useNavigate()`, `useLocation()`, `Navigate` component throughout
- ProtectedRoute wraps routes requiring auth
- NavigationShell provides sidebar/bottom nav chrome
- PageTransition wraps route content for enter/exit animations
- CelebrationOverlay, PWAOnboardingFlow, OnboardingTour, GreetingFlow sit outside routes

### 1.2 Target Architecture (After)

```
app/
  layout.tsx         -- Root layout: <html>, <body>, global CSS, fonts, PWA meta
                        Metadata export replaces next/head
                        Wraps children in ClientProviders component
  page.tsx           -- Landing page (/ route)
  global-error.tsx   -- Sentry error boundary (App Router convention)
  not-found.tsx      -- 404 page
  manifest.json      -- PWA manifest (moved from public/)
  sw.ts              -- Service worker source (Serwist App Router convention)

  (auth)/
    auth/page.tsx           -- /auth
    auth/forgot/page.tsx    -- /auth/forgot
    auth/update-password/page.tsx -- /auth/update-password

  (public)/
    op-ed/page.tsx          -- /op-ed
    about/page.tsx          -- /about

  (protected)/
    layout.tsx              -- ProtectedLayout: auth guard wrapper
    home/page.tsx           -- /home (Dashboard)
    test/page.tsx           -- /test
    study/page.tsx          -- /study
    practice/page.tsx       -- /practice
    interview/page.tsx      -- /interview
    hub/
      layout.tsx            -- Hub layout (shared tab bar)
      page.tsx              -- /hub (redirects to /hub/overview)
      overview/page.tsx     -- /hub/overview
      categories/page.tsx   -- /hub/categories
      history/page.tsx      -- /hub/history
      achievements/page.tsx -- /hub/achievements
    settings/page.tsx       -- /settings

proxy.ts             -- CSP with nonce-based allowlisting (renamed from middleware.ts)
instrumentation.ts   -- Sentry server/edge registration
instrumentation-client.ts -- Sentry client init
```

### 1.3 Route Group Strategy

Three route groups organize the `app/` directory without affecting URL paths:

| Group | Purpose | Layout Behavior |
|-------|---------|-----------------|
| `(public)` | No auth required, no navigation shell | Minimal layout |
| `(auth)` | Auth pages (login, reset) | No navigation shell |
| `(protected)` | All authenticated routes | Auth guard + NavigationShell |

The `(protected)/layout.tsx` replaces the current `ProtectedRoute` component by wrapping all protected children in an auth check. This is a Client Component layout:

```tsx
// app/(protected)/layout.tsx
'use client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { redirect } from 'next/navigation';
import { NavigationShell } from '@/components/navigation/NavigationShell';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!user) redirect('/auth');

  return <NavigationShell>{children}</NavigationShell>;
}
```

### 1.4 Provider Tree Migration

The 12-provider hierarchy moves from `AppShell.tsx` into a dedicated `ClientProviders` component imported by the root layout:

```tsx
// app/layout.tsx (Server Component)
import { ClientProviders } from '@/components/ClientProviders';
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/500.css';
import '@fontsource/noto-sans-myanmar/700.css';
import '@/styles/globals.css';

export const metadata = {
  title: 'Civic Test Prep - Master Your U.S. Citizenship Test',
  description: 'Bilingual English-Burmese civic test preparation...',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
```

```tsx
// src/components/ClientProviders.tsx
'use client';

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
import { CelebrationOverlay } from '@/components/celebrations';
// ... other global overlays

export function ClientProviders({ children }: { children: React.ReactNode }) {
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
                          {children}
                          <CelebrationOverlay />
                          <PWAOnboardingFlow />
                          <OnboardingTour />
                          <SyncStatusIndicator />
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

**Key change:** `<Router>` (BrowserRouter from react-router-dom) is REMOVED. The Next.js App Router handles routing natively. The `NavigationProvider` no longer needs to be inside a `<Router>` -- it switches from `useLocation()` (react-router) to `usePathname()` (next/navigation).

**Provider ordering preserved:** The nesting order constraint (OfflineProvider inside ToastProvider, TTSProvider wrapping TTS consumers, etc.) is maintained exactly.

**GreetingFlow:** Moves to `(protected)/layout.tsx` since it depends on `useAuth()` and only shows for authenticated users.

### 1.5 Navigation Hook Migration Map

Every component using react-router-dom hooks needs updating:

| react-router-dom | next/navigation | Files Affected |
|------------------|-----------------|----------------|
| `useNavigate()` | `useRouter().push()` | Dashboard, TestPage, PracticePage, InterviewPage, StudyGuidePage, HubPage, NBAHeroCard, many more |
| `useLocation()` | `usePathname()` + `useSearchParams()` | ProtectedRoute, NavigationShell, PageTransition, HubPage |
| `useParams()` | `useParams()` (from next/navigation) | None currently (no dynamic params in use) |
| `<Navigate to="..." replace />` | `redirect()` or `<Link>` | AppShell redirects, ProtectedRoute |
| `<Link to="...">` | `<Link href="...">` (next/link) | Any react-router Link usage |

**Estimated scope:** ~40-60 files need `useNavigate` -> `useRouter` changes. Each is mechanical: `navigate('/path')` -> `router.push('/path')`.

**Hash routing elimination:** Current routes use `#/home`, `#/test`, etc. The App Router uses real paths `/home`, `/test`. Since the app already uses path-based routes within react-router (not actual hash fragments for state), the URLs simply lose the `#` prefix. This is transparent to users and improves SEO.

### 1.6 PageTransition and AnimatePresence

The current `PageTransition.tsx` uses react-router-dom's `useLocation()` as the `key` for `AnimatePresence`. In App Router:

```tsx
// Updated PageTransition.tsx
'use client';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

**Caveat:** App Router layouts persist across navigations (they don't unmount). The `PageTransition` wrapper should live in the `(protected)/layout.tsx` wrapping `{children}`, or within individual page components if per-page transitions are needed. AnimatePresence with App Router requires the `template.tsx` convention for per-page animation boundaries.

**Recommendation:** Use `app/(protected)/template.tsx` instead of `layout.tsx` for the page transition wrapper. The `template.tsx` file creates a new instance for each navigation, which is exactly what AnimatePresence needs.

### 1.7 CSP Migration: Hash-Based to Nonce-Based

**Current (Pages Router limitation):**
- `middleware.ts` sets CSP with `sha256` hash for the inline theme script
- Hash approach required because Pages Router cannot forward nonce from middleware to `_document.tsx`

**After (App Router advantage):**
- `proxy.ts` (renamed from middleware.ts per Next.js 16) generates per-request nonce
- Nonce set in `x-nonce` header, read by `app/layout.tsx` via `headers()` API
- Next.js automatically applies nonce to framework scripts
- Theme script moves from inline `_document.tsx` to a `<Script>` component with nonce

```tsx
// proxy.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://accounts.google.com https://tiptopjar.com${isDev ? " 'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com;
    img-src 'self' blob: data:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://*.ingest.us.sentry.io https://accounts.google.com https://tiptopjar.com${isDev ? ' ws://localhost:3000' : ''};
    media-src 'self' blob:;
    worker-src 'self' blob:;
    frame-src https://accounts.google.com https://tiptopjar.com;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|offline.html|audio).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

**Theme script handling:** The inline theme script in `_document.tsx` that prevents FOUC must be preserved. In App Router, use a `<Script>` component with `strategy="beforeInteractive"` and the nonce prop in `app/layout.tsx`.

**Important:** Nonce-based CSP requires dynamic rendering. Since this app is already fully client-rendered (no static generation in use), this is not a regression. The pages were never statically generated anyway.

### 1.8 Sentry Integration Migration

**Current (Pages Router):**
- `@sentry/nextjs` wraps next.config.mjs via `withSentryConfig`
- `pages/_error.tsx` for error handling
- Client-side ErrorBoundary component

**After (App Router):**
- `withSentryConfig` remains in next.config (unchanged)
- NEW: `instrumentation.ts` in project root for server/edge Sentry init
- NEW: `instrumentation-client.ts` for client-side Sentry init
- NEW: `app/global-error.tsx` replaces `pages/_error.tsx`
- Existing `ErrorBoundary` component remains for component-level error catching

```tsx
// instrumentation.ts
import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
```

```tsx
// app/global-error.tsx
'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
```

### 1.9 Service Worker Migration (@serwist/next)

**Current:**
- `swSrc: 'src/lib/pwa/sw.ts'`
- `swDest: 'public/sw.js'`
- Disabled in development

**After (App Router convention):**
- `swSrc: 'app/sw.ts'` (App Router location)
- `swDest: 'public/sw.js'` (unchanged)
- Service worker code itself is unchanged (Serwist caching strategies, push handlers, etc.)
- Offline fallback page may need updating from `offline.html` to an App Router page

**Turbopack consideration:** Next.js 16 makes Turbopack the default bundler. The current config uses `@sentry/nextjs` with `withSentryConfig` which adds webpack configuration. The build must use `--webpack` flag OR verify that `@sentry/nextjs` v10.26+ supports Turbopack. Since Sentry's `withSentryConfig` likely still uses webpack internals, plan to use `next build --webpack` initially and migrate to Turbopack later.

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack",
    "start": "next start"
  }
}
```

### 1.10 _document.tsx Migration

The current `_document.tsx` handles:
1. Inline theme script (FOUC prevention)
2. Viewport meta tag
3. PWA manifest link
4. Theme color meta
5. Apple PWA meta tags

All of these move to `app/layout.tsx`:

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import Script from 'next/script';
import { ClientProviders } from '@/components/ClientProviders';

// Fonts
import '@fontsource/noto-sans-myanmar/400.css';
import '@fontsource/noto-sans-myanmar/500.css';
import '@fontsource/noto-sans-myanmar/700.css';
import '@/styles/globals.css';

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

const THEME_SCRIPT = `
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
```

### 1.11 Navigation Lock Migration

The current navigation lock prevents users from leaving test/interview sessions. It works via:
1. `NavigationProvider.setLock(true, message)` sets lock state
2. `NavigationShell` checks lock before allowing tab switches
3. `window.history` manipulation with `popstate` listener
4. Safari history guard (`src/lib/historyGuard.ts`)

In App Router, the navigation lock pattern changes:
- `router.push()` from `next/navigation` replaces `navigate()` from react-router
- The `beforePopState` callback is NOT available in App Router
- Use `window.addEventListener('popstate', handler)` directly (already done)
- The history guard (`installHistoryGuard`) still works since it patches `window.history` directly
- `onbeforeunload` for preventing tab close during tests remains unchanged

**No architectural change needed** for navigation locks -- the current implementation already works at the `window.history` level, not the router level.

---

## Part 2: Readiness Score and Smart Drill Architecture

### 2.1 Data Sources Already Available

The readiness scoring system consumes data that ALREADY EXISTS in the codebase:

| Data Source | Location | Access Pattern |
|-------------|----------|----------------|
| Category mastery (7 categories) | IndexedDB `civic-prep-mastery` | `getAnswerHistory()` -> `calculateCategoryMastery()` |
| Sub-category mastery | Same as above | `useCategoryMastery()` hook |
| Overall mastery % | Derived from above | `calculateOverallMastery()` |
| SRS deck (due cards, intervals) | IndexedDB `srs-store` | `useSRS()` context |
| Test history (scores, dates) | Supabase `user.testHistory` | `useAuth()` context |
| Interview history | IndexedDB `interview-history` | `getInterviewHistory()` |
| Study streak | IndexedDB `streak-store` | `useStreak()` hook |
| Unique questions practiced | IndexedDB (derived from mastery) | `getAnswerHistory()` |
| Bookmarks | IndexedDB `civic-prep-bookmarks` | Dedicated store |

The existing `useNextBestAction` hook already aggregates 6 of these sources. The readiness score is a natural extension.

### 2.2 Readiness Score Engine

**Architecture:** Pure function, no side effects, testable in isolation.

```typescript
// src/lib/readiness/readinessEngine.ts

export interface ReadinessInput {
  // Category mastery (0-100 per category)
  categoryMasteries: Record<string, number>;
  // Overall mastery (0-100)
  overallMastery: number;
  // SRS metrics
  srsDeckSize: number;
  srsDueCount: number;
  // Test performance
  testHistory: Array<{ date: string; score: number; totalQuestions: number }>;
  // Interview performance
  interviewHistory: Array<{ date: string; passed: boolean }>;
  // Coverage
  uniqueQuestionsPracticed: number;
  totalQuestions: number;
  // Activity
  currentStreak: number;
  // Optional: target test date
  targetDate?: string;
}

export interface ReadinessScore {
  /** Overall readiness 0-100 */
  overall: number;
  /** Per-dimension breakdown */
  dimensions: {
    knowledge: number;      // Based on mastery + coverage
    retention: number;      // Based on SRS health
    testPerformance: number; // Based on mock test scores
    interviewReady: number;  // Based on interview pass rate
    consistency: number;     // Based on streak + recency
  };
  /** Human-readable assessment */
  level: 'not-started' | 'beginning' | 'developing' | 'proficient' | 'test-ready';
  /** Weakest dimension (drives recommendation) */
  weakestDimension: keyof ReadinessScore['dimensions'];
  /** If targetDate set: daily study target */
  dailyTarget?: {
    questionsPerDay: number;
    reviewsPerDay: number;
    estimatedMinutes: number;
  };
}

export function calculateReadiness(input: ReadinessInput): ReadinessScore {
  // Pure computation -- weights TBD during implementation
  // Knowledge: 35% weight (mastery + coverage)
  // Retention: 20% weight (SRS due ratio, deck health)
  // Test performance: 25% weight (recent mock test accuracy)
  // Interview: 10% weight (interview pass rate)
  // Consistency: 10% weight (streak, recency of activity)
}
```

### 2.3 Readiness Score Hook

```typescript
// src/hooks/useReadinessScore.ts
// Composition hook that aggregates existing hooks + readiness engine

export function useReadinessScore(): {
  score: ReadinessScore | null;
  isLoading: boolean;
} {
  // Reuses: useStreak, useSRSWidget, useCategoryMastery, useAuth
  // Plus: getInterviewHistory, getAnswerHistory (IndexedDB async)
  // Pattern: same as useNextBestAction -- waits for all sources, derives via useMemo
}
```

### 2.4 Test Date Countdown

New component + localStorage persistence:

```typescript
// src/lib/readiness/testDateStore.ts
// Simple localStorage get/set for target test date

// src/components/readiness/TestDateCountdown.tsx
// Displays days remaining, daily study target from readiness engine
// Settings page integration for date picker
```

### 2.5 Smart Weak-Area Drill

Uses existing mastery data to generate focused practice sessions:

```typescript
// src/lib/readiness/weakAreaDrill.ts

export interface DrillSession {
  questions: Question[];
  focusCategory: string;
  reason: string; // "Your American Government mastery is 42% -- focus here"
}

export function generateWeakAreaDrill(
  categoryMasteries: Record<string, number>,
  allQuestions: Question[],
  sessionSize: number = 10
): DrillSession {
  // 1. Find weakest category
  // 2. Within that category, find least-practiced questions
  // 3. Mix in some review questions from other weak areas
  // 4. Return ordered drill session
}
```

**Integration point:** The existing `PracticePage.tsx` gains a new "Smart Drill" mode option alongside the current category selection. The drill mode calls `generateWeakAreaDrill()` instead of random/category selection.

---

## Part 3: Content Enrichment Architecture

### 3.1 Current Question Data Structure

```typescript
// src/types/index.ts (current)
export interface Question {
  id: string;
  question: string;
  questionBurmese: string;
  answers: string[];
  answersBurmese: string[];
  category: string;
  subCategory: string;
  explanation?: {
    text: string;
    textBurmese: string;
  };
}
```

### 3.2 Enriched Question Data Structure

```typescript
// Extended (backward compatible -- all new fields optional)
export interface Question {
  // ... existing fields unchanged ...

  /** Memory aid / mnemonic for this question */
  mnemonic?: {
    text: string;
    textBurmese: string;
    type: 'acronym' | 'association' | 'story' | 'visual' | 'rhyme';
  };

  /** Historical context beyond the basic explanation */
  historicalContext?: {
    text: string;
    textBurmese: string;
  };

  /** Difficulty tier (1-3, derived from community data) */
  difficulty?: 1 | 2 | 3;

  /** Related question IDs for cross-referencing */
  relatedQuestions?: string[];
}

// Per-category study tips (new file)
// src/constants/studyTips.ts
export interface CategoryStudyTip {
  category: string;
  tips: Array<{
    text: string;
    textBurmese: string;
  }>;
  commonMistakes: Array<{
    text: string;
    textBurmese: string;
  }>;
}
```

**Data location:** Enrichment data lives alongside existing question files in `src/constants/questions/`. New fields are added to existing objects -- no new files needed per question. Category-level study tips go in a new `src/constants/studyTips.ts`.

**Bundle impact:** Minimal. The enrichment adds ~200 bytes per question (128 questions = ~25KB uncompressed, ~5KB gzipped). This is well within budget for a PWA that already caches all question data.

### 3.3 Content Display Integration

New UI surfaces for enriched content:

| Feature | Location | Component |
|---------|----------|-----------|
| Mnemonic badge | ExplanationCard, StudyGuidePage | `MnemonicBadge` (new) |
| Historical context | ExplanationCard expand section | `HistoricalContext` (new) |
| Study tips | StudyGuidePage category header | `CategoryTips` (new) |
| Related questions | ExplanationCard footer | `RelatedQuestions` (exists, extend) |
| Difficulty indicator | Question cards, Study Guide | `DifficultyBadge` (new) |

All new components are leaf components -- no provider changes, no new contexts.

---

## Part 4: Performance Optimization Architecture

### 4.1 Bundle Optimization with App Router

The App Router automatically code-splits per route. Moving from a single catch-all `[[...slug]].tsx` (which bundles ALL pages into one chunk) to individual `page.tsx` files means each page only loads its own code.

**Current bundle problem:** Because `AppShell.tsx` imports ALL page components directly, the initial bundle includes every page even if the user only visits the dashboard.

**After migration:** Each `app/(protected)/test/page.tsx` only loads `TestPage` code. Navigation prefetches other pages in the background.

**Estimated improvement:** The app currently ships ~300KB+ of JS to the client on first load. With per-route code splitting, the initial load drops to ~150KB (framework + providers + current page). Other pages load on navigation or prefetch.

### 4.2 Dynamic Imports for Heavy Components

Components that are only used on specific pages should use `next/dynamic`:

| Component | Current Import | Dynamic? | Reason |
|-----------|----------------|----------|--------|
| Recharts (charts) | Direct in HubPage | YES | ~80KB, only used on /hub |
| DotLottie | Direct in celebrations | YES | ~40KB, only on celebrations |
| react-canvas-confetti | Direct in celebrations | YES | ~20KB, only on celebrations |
| react-joyride | Direct in onboarding | Already dynamic | Only first visit |
| react-countdown-circle-timer | Direct in TestPage | YES | ~10KB, only during tests |

### 4.3 Service Worker Caching Enhancements

The existing service worker already handles:
- Precaching of static assets
- CacheFirst for audio files (90-day expiry)
- Offline fallback page

Post-migration, add route-specific caching:
- Runtime caching for API responses (Supabase sync)
- Background sync for offline queue (already exists)
- Navigation preload (already enabled)

---

## Part 5: Component Boundaries and Data Flow

### 5.1 New vs Modified Components

**New components (created from scratch):**

| Component | Purpose | Dependencies |
|-----------|---------|-------------|
| `ClientProviders` | Wraps all context providers (extracted from AppShell) | All existing providers |
| `ReadinessRing` (exists, extend) | Visual readiness score display | readinessEngine |
| `TestDateCountdown` | Days-to-test countdown with daily targets | readinessEngine, localStorage |
| `SmartDrillSetup` | UI for starting weak-area drill | weakAreaDrill, useCategoryMastery |
| `MnemonicBadge` | Displays memory aid for a question | Question data |
| `HistoricalContext` | Expandable historical context section | Question data |
| `CategoryTips` | Study tips for a category header | studyTips data |
| `DifficultyBadge` | Visual difficulty indicator (1-3 stars) | Question data |
| `app/global-error.tsx` | App Router error boundary | Sentry |
| `app/(protected)/template.tsx` | Page transition wrapper | motion/react |

**Modified components (existing, updated):**

| Component | Change |
|-----------|--------|
| `NavigationProvider` | `useLocation()` -> `usePathname()` |
| `NavigationShell` | `useLocation()` -> `usePathname()` |
| `PageTransition` | `useLocation()` -> `usePathname()`, move to template.tsx |
| `ProtectedRoute` | Becomes `(protected)/layout.tsx` |
| `Dashboard` | `useNavigate()` -> `useRouter()` |
| `TestPage` | `useNavigate()` -> `useRouter()` |
| `PracticePage` | `useNavigate()` -> `useRouter()`, add Smart Drill mode |
| `InterviewPage` | `useNavigate()` -> `useRouter()` |
| `StudyGuidePage` | `useNavigate()` -> `useRouter()`, add study tips |
| `HubPage` | `useNavigate()` -> `useRouter()`, sub-routes become file-based |
| `ExplanationCard` | Add mnemonic + historical context sections |
| `NBAHeroCard` | `useNavigate()` -> `useRouter()` |
| All 40+ files using `useNavigate` | Mechanical migration |

**Deleted components/files:**

| File | Reason |
|------|--------|
| `pages/[[...slug]].tsx` | Replaced by `app/` directory |
| `pages/_app.tsx` | Replaced by `app/layout.tsx` |
| `pages/_document.tsx` | Replaced by `app/layout.tsx` |
| `pages/_error.tsx` | Replaced by `app/global-error.tsx` |
| `pages/op-ed.tsx` | Replaced by `app/(public)/op-ed/page.tsx` |
| `src/AppShell.tsx` | Decomposed into `ClientProviders` + route groups |
| `middleware.ts` | Renamed to `proxy.ts` |

### 5.2 Data Flow Diagram

```
                      app/layout.tsx (Server Component)
                           |
                           | reads nonce from headers()
                           | exports metadata
                           |
                    ClientProviders (Client Component)
                    /          |          \
              ErrorBoundary  Language  Theme  TTS  Toast  Offline  Auth  Social  SRS  State  Navigation
                                                                    |
                                                              Route Groups
                                                           /        |         \
                                                     (public)  (auth)  (protected)
                                                                        |
                                                                  ProtectedLayout
                                                                  (auth guard)
                                                                  NavigationShell
                                                                  template.tsx (PageTransition)
                                                                        |
                                                                   Page Components
                                                                   /     |     \
                                                                home   test   study ...
                                                                 |
                                                           Dashboard
                                                           /    |    \
                                                   useNBA  useSRS  useMastery
                                                      |
                                                  useReadinessScore (NEW)
                                                      |
                                                  readinessEngine (NEW pure fn)
```

---

## Part 6: Migration Strategy and Build Order

### Phase Ordering Rationale

The migration must be sequenced carefully because:
1. App Router migration touches EVERY page -- it's the foundation
2. Feature additions (readiness, content) must target the NEW routing structure
3. Performance optimization comes last (measure after migration)

### Recommended Build Order

**Phase 1: App Router Foundation**
1. Create `app/layout.tsx` (root layout with metadata, fonts, CSP nonce)
2. Create `ClientProviders.tsx` (extract provider tree from AppShell)
3. Create `proxy.ts` (rename middleware.ts, add nonce generation)
4. Create route group directories `(public)`, `(auth)`, `(protected)`
5. Create `(protected)/layout.tsx` (auth guard)
6. Verify: app boots with empty pages, providers work, CSP nonce flows

**Phase 2: Route Migration (Page by Page)**
1. Migrate landing page (/) -- simplest, no auth
2. Migrate auth pages (/auth, /auth/forgot, /auth/update-password)
3. Migrate public pages (/op-ed, /about)
4. Migrate dashboard (/home) -- first protected route
5. Migrate test page (/test)
6. Migrate study guide (/study)
7. Migrate practice (/practice)
8. Migrate interview (/interview)
9. Migrate hub (/hub/*) with nested layout
10. Migrate settings (/settings)
11. Set up redirects for old routes
12. Delete `pages/` directory, `AppShell.tsx`, react-router-dom dependency

**Phase 3: Sentry + Service Worker Update**
1. Create `instrumentation.ts`, `instrumentation-client.ts`
2. Create `app/global-error.tsx`
3. Move service worker source to `app/sw.ts`
4. Verify error tracking, offline functionality, push notifications

**Phase 4: Readiness Score + Smart Drill**
1. Build `readinessEngine.ts` (pure function + tests)
2. Build `useReadinessScore` hook
3. Build ReadinessRing dashboard component
4. Build TestDateCountdown component
5. Build `weakAreaDrill.ts` (pure function + tests)
6. Integrate SmartDrillSetup into PracticePage

**Phase 5: Content Enrichment**
1. Add mnemonic data to question files
2. Add historical context data
3. Add difficulty ratings
4. Add study tips per category
5. Build UI components (MnemonicBadge, HistoricalContext, CategoryTips, DifficultyBadge)
6. Integrate into ExplanationCard and StudyGuidePage

**Phase 6: Performance + Polish**
1. Audit bundle sizes post-migration
2. Add dynamic imports for heavy components
3. Fix known gaps (DotLottie assets, dark mode QA)
4. Test offline functionality end-to-end
5. Verify all 188 existing requirements still pass

---

## Part 7: Scalability Considerations

| Concern | Current (v3.0) | After v4.0 |
|---------|----------------|------------|
| Routing | Single bundle, all pages loaded | Per-route code splitting, lazy loading |
| CSP | Hash-based (static, per-deploy) | Nonce-based (per-request, more secure) |
| Error handling | Client ErrorBoundary only | Client + Server + Global error boundaries |
| Bundle size | ~300KB+ initial JS | ~150KB initial + lazy routes |
| Navigation | Hash-based URLs | Clean URLs, better SEO/sharing |
| Page transitions | react-router AnimatePresence | Next.js template.tsx + AnimatePresence |
| Metadata | `next/head` in components | Static metadata exports (better crawling) |

---

## Sources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Official, updated 2026-02-20 (HIGH confidence)
- [Next.js SPA Guide](https://nextjs.org/docs/app/guides/single-page-applications) -- Official, updated 2026-02-20 (HIGH confidence)
- [Next.js Pages to App Router Migration](https://nextjs.org/docs/app/guides/migrating/app-router-migration) -- Official, updated 2026-02-20 (HIGH confidence)
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) -- Official, updated 2026-02-20 (HIGH confidence)
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) -- Official (HIGH confidence)
- [@serwist/next Getting Started](https://serwist.pages.dev/docs/next/getting-started) -- Official (HIGH confidence)
- [Serwist + Next.js 16 PWA Icons](https://aurorascharff.no/posts/dynamically-generating-pwa-app-icons-nextjs-16-serwist/) -- Third-party, 2025 (MEDIUM confidence)
- Codebase analysis of `src/AppShell.tsx`, `pages/`, `middleware.ts`, all context providers (HIGH confidence)
