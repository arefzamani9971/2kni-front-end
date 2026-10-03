'use client';
import { useNextNavigation } from '@dukani/app-core/next';
import { NavigationProvider } from '@dukani/platform';
import type { ReactNode } from 'react';

export function Navigation({ children }: { children: ReactNode }) {
  return <NavigationProvider value={useNextNavigation()}>{children}</NavigationProvider>;
}
