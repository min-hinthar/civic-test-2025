'use client';

import { useState, useCallback } from 'react';

/**
 * Roving focus hook for radiogroup keyboard navigation.
 *
 * Implements the W3C radio group pattern where arrow keys move focus
 * between options in a circular (wrapping) fashion.
 *
 * - ArrowDown / ArrowRight: move to next item
 * - ArrowUp / ArrowLeft: move to previous item
 * - Wraps around at boundaries
 *
 * @param itemCount - Total number of focusable items in the group
 * @returns focusedIndex, setFocusedIndex, handleKeyDown
 */
export function useRovingFocus(itemCount: number) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex(prev => (prev + 1) % itemCount);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount);
          break;
      }
    },
    [itemCount]
  );

  return { focusedIndex, setFocusedIndex, handleKeyDown };
}
