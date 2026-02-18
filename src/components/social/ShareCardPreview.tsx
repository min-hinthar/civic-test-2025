'use client';

/**
 * ShareCardPreview
 *
 * Modal dialog that shows a preview of the generated score card
 * before the user shares it. Renders the canvas image on open,
 * with loading state and share/close actions.
 *
 * Uses Radix Dialog for accessibility (focus trap, ESC to close).
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { useToast } from '@/components/BilingualToast';
import { useLanguage } from '@/contexts/LanguageContext';
import { renderShareCard, type ShareCardData } from '@/lib/social/shareCardRenderer';
import { shareScoreCard } from '@/lib/social/shareUtils';

export interface ShareCardPreviewProps {
  /** Card data to render, or null when closed */
  data: ShareCardData | null;
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
}

/**
 * Preview modal for the generated share card.
 * Generates the canvas image when opened, shows loading spinner,
 * then displays with share/close actions.
 */
export function ShareCardPreview({ data, open, onClose }: ShareCardPreviewProps) {
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { showSuccess } = useToast();
  const { showBurmese } = useLanguage();

  // Generate image when dialog opens
  useEffect(() => {
    if (!open || !data) {
      return;
    }

    let cancelled = false;
    setIsGenerating(true);
    setBlob(null);
    setPreviewUrl(null);

    renderShareCard(data)
      .then(result => {
        if (cancelled) return;
        setBlob(result);
        setPreviewUrl(URL.createObjectURL(result));
        setIsGenerating(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('[ShareCardPreview] Render failed:', err);
        setIsGenerating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, data]);

  // Clean up object URL on unmount or when preview changes
  useEffect(() => {
    const url = previewUrl;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrl]);

  const handleShare = useCallback(async () => {
    if (!blob) return;

    setIsSharing(true);
    try {
      const result = await shareScoreCard(blob);

      if (result === 'shared') {
        showSuccess({
          en: 'Shared successfully!',
          my: 'အောင်မြင်စွာ မျှဝေပြီးပါပြီ!',
        });
      } else if (result === 'copied') {
        showSuccess({
          en: 'Copied to clipboard!',
          my: 'ကလစ်ဘုတ်သို့ ကူးယူပြီးပါပြီ!',
        });
      } else {
        showSuccess({
          en: 'Image downloaded!',
          my: 'ပုံကား ဒေါင်းလုဒ်ပြီးပါပြီ!',
        });
      }

      onClose();
    } catch (err) {
      console.error('[ShareCardPreview] Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  }, [blob, showSuccess, onClose]);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-md p-4 sm:p-6"
        aria-describedby="share-card-description"
      >
        <DialogTitle className="text-center">Share Results</DialogTitle>
        <DialogDescription id="share-card-description" className="text-center">
          Preview your score card before sharing
        </DialogDescription>

        {/* Image preview area */}
        <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-lg bg-muted/30">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <svg
                    className="h-8 w-8 animate-spin text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span className="text-sm text-muted-foreground">Generating card...</span>
                </div>
              </motion.div>
            )}
            {previewUrl && !isGenerating && (
              <motion.img
                key="preview"
                src={previewUrl}
                alt="Share card preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full w-full object-contain"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <DialogFooter className="mt-4 flex-row gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span>Close</span>
            {showBurmese && <span className="ml-1 font-myanmar text-xs opacity-80">ပိတ်ပါ</span>}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!blob || isSharing}
            className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSharing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </span>
            ) : (
              <>
                <span>Share</span>
                {showBurmese && (
                  <span className="ml-1 font-myanmar text-xs opacity-80">မျှဝေပါ</span>
                )}
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
