# Phase 31: Animation & Interaction Polish - Research

**Researched:** 2026-02-20
**Domain:** Motion/react animation system, CSS glass-morphism, button interaction tiers, stagger patterns
**Confidence:** HIGH

## Summary

Phase 31 is a polish/audit pass that unifies and elevates the existing animation and interaction patterns across all screens. The project already has a mature motion infrastructure: `motion/react` v12.33+ with spring configs in `motion-config.ts`, glass-morphism tiers with CSS custom properties, a 3D chunky button system, staggered list components, and haptic feedback utilities. The existing `Button.tsx` already has 3D chunky press (primary) and spring physics. The existing `StaggeredList.tsx` already has stagger-on-mount with configurable timing. The existing `Dialog.tsx` already has enter animations with spring physics. The existing `GlassCard.tsx` already has three tiers (light/medium/heavy).

The primary gap is **consistency and coverage**: buttons outside the `Button` component lack tier-appropriate feedback, the Dialog/overlay system lacks exit animations (no `AnimatePresence` wrapping, no `forceMount`), `StaggeredList` does not scale timing by list length or skip for long lists, and card components do not consistently use scale(0.95->1)+fade enter animations. Glass-morphism is applied across components but needs an audit for correctness (some components use raw `glass-light` classes directly without `GlassCard`, and the noise/grain texture described in CONTEXT.md does not exist yet).

**Primary recommendation:** This is an audit-and-enhance phase. Refactor existing components for consistency rather than building new infrastructure. Add exit animations to Dialog via `forceMount` + `AnimatePresence`, add tier prop to Button for explicit secondary/tertiary behavior, enhance StaggeredList with adaptive timing, add card enter animations, and audit glass tier assignments.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Button Press Feel:**
- Primary buttons: 3D chunky press with visible 3D edge at rest (3-4px colored bottom edge), edge color is darker shade of button's own color, dark mode rim-lit (lighter) edges, depth+color shift on press, spring-back on release, lift on hover, fast down (~50ms) slow up (~200ms spring), press depth varies by size, brief 50ms press-down acknowledgment before flip card animation, haptic pulse (10-15ms) on primary press (mobile), quiz answer buttons get same 3D chunky treatment, FABs use same primary treatment
- Secondary buttons: Scale to ~0.97 + slight shadow reduction on press, navigation tabs get secondary scale, toggle switches and checkboxes get secondary scale
- Tertiary buttons: Brief ease (~100ms) transition to ~0.7 opacity, link-style text buttons get tertiary, icon-only buttons (close X, settings gear) use tertiary tier
- Disabled buttons: Muted press animation (slight opacity change)
- TTS/audio buttons: Tertiary tier press + gentle pulse while speaking
- Explicit tier prop: variant='primary'|'secondary'|'tertiary'
- Animated custom focus ring that fades in/pulses on keyboard navigation
- `prefers-reduced-motion` replaces all bounces/springs with instant state changes

**Stagger Behavior:**
- Slide from below (translateY up from ~10-15px while fading in)
- Fast cascade (~40ms) stagger delay between items with spring physics
- Stagger replays on every mount (not just first visit)
- Scroll-triggered stagger for items below the fold
- Skeleton loading placeholders also stagger in, then crossfade to real content
- Row-by-row left-to-right stagger for grids (reading order)
- Left-to-right stagger for horizontal lists
- Items inside accordion sections stagger when section expands
- Fade + slide out to the side when items are removed from a list
- Hero variant with slower, more dramatic entrance
- Count-up animation for stats, animate fill for progress bars
- Auto-disable stagger on low-end devices (hardware concurrency or frame rate)
- `prefers-reduced-motion` removes stagger entirely
- Cards in lists get BOTH stagger timing AND scale(0.95->1)+fade

