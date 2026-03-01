---
phase: 45
slug: content-enrichment
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-01
---

# Phase 45 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `pnpm vitest run src/constants/questions/questions.test.ts` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run src/constants/questions/questions.test.ts`
- **After every plan wave:** Run `pnpm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| W0-tests | 01 | 0 | CONT-01..04,07 | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | Extend existing | ⬜ pending |
| 01-data-gov | 01 | 1 | CONT-01..04 | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | ✅ after W0 | ⬜ pending |
| 01-data-hist | 01 | 1 | CONT-01..04 | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | ✅ after W0 | ⬜ pending |
| 01-data-other | 01 | 1 | CONT-01..04 | unit | `pnpm vitest run src/constants/questions/questions.test.ts` | ✅ after W0 | ⬜ pending |
| 02-mnemonic-ui | 02 | 2 | CONT-05 | manual | Visual inspection | N/A | ⬜ pending |
| 02-tricky-badge | 02 | 2 | CONT-07 | unit+manual | `pnpm vitest run src/constants/questions/questions.test.ts` | ✅ after W0 | ⬜ pending |
| 02-study-tip | 02 | 2 | CONT-06 | unit | `pnpm vitest run src/components/drill/StudyTipCard.test.ts` | ❌ W0 | ⬜ pending |
| 03-wire | 03 | 3 | CONT-05..08 | manual | Visual inspection + `pnpm build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Extend `src/constants/questions/questions.test.ts` — add enrichment completeness assertions for mnemonic_en, funFact_en/my, commonMistake_en/my, citation on all 128 questions
- [ ] Add tricky flag validation (all questions with tricky:true are valid question IDs)
- [ ] Create `src/components/drill/StudyTipCard.test.ts` — dismissal logic unit tests

*These tests are expected to FAIL initially (red) and turn green as content is populated.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mnemonic renders with Lightbulb + amber left border | CONT-05 | Visual styling verification | Open flashcard back, verify lightbulb icon and amber left border on mnemonic section |
| Study tip card appears at top of category drill | CONT-06 | Layout position verification | Start category drill, verify study tip card at top, dismiss, reload, verify gone |
| Tricky badge appears on flagged questions | CONT-07 | Visual placement in FeedbackPanel and Flashcard3D | Answer a tricky question incorrectly in practice, verify badge in feedback panel |
| Related question chips navigate correctly | CONT-08 | Navigation behavior | Expand a related question link in ExplanationCard, verify content shows |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
