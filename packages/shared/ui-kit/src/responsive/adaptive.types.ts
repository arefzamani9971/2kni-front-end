import type { ComponentType } from 'react';
import type { Viewport } from './viewport';

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
