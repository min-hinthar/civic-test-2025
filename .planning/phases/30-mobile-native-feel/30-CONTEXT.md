# Phase 30: Mobile Native Feel - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the PWA feel like an installed native app on mobile. Eliminate web-app artifacts (rubber-band overscroll, accidental text selection, tap highlight flash), add proper safe area handling for modern devices (Dynamic Island, home indicator), swipe-to-dismiss toasts with physics-based gestures, and a haptic feedback utility with named patterns integrated into key interactions.

</domain>

<decisions>
## Implementation Decisions

### Haptic Feedback

**Tier system: 3 tiers**
- **Light** — every button tap, toggle switch, navigation tap (bottom tab, sidebar, back), TTS speak button
- **Medium** — card flip, answer grading (same for correct/incorrect), mic record start/stop
- **Heavy (multi-burst)** — streak reward, badge unlock, milestone celebration. Pattern: rapid burst sequence (ta-da-da), not single pulse

**Scope of coverage:**
- Haptics fire on EVERY interactive tap (not just meaningful state changes) — full native feel
- Navigation taps (bottom tab bar, sidebar links, back button) all get light haptic
- Toggle switches fire haptic on tap (immediate), not on state change
- TTS speak button gets light tap on press (confirms tap registered despite TTS latency)
- Share button: light on tap + medium on success (copy confirmed / share sheet opened)
- Swipe gestures: light at dismiss threshold ("ready") + medium on dismiss ("done")
- Mic record button: medium on start, light on stop (distinct from regular buttons)

**Migration:**
- Migrate existing inline `navigator.vibrate(10)` calls (e.g. FlagToggle) to the new `haptics.ts` utility — single source of truth

**Settings:**
- No in-app toggle. Respect OS-level vibration setting only. iOS doesn't expose vibrate API anyway (graceful no-op).

**Phase boundary:**
- 3D chunky button press haptics deferred to Phase 31 (when that button is built)
- Phase 30 creates the utility + integrates into all existing components

### Swipe-to-Dismiss Toasts

**Direction:** Either direction (left or right) — doesn't matter which thumb

**Physics:**
- Spring-back if swiped partially but not past threshold
- Velocity-aware: fast flick dismisses even if short distance
- Slight elastic resistance at start of drag (prevents accidental dismiss from casual touch)
- Auto-dismiss timer pauses while user is touching/dragging

**Visual feedback during drag:**
- Progressive opacity fade proportional to drag distance
- Subtle background dimming (5-10% opacity) during drag only
- On dismiss: toast flies off in swipe direction with momentum + faint ghost trail effect
- Clean spring-back animation if not dismissed

**Desktop:**
- X button (hover-revealed) for desktop users + swipe still works on desktop via mouse drag

**Error toasts:** Claude's discretion on whether error/warning toasts should require explicit action vs swipeable

**Toast stacking:** Claude's discretion on whether multiple stacked toasts are each individually swipeable or only the top one

**Drag surface:** Claude's discretion based on whether toasts have interactive elements inside them (entire surface vs drag handle)

**Toast positioning:** Claude's discretion — evaluate current position and whether mobile should move to bottom-center above tab bar

### Safe Area Insets

**Approach:** CSS `env()` variables (`safe-area-inset-top`, `safe-area-inset-bottom`, etc.)

**Application scope:** Claude's discretion on whether to apply in all modes or PWA standalone only (based on how env() values behave in browser vs standalone)

**Header (GlassHeader):** Glass background extends behind the Dynamic Island / status bar area. Content starts below safe area inset. Premium native feel.

**Bottom tab bar:** Glass effect extends into the home indicator zone. Content scrolls behind it. Like native iOS tab bars.

**Bottom-fixed elements:** Claude's discretion on auditing all bottom-fixed elements (floating buttons, bottom sheets) and applying safe area where needed

**Orientation:** Portrait only — lock in PWA manifest. No landscape support needed.

**Display mode:** `display: standalone` in manifest (not fullscreen)

**Scroll bounce:** Allow iOS-native scroll bounce inside content areas. Only kill overscroll at the page body level to prevent white flash.

**Viewport:** Claude's discretion on viewport-fit=cover (required for env() insets)

**Theme color:**
- Match app theme (light/dark background color)
- Dynamic update when user toggles dark mode (update meta theme-color)

**Tailwind integration:** Extend Tailwind config with safe area utility classes (`pt-safe`, `pb-safe`, etc.)

**No debug overlay** — test on real devices/simulators

### Selection & Overscroll Guards

**User-select:** Claude's discretion on global vs targeted approach. Key constraint: long-press should enable text selection on educational content (questions, answers, explanations, Burmese text) for copying.

**Context menu:** Disable on UI elements (buttons, icons, flags, cards). Keep on text content where long-press enables selection.

**Double-tap zoom:** `touch-action: manipulation` globally — disables double-tap zoom while keeping pinch-zoom and scroll

**Tap highlight:** Remove `-webkit-tap-highlight-color: transparent` globally. Phase 31 adds proper press animations.

**Overscroll-behavior:** Claude's discretion on all-modes vs standalone-only. Prevent Chrome's pull-to-refresh in PWA to avoid accidental reload during study sessions.

**Font smoothing:** `-webkit-font-smoothing: antialiased` globally for crisper text

**Text size adjust:** Claude's discretion on locking `text-size-adjust: 100%` vs allowing Safari's accessibility scaling

### Claude's Discretion
- Toast positioning (current vs mobile bottom-center)
- Error toast dismissibility (swipeable vs require action)
- Toast stacking swipe behavior (individual vs top-only)
- Drag surface area for toasts
- overscroll-behavior scope (all modes vs standalone-only)
- user-select strategy (global + whitelist vs targeted)
- viewport-fit=cover implementation
- text-size-adjust behavior
- Bottom-fixed element safe area audit scope
- Safe area application scope (all modes vs standalone-only)

</decisions>

<specifics>
## Specific Ideas

- Haptic celebration pattern should feel like "ta-da-da" — multi-burst, festive
- Swipe dismiss should feel physical: elastic start resistance, momentum fly-off, ghost trail
- Toast drag should have progressive fade + subtle background dim (5-10%) for focus
- GlassHeader and BottomTabBar should extend their glass effects into safe area zones (like native iOS chrome)
- Spring-back animation on partial swipe — feels physical and forgiving
- Share button gets double haptic: light on tap, medium on success (like iOS copy feedback)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 30-mobile-native-feel*
*Context gathered: 2026-02-19*
