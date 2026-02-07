'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MilestoneLevel } from '@/components/progress/MasteryBadge';

/** Milestone thresholds that trigger celebrations */
const MILESTONE_THRESHOLDS: { threshold: number; level: MilestoneLevel }[] = [
  { threshold: 50, level: 'bronze' },
  { threshold: 75, level: 'silver' },
  { threshold: 100, level: 'gold' },
];

/** A detected milestone crossing event */
export interface MilestoneEvent {
  /** The category that crossed the threshold */
  category: string;
  /** The milestone level reached */
  level: MilestoneLevel;
  /** Mastery percentage before the milestone was reached */
  previousPercentage: number;
  /** Current mastery percentage */
  newPercentage: number;
}

/** localStorage key for persisted shown milestones */
const SHOWN_MILESTONES_KEY = 'civic-prep-shown-milestones';

/** sessionStorage key for session-level debounce */
const SESSION_MILESTONE_KEY = 'civic-prep-session-milestone-shown';

/**
 * Get the set of already-shown milestone keys from localStorage.
 * Key format: "{category}:{threshold}"
 */
function getShownMilestones(): Set<string> {
  try {
    const stored = localStorage.getItem(SHOWN_MILESTONES_KEY);
    if (stored) {
      return new Set(JSON.parse(stored) as string[]);
    }
  } catch {
    // localStorage not available or corrupted
  }
  return new Set();
}

/**
 * Save a milestone key to localStorage so it never repeats.
 */
function markMilestoneShown(key: string): void {
  try {
    const shown = getShownMilestones();
    shown.add(key);
    localStorage.setItem(SHOWN_MILESTONES_KEY, JSON.stringify([...shown]));
  } catch {
    // localStorage not available
  }
}

/**
 * Check if a milestone has already been shown this session.
 */
function hasSessionMilestone(): boolean {
  try {
    return sessionStorage.getItem(SESSION_MILESTONE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark that a milestone has been shown this session.
 */
function setSessionMilestone(): void {
  try {
    sessionStorage.setItem(SESSION_MILESTONE_KEY, 'true');
  } catch {
    // sessionStorage not available
  }
}

/**
 * Hook that detects new milestone crossings (50%, 75%, 100%)
 * in category mastery scores.
 *
 * Features:
 * - Compares current mastery against previous values to detect crossings
 * - Persists shown milestones in localStorage (never repeat)
 * - Session-level debounce: max 1 milestone per session
 * - Queues multiple milestones, returns one at a time
 * - Provides dismissMilestone() to clear current and show next queued
 *
 * Usage:
 * ```tsx
 * const { currentMilestone, dismissMilestone } = useMasteryMilestones(categoryMasteries);
 * if (currentMilestone) {
 *   return <MasteryMilestone milestone={currentMilestone} onDismiss={dismissMilestone} />;
 * }
 * ```
 */
export function useMasteryMilestones(
  categoryMasteries: Record<string, number>
) {
  const [milestoneQueue, setMilestoneQueue] = useState<MilestoneEvent[]>([]);
  const previousMasteries = useRef<Record<string, number>>({});
  const initialLoadDone = useRef(false);

  // Detect threshold crossings when mastery values change
  useEffect(() => {
    // Skip detection on initial load (we only want to catch new crossings)
    if (!initialLoadDone.current) {
      previousMasteries.current = { ...categoryMasteries };
      initialLoadDone.current = true;
      return;
    }

    // Don't queue if we already showed a milestone this session
    if (hasSessionMilestone()) return;

    const shownMilestones = getShownMilestones();
    const newMilestones: MilestoneEvent[] = [];

    for (const [category, newMastery] of Object.entries(categoryMasteries)) {
      const prevMastery = previousMasteries.current[category] ?? 0;

      for (const { threshold, level } of MILESTONE_THRESHOLDS) {
        const milestoneKey = `${category}:${threshold}`;

        // Check if this is a new crossing:
        // previous was below threshold AND current is at/above threshold
        // AND we haven't shown this milestone before
        if (
          prevMastery < threshold &&
          newMastery >= threshold &&
          !shownMilestones.has(milestoneKey)
        ) {
          newMilestones.push({
            category,
            level,
            previousPercentage: prevMastery,
            newPercentage: newMastery,
          });
        }
      }
    }

    // Update previous values
    previousMasteries.current = { ...categoryMasteries };

    // Queue new milestones (highest level first for priority)
    if (newMilestones.length > 0) {
      const sorted = newMilestones.sort((a, b) => {
        const levelOrder: Record<MilestoneLevel, number> = {
          none: 0,
          bronze: 1,
          silver: 2,
          gold: 3,
        };
        return levelOrder[b.level] - levelOrder[a.level];
      });

      setMilestoneQueue(prev => [...prev, ...sorted]);
    }
  }, [categoryMasteries]);

  // Current milestone is the first in queue
  const currentMilestone = milestoneQueue[0] ?? null;

  // Dismiss: mark as shown, remove from queue, set session flag
  const dismissMilestone = useCallback(() => {
    setMilestoneQueue(prev => {
      if (prev.length === 0) return prev;

      const dismissed = prev[0];
      // Find the matching threshold for this level
      const threshold = MILESTONE_THRESHOLDS.find(t => t.level === dismissed.level);
      if (threshold) {
        markMilestoneShown(`${dismissed.category}:${threshold.threshold}`);
      }
      setSessionMilestone();

      return prev.slice(1);
    });
  }, []);

  return {
    currentMilestone,
    dismissMilestone,
  };
}
