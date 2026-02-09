# Architecture Research: v2.0 Feature Integration

**Domain:** Bilingual Civics Test Prep PWA -- v2.0 feature integration into existing Next.js + React Router DOM SPA
**Researched:** 2026-02-09
**Confidence:** HIGH (based on direct codebase analysis; all recommendations verified against existing source)

## Executive Summary

The v2.0 milestone introduces seven epics (A-G) that touch navigation, dashboard, page consolidation, design system, i18n, question bank, and security. The existing architecture (189 files, ~37.5K LOC) is well-structured with clear provider hierarchy, consistent patterns, and offline-first data layer. The v2.0 changes are primarily **reshuffling and refining** existing code, not building net-new infrastructure.

The riskiest integration is **Progress Hub consolidation** (merging 3 pages into 1 with tabs), which touches routing, navigation, and deep links. The safest starting point is **design token alignment** (Epic D), which has no functional dependencies and reduces visual variance before layout changes. The USCIS question bank expansion (Epic F) is structurally simple (data file + constant updates) but has the widest blast radius since `totalQuestions` flows through mastery calculations, badge thresholds, readiness scores, and UI copy.

**Key architectural principle:** No new Context providers needed. No new IndexedDB stores. No Supabase schema changes (except push subscription hardening). This is a **UI/UX layer milestone**, not an infrastructure milestone.

---

## Current Architecture (As-Built v1.0)

### Provider Hierarchy (AppShell.tsx)

```
ErrorBoundary
  LanguageProvider         <-- bilingual/english-only toggle
    ThemeProvider           <-- dark/light mode
      ToastProvider         <-- bilingual toast notifications
        OfflineProvider     <-- online/offline detection, sync queue
          AuthProvider      <-- Supabase auth, user state, testHistory
            SocialProvider  <-- social profile, opt-in, streak sync
              SRSProvider   <-- FSRS deck, due count, grade/add/remove
                Router (BrowserRouter)
                  <Head>
                  ErrorBoundary
                    PageTransition
                      <Routes> ... 13 routes
                  PWAOnboardingFlow
                  OnboardingTour
                  SyncStatusIndicator
                  BottomTabBar
```

### Route Map

| Route | Page Component | Protected | Navigation |
|-------|---------------|-----------|------------|
| `/` | LandingPage | No | Hidden from nav |
| `/auth` | AuthPage | No | Hidden from nav |
| `/auth/forgot` | PasswordResetPage | No | Hidden from nav |
| `/auth/update-password` | PasswordUpdatePage | No | Hidden from nav |
| `/op-ed` | OpEdPage | No | Hidden from nav |
| `/dashboard` | Dashboard | Yes | Primary (mobile + desktop) |
| `/study` | StudyGuidePage | Yes | Primary (mobile + desktop) |
| `/test` | TestPage | Yes | Primary (mobile + desktop) |
| `/interview` | InterviewPage | Yes | Desktop primary, mobile "More" |
| `/progress` | ProgressPage | Yes | Desktop primary, mobile "More" |
| `/history` | HistoryPage | Yes | Desktop primary, mobile "More" |
| `/social` | SocialHubPage | No (partial) | Desktop primary, mobile "More" |
| `/settings` | SettingsPage | Yes | Desktop utility, not in mobile tabs |

### Navigation Split (The Core Problem)

**Desktop** (`AppNavigation.tsx`): 7 nav links in a horizontal bar (Dashboard, Study, Mock Test, Interview, Progress, History, Community) + utilities (online status, language toggle, theme toggle, sign out).

**Mobile** (`BottomTabBar.tsx`): 3 primary tabs (Dashboard, Study, Mock Test) + "More" sheet containing Interview, Progress, History, Community + theme toggle + sign out.

**Problem:** These are two independent nav configurations with different route groupings. Desktop shows 7 items; mobile shows 3+4. This creates inconsistent mental models.

### Data Flow Summary

```
User Actions --> React State (optimistic) --> IndexedDB (persist) --> Supabase (sync)
                                                 ^
                                                 |
                                         Source of truth
```

Key data stores:
- `user.testHistory` -- from AuthProvider (Supabase-sourced, in-memory)
- `categoryMasteries` -- computed from IndexedDB answer history via `useCategoryMastery`
- `SRS deck` -- IndexedDB srs-cards store, synced to Supabase
- `Streak data` -- IndexedDB streak store, synced to Supabase
- `Badge state` -- computed in-memory from badge check data