**Overlay Exit Style:**
- Fade + scale(0.95) exit for ALL overlay types
- Exit scales toward origin element (button that opened it), not screen center
- Faster exit than enter (~150ms exit vs ~250ms enter)
- Escape key triggers same animated exit (not instant)
- Dialogs enter with spring overshoot
- Backdrop fades synchronized with modal
- Confirm = quick confident exit, cancel = slower fade-back
- Swiped toasts slide out (already in Phase 30), auto-dismissed/tapped toasts use fade+scale(0.95)
- Bottom sheets slide down to exit
- Dropdowns collapse toward trigger element
- Nested overlays cascade exit (children first, then parent)
- Subtle audio cue on overlay dismiss
- `prefers-reduced-motion` makes overlays hide instantly

**Glass-morphism Tiers:**
- Light tier: 8-12px blur, clearly frosted
- Dark mode: smoky/dark glass with tinted car window feel, noise texture more visible
- All tiers: subtle semi-transparent white border, noise/grain SVG texture overlay, subtle shadow underneath, heavy tier gets subtle colored tints
- Text readability: moderate opacity increase AND subtle text-shadow for WCAG contrast
- Prismatic border integration for premium look
- Fallback for no backdrop-filter support
- Low-end devices: reduce glass intensity

### Claude's Discretion

**Buttons:**
- Ripple effect on primary buttons (Material-style ripple alongside 3D press)
- CSS vs motion/react implementation approach (hybrid suggested: CSS down, spring up)
- Async loading state blocking/debounce behavior during button press

**Stagger:**
- Dashboard stat cards treatment (stagger vs standalone card enter)
- Grouped vs individual stagger units for related items (label+description)
- Reorder animation for sorted lists
- Interrupted stagger handling (snap vs let go on early unmount)
- Long lists (15+ items): whether to skip entirely or batch-stagger visible items

**Glass-morphism:**
- Exact blur values for medium and heavy tiers (light tier established at 8-12px)
- Component-to-tier assignment audit (which components get which tier)
- Glass token architecture (dedicated --glass-* tokens vs extending existing surface tokens)

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Button press feedback tiers: 3D chunky (primary), subtle scale (secondary), opacity (tertiary) | Button.tsx already has 3D chunky for primary. Needs: explicit tier prop, secondary scale(0.97) + shadow reduction, tertiary opacity(0.7) transition, dark mode rim-lit edges. BilingualButton.tsx also needs alignment. All inline button styling across codebase needs audit. |
| ANIM-02 | StaggeredList coverage audit -- all item lists use stagger with cap at 8-10 items | StaggeredList.tsx exists with configurable stagger/delay. Used in 22 files. Needs: adaptive timing (scale by count, cap at 8-10, skip 15+), scroll-triggered viewport stagger, exit animations, hero variant, grid row-by-row support. |
| ANIM-03 | Exit animations on all overlays (dialogs, modals, tooltips, toasts) -- fade + scale(0.95) | Dialog.tsx has enter animation but NO exit animation (no AnimatePresence, no forceMount). Toast already has swipe-to-dismiss exit from Phase 30. Needs: Dialog refactor with forceMount + AnimatePresence, tooltip exit animations, audio cue on dismiss. |
| ANIM-04 | Consistent card enter animation -- scale(0.95->1) + fade for all card components | Card.tsx has hover animation but no enter animation. GlassCard.tsx has no animation at all. Needs: motion wrapper or CSS animation for scale(0.95->1)+fade on mount across Card, GlassCard, and inline glass-light div usage. |
| ANIM-05 | Glass-morphism tier usage audit -- correct tier applied per component type across all screens | Three tiers defined in tokens.css + globals.css. GlassCard.tsx component wraps them. But many components apply glass classes directly. Needs: audit all glass usage, add noise texture overlay, add text-shadow for readability, verify dark mode smoky glass treatment, add colored tints for heavy tier. |
| ANIM-06 | Stagger timing scales with list length -- short lists faster, skip stagger for 15+ items | StaggeredList currently uses fixed STAGGER_DEFAULT (60ms). Needs: dynamic stagger calculation based on children count, cap enforcement, 15+ skip behavior, low-end device detection. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | ^12.33.0 | Spring animations, AnimatePresence, variants, drag | Already installed, used in 38+ files with AnimatePresence |
| @radix-ui/react-dialog | ^1.1.15 | Accessible modal/dialog primitive | Already installed, provides forceMount for exit animations |
| clsx | ^2.1.1 | Conditional class composition | Already installed, used everywhere |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-canvas-confetti | ^2.0.7 | Canvas confetti effects | Celebration animations (Phase 32, already present) |
| lucide-react | ^0.475.0 | Icons | Close buttons, UI icons |

