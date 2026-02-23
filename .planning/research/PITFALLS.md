# Domain Pitfalls: Next.js 16 App Router Migration, Readiness Scoring & Content Enrichment

**Domain:** Migrating a mature 70K LOC SPA from Next.js 15 Pages Router + react-router-dom to Next.js 16 App Router with file-based routing, adding intelligent study features (readiness scoring, study plans), content enrichment, and performance optimization.
**Researched:** 2026-02-23
**Confidence:** HIGH (based on official Next.js 16 docs, Sentry/Serwist official guides, codebase analysis of 300+ source files, and verified community reports)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken builds, data loss, or extended downtime.

---

### Pitfall 1: Turbopack Default Breaks Build Due to Webpack Plugin Chain

**What goes wrong:** Next.js 16 makes Turbopack the default bundler. The current `next.config.mjs` chains three webpack plugins: `@serwist/next` (PWA), `@sentry/nextjs` (error tracking), and `@next/bundle-analyzer`. Turbopack does NOT support webpack plugins. Running `next build` without the `--webpack` flag will fail immediately with a build error about unsupported webpack configuration.

**Why it happens:** Next.js 16 silently switches the default bundler. Developers upgrade the Next.js version, run `npm run build`, and get an opaque error about webpack config being found. The `withSentryConfig(analyzer(withSerwist(nextConfig)))` chain in `next.config.mjs` is entirely webpack-plugin-based.

**Consequences:**
- Build fails in CI/CD, blocking all deployments
- Sentry source map upload stops working
- PWA service worker generation breaks
- Bundle analyzer unavailable

**Prevention:**
1. Add `--webpack` flag to the build script immediately when upgrading: `"build": "next build --webpack"`
2. Track Serwist Turbopack compatibility (currently a known blocker -- Serwist relies on webpack for SW generation)
3. Sentry SDK v10.26+ auto-detects Turbopack and adjusts, but verify source map upload still works
4. Plan Turbopack migration as a separate future task after all three plugins have Turbopack equivalents
5. Keep the `--webpack` flag until Serwist officially supports Turbopack

**Detection:** Build fails with "A webpack configuration was found" error. Test build immediately after upgrading Next.js.

**Phase:** Must address in the very first phase (Next.js 16 upgrade), before any routing migration.

**Confidence:** HIGH -- verified from official Next.js 16 upgrade docs and Serwist GitHub issues.

