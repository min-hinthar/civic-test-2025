# Phase 14: Unified Navigation - Research

**Researched:** 2026-02-10
**Domain:** Navigation architecture, responsive layout, glass-morphism styling, spring animations
**Confidence:** HIGH

## Summary

Phase 14 restructures the app's navigation from two separate components (desktop top bar `AppNavigation.tsx` + mobile bottom bar `BottomTabBar.tsx`) into a unified system: a **6-tab desktop sidebar** and a **6-tab mobile bottom bar**, both with glass-morphism styling, badge indicators, spring physics animations, and test lock behavior. The phase also renames routes (`/dashboard` -> `/home`, `/progress` -> `/hub`), adds redirects for removed routes (`/history`, `/social` -> `/hub`), updates push notification deep-links, overhauls the onboarding tour to target nav items instead of dashboard widgets, and adds minimal glass headers to the landing and op-ed pages.

The current codebase has a clear separation of concerns: `AppNavigation.tsx` is a per-page embedded top nav (used on desktop at `md:` breakpoint, `hidden md:block`, z-30), while `BottomTabBar.tsx` is a global bottom bar (rendered once in `AppShell.tsx`, `md:hidden`, z-40). Both share 8 tabs + 3 utility controls (language, theme, logout). AppNavigation is imported directly in every page file (14 pages). The existing `useScrollDirection` hook handles hide-on-scroll for both surfaces. The project uses motion/react v12.33+ for spring animations, Tailwind CSS v3 with design tokens from Phase 11, and Lucide React for icons.

**Primary recommendation:** Create a unified `NavigationProvider` context that centralizes nav state (collapsed/expanded, lock status, badge counts), extract shared tab config into a single source of truth, build the new `Sidebar` component with spring animations, refactor `BottomTabBar` for 6 tabs + glass-morphism, and systematically update all page files to remove the per-page `AppNavigation` import in favor of shell-level navigation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **6 navigation tabs:** Home, Study Guide, Mock Test, Interview, Progress Hub, Settings
- **3 utility controls (inline after tabs):** Language toggle, Theme toggle, Logout
- History and Social dropped from nav (redirect to Progress Hub)
- Tab labels show **primary language only** (not bilingual) on both mobile and desktop
- Language and Theme toggles available in **both** nav bar AND Settings page (under "Appearance" section)
- Logout button stays in nav bar
- `/dashboard` renamed to `/home` (old URL redirects)
- `/progress` renamed to `/hub` (old URL redirects)
- `/history` redirects to `/hub` (with brief loading state before redirect)
- `/social` redirects to `/hub` (with brief loading state before redirect)
- `/study`, `/test`, `/interview`, `/settings` unchanged
- Push notification targets updated to new routes; hub deep-links use hash routing (e.g., `/hub#social`)
- Desktop sidebar: Left side, overlays content (no push/resize layout), ~240px expanded, icon-rail when collapsed
- Glass-morphism: Translucent with backdrop-blur, subtle vertical gradient, soft drop shadow (no border)
- Dark mode: Subtle border glow (1px white/10-20% opacity) on edges
- Header: Logo + app name at top; collapses to app icon only when collapsed
- Scroll behavior: Hides on scroll-down, shows on scroll-up (spring physics animation via motion/react)
- Collapse/expand: Both auto-collapse at breakpoints AND visible toggle button (chevron)
- Click outside: Collapses the sidebar when clicking content area
- No backdrop scrim -- sidebar floats over content with glass effect and shadow
- Tooltips on collapsed state: Show label tooltip on hover when collapsed
- Tablet tap behavior: Tapping icon in collapsed mode expands sidebar first (user taps again to navigate)
- Utility controls: Below nav items (inline, after separator)
- Nav item spacing: Spacious (gap-3, 12px)
- Expand/collapse animation: Full morph -- logo transitions between full name and icon, labels fade in/out
- Three-tier responsive: Mobile (< md/768px) bottom bar, Tablet (md-xl/768-1280px) collapsed sidebar, Desktop (xl+/1280px) expanded sidebar
- Study tab: Numeric count badge (SRS due count), orange/warning color, cap at 99+
- Progress Hub tab: Dot badge (no number), accent/blue color; priority: new achievements > streak-at-risk
- Both mobile and desktop: Badges shown on both nav surfaces
- Badge position: Dot/number on the icon
- Badge animation: Subtle scale/bounce entrance when appearing or count changes
- SW update: Settings tab shows a badge dot when app update is available
- Icons: Increased to h-6 w-6 (24px) from current h-4 w-4
- Mobile labels: Increased to text-xs (12px) from current text-[10px]
- Active state: Bold/filled icon + primary color (inactive = outline style, iOS convention)
- Hover effect (desktop): Background tint + slight scale-up (1.02)
- Nav item corners: Pill shape (rounded-full) for active/hover state
- Tap animation: Spring bounce on release (press down + bounce back with spring physics)
- Glass-morphism always enabled (no reduced-motion fallback for blur)
- Animations always play (no prefers-reduced-motion disabling)
- Desktop sidebar: Show warning indicator + all nav items grayed out/unclickable during test lock
- Mobile bottom bar: Same warning + lock treatment (consistent with desktop)
- Tapping locked item: Shake animation + toast message ("Complete or exit the test first")
- Slide transitions between tabs based on tab order (higher tab = slide left, lower tab = slide right)
- Auth -> Home: Sidebar slides in from left + page content fades in
- Home -> Auth: Sidebar slides out left + page content fades out
- Sidebar entrance uses spring physics (motion/react)
- Onboarding tour: Replace dashboard widget steps with nav tab highlights (Study, Test, Interview, Progress Hub)
- Responsive targets: Tour highlights bottom bar tabs on mobile, sidebar items on desktop
- Landing page: Add minimal glass header with logo + "Sign In" button
- OpEd page: Add minimal glass header with logo + "Back"/"Home" link
- Settings page: Language toggle and Theme toggle added under "Appearance" section

