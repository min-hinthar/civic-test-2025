# Phase 2: PWA & Offline - Context

**Gathered:** 2026-02-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can install the app on their home screen and study offline with full functionality — study guide, practice tests, and history review all work without connectivity. Data syncs automatically when connection returns. Push notifications remind users to study. This phase does NOT include social sharing, leaderboards, or spaced repetition scheduling.

</domain>

<decisions>
## Implementation Decisions

### Offline study experience
- Full app functionality offline: study guide, practice tests, review history — everything minus syncing
- All 100+ questions pre-cached on first visit (both English and Burmese)
- Bilingual content fully available offline — no degraded language experience
- Test results saved locally with notice: "Results saved offline — will sync when connected"
- Mid-session offline transition: subtle indicator appears (no interruption to current activity)
- No data freshness indicator — questions rarely change, staleness not a user concern
- Auto-sync with confirmation when back online: "Syncing your offline results..." then confirm when done
- iOS Safari: proactive one-time tip about opening app weekly to keep data saved (no persistent storage API request)

### Install & onboarding
- Install prompt shown immediately on first visit
- Install prompt bilingual (English + Burmese)
- App icon: language-neutral design; splash screen: bilingual text
- App name on home screen: "US Civics အမေရိကန်နိုင်ငံရေး"
- Theme color: patriotic blue (#002868) for browser bar and status bar
- Post-install: single welcome modal explaining offline capability and key tips
- Notification permission request happens during install onboarding welcome modal
- Pre-prompt before browser's native notification dialog: friendly bilingual explanation of why

### Sync & conflict handling
- Multi-device conflict resolution: keep all results (no data loss, history shows everything)
- Auto-retry with exponential backoff on sync failure, plus manual "Retry now" button
- Sync feedback: syncing icon in header during sync + toast notification when complete
- Pending sync: badge count on sync icon showing number of unsynced items (e.g., "3")
- Requires login before saving test results — no anonymous offline data migration
- Sync happens over any network (WiFi or cellular) — data is tiny
- All sync status and error messages bilingual (English + Burmese)

### Status indicators & notifications
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

</decisions>

<specifics>
## Specific Ideas

- Home screen app name is bilingual: "US Civics အမေရိကန်နိုင်ငံရေး"
- Theme color is specifically US flag navy blue (#002868) — feels official and trustworthy
- iOS tip should be warm and practical, not alarming — framed as helpful advice, not a warning
- Notification pre-prompt should feel like a friendly suggestion, not a demand
- Green/orange color scheme for online/offline status — orange is more visible than gray for offline state

</specifics>

<deferred>
## Deferred Ideas

- Share button on milestone notifications — Phase 7 (Social Features) will add sharing capability to notifications
- Shareable achievement cards from milestones — Phase 7

</deferred>

---

*Phase: 02-pwa-offline*
*Context gathered: 2026-02-05*