**Sources:**
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Sentry Turbopack Support Blog](https://blog.sentry.io/turbopack-support-next-js-sdk/)

---

### Pitfall 2: middleware.ts Renamed to proxy.ts in Next.js 16

**What goes wrong:** Next.js 16 deprecates the `middleware` filename and renames it to `proxy`. The existing `middleware.ts` that handles CSP header injection may stop working or produce deprecation warnings. The named export `middleware` is also deprecated -- it should be renamed to `proxy`. Configuration flags like `skipMiddlewareUrlNormalize` become `skipProxyUrlNormalize`.

**Why it happens:** Next.js 16 redefines the network boundary concept. The `middleware` function was running at the edge, but `proxy` runs on Node.js runtime. If the CSP middleware relied on any edge-specific APIs, it will break.

**Consequences:**
- CSP headers stop being applied to responses
- Security regression: pages served without Content-Security-Policy
- Google One Tap OAuth may break (depends on CSP script-src)
- Inline theme script in `_document.tsx` blocked without CSP hash

**Prevention:**
1. Rename `middleware.ts` to `proxy.ts` as part of the upgrade
2. Rename the export from `middleware` to `proxy`
3. The `proxy` runtime is `nodejs` (not edge) -- verify CSP generation still works
4. Test CSP headers in production preview before deploying
5. The existing `config.matcher` pattern should transfer directly

**Detection:** Check response headers in browser DevTools after upgrade. CSP header missing = broken.

**Phase:** Must address in the Next.js 16 upgrade phase, alongside the Turbopack fix.

**Confidence:** HIGH -- directly from official Next.js 16 upgrade documentation.

---

### Pitfall 3: Navigating Between Pages Router and App Router Causes Hard Navigation

**What goes wrong:** During incremental migration, routes served by the `pages/` directory and routes served by the `app/` directory are treated as separate applications. Navigation between them triggers a full page reload (hard navigation), not a smooth client-side transition. Users see a white flash, all React state is lost, all Context providers re-initialize, and `localStorage`/`IndexedDB` connections may briefly disconnect.

**Why it happens:** The Pages Router and App Router have incompatible router internals. `next/link` prefetching does not work across router boundaries. The `BrowserRouter` from react-router-dom only exists in Pages Router context and has no awareness of App Router routes.

**Consequences:**
- Users see jarring full-page reloads during the migration period
- Auth state (Supabase session) flashes as loading
- SRS deck re-initializes from IndexedDB on every cross-router navigation
- TTS engine resets (Chrome 15s workaround timers lost)
- Navigation lock state lost (user could leave mid-test)
- Celebration overlay and toast state lost
- The 12-provider hierarchy (`ErrorBoundary -> LanguageProvider -> ... -> NavigationShell`) completely remounts

**Prevention:**
1. Do NOT incrementally migrate individual routes. Migrate ALL routes in a single phase by moving the entire SPA into a single App Router layout with `'use client'` wrapper
2. The current architecture is a catch-all `pages/[[...slug]].tsx` that delegates to `AppShell.tsx` which uses `BrowserRouter`. Replace this with `app/[[...slug]]/page.tsx` that delegates to the same `AppShell.tsx` first, THEN gradually decompose individual routes
3. During the transition, keep all routes under one router boundary -- never split between pages/ and app/ simultaneously
4. Test navigation between all 15+ routes after migration to verify no hard navigations

**Detection:** Watch browser DevTools Network tab -- full document requests instead of JSON/RSC payloads indicate hard navigation.

**Phase:** This dictates the entire migration strategy. Must be planned in the routing migration phase.

**Confidence:** HIGH -- confirmed by official Next.js documentation: "When navigating between routes served by the different Next.js routers, there will be a hard navigation."

**Sources:**
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
- [Vercel: Optimizing Hard Navigations](https://vercel.com/guides/optimizing-hard-navigations)

---

### Pitfall 4: CSP Strategy Must Change from Hash-Based to Nonce-Based

**What goes wrong:** The current CSP uses hash-based allowlisting (`sha256-...`) because Pages Router on Vercel cannot forward nonce headers from middleware to `_document.tsx`. App Router eliminates `_document.tsx` entirely -- the root `layout.tsx` is a Server Component that CAN read the `x-nonce` header via `headers()`. This means the hash-based workaround is no longer needed, but switching to nonce-based CSP requires careful coordination.

**Why it happens:** The inline theme script in `_document.tsx` (which prevents FOUC by applying dark/light class before hydration) has a hardcoded SHA-256 hash in middleware. In App Router, this script moves to `app/layout.tsx`. If the script changes even by one character (whitespace, formatting), the hash breaks and the script is blocked by CSP.

**Consequences:**
- Theme FOUC (Flash of Unstyled Content) if inline script blocked
- White flash on every page load in dark mode
- Google accounts script blocked if CSP not updated
- Sentry reporting endpoint blocked if CSP connect-src not updated
- `wasm-unsafe-eval` needed for some dependencies may break

**Prevention:**
1. Phase the CSP migration carefully: first move to App Router with the SAME hash-based CSP
2. Then switch to nonce-based CSP in a separate step using the App Router's `headers()` API
3. With nonces, generate in proxy.ts (formerly middleware), pass via `x-nonce` header, read in `layout.tsx`
4. Add `'strict-dynamic'` to script-src so scripts loaded by nonced scripts are automatically trusted
5. Test ALL functionality after CSP changes: Google OAuth, Sentry, TTS, service worker, push notifications

**Detection:** Browser console shows CSP violation errors. Check "Issues" tab in Chrome DevTools.

**Phase:** CSP migration should be its own dedicated sub-phase AFTER routing migration is stable.

**Confidence:** HIGH -- verified from official Next.js CSP documentation and project's known CSP constraint documented in CLAUDE.md.

**Sources:**
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [GitHub Issue: CSP nonces only work with App Router](https://github.com/vercel/next.js/issues/61694)

---

### Pitfall 5: 12-Provider Hierarchy Must Become a Client Component Wrapper

**What goes wrong:** The current `AppShell.tsx` nests 12 React Context providers that all require client-side state (`useState`, `useEffect`, `useContext`). In App Router, `layout.tsx` is a Server Component by default. You CANNOT use `createContext`, `useState`, or any hooks in a Server Component. Attempting to nest providers directly in `layout.tsx` causes a build error.

**Why it happens:** Developers try to copy the provider tree from `_app.tsx`/`AppShell.tsx` directly into `app/layout.tsx` without adding `'use client'`. Or they add `'use client'` to `layout.tsx` itself, which defeats the entire purpose of Server Components.

**Consequences:**
- Build fails if providers used in Server Component
- If `layout.tsx` is marked `'use client'`, the entire app becomes a Client Component tree (no SSR benefits, no Server Component optimization, larger bundle)
- Provider ordering bugs if hierarchy is rearranged during migration

**Prevention:**
1. Create a separate `app/providers.tsx` with `'use client'` directive that wraps all 12 providers
2. Import `Providers` into `app/layout.tsx` (which stays as Server Component) and wrap `{children}`
3. Preserve the exact nesting order: `ErrorBoundary -> LanguageProvider -> ThemeProvider -> TTSProvider -> ToastProvider -> OfflineProvider -> AuthProvider -> SocialProvider -> SRSProvider -> StateProvider -> NavigationProvider -> NavigationShell`
4. The constraint "OfflineProvider must be inside ToastProvider" must be maintained
5. Keep `layout.tsx` as a Server Component -- only the providers wrapper is a Client Component

**Detection:** Build error about hooks in Server Component, or massive bundle size increase if layout becomes client component.

**Phase:** Must address in the routing migration phase.

**Confidence:** HIGH -- this is a universally documented pattern. Vercel's own blog confirms the providers-as-children pattern.

**Sources:**
- [Vercel Blog: Common Mistakes](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)
- [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

---

### Pitfall 6: react-router-dom Hook Replacement Touches Every Route Component

**What goes wrong:** The codebase uses `useNavigate`, `useLocation`, `useParams`, `Navigate`, `Routes`, `Route`, `BrowserRouter`, and `useSearchParams` from react-router-dom across 15+ page components, `ProtectedRoute`, `NavigationProvider`, `NavigationShell`, `PageTransition`, and `RedirectWithLoading`. Each must be replaced with Next.js equivalents (`useRouter` from `next/navigation`, `usePathname`, `useSearchParams`, `redirect`, `Link`, file-based routes).

**Why it happens:** The migration surface is large because react-router-dom is deeply integrated. The ProtectedRoute component uses `useLocation` for redirect state. The NavigationShell uses `useLocation` for active tab highlighting. `PageTransition` wraps `Routes` for animation. The `historyGuard.ts` patches `pushState`/`replaceState` for Safari compatibility.

**Consequences:**
- If any component still imports from `react-router-dom` after migration, it crashes (no `BrowserRouter` context)
- `useRouter` from `next/navigation` has a different API than both `react-router-dom` and `next/router` (no `pathname`, no `query`, separate `usePathname`/`useSearchParams` hooks)
- Navigation state passing (e.g., `Navigate to="/auth" state={{ from: location.pathname }}`) works differently in Next.js
- `location.hash` reading (used for hash-based sub-routing in HubPage) needs a custom solution

**Prevention:**
1. Create an inventory of every file importing from `react-router-dom` before starting: `grep -r "from 'react-router-dom'" src/`
2. Create adapter hooks (`useAppRouter`, `useAppPathname`) that wrap Next.js navigation hooks -- allows gradual migration
3. Replace `<Navigate to="/auth" state={{ from: pathname }} replace />` with `redirect('/auth')` in Server Components or `router.replace('/auth')` in Client Components
4. For navigation state passing, use URL search params instead of React Router's `location.state`
5. The `historyGuard.ts` Safari workaround may no longer be needed (verify) since App Router manages history differently

**Detection:** Runtime errors about missing Router context. TypeScript errors about missing imports.

**Phase:** Core routing migration phase. This is the largest single task.

**Confidence:** HIGH -- confirmed by examining `AppShell.tsx` which shows all 15+ routes and the routing integration points.

---

### Pitfall 7: Page Transition Animations Break With App Router

**What goes wrong:** The current `PageTransition` component wraps react-router-dom's `Routes` component with `AnimatePresence` from `motion/react` for enter/exit animations on route changes. In App Router, page components unmount and remount during navigation before AnimatePresence can run exit animations. Exit animations simply do not work with the standard App Router approach.

**Why it happens:** The App Router's component lifecycle differs from react-router-dom. Next.js App Router immediately unmounts the old page component on navigation, giving AnimatePresence no opportunity to animate it out. This is a known, unresolved architectural limitation documented in Next.js GitHub issue #49279.

**Consequences:**
- Exit animations disappear (pages just vanish instead of fading/sliding out)
- Enter animations may flicker or double-play
- The "FrozenRouter" workaround (using Next.js internals `LayoutRouterContext`) is fragile and breaks on version updates
- Users experience a regression from the polished transitions they currently have

**Prevention:**
1. Accept that exit animations are an unsolved problem in App Router as of 2026
2. Use `template.tsx` instead of `layout.tsx` for enter-only animations (template re-renders on every navigation)
3. Consider React 19.2's new `ViewTransition` API (available in Next.js 16) as the replacement for AnimatePresence page transitions
4. For critical animations (celebration overlays, modal exits), keep them within the same page rather than across route transitions
5. Do NOT use the FrozenRouter hack -- it depends on unstable Next.js internals

**Detection:** Compare before/after by recording page transitions. Exit animations missing = expected limitation.

**Phase:** Address during routing migration. May need to accept partial regression and iterate.

**Confidence:** HIGH -- confirmed by Next.js GitHub discussion #42658 (2000+ comments, still open) and multiple community reports.

**Sources:**
- [Next.js Discussion #42658: Animate route transitions in app directory](https://github.com/vercel/next.js/discussions/42658)
- [Next.js Issue #49279: Framer Motion shared layout animations](https://github.com/vercel/next.js/issues/49279)

---

## Moderate Pitfalls

Issues that cause bugs, delays, or significant rework but are recoverable.

---

### Pitfall 8: next/head Removed -- Metadata API Differences

**What goes wrong:** The current `AppShell.tsx` uses `import Head from 'next/head'` to set page title and meta description. In App Router, `next/head` is replaced by the `Metadata` export API or `generateMetadata` function. But these only work in Server Components -- not in Client Components.

**Why it happens:** Since the entire app is currently a Client Component tree (loaded via `dynamic(() => import('../src/AppShell'), { ssr: false })`), there is no Server Component to export metadata from. Developers try to use `next/head` inside a `'use client'` component and it either silently fails or produces hydration warnings.

**Prevention:**
1. Export `metadata` from `app/layout.tsx` (Server Component) for static metadata
2. For per-page dynamic titles, use `generateMetadata` in each `page.tsx` Server Component wrapper
3. For client-side dynamic title changes (e.g., "Test - Question 5/20"), use `document.title` directly or a lightweight `<title>` element approach
4. Remove all `import Head from 'next/head'` during migration

**Detection:** Page title shows "undefined" or default Next.js title. Meta tags missing from view-source.

**Phase:** Routing migration phase.

**Confidence:** HIGH -- standard App Router migration step documented officially.

---

### Pitfall 9: Sentry App Router Requires instrumentation-client.ts and global-error.tsx

**What goes wrong:** The current Sentry setup uses `sentry.server.config.ts`, `sentry.edge.config.ts`, and `instrumentation.ts`. App Router additionally requires `instrumentation-client.ts` for client-side initialization and `app/global-error.tsx` for catching errors in the App Router boundary. Without `global-error.tsx`, App Router errors may not be captured by Sentry.

**Why it happens:** Pages Router captures client errors through the `ErrorBoundary` in `_app.tsx`. App Router has a different error boundary architecture -- `global-error.tsx` replaces the root error boundary, and `error.tsx` files in route segments handle granular errors. The existing `ErrorBoundary` component still works for Client Component errors but misses Server Component errors.

**Prevention:**
1. Create `app/global-error.tsx` that wraps errors with `Sentry.captureException()`
2. Create `instrumentation-client.ts` (rename/move current client Sentry init)
3. Keep existing `instrumentation.ts` and `sentry.server.config.ts` -- they transfer directly
4. Add `error.tsx` files in route segments for granular error handling
5. Verify `withSentryConfig` in `next.config.mjs` still works with `--webpack` flag
6. Test that source maps upload correctly after migration

**Detection:** Sentry dashboard stops receiving client-side errors. Check "Events" count after deployment.

**Phase:** Infrastructure/tooling phase, immediately after Next.js 16 upgrade.

**Confidence:** HIGH -- verified from official Sentry Next.js manual setup documentation.

**Sources:**
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)

---

### Pitfall 10: Service Worker Path Changes for App Router

**What goes wrong:** The current Serwist configuration uses `swSrc: 'src/lib/pwa/sw.ts'` and `swDest: 'public/sw.js'`. For App Router, the recommended source is `app/sw.ts`. The manifest should move from `public/manifest.json` to `app/manifest.json` (or stay in public -- both work, but app/ enables dynamic manifests). More critically, App Router's different routing means the service worker's navigation handler must be updated to cache App Router's RSC payloads, not just HTML pages.

**Why it happens:** The service worker was configured to pre-cache Pages Router assets (HTML pages, `_next/static` chunks). App Router uses a different asset structure (RSC payloads, flight data). The offline fallback page (`/offline.html`) must also be compatible with App Router's rendering.

**Prevention:**
1. Keep `swSrc` in its current location initially -- Serwist does not strictly require `app/sw.ts`
2. Update `additionalPrecacheEntries` if the offline page structure changes
3. Test offline behavior thoroughly after migration -- navigate to each route while offline
4. The SW registration mechanism may need to change from Pages Router's automatic registration to a manual `useEffect`-based registration in a Client Component
5. Verify `@serwist/next` works with the `--webpack` build flag

**Detection:** Service worker fails to register. PWA install prompt stops appearing. Offline pages show generic browser error.

**Phase:** PWA/service worker phase, after routing migration is stable.

**Confidence:** MEDIUM -- Serwist App Router docs are less detailed than Pages Router docs. Verified that file paths differ.

**Sources:**
- [Serwist Next.js Getting Started](https://serwist.pages.dev/docs/next/getting-started)

---

### Pitfall 11: ProtectedRoute Pattern Must Change to Middleware/Server-Side Auth

**What goes wrong:** The current `ProtectedRoute` component uses react-router-dom's `useLocation` and `Navigate` to redirect unauthenticated users to `/auth`. In App Router, the recommended pattern is middleware-based auth checking (redirect before the page renders) or Server Component auth checking. Simply wrapping each page in a Client Component `ProtectedRoute` still works but misses the security and performance benefits of server-side auth.

**Why it happens:** Client-side auth guards show a loading spinner, then redirect. The user briefly sees the protected page skeleton before being redirected. Server-side auth in middleware/layout never sends the protected HTML to unauthorized users.

**Prevention:**
1. For the initial migration, keep `ProtectedRoute` as a Client Component wrapper (functional parity)
2. As a follow-up optimization, add auth checking in the `proxy.ts` (middleware) to redirect before rendering
3. Use Supabase's `@supabase/ssr` package for server-side session validation if needed
4. The current approach (client-side redirect) is not a security risk for this app since all data access is protected by Supabase RLS anyway

**Detection:** Protected pages flash loading spinner before redirect. Compare with middleware approach showing instant redirect.

**Phase:** Can be deferred to optimization phase. Current pattern works in App Router.

**Confidence:** HIGH -- well-documented pattern difference between client and server auth.

**Sources:**
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication)

---

### Pitfall 12: Readiness Score Giving False Confidence

**What goes wrong:** A readiness score that combines accuracy, SRS progress, and category coverage can make users feel ready when they are not. The USCIS civics test requires answering 6/10 questions correctly from a random selection of all 128 questions. A user who has 90% accuracy on easy categories but has never studied hard categories could get a high readiness score and fail the actual test.

**Why it happens:** Simple weighted averages over-represent categories the user has studied most. Category completion percentage (80% of questions seen) does not indicate mastery of those questions. SRS review count does not mean the user can recall under pressure. Accuracy on practice mode (unlimited time, see correct answer) does not correlate with accuracy in the actual 10-question oral interview format.

**Consequences:**
- Users study less than needed because the app says they are "85% ready"
- Users fail the actual USCIS test and blame the app
- Breaks the core value proposition: "confidently prepare for and pass the test"

**Prevention:**
1. Weight the readiness score by USCIS question selection probability (all 128 questions are equally likely)
2. Penalize categories with zero or low coverage heavily -- an unstudied category is a 0%, not "unknown"
3. Use FSRS retrievability (R) as the memory strength signal, not just review count
4. Distinguish between "seen" and "mastered" -- a question answered correctly once 3 weeks ago has low retrievability
5. Factor in mock test performance (closest proxy to real test) more heavily than practice/flashcard performance
6. Show a breakdown: "Ready in 5/7 categories, weak in: American Government, Geography" rather than a single number
7. Never show 100% readiness -- always leave room for "keep reviewing"

**Detection:** Compare readiness score predictions with actual mock test results. Large discrepancies = bad algorithm.

**Phase:** Readiness scoring feature phase.

**Confidence:** MEDIUM -- based on test prep app design principles and FSRS algorithm understanding. No single authoritative source.

---

### Pitfall 13: Study Plan Rigidity Leading to User Abandonment

**What goes wrong:** A study plan that generates a fixed schedule ("Study 15 questions per day for 8 days") breaks when the user misses a day. The plan shows "behind schedule" which creates anxiety (the opposite of the app's "anxiety-reducing" design goal). Users who fall behind stop using the app entirely.

**Why it happens:** Date-based scheduling assumes perfect adherence. Real users study irregularly -- some days 5 minutes, some days 45 minutes, some days nothing. Fixed schedules also ignore that FSRS already handles spacing -- the SRS deck already tells the user what to review.

**Consequences:**
- Users feel guilt/anxiety when behind schedule
- Contradicts the app's warm, supportive tone
- Creates a parallel scheduling system that conflicts with FSRS-based SRS reviews
- If the test date is too soon, the plan may show "impossible" which is demoralizing

**Prevention:**
1. Make the study plan adaptive, not fixed -- recalculate daily based on current state
2. Frame it positively: "Today's focus: 10 new questions + 5 reviews" not "You're 3 days behind"
3. Never show "you can't make it" -- instead show "Focus on high-priority categories"
4. The study plan should complement FSRS, not replace it: "FSRS says review these 8 cards" + "Plan suggests learning 5 new questions from American Government"
5. Allow the plan to exist without a test date -- some users study without a scheduled interview
6. Celebrate partial completion: "Great, you reviewed 8 of your 12 due cards today!"

**Detection:** User engagement drops after implementing study plans. Users disable the feature.

**Phase:** Study plan feature phase.

**Confidence:** MEDIUM -- based on education app design patterns and user psychology research.

---

### Pitfall 14: Mnemonics and Memory Aids That Confuse Instead of Help

**What goes wrong:** Auto-generated or hastily written mnemonics for civics questions can be culturally inappropriate, linguistically confusing for Burmese speakers, or factually misleading. A mnemonic like "BIG = Bill of Rights, Independence, George" means nothing to a Burmese speaker who does not share English-language cultural references.

**Why it happens:** Mnemonics that work for native English speakers rely on English wordplay, cultural references, and alphabetic patterns. Burmese is a tonal language with a completely different script and phonetic system. A mnemonic must work in BOTH languages or be language-specific.

**Consequences:**
- Burmese users learn incorrect associations
- Mnemonics add confusion rather than clarity
- Content bloat without educational value
- Users lose trust in the app's content quality

**Prevention:**
1. Create mnemonics for ENGLISH mode only initially -- Burmese mnemonics require native speaker input (known constraint BRMSE-01)
2. Focus mnemonics on commonly confused questions (e.g., "Who was the first President?" vs "Who is the Father of Our Country?" -- both George Washington)
3. Use visual/structural mnemonics rather than wordplay: "13 stripes = 13 colonies" not clever acronyms
4. Flag all mnemonics as "memory aid" not "fact" -- clearly separate from the authoritative answer
5. Allow users to hide mnemonics if they find them distracting
6. Prioritize explanations with historical context over clever mnemonics -- more universally useful

**Detection:** User feedback. A/B test with and without mnemonics if possible.

**Phase:** Content enrichment phase.

**Confidence:** MEDIUM -- based on bilingual education content design principles.

---

### Pitfall 15: Bundle Size Regression During Migration

**What goes wrong:** Moving from a single-catch-all SPA to App Router file-based routing can initially INCREASE bundle size rather than decrease it. Each route's `page.tsx` becomes a separate Server Component file, but if each one imports a `'use client'` wrapper that pulls in the entire provider tree + all page components, the client bundle may grow because Next.js creates duplicate client chunks per route.

**Why it happens:** In the current SPA, webpack tree-shakes effectively because everything is one bundle entry point. In App Router, each route is a separate entry point. If the client component boundary is too high (e.g., the entire `Providers` wrapper), each route's client chunk includes the full provider initialization code. If motion/react, recharts, ts-fsrs, and other large libraries are imported in shared providers, they appear in every route's chunk.

**Consequences:**
- First Load JS increases instead of decreasing
- Slower Time to Interactive on mobile
- Service worker pre-cache list grows (more individual chunks to cache)
- Defeats the stated goal of "bundle optimization"

**Prevention:**
1. Use `@next/bundle-analyzer` to compare before/after bundle sizes at each migration step
2. Move large libraries to dynamic imports: `const Recharts = dynamic(() => import('recharts'))` for the Hub/Charts page only
3. Split the provider tree: auth-only providers in a thin wrapper, feature providers (SRS, Social, TTS) loaded on-demand
4. Use `next/dynamic` with `{ ssr: false }` for heavy client-only components (DotLottie, Confetti, Recharts)
5. Set a bundle size budget and check it in CI
6. Use `experimental.optimizePackageImports` (already configured for lucide-react) for more packages

**Detection:** Run `ANALYZE=true npm run build` before and after migration. Compare chunk sizes.

**Phase:** Performance optimization phase, but monitor throughout migration.

**Confidence:** HIGH -- bundle size regression during App Router migration is widely reported.

---

## Minor Pitfalls

Issues that cause friction, developer confusion, or minor bugs.

---

### Pitfall 16: useRouter Import Confusion (Three Different useRouters)

**What goes wrong:** During migration, three different `useRouter` hooks exist: `react-router-dom`'s `useNavigate`/`useLocation`, `next/router`'s `useRouter` (Pages Router), and `next/navigation`'s `useRouter` (App Router). Importing the wrong one causes silent failures or runtime errors.

**Prevention:**
1. Use ESLint `no-restricted-imports` to ban `react-router-dom` and `next/router` imports after migration
2. Create a migration checklist of every file using router hooks
3. Use `next/compat/router` during the transition period if components must work in both routers
4. TypeScript will catch most wrong imports, but the API differences between `router.push('/path')` (Next.js) and `navigate('/path')` (react-router-dom) may not type-error

**Phase:** Routing migration phase.

---

### Pitfall 17: _document.tsx Theme Script Must Move to layout.tsx

**What goes wrong:** The current `_document.tsx` includes a blocking inline `<script>` that reads `localStorage` for the theme preference and applies it before React hydrates, preventing FOUC. This script uses `dangerouslySetInnerHTML`. In App Router, `_document.tsx` does not exist -- its contents move to `app/layout.tsx`.

**Prevention:**
1. Move the theme script to `app/layout.tsx` using `<script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />`
2. This works in Server Components because it is a static HTML element, not a React hook
3. Update the CSP hash if ANY whitespace or formatting in the script changes
4. The viewport meta tag, PWA manifest link, apple-touch-icon, and theme-color meta also move to layout.tsx (or use the Metadata API)
5. Font imports (`@fontsource/noto-sans-myanmar`) move to layout.tsx's CSS import

**Phase:** Routing migration phase, specifically the layout.tsx creation step.

---

### Pitfall 18: Async Request APIs in Next.js 16

**What goes wrong:** Next.js 16 removes synchronous access to `cookies()`, `headers()`, `params`, and `searchParams`. All must be `await`ed. Code that reads `searchParams.get('tab')` synchronously will fail.

**Prevention:**
1. All Server Components that read params or searchParams must be `async` functions
2. Use `const { slug } = await props.params` pattern
3. This primarily affects new App Router code, not migrated Client Components (which use `useSearchParams` hook instead)
4. Run `npx next typegen` to generate type helpers for `PageProps`, `LayoutProps`

**Phase:** Routing migration phase, when creating new page.tsx files.

**Confidence:** HIGH -- breaking change in Next.js 16, documented in upgrade guide.

---

### Pitfall 19: OneDrive Webpack Cache Corruption During Migration

**What goes wrong:** The project runs on OneDrive-synced directory. During the migration, frequent build changes cause webpack cache corruption: OneDrive locks `.next/cache/webpack/*.pack` files during sync, causing EPERM errors and cascading build failures.

**Prevention:**
1. Run `rm -rf .next` before major build steps during migration
2. Consider adding `.next/` to OneDrive's selective sync exclusion
3. Next.js 16 separates dev and build output directories (`.next/dev` vs `.next/`) which may reduce conflicts
4. Use `experimental.turbopackFileSystemCacheForDev: true` to get persistent dev caching with Turbopack (but only if using Turbopack for dev)

**Detection:** EPERM errors, missing `.nft.json` files, build-manifest.json errors.

**Phase:** Ongoing throughout migration.

**Confidence:** HIGH -- documented in project memory from prior milestones.

---

### Pitfall 20: FSRS Retrievability Misused as Binary Readiness

**What goes wrong:** FSRS provides a retrievability value R (probability of recall, 0-1) for each card. Developers may treat R > 0.9 as "mastered" and R < 0.9 as "not mastered". But R decays over time -- a card with R = 0.95 today might be R = 0.70 next week. A readiness score computed today may not reflect readiness on the actual test date.

**Prevention:**
1. When computing readiness, project each card's R forward to the test date, not today
2. Use FSRS's stability (S) value to determine if the card will likely still be remembered on test day
3. For cards never reviewed, assume R = 0 (not "unknown")
4. The ts-fsrs library provides `forgetting_curve(elapsed_days, stability)` to project future R values
5. Recalculate readiness daily as R values change

**Detection:** Readiness score shows 90% but mock test scores show 60%.

**Phase:** Readiness scoring feature phase.

**Confidence:** MEDIUM -- based on FSRS algorithm documentation. The ts-fsrs API needs verification.

**Sources:**
- [FSRS Algorithm Explanation](https://expertium.github.io/Algorithm.html)
- [FSRS GitHub Wiki](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)

---

### Pitfall 21: Dynamic Import Circular Dependencies After Route Decomposition

**What goes wrong:** When decomposing the monolithic `AppShell.tsx` into individual `app/[route]/page.tsx` files, circular dependencies can emerge. For example, `NavigationShell` imports route configs that import page components that import NavigationShell's types. Webpack resolves these gracefully in most cases, but dynamic imports + circular deps = runtime `undefined` imports.

**Prevention:**
1. Keep route configuration (nav items, route paths) in a separate constants file with zero component imports
2. Use TypeScript `import type` for type-only imports to break circular chains
3. Run `npx madge --circular src/` to detect circular dependencies before and after migration
4. Page components should never import navigation components -- navigation wraps pages via layout, not the other way around

**Phase:** Routing migration phase.

---

### Pitfall 22: React Compiler May Conflict with Existing Manual Memoization

**What goes wrong:** Next.js 16 stabilizes the React Compiler option. The project already follows strict React Compiler ESLint rules and uses manual `useMemo`/`useCallback` extensively. Enabling `reactCompiler: true` may cause double-memoization or conflict with the existing `eslint-plugin-react-hooks` compiler rules.

**Prevention:**
1. Do NOT enable `reactCompiler: true` during the migration -- it adds complexity
2. If enabling later, remove manual `useMemo`/`useCallback` where the compiler handles memoization automatically
3. The existing React Compiler ESLint rules (set-state-in-effect, refs, preserve-manual-memoization) remain relevant regardless
4. Test thoroughly -- the compiler may change re-render behavior that existing code depends on

**Phase:** Optimization phase, if pursued at all. Not required for v4.0.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Severity | Mitigation |
|-------------|---------------|----------|------------|
| Next.js 16 upgrade | Turbopack default breaks build (Pitfall 1) | CRITICAL | Add `--webpack` flag immediately |
| Next.js 16 upgrade | middleware.ts renamed to proxy.ts (Pitfall 2) | CRITICAL | Rename file + export + config flags |
| Next.js 16 upgrade | Async Request APIs (Pitfall 18) | MODERATE | Only affects new Server Component code |
| Routing migration | Hard navigation between routers (Pitfall 3) | CRITICAL | Migrate all routes at once, not incrementally |
| Routing migration | Provider hierarchy in Server Component (Pitfall 5) | CRITICAL | Separate providers.tsx client component |
| Routing migration | react-router-dom replacement scope (Pitfall 6) | CRITICAL | Inventory all imports first, use adapter hooks |
| Routing migration | Page transitions break (Pitfall 7) | MODERATE | Accept regression, use ViewTransition API |
| Routing migration | next/head removal (Pitfall 8) | MODERATE | Use Metadata API in Server Components |
| Routing migration | _document.tsx theme script (Pitfall 17) | MODERATE | Move to layout.tsx, update CSP hash |
| CSP migration | Hash-to-nonce transition (Pitfall 4) | CRITICAL | Phase separately after routing is stable |
| Sentry migration | Missing instrumentation-client.ts (Pitfall 9) | MODERATE | Create file + global-error.tsx |
| PWA migration | Service worker path changes (Pitfall 10) | MODERATE | Keep swSrc location, test offline |
| Auth migration | ProtectedRoute pattern change (Pitfall 11) | LOW | Keep client-side guards initially |
| Readiness scoring | False confidence from bad algorithm (Pitfall 12) | CRITICAL | Weight by coverage gaps + project R to test date |
| Readiness scoring | FSRS retrievability misuse (Pitfall 20) | MODERATE | Use forgetting_curve to project future R |
| Study plans | Rigid scheduling causes abandonment (Pitfall 13) | MODERATE | Adaptive daily recalculation |
| Content enrichment | Culturally inappropriate mnemonics (Pitfall 14) | MODERATE | English-only mnemonics first |
| Performance | Bundle size regression (Pitfall 15) | MODERATE | Monitor with bundle analyzer at each step |
| Build system | OneDrive cache corruption (Pitfall 19) | LOW | rm -rf .next before major builds |
| Optimization | React Compiler conflicts (Pitfall 22) | LOW | Defer to future milestone |

---

## Recommended Migration Order (Based on Pitfall Dependencies)

The pitfall analysis reveals a clear ordering constraint:

1. **Next.js 16 upgrade** (Pitfalls 1, 2, 18) -- Must happen first. Fix build tooling before changing architecture.
2. **Sentry reconfiguration** (Pitfall 9) -- Immediately after upgrade so errors are captured during migration.
3. **Routing migration** (Pitfalls 3, 5, 6, 7, 8, 17, 21) -- The big phase. All routes at once, not incremental.
4. **CSP migration** (Pitfall 4) -- Only after routing is stable. Separate phase to isolate security changes.
5. **PWA/service worker** (Pitfall 10) -- After routing works, test offline behavior.
6. **Readiness scoring & study plans** (Pitfalls 12, 13, 20) -- Independent of migration, can parallel later phases.
7. **Content enrichment** (Pitfall 14) -- Fully independent, can happen any time.
8. **Performance optimization** (Pitfalls 15, 22) -- After migration complete, optimize with data.

---

## Sources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- HIGH confidence
- [Next.js App Router Migration Guide](https://nextjs.org/docs/app/guides/migrating/app-router-migration) -- HIGH confidence
- [Next.js CSP Guide](https://nextjs.org/docs/app/guides/content-security-policy) -- HIGH confidence
- [Vercel Blog: Common Mistakes with App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) -- HIGH confidence
- [Sentry Next.js Manual Setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) -- HIGH confidence
- [Sentry Turbopack Support](https://blog.sentry.io/turbopack-support-next-js-sdk/) -- HIGH confidence
- [Serwist Next.js Docs](https://serwist.pages.dev/docs/next/getting-started) -- MEDIUM confidence
- [Next.js Discussion #42658: Route Transition Animations](https://github.com/vercel/next.js/discussions/42658) -- HIGH confidence
- [Next.js Issue #49279: Framer Motion Shared Layout](https://github.com/vercel/next.js/issues/49279) -- HIGH confidence
- [FSRS Algorithm Explanation](https://expertium.github.io/Algorithm.html) -- MEDIUM confidence
- [Next.js GitHub Issue #61694: CSP Nonces](https://github.com/vercel/next.js/issues/61694) -- HIGH confidence
- [Migrating to Next.js 16 Production Guide](https://www.amillionmonkeys.co.uk/blog/migrating-to-nextjs-16-production-guide) -- MEDIUM confidence
- [Next.js SPA Guide](https://nextjs.org/docs/app/guides/single-page-applications) -- HIGH confidence
