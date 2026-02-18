# Phase 24: Accessibility & Performance - Context

**Gathered:** 2026-02-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the app meet WCAG 2.2 accessibility standards (screen reader support, keyboard navigation, timing adjustable, reduced motion), establish performance monitoring (Web Vitals, bundle analysis), and fix known flashcard UI bugs across devices. No new features — this phase improves the usability and observability of existing functionality.

</domain>

<decisions>
## Implementation Decisions

### Screen Reader Flow — Quiz/Practice
- Practice mode: verdict + explanation announced ("Correct. [Brief explanation]." or "Incorrect. The answer is [X]. [Brief explanation].")
- Mock test feedback level: Claude's discretion (likely simpler verdict given simulation fidelity)
- Question navigation announcement: Claude's discretion (auto-announce vs focus move)
- Interview chat messages: Claude's discretion (ARIA live region vs focus management)

### Screen Reader Flow — Sort Mode & Flashcards
- Sort result announcement (tally, next card): Claude's discretion
- Card flip announcement: Claude's discretion
- Milestone/streak/XP celebrations: MUST be announced to screen readers via ARIA live regions

### Screen Reader Flow — Progress & Navigation
- Segmented progress bar: full per-segment labels ("Question 3: Correct", "Question 7: Skipped") — each segment individually labeled
- Dashboard page load summary: Claude's discretion
- Skip-to-content link: Claude's discretion (evaluate SPA architecture need)

### Screen Reader Flow — Controls & Notifications
- Language toggle: full context labels ("Language: English only. Press to switch to bilingual English and Burmese.")
- TTS button labels: Claude's discretion (descriptive vs generic)
- Form input labels: Claude's discretion (visible labels vs ARIA-only per input)
- Toast notifications: ALL toasts must be accessible via ARIA live regions (assertive for errors, polite for success/info)
- SRS card metadata: Claude's discretion

### Color Contrast
- Spot check only — audit known problem areas (muted text, disabled states, colored backgrounds) in both light and dark themes
- Do NOT do full token audit — trust primary tokens are compliant

### Focus Styles
- Keep current `focus:ring-2` styles — audit for consistency across components but don't redesign

### Reduced Motion
- Overall philosophy: Claude's discretion per animation type (some may fade, others may reduce intensity)
- Flashcard 3D flip: Claude's discretion (instant swap vs subtle flip)
- Sort mode swipe: Claude's discretion (fade out vs quick slide)
- Countdown overlay: Claude's discretion (numbers without bounce vs skip)
- PillTabBar pill slide: Claude's discretion (check existing useReducedMotion implementation)
- Streak/XP celebrations: static version (show badge/score without animation, screen reader announcement covers it)
- In-app motion toggle: Claude's discretion (OS-only vs in-app override)

### Timer — Per-Question Timer (NEW)
- Per-question timer: 30 seconds, circular progress indicator near question number
- Timer color: green (>50%) → yellow (20-50%) → red (<20%) visual urgency
- Warning at 5 seconds: sound tick + haptic vibration
- Timer pauses during feedback phase (after Check, while user reads explanation)
- Auto-submit on expiry: if answer selected → submit it; if none → mark as skipped
- Toggle: optional in practice mode, ON by default (checkbox on PreTestScreen)
- No per-question timer in interview mode (conversational pacing handles it)
- Mock test: shows BOTH overall timer and per-question 30s timer
- Per-question expiry priority in mock test: Claude's discretion

### Timer — Extension (WCAG 2.2.1)
- Extension available in practice mode only — NOT in mock test (simulation fidelity)
- Trigger: appears when 20% of per-question time remaining (6 seconds)
- Presentation: toast/banner slides in with "Extend?" button
- Toast auto-dismisses after 5 seconds if not tapped — reappears on next question if needed
- Multiple extensions allowed (no limit) — time pressure shouldn't block learning
- Each extension adds 50% of original time (15 seconds)

### Performance — Web Vitals & Monitoring
- Web Vitals integration approach: Claude's discretion (Sentry BrowserTracing vs web-vitals library)
- Performance budgets / CI enforcement: Claude's discretion
- Sentry RUM sampling rate: Claude's discretion
- Lighthouse CI: Claude's discretion
- React rendering profiling: Claude's discretion (React Compiler rules may make this unnecessary)
- IDB performance profiling: Claude's discretion
- Route prefetching: Claude's discretion

### Performance — Bundle & Assets
- Bundle analyzer: YES — add @next/bundle-analyzer as dev dependency for on-demand analysis
- Font loading: optimize — preload Myanmar font, ensure font-display: swap, reduce layout shift
- Image optimization: Claude's discretion (app is mostly SVG/text)
- Code splitting: Claude's discretion (evaluate if route-level splitting helps)
- Service worker caching: review and audit current @serwist/next configuration for optimal caching strategy

### Flashcard Bug Fixes (included in Phase 24)
- Swipe not registering on mobile — investigate gesture threshold and touch event handling
- Swipe animation freezes on mobile — slow animation then stuck state
- Back face visible through front face — backfaceVisibility CSS issue
- Card flickering during flip animation — shows both faces briefly
- Deck cards below are transparent — z-index/stacking context issue with 3D transforms
- Flipping moves the card below it — layout shift during flip animation
- Swipe has overlay UI issue — UI elements overlap or interfere during swipe gesture
- Auto-read timing — fires before card animation completes or reads wrong card
- Speech button background becomes transparent when active — CSS stacking context with 3D card transforms

### Claude's Discretion
- Many individual implementation decisions delegated (see items marked "Claude's discretion" above)
- Overall pattern: user specified WHAT behaviors they want; Claude has flexibility on HOW to implement them
- Key locked decisions: per-question timer design, segment labels, celebration announcements, toast accessibility, font optimization, bundle analyzer, flashcard bug fixes scope

</decisions>

<specifics>
## Specific Ideas

- Per-question timer as circular progress ring with color transitions (green/yellow/red)
- Extension toast auto-dismisses in 5s and reappears next question — non-intrusive but available
- "Verdict + explanation" for practice mode screen reader feedback — learning context matters
- Flashcard bugs should be fixed as part of this phase (not a separate batch) since they affect usability
- Spot check contrast, don't do full token audit
- Keep existing focus ring styles, just audit consistency

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 24-accessibility-performance*
*Context gathered: 2026-02-17*
