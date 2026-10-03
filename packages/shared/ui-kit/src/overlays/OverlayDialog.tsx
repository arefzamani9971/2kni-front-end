'use client';
import { Dialog } from './Dialog';
import type { OverlayProps } from './Overlay.types';

export function OverlayDialog({ size, ...rest }: OverlayProps) {
  return <Dialog {...rest} size={size === 'full' ? 'wide' : 'default'} />;
}
