'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import rawStateData from '@/data/state-representatives.json';

const STATE_KEY = 'civic-prep-user-state';

/** Raw shape from JSON (senators is string[] | null, not a tuple) */
interface RawStateEntry {
  name: string;
  capital: string;
  governor: string;
  senators: string[] | null;
  lastUpdated: string;
}

export interface StateInfo {
  name: string;
  capital: string;
  governor: string;
  senators: [string, string] | null;
  lastUpdated: string;
}

interface StateContextValue {
  /** Two-letter state/territory code, or null if not set */
  selectedState: string | null;
  /** Set the user's state (persists to localStorage) */
  setSelectedState: (code: string | null) => void;
  /** Resolved state info from data file, or null if no state selected */
  stateInfo: StateInfo | null;
  /** All available states/territories for the picker */
  allStates: Array<{ code: string; name: string }>;
}

const StateContext = createContext<StateContextValue | null>(null);

// Type-safe cast of the raw JSON data
const stateRepresentatives = rawStateData as Record<string, RawStateEntry>;

/** Convert raw JSON entry to typed StateInfo */
function toStateInfo(raw: RawStateEntry): StateInfo {
  return {
    name: raw.name,
    capital: raw.capital,
    governor: raw.governor,
    senators: raw.senators && raw.senators.length === 2 ? [raw.senators[0], raw.senators[1]] : null,
    lastUpdated: raw.lastUpdated,
  };
}

// Pre-compute the sorted list of all states/territories (static, never changes)
const allStatesData: Array<{ code: string; name: string }> = Object.entries(stateRepresentatives)
  .map(([code, data]) => ({ code, name: data.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * State personalization provider.
 *
 * Features:
 * - Persists state selection to localStorage
 * - Provides governor, senators, and capital for selected state
 * - SSR-safe with lazy initialization
 */
export function StateProvider({ children }: { children: ReactNode }) {
  const [selectedState, setSelectedStateInternal] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STATE_KEY);
  });

  const setSelectedState = useCallback((code: string | null) => {
    setSelectedStateInternal(code);
    if (code) {
      localStorage.setItem(STATE_KEY, code);
    } else {
      localStorage.removeItem(STATE_KEY);
    }
  }, []);

  // Sync with localStorage on mount (SSR hydration fix)
  useEffect(() => {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored && stored !== selectedState) {
      setSelectedStateInternal(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateInfo: StateInfo | null = useMemo(() => {
    if (!selectedState) return null;
    const raw = stateRepresentatives[selectedState];
    return raw ? toStateInfo(raw) : null;
  }, [selectedState]);

  const value: StateContextValue = useMemo(
    () => ({
      selectedState,
      setSelectedState,
      stateInfo,
      allStates: allStatesData,
    }),
    [selectedState, setSelectedState, stateInfo]
  );

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>;
}

/**
 * Hook to access state personalization data.
 *
 * @throws Error if used outside StateProvider
 */
export function useUserState(): StateContextValue {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useUserState must be used within StateProvider');
  }
  return context;
}
