/**
 * Interviewer greeting and closing text for interview simulation.
 *
 * Provides USCIS-style greeting variations and pass/fail closing statements.
 * English only (matching the real USCIS interview format).
 */

/** USCIS-style greeting variations read at the start of the civics test */
export const INTERVIEWER_GREETINGS: string[] = [
  'Good morning. I\'m going to ask you some questions about U.S. history and government. Please answer to the best of your ability.',
  'Hello. Today I\'ll be asking you some questions about United States civics. Please listen carefully and answer each question.',
  'Welcome. I\'m going to read you some questions about American government and history. Please give your best answer to each one.',
];

/** Closing statements when the applicant passes */
export const CLOSING_PASS: string[] = [
  'Congratulations. You have successfully completed the civics portion of your interview. Well done.',
  'Great job. You\'ve passed the civics test. You should be very proud of your preparation.',
];

/** Closing statements when the applicant does not pass */
export const CLOSING_FAIL: string[] = [
  'Thank you for your effort today. You can retake this test to continue preparing for your interview.',
  'Don\'t be discouraged. Many people need extra practice. You can try again when you\'re ready.',
];

/** Pick a random greeting from the INTERVIEWER_GREETINGS array */
export function getRandomGreeting(): string {
  return INTERVIEWER_GREETINGS[
    Math.floor(Math.random() * INTERVIEWER_GREETINGS.length)
  ];
}

/** Pick a random closing statement based on pass/fail */
export function getClosingStatement(passed: boolean): string {
  const pool = passed ? CLOSING_PASS : CLOSING_FAIL;
  return pool[Math.floor(Math.random() * pool.length)];
}
