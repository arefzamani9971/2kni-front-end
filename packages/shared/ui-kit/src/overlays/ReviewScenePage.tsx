'use client';
import type { OverlayProps } from './Overlay.types';

/** Figma bulk review 358:500: inline page content; the host renders the footer on mobile. */
export function ReviewScenePage({ open, children }: OverlayProps) {
  return open ? <>{children}</> : null;
}
