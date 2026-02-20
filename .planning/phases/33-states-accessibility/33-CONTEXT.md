# Phase 33: States & Accessibility - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Every screen gets polished loading, empty, and error states, and all users — including screen readers and reduced-motion — experience the full app without information loss. Covers Dashboard, Study Guide, Settings, all Progress Hub tabs, and SRS/flashcard screens. Focus management, live region announcements, and modal focus traps are also in scope.

</domain>

<decisions>
## Implementation Decisions

### Skeleton Screens
- **Style**: Shimmer sweep (left-to-right gradient) — fast ~1s cycle, feels energetic
- **Fidelity**: Approximate layout shapes — general blocks suggest the layout but don't mirror precisely; slight shift on load is acceptable
- **Color**: Accent-tinted shimmer — subtle tint of the app's primary color, not neutral gray
- **Background**: Skeleton blocks slightly lighter than the page surface — gives a 'raised' feel
- **Shape**: Rounded corners matching the app's existing card radius — visual continuity from skeleton to loaded content
- **Component**: Reusable `<Skeleton>` component with variants (card, text, avatar, etc.) — consistent and DRY
- **Entrance**: Staggered entrance — skeleton cards appear one by one with a slight stagger from top to bottom
- **Contextual shapes**: SRS/flashcard screens show a card-shaped skeleton outline; other screens use general blocks
- **Priority**: All screens with async content are equal priority — consistently polished across the app
- **Language**: Universal skeleton regardless of language mode — same layout in English and Burmese
- **Accessibility**: Skeleton has `aria-label` like "Loading [page name]..." so screen readers announce loading state
- **Dark mode**: Claude's discretion — adapt shimmer to dark theme appropriately
- **Timing threshold**: Claude's discretion — whether to show instantly or delay for fast loads
- **Inline scope**: Claude's discretion — whether inline refreshes within a page also get skeleton treatment
- **Detail level**: Claude's discretion — whether to include text-line placeholder bars per screen
- **Viewport fill**: Claude's discretion — how many skeleton cards to show per screen
- **Transition**: Claude's discretion — fade-in vs instant swap from skeleton to loaded content
- **Fast load suppression**: Claude's discretion — whether to suppress skeleton on sub-50ms loads
- **Tab switching**: Claude's discretion — skeleton vs cached content on Hub tab switches
- **React pattern**: Claude's discretion — Suspense boundaries vs manual loading state

### Empty States
- **Visual style**: Icons + text — large themed icon with descriptive text, clean and lightweight
- **Icon style**: Duotone — two-tone icons (outline + accent fill) for distinctive visual weight
- **Icon color**: Per-screen themed — each screen's icon uses a color from the category palette (e.g., History=blue, Achievements=gold)
- **Icon animation**: Subtle pulse or float animation — draws attention, feels alive (disabled under reduced-motion)
- **Tone**: Encouraging coach — warm, motivating messages: "You're just getting started! Begin your first study session to see progress here."
- **CTA**: Always include a primary CTA button — every empty state has a clear next-step button ("Start Studying", "Begin Practice", etc.)
- **Position**: Vertically centered in the content area — feels intentional and balanced
- **Component**: Reusable `<EmptyState>` component — `<EmptyState icon={...} title='...' description='...' action={...} />`
- **Dashboard**: Welcome + quick start for new users — "Welcome! Here's how to get started" with steps: 1) Pick a category 2) Start studying 3) Track progress
- **SRS Deck**: Brief explanation of spaced repetition — "Spaced repetition helps you remember — study cards come back at the right time" + CTA to start
- **Language**: Claude's discretion — whether empty state messages are bilingual matching current language setting
- **Achievements preview**: Claude's discretion — whether to show locked/greyed-out badges or text-only
- **Filter vs zero-data**: Claude's discretion — whether Hub History differentiates "never studied" from "no matches for filter"
- **Icon size**: Claude's discretion

### Error Recovery
- **Pattern**: Toast notification for the alert + inline fallback content where data would have been — hybrid approach satisfying STAT-03
- **Toast behavior**: Auto-dismiss with a 'Retry' action button in the toast itself
- **Retry button**: Icon + text — refresh icon + "Try Again" text for maximum clarity and accessibility
- **Auto-retry**: 1-2 silent retries with short delay before showing the error state to the user — avoids transient failures
- **Escalating retries**: After 3 manual retries, message changes to "Still having trouble? Check your connection or try later." — reduces frustration
- **Error tone**: Friendly/human — "Hmm, something went wrong loading your progress. Let's try again!"
- **Error icon**: Cloud-offline style — cloud with X or slash, suggests connectivity issue, less alarming
- **Error colors**: App palette muted — use existing muted/secondary colors with the error icon, blends with design (not red or amber)
- **Fallback content**: Stale cached data when available — show last successfully loaded version
- **Stale indicator**: Subtle banner at top of content area — "Showing cached data — Retry" — visible but not alarming
- **Offline banner**: Persistent top banner when fully offline — "You're offline — some features may be limited"
- **Reconnect animation**: Banner transitions to "Reconnecting..." with subtle animation, then "Back online!" before dismissing
- **Component**: Reusable `<ErrorFallback>` component — `<ErrorFallback icon={...} message='...' onRetry={...} fallbackContent={...} />`
- **Offline vs local errors**: Claude's discretion — whether IndexedDB errors look different from network errors
- **Retry rate limiting**: Claude's discretion
- **Error logging**: Existing Sentry integration handles this

### Reduced-Motion Alternatives
- **Confetti/celebrations**: Static badge/icon appears without animation — still rewarding, no motion
- **Mastery milestones**: Static overlay appears instantly with badge icon and congratulations text — no confetti, no animation on the overlay
- **Skeleton shimmer**: Disabled — show solid static blocks with no shimmer animation
- **Card flip**: Crossfade — front fades out, back fades in over ~200ms instead of 3D flip
- **StaggeredList**: Keep sequential timing (items appear one by one) but remove slide/fade motion — just appear
- **OS preference only**: No in-app toggle — respect `prefers-reduced-motion: reduce` from the operating system
- **Overall strategy**: Claude's discretion per animation type — instant vs crossfade based on what best preserves information
- **Skeleton stagger under reduced-motion**: Claude's discretion — keep consistent with other stagger decisions
- **Hover effects, page transitions, focus indicators**: Claude's discretion

### Claude's Discretion
- Focus management implementation approach (STAT-04)
- Screen reader live region announcement patterns (STAT-06)
- Modal/dialog focus trap implementation (STAT-07)
- All items noted "Claude's discretion" above

</decisions>

<specifics>
## Specific Ideas

- Three reusable components forming a "state pattern library": `<Skeleton>`, `<EmptyState>`, `<ErrorFallback>`
- Dashboard empty state should feel like a guided onboarding — steps-based welcome, not just a blank page
- SRS empty state should briefly educate about spaced repetition since the target audience (citizenship test takers) may not know the concept
- Offline banner should feel alive — animate the reconnection transition rather than just snapping away
- Error tone should match the app's encouraging personality — never scary or technical
- Skeleton shimmer should feel branded (accent-tinted) not generic

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 33-states-accessibility*
*Context gathered: 2026-02-20*
