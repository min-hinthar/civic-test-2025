# Phase 2: PWA & Offline - Research

**Researched:** 2026-02-06
**Domain:** Progressive Web App, Service Workers, IndexedDB, Push Notifications
**Confidence:** HIGH

## Summary

This phase transforms the existing Next.js civics test prep app into a fully offline-capable PWA. The established modern stack for Next.js PWAs uses **Serwist** (successor to next-pwa) for service worker management with Workbox under the hood, **idb-keyval** for simple IndexedDB key-value storage, and the **web-push** library for push notifications via VAPID keys.

The app currently uses Next.js 15 with React Router for client-side routing (Pages Router pattern). This creates a specific challenge: users who navigate via client-side links can access cached content offline, but refreshing the page while offline causes issues since SSR routes differ from SPA routes. Serwist's navigation preload and fallback page patterns address this.

Key technical considerations include iOS Safari's 7-day data eviction policy (mitigated by encouraging home screen installation), the need for separate maskable and standard icons, and ensuring all offline/online feedback is bilingual (English + Burmese) per user decisions.

**Primary recommendation:** Use Serwist + idb-keyval + web-push as the core stack. Precache the app shell and all question data on first load. Implement a sync queue in IndexedDB for offline test results.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

**Offline study experience:**
- Full app functionality offline: study guide, practice tests, review history - everything minus syncing
- All 100+ questions pre-cached on first visit (both English and Burmese)
- Bilingual content fully available offline - no degraded language experience
- Test results saved locally with notice: "Results saved offline - will sync when connected"
- Mid-session offline transition: subtle indicator appears (no interruption to current activity)
- No data freshness indicator - questions rarely change, staleness not a user concern
- Auto-sync with confirmation when back online: "Syncing your offline results..." then confirm when done
- iOS Safari: proactive one-time tip about opening app weekly to keep data saved (no persistent storage API request)

