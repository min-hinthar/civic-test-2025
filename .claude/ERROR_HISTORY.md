# Error History

## 2026-03-01: onAuthStateChange Deadlock → "Session expired"

- **Type:** Runtime deadlock
- **Severity:** Critical (blocks all auth)
- **Files:** `src/contexts/SupabaseAuthContext.tsx`
- **Error:** "Session expired. Please sign in again." (sanitized from auth errors by `src/lib/errorSanitizer.ts`)
- **Root cause:** `onAuthStateChange` callback called `hydrateFromSupabase()` which makes `supabase.from().select()` calls. Supabase holds a lock during callback — async Supabase calls deadlock.
- **Fix:** Wrap `hydrateFromSupabase` in `setTimeout(fn, 0)` to defer until after lock release. Handle `SIGNED_OUT` immediately (no Supabase calls needed). Add try-catch to bootstrap.
- **Prevention:** Never make async Supabase API calls inside `onAuthStateChange`. See global learning `supabase-auth.md`.

---

## 2026-03-01: useAuth Outside AuthProvider

- **Type:** React context error
- **Severity:** Critical (app won't render)
- **Files:** `src/components/ClientProviders.tsx`, `src/contexts/LanguageContext.tsx`, `src/contexts/ThemeContext.tsx`, `src/contexts/TTSContext.tsx`
- **Error:** "useAuth must be used within an AuthProvider"
- **Root cause:** Commit `d78f1ba` (Phase 46 cross-device sync) added `useAuth()` to Language/Theme/TTS providers, but they rendered above `AuthProvider` in the provider tree.
- **Fix:** Moved `AuthProvider` to directly after `ErrorBoundary` in `ClientProviders.tsx`.
- **Prevention:** When adding context hooks to providers, verify the consumed provider is above the consuming one in the tree. See local learning `provider-ordering.md`.
