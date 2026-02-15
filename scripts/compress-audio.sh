#!/usr/bin/env bash
# Compress Burmese audio files to 64kbps mono for smaller bundle size.
#
# Usage: bash scripts/compress-audio.sh
# Requires: ffmpeg
#
# Processes all MP3 files in public/audio/my-MM/{female,male}/
# Creates compressed versions in-place (overwrites originals).

set -euo pipefail

AUDIO_DIR="public/audio/my-MM"
TEMP_DIR=$(mktemp -d)
TOTAL=0
SAVED_KB=0

if ! command -v ffmpeg &> /dev/null; then
  echo "Error: ffmpeg is not installed."
  echo "Install: https://ffmpeg.org/download.html"
  exit 1
fi

if [ ! -d "$AUDIO_DIR" ]; then
  echo "Error: $AUDIO_DIR does not exist. Run generate-burmese-audio.py first."
  exit 1
fi

echo "Compressing audio files in $AUDIO_DIR to 64kbps mono..."
echo ""

for dir in "$AUDIO_DIR"/female "$AUDIO_DIR"/male; do
  if [ ! -d "$dir" ]; then
    echo "SKIP: $dir does not exist"
    continue
  fi

  echo "=== Processing $dir ==="

  for mp3 in "$dir"/*.mp3; do
    [ -f "$mp3" ] || continue

    original_size=$(stat -f%z "$mp3" 2>/dev/null || stat -c%s "$mp3" 2>/dev/null)
    temp_file="$TEMP_DIR/$(basename "$mp3")"

    # Convert to 64kbps mono
    ffmpeg -y -i "$mp3" -b:a 64k -ac 1 -ar 24000 "$temp_file" -loglevel error

    compressed_size=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file" 2>/dev/null)
    saved=$(( (original_size - compressed_size) / 1024 ))

    mv "$temp_file" "$mp3"

    TOTAL=$((TOTAL + 1))
    SAVED_KB=$((SAVED_KB + saved))

    echo "  $(basename "$mp3"): ${original_size}B -> ${compressed_size}B (saved ${saved}KB)"
  done
done

rm -rf "$TEMP_DIR"

echo ""
echo "=== Done: $TOTAL files compressed, ~${SAVED_KB}KB saved ==="
