# Provider Ordering in AppShell.tsx

## OfflineProvider must be inside ToastProvider

**Context:** Debugging Sentry error "Toast called outside of ToastContextProvider"
**Learning:** `OfflineProvider` calls `useToast()` for sync notifications. It must be nested inside `ToastProvider` in the component tree.

Correct order in `src/AppShell.tsx`:
```
ErrorBoundary > LanguageProvider > ThemeProvider > ToastProvider > OfflineProvider > AuthProvider > SocialProvider > SRSProvider
```

**Why it hid:** The old `use-toast.ts` (deleted in Phase 10-02) used `console.warn` with a no-op fallback. The replacement `BilingualToast.tsx` throws, making this a crash instead of a warning. The crash only triggers when offline sync completes — rare in dev/test.

**Apply when:** Adding new providers to AppShell, or when any provider needs toast/notification access.
