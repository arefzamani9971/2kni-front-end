'use client';
import type { FeatureFlag, ProductRelease } from '@dukani/domain';
import type { ReactNode } from 'react';
import { useIsReleased } from './release-gate';

/** Renders children only in the given release; menus and buttons of future modules stay hidden. */
export function Released({ release, flag, children, fallback = null }: {
  release: ProductRelease;
  flag?: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{useIsReleased(release, flag) ? children : fallback}</>;
}
