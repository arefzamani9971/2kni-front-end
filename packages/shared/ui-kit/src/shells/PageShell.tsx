'use client';
import type { ReactNode } from 'react';
import { AppBar } from '../patterns/AppBar';
import { ScreenHeader } from '../patterns/ScreenHeader';
import { BottomNavigation } from '../patterns/BottomNavigation';
import { DesktopSidebar } from '../patterns/DesktopSidebar';
import { StickyActionBar } from '../patterns/StickyActionBar';
import { Screen } from './Screen';
import { ScreenTop } from './ScreenTop';
import { useShellNav } from './use-shell-nav';

/**
 * Page 17 screen frame: «Header» (title 20/DemiBold + subtitle), scrollable content, persistent
 * actions and — when the app provides it — the bottom navigation. Used by tabs and by entry/purchase
 * flows, which in Figma keep the navigation visible.
 */
export function PageShell({
  title,
  subtitle,
  back,
  header,
  headerActions,
  actions,
  actionsClassName,
  banner,
  nav = true,
  mobileNav = true,
  children,
  contentClassName,
}: {
  /** Screen name, shown by the default header. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** With a back action the header is the Figma App Bar (e.g. «خریدها»), otherwise title + subtitle. */
  back?: () => void;
  headerActions?: ReactNode;
  /**
   * Replaces the header: a flush App Bar (STORE-05 385:6912) or `null` when the title is part of the content
   * (STORE-04 385:6853). The page then renders its own `<h1>`.
   */
  header?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  banner?: ReactNode;
  /** false hides the navigation — bottom bar and desktop sidebar (e.g. while a final command runs). */
  nav?: boolean;
  /** Hide mobile navigation in focused capture flows while retaining the desktop sidebar. */
  mobileNav?: boolean;
  children: ReactNode;
  contentClassName?: string;
}) {
  const shellNav = useShellNav();
  return (
    <Screen
      header={
        header !== undefined ? (
          header
        ) : back ? (
          <ScreenTop>
            <AppBar title={title} back={back} actions={headerActions} />
          </ScreenTop>
        ) : (
          <ScreenHeader title={title} subtitle={subtitle} actions={headerActions} />
        )
      }
      actions={
        actions ? <StickyActionBar className={actionsClassName}>{actions}</StickyActionBar> : undefined
      }
      nav={
        nav && mobileNav && shellNav ? (
          <BottomNavigation items={shellNav.items} activeId={shellNav.activeId} />
        ) : undefined
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
      banner={banner}
      contentClassName={contentClassName}
    >
      {children}
    </Screen>
  );
}
