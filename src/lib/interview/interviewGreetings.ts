/**
 * Interviewer greeting and closing text for interview simulation.
 *
 * Provides USCIS-style greeting variations and pass/fail closing statements.
 * Each text entry is paired with a pre-generated audio file name.
 * English only (matching the real USCIS interview format).
 */

/** Greeting text + audio filename pairs (audio at /audio/en-US/ava/interview/) */
const GREETINGS: Array<{ text: string; audio: string }> = [
  {
    text: "Good morning. I'm going to ask you some questions about U.S. history and government. Please answer to the best of your ability.",
    audio: 'greeting-01',
  },
  {
    text: "Hello. Today I'll be asking you some questions about United States civics. Please listen carefully and answer each question.",
    audio: 'greeting-02',
  },
  {
    text: "Welcome. I'm going to read you some questions about American government and history. Please give your best answer to each one.",
    audio: 'greeting-03',
  },
];

/** Closing statements when the applicant passes */
const CLOSINGS_PASS: Array<{ text: string; audio: string }> = [
  {
    text: 'Congratulations. You have successfully completed the civics portion of your interview. Well done.',
    audio: 'closing-pass-01',
  },
  {
    text: "Great job. You've passed the civics test. You should be very proud of your preparation.",
    audio: 'closing-pass-02',
  },
];

/** Closing statements when the applicant does not pass */
const CLOSINGS_FAIL: Array<{ text: string; audio: string }> = [
  {
    text: 'Thank you for your effort today. You can retake this test to continue preparing for your interview.',
    audio: 'closing-fail-01',
  },
  {
    text: "Don't be discouraged. Many people need extra practice. You can try again when you're ready.",
    audio: 'closing-fail-02',
  },
];

// Keep legacy exports for code that only needs text
export const INTERVIEWER_GREETINGS: string[] = GREETINGS.map(g => g.text);
export const CLOSING_PASS: string[] = CLOSINGS_PASS.map(c => c.text);
export const CLOSING_FAIL: string[] = CLOSINGS_FAIL.map(c => c.text);

/** Pick a random greeting. Returns text + audio filename. */
export function getRandomGreeting(): { text: string; audio: string } {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
}

/** Pick a random closing. Returns text + audio filename. */
export function getClosingStatement(passed: boolean): { text: string; audio: string } {
  const pool = passed ? CLOSINGS_PASS : CLOSINGS_FAIL;
  return pool[Math.floor(Math.random() * pool.length)];
}
