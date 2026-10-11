'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { ChoiceSceneProps } from './ChoiceScene.types';
import { ChoiceSceneDialog } from './ChoiceSceneDialog';
import { ChoiceScenePage } from './ChoiceScenePage';

/** Figma 594:6632 / 597:3955: page actions on mobile, alternative tiles in the desktop dialog. */
export const ChoiceScene = createAdaptive<ChoiceSceneProps>('ChoiceScene', {
  mobile: ChoiceScenePage,
  desktop: ChoiceSceneDialog,
});