### No New Libraries Needed

Everything required for this phase is already in the dependency tree. No new packages need installation.

## Architecture Patterns

### Recommended Change Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Add tier prop, secondary/tertiary variants
│   │   ├── Dialog.tsx          # Refactor for exit animations (forceMount + AnimatePresence)
│   │   ├── Card.tsx            # Add scale+fade enter animation
│   │   └── GlassCard.tsx       # Add enter animation, noise overlay
│   ├── animations/
│   │   └── StaggeredList.tsx   # Enhance with adaptive timing, viewport trigger, exit
│   └── bilingual/
│       └── BilingualButton.tsx # Align with Button.tsx tier system
├── styles/
│   ├── globals.css             # Glass noise texture, text-shadow for readability
│   └── tokens.css              # Glass tokens already exist
└── lib/
    ├── motion-config.ts        # Add SPRING_PRESS_DOWN, STAGGER_FAST preset
    └── audio/
        └── soundEffects.ts     # Add playDismiss() for overlay audio cue
```

### Pattern 1: Dialog Exit Animation with Radix forceMount + AnimatePresence

**What:** Radix Dialog components need `forceMount` prop to keep DOM elements mounted while motion/react plays exit animations via `AnimatePresence`.

**When to use:** Every Dialog/overlay that needs exit animation.

**Current problem:** Dialog.tsx uses `DialogPrimitive.Content` and `DialogPrimitive.Overlay` without `forceMount`. When `open` becomes false, Radix immediately unmounts -- no exit animation plays.

**Solution pattern:**
```typescript
// Source: Radix UI Animation Guide + motion/react AnimatePresence docs
export function DialogContent({ open, ...props }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay forceMount asChild>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content forceMount asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={{
                enter: SPRING_BOUNCY,
                exit: { duration: 0.15, ease: 'easeIn' }
              }}
            />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}
```

**Key insight:** The `open` prop must be threaded from `Dialog` root down to `DialogContent` so `AnimatePresence` can conditionally render. The existing pattern wraps content inside `DialogPrimitive.Root open={open}` but the content component does not receive `open` as a prop -- this needs restructuring.

### Pattern 2: Button Tier System (CSS+Spring Hybrid)

**What:** Three-tier button feedback with CSS handling the immediate press-down and motion/react handling the spring release.

**When to use:** All interactive buttons across the app.

**Approach (Claude's discretion recommendation -- hybrid CSS+spring):**
```typescript
// Primary tier: CSS handles instant translateY+shadow shift on :active
// motion/react handles spring-back release via whileTap
const PRIMARY_TAP = { scale: 0.95, transition: { duration: 0.05 } };
const PRIMARY_RELEASE = SPRING_BOUNCY; // slow spring back ~200ms

// Secondary tier: scale + shadow
const SECONDARY_TAP = { scale: 0.97, transition: { duration: 0.08 } };

