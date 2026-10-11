'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { OverlayProps } from '../overlays/Overlay.types';
import { ScanPromptDialog } from './ScanPromptDialog';
import { ScanPromptPage } from './ScanPromptPage';

/** Figma camera intro 312:9020 page / 312:621 dialog, shared permission state. */
export const ScanPrompt = createAdaptive<OverlayProps>('ScanPrompt', {
  mobile: ScanPromptPage,
  desktop: ScanPromptDialog,
});
