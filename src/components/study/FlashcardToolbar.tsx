'use client';

import { useRef, useCallback } from 'react';
import { motion, useAnimate } from 'motion/react';
import clsx from 'clsx';
import { ChevronLeft, ChevronRight, Search, Shuffle, X } from 'lucide-react';
import { SPRING_SNAPPY } from '@/lib/motion-config';
import { Progress } from '@/components/ui/Progress';

export type SortMode = 'default' | 'difficulty' | 'alphabetical';

export interface FlashcardToolbarProps {
  currentIndex: number;
  totalCards: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showBurmese: boolean;
}

/**
 * Toolbar for the flashcard browsing experience.
 *
 * Features:
 * - Search input with clear button
 * - Card counter "X of Y" with prev/next arrow navigation
 * - Progress bar (Radix-based) tracking position
 * - Shuffle button with rotation animation
 * - Sort dropdown (Category Order, Difficulty, Alphabetical)
 * - All buttons meet 44px minimum touch target
 */
export function FlashcardToolbar({
  currentIndex,
  totalCards,
  onPrev,
  onNext,
  onShuffle,
  sortMode,
  onSortChange,
  searchQuery,
  onSearchChange,
  showBurmese,
}: FlashcardToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [shuffleScope, shuffleAnimate] = useAnimate();

  const handleShuffle = useCallback(() => {
    onShuffle();
    shuffleAnimate(shuffleScope.current, { rotate: 180 }, { duration: 0.3 }).then(() => {
      shuffleAnimate(shuffleScope.current, { rotate: 0 }, { duration: 0 });
    });
  }, [onShuffle, shuffleAnimate, shuffleScope]);

  const handleClearSearch = useCallback(() => {
    onSearchChange('');
    searchInputRef.current?.focus({ preventScroll: true });
  }, [onSearchChange]);

  const displayIndex = totalCards > 0 ? currentIndex + 1 : 0;

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1: Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={showBurmese ? 'Search questions... / ရှာရန်...' : 'Search questions...'}
          className={clsx(
            'w-full pl-9 pr-10 py-2.5 rounded-xl',
            'border border-border/60 bg-muted/50 text-sm text-foreground',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary',
            'transition-colors min-h-[44px]'
          )}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className={clsx(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'h-8 w-8 flex items-center justify-center rounded-lg',
              'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              'transition-colors'
            )}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Row 2: Card counter with navigation arrows */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          type="button"
          onClick={onPrev}
          disabled={currentIndex === 0 || totalCards === 0}
          whileTap={{ scale: 0.93 }}
          transition={SPRING_SNAPPY}
          className={clsx(
            'h-11 w-11 rounded-xl bg-card border border-border/60',
            'shadow-[0_3px_0_0_rgba(0,0,0,0.08)] active:shadow-none active:translate-y-[1px]',
            'dark:shadow-[0_3px_0_0_rgba(0,0,0,0.25)]',
            'flex items-center justify-center',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-all disabled:opacity-30 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <div className="text-center min-w-[80px]">
          <span className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{displayIndex}</span>
            <span className="mx-1">of</span>
            <span className="font-semibold">{totalCards}</span>
          </span>
        </div>

        <motion.button
          type="button"
          onClick={onNext}
          disabled={currentIndex >= totalCards - 1 || totalCards === 0}
          whileTap={{ scale: 0.93 }}
          transition={SPRING_SNAPPY}
          className={clsx(
            'h-11 w-11 rounded-xl bg-card border border-border/60',
            'shadow-[0_3px_0_0_rgba(0,0,0,0.08)] active:shadow-none active:translate-y-[1px]',
            'dark:shadow-[0_3px_0_0_rgba(0,0,0,0.25)]',
            'flex items-center justify-center',
            'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-all disabled:opacity-30 disabled:cursor-not-allowed',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
          aria-label="Next card"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Row 3: Progress bar */}
      <Progress
        value={totalCards > 0 ? displayIndex : 0}
        max={totalCards > 0 ? totalCards : 1}
        size="sm"
        className="px-1"
      />

      {/* Row 4: Shuffle + Sort */}
      <div className="flex items-center justify-between gap-3">
        <motion.button
          ref={shuffleScope}
          type="button"
          onClick={handleShuffle}
          whileTap={{ scale: 0.93 }}
          transition={SPRING_SNAPPY}
          className={clsx(
            'h-11 px-4 rounded-xl bg-card border border-border/60',
            'shadow-[0_3px_0_0_rgba(0,0,0,0.08)] active:shadow-none active:translate-y-[1px]',
            'dark:shadow-[0_3px_0_0_rgba(0,0,0,0.25)]',
            'flex items-center gap-2',
            'text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50',
            'transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
          aria-label="Shuffle cards"
        >
          <Shuffle className="h-4 w-4" />
          <span>{showBurmese ? 'Shuffle / ရောမွှေ' : 'Shuffle'}</span>
        </motion.button>

        <select
          value={sortMode}
          onChange={e => onSortChange(e.target.value as SortMode)}
          className={clsx(
            'h-11 px-3 rounded-xl border border-border/60 bg-card text-sm font-medium',
            'text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary',
            'transition-colors cursor-pointer'
          )}
          aria-label="Sort order"
        >
          <option value="default">
            {showBurmese ? 'Category Order / အမျိုးအစား' : 'Category Order'}
          </option>
          <option value="difficulty">{showBurmese ? 'Difficulty / ခက်ခဲမှု' : 'Difficulty'}</option>
          <option value="alphabetical">{showBurmese ? 'A-Z / အက္ခရာ' : 'A-Z'}</option>
        </select>
      </div>
    </div>
  );
}

export default FlashcardToolbar;
