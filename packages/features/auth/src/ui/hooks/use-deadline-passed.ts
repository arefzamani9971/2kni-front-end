'use client';
import { useEffect, useState } from 'react';

/**
 * Whether `at` (epoch ms) is reached; `null` counts as reached (no wait). Re-renders once at the deadline instead of
 * every second, and re-checks when the tab becomes visible again (timers of a background tab may run late, F01-S12).
 */
export function useDeadlinePassed(at: number | null): boolean {
  const [reached, setReached] = useState<number | null>(() => (at !== null && at <= Date.now() ? at : null));
  useEffect(() => {
    if (at === null) return;
    const check = () => {
      if (Date.now() >= at) setReached(at);
    };
    const timer = setTimeout(check, Math.max(0, at - Date.now()));
    document.addEventListener('visibilitychange', check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', check);
    };
  }, [at]);
  return at === null || reached === at;
}
