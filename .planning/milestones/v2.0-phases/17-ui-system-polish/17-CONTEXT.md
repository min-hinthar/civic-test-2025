# Phase 17: UI System Polish - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply premium visual polish across the entire app: glass-morphism on all surfaces, micro-interactions on interactive elements, 44px+ touch targets, and refined dark mode with frosted glass. This is purely visual/interaction polish — no new features, no layout changes, no data model changes.

</domain>

<decisions>
## Implementation Decisions

### Glass-morphism style
- Heavy blur (24px+) across all glass surfaces
- Three glass tiers: heavy (sidebar, nav, modals), medium (hero cards like NBA card), light (regular cards)
- All surfaces get glass: navigation, cards, modals, flashcard, floating elements
- Gradient prismatic shimmer border on ALL glass surfaces (nav, cards, sidebar, bottom bar, modals)
- Shimmer is animated — continuous rainbow/prismatic light sweep along borders
- On prefers-reduced-motion: shimmer freezes but prismatic gradient stays visible (static)
- Glass surfaces have both inner light reflection (top edge) AND drop shadow (below) for full depth
- Glass fallback for no-backdrop-filter browsers: Claude's discretion
- GlassCard API design: Claude's discretion (tier variants vs className overrides)
- Reference: Apple iOS 18 (Control Center, widgets, notification panels)

### Background treatment
- Subtle gradient mesh background (fixed, does not scroll with content)
- Brand purple + blue color blobs
- Moderate visibility (15-25% opacity)
- Content scrolls over the fixed mesh — glass surfaces blur different parts as you scroll

### Prismatic border details
- Rainbow/prismatic multi-color light refraction effect
- Animated shimmer — continuous movement along border edges
- Shimmer speed: Claude's discretion per surface size
- Same speed in both light and dark mode
- Bottom tab bar gets full glass with prismatic shimmer too

### Micro-interaction feel
- Overall personality: Playful + bouncy (spring animations with visible overshoot)
- Button press: Scale down (95%) + prismatic glow flare + color shift (triple feedback)
- Tab switching: Combined pop/scale on active icon + indicator slides with spring bounce + content morphs
- Card hover/press: Lift up (increased shadow) AND prismatic border glow intensifies
- Progress bars/rings: Spring fill from 0 (with overshoot) + simultaneous number count-up
- Flashcard flip: Spring bounce (slight overshoot past 180°) + prismatic refraction during rotation
- Toggle switches: Spring bounce on knob + smooth color morph transition
- Page transitions: Scale down + fade on outgoing page, slide in on incoming, shared element transitions
- List items (study guide, history): Staggered spring pop entrance (items pop in one by one with delay)
- Badge celebration: Prismatic ripple expanding outward from badge
- Success/error states: Color pulse (green/red flash) AND animated icon (check bounces, X shakes)
- Streak fire icon: Gentle pulse animation when streak is alive
- SRS badge count: Pulse when reviews are due
- 100% mastery celebration: Prismatic burst + confetti when score reaches 100%
- Interview simulation: Typing indicator dots during wait + pulsing prismatic glow when question appears
- Scroll physics: Rubber-band overscroll at page edges (iOS-like)
- Loading skeletons: Prismatic shimmer on skeleton placeholders (matching glass border colors)
- Theme toggle: Circular reveal from toggle button position (dark mode expands as circle, light mode dissolves)
- No parallax on dashboard — everything scrolls together

### Touch target strategy
- Mixed approach: visually increase size for icon buttons, invisible expanded hit areas for inline links
- Icon-only buttons: 48px minimum (Material Design standard)
- Bottom tab bar: icon + label area is tappable (not full section strip) — prevents accidental taps
- Tap spacing between elements: Claude's discretion (audit and fix where misclicks are likely)
- Text links: Convert to pill-shaped/button-like links with proper padding
- Study guide question rows: Convert to full-width tappable card-style rows with generous padding
- Flashcard: Keep current tap-to-flip behavior (no changes)
- Mock test answer buttons: Claude audits and adjusts if below 44px minimum
- Form elements (state picker, search, toggles): 48px minimum height

### Dark mode refinement
- Frosted glass tint: Subtle brand purple tint in dark glass surfaces
- Border glow: Adaptive intensity — subtle by default, brighter on hover/focus
- Prismatic shimmer in dark: Neon-bright rainbow (full spectrum with glowing intensity)
- Mesh gradient background in dark: Deep purple + dark magenta (richer/more dramatic than light mode)
- Surface elevation: Both color hierarchy (lighter at higher elevation) AND increased glass blur — double depth cue
- Text color in dark mode: Claude's discretion (optimize for WCAG contrast on purple-tinted surfaces)
- Image/icon dark treatment: Claude's discretion per element type
- Gradient overlays (NBA hero, interview cards): Deeper and more saturated in dark mode
- Theme toggle animation: Dark reveals as circular expansion, light dissolves away (asymmetric)
- General dark mode audit: Check for low contrast text and inconsistent surface colors
- Shimmer speed: Same in both themes

### Claude's Discretion
- Glass surface opacity levels per tier (optimized for readability)
- Backdrop-filter fallback strategy
- GlassCard component API design
- Shimmer animation speed per surface size
- Tap spacing enforcement (audit-based)
- Mock test button sizing (audit-based)
- Dark mode text warmth (WCAG-driven)
- Dark mode image/icon treatment per element

</decisions>

<specifics>
## Specific Ideas

- "Apple iOS 18" as the primary glass-morphism reference (Control Center, widgets, notification panels)
- Prismatic borders should look like light refracting through glass — rainbow multi-color, not single-tone
- Theme toggle uses circular reveal (like Telegram's theme switch) — dark expands from toggle, light dissolves
- The overall feel should be premium and iOS-inspired but with playful bouncy personality (not sterile)
- Glass flashcard — both front and back of the 3D flip card get frosted glass treatment
- NBA hero card gets hero-tier glass (heavier than regular cards) for visual prominence
- Interview typing dots + pulsing glow creates a conversational feel for the interviewer simulation
- Neon-bright prismatic borders in dark mode for a distinctive glowing-in-the-dark atmosphere

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-ui-system-polish*
*Context gathered: 2026-02-11*