### Claude's Discretion
- Sidebar state persistence (localStorage vs reset-on-load)
- User profile/avatar in sidebar (include or omit)
- Practice page (/practice) placement (sub-section of Study or hidden route)
- Icon choices (keep current Lucide icons or swap any)
- Separator style between nav items and utility controls
- Badge update frequency (on-navigation vs periodic polling)
- Keyboard accessibility implementation (WCAG compliance level)
- Screen reader announcement strategy
- Sidebar z-index relative to modals and toasts
- Offline navigation behavior
- PWA install prompt nav behavior
- No keyboard shortcut for sidebar toggle
- Swipe gesture navigation (evaluate horizontal scroll conflicts)
- Interview page lock behavior (lock like test or leave unlocked)
- Nav badge data architecture (existing contexts vs unified hook)
- Testing/verification strategy

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.33.0 | Spring animations, AnimatePresence, layout transitions | Already used throughout; `type: 'spring'` with stiffness/damping params established pattern |
| lucide-react | ^0.475.0 | Icon system (outline + fill variants) | Already used; provides both outline and filled icon variants needed for active/inactive states |
| tailwindcss | ^3.4.17 | Responsive layout, glass-morphism utilities, design tokens | Already configured with design token CSS custom properties |
| react-router-dom | ^7.0.2 | Hash routing, Navigate for redirects, useLocation | Already used for all client-side routing |
| react-joyride | 3.0.0-7 | Onboarding tour with spotlight targeting | Already installed; supports custom targets via data-tour attributes |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | ^1.1.15 | Accessible modal primitives | Not needed for sidebar (sidebar is not a dialog) |
| clsx | ^2.1.1 | Conditional className merging | Used throughout for dynamic class composition |

### No New Dependencies Needed
The project already has everything required. Notably:
- **No Radix Tooltip installed** -- tooltips for collapsed sidebar can use native `title` attribute or a lightweight CSS-only tooltip. If richer tooltips are desired, `@radix-ui/react-tooltip` would need to be added (~3KB gzipped).
- **No useMediaQuery hook exists** -- will need a custom hook for the three-tier responsive breakpoint detection (mobile/tablet/desktop).

**Recommendation for tooltips:** Use a simple CSS-based tooltip approach (positioned `::after` pseudo-element with `aria-label` for accessibility) to avoid adding a new dependency. This matches the "no new deps" principle and the tooltip only needs to appear on hover in collapsed sidebar state.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS tooltip | @radix-ui/react-tooltip | More accessible but adds a dep; the tooltip only shows on desktop hover |
| Custom useMediaQuery | tailwindcss-responsive (plugin) | Plugin adds complexity; a 10-line hook is simpler |
| Zustand for nav state | React Context | Zustand would be overkill for single nav state; Context is project pattern |

**Installation:**
```bash
# No new packages needed. Optional:
pnpm add @radix-ui/react-tooltip
```

## Architecture Patterns

### Current Architecture (What We're Changing FROM)

```
src/
├── AppShell.tsx                           # Renders Router + BottomTabBar (global)
├── components/
│   ├── AppNavigation.tsx                  # Desktop top nav (md:block, per-page)
│   └── navigation/
│       └── BottomTabBar.tsx               # Mobile bottom bar (md:hidden, global in AppShell)
├── pages/
│   ├── Dashboard.tsx                      # <AppNavigation /> embedded
│   ├── TestPage.tsx                       # <AppNavigation locked /> embedded
│   ├── StudyGuidePage.tsx                 # <AppNavigation /> (5 instances!)
│   ├── HistoryPage.tsx                    # <AppNavigation /> embedded
│   ├── ProgressPage.tsx                   # <AppNavigation /> embedded
│   ├── InterviewPage.tsx                  # <AppNavigation locked={...} /> embedded
│   ├── PracticePage.tsx                   # <AppNavigation locked={...} /> embedded
│   ├── SocialHubPage.tsx                  # <AppNavigation /> embedded
│   ├── SettingsPage.tsx                   # NO AppNavigation (settings has own layout)
│   ├── LandingPage.tsx                    # <AppNavigation translucent /> (non-app nav)
│   ├── OpEdPage.tsx                       # <AppNavigation /> (non-app nav)
│   └── AuthPage.tsx                       # <AppNavigation translucent /> (non-app nav)
```

