'use client';
import type { ReactNode } from 'react';
import type { LinkComponent } from './LinkProvider.types';
import { LinkContext } from './link-context';

/** Apps inject their router link once; ui-kit stays router-agnostic. */
export function LinkProvider({ component, children }: { component: LinkComponent; children: ReactNode }) {
  return <LinkContext.Provider value={component}>{children}</LinkContext.Provider>;
}
