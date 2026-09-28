import type { ReactNode } from 'react';
import { ScreenHeader } from '../patterns/ScreenHeader';
import { BottomNavigation, type NavItem } from '../patterns/BottomNavigation';
import { StickyActionBar } from '../patterns/StickyActionBar';
import { Screen } from './Screen';
import type { ShellCommonProps } from './shell-props';

/** Main destinations: tab header + bottom navigation (خانه، کالاها، مشتریان، گزارش‌ها، بیشتر). */
export function TabsShell({
  title,
  subtitle,
  headerActions,
  nav,
  activeNav,
  ...rest
}: ShellCommonProps & { title: ReactNode; subtitle?: ReactNode; headerActions?: ReactNode; nav: readonly NavItem[]; activeNav?: string }) {
  return (
    <Screen
      header={<ScreenHeader title={title} subtitle={subtitle} actions={headerActions} />}
      actions={rest.actions ? <StickyActionBar>{rest.actions}</StickyActionBar> : undefined}
      nav={<BottomNavigation items={nav} activeId={activeNav} />}
      banner={rest.banner}
      contentClassName={rest.contentClassName}
    >
      {rest.children}
    </Screen>
  );
}
