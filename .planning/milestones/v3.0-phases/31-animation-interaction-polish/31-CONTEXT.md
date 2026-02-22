# Phase 31: Animation & Interaction Polish - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Every interaction gets appropriate, consistent feedback. Buttons respond at the right tier, lists stagger smoothly, overlays exit gracefully, cards enter with scale+fade, and glass-morphism tiers are correctly applied across all screens in both light and dark mode. This is a polish/audit pass — unifying existing patterns, not creating new UI.

</domain>

<decisions>
## Implementation Decisions

### Button Press Feel

**Primary buttons — 3D chunky press:**
- Bold & playful depth effect — noticeable translateY + shadow shift, like a physical arcade button
- Visible 3D edge at rest (3-4px colored bottom edge) — always looks like a raised physical button
- Edge color is a darker shade of the button's own color (each button has its own edge tone)
- In dark mode, edge becomes lighter (rim-lit) instead of darker — premium glow effect
- Depth + color shift on press — button face darkens/saturates slightly when pressed
- Spring-back on release — slight bounce overshoot when releasing
- Lift on hover — slight translateY(-1px) + shadow increase previews the 3D interaction
- Fast down (~50ms), slow up (~200ms spring release) — snap down, bounce up
- Press depth varies by size — larger buttons press 4-5px, smaller ones 2-3px (proportional)
- Brief 50ms press-down acknowledgment before flip card animation fires
- Haptic pulse (10-15ms vibration via Vibration API) on primary button press (mobile)
- Quiz answer buttons get the same 3D chunky press treatment
- FABs/floating action buttons use the same primary 3D treatment (consistent, not unique)

**Secondary buttons — subtle scale:**
- Scale to ~0.97 + slight shadow reduction on press — tactile but clearly secondary
- Navigation tabs get secondary scale treatment
- Toggle switches and checkboxes get secondary scale on press

**Tertiary buttons — opacity:**
- Brief ease (~100ms) transition to ~0.7 opacity — smooth, not instant
- Link-style text buttons ("forgot password?", "skip") also get tertiary opacity treatment
- Icon-only buttons (close X, settings gear) use tertiary tier

**Disabled buttons:**
- Muted press animation — very subtle feedback (slight opacity change) to hint at interactivity

**TTS/audio buttons:**
- Tertiary tier press feedback + gentle pulse animation while TTS is actively speaking

**Explicit tier prop:**
- Button components expose tier via variant='primary'|'secondary'|'tertiary' prop — clear, auditable

**Focus ring:**
- Animated custom focus ring that fades in or pulses briefly when focused via keyboard navigation

**Reduced motion:**
- `prefers-reduced-motion` replaces all bounces/springs with instant state changes — full removal

**Claude's Discretion:**
- Ripple effect on primary buttons (whether to add Material-style ripple alongside 3D press)
- CSS vs motion/react implementation approach (hybrid suggested: CSS down, spring up)
- Async loading state blocking/debounce behavior during button press

### Stagger Behavior

**Enter animation:**
- Slide from below — items translateY up from ~10-15px below while fading in
- Fast cascade (~40ms) stagger delay between items — energetic ripple effect
- Spring physics via motion/react for natural deceleration with slight overshoot per item
- Stagger replays on every mount (not just first visit)
- Scroll-triggered stagger for items below the fold as they enter viewport
- Skeleton loading placeholders also stagger in, then crossfade to real content

**Grid layouts:**
- Row-by-row left-to-right stagger for grids (reading order)

**Horizontal lists:**
- Left-to-right stagger for horizontal lists (badge rows, tag chips)

**Long lists (15+ items):**
- Claude's discretion on whether to skip entirely or batch-stagger visible items
- For quiz lists (128 questions), batch-stagger only visible viewport items

**Accordion sections:**
- Items inside stagger when the section expands

**Exit animation:**
- Fade + slide out to the side when items are removed from a list

**Hero sections:**
- Hero variant with slower, more dramatic entrance — bigger slide distance, longer duration

**Number counters:**
- Count-up animation from 0 to final value for stats (score, streak, question count)

