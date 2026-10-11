'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { OverlayProps } from './Overlay.types';
import { ReviewSceneDialog } from './ReviewSceneDialog';
import { ReviewScenePage } from './ReviewScenePage';

/** Figma bulk review 358:500 / 358:5363: page content with host footer on mobile, dialog actions on desktop. */
export const ReviewScene = createAdaptive<OverlayProps>('ReviewScene', {
  mobile: ReviewScenePage,
  desktop: ReviewSceneDialog,
});
