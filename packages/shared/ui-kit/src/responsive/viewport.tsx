'use client';
import {
  VIEWPORT_ATTRIBUTE,
  VIEWPORT_DESKTOP_QUERY,
  type Viewport,
} from '@dukani/design-tokens';
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from 'react';

export type { Viewport };

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
function useMediaViewport(): Viewport {
  return useSyncExternalStore(subscribe, readViewport, serverViewport);
}

const ViewportContext = createContext<Viewport | null>(null);

export type ViewportProviderProps = {
  children: ReactNode;
  /**
   * Pins the viewport instead of measuring it — Storybook, visual tests, or an app that is desktop-only
   * (e.g. admin). Also written to <html data-viewport> so CSS agrees with JS.
   */
  forced?: Viewport;
};

/** Mount once near the app root (below <html>). Keeps <html data-viewport> in sync with the measured value. */
export function ViewportProvider({ children, forced }: ViewportProviderProps) {
  const measured = useMediaViewport();
  const viewport = forced ?? measured;
  useEffect(() => {
    document.documentElement.setAttribute(VIEWPORT_ATTRIBUTE, viewport);
  }, [viewport]);
  return <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>;
}

/** Current Figma Viewport variant. Falls back to the live media query when no provider is mounted. */
export function useViewport(): Viewport {
  const fromContext = useContext(ViewportContext);
  const measured = useMediaViewport();
  return fromContext ?? measured;
}

export const useIsDesktop = () => useViewport() === 'desktop';
