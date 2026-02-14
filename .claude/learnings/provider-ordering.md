# Provider Ordering in AppShell.tsx

## OfflineProvider must be inside ToastProvider

**Context:** Debugging Sentry error "Toast called outside of ToastContextProvider"
**Learning:** `OfflineProvider` calls `useToast()` for sync notifications. It must be nested inside `ToastProvider` in the component tree.

Correct order in `src/AppShell.tsx`:
```
ErrorBoundary > LanguageProvider > ThemeProvider > TTSProvider > ToastProvider > OfflineProvider > AuthProvider > SocialProvider > SRSProvider > StateProvider
```

**Why it hid:** The old `use-toast.ts` (deleted in Phase 10-02) used `console.warn` with a no-op fallback. The replacement `BilingualToast.tsx` throws, making this a crash instead of a warning. The crash only triggers when offline sync completes — rare in dev/test.

**Apply when:** Adding new providers to AppShell, or when any provider needs toast/notification access.

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
