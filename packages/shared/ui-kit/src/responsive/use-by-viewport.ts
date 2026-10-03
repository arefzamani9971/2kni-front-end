'use client';
import { useViewport } from './use-viewport';
import type { Viewport } from './viewport';

/** Picks a value per viewport (e.g. a number of columns) without branching in the consumer. */
export function useByViewport<T>(values: Readonly<Record<Viewport, T>>): T {
  return values[useViewport()];
}
