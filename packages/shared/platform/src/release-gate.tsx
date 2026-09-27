'use client';
import { isReleased, type FeatureFlag, type ProductRelease } from '@dukani/domain';
import { createContext, useContext, type ReactNode } from 'react';

export type ReleaseConfig = { readonly current: ProductRelease; readonly flags: readonly FeatureFlag[] };

const ReleaseContext = createContext<ReleaseConfig>({ current: '1.0', flags: [] });

export function ReleaseProvider({ config, children }: { config: ReleaseConfig; children: ReactNode }) {
  return <ReleaseContext.Provider value={config}>{children}</ReleaseContext.Provider>;
}

export const useRelease = () => useContext(ReleaseContext);

/** True when the product release is reached (and the optional feature flag is on). */
export const useIsReleased = (release: ProductRelease, flag?: FeatureFlag): boolean => {
  const cfg = useRelease();
  return isReleased(cfg.current, release) && (!flag || cfg.flags.includes(flag));
};

/** Renders children only in the given release; menus and buttons of future modules stay hidden. */
export function Released({ release, flag, children, fallback = null }: {
  release: ProductRelease;
  flag?: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{useIsReleased(release, flag) ? children : fallback}</>;
}
