# Phase 33: States & Accessibility - Research

**Researched:** 2026-02-20
**Domain:** UI states (loading/empty/error), accessibility (focus management, live regions, reduced motion)
**Confidence:** HIGH

## Summary

Phase 33 polishes every screen's loading, empty, and error states while ensuring the app is fully accessible to screen reader and reduced-motion users. The codebase already has strong foundations: a `Skeleton` component (`src/components/ui/Skeleton.tsx`) with shimmer animation, `HubSkeleton.tsx` with prismatic skeletons for all three Hub tabs, a `useReducedMotion` hook wrapping motion/react's built-in hook, `ErrorBoundary.tsx` with bilingual fallback, Radix UI Dialog with built-in focus trapping, and existing `aria-live` regions on toasts and status indicators. The project's animation CSS (`animations.css`, `prismatic-border.css`) already handles `prefers-reduced-motion` for shimmer, breathe, flame, and prismatic animations.

The primary work is: (1) extending the existing `Skeleton` component with accent-tinted shimmer and staggered entrance per user decisions, (2) creating new `EmptyState` and `ErrorFallback` reusable components, (3) wiring skeletons/empty/error states into Dashboard, StudyGuide, Settings, and all Hub tabs, (4) adding focus management on route changes, (5) auditing all CSS keyframes for reduced-motion gaps, and (6) adding live region announcements for celebrations.

**Primary recommendation:** Build three reusable "state pattern library" components (`<Skeleton>` enhancement, `<EmptyState>`, `<ErrorFallback>`), then systematically apply them across all screens. Focus management should be a single hook (`useFocusOnNavigation`) that runs on `location` changes. Reduced-motion audit should cover both CSS keyframes and motion/react JS animations.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Skeleton Screens:**
- Shimmer sweep (left-to-right gradient) with fast ~1s cycle
- Approximate layout shapes (general blocks, not pixel-perfect mirror)
- Accent-tinted shimmer (subtle primary color tint, not neutral gray)
- Skeleton blocks slightly lighter than page surface for "raised" feel
- Rounded corners matching app's existing card radius
- Reusable `<Skeleton>` component with variants (card, text, avatar, etc.)
- Staggered entrance (skeleton cards appear one by one, top to bottom)
- SRS/flashcard screens show card-shaped skeleton outline; others use general blocks
- All screens with async content are equal priority
- Universal skeleton regardless of language mode
- `aria-label` like "Loading [page name]..." for screen readers

**Empty States:**
- Icons + text (large themed icon + descriptive text)
- Duotone icons (two-tone: outline + accent fill)
- Per-screen themed icon color from category palette
- Subtle pulse or float animation on icon (disabled under reduced-motion)
- Encouraging coach tone
- Always include primary CTA button
- Vertically centered in content area
- Reusable `<EmptyState>` component: `<EmptyState icon={...} title='...' description='...' action={...} />`
- Dashboard: Welcome + quick start (steps: 1) Pick a category 2) Start studying 3) Track progress)
- SRS Deck: Brief spaced repetition explanation + CTA

**Error Recovery:**
- Toast notification for alert + inline fallback content (hybrid)
- Auto-dismiss toast with 'Retry' action button
- Icon + text retry button (refresh icon + "Try Again")
- 1-2 silent retries before showing error
- Escalating retries (after 3 manual retries, change message)
- Friendly/human error tone
- Cloud-offline style icon
- App palette muted colors (not red/amber)
- Stale cached data as fallback when available
- Subtle "Showing cached data - Retry" banner
- Persistent top banner when fully offline
- Reconnect animation with "Reconnecting..." then "Back online!" transition
- Reusable `<ErrorFallback>` component: `<ErrorFallback icon={...} message='...' onRetry={...} fallbackContent={...} />`

**Reduced-Motion Alternatives:**
- Confetti/celebrations: Static badge/icon appears, no animation
- Mastery milestones: Static overlay instantly with badge icon and text
- Skeleton shimmer: Disabled, show solid static blocks
- Card flip: Crossfade ~200ms (already implemented in Flashcard3D.tsx)
- StaggeredList: Keep sequential timing but remove slide/fade (just appear)
- OS preference only (no in-app toggle), respect `prefers-reduced-motion: reduce`

### Claude's Discretion

