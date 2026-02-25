# Phase 42: CSP Nonce Migration and PWA Update - Integration Map

**Generated:** 2026-02-24
**Phase Goal:** CSP uses nonce-based allowlisting and the service worker caches App Router assets correctly

## Entry Points

Where users/system reach this feature:

| Entry Point | File | Type | How to Wire |
|-------------|------|------|-------------|
| Root layout (nonce injection) | `app/layout.tsx` | layout | Inject nonce attribute into `<Script>` tags and pass nonce to CSP meta tag |
| Next.js middleware (CSP headers) | `middleware.ts` (NEW) | middleware | Create middleware to generate per-request nonce and set CSP headers |
| Next.js config (headers) | `next.config.mjs` | config | Remove static CSP header config once middleware handles dynamic CSP |
| Proxy server (dev CSP) | `proxy.ts` | dev server | Update CSP header generation to use nonces or align with middleware approach |

## Registration Points

Where new code must register itself to be discovered:

| Registration | File | Mechanism | How to Wire |
|-------------|------|-----------|-------------|
| Theme script nonce | `src/lib/themeScript.ts` | inline script | Accept and apply nonce attribute to inline theme script |
| Service worker registration | `public/sw.js` | service worker | Update cache URLs from Pages Router paths to App Router `/_next/` asset paths |
| SW build-time config | `src/lib/pwa/sw.ts` | SW helpers | Update precache manifest / route patterns for App Router |
| PWA manifest | `app/layout.tsx` | `<link rel="manifest">` | Ensure manifest link is in App Router layout |
| Offline context | `src/contexts/OfflineContext.tsx` | context provider | Verify offline detection works with new SW caching strategy |
| PWA onboarding | `src/components/pwa/PWAOnboardingFlow.tsx` | component | Verify install prompt and offline fallback work on all App Router routes |

## Data Flow

Where data enters, transforms, and persists:

| Endpoint | File | Direction | How to Wire |
|----------|------|-----------|-------------|
| Push notifications (VAPID) | `src/lib/pwa/pushNotifications.ts` | write | Ensure push subscription works with nonce-based CSP (connect-src) |
| Supabase auth (Google OAuth) | `src/contexts/SupabaseAuthContext.tsx` | read/write | Ensure CSP allows OAuth redirect origins and Supabase endpoints |
| Audio precache | `src/lib/audio/audioPrecache.ts` | read | Verify cached audio resources allowed by CSP media-src |
| Interview sync | `src/lib/interview/interviewSync.ts` | read/write | Verify sync endpoints in CSP connect-src |

## Type Connections

Existing types the phase should import (not redefine):

| Type | Defined In | Used For | Import As |
|------|-----------|----------|-----------|
| (none — CSP/SW work is infrastructure, not typed domain logic) | — | — | — |

---

*Phase: 42-csp-nonce-migration-and-pwa-update*
*Integration map generated: 2026-02-24*
