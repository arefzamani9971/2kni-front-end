'use client';
import { createAdaptive } from '../responsive/adaptive';
import { FormSceneDialog } from './FormSceneDialog';
import { FormScenePage } from './FormScenePage';
import type { OverlayProps } from './Overlay.types';

/** Figma brandselect/brandnew: 594:6632/6653 mobile page; 597:3955/4023 desktop dialog. */
export const FormScene = createAdaptive<OverlayProps>('FormScene', {
  mobile: FormScenePage,
  desktop: FormSceneDialog,
});