**Install & onboarding:**
- Install prompt shown immediately on first visit
- Install prompt bilingual (English + Burmese)
- App icon: language-neutral design; splash screen: bilingual text
- App name on home screen: "US Civics" (bilingual subtitle in splash)
- Theme color: patriotic blue (#002868) for browser bar and status bar
- Post-install: single welcome modal explaining offline capability and key tips
- Notification permission request happens during install onboarding welcome modal
- Pre-prompt before browser's native notification dialog: friendly bilingual explanation of why

**Sync & conflict handling:**
- Multi-device conflict resolution: keep all results (no data loss, history shows everything)
- Auto-retry with exponential backoff on sync failure, plus manual "Retry now" button
- Sync feedback: syncing icon in header during sync + toast notification when complete
- Pending sync: badge count on sync icon showing number of unsynced items (e.g., "3")
- Requires login before saving test results - no anonymous offline data migration
- Sync happens over any network (WiFi or cellular) - data is tiny
- All sync status and error messages bilingual (English + Burmese)

**Status indicators & notifications:**
- Persistent header badge: icon-only (no text label), green dot = online, orange dot = offline
- Push notifications: study reminders + milestone celebrations
- Reminder frequency: user-configurable (daily, every 2 days, weekly, or off)
- Notification text: bilingual (English + Burmese)
- Notification permission: requested during install onboarding with bilingual pre-prompt explanation

### Claude's Discretion

- Install prompt visual style (banner, modal, or inline card)
- Re-prompt strategy after user dismisses install prompt
- Storage limit warnings (if needed based on data size analysis)
- Welcome modal layout and content structure
- Exact sync retry intervals and backoff timing

### Deferred Ideas (OUT OF SCOPE)

- Share button on milestone notifications - Phase 7 (Social Features)
- Shareable achievement cards from milestones - Phase 7

</user_constraints>

---

## Standard Stack

### Core PWA Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| [@serwist/next](https://serwist.pages.dev/docs/next) | ^10.x | Service worker integration for Next.js | Successor to next-pwa, active maintenance, Workbox-based |
| [serwist](https://serwist.pages.dev/) | ^10.x | Service worker runtime with precaching and caching strategies | Modern Workbox wrapper with TypeScript support |
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | ^6.x | IndexedDB key-value storage | 295 bytes (brotli'd), promise-based, structured-clonable data |
| [web-push](https://github.com/web-push-libs/web-push) | ^3.x | VAPID-based push notifications | De facto standard for Web Push in Node.js |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| idb | ^8.x | Full IndexedDB wrapper with transactions | Only if need complex queries beyond key-value (not needed for this phase) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Serwist | next-pwa | next-pwa is deprecated/unmaintained; Serwist is its spiritual successor |
| Serwist | Manual service worker | Loss of precaching manifest generation, more boilerplate |
| idb-keyval | localForage | localForage is 7k+ for IE support we don't need |
| idb-keyval | dexie | Overkill for simple key-value; adds ~50KB |
| web-push | Firebase Cloud Messaging | web-push is simpler for self-hosted, no vendor lock-in |

**Installation:**

```bash
pnpm add @serwist/next idb-keyval web-push
pnpm add -D serwist
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── lib/
│   ├── pwa/
│   │   ├── sw.ts                    # Service worker source (Serwist entry)
│   │   ├── offlineDb.ts             # IndexedDB operations (idb-keyval wrapper)
│   │   ├── syncQueue.ts             # Offline sync queue management
│   │   └── pushNotifications.ts     # Push subscription client-side logic
│   └── ...
├── components/
│   ├── pwa/
│   │   ├── InstallPrompt.tsx        # Custom install UI component
│   │   ├── OnlineStatusIndicator.tsx # Header badge component
│   │   ├── WelcomeModal.tsx         # Post-install onboarding
│   │   └── NotificationOptIn.tsx    # Push permission pre-prompt
│   └── ...
├── hooks/
│   ├── useOnlineStatus.ts           # Online/offline detection hook
│   ├── useInstallPrompt.ts          # beforeinstallprompt hook
│   ├── useSyncQueue.ts              # Pending sync state hook
│   └── usePushNotifications.ts      # Push subscription hook
├── contexts/
│   └── OfflineContext.tsx           # Offline state and sync queue context
└── app/ (or pages/)
    └── api/
        └── push/
            ├── subscribe/route.ts   # Store push subscription
            ├── unsubscribe/route.ts # Remove push subscription
            └── send/route.ts        # Send push notification (admin/cron)
public/
├── sw.js                            # Generated service worker (gitignored)
├── manifest.json                    # Web app manifest (or use app/manifest.ts)
├── icons/
│   ├── icon-192.png                 # Standard icon
│   ├── icon-512.png                 # Standard icon
│   ├── icon-maskable-192.png        # Maskable icon with safe zone padding
│   └── icon-maskable-512.png        # Maskable icon with safe zone padding
└── offline.html                     # Fallback page when offline and uncached
```

### Pattern 1: Service Worker with Serwist

**What:** Configure Serwist to precache app shell and question data, with runtime caching for API calls.

**When to use:** Always - this is the foundation of the PWA.

**Example:**

```typescript
// src/lib/pwa/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/offline.html",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Handle push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        data: data.data,
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"));
});
```

Source: [Serwist Getting Started](https://serwist.pages.dev/docs/next/getting-started)

### Pattern 2: IndexedDB Offline Storage with idb-keyval

**What:** Store questions and offline test results in IndexedDB using simple key-value operations.

**When to use:** For caching question data and queueing offline test results.

**Example:**

```typescript
// src/lib/pwa/offlineDb.ts
import { get, set, del, keys, createStore } from "idb-keyval";
import type { Question, TestSession } from "@/types";

// Separate stores for different data types
const questionsStore = createStore("civic-prep-questions", "questions");
const syncQueueStore = createStore("civic-prep-sync", "pending-results");

// Cache all questions on first load
export async function cacheQuestions(questions: Question[]): Promise<void> {
  await set("all-questions", questions, questionsStore);
  await set("cached-at", Date.now(), questionsStore);
}

// Get cached questions (returns undefined if not cached)
export async function getCachedQuestions(): Promise<Question[] | undefined> {
  return get("all-questions", questionsStore);
}

// Queue test result for sync
export async function queueTestResult(session: TestSession): Promise<string> {
  const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await set(id, session, syncQueueStore);
  return id;
}

// Get all pending results
export async function getPendingResults(): Promise<TestSession[]> {
  const allKeys = await keys(syncQueueStore);
  const results: TestSession[] = [];
  for (const key of allKeys) {
    const result = await get(key, syncQueueStore);
    if (result) results.push(result);
  }
  return results;
}

// Remove synced result
export async function removeSyncedResult(id: string): Promise<void> {
  await del(id, syncQueueStore);
}

// Count pending items for badge
export async function getPendingSyncCount(): Promise<number> {
  const allKeys = await keys(syncQueueStore);
  return allKeys.length;
}
```

Source: [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval)

### Pattern 3: Online/Offline Detection Hook

**What:** React hook that tracks navigator.onLine and listens for online/offline events.

**When to use:** For UI indicators and conditional sync logic.

**Example:**

```typescript
// src/hooks/useOnlineStatus.ts
import { useState, useEffect, useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot(): boolean {
  return navigator.onLine;
}

function getServerSnapshot(): boolean {
  return true; // Assume online during SSR
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

### Pattern 4: Install Prompt Hook

**What:** Capture beforeinstallprompt event and expose trigger function.

**When to use:** For custom install UI that follows user decisions.

**Example:**

```typescript
// src/hooks/useInstallPrompt.ts
import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);

    return outcome === "accepted";
  }, [deferredPrompt]);

  return { canInstall, isInstalled, promptInstall };
}
```

Source: [MDN beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)

### Pattern 5: Sync Queue with Exponential Backoff

**What:** Queue offline mutations and retry with backoff when online.

**When to use:** For test results that need to sync to Supabase.

**Example:**

```typescript
// src/lib/pwa/syncQueue.ts
import { getPendingResults, removeSyncedResult } from "./offlineDb";
import { supabase } from "@/lib/supabaseClient";
import type { TestSession } from "@/types";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

async function syncSingleResult(
  session: TestSession,
  key: string,
  userId: string
): Promise<boolean> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { error } = await supabase
        .from("mock_tests")
        .insert({
          user_id: userId,
          score: session.score,
          total_questions: session.totalQuestions,
          duration_seconds: session.durationSeconds,
          passed: session.passed,
          end_reason: session.endReason,
          created_at: session.date,
        });

      if (error) throw error;

      await removeSyncedResult(key);
      return true;
    } catch (error) {
      retries++;
      if (retries < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, retries);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return false;
}

