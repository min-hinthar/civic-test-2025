/**
 * Answer Grader - Keyword-based fuzzy answer grading for interview simulation
 *
 * Grades spoken civics answers by extracting keywords and comparing against
 * expected answer keywords. Designed for short, predictable civics phrases.
 * No NLP library needed -- civics answers are short predictable phrases.
 */

export interface GradeResult {
  isCorrect: boolean;
  confidence: number; // 0-1 match quality
  matchedKeywords: string[];
  missingKeywords: string[];
  bestMatchAnswer: string; // Which expected answer matched best
}

/** Number words to digit mapping for numeric answer matching */
const NUMBER_WORDS: Record<string, string> = {
  zero: '0',
  one: '1',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  eleven: '11',
  twelve: '12',
  thirteen: '13',
  fourteen: '14',
  fifteen: '15',
  sixteen: '16',
  seventeen: '17',
  eighteen: '18',
  nineteen: '19',
  twenty: '20',
  thirty: '30',
  forty: '40',
  fifty: '50',
  sixty: '60',
  seventy: '70',
  eighty: '80',
  ninety: '90',
  hundred: '100',
};

/** Common civics synonyms for fuzzy matching */
const SYNONYMS: Record<string, string[]> = {
  // Core civic concepts
  freedom: ['liberty', 'freedoms'],
  liberty: ['freedom', 'liberties'],
  president: ['chief executive'],
  law: ['legislation', 'statute', 'laws'],
  legislation: ['law', 'laws'],
  statute: ['law', 'laws'],
  // Government & governance
  constitution: ['constitutional'],
  supreme: ['highest', 'top', 'ultimate'],
  highest: ['supreme', 'top'],
  declare: ['declared', 'announce', 'announced', 'proclaim', 'proclaimed'],
  declared: ['declare', 'announce', 'announced'],
  independence: ['independent'],
  govern: ['governed', 'governing', 'rule', 'ruled'],
  governed: ['govern', 'governing'],
  fought: ['battled', 'warred', 'fight', 'fighting'],
  fight: ['fought', 'battled'],
  equal: ['equality', 'equally'],
  represent: ['representation', 'represents', 'representing'],
  representation: ['represent', 'represents'],
  vote: ['voting', 'votes', 'voted', 'elect'],
  voting: ['vote', 'votes', 'elect'],
  elect: ['elected', 'election', 'vote'],
  elected: ['elect', 'election'],
  election: ['elect', 'elected', 'elections'],
  citizen: ['citizens', 'citizenship'],
  citizens: ['citizen', 'citizenship'],
  amend: ['amended', 'amendment', 'amendments'],
  amendment: ['amend', 'amendments'],
  amendments: ['amend', 'amendment'],
  right: ['rights'],
  rights: ['right'],
  state: ['states'],
  states: ['state'],
  country: ['nation'],
  nation: ['country'],
  people: ['citizens', 'populace'],
  branch: ['branches'],
  branches: ['branch'],
  power: ['powers', 'authority'],
  powers: ['power', 'authority'],
  tax: ['taxes', 'taxation'],
  taxes: ['tax', 'taxation'],
  war: ['wars', 'warfare'],
  speech: ['expression', 'speak'],
  religion: ['religious', 'worship'],
  press: ['media', 'journalism'],
  // Historical
  colony: ['colonies', 'colonial'],
  colonies: ['colony', 'colonial'],
  british: ['britain', 'england', 'english'],
  britain: ['british', 'england'],
  slave: ['slavery', 'slaves', 'enslaved'],
  slavery: ['slave', 'slaves', 'enslaved'],
  civil: ['civilian'],
};

/**
 * Simple suffix-stripping stemmer for civics answers.
 * Reduces common English inflections to base form.
 */
function simpleStem(word: string): string {
  if (word.length <= 3) return word;
  // -ies → -y (e.g., colonies → colony)
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  // -ing → base (e.g., governing → govern, fighting → fight)
  if (word.endsWith('ing') && word.length > 5) {
    // doubled consonant: e.g., "running" → "run"
    const base = word.slice(0, -3);
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    return base;
  }
  // -tion → t (e.g., representation → represent...at — not great, skip this one)
  // -ed → base (e.g., declared → declar, governed → govern)
  if (word.endsWith('ed') && word.length > 4) {
    // doubled consonant: e.g., "stopped" → "stop"
    const base = word.slice(0, -2);
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    return base;
  }
  // -ly → base (e.g., equally → equal)
  if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);
  // -es → base (e.g., branches → branch, taxes → tax)
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  // -s → base (e.g., rights → right, laws → law)
  if (word.endsWith('s') && word.length > 3) return word.slice(0, -1);
  return word;
}

/** Stop words to remove before keyword extraction */
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'to',
  'in',
  'is',
  'was',
  'are',
  'for',
  'and',
  'or',
  'it',
  'he',
  'she',
  'they',
  'we',
  'that',
  'this',
  'its',
  'who',
  'been',
  'has',
  'had',
  'have',
  'do',
  'did',
  'does',
  'be',
  'but',
  'not',
  'with',
  'from',
  'by',
  'on',
  'at',
  'as',
  'think',
  'were',
  'will',
  'would',
  'could',
  'should',
  'can',
  'may',
  'might',
]);

