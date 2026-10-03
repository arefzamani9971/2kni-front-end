import type { ReactNode } from 'react';
import type { NavItem } from './BottomNavigation.types';

export type DesktopSidebarProps = {
  items: readonly NavItem[];
  activeId?: string;
  /** Second line under the brand, e.g. «پنل فروشنده» or the active store. */
  workspace?: ReactNode;
  /** Bottom line (Figma «فضای کاری دکانی»), e.g. a store switcher or sign-out. */
  footer?: ReactNode;
  /** Figma rows are text-only; icons help scanning long menus. */
  showIcons?: boolean;
  className?: string;
};
