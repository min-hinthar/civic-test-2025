# Provider Ordering in ClientProviders.tsx

## AuthProvider must be above Language/Theme/TTS providers

**Context:** v4.0 Phase 46 (cross-device sync) added `useAuth()` calls to LanguageContext, ThemeContext, and TTSContext for settings sync. But AuthProvider was below them in the tree, causing "useAuth must be used within an AuthProvider" on every page load.

**Learning:** Any provider that calls `useAuth()` must be nested **inside** `AuthProvider`. When adding sync features to existing providers, verify provider hierarchy.

Correct order in `src/components/ClientProviders.tsx`:
```
ErrorBoundary > AuthProvider > LanguageProvider > ThemeProvider > TTSProvider > ToastProvider > OfflineProvider > SocialProvider > SRSProvider > StateProvider > NavigationProvider
```

**Key constraints:**
- `AuthProvider` — must be above Language/Theme/TTS (they call `useAuth` for sync)
- `OfflineProvider` — must be inside `ToastProvider` (calls `useToast`)
- `TTSProvider` — async init must throw when engine isn't ready

**Apply when:** Adding `useAuth()` or any context hook to a provider — check if the consumed provider is above the consuming one in the tree.

**Supersedes:** Previous entry referencing `AppShell.tsx` and old provider order (AuthProvider was below OfflineProvider).

## OfflineProvider must be inside ToastProvider

**Context:** Debugging Sentry error "Toast called outside of ToastContextProvider"
**Learning:** `OfflineProvider` calls `useToast()` for sync notifications. It must be nested inside `ToastProvider` in the component tree.

**Why it hid:** The old `use-toast.ts` (deleted in Phase 10-02) used `console.warn` with a no-op fallback. The replacement `BilingualToast.tsx` throws, making this a crash instead of a warning. The crash only triggers when offline sync completes — rare in dev/test.

**Apply when:** Adding new providers, or when any provider needs toast/notification access.

## Async Provider Initialization — Hooks Must Not Silently Succeed on Null

**Context:** TTSProvider creates its engine in a `useEffect` (async). `useTTS().speak()` silently returned when `engine === null`. InterviewSession's greeting effect fired before the engine was ready, `speak()` resolved immediately (undefined), `safeSpeakLocal` treated it as `'completed'`, and the flow advanced without ever speaking.

**Learning:** When a hook wraps an async-initialized resource (engine, client, connection), the accessor functions must **throw** (not silently return) when the resource isn't ready. This ensures:
1. Callers using try/catch get an error signal and can retry
2. `useCallback` dependency chains re-trigger the effect when the resource becomes available

```typescript
// BAD: silently succeeds — callers think operation completed
if (!engine) return;

// GOOD: throws — callers retry when engine dependency changes
if (!engine) throw new Error('TTS engine not initialized');
```

**Why it's subtle:** The greeting effect depended on `handleGreeting` → `safeSpeakLocal` → `speak`. When `speak` silently returned, the promise chain resolved, `result === 'completed'` evaluated false (result was `undefined`... wait, actually `await undefined` resolves to `undefined`, and `try { await speak(...); return 'completed' }` returns `'completed'`). So the flow advanced as if speech had completed.

**Apply when:** Any hook that wraps an async-initialized singleton (TTS engine, WebSocket, IndexedDB connection) and exposes async methods.

## Throw vs No-Op Fallback — Context Matters

**Context:** The "throw when not ready" pattern above is correct for TTS (callers NEED the operation to succeed). But `useToast` had the same pattern (throwing when called outside ToastProvider) and it caused 25 Sentry errors — because toast is fire-and-forget, and components rendering during error boundaries or partial provider mount don't need toast to succeed.

**Learning:** Choose based on caller expectations:

| Pattern | When to use | Example |
|---------|-------------|---------|
| **Throw** | Caller awaits result, needs success signal, has retry logic | `speak()` — TTS engine, DB writes |
| **No-op fallback** | Fire-and-forget, caller doesn't check result, failure is silent UX degradation | `toast()` — notifications, analytics |

```typescript
// THROW: caller needs to know it failed (TTS)
if (!engine) throw new Error('TTS engine not initialized');

// NO-OP: caller doesn't care if it worked (Toast)
const TOAST_FALLBACK = { toast: () => {}, dismiss: () => {} };
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? TOAST_FALLBACK; // graceful degradation
}
```

**Apply when:** Deciding error handling strategy for context hooks that may be called outside their provider tree (error boundaries, partial mount, SSR).
