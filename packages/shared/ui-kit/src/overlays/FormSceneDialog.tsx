'use client';
import { Dialog } from './Dialog';
import type { OverlayProps } from './Overlay.types';

/** Figma 597:3955/4023: the same form in a desktop dialog (`full` becomes the wide dialog). */
export function FormSceneDialog({ size, ...props }: OverlayProps) {
  return <Dialog {...props} size={size === 'full' ? 'wide' : 'default'} />;
}