// Tertiary tier: opacity only (no motion needed, pure CSS transition)
// CSS: transition: opacity 100ms; &:active { opacity: 0.7; }
```

**Recommendation on ripple effect:** Skip the Material-style ripple. The 3D chunky press is already bold and distinctive. Adding ripple on top would create visual noise and increase implementation complexity. The prismatic glow flare on press (already in chunky3D) serves the same "feedback confirmation" purpose.

### Pattern 3: Adaptive Stagger Timing

**What:** StaggeredList calculates stagger delay based on child count, caps at 8-10 items, skips entirely for 15+.

**When to use:** Every list that uses StaggeredList.

**Implementation:**
```typescript
function getAdaptiveStagger(childCount: number): { stagger: number; shouldAnimate: boolean } {
  if (childCount >= 15) return { stagger: 0, shouldAnimate: false };
  if (childCount <= 3) return { stagger: 0.06, shouldAnimate: true }; // 60ms - luxurious
  if (childCount <= 8) return { stagger: 0.04, shouldAnimate: true }; // 40ms - fast cascade
  // 9-14 items: cap total animation time at ~400ms
  return { stagger: Math.min(0.04, 0.4 / childCount), shouldAnimate: true };
}
```

### Pattern 4: Card Enter Animation

**What:** Scale(0.95->1) + opacity(0->1) animation on mount for all cards.

**When to use:** Card, GlassCard, and any component with card semantics.

**Implementation approach:** Add an `animate` prop to Card/GlassCard that defaults to true. When true, wraps in a `motion.div` with initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}.

### Pattern 5: Glass Noise Texture via SVG

**What:** Subtle grain/noise overlay for realistic frosted glass look.

**Current state:** No noise texture exists in the codebase (only Flashcard3D references "noise" in a comment about avoiding glass-light).

**Implementation:**
```css
/* SVG noise texture as pseudo-element */
.glass-light::before,
.glass-medium::before,
.glass-heavy::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0.03; /* Very subtle in light mode */
  pointer-events: none;
  background-image: url("data:image/svg+xml,..."); /* inline SVG noise */
  mix-blend-mode: overlay;
}

