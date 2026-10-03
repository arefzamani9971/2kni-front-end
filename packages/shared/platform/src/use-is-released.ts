'use client';
import { isReleased, type FeatureFlag, type ProductRelease } from '@dukani/domain';
import { useRelease } from './use-release';

/** True when the product release is reached (and the optional feature flag is on). */
export const useIsReleased = (release: ProductRelease, flag?: FeatureFlag): boolean => {
  const cfg = useRelease();
  return isReleased(cfg.current, release) && (!flag || cfg.flags.includes(flag));
};
