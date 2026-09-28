'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { NavItem } from '../patterns/BottomNavigation';

type ShellNav = { readonly items: readonly NavItem[]; readonly activeId?: string };

const ShellNavContext = createContext<ShellNav | null>(null);

/** The app provides its bottom navigation once (e.g. per store); feature screens stay route-agnostic. */
export function ShellNavProvider({ items, activeId, children }: ShellNav & { children: ReactNode }) {
  return <ShellNavContext.Provider value={{ items, activeId }}>{children}</ShellNavContext.Provider>;
}

export const useShellNav = () => useContext(ShellNavContext);
