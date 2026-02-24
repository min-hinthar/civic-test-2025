# Phase 40: App Router Foundation - Integration Map

**Generated:** 2026-02-24
**Phase Goal:** The App Router shell exists with providers and auth guard, ready to receive migrated routes

## Entry Points

Where users/system reach this feature:

| Entry Point | File | Type | How to Wire |
|-------------|------|------|-------------|
| Root layout (App Router) | `app/layout.tsx` | layout | Replace minimal stub with full Server Component root: metadata, fonts, viewport, CSS, theme script, `ClientProviders` wrapping `{children}` |
| Protected route group | `app/(protected)/layout.tsx` | layout | Create `'use client'` layout that uses `useAuth()` to check auth, shows spinner while loading, redirects unauthenticated to auth page |
| Pages Router shell | `src/AppShell.tsx` | component | Refactor to use `ClientProviders` with BrowserRouter wrapper prop — replaces inline provider nesting |

## Registration Points

Where new code must register itself to be discovered:

| Registration | File | Mechanism | How to Wire |
|-------------|------|-----------|-------------|
| 10 context providers | `src/components/ClientProviders.tsx` | wrapper component | Create new `'use client'` component that nests all 10 providers from AppShell in correct order + ErrorBoundary + optional router wrapper prop |
| Theme script constant | `src/lib/themeScript.ts` | shared constant | Extract inline theme script from `pages/_document.tsx` into importable constant |
| Theme script import (Pages) | `pages/_document.tsx` | import | Replace inline script string with import from `src/lib/themeScript.ts` |
| Theme script import (App) | `app/layout.tsx` | inline script | Import from `src/lib/themeScript.ts` and use via `dangerouslySetInnerHTML` |
| ReturnTo param (existing) | `src/components/ProtectedRoute.tsx` | URL param | Switch from react-router state to `?returnTo=` URL param for cross-router compatibility |

## Data Flow

Where data enters, transforms, and persists:

| Endpoint | File | Direction | How to Wire |
|----------|------|-----------|-------------|
| Auth state | `src/contexts/SupabaseAuthContext.tsx` | read | `useAuth()` provides `{ user, isLoading }` — used by protected layout for auth guard |
| Theme script | `proxy.ts` | read | CSP hash (`THEME_SCRIPT_HASH`) stays unchanged since script content is identical after extraction |

## Type Connections

Existing types the phase should import (not redefine):

| Type | Defined In | Used For | Import As |
|------|-----------|----------|-----------|
| Auth context types | `src/contexts/SupabaseAuthContext.tsx` | Auth guard layout | `import { useAuth } from '@/contexts/SupabaseAuthContext'` |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | Provider tree wrapping | `import ErrorBoundary from '@/components/ErrorBoundary'` |
| Provider components | Various `src/contexts/*.tsx` | ClientProviders nesting | Import each provider from its source file |

---

*Phase: 40-app-router-foundation*
*Integration map generated: 2026-02-24*
