# Phase 34: Content & About Page - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Build an About page that tells the app's origin story, honors its inspirational figures with bilingual dedication cards, and is accessible from the landing page, app header, and Settings. The 28 USCIS 2025 explanations are already complete — no explanation work needed. The quality audit (CONT-02) was completed in prior phases.

</domain>

<decisions>
## Implementation Decisions

### Explanation Completeness (CONT-01 / CONT-02)
- All 128 USCIS questions already have full explanation objects (brief_en, brief_my, citation, optional commonMistake/funFact/relatedQuestionIds)
- The 28 USCIS 2025 additions have been populated since roadmap creation
- No new explanation writing or quality audit work required
- If any gaps are discovered during implementation, fill them matching the existing format and depth

### About Page Narrative
- **Tone:** Personal storytelling — warm, first-person or close narrative voice ("This app was born from...")
- **Emotional weight:** Heartfelt and moving — the reader should feel something
- **Burmese framing:** Burmese-anchored, broader welcome — born from the Burmese community experience, but welcoming to anyone preparing for the civics test
- **Content:** Claude drafts narrative from publicly available information about VIA, Pre-Collegiate Program, and Learning Across Borders
- **No tech details** — focus purely on mission, people, and impact
- **Page length:** Medium read (3-4 scrolls) — enough room for meaningful story without feeling like an essay
- **Language:** Follows the app's language toggle (English OR Burmese based on user setting)
- **Call to action:** Share the app — encourage sharing with community members who might benefit
- **External links:** A few key links (2-3 stable resources like USCIS.gov, VIA's website)
- **Footer:** Version + year + open source notice with GitHub repo link

### About Page Structure
- Claude's Discretion on section flow — design for maximum narrative impact
- Meaningful VIA / Pre-Collegiate section (dedicated paragraph explaining what they are, their impact, how they connect to this app)

### Dedication Cards
- **Two cards:** One for Dwight D. Clark, one shared for Dorothy & James Guyot
- **Dwight D. Clark:** Founder of VIA (Volunteers in Asia) and Learning Across Borders (connecting East Asia Youth/Students with South East Asia Youth/Students)
- **Dorothy & James Guyot:** Co-founders of Pre-Collegiate Program (Yangon), with Sayar-Gyi Khin Maung Win (Philosophy) named as co-founder within their card
- **Prominence:** Featured section with visual emphasis — distinct, honored part of the page
- **Card content:** Claude's Discretion — design to honor each person with dignity and warmth (may include name, role, tribute, quotes)
- **Bilingual rendering:** Follows language toggle, same as rest of page
- **Visual treatment:** Claude's Discretion — pick treatment that honors the people while fitting the app's design language
- **Interaction:** Tap to expand — cards show brief tribute by default, tap/click to reveal more detail
- **Animation:** Claude's Discretion on entrance animation — respectful and consistent with app's motion system
- **Research:** Claude researches publicly available information about these people for the dedication content

### Page Placement & Navigation
- **Route:** `#/about` — clean, standard hash route
- **Accessible from:** Landing page + Settings + app header
- **Landing page:** Narrative teaser — brief sentence/section hinting at the story, linking to About page
- **Header:** Heart icon linking to About page
- **Settings:** Link to About page
- **Mobile layout:** Full-screen reading experience — hide bottom nav bar, back button at top to return

### Claude's Discretion
- Section flow and ordering of the About page
- Dedication card visual treatment and entrance animation
- Dedication card content structure (name/role/tribute/quote balance)
- External resource link selection
- Narrative teaser wording on landing page
- Header heart icon placement and sizing

</decisions>

<specifics>
## Specific Ideas

- Dwight D. Clark is founder of both VIA (Volunteers in Asia) and Learning Across Borders (connecting East Asia Youth/Students with South East Asia Youth/Students)
- Dorothy & James Guyot co-founded Pre-Collegiate Program (Yangon) together with Sayar-Gyi Khin Maung Win (Philosophy) — all three should be named, with Khin Maung Win honored within the Guyots' card
- The app is Burmese-anchored but broadly welcoming — the story centers the Burmese immigrant experience while inviting anyone preparing for the civics test
- Personal storytelling tone that's heartfelt and moving — this is a page about people and purpose, not technology
- "Sayar-Gyi" is an honorific — preserve it in the Burmese cultural context

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 34-content-about-page*
*Context gathered: 2026-02-19*
