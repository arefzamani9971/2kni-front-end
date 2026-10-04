'use client';
import type { ReactNode } from 'react';
import { AppBar } from '../patterns/AppBar';
import type { AppBarProps } from '../patterns/AppBar.types';
import { DesktopSidebar } from '../patterns/DesktopSidebar';
import { StickyActionBar } from '../patterns/StickyActionBar';
import { Screen } from './Screen';
import { ScreenTop } from './ScreenTop';
import type { ShellCommonProps } from './shell-props';
import { useShellNav } from './use-shell-nav';

/**
 * Task flows (wizards, forms): App Bar with back, sticky actions, no bottom navigation (page-contracts).
 * Desktop (page 16, e.g. storeselect 358:5343, storeprofile 358:5344): the app's sidebar stays at the end edge
 * when a ShellNav is provided; `nav={false}` hides it (e.g. sign-in, Figma AUTH-*).
 */
export function FlowShell({
  appBar,
  top,
  header,
  nav = true,
  ...rest
}: ShellCommonProps & {
  appBar?: AppBarProps;
  top?: ReactNode;
  /** Replaces the App Bar (e.g. a ScreenHeader with title + context line, Figma setup 312:203). */
  header?: ReactNode;
  nav?: boolean;
}) {
  const shellNav = useShellNav();
  return (
    <Screen
      header={
        header ?? (
          <ScreenTop>
            {appBar ? <AppBar {...appBar} /> : null}
            {top}
          </ScreenTop>
        )
      }
      sidebar={
        nav && shellNav ? (
          <DesktopSidebar
            items={shellNav.sidebarItems ?? shellNav.items}
            activeId={shellNav.sidebarActiveId ?? shellNav.activeId}
            workspace={shellNav.workspace}
            footer={shellNav.sidebarFooter}
          />
        ) : undefined
      }
      actions={rest.actions ? <StickyActionBar>{rest.actions}</StickyActionBar> : undefined}
      banner={rest.banner}
      contentClassName={rest.contentClassName}
    >
      {rest.children}
    </Screen>
  );
}