---

## Recommended Architecture for v2.0

### Principle: Surgical Changes, Not Rewrites

Every v2.0 feature maps to modifications of existing components or creation of small new ones. No new providers, no new stores, no new external dependencies.

### Epic A: Unified Navigation -- Architecture

**Problem:** Two separate nav configs (`primaryTabs` in BottomTabBar.tsx, `navLinks` in AppNavigation.tsx) with no shared source of truth.

**Solution:** Create a single navigation config module consumed by both navigation components.

#### New Files

| File | Purpose |
|------|---------|
| `src/lib/navigation/navConfig.ts` | Shared nav items, route grouping, hidden routes |
| `src/lib/navigation/index.ts` | Barrel export |

#### Modified Files

| File | Change |
|------|--------|
| `src/components/AppNavigation.tsx` | Import from `navConfig.ts` instead of local `navLinks` |
| `src/components/navigation/BottomTabBar.tsx` | Import from `navConfig.ts` instead of local `primaryTabs`/`moreNavItems` |
| `src/AppShell.tsx` | Update routes if Progress Hub replaces `/progress`, `/history`, `/social` |

#### New Route Structure

```
Primary tabs (both mobile and desktop):
  /dashboard       -- Home/Dashboard
  /study           -- Study Guide
  /test            -- Mock Test
  /interview       -- Interview Sim
  /hub             -- Progress Hub (NEW, replaces /progress + /history + /social)
  /settings        -- Settings

Legacy redirects:
  /progress  --> /hub#overview
  /history   --> /hub#history
  /social    --> /hub#community
```

#### navConfig.ts Architecture

```typescript
// src/lib/navigation/navConfig.ts
import type { BilingualString } from '@/lib/i18n/strings';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: BilingualString;
  icon: LucideIcon;
  /** Whether this shows in primary nav (both mobile and desktop) */
  primary: boolean;
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: strings.nav.dashboard, icon: Home, primary: true },
  { href: '/study',     label: strings.nav.studyGuide, icon: BookOpen, primary: true },
  { href: '/test',      label: strings.nav.mockTest, icon: ClipboardCheck, primary: true },
  { href: '/interview', label: strings.nav.practiceInterview, icon: Mic, primary: true },
  { href: '/hub',       label: { en: 'Progress', my: 'တိုးတက်မှု' }, icon: TrendingUp, primary: true },
];

export const HIDDEN_ROUTES = ['/', '/auth', '/auth/forgot', '/auth/update-password', '/op-ed'];

export const primaryItems = navItems.filter(i => i.primary);
```

**Impact analysis:** Both `AppNavigation` and `BottomTabBar` import this shared config. Mobile bottom bar grows from 3+1 to 5 tabs (Dashboard, Study, Test, Interview, Progress Hub). No "More" menu needed for navigation -- settings and utility actions move to the settings page or remain in the top bar on desktop.

**Decision:** 5 tabs on mobile bottom bar. This is the standard pattern for iOS/Android apps. The "More" sheet becomes unnecessary because all primary destinations are directly accessible.

---

### Epic B: Dashboard Redesign -- Architecture

**Problem:** Dashboard.tsx is 667 lines with 11 staggered sections, multiple CTAs, and heavy computation. Users feel overwhelmed.

**Solution:** Extract "Next Best Action" logic into a hook, replace multi-CTA cluster with single primary CTA, and collapse secondary analytics.

#### New Files

| File | Purpose |
|------|---------|
| `src/hooks/useNextBestAction.ts` | Computes single primary CTA based on user state |
| `src/components/dashboard/NextBestAction.tsx` | Hero CTA component |
| `src/components/dashboard/TodaysPlan.tsx` | 2-3 task suggestions with time estimates |

#### Modified Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Simplify to: Header + NextBestAction + TodaysPlan + collapsible sections |

#### Next Best Action Logic

