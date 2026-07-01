# Guest (No-Account) Access, Auth Hydration & Guest↔Account Migration

**Context:** Shipped across #35 (guest access) and #37/#38 (guest↔account unification + badge scoping). Goal: let no-account visitors use the full app (flashcards/SRS, mock tests, interview, progress) with local persistence, working even when Supabase auth is paused/suspended — while keeping sign-in optional. This is a cluster of subtle auth/state/data-integrity gotchas; read before touching `SupabaseAuthContext`, `testHistory/`, or the badge store.

## Never gate rendering on a signed-in user

- The app shell (`app/(protected)/layout.tsx`) renders `NavigationShell` for **everyone** — it is NOT an auth guard. Only an `isLoading` spinner blocks; there is no redirect for guests.
- Read history via `useAuth().testHistory` (= `user?.testHistory ?? guestHistory`), **not** `user?.testHistory`, so guest progress surfaces. Guest history lives in `localStorage` (`civic-prep-guest-test-history`, `src/lib/testHistory/guestTestHistory.ts`).
- Account-only surfaces (leaderboard, reminders) render an in-context sign-in prompt for guests rather than gating.

## Auth hydration must fall back to guest, never spin forever

`SupabaseAuthContext.hydrateFromSupabase` races the profile/history queries against `AUTH_FETCH_TIMEOUT_MS`:

- **On timeout → guest fallback** (`setUser(null)` + local history). Do NOT install a "minimal placeholder user" — that design spawned a cluster of edge cases (composite-sync from empty history, leaderboard reset, save-during-placeholder hangs). Guest fallback is simpler and correct.
- **Late recovery:** keep awaiting the in-flight queries; if they resolve (a transient slow network, not a full outage), promote to the real signed-in user.
- **Generation guard:** a `hydrationGenerationRef` counter is bumped on every hydrate AND on `SIGNED_OUT`. Async results (late recovery, migration) only apply if the generation is unchanged — so a stale query can't resurrect a signed-out session or clobber a newer hydrate.
- **Reset `hydratedRef` on `SIGNED_OUT`.** It's a "real user already present" latch guarding the timeout fallback; if never cleared, a later sign-in whose hydration times out is wrongly denied the guest fallback.

## Saves during the guest-fallback window: keep local, migrate later

- **Don't** route saves to the account via a session-identity ref while `user === null` (an earlier "account-routing" attempt). It creates a "saved-then-gone" gap (offline branch does a no-op `setUser`) and adds complexity.
- **Do** keep `saveTestSession`'s guest branch simple: `if (!user) → addGuestTestSession + setGuestHistory`. The save stays immediately visible; migration moves it to the account on recovery.

## Guest→account migration (`src/lib/testHistory/migrateGuestHistory.ts`)

Runs in `hydrateFromSupabase` after `setUser`, on every promotion. Hard-won invariants:

- **Serialise with an in-flight guard** (`Map<userId, Promise>`). Two hydrates run per app load (bootstrap `getSession` + the `INITIAL_SESSION` event; plus `TOKEN_REFRESHED`). Without the guard both read the same guest store before either clears it and **double-insert** — and `mock_tests` has NO unique constraint. Concurrent callers reuse the first promise.
- **Content dedup, epoch-normalised.** Key = `(new Date(date).getTime(), score, totalQuestions)`. Inserts preserve `completed_at`, so re-runs are idempotent. Normalise the timestamp to epoch millis — Supabase may return `completed_at` in a different textual form than the stored ISO string, which would defeat string dedup and re-insert dupes.
- **Fold into CURRENT state, not the stale snapshot.** Apply via `setUser(prev => dedupeSessions([...prev.testHistory, ...merged]))` with a `prev.id === authUser.id` check — an offline save queued mid-migration (which does `setUser` but does NOT bump the generation) must not be discarded by overwriting from the captured `history`.
- **Partial-failure safe.** Keep the guest store on any failure (retry next hydrate; dedup makes succeeded ones no-ops). On a parent-inserted-but-responses-failed row, **best-effort delete the orphaned parent** before throwing — otherwise the next hydrate's dedup sees the parent and skips the session forever (a history entry with no question breakdown).

## Badges & other per-visitor state must be scoped

- Badge store (`src/lib/social/badgeStore.ts`) and the nav-dot counters (`useNavBadges`) are keyed by scope = `user?.id ?? 'guest'`. Never share badge state across sign-in, or a guest's badges surface as the account's (and vice versa).
- **Legacy adoption:** pre-scoping device-wide keys are adopted **once** into the first signed-in (non-guest) scope, then deleted, so existing users don't re-celebrate. Guests NEVER adopt (a guest read during the auth-loading window must not consume a signed-in user's badges).
- **Derive `isLoading`** from a `loadedScope !== scope` marker rather than a `setState(true)` in the effect — avoids `react-hooks/set-state-in-effect` AND suppresses celebration during a scope reload (so a returning user's already-shown badges can't re-celebrate from the empty new-scope shown set).
- Badges are derived from the visitor's own stats via `check()`. Migrate the DATA (test history) and badges follow — don't migrate badge records.

**Apply when:** touching `SupabaseAuthContext`, adding any account-only feature (gate for guests, don't block), persisting per-visitor state (scope it), or changing the guest history / migration path. Verify with the concurrent-hydrate and offline-save scenarios — they're the ones that bite.
