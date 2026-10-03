import { PRE_PAINT } from './viewport-script.constants';

/**
 * Server-safe (no hooks, no 'use client'). Put inside <head> of each app's root layout and add
 * `suppressHydrationWarning` on <html>: sets data-viewport before first paint so desktop users never see the
 * mobile density or layout for a frame. `ViewportProvider` keeps it in sync afterwards.
 */
export function ViewportScript({ nonce }: { nonce?: string }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />;
}
