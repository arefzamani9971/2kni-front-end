'use client';
import { Dialog } from '../overlays/Dialog';
import type { OverlayProps } from '../overlays/Overlay.types';

/** Figma camera intro 312:621: the same prompt in a desktop dialog. */
export function ScanPromptDialog({ size: _size, ...props }: OverlayProps) {
  return <Dialog {...props} />;
}
