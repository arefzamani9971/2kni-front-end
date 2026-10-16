'use client';
import { useEffect, useState } from 'react';

/**
 * Current time for a visible countdown: re-renders every `intervalMs` only while `until` (epoch ms) is ahead, then
 * stops. Use it in the leaf that shows the countdown, so the form around it does not re-render every second.
 */
export const useNow = (until: number | null, intervalMs = 1000): number => {
  const [now, setNow] = useState(() => Date.now());
  const running = until !== null && until > now;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [running, intervalMs]);
  return now;
};
