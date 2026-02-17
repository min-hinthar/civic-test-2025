#!/usr/bin/env python3
"""Generate English audio files for all civics questions using Microsoft Ava.

Usage:
  pip install edge-tts
  npx tsx scripts/export-questions-english.ts
  python scripts/generate-english-audio.py

Generates:
  public/audio/en-US/ava/{id}-{q|a|e}.mp3
"""
import asyncio
import json
import os
import sys

try:
    import edge_tts
except ImportError:
    print("Install edge-tts: pip install edge-tts")
    sys.exit(1)

VOICE = 'en-US-AvaMultilingualNeural'
OUTPUT_DIR = 'public/audio/en-US/ava'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_FILE = os.path.join(SCRIPT_DIR, 'questions-english-export.json')


async def generate(text: str, voice: str, output_path: str):
    """Generate a single audio file."""
    if not text or not text.strip():
        print(f"  SKIP (empty text): {output_path}")
        return
    communicate = edge_tts.Communicate(text, voice, rate='+0%')
    await communicate.save(output_path)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  OK ({size_kb:.1f}KB): {output_path}")


async def main():
    if not os.path.exists(QUESTIONS_FILE):
        print(f"Error: {QUESTIONS_FILE} not found.")
        print("Run: npx tsx scripts/export-questions-english.ts")
        sys.exit(1)

    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Loaded {len(questions)} questions")
    print(f"Voice: {VOICE}")
    print(f"Output: {OUTPUT_DIR}")
    total_files = 0
    skipped = 0

    for i, q in enumerate(questions):
        qid = q['id']
        print(f"\n[{i+1}/{len(questions)}] {qid}")

        # Question audio
        q_path = os.path.join(OUTPUT_DIR, f'{qid}-q.mp3')
        if not os.path.exists(q_path):
            await generate(q['question_en'], VOICE, q_path)
            total_files += 1
        else:
            print(f"  EXISTS: {q_path}")

        # Answer audio (joined study answers)
        a_path = os.path.join(OUTPUT_DIR, f'{qid}-a.mp3')
        if not os.path.exists(a_path):
            answer_text = q.get('answer_en', '')
            if answer_text:
                await generate(answer_text, VOICE, a_path)
                total_files += 1
            else:
                skipped += 1
        else:
            print(f"  EXISTS: {a_path}")

        # Explanation audio
        e_path = os.path.join(OUTPUT_DIR, f'{qid}-e.mp3')
        if not os.path.exists(e_path):
            explanation_en = q.get('explanation_en', '')
            if explanation_en:
                await generate(explanation_en, VOICE, e_path)
                total_files += 1
            else:
                print(f"  SKIP (no explanation): {e_path}")
                skipped += 1
        else:
            print(f"  EXISTS: {e_path}")

    print(f"\n=== Done: {total_files} files generated, {skipped} skipped ===")


if __name__ == '__main__':
    asyncio.run(main())
