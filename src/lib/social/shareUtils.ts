/**
 * Share Utilities
 *
 * Distributes generated share card images via:
 * 1. Web Share API (mobile native share sheet)
 * 2. Clipboard API (fallback for desktop browsers)
 * 3. Download (final fallback)
 *
 * Each path wrapped in try/catch for graceful degradation.
 */

/** Result of a share attempt */
export type ShareResult = 'shared' | 'copied' | 'downloaded';

/**
 * Share a score card blob using the best available method.
 *
 * Priority:
 * 1. Web Share API with file support (mobile)
 * 2. Clipboard API image write (desktop)
 * 3. Download as file (universal fallback)
 *
 * @returns The method that succeeded
 */
export async function shareScoreCard(blob: Blob): Promise<ShareResult> {
  const file = new File([blob], 'civic-test-score.png', { type: 'image/png' });

  // --- Path 1: Web Share API ---
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'My Civic Test Score',
        text: 'Check out my US Citizenship Civic Test Prep results!',
      });
      return 'shared';
    }
  } catch (err) {
    // AbortError = user cancelled the share sheet (not a real error)
    if (err instanceof DOMException && err.name === 'AbortError') {
      return 'downloaded';
    }
    // Other errors fall through to clipboard fallback
  }

  // --- Path 2: Clipboard API ---
  try {
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return 'copied';
    }
  } catch {
    // Clipboard write failed; fall through to download
  }

  // --- Path 3: Download ---
  downloadBlob(blob, 'civic-test-score.png');
  return 'downloaded';
}

/**
 * Trigger a browser download for a Blob.
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