**Key finding:** `AppNavigation` is rendered in EVERY page individually. `BottomTabBar` is rendered once at the shell level. This asymmetry is the core architectural issue.

### Target Architecture (What We're Building)

```
src/
├── AppShell.tsx                           # Renders Router + NavigationShell (global)
├── components/
│   ├── AppNavigation.tsx                  # DELETED (replaced by Sidebar)
│   └── navigation/
│       ├── NavigationProvider.tsx          # Context: nav state, lock, badges, responsive tier
│       ├── NavigationShell.tsx             # Orchestrates Sidebar vs BottomTabBar based on breakpoint
│       ├── Sidebar.tsx                     # Desktop/tablet sidebar (md:block)
│       ├── BottomTabBar.tsx               # Mobile bottom bar (md:hidden) - refactored
│       ├── NavItem.tsx                     # Shared nav item with badge, active state, animations
│       ├── NavBadge.tsx                    # Badge dot/count component with entrance animation
│       ├── useNavBadges.ts                 # Hook aggregating SRS due count + achievement badges + SW update
│       ├── useMediaTier.ts                 # Hook: 'mobile' | 'tablet' | 'desktop' based on breakpoints
│       └── navConfig.ts                    # Single source of truth: tabs, routes, icons, order
├── pages/
│   ├── HomePage.tsx                        # Was Dashboard.tsx, no per-page nav import
│   ├── HubPage.tsx                         # Was ProgressPage.tsx, absorbs History + Social redirect targets
│   ├── TestPage.tsx                        # No per-page nav import (lock via context)
│   └── ...                                 # All pages: remove AppNavigation import
```

### Pattern 1: NavigationProvider Context

**What:** Centralized context providing nav state to all navigation components and pages.
**When to use:** Whenever any component needs nav lock status, sidebar collapsed state, or badge data.

```typescript
// Source: project pattern (matches ThemeContext, LanguageContext patterns)
interface NavigationContextValue {
  // Sidebar state
  isExpanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleSidebar: () => void;

  // Responsive tier
  tier: 'mobile' | 'tablet' | 'desktop';

  // Lock state (test/interview in progress)
  isLocked: boolean;
  lockMessage: string | null;
  setLock: (locked: boolean, message?: string) => void;

  // Scroll visibility
  navVisible: boolean;

  // Badge data
  badges: NavBadges;
}

interface NavBadges {
  studyDueCount: number;       // SRS due count for Study tab
  hubHasUpdate: boolean;       // Dot badge for Progress Hub (new achievement or streak-at-risk)
  settingsHasUpdate: boolean;  // Dot badge for Settings (SW update available)
}
```

### Pattern 2: Tab Config as Single Source of Truth

**What:** A single `navConfig.ts` file defining all tabs, their order, routes, icons, and badge keys.
**When to use:** Both Sidebar and BottomTabBar consume this; PageTransition uses tab order for slide direction.

```typescript
// Source: derived from current allTabs in BottomTabBar.tsx
import { Home, BookOpen, ClipboardCheck, Mic, BarChart3, Settings } from 'lucide-react';

export interface NavTab {
  id: string;
  href: string;
  label: string;           // Primary language only (per user decision)
  icon: LucideIcon;        // Outline variant (inactive)
  iconFilled?: LucideIcon; // Filled variant (active) - if available
  order: number;           // For slide transition direction
  badgeKey?: keyof NavBadges;
  dataTour?: string;       // For onboarding tour targeting
}

export const NAV_TABS: NavTab[] = [
  { id: 'home',      href: '/home',      label: 'Home',         icon: Home,           order: 0 },
  { id: 'study',     href: '/study',     label: 'Study Guide',  icon: BookOpen,       order: 1, badgeKey: 'studyDueCount', dataTour: 'nav-study' },
  { id: 'test',      href: '/test',      label: 'Mock Test',    icon: ClipboardCheck, order: 2, dataTour: 'nav-test' },
  { id: 'interview', href: '/interview', label: 'Interview',    icon: Mic,            order: 3, dataTour: 'nav-interview' },
  { id: 'hub',       href: '/hub',       label: 'Progress Hub', icon: BarChart3,      order: 4, badgeKey: 'hubHasUpdate', dataTour: 'nav-hub' },
  { id: 'settings',  href: '/settings',  label: 'Settings',     icon: Settings,       order: 5, badgeKey: 'settingsHasUpdate' },
];

// Tab order used by PageTransition to determine slide direction
export function getSlideDirection(from: string, to: string): 'left' | 'right' {
  const fromTab = NAV_TABS.find(t => t.href === from);
  const toTab = NAV_TABS.find(t => t.href === to);
  if (!fromTab || !toTab) return 'right'; // default for unknown routes
  return toTab.order > fromTab.order ? 'left' : 'right';
}
```

