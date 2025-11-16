'use client';

import { useCallback, useEffect, useState } from 'react';

export interface ToastPayload {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

interface ToastInstance extends ToastPayload {
  id: string;
}

const listeners = new Set<(toast: ToastInstance) => void>();

export const toast = (payload: ToastPayload) => {
  const toastWithId: ToastInstance = {
    id: crypto.randomUUID(),
    duration: 4000,
    ...payload,
  };
  listeners.forEach(listener => listener(toastWithId));
};

export const useToastStream = () => {
  const [queue, setQueue] = useState<ToastInstance[]>([]);

  const remove = useCallback((id: string) => {
    setQueue(prev => prev.filter(toast => toast.id !== id));
  }, []);

  useEffect(() => {
    const handler = (instance: ToastInstance) => {
      setQueue(prev => [...prev, instance]);
      setTimeout(() => remove(instance.id), instance.duration);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, [remove]);

  return { queue, remove };
};