export async function syncAllPendingResults(
  userId: string,
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingResults();
  let synced = 0;
  let failed = 0;

  for (const [index, result] of pending.entries()) {
    const success = await syncSingleResult(
      result,
      `pending-${result.date}`,
      userId
    );
    if (success) synced++;
    else failed++;
    onProgress?.(index + 1, pending.length);
  }

  return { synced, failed };
}
```

### Anti-Patterns to Avoid

- **Using `"any maskable"` purpose for icons:** Creates incorrect padding on various platforms. Always use separate icons with `"any"` and `"maskable"` purposes.

- **Blocking main thread with IndexedDB operations:** idb-keyval is async but ensure you don't await in render paths. Use React Query or similar for data fetching patterns.

- **Assuming navigator.onLine is always accurate:** It only indicates network adapter status, not actual internet connectivity. Design for graceful degradation.

- **Storing sensitive data in IndexedDB without encryption:** For this app, questions and test results aren't sensitive, but avoid storing auth tokens in IndexedDB.

- **Requesting notification permission immediately:** Always show a custom pre-prompt explaining the value first, per user decisions.

---

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Service worker lifecycle | Manual SW registration | Serwist | Handles updates, precaching, skipWaiting correctly |
| IndexedDB wrapper | Raw IndexedDB API | idb-keyval | Raw API is callback-based, error-prone, verbose |
| VAPID key generation | Manual crypto | `web-push generate-vapid-keys` | Correct key format guaranteed |
| Caching strategies | Custom fetch handlers | Serwist runtime caching | Edge cases around cache invalidation, network errors |
| Offline detection | Manual navigator.onLine | React hook with events | Need both initial state and change events |
| PWA installability | Manual manifest + SW | Serwist + proper manifest | Browser requirements are finicky |

**Key insight:** Service worker code runs in a separate context with different error handling, lifecycle, and debugging challenges. Using Serwist abstracts the complexity and provides battle-tested patterns.

---

## Common Pitfalls

### Pitfall 1: Next.js Router + Offline Refresh

**What goes wrong:** User navigates to `/test` via client-side routing (works offline), then refreshes the page. The SSR request for `/test` fails because the network is down and the route wasn't precached as a document.

**Why it happens:** Next.js serves different content for SSR navigation vs client-side navigation. Serwist precaches the build output but not all SSR routes dynamically.

**How to avoid:**
1. Ensure `navigationPreload` is enabled in Serwist config
2. Create an offline fallback page (`/offline.html`) that loads the SPA shell
3. The fallback page should bootstrap React Router and navigate to the requested URL client-side

**Warning signs:** Users report "page not found" when refreshing while offline, but navigation works.

### Pitfall 2: iOS Safari 7-Day Data Eviction

**What goes wrong:** iOS Safari evicts IndexedDB and Cache API data after 7 days of not visiting the site in Safari browser (not home screen app).

**Why it happens:** Apple's ITP (Intelligent Tracking Prevention) treats script-writable storage as potential tracking vectors.

**How to avoid:**
1. Encourage users to add to home screen - installed PWAs are exempt from eviction
2. Show a one-time friendly tip (per user decision): "Open the app at least weekly to keep your data saved"
3. Do NOT request `navigator.storage.persist()` - user decision explicitly excludes this

**Warning signs:** iOS users report losing their offline data / progress unexpectedly.

### Pitfall 3: beforeinstallprompt Not Firing

**What goes wrong:** Install prompt never appears, even with valid manifest and service worker.

**Why it happens:** The event only fires on Chromium browsers (Chrome, Edge, Samsung Internet). Safari and Firefox don't support it. Also requires HTTPS and meeting all PWA criteria.

**How to avoid:**
1. Check browser support before showing custom install UI
2. For iOS Safari, detect `navigator.standalone` to check if already installed, and show manual instructions ("Share > Add to Home Screen")
3. Ensure manifest has all required fields and icons pass validation

**Warning signs:** Install button works on Chrome but not Safari; event listener never fires.

### Pitfall 4: Service Worker Update Confusion

**What goes wrong:** Users see stale content after deploying updates, or the app breaks because old SW serves new JS that expects new API.

**Why it happens:** Service worker updates are complex - the new SW installs but waits until all tabs are closed before activating.

**How to avoid:**
1. Use `skipWaiting: true` and `clientsClaim: true` to activate immediately
2. Consider showing "Update available" toast when new SW detected
3. Test update flows in development using DevTools Application tab

**Warning signs:** Users complain app doesn't update; console shows mixed old/new resource versions.

### Pitfall 5: Push Notification Permission Denied Permanently

**What goes wrong:** User clicks "Block" on native permission dialog; can never ask again.

**Why it happens:** Browsers remember permission denials. Once denied, the only way to reset is browser settings.

**How to avoid:**
1. Show custom pre-prompt (per user decision) explaining value before triggering native dialog
2. Only call `Notification.requestPermission()` after user clicks "Enable notifications" on pre-prompt
3. Track whether user dismissed pre-prompt and don't show again for a while

**Warning signs:** Push subscription fails with "denied" status; users can't opt in.

---

## Code Examples

Verified patterns from official sources:

### Web App Manifest (Next.js Metadata API)

```typescript
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "US Civics Test Prep",
    short_name: "US Civics",
    description: "Bilingual English-Burmese civics test preparation",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#002868", // Patriotic blue per user decision
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

