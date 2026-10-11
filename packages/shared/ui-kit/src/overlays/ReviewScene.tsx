'use client';
import { createAdaptive } from '../responsive/adaptive';
import { Dialog } from './Dialog';
import type { OverlayProps } from './Overlay.types';
function Page({ open, children }: OverlayProps) {
  return open ? <>{children}</> : null;
}
function Modal({ size: _size, ...props }: OverlayProps) {
  return <Dialog {...props} />;
}
/** Figma bulk review 358:500 / 358:5363: page content with host footer on mobile, dialog actions on desktop. */
export const ReviewScene = createAdaptive<OverlayProps>('ReviewScene', { mobile: Page, desktop: Modal });
