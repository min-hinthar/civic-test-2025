#!/usr/bin/env python3
"""Generate Burmese audio files for all 128 civics questions.

Usage:
  pip install edge-tts
  python scripts/generate-burmese-audio.py

Generates:
  public/audio/my-MM/female/{id}-{q|a|e}.mp3  (Nilar)
  public/audio/my-MM/male/{id}-{q|a|e}.mp3    (Thiha)
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

VOICES = {
    'female': 'my-MM-NilarNeural',
    'male': 'my-MM-ThihaNeural',
}

OUTPUT_DIR = 'public/audio/my-MM'
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
QUESTIONS_FILE = os.path.join(SCRIPT_DIR, 'questions-export.json')


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
        print(f"Error: {QUESTIONS_FILE} not found. Run: npx tsx scripts/export-questions.ts")
        sys.exit(1)

    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)

    print(f"Loaded {len(questions)} questions")
    total_files = 0
    skipped = 0

    for gender, voice_name in VOICES.items():
        out_dir = os.path.join(OUTPUT_DIR, gender)
        os.makedirs(out_dir, exist_ok=True)
        print(f"\n=== Generating {gender} voice ({voice_name}) ===")

        for i, q in enumerate(questions):
            qid = q['id']
            print(f"\n[{i+1}/{len(questions)}] {qid}")

            # Question audio
            q_path = os.path.join(out_dir, f'{qid}-q.mp3')
            if not os.path.exists(q_path):
                await generate(q['question_my'], voice_name, q_path)
                total_files += 1
            else:
                print(f"  EXISTS: {q_path}")

            # Answer audio (joined study answers)
            a_path = os.path.join(out_dir, f'{qid}-a.mp3')
            if not os.path.exists(a_path):
                answer_text = q.get('answer_my', '')
                if answer_text:
                    await generate(answer_text, voice_name, a_path)
                    total_files += 1
                else:
                    skipped += 1
            else:
                print(f"  EXISTS: {a_path}")

            # Explanation audio
            e_path = os.path.join(out_dir, f'{qid}-e.mp3')
            if not os.path.exists(e_path):
                explanation_my = q.get('explanation_my', '')
                if explanation_my:
                    await generate(explanation_my, voice_name, e_path)
                    total_files += 1
                else:
                    print(f"  SKIP (no explanation): {e_path}")
                    skipped += 1
            else:
                print(f"  EXISTS: {e_path}")

    print(f"\n=== Done: {total_files} files generated, {skipped} skipped ===")


if __name__ == '__main__':
    asyncio.run(main())