### Pattern 3: Shell-Level Navigation (No Per-Page Imports)

**What:** Move navigation rendering from individual pages to the AppShell, eliminating 14+ `<AppNavigation />` imports.
**When to use:** This is the core architectural change. Pages no longer render their own nav.

```typescript
// AppShell.tsx - navigation at shell level
<Router>
  <NavigationProvider>
    <NavigationShell>
      <PageTransition>
        <Routes>
          {/* All routes - no per-page nav */}
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          {/* ... */}
        </Routes>
      </PageTransition>
    </NavigationShell>
  </NavigationProvider>
</Router>
```

```typescript
// NavigationShell.tsx - orchestrates which nav surface to show
function NavigationShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  return (
    <>
      {!isPublicRoute && <Sidebar />}     {/* Hidden below md via CSS */}
      {children}
      {!isPublicRoute && <BottomTabBar />} {/* Hidden above md via CSS */}
    </>
  );
}
```

### Pattern 4: Glass-Morphism CSS Classes

**What:** Reusable glass-morphism classes for sidebar and bottom bar, leveraging existing design tokens.
**When to use:** Applied to sidebar container and mobile bottom bar container.

```css
/* globals.css - new glass-nav utility */
@layer components {
  .glass-nav {
    @apply bg-card/70 backdrop-blur-xl;
    /* Subtle vertical gradient */
    background-image: linear-gradient(
      to bottom,
      hsl(var(--color-surface) / 0.85),
      hsl(var(--color-surface) / 0.65)
    );
    /* Soft drop shadow (no border in light mode) */
    box-shadow: 4px 0 24px -4px hsl(var(--color-overlay) / 0.12);
  }

  .dark .glass-nav {
    /* Dark mode: subtle border glow */
    box-shadow:
      4px 0 24px -4px hsl(var(--color-overlay) / 0.3),
      inset 0 0 0 1px hsl(0 0% 100% / 0.12);
  }
}
```

### Pattern 5: Sidebar Spring Animation

**What:** Sidebar expand/collapse using motion/react spring transitions, matching project patterns.
**When to use:** Sidebar width transitions, label fade in/out, logo morph.

```typescript
// Source: existing project pattern (Dialog.tsx, StaggeredList.tsx)
import { motion, AnimatePresence } from 'motion/react';

const sidebarSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 24,
};

// Sidebar container animates width
<motion.aside
  animate={{ width: isExpanded ? 240 : 64 }}
  transition={sidebarSpring}
  className="glass-nav fixed left-0 top-0 bottom-0 z-40 flex flex-col"
>
  {/* Labels fade in/out with AnimatePresence */}
  <AnimatePresence>
    {isExpanded && (
      <motion.span
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ duration: 0.15 }}
      >
        {tab.label}
      </motion.span>
    )}
  </AnimatePresence>
</motion.aside>
```

### Pattern 6: Route Redirects with Loading State

**What:** Old routes show a brief loading spinner then redirect to new routes.
**When to use:** For `/dashboard` -> `/home`, `/progress` -> `/hub`, `/history` -> `/hub`, `/social` -> `/hub`.

```typescript
// Redirect component with brief loading state
function RedirectWithLoading({ to }: { to: string }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      <Navigate to={to} replace />
    </div>
  );
}

// In Routes:
<Route path="/dashboard" element={<Navigate to="/home" replace />} />
<Route path="/progress" element={<Navigate to="/hub" replace />} />
<Route path="/history" element={<RedirectWithLoading to="/hub#history" />} />
<Route path="/social" element={<RedirectWithLoading to="/hub#social" />} />
```

### Anti-Patterns to Avoid
- **Per-page nav imports:** The current pattern of importing `AppNavigation` in every page creates 14+ maintenance points. Move to shell-level rendering.
- **Duplicated tab arrays:** Currently `allTabs` is defined in both `BottomTabBar.tsx` and `AppNavigation.tsx`. Extract to single config.
- **setState in effects for responsive state:** Use `useSyncExternalStore` or `useState` with `matchMedia` listener in `useEffect` cleanup pattern (project already does this in `useIsClient`).
- **CSS transitions for sidebar width:** Use motion/react springs, not CSS `transition: width`. CSS transitions cause jank with layout reflow; motion/react uses transforms internally.
- **Inline styles overriding Tailwind centering:** Known project pitfall -- use flexbox wrapper for centered elements instead of `transform: translateX(-50%)` which conflicts with motion/react.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive breakpoint detection | Manual `window.innerWidth` checks | `window.matchMedia` with listener pattern | Proper SSR-safe, debounced, avoids layout thrashing |
| Spring animations | CSS `transition` for sidebar | `motion/react` spring with stiffness/damping | CSS transitions can't do spring overshoot; motion/react is already the project standard |
| Scroll direction detection | New scroll handler | Existing `useScrollDirection` hook | Already battle-tested in the project, uses rAF throttling |
| Badge entrance animation | Manual CSS keyframes | `motion/react` `animate` with `key` prop | Consistent with project animation patterns, spring physics |
| Click outside detection | Manual document click listener | Simple `useEffect` with event delegation | Small utility, but follow established patterns (check target contains) |
| Route redirects | Custom redirect logic | `react-router-dom` `<Navigate replace />` | Standard pattern, handles history correctly |
| Tooltip on hover | Custom tooltip component | CSS `::after` pseudo-element with `[data-tooltip]` | Lightweight, no JS overhead, sufficient for icon-rail hover labels |

