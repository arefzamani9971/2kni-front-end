'use client';
import type { ComponentType, ReactNode } from 'react';
import { useViewport, type Viewport } from './viewport';

/*
 * Strategy + Multiplexer for components that share ONE contract but need a different DOM or interaction per
 * viewport (bottom sheet ↔ dialog, sheet list ↔ anchored listbox, card list ↔ data grid).
 *
 * Rules (docs/architecture/responsive-components.md):
 * 1. The public component *is* the facade and carries the plain concept name (`Overlay`, `SelectField`) —
 *    no «Responsive/Smart» prefix leaks into features. Strategies are internal.
 * 2. Both strategies receive exactly the same props (Liskov). A prop that only one strategy understands
 *    goes into the shared contract with a documented no-op in the other, never into the consumer.
 * 3. Strategies are stateless renderers: open/value/draft state lives in the facade or the caller, so a
 *    viewport change (rotation, split screen, resize) swaps the presentation without losing state.
 * 4. Differences that are only size/spacing/alignment are NOT strategies — use the CSS `desktop:` variant.
 */

export type Strategies<P> = Readonly<Record<Viewport, ComponentType<P>>>;

/**
 * Builds the facade component that renders the strategy for the current viewport.
 *
 * ```tsx
 * export const Overlay = createAdaptive<OverlayProps>('Overlay', { mobile: OverlaySheet, desktop: OverlayDialog });
 * ```
 */
export function createAdaptive<P extends object>(displayName: string, strategies: Strategies<P>): ComponentType<P> {
  function Adaptive(props: P) {
    const Strategy = strategies[useViewport()];
    return <Strategy {...props} />;
  }
  Adaptive.displayName = displayName;
  return Adaptive;
}

/** Picks a value per viewport (e.g. a number of columns) without branching in the consumer. */
export function useByViewport<T>(values: Readonly<Record<Viewport, T>>): T {
  return values[useViewport()];
}

/**
 * Inline multiplexer for one-off compositions inside a screen. Prefer a named facade built with
 * `createAdaptive` when the same switch appears twice.
 */
export function ViewportSwitch({ mobile, desktop }: { mobile: ReactNode; desktop: ReactNode }) {
  return <>{useViewport() === 'desktop' ? desktop : mobile}</>;
}
