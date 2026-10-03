'use client';
import type { ReactNode } from 'react';
import { NavigationContext } from './navigation-context';
import type { Navigation } from './navigation.types';

export function NavigationProvider({ value, children }: { value: Navigation; children: ReactNode }) {
  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
