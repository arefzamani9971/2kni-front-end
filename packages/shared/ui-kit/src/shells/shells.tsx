import type { ReactNode } from 'react';
import { AppBar, ScreenHeader, type AppBarProps } from '../patterns/AppBar';
import { BottomNavigation, type NavItem } from '../patterns/BottomNavigation';
import { StickyActionBar } from '../patterns/StickyActionBar';
import { Screen, ScreenTop } from './Screen';

type Common = { children: ReactNode; actions?: ReactNode; banner?: ReactNode; contentClassName?: string };

/** Main destinations: tab header + bottom navigation (خانه، کالاها، مشتریان، گزارش‌ها، بیشتر). */
export function TabsShell({
  title,
  subtitle,
  headerActions,
  nav,
  activeNav,
  ...rest
}: Common & { title: ReactNode; subtitle?: ReactNode; headerActions?: ReactNode; nav: readonly NavItem[]; activeNav?: string }) {
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

/** Task flows (wizards, forms): App Bar with back, sticky actions, no bottom navigation (page-contracts). */
export function FlowShell({ appBar, top, ...rest }: Common & { appBar: AppBarProps; top?: ReactNode }) {
  return (
    <Screen
      header={
        <ScreenTop>
          <AppBar {...appBar} />
          {top}
        </ScreenTop>
      }
      actions={rest.actions ? <StickyActionBar>{rest.actions}</StickyActionBar> : undefined}
      banner={rest.banner}
      contentClassName={rest.contentClassName}
    >
      {rest.children}
    </Screen>
  );
}

/** Sign-in and account screens: no navigation before login (F01). */
export function AuthShell(props: Common & { title: ReactNode; back?: AppBarProps['back'] }) {
  return <FlowShell appBar={{ title: props.title, back: props.back }} {...props} />;
}

/** Full-screen scanner with an explicit exit. */
export function FullscreenShell({ children, onExit, exitLabel = 'خروج از اسکن' }: { children: ReactNode; onExit: () => void; exitLabel?: string }) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-black text-fg-inverse">
      <div className="flex h-14 items-center px-2">
        <button type="button" onClick={onExit} className="h-11 rounded-md px-3 text-label-m text-fg-inverse hover:bg-white/10">
          {exitLabel}
        </button>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
