'use client';
import type { ComponentType } from 'react';
import { useViewport } from './use-viewport';
import type { Strategies } from './adaptive.types';

/**
 * Builds the facade component that renders the strategy for the current viewport.
 *
 * ```tsx
 * export const Overlay = createAdaptive<OverlayProps>('Overlay', { mobile: OverlaySheet, desktop: OverlayDialog });
 * ```
 */
export function createAdaptive<P extends object>(
  displayName: string,
  strategies: Strategies<P>,
): ComponentType<P> {
  function Adaptive(props: P) {
    const Strategy = strategies[useViewport()];
    return <Strategy {...props} />;
  }
  Adaptive.displayName = displayName;
  return Adaptive;
}