- Dark mode shimmer adaptation
- Timing threshold (whether to show skeleton instantly or delay for fast loads)
- Inline scope (whether inline refreshes get skeleton treatment)
- Detail level (text-line placeholder bars per screen)
- Viewport fill (how many skeleton cards per screen)
- Transition from skeleton to loaded content (fade-in vs instant swap)
- Fast load suppression (suppress skeleton on sub-50ms loads)
- Tab switching (skeleton vs cached content on Hub tab switches)
- React pattern (Suspense boundaries vs manual loading state)
- Empty state messages bilingual matching
- Achievements preview (locked/greyed badges vs text-only)
- Filter vs zero-data distinction in Hub History
- Icon size for empty states
- Focus management implementation approach (STAT-04)
- Screen reader live region announcement patterns (STAT-06)
- Modal/dialog focus trap implementation (STAT-07)
- Offline vs local error visual distinction
- Retry rate limiting
- Hover effects, page transitions, focus indicators under reduced-motion
- Skeleton stagger under reduced-motion

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| STAT-01 | Skeleton screen coverage for all async content (Dashboard, Study Guide, Settings, Hub tabs) | Existing `Skeleton.tsx` + `HubSkeleton.tsx` provide base components. Enhance with accent-tinted shimmer CSS, add `aria-label` props, stagger entrance. Hub tabs already have prismatic skeletons; Dashboard has `NBAHeroSkeleton`; need skeletons for StudyGuide category list, Settings, CompactStatRow, CategoryPreviewCard, RecentActivityCard. |
| STAT-02 | Empty state designs for zero-data screens (Dashboard, Hub History, Hub Achievements, SRS Deck) | Hub History already has inline empty states with emoji + BilingualHeading + CTA. Hub Overview has `WelcomeState`. AchievementsTab has a "Start earning badges!" card. DeckManager has an empty state. Need: new reusable `<EmptyState>` component with duotone icon, themed colors, pulse animation. Refactor existing ad-hoc empty states to use it. Dashboard new-user welcome is the biggest new design. |
| STAT-03 | Inline error recovery patterns (icon + message + retry button + fallback, bilingual) | Existing `ErrorBoundary.tsx` handles crash-level errors. Need: new `<ErrorFallback>` component for data-fetch errors (not crashes). Toast system (`BilingualToast.tsx`) already supports error/warning with `role="alert"`. Need: silent retry logic (useRetry hook or wrapper), stale data fallback pattern, escalating retry messaging, offline banner component. |
| STAT-04 | Focus management on page transitions (focus first h1 or main content on route change) | No existing focus management on route changes. `PageTransition.tsx` uses `AnimatePresence` with `useLocation()` but does no focus work. Need: custom hook listening to `location` changes that finds and focuses the first `h1` or `[role="main"]` after animation settles. Must use `{ preventScroll: true }` per project pitfalls. |
| STAT-05 | Reduced motion CSS completeness (all CSS keyframes and transitions respect prefers-reduced-motion) | Audit found gaps: `floaty`/`animate-soft-bounce`, `badge-shimmer`, `badge-gold-shimmer`, `stripe-move`, `pulse-glow`, `fade-in-up` keyframes in `globals.css` have NO `@media (prefers-reduced-motion: reduce)` rules. Also `animate-pulse` (Tailwind) used in 19+ components has no override. Motion/react JS animations are handled via `useReducedMotion` hook in most components (89 files import it). |
| STAT-06 | Screen reader live region announcements for confetti, badge earns, mastery milestones | Confetti.tsx returns `null` under reduced motion - no screen reader announcement. BadgeCelebration.tsx uses Dialog (has `aria-describedby`). MasteryMilestone.tsx uses Dialog. Need: `aria-live="assertive"` announcements when celebrations fire, especially when visual animation is suppressed. |
| STAT-07 | Modal/dialog focus trap and focus return to trigger on dismiss | Radix UI Dialog (`@radix-ui/react-dialog` v1.1.15) handles focus trap and return natively. Verified: Dialog.Content traps focus, returns to trigger on close. Need: audit all modal/overlay usage to ensure they use Radix Dialog (not custom modals). Check `ExitConfirmDialog`, `SocialOptInFlow`, `ResumePromptModal`, `WelcomeModal`, `WhatsNewModal`, `LeaderboardProfile`, `NotificationPrePrompt`, `StartFreshConfirm`. |
</phase_requirements>

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| motion/react | 12.x | JS animation with `useReducedMotion` hook | Already used in 89+ files; provides built-in reduced-motion detection |
| @radix-ui/react-dialog | 1.1.15 | Accessible modal with focus trap + return | Already used for all dialogs; WAI-ARIA compliant focus management built-in |
| lucide-react | latest | Icon library (duotone via className styling) | Already used across entire app; cloud-offline, refresh icons available |
| clsx | latest | Conditional class composition | Already used everywhere |

