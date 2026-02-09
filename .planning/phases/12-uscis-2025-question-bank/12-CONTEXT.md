# Phase 12: USCIS 2025 Question Bank - Context

**Gathered:** 2026-02-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Expand the civics question bank from 120 to 128 questions matching the official USCIS 2025 civics test content. Update all progress metrics, badge thresholds, and counters to reflect the 128-question total. Add dynamic answer handling with state personalization and a "2025 updated" indicator. The question data structure, study mode, mock test, interview simulation, and SRS all consume the expanded bank.

</domain>

<decisions>
## Implementation Decisions

### Missing Questions Source & Verification
- Claude researches the best public USCIS source to identify the 8 missing questions and cross-references against the existing 120
- New questions ship with full bilingual (English + Burmese) translations from day one
- Keep current 7 sub-category names — only add/remap if a question doesn't fit any existing category
- New questions continue the existing ID sequence in their sub-category (GOV-P17, HIST-C17, etc.)
- Distractors (wrong answers) should be plausible but clearly wrong — same style as existing questions
- Keep the `studyAnswers` array pattern for multi-answer questions
- Full audit scope: Claude decides during research whether to re-verify all 120 existing questions or only add the 8 missing ones

### Dynamic Answer Handling
- Questions with changing answers (president, senators, governor, etc.) get a `dynamic: true` metadata flag AND code comments explaining what to update and when — Claude decides the exact marking approach
- **User-facing note:** Show a bilingual "Answer may change with elections" note on dynamic questions — visible in both study mode and mock test mode
- **Last-updated date:** Show when dynamic answers were last verified — Claude decides per-question vs global granularity
- Claude identifies all dynamic questions during research phase

### State Personalization (NEW — scoped for Phase 12)
- **State picker:** Add a simple state/territory selector (50 states + DC + territories: PR, GU, VI, AS, MP)
- **Picker location:** Available during onboarding flow AND in Settings to change later
- **Pre-populated answers:** When user selects a state, dynamic questions show actual representative names (governor, senators) for that state
- **Data source:** Hybrid approach — static JSON fallback data shipped with app + periodic API refresh when online (offline-first PWA compatibility)
- **API research:** Claude researches the best free civic data API during research phase

### Mastery Migration Strategy
- **Let mastery dip naturally** — 8 new unscored questions (~6% of total) cause a minimal dip that self-corrects as users study
- **No migration notice** — the dip is small enough to not warrant user communication
- **Immediate recalculation** — readiness score reflects 128-question bank from the update, no gradual phase-in
- **Counter update:** "Questions practiced" counter updates to X / 128 immediately
- **Weak area detection:** Auto-recalibrates using current question counts per category
- **Interview simulation:** Draws from the full 128-question pool
- **SRS handling:** Claude follows the existing SRS flow for unseen questions (decides auto-add vs first-encounter)

### 2025 Update Indicator
- **Placement:** Dashboard, study page, mock test intro, and interview sim intro — everywhere relevant
- **Visual style:** Thin banner/ribbon: "Updated for USCIS 2025 Civics Test" — bilingual (English + Burmese)
- **What's New splash:** One-time dismissible modal/bottom sheet for existing users highlighting: 8 new questions added, USCIS 2025 update, state personalization feature
- Show "128 questions" in the banner or nearby context

### Claude's Discretion
- Badge threshold adjustments (keep current vs scale proportionally) — analyze current definitions and recommend
- Mock test question count and pass threshold — research actual USCIS test format and match it
- Automated test for question bank validation (128 count, unique IDs, Burmese present, valid categories) — Claude determines appropriate validation level
- Dynamic answer marking approach details (metadata flag vs comments vs both)
- Last-updated date granularity (per-question vs global)
- Whether to do a full audit of existing 120 questions or only find the 8 missing
- SRS entry strategy for new questions

</decisions>

<specifics>
## Specific Ideas

- State picker should include territories (DC, Puerto Rico, Guam, Virgin Islands, American Samoa, Northern Mariana Islands) since USCIS applicants live there
- Pre-populate actual representative names when a state is selected — not just "look this up" prompts
- Hybrid data architecture: static JSON bundled in app for offline use, API refresh when online to keep representative data current
- What's New splash should mention the state personalization as a feature alongside the question expansion
- Dynamic answer note should be bilingual and appear in both study and test modes — it's informational, not a hint

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-uscis-2025-question-bank*
*Context gathered: 2026-02-09*
