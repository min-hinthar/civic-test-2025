# Burmese Translation Review

## Status

| Wave | Scope | Cross-Check File | Status |
|------|-------|-----------------|--------|
| 1a | American Government (47 questions) | `cross-check-wave-1a.md` | Ready for cross-check |
| 1b | Remaining Questions (81 questions) | `cross-check-wave-1b.md` | Ready for cross-check |
| 2 | Centralized Strings (~250 strings) | `cross-check-wave-2.md` | Ready for cross-check |
| 3 | Core Pages (landing, auth, settings, study guide, onboarding) | Applied directly | No cross-check needed |
| 4 | Test/Session/PWA components | Applied directly | No cross-check needed |
| 5 | Social/SRS/Sort components | Applied directly | No cross-check needed |
| 6 | Quiz/Interview/Progress components | Applied directly | No cross-check needed |
| 7 | Rendering layer audit | Verification only | Complete |

## How to Review

1. Open each cross-check file (waves 1a, 1b, 2)
2. Copy the table to **Gemini** and **GPT** independently
3. Ask each: _"Please verify the Burmese translations for accuracy and naturalness. Flag any that sound unnatural, have incorrect meaning, or use inconsistent terminology."_
4. Compare responses from all 3 AIs (Claude's proposals + Gemini + GPT)
5. **2-of-3 agree** -- translation is final (no action needed)
6. **All-3-disagree** -- record below for manual review with a native speaker

### Tips for effective cross-checking

- Send one table section at a time (Questions, Study Answers, MC Answers) for more focused review
- Ask follow-up questions about specific strings if an AI flags something
- For proper nouns, check that the transliteration matches the glossary in `.planning/burmese-glossary.md`
- Pay special attention to civics terms that have both formal and casual forms

## Flagged Disagreements

Record any all-3-disagree strings here for manual review with a native Burmese speaker.

| ID | English | Claude | Gemini | GPT | Notes |
|----|---------|--------|--------|-----|-------|
| _(none yet)_ | | | | | |

## How to Apply Changes

After review, update the Burmese string in the relevant source file:

1. **Question translations** -- edit the file in `src/constants/questions/`
2. **Centralized strings** -- edit `src/lib/i18n/strings.ts` or the relevant string file
3. **Inline component strings** -- edit the component `.tsx` file directly

After any change:
```bash
npm run typecheck    # Verify TypeScript compiles
npm run lint         # Check for lint errors
npm run test:run     # Run test suite
npm run build        # Full production build
```

If question text was changed, regenerate audio:
```bash
npx tsx scripts/export-questions.ts
python scripts/generate-burmese-audio.py
```

Note: The audio script only generates files that don't already exist. Delete the specific question's MP3 files first to force regeneration:
```bash
rm public/audio/my-MM/female/{questionId}-{q,a,e}.mp3
rm public/audio/my-MM/male/{questionId}-{q,a,e}.mp3
```

---

## Phase 25 Changelog Summary

### Questions (Plans 02-03)
- **128 questions** across 7 question files had Burmese translations improved
- **47 American Government** questions: formal register converted to casual conversational, English parentheticals added for all civics terms
- **53 questions** across 5 remaining files (rights-responsibilities, colonial history, 1800s history, recent history, symbols-holidays): proper noun transliterations standardized, conversational register applied
- **28 USCIS 2025 additions**: 8 targeted fixes including Japanese character removal, broken phonetic replacements, and non-standard word corrections

### Centralized Strings (Plan 04)
- **~250 UI strings** in `strings.ts` updated with natural Burmese and glossary-consistent terminology
- **6 navigation tabs** standardized to glossary terms
- **7 badge names** given creative Burmese names with English in parentheses
- **12 nudge message templates** and **8 NBA state strings** improved
- All Unicode escape sequences converted to literal Myanmar characters

### Component Inline Strings (Plans 05-08)
- **Plan 05**: 8 core page files (landing, auth, settings, study guide, onboarding)
- **Plan 06**: 13 test/session/PWA component files
- **Plan 07**: 25 social/SRS/sort component files
- **Plan 08**: 12 quiz/interview/progress component files
- **Total**: ~58 component files with inline Burmese translations improved

### Font & Typography Infrastructure (Plan 01)
- Noto Sans Myanmar loaded from Google Fonts CDN
- Myanmar line-breaking CSS: `overflow-wrap: anywhere` + `word-break: keep-all` + `line-break: strict`
- `.font-myanmar` class includes overflow-wrap for responsive safety

### Rendering Layer Audit (Plan 09)
- 75 TSX files with Myanmar Unicode verified
- 101 files with font-myanmar class verified
- 108 showBurmese-using components verified -- zero unguarded Burmese text
- 1 gap found and fixed (OpEdPage language label)

### Audio Regeneration (Plan 10)
- All 128 question audio files regenerated to match updated translation text
- Female voice (my-MM-NilarNeural) and male voice (my-MM-ThihaNeural) generated via edge-tts