### Supporting (Already in Project)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router-dom | 6.x | Hash routing, `useLocation` for focus management hook | Focus management on route changes |
| idb-keyval | latest | IndexedDB for cached/stale data fallback | Offline fallback content |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual focus management hook | react-aria `useFocusManager` | Overkill; simple `useEffect` + `querySelector` is sufficient for this use case |
| Custom focus trap | focus-trap-react | Unnecessary; Radix Dialog already handles this |
| React Suspense boundaries | Manual `isLoading` state | Suspense requires lazy() boundaries and doesn't integrate well with existing IndexedDB/Supabase data fetching pattern; manual loading state is already used everywhere |

**Installation:**
```bash
# No new packages needed - all dependencies already in project
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── ui/
│   │   ├── Skeleton.tsx           # Enhanced (add aria-label, accent shimmer)
│   │   ├── EmptyState.tsx         # NEW reusable empty state
│   │   └── ErrorFallback.tsx      # NEW reusable inline error fallback
│   ├── hub/
│   │   └── HubSkeleton.tsx        # Already exists (prismatic skeletons)
│   ├── dashboard/
│   │   ├── DashboardSkeleton.tsx   # NEW full-page skeleton for Dashboard
│   │   └── ...
│   └── pwa/
│       ├── OfflineBanner.tsx       # NEW persistent offline banner
│       └── ...
├── hooks/
│   ├── useReducedMotion.ts        # Already exists
│   ├── useFocusOnNavigation.ts    # NEW focus management hook
│   └── useRetry.ts               # NEW auto-retry + escalation hook
├── styles/
│   ├── animations.css             # Add reduced-motion rules for missing keyframes
│   └── globals.css                # Add reduced-motion rules for floaty, badge-shimmer, etc.
└── lib/
    └── a11y/
        └── announcer.ts           # NEW live region announcement utility
```

### Pattern 1: Reusable EmptyState Component
**What:** A single component that renders an icon, bilingual title/description, and a CTA button with consistent styling.
**When to use:** Any screen that can have zero data.
**Example:**
```typescript
// Proposed API
interface EmptyStateProps {
  icon: LucideIcon;
  iconColor?: string;        // Per-screen themed color (e.g., 'text-primary', 'text-amber-500')
  title: { en: string; my: string };
  description: { en: string; my: string };
  action?: {
    label: { en: string; my: string };
    onClick: () => void;
    variant?: 'chunky' | 'primary';
  };
  className?: string;
}

export function EmptyState({ icon: Icon, iconColor, title, description, action }: EmptyStateProps) {
  const { showBurmese } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className={clsx('mb-4', shouldReduceMotion ? '' : 'animate-soft-bounce')}>
        <Icon className={clsx('h-16 w-16', iconColor ?? 'text-muted-foreground')} />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">{title.en}</h2>
      {showBurmese && <p className="text-lg text-muted-foreground font-myanmar mb-2">{title.my}</p>}
      <p className="text-muted-foreground max-w-sm mb-1">{description.en}</p>
      {showBurmese && <p className="text-muted-foreground font-myanmar max-w-sm mb-6">{description.my}</p>}
      {action && <BilingualButton label={action.label} variant={action.variant ?? 'chunky'} onClick={action.onClick} />}
    </div>
  );
}
```

