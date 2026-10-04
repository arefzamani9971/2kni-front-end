import type { ReactNode } from 'react';
import type { NavItem } from '../patterns/BottomNavigation.types';

export type ShellNav = {
  readonly items: readonly NavItem[];
  readonly activeId?: string;
  /** Desktop sidebar menu; defaults to `items` (the sidebar has room for more destinations than the tab bar). */
  readonly sidebarItems?: readonly NavItem[];
  /** Active sidebar row when its ids differ from the tab bar's; defaults to `activeId`. */
  readonly sidebarActiveId?: string;
  /** Sidebar second line, e.g. «پنل فروشنده · نوشت‌افزار آفتاب». */
  readonly workspace?: ReactNode;
  readonly sidebarFooter?: ReactNode;
};