.dark .glass-light::before,
.dark .glass-medium::before,
.dark .glass-heavy::before {
  opacity: 0.06; /* More visible in dark mode per user decision */
}
```

**Warning:** Adding `::before` pseudo-element to glass classes requires `position: relative` on the glass element. Many glass elements already have this via prismatic-border. Verify no z-index conflicts.

### Anti-Patterns to Avoid

- **Don't wrap motion.div around Radix `asChild` without understanding the chain:** `asChild` merges props onto its single child. If `motion.div` is that child, it receives both Radix and motion props. This is the correct pattern for Dialog overlay/content.
- **Don't use `AnimatePresence` without `key` prop on direct children:** AnimatePresence tracks children by key. Without keys, exit animations will not fire.
- **Don't use `overflow: hidden` on `preserve-3d` parents:** This flattens 3D transforms. Already documented in CLAUDE.md pitfalls.
- **Don't add CSS transforms to glass elements:** `backdrop-filter` and `transform` on the same element can cause rendering artifacts on some browsers. Use a wrapper div for transforms if needed.
- **Don't animate `backdrop-filter` values directly:** Animating blur intensity is extremely expensive. Animate opacity of the glass container instead.
- **Don't forget to handle the `open` prop threading for Dialog exit animations:** The current Dialog component structure has `DialogContent` as a self-contained unit that does not know the `open` state. Exit animations require the `open` state to conditionally render inside `AnimatePresence`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Exit animations on unmount | Custom DOM manipulation | motion/react `AnimatePresence` + `exit` prop | AnimatePresence handles the lifecycle correctly, keeping elements in DOM during exit |
| Scroll-triggered animations | IntersectionObserver wrapper | motion/react `whileInView` prop | Built into motion/react, handles viewport detection with configurable margins |
| Reduced motion detection | Manual `matchMedia` listener | `useReducedMotion()` hook (already exists) | Wraps motion/react's built-in hook, handles SSR null case |
| Spring physics | Custom easing functions | motion/react spring configs (SPRING_BOUNCY, etc.) | Physically accurate spring simulation, already tuned for app personality |
| Low-end device detection | Navigator.hardwareConcurrency check | `navigator.hardwareConcurrency <= 4` simple check | Good enough heuristic; no need for full device detection library |
| SVG noise texture | Canvas noise generation | Inline SVG data URI | Static texture, no runtime cost, cacheable |
| Audio dismiss cue | New audio system | Extend existing `soundEffects.ts` pattern | Already has AudioContext singleton, mute support, playNote helper |

**Key insight:** The project already has excellent animation infrastructure. This phase is about **coverage and consistency**, not building new systems.

## Common Pitfalls

### Pitfall 1: Dialog Exit Animation Not Playing
**What goes wrong:** Radix unmounts dialog content instantly when `open` becomes false, before motion/react can play exit animation.
**Why it happens:** Without `forceMount`, Radix controls mounting. AnimatePresence never sees the element leave its tree.
**How to avoid:** Use `forceMount` on both `DialogOverlay` and `DialogContent`, wrap in `AnimatePresence`, gate rendering on `open` prop.
**Warning signs:** Dialog disappears instantly instead of fading out.

### Pitfall 2: Stagger Running on Empty/Single-Child Lists
**What goes wrong:** Stagger animation on a list with 0-1 items creates unnecessary delay.
**Why it happens:** StaggeredList does not check child count.
**How to avoid:** Skip stagger orchestration when `Children.count(children) <= 1`.
**Warning signs:** Single cards appearing with a noticeable delay.

### Pitfall 3: Glass Noise Texture Breaking Pointer Events
**What goes wrong:** `::before` pseudo-element covers the entire glass panel, intercepting clicks.
**Why it happens:** Pseudo-element sits on top in stacking order.
**How to avoid:** Always set `pointer-events: none` on the noise pseudo-element.
**Warning signs:** Glass cards become unclickable.

### Pitfall 4: CSS Transform + backdrop-filter Rendering Issues
**What goes wrong:** On some WebKit browsers, combining `transform` (from motion/react) with `backdrop-filter` on the same element causes the blur to disappear or render incorrectly.
**Why it happens:** Browser compositing layer optimization conflicts.
**How to avoid:** Apply motion/react transforms on a wrapper element, keep `backdrop-filter` on an inner element, or test thoroughly on Safari/iOS.
**Warning signs:** Glass blur disappearing when card animates in.

### Pitfall 5: Button Dark Mode Edge Color Not Updating
**What goes wrong:** 3D chunky edge uses hardcoded HSL values (e.g., `hsl(var(--primary-700))`). In dark mode, the palette inverts (primary-700 becomes lighter), which may make the edge too bright or too dark.
**Why it happens:** Current chunky3D classes use `--primary-700` and `--primary-800` which do have dark mode overrides in tokens.css, but the visual result may not match the "rim-lit lighter edge" user decision.
**How to avoid:** Verify visually in dark mode. May need dedicated dark mode edge color tokens.
**Warning signs:** Edge looking washed out or invisible in dark mode.

### Pitfall 6: AnimatePresence mode="wait" Blocking Toast Stack
**What goes wrong:** Using `mode="wait"` on toast container means only one toast animates at a time, creating a queue jam.
**Why it happens:** `mode="wait"` waits for exit before starting enter.
**How to avoid:** Use default AnimatePresence mode (not "wait") for toast stacks. Each toast animates independently.
**Warning signs:** Toasts appearing one at a time with delays.

### Pitfall 7: 3D Chunky Shadow + Scale Conflict
**What goes wrong:** motion/react `whileTap: { scale: 0.95 }` combined with CSS `active:translate-y-[3px]` creates double-transform on the same element during press.
**Why it happens:** Both CSS `:active` and motion's `whileTap` fire simultaneously on the same element.
**How to avoid:** Use hybrid approach: CSS for shadow changes only, motion/react for all transforms (scale + translateY combined in whileTap).
**Warning signs:** Button appearing to jump or flash during press.

## Code Examples

### Dialog with Exit Animation
```typescript
// Restructured Dialog with forceMount + AnimatePresence
// Source: Radix Animation Guide + motion/react docs
export function DialogContent({ open, children, ...props }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay forceMount asChild>
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content forceMount asChild {...props}>
            <motion.div
              className="glass-heavy prismatic-border ..."
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.95 }}
              transition={SPRING_BOUNCY}
            >
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}
```

### Adaptive StaggeredList
```typescript
// Enhanced StaggeredList with adaptive timing
function getAdaptiveConfig(count: number, prefersReduced: boolean) {
  if (prefersReduced || count >= 15) {
    return { shouldAnimate: false, stagger: 0, delay: 0 };
  }

  // Low-end device detection
  const isLowEnd = typeof navigator !== 'undefined'
    && navigator.hardwareConcurrency != null
    && navigator.hardwareConcurrency <= 4;

  if (isLowEnd) {
    return { shouldAnimate: false, stagger: 0, delay: 0 };
  }

  if (count <= 3) return { shouldAnimate: true, stagger: 0.06, delay: 0.1 };
  if (count <= 8) return { shouldAnimate: true, stagger: 0.04, delay: 0.05 };
  // 9-14: fast cascade, total animation time capped at ~400ms
  return { shouldAnimate: true, stagger: Math.min(0.04, 0.4 / count), delay: 0.03 };
}
```

### Button Tier Variants
```typescript
// Button whileTap configs per tier
const TIER_TAP = {
  primary: { scale: 0.95, y: 3 }, // translateY simulates 3D press
  secondary: { scale: 0.97 },
  tertiary: {}, // opacity handled by CSS
};

