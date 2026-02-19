# Phase 20: Session Persistence - Context

**Gathered:** 2026-02-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Users never lose progress from interrupted sessions. The app persists active session state to IndexedDB and prompts users to resume where they left off. Covers mock test, practice, and interview session types. Storage is local-only (no Supabase sync). Cross-device resume is out of scope.

</domain>

<decisions>
## Implementation Decisions

### Resume Prompt UX
- **Modal dialog** — centered overlay, non-dismissible (no backdrop close). Must choose Resume, Start Fresh, or Not Now
- **Detailed info** — session type + progress (Q8/20) + score so far (6/8) + time remaining (if timed) + relative timestamp ("2 hours ago")
- **Three actions**: Resume, Start Fresh, Not Now
  - Resume: brief loading animation (~0.5-1s) before session restores
  - Start Fresh: requires confirmation before discarding ("Are you sure? Your progress will be lost.")
  - Not Now: dismisses modal, keeps session saved. Modal re-appears every visit to the relevant page
- **Trigger**: modal shows when user navigates to the test/practice/interview page that has saved sessions (not on any app launch)
- **Multiple sessions**: if multiple saved sessions exist, show all as stacked cards inside the same modal (dashboard-style card layout)
- **Bilingual**: modal text follows language mode (Myanmar mode shows Burmese)
- **Keyboard support**: full keyboard nav with focus trap inside modal. Auto-focus the Resume button so Enter resumes immediately
- **Animation**: animated entrance (slide-up or scale-in)
- **Friendly tone**: title like "Welcome back!" or "Pick up where you left off"
- **Visual distinction**: different icon and accent color per session type (mock test vs practice vs interview)
- **Card style**: match existing dashboard card design (rounded corners, subtle shadow, icon left)

### Claude's Discretion (Resume UX)
- Card preview content (question snippet vs metadata only)
- Start Fresh confirmation style (inline swap vs sub-dialog)

### Session Capture Scope
- **All three session types**: Mock Test, Practice, and Interview sessions are all persisted
- **24-hour expiry**: all session types expire after 24 hours (uniform rule)
- **Auto-clean on complete**: once a session is submitted/scored, saved state is immediately deleted from IndexedDB
- **IndexedDB only**: local device storage, no Supabase cloud sync
- **Save frequency**: Claude's discretion (on every answer recommended for safety)

### Claude's Discretion (Capture Scope)
- Exact state captured per session type (question index, answers, timer, shuffle order, filters)
- Interview state capture depth (question progress vs full transcript)
- Maximum concurrent session limit
- Practice session filter preservation on resume

### Countdown & Timer Behavior
- **Fresh timer on resume**: timer resets to full duration when resuming a timed session (generous — user gets full time back)
- **All timed sessions**: countdown appears for every timed mock test start, not just resumed ones
- **Fixed at 5 seconds**: always 5-4-3-2-1-Go!
- **Full-screen overlay**: large centered number with circular progress ring + scale/fade animation on each number
- **Extra large + bold** number styling — oversized, impactful (sports countdown feel)
- **Circular ring**: accent/contrast color (not primary blue). Ring depletes as each second passes
- **Tick sound on every number**: subtle tick audio on 5, 4, 3, 2, 1. Different "start" chime on "Go!"
- **"Go!" message**: brief (~0.5s) "Go!" text after "1", bilingual (follows language mode)
- **Context subtitle**: show session info underneath number ("Mock Test — Q8/20" for resumed, "Mock Test — 10 Questions" for new)
- **Skip button**: "Tap to start" appears after 1-2 second delay. Allows users to bypass the countdown
- **Reduced motion**: respects `prefers-reduced-motion` — simplified animations (just numbers, no scale/ring)

### Claude's Discretion (Countdown)
- Overlay background style (blurred backdrop vs solid)
- Number and ring color
- Keyboard skip interaction (Space/Enter vs any key)
- Performance fallback for low-end devices

### Dashboard Indicator
- **Banner card** at top of dashboard: amber/orange accent color + clock/pause icon. Shows "Unfinished Mock Test — 2 hours ago"
- **Minimal teaser**: just session type + relative timestamp. Full details in the resume modal
- **Show all sessions**: if multiple unfinished sessions exist, show one banner card per session (stacked)
- **Dismissible**: small X button to hide. Banner returns on next dashboard visit (not permanently dismissed)
- **Tapping navigates**: banner tap navigates to the relevant test/practice page where the resume modal shows (not direct resume)
- **Bilingual**: banner text follows language mode
- **Entrance animation**: slide-in when dashboard loads
- **Dismiss animation**: slide-out or fade when X is tapped
- **Nav badge**: number badge on relevant nav items showing count of saved sessions
- **Light haptic feedback**: subtle vibration on mobile when tapping the banner Resume area

### Claude's Discretion (Dashboard)
- Banner card position relative to NBA card and other dashboard content
- NBA card integration (whether "Resume session" becomes a suggested next best action)
- Nav badge placement (per-item or combined)

</decisions>

<specifics>
## Specific Ideas

- "Welcome back!" friendly tone for the resume modal — warm and encouraging, not clinical
- Countdown should feel like a game starting — dramatic, full-screen, with energy
- Banner cards should match the existing dashboard card style for visual consistency
- Distinct icons/colors per session type so users immediately recognize what they left off
- The whole flow should be bilingual following Phase 18 language mode patterns

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 20-session-persistence*
*Context gathered: 2026-02-14*
