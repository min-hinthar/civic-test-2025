'use client';
/**
 * React hook for SW update notifications.
 *
 * Initializes swUpdateManager, bridges NavigationProvider.isLocked
 * and history.state to the session-lock mechanism, and provides
 * update state + accept action to the UI.
 */
import { useCallback, useEffect, useState } from 'react';
import { swUpdateManager, setSessionLocked } from '@/lib/pwa/swUpdateManager';
import { useNavigation } from '@/components/navigation/NavigationProvider';

interface SWUpdateState {
  updateAvailable: boolean;
}

export function useSWUpdate(): SWUpdateState & { acceptUpdate: () => void } {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { isLocked } = useNavigation();

  // Bridge React isLocked state to module-level ref
  useEffect(() => {
    setSessionLocked(isLocked);
  }, [isLocked]);

  // Initialize SW update detection
  useEffect(() => {
    swUpdateManager.init(() => {
      setUpdateAvailable(true);
    });
    return () => {
      swUpdateManager.destroy();
    };
  }, []);

  const acceptUpdate = useCallback(() => {
    swUpdateManager.acceptUpdate();
  }, []);

  return { updateAvailable, acceptUpdate };
}
