'use client';
import { createAdaptive } from '../responsive/adaptive';
import { Dialog } from '../overlays/Dialog';
import type { OverlayProps } from '../overlays/Overlay.types';
function Page({ open, children, actions }: OverlayProps) {
  return open ? (
    <div className="flex flex-col gap-4">
      {children}
      <div className="flex flex-col gap-3">{actions}</div>
    </div>
  ) : null;
}
function PromptDialog({ size: _size, ...props }: OverlayProps) {
  return <Dialog {...props} />;
}
/** Figma camera intro 312:9020 page / 312:621 dialog, shared permission state. */
export const ScanPrompt = createAdaptive<OverlayProps>('ScanPrompt', { mobile: Page, desktop: PromptDialog });
