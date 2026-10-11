'use client';
import { Dialog } from './Dialog';
import type { OverlayProps } from './Overlay.types';

/** Figma bulk review 358:5363: a desktop dialog with its own actions. */
export function ReviewSceneDialog({ size: _size, ...props }: OverlayProps) {
  return <Dialog {...props} />;
}
