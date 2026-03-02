# Phase 41: Route Migration - Integration Map

**Generated:** 2026-02-24
**Phase Goal:** All routes use Next.js file-based routing with clean URLs and react-router-dom is removed

## Entry Points

Where users/system reach this feature:

| Entry Point | File | Type | How to Wire |
|-------------|------|------|-------------|
| Catch-all SPA route | `pages/[[...slug]].tsx` | Pages Router catch-all | Remove after migration — all routes become `app/` directories |
| App layout | `app/layout.tsx` | App Router layout | Root layout already exists; ensure providers migrate here |
| Protected layout | `app/(protected)/layout.tsx` | App Router route group | Auth guard layout for protected routes |
| _app.tsx providers | `pages/_app.tsx` | Pages Router app wrapper | Migrate provider tree to `app/layout.tsx` / ClientProviders |
| _document.tsx | `pages/_document.tsx` | Pages Router document | Migrate CSP headers, fonts to `app/layout.tsx` metadata |
| Op-Ed page | `pages/op-ed.tsx` | Pages Router page | Migrate to `app/op-ed/page.tsx` |
| Push API route | `pages/api/push/` | Pages Router API | Migrate to `app/api/push/route.ts` |

## Registration Points

Where new code must register itself to be discovered:

| Registration | File | Mechanism | How to Wire |
|-------------|------|-----------|-------------|
| Hash router definition | `src/AppShell.tsx` | HashRouter + Routes | Remove HashRouter, replace with Next.js Link/navigation |
| Client providers wrapper | `src/components/ClientProviders.tsx` | Provider composition | Keep providers, remove router-dependent wrappers |
| Bottom tab navigation | `src/components/navigation/BottomTabBar.tsx` | useNavigate + NavItem | Replace with Next.js `useRouter` / `Link` |
| Glass header | `src/components/navigation/GlassHeader.tsx` | useNavigate | Replace with Next.js `useRouter` |
| Sidebar navigation | `src/components/navigation/Sidebar.tsx` | useNavigate | Replace with Next.js `useRouter` / `Link` |
| NavItem component | `src/components/navigation/NavItem.tsx` | useNavigate | Replace with Next.js `Link` |
| Navigation provider | `src/components/navigation/NavigationProvider.tsx` | createContext | Adapt to Next.js pathname instead of hash |
| Page transition animation | `src/components/animations/PageTransition.tsx` | useLocation (hash) | Replace with `template.tsx` pattern |

## Data Flow

Where data enters, transforms, and persists:

| Endpoint | File | Direction | How to Wire |
|----------|------|-----------|-------------|
| Navigation hooks | `src/hooks/useFocusOnNavigation.ts` | read | Replace `useLocation` with Next.js `usePathname` |
| Interview guard | `src/hooks/useInterviewGuard.ts` | read | Replace `useNavigate` with Next.js `useRouter` |
| History guard | `src/lib/historyGuard.ts` | write | Review — may need adaptation for App Router navigation |
| Supabase auth context | `src/contexts/SupabaseAuthContext.tsx` | both | Ensure auth redirects use Next.js router |

## Type Connections

Existing types the phase should import (not redefine):

| Type | Defined In | Used For | Import As |
|------|-----------|----------|-----------|
| Route paths | `src/AppShell.tsx` (inline) | Route definitions | Extract to shared route constants |
| NavigationContext | `src/components/navigation/NavigationProvider.tsx` | Nav state | Adapt to use `usePathname` |

## react-router-dom Usage Inventory (36 files)

**Pages (10 files):** AuthPage, Dashboard, HubPage, LandingPage, OpEdPage, PasswordResetPage, PasswordUpdatePage, SettingsPage, StudyGuidePage, TestPage

**Components (20+ files):** AppShell, PageTransition, ClientProviders, CategoryPreviewCard, CompactStatRow, DashboardEmptyState, NBAHeroCard, RecentActivityCard, AchievementsTab, HistoryTab, OverviewTab, WelcomeState, InterviewResults, BottomTabBar, GlassHeader, NavigationShell, NavItem, Sidebar, OnboardingTour, PracticeResults, TestResultsScreen, UnfinishedBanner, BadgeHighlights, DeckManager, ReviewDeckCard, ReviewSession, SRSWidget, PreTestScreen

**Hooks (2 files):** useFocusOnNavigation, useInterviewGuard

---

*Phase: 41-route-migration*
*Integration map generated: 2026-02-24*
