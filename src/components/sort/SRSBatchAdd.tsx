'use client';

/**
 * SRSBatchAdd - Batch add Don't Know cards to the SRS review deck.
 *
 * Categorizes missed cards into "new to deck" vs "already in deck",
 * provides a batch add button for new cards, and shows toast confirmation.
 * Existing SRS cards are not affected (no lapse/reset from sort mode).
 *
 * Features:
 * - Distinguishes new vs already-in-deck cards
 * - Expandable per-card checkbox list for selective adding
 * - Toast confirmation on successful batch add
 * - Disabled state after adding with "Added!" confirmation
 * - Bilingual throughout
 */

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSRS } from '@/contexts/SRSContext';
import { useToast } from '@/components/BilingualToast';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SRSBatchAddProps {
  unknownIds: string[];
  showBurmese: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert number to Myanmar numerals */
function toMyanmarNumeral(n: number): string {
  const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(n)
    .split('')
    .map(d => myanmarDigits[parseInt(d)] ?? d)
    .join('');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SRSBatchAdd({ unknownIds, showBurmese }: SRSBatchAddProps) {
  const { addCard, isInDeck } = useSRS();
  const { showSuccess } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [isAdding, setIsAdding] = useState(false);
  const [hasAdded, setHasAdded] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);

  // Split unknownIds into new (not in deck) and existing (already in deck)
  const { newCardIds, existingCount } = useMemo(() => {
    const newIds: string[] = [];
    let existing = 0;
    for (const id of unknownIds) {
      if (isInDeck(id)) {
        existing += 1;
      } else {
        newIds.push(id);
      }
    }
    return { newCardIds: newIds, existingCount: existing };
  }, [unknownIds, isInDeck]);

  // Per-card selection state (default all checked)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(newCardIds));

  // Sync selected when newCardIds changes (e.g. after deck refresh)
  const selectedCount = useMemo(() => {
    // Only count IDs that are still in newCardIds
    let count = 0;
    for (const id of selectedIds) {
      if (newCardIds.includes(id)) count += 1;
    }
    return count;
  }, [selectedIds, newCardIds]);

  const toggleCard = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleBatchAdd = useCallback(async () => {
    const toAdd = newCardIds.filter(id => selectedIds.has(id));
    if (toAdd.length === 0) return;

    setIsAdding(true);
    try {
      for (const id of toAdd) {
        await addCard(id);
      }
      setHasAdded(true);
      showSuccess({
        en: `Added ${toAdd.length} card${toAdd.length !== 1 ? 's' : ''} to your review deck`,
        my: `ကတ် ${toMyanmarNumeral(toAdd.length)} ခုကို ပြန်လှည့်စာရင်းသို့ထည့်ပြီး`,
      });
    } catch (error) {
      console.error('[SRSBatchAdd] Batch add failed:', error);
    } finally {
      setIsAdding(false);
    }
  }, [newCardIds, selectedIds, addCard, showSuccess]);

  // Don't render if no unknown cards at all
  if (unknownIds.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
      {/* Header info */}
      <div>
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary shrink-0" />
          <p className="text-sm font-semibold text-foreground">Add to Review Deck</p>
        </div>
        {showBurmese && (
          <p className="font-myanmar text-xs text-muted-foreground mt-0.5 ml-6">
            ပြန်လှည့်စာရင်းသို့ထည့်ပါ
          </p>
        )}
      </div>

      {/* Card counts */}
      <div className="text-sm text-muted-foreground space-y-0.5">
        {newCardIds.length > 0 && (
          <p>
            <span className="font-semibold text-foreground">{newCardIds.length}</span> new card
            {newCardIds.length !== 1 ? 's' : ''} to add
            {showBurmese && (
              <span className="font-myanmar text-xs ml-1">
                (ကတ်အသစ် {toMyanmarNumeral(newCardIds.length)} ခု)
              </span>
            )}
          </p>
        )}
        {existingCount > 0 && (
          <p className="text-xs">
            {existingCount} already in your deck
            {showBurmese && (
              <span className="font-myanmar ml-1">
                ({toMyanmarNumeral(existingCount)} ခုရှိပြီးသား)
              </span>
            )}
          </p>
        )}
        {newCardIds.length === 0 && (
          <p className="text-xs">
            All missed cards are already in your review deck
            {showBurmese && (
              <span className="font-myanmar text-xs block mt-0.5">
                မမှန်ကတ်အားလုံး ပြန်လှည့်စာရင်းတွင်ရှိပြီးသားဖြစ်သည်
              </span>
            )}
          </p>
        )}
      </div>

      {/* Expandable per-card checkboxes */}
      {newCardIds.length > 1 && !hasAdded && (
        <>
          <button
            type="button"
            onClick={() => setShowCheckboxes(prev => !prev)}
            className={clsx(
              'flex items-center gap-1.5 text-xs text-primary hover:text-primary/80',
              'transition-colors min-h-[32px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
            )}
          >
            {showCheckboxes ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            <span>Select individual cards</span>
          </button>

          <AnimatePresence initial={false}>
            {showCheckboxes && (
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-1 max-h-48 overflow-y-auto border border-border/30 rounded-xl p-2">
                  {newCardIds.map(id => (
                    <label
                      key={id}
                      className={clsx(
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg',
                        'hover:bg-muted/30 cursor-pointer transition-colors',
                        'text-sm text-foreground'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(id)}
                        onChange={() => toggleCard(id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary-500"
                      />
                      <span className="truncate">{id}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Batch add button */}
      {hasAdded ? (
        <div className="flex items-center gap-2 justify-center py-2 text-success">
          <Check className="h-5 w-5" />
          <span className="text-sm font-bold">Added!</span>
          {showBurmese && <span className="font-myanmar text-xs">ထည့်ပြီးပါပြီ!</span>}
        </div>
      ) : (
        <Button
          variant="success"
          size="md"
          fullWidth
          disabled={selectedCount === 0 || isAdding}
          loading={isAdding}
          onClick={handleBatchAdd}
        >
          <span className="flex flex-col items-center">
            <span>
              Add {selectedCount} card{selectedCount !== 1 ? 's' : ''} to review deck
            </span>
            {showBurmese && (
              <span className="font-myanmar text-sm opacity-80">
                ကတ် {toMyanmarNumeral(selectedCount)} ခုကို ပြန်လှည့်စာရင်းသို့ထည့်ပါ
              </span>
            )}
          </span>
        </Button>
      )}
    </div>
  );
}