```typescript
// src/hooks/useNextBestAction.ts
type ActionType = 'start-studying' | 'continue-study' | 'take-test' | 'review-srs' | 'try-interview';

interface NextBestAction {
  type: ActionType;
  title: BilingualString;
  subtitle: BilingualString;
  route: string;
  priority: number;
}

// Decision tree:
// 1. Never studied? --> "Start Studying"
// 2. SRS cards due > 5? --> "Review your flashcards"
// 3. No test taken recently (>3 days)? --> "Take a Mock Test"
// 4. Test accuracy < 60%? --> "Practice weak areas"
// 5. Ready (>80% readiness)? --> "Try Interview Mode"
// 6. Default --> "Continue Studying"
```

**Data dependencies:** This hook consumes `useSRS().dueCount`, `useAuth().user.testHistory`, `useCategoryMastery()`, and `useStreak()`. All already available in the Dashboard context. No new data fetching.

#### Dashboard Section Reduction

Current (11 sections):
1. Welcome header
2. Readiness hero
3. Quick action buttons (3)
4. SRS + Streak widgets (2)
5. Interview widget
6. Badges + Leaderboard (2)
7. Category progress (collapsible)
8. Suggested focus
9. Overall accuracy
10. Category accuracy breakdown
11. Empty state / Milestone / Badge celebrations

Proposed (4-5 sections):
1. Welcome header (condensed)
2. **Next Best Action** hero CTA (replaces readiness + quick actions)
3. **Today's Plan** (2-3 tasks)
4. Progress snapshot (link to Progress Hub)
5. SRS due count badge (inline, not a section)

Celebrations (milestone, badge) remain as modal overlays.

---

### Epic C: Progress Hub -- Architecture

**Problem:** Progress, History, and Community are three separate pages with overlapping concerns and independent navigation.

**Solution:** Create a single `ProgressHubPage` with hash-based tabs, reusing existing components.

#### New Files

| File | Purpose |
|------|---------|
| `src/pages/ProgressHubPage.tsx` | Tabbed container: Overview, History, Community |
| `src/components/hub/HubTabs.tsx` | Tab bar component with hash-based routing |

#### Reused (Not Modified) Components

These existing components move into the Progress Hub tabs wholesale:

| Component | Hub Tab |
|-----------|---------|
| `CategoryGrid`, `CategoryRing`, `MasteryBadge`, `SkillTreePath` | Overview |
| `ReadinessIndicator` | Overview (summary card) |
| History list, trend chart (from HistoryPage) | History |
| `LeaderboardTable`, `BadgeGrid`, `StreakHeatmap` | Community |

#### Hash-Based Tab Routing Pattern

The project already uses this pattern in `HistoryPage.tsx` and `SocialHubPage.tsx`:

```typescript
// Existing pattern (from SocialHubPage.tsx):
// - Hash-based routing (#leaderboard, #badges, #streak)
// - useMemo-derived activeTab (React Compiler safe)
// - userSelectedTab with null initial -> fallback to hash-derived tab

const hashTab = useMemo(() => {
  const hash = location.hash.replace('#', '');
  if (['overview', 'history', 'community'].includes(hash)) return hash as HubTab;
  return 'overview';
}, [location.hash]);
```

This pattern is React Compiler safe (no setState in effects) and already validated in the codebase.

#### Legacy Route Redirects

In `AppShell.tsx`, add redirects:

```typescript
// Replace individual routes:
<Route path="/progress" element={<Navigate to="/hub#overview" replace />} />
<Route path="/history" element={<Navigate to="/hub#history" replace />} />
<Route path="/social" element={<Navigate to="/hub#community" replace />} />

// Add hub route:
<Route path="/hub" element={<ProtectedRoute><ProgressHubPage /></ProtectedRoute>} />
```

**Constraint:** React Router's `<Navigate>` does not natively support hash fragments. The redirect component will need to use `useEffect` + `navigate('/hub', { replace: true })` followed by `window.location.hash = '#history'`. Alternatively, the ProgressHubPage can read the original path from a query param: `/hub?from=history`.

**Recommended approach:** Use a `<LegacyRedirect>` wrapper component:

