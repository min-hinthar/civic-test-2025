# Phase 15: Progress Hub - Research

**Researched:** 2026-02-10
**Domain:** Tabbed page consolidation, data visualization, route migration, animation
**Confidence:** HIGH

## Summary

Phase 15 consolidates three separate pages (ProgressPage, HistoryPage, SocialHubPage) into a single tabbed "My Progress" Hub at `/#/hub`. The project already has every required data hook (`useCategoryMastery`, `useStreak`, `useBadges`, `useLeaderboard`, `useSRSWidget`), all IndexedDB stores, all social components (`BadgeGrid`, `LeaderboardTable`, `StreakHeatmap`, `ShareButton`), and a mature animation system (`motion/react`, `StaggeredList`, `CategoryRing`). The work is primarily **assembly and layout** -- building a new tabbed shell, migrating existing widget code into new tab content components, adding the new Overview visualizations (readiness ring, stat cards, donut charts), and updating route redirects.

The most complex new work is: (1) the readiness ring with gradient fill and inner glow, (2) direction-aware horizontal slide tab transitions with scroll position memory, (3) glassmorphism card styling, and (4) the tab bar with spring-animated pill indicator using `layoutId`. Route changes are straightforward -- the routing is `react-router-dom` v7 with `BrowserRouter` (hash routing) and path segments are simply nested `<Route>` definitions with `useParams` or pathname matching. Push notification deep links need updating in 3 API routes.

**Primary recommendation:** Build a `HubPage` shell with 3 nested route-based tabs (`/hub/overview`, `/hub/history`, `/hub/achievements`), extract existing page content into tab components, add the new Overview widgets, and delete the old pages.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Tab Structure
- 3 tabs: **Overview**, **History**, **Achievements** (Categories merged into Overview)
- Tab labels are bilingual (English + Burmese), consistent with rest of app
- Page title: "My Progress" (header and sidebar nav label: "Hub")
- Hub tab in bottom bar shows a dot badge when user has earned a new unseen badge
- Horizontal slide animation when switching between tabs (direction-aware, matching Phase 14 page transitions)
- Spring physics for active tab indicator animation (motion/react)
- Tab bar: premium hybrid style combining underline animation, pill-shaped active state, and distinct button feel
- Tab switches push to browser history (Back button goes to previous tab)
- Each tab remembers its scroll position when switching away and back

#### History Tab
- Shows mock tests AND real interviews (not practice/study sessions)
- Separate sections: Mock Tests section on top, Interviews section below
- Entries are expandable -- tap to reveal per-question right/wrong results
- Interview detail: stage reached + per-question results (matching test detail level)
- Empty state: encouraging CTA with button to take first mock test / start first interview
- Share button on individual history entries (share result to clipboard/native share)
- Show last 20 entries + "Load more" button for additional batches

#### Achievements Tab
- Badges + Leaderboard together in one tab
- Layout: side by side on desktop (badges left, leaderboard right), stacks vertically on mobile
- Badge gallery: responsive grid -- 4 per row on desktop, 2 on mobile
- Badges grouped by category (Study, Test, Social, Streak) with section headers
- Unearned badges: greyed out with lock icon and criteria hint text
- Earned badges: show progress bars toward criteria (e.g., "3/5 tests completed for Bronze Tester")
- Empty state: welcome message + first badge hint + all badges shown greyed out (motivational full gallery)
- Leaderboard: top 5 by default, "Show more" to expand
- Badge earned reveal: pop + shimmer burst animation (scale from 0 with sparkle effect)
- Earned badge cards: subtle glow + shimmer effect (premium feel)

