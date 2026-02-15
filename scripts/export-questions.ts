/**
 * Export question Burmese text to JSON for edge-tts generation.
 *
 * Usage: npx tsx scripts/export-questions.ts
 * Output: scripts/questions-export.json
 */

import { allQuestions } from '@/constants/questions';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ExportedQuestion {
  id: string;
  question_my: string;
  answer_my: string;
  explanation_my: string;
}

const exported: ExportedQuestion[] = allQuestions.map(q => {
  // Join all study answer Burmese texts with Burmese period + space
  const answerText = q.studyAnswers.map(a => a.text_my).join('\u104B ');

  // Explanation brief in Burmese (empty string if not available)
  const explanationText = q.explanation?.brief_my ?? '';

  return {
    id: q.id,
    question_my: q.question_my,
    answer_my: answerText,
    explanation_my: explanationText,
  };
});

const outputPath = join(__dirname, 'questions-export.json');
writeFileSync(outputPath, JSON.stringify(exported, null, 2), 'utf-8');

console.log(`Exported ${exported.length} questions to ${outputPath}`);

// Summary stats
const withExplanation = exported.filter(q => q.explanation_my.length > 0).length;
const withAnswer = exported.filter(q => q.answer_my.length > 0).length;
console.log(`  Questions with Burmese answers: ${withAnswer}/${exported.length}`);
console.log(`  Questions with Burmese explanations: ${withExplanation}/${exported.length}`);
