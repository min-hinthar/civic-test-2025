/**
 * Burmese Audio Adapter
 *
 * Re-exports the generic audio player with Burmese-specific URL helpers.
 * Kept as a separate module for backwards compatibility with existing imports.
 */

export {
  getBurmeseAudioUrl,
  getEnglishAudioUrl,
  createAudioPlayer as createBurmesePlayer,
  type AudioType,
  type AudioPlayer as BurmesePlayer,
  type AudioPlayerState as BurmesePlayerState,
} from './audioPlayer';
