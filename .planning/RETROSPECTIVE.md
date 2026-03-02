# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v4.0 — Next-Gen Architecture

**Shipped:** 2026-03-02
**Phases:** 10 | **Plans:** 30 | **Tasks:** 59

### What Was Built
- Next.js 16 App Router migration: file-based routing, nonce CSP, removed react-router-dom
- Test readiness scoring (0-100%) with accuracy/coverage/consistency dimensions and FSRS retrievability
- Weak-area drill mode with 3 entry points and pre/post mastery delta
- Test date countdown with adaptive daily study plan (SRS reviews + new questions + mock test)
- Content enrichment: mnemonics, fun facts, common mistakes, citations, study tips, related questions for all 128 USCIS questions
- Cross-device sync: settings, bookmarks, streaks, and answer history via Supabase with visibility-based re-pull
- Bundle optimization: dynamic imports for recharts/confetti, optimizePackageImports

### What Worked
- All-at-once route migration avoided mixed-router state corruption — zero regressions
- TDD approach for readiness engine and study plan engine caught edge cases early
- Programmatic content injection for large question files (47+28 questions) saved hours over manual editing
- Nonce-based CSP with strict-dynamic simplified security header management
- Phase 43.5 (inserted gap closure) caught integration issues before they compounded

### What Was Inefficient
- Phase 45 Plan 01 (content enrichment data) took 142 minutes — bulk content authoring is inherently slow
- SUMMARY file format inconsistency (some have frontmatter, some don't) required cleanup
- ROADMAP.md plan checkboxes fell out of sync during rapid execution — manual updates needed
- Phase 47 SUMMARY files initially missing requirements-completed frontmatter

### Patterns Established
- `useRef + useEffect` pattern for user ID access satisfying React Compiler react-hooks/refs rule
- `gatherCurrentSettings()` centralized in settingsSync.ts for single-source localStorage key mapping
- Visibility-based sync with 5s throttle for cross-device data freshness
- Native `<input type='date'>` for date pickers (zero new dependencies)
- Amber color scheme for mnemonic sections (distinct from primary blue)

### Key Lessons
1. Bulk content authoring (128 questions x 5 fields each) dominates phase time — consider AI-assisted generation for future content milestones
2. Route migration is safest as atomic operation — incremental migration causes state corruption in provider-heavy apps
3. Cross-device sync is simpler with individual columns than JSONB — type safety and query simplicity outweigh schema flexibility
4. Nonce-based CSP with strict-dynamic is strictly better than hash-based for App Router (proxy.ts generates per-request)
5. Inserted decimal phases (43.5) are effective for catching integration gaps between major feature phases

### Cost Observations
- Model mix: ~90% opus, ~10% sonnet (sonnet for test/lint verification)
- Quality model profile used throughout
- Notable: Content enrichment (Phase 45) was the bottleneck — ~50% of total execution time

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 10 | 72 | Foundation — established GSD workflow |
| v2.0 | 7 | 47 | Streamlined — fewer plans per phase |
| v2.1 | 11 | 82 | Quality — gap closure phases introduced |
| v3.0 | 10 | 47 | Polish — decimal phases for urgent work |
| v4.0 | 10 | 30 | Architecture — TDD and bulk content patterns |

### Cumulative Quality

| Milestone | Tests | Requirements | Satisfaction |
|-----------|-------|-------------|-------------|
| v1.0 | ~200 | 55 | 55/55 (100%) |
| v2.0 | ~350 | 29 | 29/29 (100%) |
| v2.1 | ~450 | 66 | 65/66 (98.5%) |
| v3.0 | ~550 | 39 | 39/39 (100%) |
| v4.0 | 588 | 38 | 38/38 (100%) |

### Top Lessons (Verified Across Milestones)

1. Atomic migrations beat incremental — verified in v2.0 (navigation), v2.1 (UX overhaul), v4.0 (route migration)
2. Gap closure phases pay for themselves — verified in v2.1 (phases 26-27), v4.0 (phase 43.5)
3. TDD for pure logic engines saves rework — verified in v1.0 (FSRS), v4.0 (readiness, study plan)
4. Content authoring is always the bottleneck — verified in v2.0 (128 questions), v2.1 (Burmese audit), v4.0 (enrichment)
