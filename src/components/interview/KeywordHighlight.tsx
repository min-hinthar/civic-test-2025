'use client';

import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { strings } from '@/lib/i18n/strings';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Highlight matched keywords in user's answer text.
 *
 * Uses case-insensitive word-boundary matching to avoid highlighting
 * partial words (e.g., "the" should not match "their" or "there").
 *
 * @param text - The user's answer text
 * @param matchedKeywords - Keywords that were found in the answer
 * @returns Array of ReactNode segments (strings and <mark> elements)
 */
export function highlightKeywords(text: string, matchedKeywords: string[]): ReactNode[] {
  if (!text || matchedKeywords.length === 0) {
    return [text || ''];
  }

  // Sort keywords by length (longest first) to avoid partial matches
  // when one keyword is a substring of another
  const sortedKeywords = [...matchedKeywords].sort((a, b) => b.length - a.length);

  // Build a single regex matching any keyword with word boundaries
  const escapedKeywords = sortedKeywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escapedKeywords.join('|')})\\b`, 'gi');

  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let keyIdx = 0;

  // Use matchAll to find all keyword occurrences
  for (const match of text.matchAll(pattern)) {
    const matchIndex = match.index;
    const matchText = match[0];

    // Add text before the match
    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }

    // Add the highlighted match
    parts.push(
      <mark
        key={`kw-${keyIdx++}`}
        className="bg-success/20 text-success-foreground dark:text-success px-0.5 rounded"
        aria-label={`Correct keyword: ${matchText}`}
      >
        {matchText}
      </mark>
    );

    lastIndex = matchIndex + matchText.length;
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // If no matches found, return original text
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}

interface KeywordHighlightProps {
  /** The user's transcribed or typed answer */
  userAnswer: string;
  /** Keywords that were found (from GradeResult.matchedKeywords) */
  matchedKeywords: string[];
  /** Keywords that were expected but not found (from GradeResult.missingKeywords) */
  missingKeywords: string[];
  /** Whether to show the missing keywords section (default true) */
  showMissing?: boolean;
  /** Compact mode for transcript view (smaller text) */
  compact?: boolean;
}

/**
 * Displays a user's answer with matched keywords highlighted in green
 * and missing keywords listed as warning pill chips.
 *
 * Used in interview feedback and transcript review to provide
 * educational feedback on which keywords the user got right/missed.
 */
export function KeywordHighlight({
  userAnswer,
  matchedKeywords,
  missingKeywords,
  showMissing = true,
  compact = false,
}: KeywordHighlightProps) {
  const { showBurmese } = useLanguage();

  // Handle empty answer
  if (!userAnswer.trim()) {
    return (
      <div className={clsx(compact ? 'text-sm' : 'text-base')}>
        <p className="italic text-white/40">
          {strings.interview.noAnswer.en}
          {showBurmese && (
            <span className="font-myanmar ml-1">{strings.interview.noAnswer.my}</span>
          )}
        </p>
      </div>
    );
  }

  const highlighted = highlightKeywords(userAnswer, matchedKeywords);

  return (
    <div className={clsx('space-y-2', compact ? 'text-sm' : 'text-base')}>
      {/* Highlighted answer text */}
      <p className="text-white/90 leading-relaxed">{highlighted}</p>

      {/* Matched keywords label */}
      {matchedKeywords.length > 0 && (
        <p className="sr-only">
          {strings.interview.matchedKeywords.en} {matchedKeywords.join(', ')}
        </p>
      )}

      {/* Missing keywords */}
      {showMissing && missingKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-white/50">
            {strings.interview.missingKeywords.en.replace(':', '')}:
            {showBurmese && (
              <span className="font-myanmar ml-1">
                {strings.interview.missingKeywords.my.replace(':', '')}:
              </span>
            )}
          </span>
          {missingKeywords.map(keyword => (
            <span
              key={keyword}
              className="bg-warning/20 text-warning text-xs px-2 py-0.5 rounded-full"
              aria-label={`Missing keyword: ${keyword}`}
            >
              {keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
