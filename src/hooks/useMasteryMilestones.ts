'use client';

import { useState, useCallback, useMemo } from 'react';
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
 * Uses a render-time derivation approach (React Compiler compatible):
 * - Computes eligible milestones from current mastery and localStorage
 * - Tracks dismissed milestones in state to filter them out
 * - No refs, no setState-in-effect
 *
 * Usage:
 * ```tsx
 * const { currentMilestone, dismissMilestone } = useMasteryMilestones(categoryMasteries);
 * if (currentMilestone) {
 *   return <MasteryMilestone milestone={currentMilestone} onDismiss={dismissMilestone} />;
 * }
 * ```
 */
export function useMasteryMilestones(categoryMasteries: Record<string, number>) {
  // Track milestone keys dismissed in this render cycle (beyond localStorage)
  const [dismissedKeys, setDismissedKeys] = useState<Set<string>>(new Set());

  // Derive eligible milestones from current mastery values
  // This runs during render which is React Compiler compatible
  const eligibleMilestones = useMemo((): MilestoneEvent[] => {
    if (hasSessionMilestone()) return [];

    const shownMilestones = getShownMilestones();
    const milestones: MilestoneEvent[] = [];

    for (const [category, mastery] of Object.entries(categoryMasteries)) {
      for (const { threshold, level } of MILESTONE_THRESHOLDS) {
        const milestoneKey = `${category}:${threshold}`;

        // Show milestone if mastery is at/above threshold AND not already shown
        if (
          mastery >= threshold &&
          !shownMilestones.has(milestoneKey) &&
          !dismissedKeys.has(milestoneKey)
        ) {
          milestones.push({
            category,
            level,
            previousPercentage: Math.max(0, mastery - 10), // approximate
            newPercentage: mastery,
          });
        }
      }
    }

    // Sort highest level first for priority
    const levelOrder: Record<MilestoneLevel, number> = {
      none: 0,
      bronze: 1,
      silver: 2,
      gold: 3,
    };
    return milestones.sort((a, b) => levelOrder[b.level] - levelOrder[a.level]);
  }, [categoryMasteries, dismissedKeys]);

  // Current milestone is the first eligible
  const currentMilestone = eligibleMilestones[0] ?? null;

  // Dismiss: mark as shown in localStorage and session, add to dismissed set
  const dismissMilestone = useCallback(() => {
    if (!currentMilestone) return;

    const threshold = MILESTONE_THRESHOLDS.find(t => t.level === currentMilestone.level);
    const milestoneKey = threshold
      ? `${currentMilestone.category}:${threshold.threshold}`
      : `${currentMilestone.category}:unknown`;

    markMilestoneShown(milestoneKey);
    setSessionMilestone();

    setDismissedKeys(prev => {
      const next = new Set(prev);
      next.add(milestoneKey);
      return next;
    });
  }, [currentMilestone]);

  return {
    currentMilestone,
    dismissMilestone,
  };
}
