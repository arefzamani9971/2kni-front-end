'use client';
import { type Viewport, VIEWPORT_ATTRIBUTE } from '@dukani/design-tokens';
import { useEffect } from 'react';
import type { ViewportProviderProps } from './viewport.types';
import { useMediaViewport } from './use-media-viewport';
import { ViewportContext } from './viewport-context';

export type { Viewport };

/** Mount once near the app root (below <html>). Keeps <html data-viewport> in sync with the measured value. */
export function ViewportProvider({ children, forced }: ViewportProviderProps) {
  const measured = useMediaViewport();
  const viewport = forced ?? measured;
  useEffect(() => {
    document.documentElement.setAttribute(VIEWPORT_ATTRIBUTE, viewport);
  }, [viewport]);
  return <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>;
}