**Key insight:** This phase is primarily about *reorganizing existing functionality* (nav tabs, scroll-hide, lock behavior, badges) into a new layout structure. Very little is net-new capability -- it's refactoring the navigation architecture and adding the sidebar as a new surface.

## Common Pitfalls

### Pitfall 1: AppNavigation Removal Breaks Page Layout
**What goes wrong:** Removing per-page `<AppNavigation />` changes scroll behavior and layout padding. Pages that relied on AppNavigation's `sticky top-0` for layout spacing will shift.
**Why it happens:** AppNavigation currently occupies ~64px at the top of each page. Removing it changes the scroll context.
**How to avoid:** The sidebar overlays content (per user decision), so pages should NOT need top padding for nav. But verify that `page-shell` padding-top still works correctly. The existing `--safe-area-top` handles PWA safe areas.
**Warning signs:** Content appears under the top of the viewport after removing AppNavigation.

### Pitfall 2: z-index Conflicts Between Sidebar and Modals
**What goes wrong:** Sidebar (z-40) overlaps modals (z-50), toasts (z-9999), or the onboarding tour (z-1000).
**Why it happens:** Multiple overlay surfaces compete for z-index layers.
**How to avoid:** Use the established z-index hierarchy:
- z-30: (was AppNavigation, now unused)
- z-40: Sidebar + BottomTabBar (navigation layer)
- z-50: Modals, dialogs, install prompts
- z-[9999]: Toast notifications
- z-[1000]: Onboarding tour spotlight
**Warning signs:** Sidebar appears above modal backdrops or toast messages.

### Pitfall 3: React Compiler Violations in Navigation Context
**What goes wrong:** ESLint errors from `react-hooks/set-state-in-effect` when setting sidebar state based on matchMedia changes.
**Why it happens:** The React Compiler ESLint rules prohibit `setState` directly in effect bodies.
**How to avoid:** Use the established project pattern: `useState` with `useEffect` that adds/removes `matchMedia` listeners. The matchMedia callback (which calls setState) runs outside the effect body -- it's an event handler, which is allowed.
**Warning signs:** ESLint errors during development; CI lint failures.

### Pitfall 4: Scroll-Hide Conflicts Between Sidebar and Content
**What goes wrong:** The sidebar uses `useScrollDirection` to hide/show, but the sidebar itself is a fixed overlay. If the sidebar scrolls independently (many nav items), the scroll direction detection triggers incorrectly.
**Why it happens:** `useScrollDirection` listens to `window.scrollY`, which is the page scroll, not sidebar scroll. But user scrolling inside the sidebar could be confused with page scroll.
**How to avoid:** The sidebar has only 6 tabs + 3 controls, which fits without scrolling. No inner scroll needed. The `useScrollDirection` hook uses `window.scrollY` which correctly tracks page scroll only.
**Warning signs:** Sidebar hides/shows unexpectedly when interacting with sidebar content.

### Pitfall 5: Route Rename Breaks External Links and Bookmarks
**What goes wrong:** Users with bookmarks to `/dashboard`, `/progress`, `/history`, `/social` get 404 or catch-all redirect to `/`.
**Why it happens:** Route renaming without redirect handling.
**How to avoid:** Keep old routes as `<Navigate to="/new-path" replace />` entries in the Routes config. The catch-all `<Route path="*" element={<Navigate to="/" replace />} />` must remain LAST.
**Warning signs:** Old bookmarks stop working; analytics show 404s on old routes.

### Pitfall 6: Push Notification Deep-Links Use Old Routes
**What goes wrong:** Clicking a push notification navigates to `/study#review` (which is fine, `/study` is unchanged) but any future notifications targeting `/progress` or `/dashboard` would break.
**Why it happens:** The service worker's `notificationclick` handler uses `e.notification.data.url` which comes from the push payload.
**How to avoid:** Update `formatSRSReminderNotification()` in `pushNotifications.ts` and the `sw.js` notification click handler to use new routes. Currently only `/study#review` is used, which is unchanged -- but verify no other notification payloads reference old routes.
**Warning signs:** Push notification taps navigate to wrong page or catch-all.

### Pitfall 7: CSP Hash Changes When Adding Inline Scripts
**What goes wrong:** Adding new inline scripts (e.g., for sidebar state persistence) breaks CSP.
**Why it happens:** The project uses hash-based CSP. Any new inline script needs its hash added to the CSP header.
**How to avoid:** Avoid new inline scripts. Use `localStorage` reads in React components (client-side) rather than `<script>` tags. If a blocking script is absolutely needed for sidebar FOUC prevention, add its hash to the CSP configuration.
**Warning signs:** CSP violations in browser console; scripts fail silently.

