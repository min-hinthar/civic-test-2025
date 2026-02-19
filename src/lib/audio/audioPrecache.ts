/**
 * Audio Pre-Cache Module
 *
 * Pre-fetches interview audio MP3s into the browser Cache API before
 * the interview starts. The service worker uses CacheFirst for `/audio/`
 * paths with cache name `audio-v2`, so pre-populating this cache ensures
 * offline-capable playback during the interview.
 */

import {
  getEnglishAudioUrl,
  getBurmeseAudioUrl,
  getInterviewAudioUrl,
} from '@/lib/audio/audioPlayer';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PrecacheProgress {
  loaded: number;
  total: number;
  failed: string[];
}

export interface PrecacheOptions {
  includeBurmese?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Cache name matching the service worker in src/lib/pwa/sw.ts */
const AUDIO_CACHE_NAME = 'audio-v2';

/** Parallel fetch batch size */
const BATCH_SIZE = 6;

/**
 * All interview-specific audio filenames (without extension or path prefix).
 * These are greeting, closing, feedback, and result announcement clips.
 */
export const INTERVIEW_AUDIO_NAMES = [
  'greeting-01',
  'greeting-02',
  'greeting-03',
  'closing-pass-01',
  'closing-pass-02',
  'closing-fail-01',
  'closing-fail-02',
  'correct-prefix',
  'incorrect-prefix',
  'pass-announce',
  'fail-announce',
] as const;

// ---------------------------------------------------------------------------
// Pre-cache
// ---------------------------------------------------------------------------

/**
 * Pre-fetch all audio files needed for an interview session into the
 * browser Cache API.
 *
 * Fetches in parallel batches of {@link BATCH_SIZE} and reports progress
 * via an optional callback. Partial failures are tracked (not thrown) so
 * the interview can start with whatever was successfully cached.
 *
 * @param questionIds - The 20 question IDs selected for this interview
 * @param options - Configuration (e.g. whether to include Burmese audio)
 * @param onProgress - Optional callback fired after each batch completes
 * @returns Final progress summary with loaded count and failed URLs
 */
export async function precacheInterviewAudio(
  questionIds: string[],
  options: PrecacheOptions = {},
  onProgress?: (progress: PrecacheProgress) => void
): Promise<PrecacheProgress> {
  // Build URL list
  const urls: string[] = [];

  // English question + answer audio for each question
  for (const id of questionIds) {
    urls.push(getEnglishAudioUrl(id, 'q'));
    urls.push(getEnglishAudioUrl(id, 'a'));
  }

  // Burmese question + answer audio if requested
  if (options.includeBurmese) {
    for (const id of questionIds) {
      urls.push(getBurmeseAudioUrl(id, 'q'));
      urls.push(getBurmeseAudioUrl(id, 'a'));
    }
  }

  // Interview-specific audio (greetings, closings, feedback prefixes, announcements)
  for (const name of INTERVIEW_AUDIO_NAMES) {
    urls.push(getInterviewAudioUrl(name));
  }

  const progress: PrecacheProgress = {
    loaded: 0,
    total: urls.length,
    failed: [],
  };

  // Handle Cache API unavailability (e.g. private browsing in some browsers)
  let cache: Cache;
  try {
    if (typeof caches === 'undefined') {
      throw new Error('Cache API unavailable');
    }
    cache = await caches.open(AUDIO_CACHE_NAME);
  } catch {
    progress.failed = [...urls];
    onProgress?.(progress);
    return progress;
  }

  // Fetch in batches
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(url => cache.add(url)));

    for (let j = 0; j < results.length; j++) {
      if (results[j].status === 'fulfilled') {
        progress.loaded++;
      } else {
        progress.failed.push(batch[j]);
      }
    }

    onProgress?.({ ...progress });
  }

  return progress;
}

// ---------------------------------------------------------------------------
// Cache check
// ---------------------------------------------------------------------------

/**
 * Check whether a specific audio URL is already in the audio cache.
 *
 * Used by consumers to decide between cached MP3 playback and TTS fallback.
 * Returns false gracefully when Cache API is unavailable.
 */
export async function isAudioCached(url: string): Promise<boolean> {
  try {
    if (typeof caches === 'undefined') {
      return false;
    }
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    return response !== undefined;
  } catch {
    return false;
  }
}
