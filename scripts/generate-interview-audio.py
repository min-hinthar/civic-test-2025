#!/usr/bin/env python3
"""Generate pre-recorded interview audio (greetings, closings, feedback prefixes).

Usage:
  pip install edge-tts
  python scripts/generate-interview-audio.py

Generates:
  public/audio/en-US/ava/interview/*.mp3
"""
import asyncio
import os
import sys

try:
    import edge_tts
except ImportError:
    print("Install edge-tts: pip install edge-tts")
    sys.exit(1)

VOICE = 'en-US-AvaMultilingualNeural'
OUTPUT_DIR = 'public/audio/en-US/ava/interview'

# All interview audio to generate: (filename, text)
INTERVIEW_AUDIO = [
    # Greetings (3 variations)
    ('greeting-01', "Good morning. I'm going to ask you some questions about U.S. history and government. Please answer to the best of your ability."),
    ('greeting-02', "Hello. Today I'll be asking you some questions about United States civics. Please listen carefully and answer each question."),
    ('greeting-03', "Welcome. I'm going to read you some questions about American government and history. Please give your best answer to each one."),
    # Early termination announcements
    ('pass-announce', "Congratulations! You've passed the civics test."),
    ('fail-announce', "Unfortunately, you didn't reach the passing score this time."),
    # Practice feedback prefixes (played before answer audio)
    ('correct-prefix', "Correct! The answer is:"),
    ('incorrect-prefix', "The correct answer is:"),
    # Closing statements (InterviewResults page)
    ('closing-pass-01', "Congratulations. You have successfully completed the civics portion of your interview. Well done."),
    ('closing-pass-02', "Great job. You've passed the civics test. You should be very proud of your preparation."),
    ('closing-fail-01', "Thank you for your effort today. You can retake this test to continue preparing for your interview."),
    ('closing-fail-02', "Don't be discouraged. Many people need extra practice. You can try again when you're ready."),
    # Practice mode feedback variations (correct)
    ('feedback-correct-01', "That's correct."),
    ('feedback-correct-02', "Yes, that's right."),
    ('feedback-correct-03', "Correct."),
    # Practice mode feedback variations (incorrect)
    ('feedback-incorrect-01', "That's not quite right."),
    ('feedback-incorrect-02', "I'm sorry, that's not correct."),
    ('feedback-incorrect-03', "Not quite."),
]


async def generate(text: str, output_path: str):
    """Generate a single audio file."""
    communicate = edge_tts.Communicate(text, VOICE, rate='+0%')
    await communicate.save(output_path)
    size_kb = os.path.getsize(output_path) / 1024
    print(f"  OK ({size_kb:.1f}KB): {output_path}")


async def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Voice: {VOICE}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Files to generate: {len(INTERVIEW_AUDIO)}")

    generated = 0
    for name, text in INTERVIEW_AUDIO:
        path = os.path.join(OUTPUT_DIR, f'{name}.mp3')
        if os.path.exists(path):
            print(f"  EXISTS: {path}")
        else:
            print(f"\n  Generating: {name}")
            await generate(text, path)
            generated += 1

    print(f"\n=== Done: {generated} files generated ===")


if __name__ == '__main__':
    asyncio.run(main())