### Pitfall 8: BottomTabBar --bottom-tab-height CSS Variable
**What goes wrong:** The `page-shell` class uses `--bottom-tab-height: 64px` for bottom padding on mobile. If the bottom bar height changes, pages clip behind it.
**Why it happens:** The CSS variable is set at `@media (max-width: 767px)` and the page-shell uses it for padding-bottom.
**How to avoid:** If the bottom bar height changes (e.g., larger icons make it taller), update the `--bottom-tab-height` variable. Similarly, for desktop sidebar, no equivalent variable is needed since the sidebar overlays content (doesn't push it).
**Warning signs:** Content hidden behind bottom bar; scroll doesn't reach bottom content.

### Pitfall 9: Onboarding Tour Targets Change
**What goes wrong:** Tour steps targeting `[data-tour="study-action"]` etc. break because those dashboard widget targets no longer exist in the tour flow.
**Why it happens:** The tour is being rewritten to target nav items instead of dashboard widgets.
**How to avoid:** Add `data-tour` attributes to nav items in both Sidebar and BottomTabBar. Use responsive targeting: the tour should detect which nav surface is visible and target accordingly. The `[data-tour="nav-study"]` attribute on both surfaces means Joyride will find whichever is visible.
**Warning signs:** Tour spotlights appear in wrong position or on invisible elements.

### Pitfall 10: motion/react `animate` Prop on Sidebar Width Causes Layout Thrash
**What goes wrong:** Animating `width` directly causes continuous layout recalculation during the spring animation.
**Why it happens:** Width is a layout-triggering CSS property. motion/react doesn't automatically optimize width into transforms.
**How to avoid:** Two approaches: (1) Animate width anyway -- for 6 nav items, the reflow cost is minimal and spring animations are brief (~300ms). (2) Use a fixed-width container with `overflow: hidden` and animate `maxWidth` or `translateX`. Approach 1 is recommended for simplicity since the sidebar content is lightweight.
**Warning signs:** Janky animation on low-end devices, visible content reflow.

## Code Examples

### useMediaTier Hook (New, Needed)

```typescript
// Source: pattern derived from project's useIsClient + matchMedia
import { useState, useEffect } from 'react';

type MediaTier = 'mobile' | 'tablet' | 'desktop';

/**
 * Returns the current responsive tier based on viewport width.
 * - mobile: < 768px (Tailwind md)
 * - tablet: 768px - 1279px (Tailwind md to xl)
 * - desktop: >= 1280px (Tailwind xl)
 */
export function useMediaTier(): MediaTier {
  const [tier, setTier] = useState<MediaTier>(() => {
    if (typeof window === 'undefined') return 'mobile';
    const w = window.innerWidth;
    if (w >= 1280) return 'desktop';
    if (w >= 768) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    const mqTablet = window.matchMedia('(min-width: 768px)');
    const mqDesktop = window.matchMedia('(min-width: 1280px)');

    const update = () => {
      if (mqDesktop.matches) setTier('desktop');
      else if (mqTablet.matches) setTier('tablet');
      else setTier('mobile');
    };

    mqTablet.addEventListener('change', update);
    mqDesktop.addEventListener('change', update);
    return () => {
      mqTablet.removeEventListener('change', update);
      mqDesktop.removeEventListener('change', update);
    };
  }, []);

  return tier;
}
```

### NavBadge Component

```typescript
// Source: pattern from existing badge in AppNavigation.tsx (line 162)
import { motion, AnimatePresence } from 'motion/react';

interface NavBadgeProps {
  type: 'count' | 'dot';
  count?: number;
  color?: 'warning' | 'primary';
}

export function NavBadge({ type, count = 0, color = 'warning' }: NavBadgeProps) {
  const show = type === 'dot' ? true : count > 0;
  const colorClass = color === 'warning'
    ? 'bg-warning text-warning-foreground'
    : 'bg-primary text-primary-foreground';

  return (
    <AnimatePresence>
      {show && (
        <motion.span
          key={type === 'count' ? count : 'dot'}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full ${colorClass} ${
            type === 'dot'
              ? 'h-2.5 w-2.5'
              : 'min-w-[18px] h-[18px] px-1 text-[10px] font-bold'
          }`}
        >
          {type === 'count' && (count > 99 ? '99+' : count)}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
```

### Sidebar Scroll-Hide with Spring

```typescript
// Source: derived from existing useScrollDirection + motion/react spring pattern
const scrollSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

// In Sidebar component:
<motion.aside
  animate={{
    x: navVisible ? 0 : -240,  // Slide off-screen left
  }}
  transition={scrollSpring}
  className="glass-nav fixed left-0 top-0 bottom-0 z-40"
