'use client';
import type { ReactNode } from 'react';
import { ReleaseContext } from './release-context';
import type { ReleaseConfig } from './release-gate.types';

export function ReleaseProvider({ config, children }: { config: ReleaseConfig; children: ReactNode }) {
  return <ReleaseContext.Provider value={config}>{children}</ReleaseContext.Provider>;
}
