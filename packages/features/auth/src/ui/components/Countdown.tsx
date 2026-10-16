'use client';
import { useNow } from '../hooks/use-now';
import type { CountdownProps } from './Countdown.types';

/**
 * A ticking countdown text. Only this leaf re-renders every second; the screen re-renders once, when the deadline is
 * reached (`useDeadlinePassed`). Key it by `until` so a new deadline starts from a fresh clock.
 */
export function Countdown({ until, children }: CountdownProps) {
  const now = useNow(until);
  return <>{children(Math.max(0, Math.ceil((until - now) / 1000)))}</>;
}