>
```

### Click-Outside to Collapse Sidebar

```typescript
// Source: standard React pattern
useEffect(() => {
  if (!isExpanded || tier === 'desktop') return; // Don't auto-collapse on desktop

  const handleClick = (e: MouseEvent) => {
    const sidebar = sidebarRef.current;
    if (sidebar && !sidebar.contains(e.target as Node)) {
      setExpanded(false);
    }
  };

  document.addEventListener('mousedown', handleClick);
  return () => document.removeEventListener('mousedown', handleClick);
}, [isExpanded, tier]);
```

### Lock Behavior with Shake Animation

```typescript
// Source: motion/react whileTap + custom shake variant
const shakeVariant = {
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.4 },
  },
};

// In locked nav item:
<motion.div
  variants={shakeVariant}
  animate={isShaking ? 'shake' : undefined}
  onClick={() => {
    if (isLocked) {
      setIsShaking(true);
      showWarning({ en: 'Complete or exit the test first', my: '...' });
      setTimeout(() => setIsShaking(false), 500);
    }
  }}
/>
```

### Directional Page Transition

```typescript
// Enhanced PageTransition that uses tab order for slide direction
import { getSlideDirection } from '@/components/navigation/navConfig';

export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  const direction = useMemo(() => {
    const dir = getSlideDirection(prevPathRef.current, location.pathname);
    prevPathRef.current = location.pathname;
    return dir;
  }, [location.pathname]);

  const variants = {
    initial: { opacity: 0, x: direction === 'left' ? 30 : -30 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: direction === 'left' ? -30 : 30 },
  };
  // ... rest of AnimatePresence wrapper
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-page nav imports | Shell-level nav rendering | Phase 14 | Eliminates 14+ import points, single source of truth |
| 8 tabs (crowded) | 6 tabs + redirect consolidation | Phase 14 | Cleaner nav, History/Social absorbed into Hub |
| Top horizontal nav on desktop | Left sidebar on desktop | Phase 14 | Better use of widescreen space, modern app pattern |
| Separate AppNavigation + BottomTabBar | Unified NavigationProvider | Phase 14 | Shared state, consistent lock behavior |
| CSS transitions for nav hide/show | Spring physics via motion/react | Phase 14 | More natural, bouncy feel |
| Dashboard widget targets for onboarding | Nav item targets for onboarding | Phase 14 | Tour teaches navigation, not page layout |

**Deprecated/outdated (after Phase 14):**
- `AppNavigation.tsx`: Fully replaced by Sidebar component
- `/dashboard` route: Redirects to `/home`
- `/progress` route: Redirects to `/hub`
- `/history` route: Redirects to `/hub`
- `/social` route: Redirects to `/hub`
- `allTabs` array in BottomTabBar.tsx: Replaced by centralized `navConfig.ts`
- `navLinks` array in AppNavigation.tsx: Deleted with component

## Codebase Impact Analysis

### Files to Create (New)
| File | Purpose |
|------|---------|
| `src/components/navigation/NavigationProvider.tsx` | Context for nav state, lock, badges |
| `src/components/navigation/NavigationShell.tsx` | Orchestrates Sidebar vs BottomTabBar |
| `src/components/navigation/Sidebar.tsx` | Desktop/tablet sidebar component |
| `src/components/navigation/NavItem.tsx` | Shared nav item with badge + animation |
| `src/components/navigation/NavBadge.tsx` | Badge dot/count with entrance animation |
| `src/components/navigation/useNavBadges.ts` | Aggregated badge data hook |
| `src/components/navigation/useMediaTier.ts` | Responsive tier detection hook |
| `src/components/navigation/navConfig.ts` | Centralized tab configuration |
| `src/components/navigation/GlassHeader.tsx` | Minimal header for landing/op-ed pages |
| `src/pages/HomePage.tsx` | Renamed from Dashboard.tsx |
| `src/pages/HubPage.tsx` | Renamed from ProgressPage.tsx (absorbs History/Social) |

### Files to Modify (Significant)
| File | Changes |
|------|---------|
| `src/AppShell.tsx` | Remove BottomTabBar import, add NavigationProvider + NavigationShell, update routes |
| `src/components/navigation/BottomTabBar.tsx` | Refactor to 6 tabs, glass-morphism, badges, spring animations |
| `src/components/animations/PageTransition.tsx` | Direction-aware slide based on tab order |
| `src/components/onboarding/OnboardingTour.tsx` | Replace dashboard widget steps with nav item targets |
| `src/pages/TestPage.tsx` | Remove AppNavigation, use NavigationProvider lock |
| `src/pages/InterviewPage.tsx` | Remove AppNavigation, use NavigationProvider lock |
| `src/pages/PracticePage.tsx` | Remove AppNavigation, use NavigationProvider lock |
| `src/pages/StudyGuidePage.tsx` | Remove 5 AppNavigation instances |
| `src/pages/SettingsPage.tsx` | Remove AppNavigation, add Appearance section with toggles |
| `src/pages/LandingPage.tsx` | Replace AppNavigation with GlassHeader |
| `src/pages/OpEdPage.tsx` | Replace AppNavigation with GlassHeader |
| `src/pages/AuthPage.tsx` | Remove AppNavigation (no nav on auth pages) |
| `src/pages/HistoryPage.tsx` | Delete or convert to redirect |
| `src/pages/SocialHubPage.tsx` | Delete or convert to redirect |
| `src/styles/globals.css` | Add glass-nav CSS, update --bottom-tab-height, add sidebar CSS variables |
| `src/lib/i18n/strings.ts` | Add new nav labels (Progress Hub), remove old ones |
| `src/lib/pwa/pushNotifications.ts` | Update notification URLs |

