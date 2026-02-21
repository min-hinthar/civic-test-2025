# Phase 4: Learning - Explanations & Category Progress - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Users understand why answers are correct and can track their mastery by category, enabling focused study on weak areas. This phase delivers: bilingual answer explanations, per-category mastery tracking with visual progress, category-focused practice tests, and weak area detection with actionable nudges.

Out of scope: Spaced repetition scheduling (Phase 5), interview simulation (Phase 6), social features (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Explanation Content & Format
- **Detail level:** Brief (2-3 sentences) per explanation
- **Bilingual layout:** Stacked — English on top, Burmese below (consistent with existing BilingualText pattern)
- **Tone:** Friendly & simple — plain language, like a helpful tutor explaining to a friend
- **Source citations:** Only for constitutional questions (cite specific articles/amendments); skip for general knowledge
- **Translation approach:** Natural Burmese rephrasing (meaning-equivalent, not word-for-word)
- **Content generation:** AI-generated then reviewed — cross-reference with USCIS materials, flag uncertain ones for manual review
- **Offline support:** Explanations cached with questions in IndexedDB for offline access
- **Accessibility:** Extra focus on readability — larger text options, adjustable font size, high contrast mode for explanation content

### Explanation Presentation in Test Mode
- **Timing:** Both — brief hint after each question AND full review screen at end
- **Brief hint style:** Small expandable card — collapsed by default with "Why?" link, expands to show the brief explanation
- **Correct vs wrong answers:** Extra context for wrong answers — "Common mistake" note explaining why the wrong choice is wrong
- **Review screen structure:** Default to showing only incorrect questions, with option to see all
- **Wrong answer display:** Show both — "You answered: X" and "Correct answer: Y" on review screen

### Explanation Enhancements
- **Memory aids / mnemonics:** Include where natural — only when there's a genuinely helpful mnemonic, skip when forced. Bilingual (EN + MY, with potentially different mnemonics per language)
- **Visual aids:** Claude's discretion — pick appropriate visual treatment per explanation (icons, emoji, simple illustrations)
- **Related questions:** "See also" section at bottom of explanation linking to related questions — links expand inline (stay in current view)
- **Fun facts:** Include where relevant — brief cultural connection or fun fact when it makes content more memorable

### Study Guide Flashcard Explanations
- **Placement:** Expandable below answer — answer shows first, tap to expand explanation (less visual clutter)

### Category Progress Visualization
- **Location:** Both — compact summary on dashboard + detailed dedicated progress page
- **Visual style:** Animated, stylized hybrid — Duolingo-style inspiration
  - Main ring (radial) per USCIS category with sub-category horizontal progress bars within
  - Staggered card entrance + animated progress fill on dashboard load
  - Distinct color per category (e.g., blue for Government, amber for History, green for Civics)
- **Categories:** USCIS official 3 main categories (American Government, American History, Integrated Civics) with sub-categories
- **Mastery calculation:** Recent accuracy weighted — recent answers weigh more than old ones
- **Dashboard display:** Collapsible "Category Progress" section with compact grid of all categories
- **Progress page:**
  - Prominent overall readiness score at top
  - Expandable to individual questions within each category
  - Question rows show: question text + historical accuracy percentage (e.g., "3/5 correct (60%)")
  - Line chart showing mastery trend over time
  - Accessible from dashboard link (not bottom nav tab)
- **Readiness score:** Claude's discretion on how to connect dashboard ReadinessIndicator with progress page readiness display

### Mastery Milestones & Celebrations
- **Badge evolution:** Bronze (50%) → Silver (75%) → Gold (100%) per category
- **Celebration intensity scales by milestone:**
  - 50%: Subtle sparkle + encouraging bilingual message
  - 75%: Confetti animation + congratulatory message
  - 100%: Big celebration + crown/star badge + gold card treatment
- **100% mastery:** Both badge + gold card — permanent crown/star badge on category + gold card treatment

### Category Practice Flow
- **Entry points:** Both — from progress page ("Practice this category" button with mastery stats) AND from test start screen (category filter with mini progress indicators per category)
- **Question count:** User chooses via segmented control / pills: Quick (5), Standard (10), Full (all)
- **Timer:** Optional — off by default, can be turned on for test simulation
- **Question order:** Smart mix — 70% weak questions / 30% strong questions
- **Sub-category practice:** Available — can practice sub-categories within the 3 main USCIS categories
- **Multi-category selection:** Claude's discretion
- **"Practice All Weak Areas":** Yes — one-tap option to practice questions across all weak categories mixed together
- **Results tracking:** Practice sessions tracked in separate "Practice Sessions" tab on history page (not mixed with regular tests)
- **Mastery tracking:** Claude's discretion on how practice results feed into mastery calculation
- **Post-session display:** Score + review + animated mastery update (single ring filling from old to new percentage with number counting up)
- **Explanation behavior:** Same as test mode — brief expandable hint after each answer, full review at end
- **No retry option** after finishing a practice session
- **Mastered category handling:** Suggest weaker categories — "This is mastered! Want to practice [weakest category] instead?" with option to proceed anyway
- **CTA context:** "Practice this category" button shows current mastery % + improvement potential

### Weak Area Detection & Nudges
- **Dashboard placement:** Dedicated "Suggested Focus" section with weak areas + quick-start buttons
  - Each weak category shows: mastery % + "Practice Now" button + "Review in Study Guide" link
  - When all categories above threshold: "Level up" mode — show category closest to next milestone (e.g., "72% — push to silver!")
- **Weakness threshold:** Claude's discretion
- **Nudge tone:** Encouraging with emoji — warm, supportive, like a study buddy ("You're improving! 💪")
- **Message variety:** Rotate through different encouraging phrases and emoji to feel fresh
- **Nudge locations:** Dashboard + post-test results + study guide highlighted sections
  - Post-test placement: Claude's discretion on placement that feels natural
- **Smart rotation:** Yes — vary suggestions, prioritize stale categories (not practiced recently) even if not absolute weakest
- **Study guide highlighting:** Both — category headers show mastery badges + individual wrong-answer questions marked (orange dot or similar)
- **Question mark persistence:** Claude's discretion
- **Unattempted vs weak:** Distinct treatment — "Not started" for unattempted categories vs mastery % for attempted ones, with different nudge messages
- **All content bilingual:** All nudge messages, encouragement, CTAs in both English and Burmese

### Push Notification Nudges
- **Enabled:** Yes, if user has push notifications enabled (uses existing Phase 2 push infrastructure)
- **Frequency:** Every 2-3 days, only if user hasn't studied recently
- **Content:** Target weak/stale areas — "You haven't practiced [category] in [X] days"

### Claude's Discretion
- Explanation data structure (same file as questions vs separate files)
- Exact visual aid treatment per explanation
- Multi-category practice selection UX
- How practice results affect mastery calculation
- Post-test weak area nudge placement
- Question mark persistence behavior in study guide
- Weakness threshold value
- Readiness score connection between dashboard and progress page
- Category color assignments

</decisions>

<specifics>
## Specific Ideas

- "Duolingo-style" progress visualization — colorful, playful, with level-up celebrations
- Badge evolution: bronze → silver → gold with celebration animations scaling by milestone
- Encouraging emoji messages that vary to feel fresh, like a study buddy
- "Practice All Weak Areas" shortcut for users who want guided study without picking categories
- AI-generated explanations cross-referenced with official USCIS study materials
- Memory aids provided in both English and Burmese (potentially different mnemonics per language since what's memorable differs across languages)
- Fun facts and cultural connections where they make explanations more engaging and memorable
- Extra readability focus for explanations — larger text options, adjustable font size

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-learning-explanations-category-progress*
*Context gathered: 2026-02-06*
