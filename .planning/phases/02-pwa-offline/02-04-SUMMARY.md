---
phase: 02-pwa-offline
plan: 04
subsystem: pwa
tags: [pwa, install-prompt, welcome-modal, notifications, onboarding, bilingual]

# Dependency graph
requires:
  - phase: 02-01
    provides: PWA foundation with service worker and manifest
  - phase: 02-02
    provides: OfflineContext and OnlineStatusIndicator
provides:
  - useInstallPrompt hook for capturing beforeinstallprompt event
  - InstallPrompt bilingual modal with iOS fallback
  - WelcomeModal with offline tips and notification pre-prompt
  - NotificationPrePrompt for informed permission request
  - PWAOnboardingFlow orchestrating install-to-welcome lifecycle
affects: [02-05, 03-test-flow]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Lazy state initializer pattern (avoids setState in effects)
    - Pre-prompt pattern for notification permission
    - Install-to-welcome modal lifecycle management

key-files:
  created:
    - src/hooks/useInstallPrompt.ts
    - src/components/pwa/InstallPrompt.tsx
    - src/components/pwa/WelcomeModal.tsx
    - src/components/pwa/NotificationPrePrompt.tsx
  modified:
    - src/AppShell.tsx

key-decisions:
  - "Lazy state initializers for installed/dismissed detection (SSR-safe, lint-compliant)"
  - "7-day cooldown after user dismisses install prompt"
  - "Welcome modal shown once per device via localStorage flag"
  - "Notification pre-prompt explains value before native browser dialog"
  - "PWAOnboardingFlow as dedicated component in AppShell (not in OfflineContext)"

patterns-established:
  - "Lazy state initializer for browser API checks (avoid setState in effects)"
  - "Pre-prompt pattern: explain value before triggering native permission dialog"
  - "Install lifecycle: prompt -> install -> welcome -> app"

# Metrics
duration: 7min
completed: 2026-02-06
---

# Phase 02 Plan 04: Install Prompt & Welcome Flow Summary

**Bilingual install prompt with iOS fallback, post-install welcome modal with offline tips and notification pre-prompt**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-06T12:14:48Z
- **Completed:** 2026-02-06T12:22:13Z
- **Tasks:** 3
- **Files created:** 4
- **Files modified:** 1

## Accomplishments

- useInstallPrompt hook captures beforeinstallprompt event with SSR-safe lazy initializers
- InstallPrompt bilingual modal with native install (Chromium) and manual instructions (iOS)
- 7-day cooldown when user dismisses install prompt
- WelcomeModal with 3 bilingual tips: offline capability, auto-sync, home screen
- NotificationPrePrompt explains study reminders before triggering native permission dialog
- PWAOnboardingFlow component manages complete install-to-welcome lifecycle in AppShell

## Task Commits

Each task was committed atomically:

1. **Task 1: Create install prompt hook and component** - `7f5f02b` (feat)
2. **Task 2: Create welcome modal and notification pre-prompt** - `25a2545` (feat)
3. **Task 3: Integrate install and welcome flow into AppShell** - `a318dfe` (feat)

## Files Created/Modified

- `src/hooks/useInstallPrompt.ts` - Hook capturing beforeinstallprompt, standalone detection, dismiss cooldown
- `src/components/pwa/InstallPrompt.tsx` - Bilingual install modal with iOS fallback instructions
- `src/components/pwa/NotificationPrePrompt.tsx` - Bilingual card explaining notification value
- `src/components/pwa/WelcomeModal.tsx` - Post-install modal with tips and notification opt-in
- `src/AppShell.tsx` - Added PWAOnboardingFlow component with InstallPrompt and WelcomeModal

## Decisions Made

- **Lazy state initializers over useEffect setState:** ESLint `react-hooks/set-state-in-effect` rule flagged synchronous setState in useEffect. Refactored to compute initial state via lazy initializer functions passed to useState, which is both lint-compliant and avoids unnecessary re-renders.
- **PWAOnboardingFlow as local component:** Plan suggested adding state to OfflineContext, but the install/welcome flow is purely UI state localized to AppShell. Kept it as a dedicated inner component to avoid unnecessary context changes and re-renders across the app.
- **7-day cooldown via localStorage timestamp:** Dismissed prompt stores a future timestamp; prompt re-appears after expiry.
- **Welcome shown once per device:** `welcome-shown` localStorage flag prevents repeat display.
- **Notification pre-prompt pattern:** Explains value of study reminders in bilingual text before triggering the browser's one-shot permission dialog, increasing acceptance rates.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed setState-in-effect lint error in useInstallPrompt**

- **Found during:** Task 1 verification
- **Issue:** ESLint `react-hooks/set-state-in-effect` flagged `setIsInstalled(true)` and `setWasDismissed(true)` called synchronously in useEffect body
- **Fix:** Extracted standalone detection and dismissed-check logic into `getInitialInstalledState()` and `getInitialDismissedState()` functions, passed as lazy initializers to useState
- **Files modified:** `src/hooks/useInstallPrompt.ts`
- **Commit:** `7f5f02b`

**2. [Rule 2 - Missing Critical] Kept install/welcome state out of OfflineContext**

- **Found during:** Task 3 planning
- **Issue:** Plan suggested adding `isNewInstall` and `showWelcome` to OfflineContext, but this is purely UI display state that only AppShell needs
- **Fix:** Created PWAOnboardingFlow as a local component in AppShell, keeping OfflineContext focused on data caching and sync concerns
- **Files modified:** `src/AppShell.tsx`
- **Commit:** `a318dfe`

## Issues Encountered

None - all tasks completed successfully after lint fix.

## Next Phase Readiness

- Install prompt ready for first-visit users on all platforms
- Welcome modal ready to show after installation with offline tips
- Notification permission flow ready for future push notification feature
- All PWA onboarding UI components in place for remaining 02-phase plans

---
*Phase: 02-pwa-offline*
*Completed: 2026-02-06*

## Self-Check: PASSED
