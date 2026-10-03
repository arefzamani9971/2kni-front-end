'use client';
import { type Viewport, VIEWPORT_DESKTOP_QUERY } from '@dukani/design-tokens';
import { useSyncExternalStore } from 'react';

/*
 * Single source of truth for «which Figma Viewport variant are we in».
 *
 * - The signal is the layout width (ui-guidelines §12 «Wide ≥ 1024»), not the device or user agent.
 * - The value is mirrored to <html data-viewport> so the CSS `desktop:` variant and density tokens
 *   (--dukani-control, --dukani-layout-padding) follow it — including portalled overlays.
 * - SSR renders the mobile snapshot; <ViewportScript/> sets the attribute before first paint so CSS-level
 *   differences never flash. Only strategy (DOM) switches re-render after hydration.
 */

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => undefined;
  const mql = window.matchMedia(VIEWPORT_DESKTOP_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

const readViewport = (): Viewport =>
  typeof window !== 'undefined' && window.matchMedia?.(VIEWPORT_DESKTOP_QUERY).matches ? 'desktop' : 'mobile';

const serverViewport = (): Viewport => 'mobile';

/** Live viewport from the media query (no provider needed). */
export function useMediaViewport(): Viewport {
  return useSyncExternalStore(subscribe, readViewport, serverViewport);
}
