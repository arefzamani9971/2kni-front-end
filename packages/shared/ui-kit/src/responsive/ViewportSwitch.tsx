'use client';
import type { ReactNode } from 'react';
import { useViewport } from './use-viewport';

/**
 * Inline multiplexer for one-off compositions inside a screen. Prefer a named facade built with
 * `createAdaptive` when the same switch appears twice.
 */
export function ViewportSwitch({ mobile, desktop }: { mobile: ReactNode; desktop: ReactNode }) {
  return <>{useViewport() === 'desktop' ? desktop : mobile}</>;
}
