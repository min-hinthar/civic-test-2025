# Stack Research

**Domain:** Bilingual PWA Civics Test Prep - Enhancement Stack
**Researched:** 2026-02-05
**Confidence:** HIGH (verified via official docs and multiple sources)

## Existing Stack (Do Not Change)

Already in place - this research focuses on **additions** only:

| Technology | Version | Status |
|------------|---------|--------|
| Next.js | 15.1.6 | Keep |
| React | 19.2.0 | Keep |
| Supabase | 2.81.1 | Keep |
| Tailwind CSS | 3.4.17 | Keep |
| React Router DOM | 7.0.2 | Keep |
| Lucide React | 0.475.0 | Keep |
| Recharts | 3.4.1 | Keep |
| Sentry | 10.26.0 | Keep |

---

## Recommended Stack Additions

### PWA Capabilities

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @serwist/next | ^9.5.4 | Service worker integration | Official Next.js docs recommend Serwist; actively maintained fork of Workbox; works with webpack in Next.js 15. [Source](https://serwist.pages.dev/docs/next) |
| serwist | ^9.5.4 | Service worker core | Peer dependency for @serwist/next; provides caching strategies and offline support |
| idb-keyval | ^6.2.1 | IndexedDB key-value store | Tiny (~600B) promise-based wrapper; perfect for offline data persistence; used alongside service worker Cache API. [Source](https://github.com/jakearchibald/idb-keyval) |

**Confidence: HIGH** - Serwist is recommended in official Next.js PWA documentation.

### Spaced Repetition

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| ts-fsrs | ^4.x | Spaced repetition scheduling | FSRS algorithm outperforms SM-2 empirically; TypeScript-native; actively maintained by Open Spaced Repetition community; Node 18+ required. [Source](https://github.com/open-spaced-repetition/ts-fsrs) |

**Confidence: HIGH** - ts-fsrs is the standard FSRS implementation; academically backed; used by Anki community.

### Bilingual UX

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| (None required) | - | Translation management | App displays both languages simultaneously (no toggle); existing approach is correct for target users |

**Confidence: HIGH** - No i18n library needed because:
1. Both languages display together (not switchable)
2. Content is static civics questions (not dynamic UI strings)
3. Adding next-intl would add complexity without benefit

**Note:** If future requirements add language toggle, use **next-intl ^4.7.0** - it supports Pages Router and is recommended by Next.js team.

### Social/Community Features

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @supabase/supabase-js | ^2.81.1 | Realtime subscriptions | Already installed; use Broadcast/Presence channels for social features. [Source](https://supabase.com/docs/guides/realtime) |
| @tanstack/react-query | ^5.x | Data fetching/caching | Better than raw Supabase hooks for comments/reactions; handles cache invalidation on realtime updates. [Source](https://tanstack.com/query) |

**Confidence: MEDIUM** - Supabase realtime is well-documented; TanStack Query is industry standard but adds bundle size.

**Alternative considered:** supabase-comments-extension (last updated 2022, uses deprecated @supabase/ui) - **do not use**, build custom instead.

### UI Polish & Animation

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| motion | ^12.x | Animation library | Formerly Framer Motion; declarative API; 120fps hardware-accelerated; works with React 19 concurrent rendering. [Source](https://motion.dev) |
| @radix-ui/react-* | ^1.x | Accessible primitives | Shadcn/ui foundation; WCAG compliant; use for dialogs, toasts, progress bars. [Source](https://www.radix-ui.com/primitives) |

**Confidence: HIGH** - Motion and Radix are industry standards; used by Vercel, Linear, Supabase.

### PWA Installation & App Store

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| web-push | ^3.x | Push notification server | Generate VAPID keys; send notifications from Supabase Edge Functions. [Source](https://github.com/web-push-libs/web-push) |

**Confidence: MEDIUM** - Push notifications work on Android; iOS support limited to iOS 16.4+ with Safari only.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| clsx | ^2.1.1 | Already installed | Class name utilities |
| tailwindcss-animate | ^1.0.7 | Already installed | CSS animations (use with Motion for complex animations) |
| zod | ^3.x | Schema validation | Validate offline-synced data before Supabase write |

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Lighthouse | PWA audit | Built into Chrome DevTools; use for installability checks |
| Workbox Window | SW registration | Consider if Serwist's default doesn't meet needs |
| PWA Builder | App store packaging | Use for generating TWA (Android) and iOS wrappers |

---

## Installation

```bash
# PWA capabilities
npm install @serwist/next serwist idb-keyval

# Spaced repetition
npm install ts-fsrs

# Social features (if not already installed)
npm install @tanstack/react-query

# UI polish
npm install motion @radix-ui/react-dialog @radix-ui/react-toast @radix-ui/react-progress

# Push notifications (server-side, for Edge Functions)
npm install web-push

# Validation
npm install zod
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @serwist/next | next-pwa | Never - next-pwa unmaintained since 2022, webpack conflicts with Turbopack |
| @serwist/next | Manual SW | Only if you need complete control and understand Workbox deeply |
| ts-fsrs | supermemo.js (SM-2) | Never - FSRS empirically outperforms SM-2; same complexity to implement |
| ts-fsrs | Custom algorithm | Only if FSRS doesn't fit your UX model |
| motion | CSS transitions | Simple animations only; Motion needed for gestures, layout animations |
| motion | react-spring | If you need physics-based animations exclusively |
| @tanstack/react-query | SWR | If you prefer simpler API; TanStack has better Supabase integration patterns |
| Custom comments | supabase-comments-extension | Never - package is 3 years old, uses deprecated dependencies |
| next-intl | react-i18next | If you need non-Next.js support; next-intl is more Next.js-native |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| next-pwa | Unmaintained since 2022; webpack conflicts; security issues | @serwist/next |
| supabase-comments-extension | Last update Feb 2022; uses deprecated @supabase/ui and old react-query | Build custom with Supabase + TanStack Query |
| localForage | Larger bundle (8KB vs 600B); unnecessary browser compatibility | idb-keyval |
| SM-2 algorithm | FSRS outperforms it in retention studies | ts-fsrs |
| framer-motion package name | Renamed to 'motion' as of v11 | motion |
| OneSignal/Firebase for push | Adds external dependency; Supabase Edge Functions + web-push is sufficient for free tier | web-push + Supabase Edge Functions |

---

## Stack Patterns by Feature

### PWA Offline Mode
- Use Serwist for service worker registration and caching
- Use idb-keyval for user progress/study data persistence
- Use Supabase realtime to sync when back online
- Cache strategy: NetworkFirst for API, CacheFirst for static assets

### Spaced Repetition
- Use ts-fsrs for scheduling algorithm
- Store card state in Supabase `user_progress` table
- Cache locally with idb-keyval for offline study
- Sync on reconnection with conflict resolution (latest timestamp wins)

### Social Features
- Use Supabase Realtime Broadcast for live updates
- Use Supabase Realtime Presence for "studying now" indicators
- Use TanStack Query for data fetching with realtime cache invalidation
- Build comments/reactions as custom Supabase tables (not external library)

### UI Polish
- Use Motion for page transitions, micro-interactions
- Use Radix for accessible modals, toasts, progress indicators
- Use Tailwind animate for simple CSS animations
- Combine for "app store ready" feel

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @serwist/next@9.x | Next.js 15.x | Requires webpack (not Turbopack for SW generation) |
| ts-fsrs@4.x | Node.js 18+ | Project uses Node 18+ on Vercel |
| motion@12.x | React 19.x | Full concurrent rendering support |
| @tanstack/react-query@5.x | React 19.x | Requires React 18+ |
| next-intl@4.x | Next.js 15.x, TypeScript 5+ | If i18n toggle needed later |

---

## Free Tier Considerations

All recommendations work within Vercel + Supabase free tiers:

| Concern | Mitigation |
|---------|------------|
| Supabase Realtime connections | Free tier supports 200 concurrent; sufficient for early adoption |
| Supabase Edge Function invocations | Free tier: 500K/month; push notifications are low-volume |
| Vercel bandwidth | PWA caching reduces API calls significantly |
| Bundle size | All additions ~50KB gzipped total |

---

## Sources

### HIGH Confidence (Official Documentation)
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official PWA guidance
- [Serwist Documentation](https://serwist.pages.dev/docs/next/getting-started) - Service worker setup
- [ts-fsrs GitHub](https://github.com/open-spaced-repetition/ts-fsrs) - Spaced repetition implementation
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime) - Social features architecture
- [Motion Documentation](https://motion.dev) - Animation library
- [Radix UI](https://www.radix-ui.com/primitives) - Accessible components

### MEDIUM Confidence (Verified Community Sources)
- [Building PWAs with Serwist](https://javascript.plainenglish.io/building-a-progressive-web-app-pwa-in-next-js-with-serwist-next-pwa-successor-94e05cb418d7) - Implementation patterns
- [FSRS Algorithm Research](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler) - Academic backing for FSRS
- [PWABuilder](https://www.pwabuilder.com/) - App store packaging
- [next-intl 4.0 Release](https://next-intl.dev/blog/next-intl-4-0) - i18n if needed later

### LOW Confidence (Single Source / Older)
- supabase-comments-extension - Verified outdated, do not use

---

*Stack research for: Bilingual PWA Civics Test Prep Enhancement*
*Researched: 2026-02-05*
