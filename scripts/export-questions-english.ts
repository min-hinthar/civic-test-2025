/**
 * Export question English text to JSON for edge-tts generation.
 *
 * Usage: npx tsx scripts/export-questions-english.ts
 * Output: scripts/questions-english-export.json
 */

import { allQuestions } from '@/constants/questions';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ExportedQuestion {
  id: string;
  question_en: string;
  answer_en: string;
  explanation_en: string;
}

const exported: ExportedQuestion[] = allQuestions.map(q => {
  // Join all study answer English texts with ". "
  const answerText = q.studyAnswers.map(a => a.text_en).join('. ');

  // Explanation brief in English (empty string if not available)
  const explanationText = q.explanation?.brief_en ?? '';

  return {
    id: q.id,
    question_en: q.question_en,
    answer_en: answerText,
    explanation_en: explanationText,
  };
});

const outputPath = join(__dirname, 'questions-english-export.json');
writeFileSync(outputPath, JSON.stringify(exported, null, 2), 'utf-8');

console.log(`Exported ${exported.length} questions to ${outputPath}`);

// Summary stats
const withExplanation = exported.filter(q => q.explanation_en.length > 0).length;
const withAnswer = exported.filter(q => q.answer_en.length > 0).length;
console.log(`  Questions with English answers: ${withAnswer}/${exported.length}`);
console.log(`  Questions with English explanations: ${withExplanation}/${exported.length}`);
