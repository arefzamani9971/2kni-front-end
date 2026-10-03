'use client';
import type { ReactNode } from 'react';
import type { ShellNav } from './ShellNavProvider.types';
import { ShellNavContext } from './shell-nav-context';

/**
 * The app provides its navigation once (e.g. per store): bottom navigation on mobile, sidebar on desktop.
 * Feature screens stay route- and viewport-agnostic.
 */
export function ShellNavProvider({ children, ...nav }: ShellNav & { children: ReactNode }) {
  return <ShellNavContext.Provider value={nav}>{children}</ShellNavContext.Provider>;
}
