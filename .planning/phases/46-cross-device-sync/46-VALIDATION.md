---
phase: 46
slug: cross-device-sync
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 46 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test -- --run` |
| **Full suite command** | `pnpm test:run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test -- --run`
- **After every plan wave:** Run `pnpm test:run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SYNC-01 | unit | `pnpm test -- --run src/lib/srs/srsSync.test.ts` | Existing | ⬜ pending |
| TBD | TBD | TBD | SYNC-02 | unit | `pnpm test -- --run src/lib/bookmarks/bookmarkSync.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SYNC-03 | unit | `pnpm test -- --run src/lib/settings/settingsSync.test.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SYNC-04 | unit | `pnpm test -- --run src/lib/social/streakSync.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/bookmarks/bookmarkSync.test.ts` — stubs for SYNC-02 (mergeBookmarks, sync push/pull)
- [ ] `src/lib/settings/settingsSync.test.ts` — stubs for SYNC-03 (mapRowToSettings, mapSettingsToRow)
- [ ] `src/lib/social/streakSync.test.ts` — stubs for SYNC-04 (enhanced mergeStreakData with freeze recalculation)

*Existing infrastructure covers SYNC-01 (srsSync already tested).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Settings appear on second device | SYNC-03 | Requires real Supabase + two devices | 1. Change theme on Device A 2. Open app on Device B 3. Verify theme matches |
| Bookmarks appear on second device | SYNC-02 | Requires real Supabase + two devices | 1. Bookmark question on Device A 2. Open app on Device B 3. Verify bookmark present |
| Streak consistent across devices | SYNC-04 | Requires real multi-day activity data | 1. Record activity on Device A 2. Sync on Device B 3. Verify streak count matches |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
