/**
 * Interviewer feedback phrases for interview practice mode.
 *
 * Provides USCIS-style feedback variations for correct and incorrect answers.
 * Each text entry is paired with a pre-generated audio file name.
 * English only (matching the real USCIS interview format).
 */

/** Correct answer feedback phrases (audio at /audio/en-US/ava/interview/) */
const CORRECT_FEEDBACK: Array<{ text: string; audio: string }> = [
  { text: "That's correct.", audio: 'feedback-correct-01' },
  { text: "Yes, that's right.", audio: 'feedback-correct-02' },
  { text: 'Correct.', audio: 'feedback-correct-03' },
];

/** Incorrect answer feedback phrases (audio at /audio/en-US/ava/interview/) */
const INCORRECT_FEEDBACK: Array<{ text: string; audio: string }> = [
  { text: "That's not quite right.", audio: 'feedback-incorrect-01' },
  { text: "I'm sorry, that's not correct.", audio: 'feedback-incorrect-02' },
  { text: 'Not quite.', audio: 'feedback-incorrect-03' },
];

/** All feedback audio filenames for pre-caching */
export const FEEDBACK_AUDIO_NAMES: string[] = [
  ...CORRECT_FEEDBACK.map(f => f.audio),
  ...INCORRECT_FEEDBACK.map(f => f.audio),
];

/** Pick a random correct-answer feedback phrase. Returns text + audio filename. */
export function getCorrectFeedback(): { text: string; audio: string } {
  return CORRECT_FEEDBACK[Math.floor(Math.random() * CORRECT_FEEDBACK.length)];
}

/** Pick a random incorrect-answer feedback phrase. Returns text + audio filename. */
export function getIncorrectFeedback(): { text: string; audio: string } {
  return INCORRECT_FEEDBACK[Math.floor(Math.random() * INCORRECT_FEEDBACK.length)];
}
