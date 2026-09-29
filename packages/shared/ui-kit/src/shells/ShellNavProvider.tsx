'use client';
import { createContext, useContext, type ReactNode } from 'react';
import type { NavItem } from '../patterns/BottomNavigation';

type ShellNav = {
  readonly items: readonly NavItem[];
  readonly activeId?: string;
  /** Desktop sidebar menu; defaults to `items` (the sidebar has room for more destinations than the tab bar). */
  readonly sidebarItems?: readonly NavItem[];
  /** Sidebar second line, e.g. «پنل فروشنده · نوشت‌افزار آفتاب». */
  readonly workspace?: ReactNode;
  readonly sidebarFooter?: ReactNode;
};

const ShellNavContext = createContext<ShellNav | null>(null);

/**
 * The app provides its navigation once (e.g. per store): bottom navigation on mobile, sidebar on desktop.
 * Feature screens stay route- and viewport-agnostic.
 */
export function ShellNavProvider({ children, ...nav }: ShellNav & { children: ReactNode }) {
  return <ShellNavContext.Provider value={nav}>{children}</ShellNavContext.Provider>;
}

export const useShellNav = () => useContext(ShellNavContext);