#### Overview Tab
- Hero: medium-sized readiness ring (circular arc, fills up) with 4 stat cards below
- Readiness ring: gradient fill (red through amber to green), percentage + bilingual motivational text inside
- Readiness ring: colored inner glow matching gradient color (red glow at low %, green glow at high %)
- 5 motivational tiers: 0-20% (Just Starting), 20-40% (Building), 40-60% (Making Progress), 60-80% (Almost There), 80-100% (Test Ready!)
- 4 stat cards: Mastery %, Streak (number + flame icon), SRS Due (count + "Review Now" button), Questions Practiced
- Stat cards are tappable: Streak -> streak history, SRS Due -> opens SRS review, Mastery % -> scrolls to categories, Questions Practiced -> Claude decides destination
- Category mastery: donut charts per top-level category (American Government, History, Integrated Civics) with progress bars per subcategory
- Donut charts: gradient-filled ring (red to green matching readiness ring spectrum)
- Subcategory progress bars: animated striped/candy-bar pattern
- Category cards: visible by default with subcategories shown, but collapsible
- Category order: fixed USCIS order (American Government, American History, Integrated Civics)
- Mastery color coding: smooth gradient spectrum from red through amber to green
- Tapping a weak subcategory navigates to study guide filtered to that subcategory
- Charts animate fill from 0 on first render
- Brand new user (0% everything): special welcome state replacing stats area with guided first steps
- Loading states: skeleton loaders (grey shimmer placeholders matching widget shapes)
- Error states: inline error + retry per widget (not full-page error)
- Page entry: stagger children animation (elements appear one by one with delay)

#### Route Redirects & Deep Links
- Route mapping: /progress -> /hub/overview, /history -> /hub/history, /social -> /hub/achievements
- Tab state via path segments: /#/hub/overview, /#/hub/history, /#/hub/achievements
- Bare /#/hub redirects to /#/hub/overview
- Old page components (ProgressPage, HistoryPage, SocialHubPage) fully deleted -- redirects at route level
- Context-aware deep links: SRS notification -> /hub/overview, test result -> /hub/history, badge earned -> /hub/achievements
- Push notification deep links: Claude audits all existing notification link targets and maps them to Hub tabs
- Invalid tab path (e.g., /hub/nonexistent) -> Claude decides fallback behavior

#### Visual Style
- Glass-morphism cards (frosted glass with backdrop-blur + translucent backgrounds) throughout Hub
- Dark mode: frosted glass dark variant with subtle border glow
- Responsive density: compact on mobile, spacious on desktop
- Animations: motion/react for all transitions, charts, and interactions
- Tab content slides horizontally with direction awareness when switching tabs

### Claude's Discretion
- Sticky vs scrolling tab bar
- Swipe gestures between tabs on mobile
- History date grouping format (Today, This Week, etc. vs flat chronological)
- Share format implementation (Web Share API vs clipboard -- pick based on PWA capabilities)
- Leaderboard refresh/caching strategy
- Data source architecture (IndexedDB vs Supabase primary -- match existing patterns)
- Refresh behavior (auto on tab switch vs pull-to-refresh)
- Service worker precaching strategy for Hub page
- Stat card layout on mobile (2x2 grid vs row)
- Chart implementation (custom SVG vs lightweight library)
- Color accent for Hub page
- Questions Practiced card tap destination
- Invalid tab URL fallback
- Recent activity section on Overview (decide if it adds value vs duplicating History)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-router-dom | ^7.0.2 | Route-based tab navigation with path segments | Already used for all routing in AppShell |
| motion/react | ^12.33.0 | Tab transitions, spring animations, layout animations, chart fills | Already used everywhere (PageTransition, StaggeredList, Card) |
| recharts | ^3.4.1 | Trend chart in history (existing) | Already used in ProgressPage and HistoryPage |
| lucide-react | ^0.475.0 | Icons for stat cards, badges, tabs | Already used everywhere |
| clsx | ^2.1.1 | Conditional class composition | Already used everywhere |
| idb-keyval | ^6.2.2 | IndexedDB persistence for all data stores | Already used for mastery, SRS, streak, interview |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-progress | ^1.1.8 | Progress bar primitives | Existing Progress component uses this |
| react-countup | ^6.5.3 | Animated number counting | Dashboard already uses this for stat animations |
| tailwindcss-animate | ^1.0.7 | CSS animation utilities | Already used for accordion etc. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom SVG donut charts | recharts PieChart | Recharts PieChart is heavy for simple rings; custom SVG matches existing CategoryRing pattern and is lighter |
| react-swipeable for tab swiping | Manual touch event handling | Not needed -- motion/react drag gestures can handle this natively |
| CSS scroll-snap for tab content | AnimatePresence for tab transitions | AnimatePresence provides direction-aware slide with exit animations; scroll-snap cannot do exit animations |