```typescript
function LegacyRedirect({ tab }: { tab: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/hub#${tab}`, { replace: true });
  }, [navigate, tab]);
  return null;
}
```

---

### Epic D: Design Token System -- Architecture

**Problem:** Design tokens exist in `src/lib/design-tokens.ts` and `globals.css` but are not consistently applied. Cards, buttons, shadows, and radii vary across pages.

**Solution:** Standardize token consumption through shared component patterns. No new infrastructure needed.

#### Existing Token Sources

| Source | What It Defines | Consumed By |
|--------|----------------|-------------|
| `globals.css` `:root` | CSS custom properties (colors, border, radius) | Tailwind via `hsl(var(--...))` |
| `globals.css` `.dark` | Dark mode color overrides | Tailwind dark mode |
| `tailwind.config.js` | Extended colors, radii, shadows, keyframes | All components via Tailwind classes |
| `design-tokens.ts` | TypeScript constants (colors, spacing, timing, radius, shadows, springs) | Motion animation configs |

**Problem:** `design-tokens.ts` defines values that partially duplicate `globals.css` and `tailwind.config.js`. Some components use `design-tokens.ts` spring configs, others hardcode their own spring values.

#### Standardization Approach

1. **Consolidate spring configs**: Create a shared `src/lib/motion/springs.ts` that exports named spring presets consumed by all animated components.

2. **Card component variants**: The existing `Card` component has `elevated` and `interactive` props. Add a `variant` prop for common card patterns (stat-card, action-card, section-card) to reduce per-page styling variance.

3. **Button consistency**: The existing `Button` component already handles variants well. The issue is that Dashboard uses raw `clsx` button styles instead of the `Button` component. Migrate those inline buttons to use `Button` or `BilingualButton`.

#### Modified Files for Token Alignment

| File | Change |
|------|--------|
| `src/lib/design-tokens.ts` | Add motion spring presets as named exports |
| `src/components/ui/Card.tsx` | Add `variant` prop for common card patterns |
| `src/pages/Dashboard.tsx` | Replace inline button styles with `Button` component |
| `src/pages/ProgressPage.tsx` | Apply consistent card styling |
| `src/pages/StudyGuidePage.tsx` | Align card radius and shadow tokens |
| `src/pages/InterviewPage.tsx` | Align card radius and shadow tokens |
| `src/pages/TestPage.tsx` | Align card radius and shadow tokens |

**No new dependencies.** This is purely internal CSS/component standardization.

---

### Epic E: Burmese Translation -- Architecture

**Problem:** i18n system is a single `src/lib/i18n/strings.ts` file with flat BilingualString objects. Burmese translations are sometimes literal, and layouts can clip longer Burmese text.

**Solution:** Extend the existing strings system with a style guide, audit top-20 strings, and add text expansion safety.

#### Existing i18n Architecture

```
src/lib/i18n/strings.ts
  --> exports `strings` object (nav, actions, dashboard, study, test, etc.)
  --> exports `BilingualString` type { en: string; my: string }
  --> exports helper functions (getRandomCorrectEncouragement, etc.)

Consumed by:
  --> All pages via `useLanguage().showBurmese`
  --> Components render: showBurmese ? item.my : item.en
  --> Some components show both (stacked English + Burmese)
