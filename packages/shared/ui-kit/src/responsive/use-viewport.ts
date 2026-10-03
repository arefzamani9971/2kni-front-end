'use client';
import type { Viewport } from '@dukani/design-tokens';
import { useContext } from 'react';
import { ViewportContext } from './viewport-context';
import { useMediaViewport } from './use-media-viewport';

/** Current Figma Viewport variant. Falls back to the live media query when no provider is mounted. */
export function useViewport(): Viewport {
  const fromContext = useContext(ViewportContext);
  const measured = useMediaViewport();
  return fromContext ?? measured;
}