**Installation:**
No new packages needed. All required libraries are already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/
│   └── HubPage.tsx                    # Hub shell (tab bar + Outlet/content)
├── components/
│   └── hub/                           # NEW directory for Hub-specific components
│       ├── HubTabBar.tsx              # Premium tab bar with spring indicator
│       ├── HubTabContent.tsx          # AnimatePresence wrapper for tab slide
│       ├── OverviewTab.tsx            # Overview tab content (hero, stats, categories)
│       ├── HistoryTab.tsx             # History tab content (tests + interviews)
│       ├── AchievementsTab.tsx        # Achievements tab (badges + leaderboard)
│       ├── ReadinessRing.tsx          # Gradient SVG ring with inner glow
│       ├── StatCard.tsx               # Tappable stat card component
│       ├── CategoryDonut.tsx          # Gradient donut chart per category
│       ├── SubcategoryBar.tsx         # Animated striped progress bar
│       ├── GlassCard.tsx              # Glass-morphism card wrapper
│       ├── HubSkeleton.tsx            # Skeleton loaders for each tab
│       └── WelcomeState.tsx           # Brand new user welcome state
```

### Pattern 1: Route-Based Tab Navigation
**What:** Use nested `<Route>` definitions under `/hub/*` with path segments for each tab. The Hub shell reads the current path segment to determine active tab and renders content accordingly.
**When to use:** When tabs must integrate with browser history (Back button navigates between tabs).
**Why this pattern:** The app uses `BrowserRouter` with hash routing. Currently, `/hub` maps to `ProgressPage`. The decision requires path segments (`/hub/overview`, `/hub/history`, `/hub/achievements`), which means nested routes with an Outlet or conditional rendering based on pathname.

```typescript
// In AppShell.tsx Routes:
<Route path="/hub" element={<ProtectedRoute><HubPage /></ProtectedRoute>}>
  <Route index element={<Navigate to="/hub/overview" replace />} />
  <Route path="overview" element={<OverviewTab />} />
  <Route path="history" element={<HistoryTab />} />
  <Route path="achievements" element={<AchievementsTab />} />
  <Route path="*" element={<Navigate to="/hub/overview" replace />} />
</Route>
```

**IMPORTANT NOTE on react-router-dom:** The app uses `BrowserRouter` (not `HashRouter`), but the Next.js page renders at `/#/...` hash routes. The `BrowserRouter` treats the hash fragment as the full URL space. Looking at AppShell.tsx, routes like `/hub`, `/home`, `/test` are all defined as path routes within the `BrowserRouter`. Nested routes with `<Outlet>` will work perfectly here. The path `/hub/overview` in `BrowserRouter` context maps to hash URL `/#/hub/overview`.

### Pattern 2: Direction-Aware Tab Slide Animation
**What:** Wrap tab content in `AnimatePresence` with `custom` prop for slide direction. Tab index determines direction: moving to a higher-indexed tab slides left, lower slides right.
**When to use:** When switching between tabs.
**Source:** motion/react AnimatePresence `custom` prop pattern (verified via Context7).

```typescript
// Tab slide direction based on tab index
const TAB_ORDER = { overview: 0, history: 1, achievements: 2 };

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// In HubPage:
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentTab}
    custom={direction}
    variants={variants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

### Pattern 3: Spring Tab Indicator with layoutId
**What:** Use `motion.div` with `layoutId="hub-tab-indicator"` for the active tab underline/pill that smoothly animates between tabs with spring physics.
**When to use:** For the tab bar active state indicator.
**Source:** Context7 motion/react LayoutGroup + layoutId pattern.

```typescript
function HubTabBar({ tabs, activeTab }) {
  return (
    <div className="relative flex">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => navigate(tab.path)}>
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="hub-tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

### Pattern 4: Scroll Position Memory per Tab
**What:** Store scroll position in a ref map keyed by tab name. On tab exit, save `scrollY`; on tab enter, restore it.
**When to use:** Each tab should remember its scroll position when switching away and back.

```typescript
const scrollPositions = useRef<Map<string, number>>(new Map());

// Save before navigating away
const saveScroll = useCallback((tabKey: string) => {
  scrollPositions.current.set(tabKey, window.scrollY);
}, []);

// Restore after tab mount
useEffect(() => {
  const saved = scrollPositions.current.get(currentTab);
  if (saved !== undefined) {
    window.scrollTo(0, saved);
  }
}, [currentTab]);
```

### Pattern 5: Glass-morphism Card
**What:** A reusable card wrapper with frosted glass effect using backdrop-blur and translucent backgrounds.
**When to use:** All cards throughout Hub (stat cards, category cards, badge containers).

```css
/* Existing .glass-panel class can be adapted */
.glass-card {
  background: hsl(var(--color-surface) / 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid hsl(var(--color-border) / 0.4);
  border-radius: var(--radius-2xl);
}

.dark .glass-card {
  background: hsl(var(--color-surface) / 0.5);
  box-shadow: inset 0 0 0 1px hsl(0 0% 100% / 0.08);
}
```

### Pattern 6: Gradient SVG Ring (Readiness Ring)
**What:** Custom SVG circle with `linearGradient` fill for the stroke, plus inner glow using a blurred radial gradient behind the ring.
**When to use:** The readiness ring in Overview tab.

```typescript
// SVG gradient definition for ring stroke
<defs>
  <linearGradient id="readiness-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stopColor="hsl(0, 80%, 55%)" />     {/* Red */}
    <stop offset="50%" stopColor="hsl(45, 90%, 55%)" />    {/* Amber */}
    <stop offset="100%" stopColor="hsl(145, 70%, 45%)" />  {/* Green */}
  </linearGradient>
</defs>

// Inner glow: CSS box-shadow or SVG filter based on percentage
// Low % = red glow, high % = green glow
const glowColor = percentage < 40
  ? 'hsl(0, 80%, 55%)'
  : percentage < 70
    ? 'hsl(45, 90%, 55%)'
    : 'hsl(145, 70%, 45%)';
```

### Anti-Patterns to Avoid
- **setState in effects for tab derivation:** Use `useMemo` to derive active tab from `location.pathname`, not `useEffect` + `setState`. This is established codebase pattern (see HistoryPage, SocialHubPage).
- **useMemo<T>() generic syntax:** The React Compiler forbids `useMemo<Type>(() => ...)`. Use `const x: Type = useMemo(() => ...)` instead.
- **useRef for tracking previous tab:** Use the "adjust state when props change" pattern (`if (prev !== current) { setPrev(current); ... }`) instead of `useRef` for tracking previous values during render.
- **Inline transform with motion:** `motion/react` inline `transform` overrides CSS centering transforms. Use flexbox wrappers for centering instead.
- **Fetching data per tab:** Don't re-fetch data on every tab switch. Lift data fetching to the HubPage shell level and pass down via props or context.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG ring progress | Math from scratch | Extend existing `CategoryRing` component | Already has animation, strokeDasharray math, reduced motion support |
| Badge grid display | New badge layout | Existing `BadgeGrid` component (enhanced) | Already handles earned/locked states, categories, bilingual text |
| Leaderboard display | New table | Existing `LeaderboardTable` + `LeaderboardProfile` | Already has row click, profile modal, loading states |
| Streak heatmap | Custom calendar | Existing `StreakHeatmap` component | Already renders activity calendar |
| Share functionality | Custom share logic | Existing `ShareButton` + `shareScoreCard` | Already handles Web Share API > Clipboard > Download fallback |
| Skeleton loaders | Custom shimmer CSS | Existing `Skeleton`, `SkeletonCard`, `SkeletonAvatar` | Already has shimmer animation, reduced motion, multiple lines |
| Staggered entrance | Custom delays | Existing `StaggeredList`, `StaggeredItem`, `FadeIn` | Already has spring physics, configurable delay/stagger |
| Badge celebration | Custom modal | Existing `BadgeCelebration` component | Already has confetti, dismiss logic |
| Tab slide animation | CSS transitions | `AnimatePresence` with `custom` direction prop | Exit animations require AnimatePresence; CSS can't do this |

**Key insight:** ~70% of the Hub's UI content already exists in the three pages being consolidated. The primary work is reorganizing layout, not building new widgets.

## Common Pitfalls

### Pitfall 1: React Router Nested Routes with AnimatePresence
**What goes wrong:** Using `<Outlet>` with `AnimatePresence` doesn't work well because `Outlet` renders in-place without a changing `key`. AnimatePresence needs a `key` change to trigger exit/enter animations.
**Why it happens:** `<Outlet>` is a React Router portal-like mechanism that doesn't remount when the child route changes.
**How to avoid:** Instead of using `<Outlet>` inside AnimatePresence, conditionally render tab components based on the current path segment derived from `useLocation().pathname`. This gives full control over the `key` for AnimatePresence.
**Warning signs:** Tab content changes instantly without slide animation.

```typescript
// DON'T: <AnimatePresence><Outlet /></AnimatePresence>
// DO: Derive tab from pathname, render conditionally
const tab = location.pathname.split('/').pop() || 'overview';
<AnimatePresence mode="wait" custom={direction}>
  <motion.div key={tab} ...>
    {tab === 'overview' && <OverviewTab />}
    {tab === 'history' && <HistoryTab />}
    {tab === 'achievements' && <AchievementsTab />}
  </motion.div>
</AnimatePresence>
```

### Pitfall 2: Multiple Data Hooks Causing Waterfall Loads
**What goes wrong:** Each tab component calling its own hooks (`useCategoryMastery`, `useStreak`, `useBadges`, `useLeaderboard`) independently creates waterfall loading patterns and duplicate IndexedDB reads.
**Why it happens:** Hooks run on component mount; if data is fetched per-tab, switching tabs triggers new loads.
**How to avoid:** Lift shared data fetching to the HubPage shell. Call `useCategoryMastery`, `useStreak`, `useSRSWidget` once at the Hub level and pass data down as props. Tab-specific hooks (like `useLeaderboard`) can remain in their tab components.
**Warning signs:** Flickering skeleton loaders when switching between tabs.

### Pitfall 3: Scroll Position Restoration Race Condition
**What goes wrong:** Restoring scroll position before the tab content has rendered results in the scroll position not being applied (content height is 0).
**Why it happens:** React rendering is asynchronous; `window.scrollTo` fires before DOM paint.
**How to avoid:** Use `requestAnimationFrame` or a small `setTimeout(0)` after tab mount to restore scroll position. Or use `useLayoutEffect` for synchronous scroll restoration.
**Warning signs:** Tab always scrolls to top despite having saved a position.

### Pitfall 4: Badge Category Mismatch
**What goes wrong:** The CONTEXT.md badge categories (Study, Test, Social, Streak) don't match the existing `badgeDefinitions.ts` categories (streak, accuracy, coverage).
**Why it happens:** The user's vision is different from the current badge category system.
**How to avoid:** Map the existing badge categories to the user's requested groupings: streak -> Streak, accuracy -> Test, coverage -> Study. "Social" category has no badges currently. Either create placeholder badges or omit the Social section header.
**Warning signs:** Empty badge category sections, or badges appearing under wrong headers.

### Pitfall 5: Push Notification URLs Still Pointing to Old Routes
**What goes wrong:** Push notifications still navigate to old routes (`/study#review`, `/practice?category=...`, `/`) instead of Hub tabs.
**Why it happens:** The push notification API routes (`pages/api/push/`) embed URLs in the push payload, and the service worker reads `event.notification.data.url`.
**How to avoid:** Audit and update all 3 push API routes:
- `srs-reminder.ts`: Change `url: '/study#review'` -- this should stay as `/study#review` since SRS review is still on the study page, NOT on Hub
- `weak-area-nudge.ts`: Change `url: '/practice?category=...'` -- this also stays since practice is still on the practice page
- `send.ts` (general reminders): Change `url: '/'` to `url: '/home'` (since `/` now redirects to landing)
**Key finding:** After audit, the push notification URLs mostly point to pages that are NOT being consolidated into Hub. The SRS reminder goes to `/study`, weak area goes to `/practice`, and general reminder goes to `/`. The only route that needs updating is the general reminder (`/` should become `/home`). No push notifications currently point to `/progress`, `/history`, or `/social`.
**Warning signs:** Notification click opens wrong page or shows redirect spinner.

### Pitfall 6: Glass-morphism Performance on Low-End Devices
**What goes wrong:** `backdrop-filter: blur()` is GPU-intensive and causes jank on low-end mobile devices.
**Why it happens:** Backdrop blur requires compositing the entire background layer.
**How to avoid:** Use `will-change: backdrop-filter` on glass cards. Keep blur radius moderate (12-16px, not 40px). The existing `.glass-nav` uses `blur(20px)` successfully, so matching that is safe. Consider `@supports` fallback to opaque background for browsers without backdrop-filter.
**Warning signs:** Choppy scrolling on the Hub page, especially on Android.

### Pitfall 7: Existing Route `/hub` Already Maps to ProgressPage
**What goes wrong:** The current `AppShell.tsx` already has `<Route path="/hub" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />`. Simply adding nested routes will break if ProgressPage is still imported.
**Why it happens:** Phase 14 already set up `/hub` pointing to the old ProgressPage.
**How to avoid:** Replace the single `/hub` route with the new nested route structure. Delete the ProgressPage import.
**Warning signs:** Build error about duplicate routes or ProgressPage still rendering.

## Code Examples

### Existing Data Flow (verified from codebase)

#### Data hooks available at Hub level:
```typescript
// All of these exist and are ready to use:
import { useCategoryMastery } from '@/hooks/useCategoryMastery';
// Returns: { categoryMasteries, subCategoryMasteries, overallMastery, isLoading, refresh }

import { useStreak } from '@/hooks/useStreak';
// Returns: { currentStreak, longestStreak, freezesAvailable, freezesUsed, activityDates, isLoading }

import { useSRSWidget } from '@/hooks/useSRSWidget';
// Returns: { dueCount, reviewStreak, categoryBreakdown, isEmpty, isAllCaughtUp, nextDueText, isLoading }

import { useBadges } from '@/hooks/useBadges';
// Requires: BadgeCheckData | null
// Returns: { earnedBadges, lockedBadges, newlyEarnedBadge, dismissCelebration, isLoading }

import { useLeaderboard } from '@/hooks/useLeaderboard';
// Returns: { entries, userRank, isLoading, refresh }

import { useAuth } from '@/contexts/SupabaseAuthContext';
// Returns: { user } where user.testHistory contains TestSession[]

import { getInterviewHistory } from '@/lib/interview';
// Async: returns InterviewSession[]

import { getAnswerHistory } from '@/lib/mastery';
// Async: returns StoredAnswer[]
```

#### USCIS Category Structure (for donut charts):
```typescript
// 3 main categories, 7 subcategories
const USCIS_CATEGORIES = {
  'American Government': {
    name: { en: 'American Government', my: 'အမေရိကန်အစိုးရ' },
    color: 'blue',
    subCategories: [
      'Principles of American Democracy',
      'System of Government',
      'Rights and Responsibilities',
    ],
  },
  'American History': {
    name: { en: 'American History', my: 'အမေရိကန်သမိုင်း' },
    color: 'amber',
    subCategories: [
      'American History: Colonial Period and Independence',
      'American History: 1800s',
      'Recent American History and Other Important Historical Information',
    ],
  },
  'Integrated Civics': {
    name: { en: 'Integrated Civics', my: 'ပေါင်းစပ်နိုင်ငံသားပညာ' },
    color: 'emerald',
    subCategories: ['Civics: Symbols and Holidays'],
  },
};
```

#### Badge Definition Categories (for mapping):
```typescript
// Existing categories in badgeDefinitions.ts:
type BadgeCategory = 'streak' | 'accuracy' | 'coverage';

// User-requested Hub groupings:
// Study -> coverage badges (Complete Scholar, Category Champion)
// Test -> accuracy badges (Sharp Shooter, Perfect Score)
// Streak -> streak badges (Week Warrior, Fortnight Focus, Monthly Master)
// Social -> No existing badges (omit or show "Coming soon")
```

### Animated Striped Progress Bar (CSS pattern):
```css
/* Candy-bar / barber-pole striped progress bar */
.striped-bar {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.15) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0.15) 75%,
    transparent 75%,
    transparent
  );
  background-size: 1rem 1rem;
  animation: stripe-move 1s linear infinite;
}

@keyframes stripe-move {
  0% { background-position: 0 0; }
  100% { background-position: 1rem 0; }
}
```

### Hub Badge Dot (wiring existing placeholder):
```typescript
// In useNavBadges.ts, hubHasUpdate is currently hardcoded to false:
// hubHasUpdate: false,
//
// Wire it to check for unseen earned badges:
// hubHasUpdate: hasUnseenBadge,
//
// The NavBadge component already handles 'dot' type rendering.
// The NavItem already reads badges.hubHasUpdate for the dot display.
```

## Discretion Recommendations

### Sticky vs Scrolling Tab Bar
**Recommendation: Sticky.** The tab bar should be `sticky top-0` so users can always switch tabs without scrolling back to the top. This matches standard mobile app behavior (iOS/Android) and is consistent with the app's existing sticky header on SettingsPage (`sticky top-0 z-20`).

### Swipe Gestures Between Tabs
**Recommendation: Yes, implement.** motion/react's `drag` prop handles this natively. Use `drag="x"` with `onDragEnd` to detect swipe direction and navigate to adjacent tabs. Set `dragConstraints` to prevent over-dragging. This is expected mobile UX for tabbed interfaces.

### History Date Grouping Format
**Recommendation: Flat chronological with relative dates.** Show entries newest-first with relative timestamps ("Today", "Yesterday", "3 days ago", "Feb 5"). Avoid complex grouping (Today/This Week/This Month) since the "Load more" pagination makes groups confusing. The flat list is simpler and matches the existing HistoryPage approach.

### Share Format Implementation
**Recommendation: Use existing `ShareButton` + `shareScoreCard`.** The project already has a complete share flow: Web Share API (mobile) > Clipboard API (desktop) > Download (fallback). The `ShareButton` component handles everything. Just pass `ShareCardData` for each history entry.

### Leaderboard Refresh/Caching Strategy
**Recommendation: Match existing pattern.** The `useLeaderboard` hook already has a 30-second minimum refresh interval with visibility-change auto-refresh. No changes needed. For the Hub, use `limit: 5` instead of 25 for the default view.

### Data Source Architecture
**Recommendation: Match existing patterns exactly.** All data sources are already established:
- Mastery data: IndexedDB via `getAnswerHistory()` (useCategoryMastery)
- Streak data: IndexedDB via `getStreakData()` (useStreak)
- SRS data: IndexedDB via SRSContext (useSRSWidget)
- Test history: Supabase via `user.testHistory` (useAuth)
- Interview history: IndexedDB via `getInterviewHistory()`
- Badges: IndexedDB via badgeStore (useBadges)
- Leaderboard: Supabase RPC via `useLeaderboard()`

### Refresh Behavior
**Recommendation: Auto on initial load, manual refresh button.** Data loads once when Hub mounts. Add a subtle pull-to-refresh or refresh icon for manual refresh. Don't re-fetch on every tab switch (wasteful). Leaderboard already auto-refreshes on visibility change.

### Service Worker Precaching
**Recommendation: No special changes needed.** The serwist config uses `self.__SW_MANIFEST` for precaching. Since Hub is a client-rendered page within `pages/index.tsx` (SPA), the existing precache entries cover it. The only change is ensuring the Hub route doesn't trigger navigation fallback incorrectly.

### Stat Card Layout on Mobile
**Recommendation: 2x2 grid.** Four stat cards in a 2x2 grid on mobile looks balanced and keeps all stats above the fold. A single row of 4 would be too cramped on mobile. On desktop, a single row of 4 works well.

### Chart Implementation
**Recommendation: Custom SVG.** The readiness ring and category donut charts should be custom SVG, extending the existing `CategoryRing` component pattern. Recharts is overkill for simple rings and adds unnecessary bundle size. The existing `CategoryRing` already handles animated SVG circles with motion/react.

### Color Accent for Hub Page
**Recommendation: Primary blue.** Keep consistent with the app's primary color system. The readiness ring provides visual variety through its red-amber-green gradient. Adding a unique accent color would feel inconsistent.

### Questions Practiced Card Tap Destination
**Recommendation: Navigate to `/study` (Study Guide).** This is where users go to practice more questions. It's the most logical action after seeing how many questions they've practiced.

### Invalid Tab URL Fallback
**Recommendation: Redirect to `/hub/overview`.** Already handled by the catch-all route `<Route path="*" element={<Navigate to="/hub/overview" replace />} />`.

### Recent Activity Section on Overview
**Recommendation: Skip.** It would duplicate History tab content. The stat cards (Mastery %, Streak, SRS Due, Questions Practiced) already give a quick activity summary. Adding a "Recent Activity" section would make the Overview too long and reduce the incentive to visit the History tab.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hash-based tab state (#tests, #badges) | Path-segment tabs (/hub/overview, /hub/history) | Phase 15 decision | Better deep linking, cleaner URLs, browser history integration |
| 3 separate pages (ProgressPage, HistoryPage, SocialHubPage) | Single tabbed Hub page | Phase 15 decision | Reduced navigation, unified UX |
| Static category ring colors (blue/amber/emerald) | Gradient spectrum (red through amber to green) | Phase 15 decision | Mastery level instantly visible from color |
| Simple card backgrounds | Glass-morphism cards | Phase 15 decision | Premium feel, consistent with nav glass-nav style |

## Push Notification Deep Link Audit

Current push notification URL targets (from API routes):

| API Route | Current URL | Needs Hub Redirect? | Action |
|-----------|-------------|---------------------|--------|
| `pages/api/push/srs-reminder.ts` | `/study#review` | No | SRS review is still on Study page |
| `pages/api/push/weak-area-nudge.ts` | `/practice?category={cat}` | No | Practice is still on Practice page |
| `pages/api/push/send.ts` | `/` | Yes, change to `/home` | `/` is landing page for non-auth; auth users should go to `/home` |

**Conclusion:** Only 1 push notification URL needs updating. The SRS and weak-area notifications correctly target pages outside the Hub.

## Open Questions

1. **Badge progress bars for earned badges**
   - What we know: CONTEXT.md says "Earned badges: show progress bars toward criteria (e.g., '3/5 tests completed for Bronze Tester')"
   - What's unclear: The existing `BadgeCheckData` provides aggregate stats (bestTestAccuracy, totalTestsTaken, etc.) but not all individual progress values for each badge criterion. Some badges use boolean checks (accuracy >= 90), not progress fractions.
   - Recommendation: For badges that have clear numeric progress (streak days, tests taken, questions answered), show a progress bar. For boolean-threshold badges (accuracy >= 90%), show "X% / 90% needed". The `BadgeCheckData` interface has enough fields to derive progress for all 7 current badges.

2. **Badge category rename (Study, Test, Social, Streak)**
   - What we know: Existing categories are `streak`, `accuracy`, `coverage`. User wants `Study`, `Test`, `Social`, `Streak`.
   - What's unclear: Whether to modify `badgeDefinitions.ts` category field or just create a display-layer mapping.
   - Recommendation: Create a display-layer mapping in the Achievements tab. Don't modify the badge definition source data. Map: `coverage` -> "Study", `accuracy` -> "Test", `streak` -> "Streak". Show "Social" section with "Coming soon" message or hide it entirely if no badges exist.

3. **Earned badge "glow + shimmer" effect**
   - What we know: User wants earned badge cards to have "subtle glow + shimmer effect (premium feel)".
   - What's unclear: Exact visual specification.
   - Recommendation: Use a CSS animation combining a subtle box-shadow pulse (glow) with the existing `skeleton-shimmer` gradient technique adapted as a highlight sweep. Keep it subtle to avoid distraction.

## Sources

### Primary (HIGH confidence)
- **Codebase analysis** - Direct reading of all 3 source pages, AppShell routing, navigation system, all data hooks, all social/progress components, push notification API routes, CSS styles, tailwind config
- `/websites/motion_dev_react` (Context7) - AnimatePresence custom direction, layoutId for tab indicators, layout animations
- `/remix-run/react-router` (Context7) - Nested routes with path segments, useParams, Navigate redirect, Outlet pattern

### Secondary (MEDIUM confidence)
- Existing codebase patterns for glass-morphism (`glass-panel`, `glass-nav` CSS classes)
- Existing `CategoryRing` SVG implementation as base for gradient ring

### Tertiary (LOW confidence)
- None - all findings verified against codebase or official library documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already installed and used extensively in codebase
- Architecture: HIGH - Patterns derived from existing codebase conventions (routing, hooks, animation)
- Pitfalls: HIGH - Identified from actual codebase code review (React Compiler rules, routing structure, data flow)
- Discretion items: HIGH - Recommendations based on existing codebase patterns and established UX conventions

**Research date:** 2026-02-10
**Valid until:** 2026-03-10 (stable - no external dependency changes expected)