/**
 * Normalize text for comparison:
 * - Lowercase
 * - Strip punctuation
 * - Collapse whitespace
 * - Convert number words to digits
 */
export function normalize(text: string): string {
  let normalized = text
    .toLowerCase()
    // Strip punctuation (apostrophes, periods, commas, etc.)
    .replace(/[^\w\s]/g, '')
    // Replace underscores (from \w match) with nothing
    .replace(/_/g, '');

  // Handle compound number phrases first (e.g., "one hundred" -> "100")
  normalized = normalized.replace(
    /\b(one|two|three|four|five|six|seven|eight|nine)\s+hundred\b/g,
    (_match, multiplier: string) => {
      const digit = NUMBER_WORDS[multiplier];
      return digit ? String(Number(digit) * 100) : _match;
    }
  );

  // Convert remaining number words to digits
  for (const [word, digit] of Object.entries(NUMBER_WORDS)) {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    normalized = normalized.replace(regex, digit);
  }

  // Collapse whitespace and trim
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Extract meaningful keywords from an answer string.
 * Removes stop words and short words (<=2 chars).
 */
export function extractKeywords(answer: string): string[] {
  const normalized = normalize(answer);
  const words = normalized.split(' ');

  return words.filter(word => {
    // Remove stop words
    if (STOP_WORDS.has(word)) return false;
    // Remove words with 2 or fewer characters (unless numeric)
    if (word.length <= 2 && !/^\d+$/.test(word)) return false;
    return true;
  });
}

/**
 * Expand a set of keywords with known civics synonyms and stems.
 * Returns the original keywords, their stems, and any synonym expansions.
 */
function expandWithSynonyms(keywords: string[]): Set<string> {
  const expanded = new Set(keywords);
  for (const keyword of keywords) {
    // Add stemmed form
    expanded.add(simpleStem(keyword));
    // Add synonyms
    const synonyms = SYNONYMS[keyword];
    if (synonyms) {
      for (const synonym of synonyms) {
        for (const word of synonym.split(' ')) {
          expanded.add(word);
          expanded.add(simpleStem(word));
        }
      }
    }
    // Also check if stem matches a synonym key
    const stemmed = simpleStem(keyword);
    const stemSynonyms = SYNONYMS[stemmed];
    if (stemSynonyms) {
      for (const synonym of stemSynonyms) {
        for (const word of synonym.split(' ')) {
          expanded.add(word);
          expanded.add(simpleStem(word));
        }
      }
    }
  }
  return expanded;
}

/**
 * Grade a spoken answer against expected correct answers.
 *
 * @param transcript - The spoken/typed answer text
 * @param expectedAnswers - Array of correct answers (English text used for grading)
 * @param threshold - Minimum confidence to consider correct (default 0.35, lenient for speech)
 * @returns GradeResult with confidence score and keyword analysis
 */
export function gradeAnswer(
  transcript: string,
  expectedAnswers: Array<{ text_en: string; text_my?: string }>,
  threshold = 0.35
): GradeResult {
  // Handle empty transcript
  if (!transcript.trim()) {
    return {
      isCorrect: false,
      confidence: 0,
      matchedKeywords: [],
      missingKeywords: [],
      bestMatchAnswer: expectedAnswers[0]?.text_en ?? '',
    };
  }

  const transcriptKeywords = extractKeywords(transcript);
  const expandedTranscript = expandWithSynonyms(transcriptKeywords);

  let bestConfidence = 0;
  let bestMatched: string[] = [];
  let bestMissing: string[] = [];
  let bestAnswerText = expectedAnswers[0]?.text_en ?? '';

  for (const expected of expectedAnswers) {
    const expectedKeywords = extractKeywords(expected.text_en);

    if (expectedKeywords.length === 0) continue;

    // Check each expected keyword against transcript keywords (with synonyms + stemming)
    const matched: string[] = [];
    const missing: string[] = [];

    for (const keyword of expectedKeywords) {
      const keywordStem = simpleStem(keyword);

      if (expandedTranscript.has(keyword) || expandedTranscript.has(keywordStem)) {
        matched.push(keyword);
      } else {
        // Check if any synonym of this keyword (or its stem) is in the transcript
        let found = false;
        const synonymLists = [SYNONYMS[keyword], SYNONYMS[keywordStem]].filter(Boolean);
        for (const synonyms of synonymLists) {
          if (found) break;
          for (const synonym of synonyms!) {
            const synonymWords = synonym.split(' ');
            if (
              synonymWords.some(
                w => expandedTranscript.has(w) || expandedTranscript.has(simpleStem(w))
              )
            ) {
              matched.push(keyword);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          missing.push(keyword);
        }
      }
    }

    const confidence = matched.length / expectedKeywords.length;

    if (confidence > bestConfidence) {
      bestConfidence = confidence;
      bestMatched = matched;
      bestMissing = missing;
      bestAnswerText = expected.text_en;
    }
  }

  // Round to avoid floating point issues
  const roundedConfidence = Math.round(bestConfidence * 100) / 100;

  return {
    isCorrect: roundedConfidence >= threshold,
    confidence: roundedConfidence,
    matchedKeywords: bestMatched,
    missingKeywords: bestMissing,
    bestMatchAnswer: bestAnswerText,
  };
}