Source: [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)

### Next.js Config with Serwist

```typescript
// next.config.mjs
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/lib/pwa/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [{ url: "/offline.html", revision: "1" }],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

// Chain Serwist and Sentry configs
export default withSentryConfig(withSerwist(nextConfig), {
  // Sentry config...
});
```

Source: [Serwist Next.js Docs](https://serwist.pages.dev/docs/next/getting-started)

### Push Notification API Route

```typescript
// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { subscription, userId, reminderFrequency } = await request.json();

    const { error } = await supabaseAdmin
      .from("push_subscriptions")
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        reminder_frequency: reminderFrequency,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}
```

Source: [Next.js PWA Guide - Push Notifications](https://nextjs.org/docs/app/guides/progressive-web-apps)

### TypeScript Config for Service Worker

```json
// tsconfig.sw.json (separate config for SW compilation)
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "WebWorker"],
    "types": ["@serwist/next/typings"]
  },
  "include": ["src/lib/pwa/sw.ts"],
  "exclude": ["node_modules"]
}
```

Source: [Serwist TypeScript Setup](https://serwist.pages.dev/docs/next/getting-started)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa | Serwist (@serwist/next) | 2024 | next-pwa unmaintained; Serwist is actively developed |
| Workbox direct | Serwist | 2024 | Serwist wraps Workbox with better DX and Next.js integration |
| localForage | idb-keyval | Always | idb-keyval is 20x smaller for simple key-value use cases |
| Firebase for push | web-push (self-hosted) | Optional | Both valid; web-push avoids vendor lock-in |
| Create React App PWA | Next.js + Serwist | 2023+ | CRA deprecated; Next.js is the recommended React framework |

**Deprecated/outdated:**
- **next-pwa:** No longer maintained as of 2024. Use Serwist instead.
- **workbox-webpack-plugin direct usage:** Serwist provides Next.js-specific abstraction.
- **Service worker via public folder only:** Serwist generates optimized precache manifests at build time.

---

## Platform-Specific Notes

### iOS Safari Considerations

| Feature | Support Status | Notes |
|---------|----------------|-------|
| Service Worker | Yes (iOS 11.3+) | Full support when added to home screen |
| IndexedDB | Yes | Has history of bugs; generally stable now |
| Push Notifications | Yes (iOS 16.4+) | Only for installed PWAs, not Safari browser |
| Storage Persistence | Partial | 7-day eviction unless added to home screen |
| beforeinstallprompt | No | Must show manual instructions |
| Display: standalone | Yes | Works when added to home screen |

**Recommendation:** For iOS, detect Safari and show custom install instructions using the Share button. Track installation status via `navigator.standalone` (Safari-specific) or `matchMedia("(display-mode: standalone)")`.

### Android Chrome Considerations

| Feature | Support Status | Notes |
|---------|----------------|-------|
| Service Worker | Yes | Full support |
| IndexedDB | Yes | Reliable |
| Push Notifications | Yes | Full support |
| beforeinstallprompt | Yes | Works as expected |
| Mini-infobar | Yes | Auto-shows if criteria met |

---

## Open Questions

Things that couldn't be fully resolved:

1. **Serwist + Sentry Integration Order**
   - What we know: Both wrap Next.js config. Currently Sentry wraps the base config.
   - What's unclear: Does order matter? (withSerwist(withSentry(config)) vs withSentry(withSerwist(config)))
   - Recommendation: Test both orders; likely Serwist should be inner (runs first) since it modifies webpack config.

2. **Background Sync API Browser Support**
   - What we know: Background Sync is Chromium-only. Safari doesn't support it.
   - What's unclear: Is manual sync-on-online sufficient for all users?
   - Recommendation: Use online event listener as primary mechanism; Background Sync as enhancement if available.

3. **Supabase Schema for Push Subscriptions**
   - What we know: Need to store endpoint, keys, and user preferences
   - What's unclear: Exact schema, RLS policies, index strategy
   - Recommendation: Define during planning; simple table with user_id FK, JSONB for subscription, reminder settings.

---

## Sources

### Primary (HIGH confidence)

- [Serwist Official Documentation](https://serwist.pages.dev/docs/next) - Full configuration, service worker setup, Next.js integration
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - Official manifest, push notification patterns
- [idb-keyval GitHub](https://github.com/jakearchibald/idb-keyval) - API documentation, usage patterns
- [MDN Web Push](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation) - Background sync, caching strategies
- [MDN beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event) - Install prompt API
- [web.dev PWA Installation Prompt](https://web.dev/learn/pwa/installation-prompt) - Best practices for install UX

### Secondary (MEDIUM confidence)

- [WebKit Storage Policy Updates](https://webkit.org/blog/14403/updates-to-storage-policy/) - iOS 7-day eviction details (verified behavior)
- [web-push npm](https://www.npmjs.com/package/web-push) - VAPID key generation, API usage

### Tertiary (LOW confidence)

- Community blog posts on Next.js PWA patterns - Used for pattern discovery, verified against official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Serwist is documented successor to next-pwa, idb-keyval is widely used
- Architecture: HIGH - Patterns from official documentation
- iOS workarounds: MEDIUM - Based on WebKit blog and community reports; test on real devices
- Push notifications: HIGH - Next.js official guide provides complete example
- Pitfalls: MEDIUM - Based on GitHub issues and community patterns; verify during implementation

**Research date:** 2026-02-06
**Valid until:** 2026-03-06 (30 days - PWA ecosystem relatively stable)

---

## Roadmap Implications

Based on this research, the 8 planned work items should be ordered as:

1. **02-01: Web manifest and app icons** - Foundation; must exist before service worker
2. **02-02: Service worker setup (Serwist)** - Enables all offline features
3. **02-03: IndexedDB question caching** - Requires SW; enables offline study
4. **02-06: Online/offline status indicator** - Low complexity; enhances UX immediately
5. **02-04: Offline sync queue** - Builds on IndexedDB; enables offline test-taking
6. **02-05: Install prompt component** - Can be added after core offline works
7. **02-08: iOS persistent storage** - Safari-specific handling after core features
8. **02-07: Push notification infrastructure** - Most complex; last priority

**Rationale:** Build from foundation up. Manifest + SW first, then storage, then UI components, then platform-specific handling, then push (most complex).
