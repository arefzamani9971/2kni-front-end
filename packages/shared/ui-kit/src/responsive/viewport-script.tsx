import { VIEWPORT_ATTRIBUTE, VIEWPORT_DESKTOP_QUERY } from '@dukani/design-tokens';

const PRE_PAINT = `(function(){try{var m=window.matchMedia&&window.matchMedia(${JSON.stringify(
  VIEWPORT_DESKTOP_QUERY,
)}).matches;document.documentElement.setAttribute(${JSON.stringify(VIEWPORT_ATTRIBUTE)},m?'desktop':'mobile')}catch(e){}})();`;

/**
 * Server-safe (no hooks, no 'use client'). Put inside <head> of each app's root layout and add
 * `suppressHydrationWarning` on <html>: sets data-viewport before first paint so desktop users never see the
 * mobile density or layout for a frame. `ViewportProvider` keeps it in sync afterwards.
 */
export function ViewportScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />;
}