// CSS for tertiary opacity transition (no motion/react needed)
// .btn-tertiary { transition: opacity 100ms ease; }
// .btn-tertiary:active { opacity: 0.7; }
```

### Audio Dismiss Cue
```typescript
// Add to soundEffects.ts - follows existing pattern
export function playDismiss(): void {
  if (isSoundMuted()) return;
  try {
    const ctx = getContext();
    if (!ctx) return;
    // Soft descending pop: 600 Hz -> 300 Hz over 100ms
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch { /* silently ignore */ }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Radix CSS `data-state` animations | motion/react `AnimatePresence` + `forceMount` | Standard since Radix animation guide | Enables JavaScript-controlled exit animations with spring physics |
| Fixed stagger timing | Adaptive stagger based on list length | Common pattern in production apps | Prevents long delays on large lists, snappy on small lists |
| `backdrop-filter` animation | Opacity animation on container | Performance best practice | GPU-friendly, avoids compositor layer issues |
| Single button style | Tiered button feedback system | Duolingo/game-inspired UX pattern | Provides clear visual hierarchy and tactile feedback |

## Codebase Audit Summary

### Existing Button Usage (needs tier audit)
- **Button.tsx consumers (10 files):** LandingPage, SessionSetup, SocialOptInFlow, RoundSummary, SessionSummary, SRSBatchAdd, DeckManager, PasswordUpdatePage, PasswordResetPage, AuthPage
- **BilingualButton.tsx:** Separate component with its own spring config and variant system -- needs alignment with Button.tsx tier system
- **Inline button styles (no Button component):** ResumePromptModal, TourTooltip, BadgeCelebration, BottomTabBar utility buttons, Sidebar, various custom buttons -- these need audit for tier assignment

### Existing Glass Usage (needs tier audit)
| Component | Current Glass | Expected Tier |
|-----------|--------------|---------------|
| GlassCard (ui) | light/medium/heavy via prop | Correct (component-driven) |
| Dialog | glass-heavy | Correct (overlays = heavy) |
| GlassHeader | glass-medium | Correct (navigation chrome) |
| BottomTabBar | glass-heavy | Correct (navigation chrome) |
| Sidebar | glass-heavy | Correct (navigation chrome) |
| TestPage sections | glass-light (inline) | Needs audit |
| PracticeSession | glass-light (inline) | Needs audit |
| SkippedReviewPhase | glass-light (inline) | Needs audit |
| TestResultsScreen | glass-light (inline) | Needs audit |
| ReviewCard | glass-light (inline) | Needs audit |
| HubSkeleton | glass-light (inline) | Correct (skeleton placeholders) |
| OpEdPage header | glass-medium (inline) | Needs audit |
| HistoryTab skeleton | glass-card (legacy alias) | Should migrate to glass-light |

### Existing StaggeredList Usage (22 files)
- Used via `StaggeredList`, `StaggeredItem`, `StaggeredGrid`, and `FadeIn`
- Fixed STAGGER_DEFAULT (60ms) used everywhere
- No adaptive timing, no viewport triggering, no exit animations
- No long-list skip behavior

### Existing AnimatePresence Usage (38 files)
- Dialog does NOT use AnimatePresence for its own open/close
- Most uses are for conditional content within screens (review phases, banners, etc.)
- PageTransition.tsx uses `AnimatePresence mode="wait"` for route transitions
- Toast already has exit animation via imperative animate() (Phase 30)

### Missing Features Identified
1. **No noise/grain texture** on glass panels (user decision requires it)
2. **No text-shadow** on glass text for readability (user decision requires it)
3. **No exit animations** on Dialog overlay/content
4. **No adaptive stagger** timing in StaggeredList
5. **No card enter animation** on Card or GlassCard mount
6. **No secondary/tertiary** button tier in Button.tsx (only primary/destructive/success have 3D chunky, secondary/outline/ghost lack tier-specific press feedback)
7. **No overlay dismiss audio cue** (soundEffects.ts has no playDismiss)
8. **No animated focus ring** (current focus rings are static CSS)
9. **No count-up** animation outside existing CountUpScore celebration component
10. **No progress bar fill animation** on initial mount

## Open Questions

1. **Dialog restructuring scope**
   - What we know: Need `forceMount` + `AnimatePresence`, which changes the component API. `open` must be available where `AnimatePresence` wraps content.
   - What's unclear: 7 files import Dialog -- all need updating. How to minimize breaking changes?
   - Recommendation: Make DialogContent accept optional `open` prop. When provided, use AnimatePresence. When not provided, keep current behavior for backward compatibility during migration.

2. **Glass noise texture performance on mobile**
   - What we know: SVG inline noise as pseudo-element is lightweight (single decode, cached)
   - What's unclear: Impact of mix-blend-mode:overlay on composited backdrop-filter layers on low-end Android
   - Recommendation: Implement with low opacity (0.03 light / 0.06 dark), test on low-end device, add `@media (prefers-reduced-motion)` removal, and use the existing low-end device detection to disable

3. **Inline button styling migration scope**
   - What we know: Multiple components (ResumePromptModal, TourTooltip, BadgeCelebration, nav utility buttons) use inline button styles instead of the Button component
   - What's unclear: Whether to migrate all inline buttons to Button component or just ensure they follow tier patterns
   - Recommendation: Migrate where possible, but some (like Radix-controlled TourTooltip buttons) need their own CSS tier treatment

## Sources

### Primary (HIGH confidence)
- motion/react docs (via Context7 `/websites/motion_dev_react`) - AnimatePresence, exit animations, spring configs
- Radix UI Primitives docs (via Context7 `/websites/radix-ui_primitives`) - Dialog forceMount, animation guide, Overlay/Content API
- Project codebase direct inspection - all component files, CSS tokens, motion-config.ts

### Secondary (MEDIUM confidence)
- Radix Animation Guide pattern (forceMount + JS animation library) - verified with Context7 docs
- Adaptive stagger timing pattern - common production pattern, no single authoritative source

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed and in use, no new dependencies
- Architecture: HIGH - extending existing patterns (motion-config.ts, glass tiers, Button variants), well-understood codebase
- Pitfalls: HIGH - most pitfalls observed from direct codebase analysis (Dialog missing exit, transform+backdrop conflicts documented in CLAUDE.md)

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable libraries, pattern-focused phase)
