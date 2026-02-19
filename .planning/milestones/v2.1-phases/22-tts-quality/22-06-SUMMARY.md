---
phase: 22-tts-quality
plan: 06
subsystem: audio
tags: [tts, burmese, audio-generation, edge-tts, pipeline]

# Dependency graph
requires:
  - phase: 22-03
    provides: "USCIS 2025 explanations with Burmese translations"
  - phase: 22-04
    provides: "Burmese audio adapter and BurmeseSpeechButton"
provides:
  - "768 pre-generated Burmese MP3 files (128 questions x 3 types x 2 voices)"
  - "Audio generation pipeline scripts (export, generate, compress)"
affects: [22-07, 22-08]

# Tech tracking
tech-stack:
  added:
    - "edge-tts (Python, for MP3 generation)"
  patterns:
    - "Question export: TypeScript -> JSON -> Python pipeline"
    - "Idempotent generation: skip existing files on re-run"
    - "Naming convention: {questionId}-{q|a|e}.mp3 in gender directories"

key-files:
  created:
    - "scripts/export-questions.ts"
    - "scripts/generate-burmese-audio.py"
    - "scripts/compress-audio.sh"
    - "scripts/questions-export.json"
    - "public/audio/my-MM/female/ (384 files)"
    - "public/audio/my-MM/male/ (384 files)"
  modified: []

key-decisions:
  - "Two voices generated: my-MM-NilarNeural (female) and my-MM-ThihaNeural (male)"
  - "Three audio types per question: q (question), a (answer), e (explanation)"
  - "Audio stored at public/audio/my-MM/{female,male}/{id}-{type}.mp3"
  - "VoicePicker sorts high-quality natural US English voices to top (Ava, Andrew, Jenny)"

patterns-established:
  - "Edge-tts generation pipeline for pre-generated audio assets"
  - "Idempotent script design: check existence before generation"

# Metrics
duration: manual
completed: 2026-02-15
---

# Phase 22 Plan 06: Edge-tts Generation Scripts + Audio File Generation Summary

**Complete Burmese audio generation pipeline producing 768 MP3 files for all 128 civics questions with both Nilar (female) and Thiha (male) voices via edge-tts**

## Performance

- **Duration:** Manual (user-driven checkpoint)
- **Completed:** 2026-02-15
- **Tasks:** 2 (1 auto + 1 checkpoint)
- **Files created:** 772 (4 scripts + 768 MP3 files)

## Accomplishments
- Created TypeScript question export script that extracts Burmese text from all 128 questions to JSON
- Created Python edge-tts generation script with idempotent re-run support and progress logging
- Created shell compression script for optional 64kbps mono bitrate reduction via ffmpeg
- Generated 768 MP3 files: 384 female (Nilar) + 384 male (Thiha), covering question/answer/explanation for each
- VoicePicker quality sorting to prioritize natural US English voices

## Task Commits

Each task was committed atomically:

1. **Task 1: Create question export script and edge-tts generation script** - `d812b29` (feat)
2. **Task 2: Generate Burmese audio files + VoicePicker quality sorting** - `7727aca` (feat)

## Files Created/Modified
- `scripts/export-questions.ts` - Extracts Burmese text from questions to JSON
- `scripts/generate-burmese-audio.py` - Edge-tts generation for both voices
- `scripts/compress-audio.sh` - Optional ffmpeg compression to 64kbps mono
- `scripts/questions-export.json` - Intermediate JSON consumed by Python script
- `public/audio/my-MM/female/*.mp3` - 384 Nilar voice audio files
- `public/audio/my-MM/male/*.mp3` - 384 Thiha voice audio files

## Decisions Made
- Two voices: my-MM-NilarNeural (female) and my-MM-ThihaNeural (male) for user choice
- Three audio types per question: q (question text), a (study answers joined), e (explanation brief)
- Naming convention: `{questionId}-{q|a|e}.mp3` in gender-specific directories
- Idempotent generation: existing files are skipped on re-run for safe partial retries
- VoicePicker now sorts high-quality natural voices (Ava, Andrew, Jenny) to top of list

## Deviations from Plan

None - all planned work completed as specified.

## Issues Encountered
None

## User Setup Required
None - audio files are committed to the repository.

## Next Phase Readiness
- 768 MP3 files available for BurmeseSpeechButton and auto-read integration (plans 22-07, 22-08)
- Pipeline scripts available for future re-generation if question bank changes
- No blockers for remaining plans

---
*Phase: 22-tts-quality*
*Completed: 2026-02-15*