```

#### New Files

| File | Purpose |
|------|---------|
| `docs/burmese-style-guide.md` | Translation glossary, tone guide, terminology conventions |

#### Modified Files

| File | Change |
|------|--------|
| `src/lib/i18n/strings.ts` | Update top 20 strings with reviewed Burmese |
| Various page components | Add `overflow-hidden text-ellipsis` or `break-words` where needed |
| `src/components/navigation/BottomTabBar.tsx` | Ensure tab labels don't overflow with Burmese text |

#### Text Expansion Safety Pattern

Burmese text is typically 1.5-2x longer than English. The existing pattern of `font-myanmar text-xs` helps, but some layouts assume English text width.

**Pattern:** For constrained containers (nav tabs, button labels, card headers):
```css
/* Apply to containers that hold bilingual text in constrained space */
.bilingual-constrained {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* Or for multi-line: */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

**No structural changes needed.** The existing `showBurmese` conditional rendering pattern is correct. The work is content QA + CSS overflow safety.

---

### Epic F: USCIS 120-Question Bank -- Architecture

**Problem:** The question bank already has 120 questions (100 original + 20 from `uscis-2025-additions.ts`). But test/interview thresholds, UI copy, and some calculations still reference "100 questions" or use old pass/fail logic.

#### Already Completed

- `totalQuestions` constant exists and is used throughout (120 currently)
- 20 new questions added in `uscis-2025-additions.ts`
- `index.ts` barrel file aggregates all questions

#### What Needs Updating

| Area | Current | Target | Files Affected |
|------|---------|--------|----------------|
| Mock test question count | 20 | 20 (unchanged) | None |
| Pass threshold (mock test) | 12 correct | 12 correct (unchanged) | None |
| Fail threshold (mock test) | 9 incorrect | 9 incorrect (unchanged) | None |
| Interview question count | 20 | 20 (unchanged) | None |
| UI copy referencing "100" | Some remain | All say "120" | Audit needed |
| Badge thresholds | Based on 100 | Based on `totalQuestions` | `badgeDefinitions.ts` |
| Progress calculations | Based on 100 | Based on `totalQuestions` | Verify all use constant |

**Blast radius analysis:** The `totalQuestions` constant is imported by:
- `Dashboard.tsx` (readiness score, composite score)
- `ProgressPage.tsx` (practiced count display)
- Badge engine calculations
- Composite score calculations

Most of these already use `totalQuestions` rather than hardcoded 100. The main work is a UI copy audit and badge threshold review.

---

### Epic G: Push Subscription Security -- Architecture

**Problem:** Push subscription API accepts `userId` without verifying the authenticated user matches.

**Solution:** Add server-side JWT validation to the push subscription endpoint.

#### Existing Architecture

```
Client: usePushNotifications hook
  --> calls Supabase Edge Function or API route to store subscription
  --> passes userId + PushSubscription object
```

#### Security Changes

| Layer | Change |
|-------|--------|
| API route / Edge Function | Validate `Authorization: Bearer <jwt>` header |
| API route / Edge Function | Extract `user_id` from JWT, ignore client-sent `userId` |
| API route / Edge Function | Add rate limiting (max 5 subscription writes per user per hour) |
| Client hook | Include Supabase session token in request headers |

**No client-side architecture changes.** The `usePushNotifications` hook already has access to the auth context. The fix is server-side validation.

---

## Component Dependency Map

```
v2.0 Component Dependencies:

Epic D (Design Tokens)     -- INDEPENDENT, no deps
  |
  v
Epic E (Burmese i18n)     -- INDEPENDENT, no deps (but benefits from D's layout fixes)
  |
  v
Epic A (Unified Nav)       -- Depends on: new route for Progress Hub (/hub)
  |
  v
Epic C (Progress Hub)      -- Depends on: Epic A (new route), benefits from D
  |
  v
Epic B (Dashboard)         -- Depends on: Epic A (nav changes), Epic C (link to hub)
  |                          Benefits from: Epic D (token alignment)
  v
Epic F (USCIS 120Q)        -- INDEPENDENT (data + constants), but audit after B/C
  |
  v
Epic G (Security)          -- INDEPENDENT (server-side only)
```

---

## Suggested Build Order

### Phase 1: Foundation Layer (No User-Facing Changes)

**Epic D1: Design token consolidation**
- Consolidate spring configs into shared module
- Add Card component variants
- No visual changes yet, just infrastructure

**Epic A1: Navigation config module**
- Create `navConfig.ts` shared module
- Do NOT rewire navigation yet -- just create the data source

**Why first:** These are zero-risk infrastructure changes that all subsequent work depends on. If design tokens are inconsistent when you start building new UI, every new component will add to the inconsistency.

### Phase 2: Page Restructuring

**Epic C: Progress Hub page**
- Create `ProgressHubPage.tsx` with hash-based tabs
- Reuse existing components (CategoryGrid, SkillTreePath, etc.)
- Add legacy route redirects

**Epic A2: Rewire navigation**
- Both `AppNavigation` and `BottomTabBar` consume `navConfig.ts`
- Remove "More" menu from mobile
- 5 primary tabs on mobile bottom bar

**Why second:** Page restructuring must happen before dashboard redesign, because the dashboard links to Progress Hub. Build the destination before building the links.

### Phase 3: Dashboard Redesign

**Epic B: Dashboard simplification**
- Implement `useNextBestAction` hook
- Create `NextBestAction` and `TodaysPlan` components
- Collapse Dashboard from 11 sections to 4-5
- Link "View Progress" to `/hub`

**Why third:** Dashboard redesign depends on Progress Hub existing (for deep links) and unified nav being in place (for consistent tab highlighting).

### Phase 4: Polish and Content

**Epic D2: Micro-interaction standardization**
- Apply shared spring presets to all animated components
- Ensure reduced-motion support is consistent

**Epic E: Burmese translation upgrade**
- Create style guide document
- Audit and update top 20 strings
- Add text expansion safety CSS

**Epic F: USCIS question bank audit**
- Verify all UI copy references 120 (not 100)
- Review badge thresholds against `totalQuestions`
- Test pass/fail logic correctness

**Why fourth:** These are content and polish changes that should happen after structural changes are stable. Changing translations before layout changes would require double-work.

### Phase 5: Security

**Epic G: Push subscription hardening**
- Add JWT validation to push subscription endpoint
- Add rate limiting
- Test with authenticated and unauthenticated requests

**Why last:** Security changes are server-side and independent. Shipping them after UI changes means fewer moving parts during the security audit.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Creating a New Router for Hub Tabs

**What people do:** Use nested `<Routes>` inside Progress Hub for tab content.
**Why bad:** Creates URL paths like `/hub/history` which conflict with the existing hash routing pattern. Also breaks the `PageTransition` wrapper which keys on `location.pathname`.
**Do instead:** Use hash-based tabs (`#overview`, `#history`, `#community`) with `useMemo` derived from `location.hash`. This is the established pattern in `SocialHubPage.tsx` and `HistoryPage.tsx`.

### Anti-Pattern 2: Splitting Design Tokens Across Multiple Systems

**What people do:** Put some tokens in CSS variables, some in Tailwind config, some in TypeScript, and try to keep them in sync.
**Why bad:** Triple-maintenance burden, tokens drift over time.
**Do instead:** CSS custom properties as the source of truth (already in `globals.css`), Tailwind references them via `hsl(var(--...))`, TypeScript only exports motion-specific values (springs, timing) that have no CSS equivalent.

### Anti-Pattern 3: Prop Drilling for Next Best Action

**What people do:** Compute "Next Best Action" in Dashboard and pass it through props.
**Why bad:** The computation requires data from 4 different hooks. Passing all inputs through props creates a wide prop interface.
**Do instead:** Create a `useNextBestAction` hook that internally consumes the needed hooks and returns a single action object. Dashboard just calls the hook.

### Anti-Pattern 4: Full Page Rewrite for Dashboard

**What people do:** Delete Dashboard.tsx and start fresh.
**Why bad:** Loses tested behavior, introduces regressions, and the existing component structure is sound.
**Do instead:** Extract sections into sub-components, remove the ones that move to Progress Hub, and add the new ones. The Dashboard component stays as the orchestrator.

### Anti-Pattern 5: Breaking the Hash Routing Contract

**What people do:** Use React Router `useSearchParams` for tab state instead of hash.
**Why bad:** The app uses `BrowserRouter` with path-based routing. Using search params for tabs creates URL conflicts and breaks `PageTransition` which depends on `location.pathname` for animation keys.
**Do instead:** Use `location.hash` for tab state within a page. This is the established pattern.

---

## Integration Points

### Components That Need Modification

| Component | Epic(s) | Change Type | Risk |
|-----------|---------|-------------|------|
| `AppShell.tsx` | A, C | Route additions + redirects | MEDIUM -- routing changes |
| `AppNavigation.tsx` | A | Import shared config | LOW -- data source change |
| `BottomTabBar.tsx` | A | Import shared config, remove "More" | MEDIUM -- UX change |
| `Dashboard.tsx` | B | Major simplification | HIGH -- most complex page |
| `ProgressPage.tsx` | C | Content moves to Hub | LOW -- becomes redirect |
| `HistoryPage.tsx` | C | Content moves to Hub | LOW -- becomes redirect |
| `SocialHubPage.tsx` | C | Content moves to Hub | LOW -- becomes redirect |
| `design-tokens.ts` | D | Add spring presets | LOW -- additive |
| `Card.tsx` | D | Add variant prop | LOW -- additive |
| `Button.tsx` | D | No changes needed | NONE |
| `strings.ts` | E | Update Burmese strings | LOW -- content only |
| `globals.css` | D | No changes needed | NONE |
| `tailwind.config.js` | D | No changes needed | NONE |
| `questions/index.ts` | F | Verify constants | LOW |
| `badgeDefinitions.ts` | F | Threshold review | LOW |

### New Components Needed

| Component | Epic | Purpose | Complexity |
|-----------|------|---------|------------|
| `navConfig.ts` | A | Shared nav configuration | LOW |
| `ProgressHubPage.tsx` | C | Tabbed container page | MEDIUM |
| `HubTabs.tsx` | C | Tab bar with hash routing | LOW |
| `LegacyRedirect.tsx` | C | Route redirect helper | LOW |
| `useNextBestAction.ts` | B | CTA decision hook | MEDIUM |
| `NextBestAction.tsx` | B | Hero CTA component | LOW |
| `TodaysPlan.tsx` | B | Task suggestion block | LOW |
| `burmese-style-guide.md` | E | Translation reference doc | LOW |

### Components That Move (Not Modified)

These existing components are reused inside Progress Hub tabs with no code changes:

| Component | Current Location | Hub Tab |
|-----------|-----------------|---------|
| `CategoryGrid` | Dashboard, ProgressPage | Hub > Overview |
| `CategoryRing` | ProgressPage | Hub > Overview |
| `MasteryBadge` | ProgressPage | Hub > Overview |
| `SkillTreePath` | ProgressPage | Hub > Overview |
| `LeaderboardTable` | SocialHubPage | Hub > Community |
| `BadgeGrid` | SocialHubPage | Hub > Community |
| `StreakHeatmap` | SocialHubPage | Hub > Community |
| `SocialOptInFlow` | SocialHubPage | Hub > Community |
| History list + chart | HistoryPage | Hub > History |

---

## Data Flow Changes

### No Changes to Data Layer

The v2.0 features do not modify:
- IndexedDB stores (questions, sync, srs-cards, mastery, streak, badge, interview)
- Supabase tables (profiles, mock_tests, mock_test_responses, srs_cards, social_profiles)
- Context providers (Auth, SRS, Social, Language, Theme, Offline)
- Sync queue logic

### New Data Flows

**useNextBestAction:**
```
useSRS().dueCount
useAuth().user.testHistory      -->  useNextBestAction()  -->  { type, title, route }
useCategoryMastery()
useStreak().currentStreak
```

**Progress Hub tab state:**
```
location.hash  -->  useMemo (derive tab)  -->  render tab content
user click     -->  navigate('/hub#tab')  -->  location.hash updates  -->  re-derive
```

Both are purely derived state with no new persistence.

---

## Scalability Considerations

| Concern | Current (v1.0) | After v2.0 | Notes |
|---------|---------------|------------|-------|
| Bundle size | ~37.5K LOC | ~38K LOC (+1-2%) | Progress Hub adds a page but removes 3 route imports |
| Navigation re-renders | Each nav is independent | Shared config reduces duplication | No performance impact |
| Dashboard computation | Heavy (11 sections) | Lighter (4-5 sections) | Fewer hooks called, less DOM |
| Route count | 13 routes | 11 routes (3 become redirects) | Slightly simpler routing |
| IndexedDB stores | 7 stores | 7 stores (unchanged) | No new storage |

---

## Sources

**Codebase analysis:**
- Direct reading of all 15+ source files referenced above (HIGH confidence)
- PRD: `docs/PRD-next-milestone.md` (HIGH confidence -- project source of truth)
- v1.0 architecture: `.planning/milestones/v1.0/` (HIGH confidence)

**React Router hash-based tabs:**
- [Pluralsight: Handling Tabs Using Page URLs](https://www.pluralsight.com/resources/blog/guides/handling-tabs-using-page-urls-and-react-router-doms) (MEDIUM confidence)
- [Ariakit: Tab with React Router](https://ariakit.org/examples/tab-react-router) (MEDIUM confidence)

**Design token patterns:**
- [Tailwind CSS Best Practices 2025-2026](https://www.frontendtools.tech/blog/tailwind-css-best-practices-design-system-patterns) (MEDIUM confidence)
- [Tailwind CSS @theme design tokens](https://medium.com/@sureshdotariya/tailwind-css-4-theme-the-future-of-design-tokens-at-2025-guide-48305a26af06) (LOW confidence -- Tailwind v4 not yet adopted by project)

---
*Architecture research for: Civic Test Prep v2.0 feature integration*
*Researched: 2026-02-09*
