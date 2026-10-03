'use client';
import { BottomSheet } from './BottomSheet';
import type { OverlayProps } from './Overlay.types';

export function OverlaySheet({ actions, size, ...rest }: OverlayProps) {
  return <BottomSheet {...rest} footer={actions} full={size === 'full'} />;
}