### Files to Delete
| File | Reason |
|------|--------|
| `src/components/AppNavigation.tsx` | Replaced by Sidebar |
| `src/pages/HistoryPage.tsx` | History absorbed into HubPage (redirects) |
| `src/pages/SocialHubPage.tsx` | Social absorbed into HubPage (redirects) |

**Total impact:** ~11 new files, ~17 modified files, ~3 deleted files

### Key Dependency Chain
1. `navConfig.ts` must be created first (everything depends on it)
2. `useMediaTier.ts` and `useNavBadges.ts` are prerequisites for NavigationProvider
3. NavigationProvider must exist before Sidebar and refactored BottomTabBar
4. Route renames must happen alongside page renames
5. AppNavigation removal from pages must happen after shell-level nav is working
6. Onboarding tour update should be last (depends on new nav items being rendered)

## Open Questions

1. **Sidebar State Persistence (Claude's Discretion)**
   - What we know: User can manually expand/collapse sidebar via toggle button. Auto-collapse on tablet, auto-expand on desktop.
   - What's unclear: Should manual collapse preference persist across sessions?
   - Recommendation: **Persist to localStorage** under key `sidebar-expanded`. Default to auto (based on tier). If user manually collapses on desktop, remember that. Reset on tier change.

2. **User Profile/Avatar in Sidebar (Claude's Discretion)**
   - What we know: No user avatar system exists in the app. Auth context provides `user.email` only.
   - What's unclear: Whether to show user email or initials in sidebar header.
   - Recommendation: **Omit for now.** Adding avatar/profile is a separate feature. The sidebar header should be app logo only, matching the context's decision.

3. **Practice Page Placement (Claude's Discretion)**
   - What we know: `/practice` is a hidden route (not in current nav tabs). It's accessed from Study Guide page.
   - What's unclear: Should it appear in nav or remain a sub-route of Study?
   - Recommendation: **Keep as hidden route.** Practice is accessed from within Study Guide, not from nav. Add redirect if needed.

4. **Interview Lock Behavior (Claude's Discretion)**
   - What we know: Test page locks navigation. Interview page currently locks navigation during active session.
   - What's unclear: Whether to keep interview lock behavior.
   - Recommendation: **Keep interview lock consistent with test lock.** The InterviewPage already passes `locked` prop. Migrate to context-based lock.

5. **Badge Update Frequency (Claude's Discretion)**
   - What we know: SRS `dueCount` updates on visibility change events. Badge data (achievements) loads from IndexedDB.
   - What's unclear: How often to refresh badge indicators.
   - Recommendation: **Update on navigation (route change) + visibility change.** No polling needed. SRS context already updates on visibility; achievements update on page visit.

6. **HubPage Tab Structure**
   - What we know: ProgressPage shows category mastery. HistoryPage has 3 tabs (tests/practice/interview). SocialHubPage has 3 tabs (leaderboard/badges/streak). All need to merge into HubPage.
   - What's unclear: How to organize sub-tabs when 3 pages merge into one.
   - Recommendation: Use hash routing (`/hub#progress`, `/hub#history`, `/hub#social`) with 3 top-level tabs in HubPage. Deep-links from redirects and push notifications use hash fragments.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis of all navigation-related files
- `src/components/AppNavigation.tsx` - current desktop nav implementation
- `src/components/navigation/BottomTabBar.tsx` - current mobile nav implementation
- `src/AppShell.tsx` - shell architecture and provider hierarchy
- `src/components/onboarding/OnboardingTour.tsx` - current tour step targets
- `src/styles/tokens.css` - design token system from Phase 11
- `src/styles/globals.css` - layout variables, page-shell class, glass-panel
- `tailwind.config.js` - theme extension and design token mapping

### Secondary (MEDIUM confidence)
- [Motion spring documentation](https://motion.dev/docs/react-animation#spring) - spring animation API parameters
- [Motion useSpring](https://motion.dev/docs/react-use-spring) - spring hook API reference
- Existing project patterns for spring animations in Dialog.tsx, StaggeredList.tsx, LanguageToggle.tsx

### Tertiary (LOW confidence)
- None. All findings are directly from codebase analysis.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, versions confirmed from package.json
- Architecture: HIGH - based on direct codebase analysis of current navigation patterns
- Pitfalls: HIGH - derived from known project-specific issues (React Compiler, CSP, z-index hierarchy)
- Code examples: MEDIUM - patterns derived from existing code, not copy-pasted from docs

**Research date:** 2026-02-10
**Valid until:** 2026-03-10 (stable -- no upstream library changes expected to affect this work)
