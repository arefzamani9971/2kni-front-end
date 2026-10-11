'use client';
import type { OverlayProps } from '../overlays/Overlay.types';

/** Figma camera intro 312:9020: inline content and actions on mobile. */
export function ScanPromptPage({ open, children, actions }: OverlayProps) {
  return open ? (
    <div className="flex flex-col gap-4">
      {children}
      <div className="flex flex-col gap-3">{actions}</div>
    </div>
  ) : null;
}