**Progress bars:**
- Animate fill from 0% to current value

**Low-end devices:**
- Auto-disable stagger on low-end devices (detected via hardware concurrency or frame rate)

**Reduced motion:**
- `prefers-reduced-motion` removes stagger entirely — all items appear simultaneously, no animation

**Card + stagger interaction:**
- Cards in lists get BOTH stagger timing (delayed entrance) AND the card scale(0.95→1)+fade animation — layered effect

**Claude's Discretion:**
- Dashboard stat cards treatment (stagger vs standalone card enter)
- Grouped vs individual stagger units for related items (label+description)
- Reorder animation for sorted lists
- Interrupted stagger handling (snap vs let go on early unmount)

### Overlay Exit Style

**Base exit animation:**
- Fade + scale(0.95) exit for ALL overlay types: dialogs, modals, tooltips, popovers
- Exit scales toward the origin element (button that opened it), not screen center
- Faster exit than enter — ~150ms exit vs ~250ms enter (dismissals feel snappier)
- Escape key triggers the same animated exit (not instant)

**Enter animation:**
- Dialogs enter with spring overshoot (scale past 1.0 then settle) — matches playful button style

**Backdrop:**
- Backdrop fades at the same speed as the modal — synchronized exit

**Confirmation dialogs:**
- Confirm action = quick confident exit
- Cancel action = slower fade-back
- Different exits reinforce the decision

**Toast exits:**
- Swiped toasts slide out (Phase 30 swipe behavior)
- Auto-dismissed or tapped toasts use fade+scale(0.95)

**Bottom sheets:**
- Slide down to exit (natural for their enter direction)

**Dropdowns:**
- Collapse toward their trigger element on exit

**Nested overlays:**
- Cascading exit — closing parent triggers children to exit first (fast), then parent exits

**Audio cues:**
- Subtle audio cue (soft click/pop) on overlay dismiss

**Reduced motion:**
- `prefers-reduced-motion` makes overlays hide instantly — no animation

### Glass-morphism Tiers

**Light tier:**
- Noticeable backdrop blur (8-12px) — clearly frosted, shows background shapes

**Dark mode treatment:**
- Smoky/dark glass — dark semi-transparent backgrounds with blur (tinted car window feel)
- Noise texture more visible in dark mode — adds richness to dark surfaces

**Visual features (all tiers):**
- Subtle semi-transparent white border highlight on all edges (light refraction effect)
- Subtle noise/grain SVG texture overlay for realistic frosted look
- Subtle shadow underneath glass panels (reinforces floating/depth feel)
- Heavy tier gets subtle colored tints from context (e.g., blue for modals, warm for success)

**Text readability:**
- Both moderate opacity increase AND subtle text-shadow — belt and suspenders for WCAG contrast

**Prismatic border integration:**
- Glass panels can combine with prismatic borders for premium look on key components

**Fallback (no backdrop-filter support):**
- Semi-transparent solid color fallback — still has layering, just no blur

**Low-end devices:**
- Reduce glass intensity — less blur, more opacity to preserve performance

**Claude's Discretion:**
- Exact blur values for medium and heavy tiers (light tier established at 8-12px)
- Component-to-tier assignment audit (which components get which tier)
- Glass token architecture (dedicated --glass-* tokens vs extending existing surface tokens)

</decisions>

<specifics>
## Specific Ideas

- Buttons should feel like physical arcade buttons — bold and playful, not corporate
- "Fast down, slow up" press timing — snap down instantly, spring back with bounce
- The 3D edge visible at rest makes buttons look like real raised objects
- Dark mode rim-lit edges (lighter instead of darker) for premium look
- Stagger should feel like a fast cascade/ripple, not slow reveal
- Number counters and progress bars should animate to their values — draws attention to stats
- Glass noise texture adds realism ("not too clean digital look")
- Smoky dark glass in dark mode — like tinted car windows
- Multi-sensory experience: visual animation + haptic feedback (Phase 30) + audio cues on overlay dismiss
- Prismatic borders + glass panels combined for hero/premium components

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 31-animation-interaction-polish*
*Context gathered: 2026-02-20*
