import type { Viewport } from '@dukani/design-tokens';
import type { ReactNode } from 'react';

export type ViewportProviderProps = {
  children: ReactNode;
  /**
   * Pins the viewport instead of measuring it — Storybook, visual tests, or an app that is desktop-only
   * (e.g. admin). Also written to <html data-viewport> so CSS agrees with JS.
   */
  forced?: Viewport;
};