### Pattern 2: Inline ErrorFallback Component
**What:** Non-crash error state for data fetch failures. Shows icon, bilingual message, retry button, and optional stale fallback content.
**When to use:** When async data fails to load (not React render errors - that's ErrorBoundary).
**Example:**
```typescript
interface ErrorFallbackProps {
  icon?: LucideIcon;
  message: { en: string; my: string };
  onRetry: () => void;
  retryCount?: number;             // For escalating messages
  fallbackContent?: ReactNode;     // Stale cached data
  showStaleBanner?: boolean;
}
```

### Pattern 3: Focus Management Hook
**What:** Hook that focuses the page's first `h1` or `main` element after route changes.
**When to use:** Once, in PageTransition or NavigationShell.
**Example:**
```typescript
function useFocusOnNavigation() {
  const location = useLocation();

  useEffect(() => {
    // Small delay to let AnimatePresence settle
    const timer = setTimeout(() => {
      const target = document.querySelector('h1') ?? document.querySelector('[role="main"]');
      if (target instanceof HTMLElement) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}
```

### Pattern 4: Live Region Announcer
**What:** A visually hidden `aria-live="assertive"` region that announces celebration events to screen readers.
**When to use:** For confetti, badge earns, mastery milestones - especially when visual animation is suppressed.
**Example:**
```typescript
// Simple announcer utility
let announceEl: HTMLElement | null = null;

export function announce(message: string, priority: 'polite' | 'assertive' = 'assertive') {
  if (!announceEl) {
    announceEl = document.createElement('div');
    announceEl.setAttribute('aria-live', priority);
    announceEl.setAttribute('aria-atomic', 'true');
    announceEl.className = 'sr-only';
    document.body.appendChild(announceEl);
  }
  // Clear then set to trigger re-announcement
  announceEl.textContent = '';
  requestAnimationFrame(() => {
    if (announceEl) announceEl.textContent = message;
  });
}
```

### Pattern 5: Auto-Retry with Escalation
**What:** Hook or wrapper that silently retries 1-2 times before showing error, then escalates after 3 manual retries.
**When to use:** Any async data fetch that could fail (network, IndexedDB).
**Example:**
```typescript
function useRetry<T>(fetcher: () => Promise<T>, options?: { maxSilent?: number; maxManual?: number }) {
  // Returns: { data, error, isLoading, retry, retryCount, isEscalated }
}
```

### Anti-Patterns to Avoid
- **Blank screens on load:** Every async boundary must have a skeleton or loading indicator.
- **Custom focus traps:** Never build a manual focus trap - use Radix Dialog which handles edge cases (portal, nested, escape).
- **`setState` in effects for loading state:** Use the existing pattern of `isLoading` from hooks, not derived state in effects.
- **Hardcoded English-only error messages:** All user-facing text must be bilingual `{ en, my }`.
- **`focus()` without `preventScroll`:** Per project pitfalls, always use `{ preventScroll: true }`.
- **Global `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }`:** This is too aggressive; some animations provide information (e.g., progress bars). Handle per-animation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Focus trapping in modals | Custom focus-trap logic | Radix UI Dialog (already used) | Radix handles edge cases: portal focus, nested dialogs, scroll lock, Escape key, return focus |
| Reduced motion detection | Custom `matchMedia` listener | `useReducedMotion` from motion/react (already wrapped in `src/hooks/useReducedMotion.ts`) | Handles SSR null case, auto-updates on preference change |
| Screen reader announcements | Custom div management | Simple `announce()` utility function (5 lines) | Don't over-engineer; a single persistent `aria-live` region suffices |
| Toast notifications | Custom toast system | Existing `BilingualToast.tsx` (`useToast` hook) | Already handles bilingual, swipe-to-dismiss, auto-dismiss, `role="alert"` |
| Skeleton shimmer animation | JS-based shimmer | CSS `@keyframes shimmer` (already in `animations.css`) | GPU-accelerated, respects `prefers-reduced-motion`, zero JS overhead |

**Key insight:** The app already has 80%+ of the infrastructure. This phase is primarily about filling gaps (missing skeletons, missing empty states, missing reduced-motion rules) and creating 3 reusable components, not building new systems.

## Common Pitfalls

### Pitfall 1: Focus Fights with AnimatePresence
**What goes wrong:** Focus management fires before animation completes, causing focus to land on an element that's still entering/exiting.
**Why it happens:** `useEffect` on `location.pathname` fires synchronously before motion/react's enter animation renders the new page content.
**How to avoid:** Add a 100-150ms delay (matching animation duration) before attempting focus. Alternatively, use `onAnimationComplete` callback from motion/react.
**Warning signs:** Focus ring appears briefly on wrong element, or focus moves to `<body>` instead of `h1`.

### Pitfall 2: aria-live Announcement Timing
**What goes wrong:** Screen reader doesn't announce the celebration message, or announces it twice.
**Why it happens:** Setting `aria-live` content too quickly or during DOM mutations can cause announcements to be swallowed. Setting the same text twice without clearing doesn't trigger re-announcement.
**How to avoid:** Clear the live region first (`textContent = ''`), then set new text in a `requestAnimationFrame`. Use `aria-atomic="true"` to ensure full re-read.
**Warning signs:** VoiceOver/NVDA silent when confetti fires; duplicate announcements.

### Pitfall 3: Skeleton Flash on Fast Loads
**What goes wrong:** Skeleton appears for 20ms then immediately swaps to content, causing a jarring flash.
**Why it happens:** Data loads faster than expected (cached, local IndexedDB).
**How to avoid:** Either show skeleton only after a 50-100ms delay (so fast loads skip it entirely), or use a minimum display time of ~200ms once skeleton appears.
**Warning signs:** Flickering on Dashboard when data is cached in IndexedDB.

### Pitfall 4: Missing Reduced-Motion for Tailwind's animate-pulse
**What goes wrong:** Tailwind's built-in `animate-pulse` class (used in 19+ components for loading states) still animates under reduced motion.
**Why it happens:** Tailwind v3 DOES include `@media (prefers-reduced-motion: reduce) { .animate-pulse { animation: none } }` in its preflight. However, custom CSS animations in `globals.css` may not.
**How to avoid:** Verify Tailwind's preflight is included (it is - checked `globals.css` line 1 `@tailwind base`). Focus audit on custom keyframes only.
**Warning signs:** Custom animations running when OS reduced-motion is enabled.

### Pitfall 5: Offline Banner Z-Index Wars
**What goes wrong:** Offline banner appears behind or overlapping the navigation, modals, or toasts.
**Why it happens:** The app has multiple z-index layers: toast container (`z-[9999]`), dialog overlay (`z-50`), navigation.
**How to avoid:** Use a dedicated z-index for the offline banner (e.g., `z-40`) that sits below modals but above content. Position it at the top of the `page-shell` content area, not as a fixed overlay.
**Warning signs:** Banner clipped by header or invisible behind modal backdrop.

### Pitfall 6: Stale Data Banner Showing When Data Is Actually Fresh
**What goes wrong:** "Showing cached data" banner appears even when the data is current, just loaded from IndexedDB cache.
**Why it happens:** Can't distinguish between "loaded from cache because offline" vs "loaded from cache as normal fast path."
**How to avoid:** Only show stale data banner when: (1) a network fetch was attempted AND failed, AND (2) fallback data was served from cache. Don't show it for the initial IndexedDB load before any network request.
**Warning signs:** "Showing cached data" banner appears on every page load even when online.

## Code Examples

### Accent-Tinted Shimmer CSS
```css
/* Enhanced skeleton shimmer with primary color tint */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 0%,
    hsl(var(--primary) / 0.08) 50%,
    hsl(var(--muted)) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1s infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer {
    animation: none;
    background: hsl(var(--muted));
  }
}
```

### Missing Reduced-Motion Rules for globals.css
```css
/* floaty / animate-soft-bounce */
@media (prefers-reduced-motion: reduce) {
  .animate-soft-bounce {
    animation: none;
  }
}

/* badge-shimmer */
@media (prefers-reduced-motion: reduce) {
  .badge-shimmer {
    animation: none;
    background: transparent;
  }
}

/* badge-gold-shimmer */
@media (prefers-reduced-motion: reduce) {
  .badge-gold-shimmer {
    animation: none;
    background: transparent;
  }
}

/* stripe-move (subcategory progress bars) */
@media (prefers-reduced-motion: reduce) {
  [style*="stripe-move"] {
    animation: none !important;
  }
}

/* pulse-glow */
@media (prefers-reduced-motion: reduce) {
  [class*="pulse-glow"] {
    animation: none;
  }
}

/* fade-in-up */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
  }
}
```

### Focus Management Hook
```typescript
// src/hooks/useFocusOnNavigation.ts
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useFocusOnNavigation() {
  const location = useLocation();

  useEffect(() => {
    // Delay to let page transition animation settle
    const timer = setTimeout(() => {
      const h1 = document.querySelector('h1');
      const main = document.querySelector('[role="main"]') ?? document.querySelector('main');
      const target = h1 ?? main;

      if (target instanceof HTMLElement) {
        // Ensure element is focusable
        if (!target.hasAttribute('tabindex')) {
          target.setAttribute('tabindex', '-1');
        }
        target.focus({ preventScroll: true });
      }
    }, 150); // Match page transition duration

    return () => clearTimeout(timer);
  }, [location.pathname]);
}
```

### StaggeredList Reduced-Motion Variant (Existing, Verified)
```typescript
// Already implemented in StaggeredList.tsx:
// - reducedContainerVariants: opacity stays 1, no stagger
// - reducedItemVariants: opacity 1, y 0 (items just appear)
// Per user decision: "Keep sequential timing but remove slide/fade motion"
// Current implementation removes BOTH timing and motion. May need adjustment
// to keep stagger timing but render items without animation.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }` | Per-animation rules that preserve information-conveying animations | 2023+ | More nuanced; progress bars still animate, decorative animations stop |
| `aria-live` on every dynamic region | Strategic placement on containers + `announce()` utility | Standard practice | Prevents announcement overload |
| Custom focus trap libraries | Radix UI built-in focus management | Since Radix v1.0 | Zero-config, handles edge cases automatically |
| Skeleton as placeholder only | Skeleton with `aria-label` + semantic loading state | WCAG 2.2 emphasis | Screen readers announce loading state clearly |

**Deprecated/outdated:**
- `framer-motion` import path: Now `motion/react` (already migrated in this project)
- Global reduced-motion blanket rules: Replace with per-animation handling

## Open Questions

1. **StaggeredList sequential timing under reduced motion**
   - What we know: User wants "Keep sequential timing (items appear one by one) but remove slide/fade motion - just appear"
   - What's unclear: Current `reducedItemVariants` sets `opacity: 1, y: 0` which makes items appear instantly (no stagger). To keep sequential timing without visual animation, we'd need container stagger with item variants that go from `opacity: 0` to `opacity: 1` instantly (duration: 0) but still stagger.
   - Recommendation: Modify reduced-motion container to keep `staggerChildren` but set item transition to `{ duration: 0 }` so items appear sequentially with zero animation per item. This preserves the "one by one" reveal without motion.

2. **Dashboard empty state vs WelcomeState overlap**
   - What we know: Hub Overview already has `WelcomeState` component for zero-mastery users. STAT-02 requires Dashboard empty state.
   - What's unclear: Whether Dashboard should have its own dedicated empty state or reuse/reference WelcomeState.
   - Recommendation: Dashboard gets its own `EmptyState` with the user-decided steps (Pick category / Start studying / Track progress) using the new reusable `<EmptyState>` component. WelcomeState in Hub Overview can be refactored to use `<EmptyState>` internally for consistency.

3. **Which modals need focus trap verification**
   - What we know: `Dialog.tsx` wraps Radix Dialog which handles focus trap natively.
   - What's unclear: Whether all overlay-style components use this Dialog, or if some use custom implementations.
   - Recommendation: Audit these files: `ExitConfirmDialog`, `SocialOptInFlow`, `ResumePromptModal`, `WelcomeModal`, `WhatsNewModal`, `LeaderboardProfile`, `NotificationPrePrompt`, `StartFreshConfirm`, `MasteryMilestone`, `BadgeCelebration`. Most likely already use Radix Dialog. Any that don't should be migrated.

4. **Hub tab skeletons already exist - scope of enhancement**
   - What we know: `HubSkeleton.tsx` already provides `OverviewSkeleton`, `HistorySkeleton`, and `AchievementsSkeleton` with prismatic shimmer. OverviewTab already renders `OverviewSkeleton` when `isLoading`.
   - What's unclear: Whether these meet the new requirements (accent-tinted, staggered entrance, aria-label).
   - Recommendation: The existing Hub skeletons use `skeleton-prismatic` class (rainbow shimmer). Per user decision, shimmer should be accent-tinted (primary color). Either update the prismatic class or add `aria-label` and stagger entrance to existing skeletons. The prismatic rainbow style may be considered a design evolution of "accent-tinted" since it uses the app's accent palette.

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/components/ui/Skeleton.tsx`, `src/components/hub/HubSkeleton.tsx`, `src/hooks/useReducedMotion.ts`, `src/components/ErrorBoundary.tsx`, `src/components/ui/Dialog.tsx`, `src/styles/animations.css`, `src/styles/globals.css`, `src/styles/prismatic-border.css`
- Context7 `/radix-ui/website` - Dialog focus trap, accessibility, `onCloseAutoFocus`
- Context7 `/websites/motion_dev_react` - `useReducedMotion` hook documentation

### Secondary (MEDIUM confidence)
- Codebase pattern analysis: 89 files using `useReducedMotion`, 17 files with `aria-live`, 19 files with `animate-pulse`
- WAI-ARIA Authoring Practices for live regions and focus management (established standard)

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in project, no new dependencies
- Architecture: HIGH - patterns derived from existing codebase conventions
- Pitfalls: HIGH - identified from direct codebase analysis and project MEMORY.md
- Reduced-motion audit: HIGH - direct grep of all CSS keyframes and their reduced-motion coverage

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (stable domain, no fast-moving dependencies)
