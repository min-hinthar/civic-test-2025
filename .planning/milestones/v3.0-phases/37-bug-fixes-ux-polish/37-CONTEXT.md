# Phase 37: Bug Fixes & UX Polish - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix display bugs and polish UX across Study Guide, Flashcards, Review Deck, Mock Test, and Interview. Add About page link to navbar with micro-interactions. Improve About page feature card on landing page. Investigate and fix bugs across TTS, offline sync, SRS scheduling, leaderboard, PWA, responsive layout, toast notifications, error boundaries, and loading/empty states.

</domain>

<decisions>
## Implementation Decisions

### Review Deck Interactions
- Cards are clickable — tapping navigates to the flashcard view for that question (full flip experience)
- TTS speak button available only in flashcard view, not on review deck list cards
- Progress bar + card count at top of review deck: "5/12 reviewed" with fill animation
- Spacious card design with question preview, category badge, and difficulty indicator
- Category dropdown filter to focus on specific topics
- Empty state: celebration message with confetti + "All caught up! Next review in X hours"
- Due card surfacing: badge on nav item + banner on dashboard ("You have 5 cards due")
- Spring physics for card transition animations — bouncy, organic feel

### Flashcard Dropdown UX
- Replace "All Categories" dropdown with horizontal scrollable chip/pill row
- Keep "All Categories" as default selection but improve visual hierarchy
- Each chip has: icon, accent color per category, and question count badge
- Category chips have subtitle text with brief description: "American Government — Branches, Constitution"
- Card counter at top: "3 of 20" with left/right arrow navigation + progress bar below
- Shuffle button + sort options (difficulty, category order, alphabetical)
- Search box above cards to filter questions by text within selected category
- Bookmark/star toggle on individual flashcards for quick access later
- Card back shows everything available: answer, explanation, category, difficulty, mastery level
- Auto-play study mode: hands-free study with TTS and auto-advance

### About Link & Animation
- About page already exists — this adds navbar link and improves landing page card
- Navbar placement: between language toggle and theme toggle
- About link appears in mobile header (same icon, not hidden in hamburger)
- Navigates to existing About page route (not modal)
- Active state: icon switches from outline to filled when on About page
- Landing page About feature card: currently too small and poorly styled — needs to be more prominent with persistent subtle animation (shimmer/gradient shift/floating)

### Bug Fixes — Known Issues
- **Study Guide Browse**: category cards not displaying (recently broke)
- **Interview — Real mode**: should NOT show answers (simulating real test)
- **Interview — Practice mode**: answer text only shows self-grade, should show actual answer
- **Mock Test + Interview**: additional bugs TBD — Claude should investigate

### Bug Fixes — Investigation Required
- **TTS/audio**: Claude should investigate and fix TTS bugs across the app
- **Offline/sync**: sync issues — data lost after sync between devices, sync may not complete
- **SRS algorithm**: review intervals feel wrong (too soon or too late) — Claude should diagnose
- **Leaderboard**: not updating scores/rankings — Claude should investigate
- **PWA**: install and functionality issues — Claude should investigate
- **Responsive layout**: issues on small phones (< 375px) — Claude should test various viewports
- **Toast notifications**: issues with appearance, position, or content — Claude should investigate
- **Error boundaries**: app may crash instead of showing error boundary — Claude should investigate
- **Performance**: general sluggishness + janky flashcard animations — Claude should profile and fix low-hanging fruit

### Loading & Empty States
- Full audit of all views for proper loading and empty states
- Fix missing or broken loading spinners/skeletons
- Fix missing or poor empty state messages

### Claude's Discretion
- Review deck: hover/tap feedback style, clickable indicator design, card ordering (SRS-aligned)
- Review deck: post-session summary level, keyboard shortcuts for rating, mobile gestures
- Review deck: bilingual display approach, accessibility patterns, session flow (sequential vs browsable)
- Review deck: SRS rating button design (matching ts-fsrs implementation)
- Flashcard chips: horizontal scroll vs wrap layout based on category count and viewport
- Flashcard: active chip styling, category transition animation, multi-select behavior
- Flashcard: per-category progress display approach, card size/responsive sizing
- Flashcard: flip animation speed adjustment, swipe gesture support, auto-play flow design
- Flashcard: mastery level visual indicator design
- About: micro-interaction/animation for navbar icon, page transition style
- About: back navigation pattern, first-time user hint
- About: landing page card prominence design
- Performance: scope of optimization work appropriate for bug fix phase

</decisions>

<specifics>
## Specific Ideas

- Spring physics animations for review deck card interactions (bouncy, organic feel)
- Celebration message with confetti when review deck is empty (all caught up)
- Category chips with icons, accent colors, count badges, AND subtitle descriptions
- Card back should show "everything available" — answer, explanation, category, difficulty, mastery
- About icon: outline → filled transition for active state
- Landing page About card: persistent subtle animation (shimmer, gradient shift, or floating effect)
- Auto-play study mode for flashcards as UX polish enhancement
- Bookmark/star toggle on flashcards for quick access

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. Note: auto-play mode and bookmark/star features were discussed as edge cases but user confirmed they're UX polish within this phase's scope.

</deferred>

---

*Phase: 37-bug-fixes-ux-polish*
*Context gathered: 2026-02-20*
