'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { FeatureActionProps } from './FeatureAction.types';
import { FeatureActionCard } from './FeatureActionCard';
import { FeatureActionButton } from './FeatureActionButton';

/** Figma attrs 358:491/5354: outline button on mobile, feature card on desktop. */
export const FeatureAction = createAdaptive<FeatureActionProps>('FeatureAction', {
  mobile: FeatureActionButton,
  desktop: FeatureActionCard,
});
