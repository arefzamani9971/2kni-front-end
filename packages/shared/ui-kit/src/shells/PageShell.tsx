'use client';
import type { ReactNode } from 'react';
import { AppBar } from '../patterns/AppBar';
import { ScreenHeader } from '../patterns/ScreenHeader';
import { BottomNavigation } from '../patterns/BottomNavigation';
import { StickyActionBar } from '../patterns/StickyActionBar';
import { Screen } from './Screen';
import { ScreenTop } from './ScreenTop';
import { useShellNav } from './ShellNavProvider';

/**
 * Page 17 screen frame: «Header» (title 20/DemiBold + subtitle), scrollable content, persistent
 * actions and — when the app provides it — the bottom navigation. Used by tabs and by entry/purchase
 * flows, which in Figma keep the navigation visible.
 */
export function PageShell({
  title,
  subtitle,
  back,
  headerActions,
  actions,
  banner,
  nav = true,
  children,
  contentClassName,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  /** With a back action the header is the Figma App Bar (e.g. «خریدها»), otherwise title + subtitle. */
  back?: () => void;
  headerActions?: ReactNode;
  actions?: ReactNode;
  banner?: ReactNode;
  /** false hides the navigation (e.g. while a final command runs). */
  nav?: boolean;
  children: ReactNode;
  contentClassName?: string;
}) {
  const shellNav = useShellNav();
  return (
    <Screen
      header={
        back ? (
          <ScreenTop>
            <AppBar title={title} back={back} actions={headerActions} />
          </ScreenTop>
        ) : (
          <ScreenHeader title={title} subtitle={subtitle} actions={headerActions} />
        )
      }
      actions={actions ? <StickyActionBar>{actions}</StickyActionBar> : undefined}
      nav={nav && shellNav ? <BottomNavigation items={shellNav.items} activeId={shellNav.activeId} /> : undefined}
      banner={banner}
      contentClassName={contentClassName}
    >
      {children}
    </Screen>
  );
}
