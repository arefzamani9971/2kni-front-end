'use client';

import { createAdaptive } from '../responsive/adaptive';

import type { OverlayProps } from './Overlay.types';
import { OverlaySheet } from './OverlaySheet';
import { OverlayDialog } from './OverlayDialog';

export const Overlay = createAdaptive<OverlayProps>('Overlay', {
  mobile: OverlaySheet,
  desktop: OverlayDialog,
});
