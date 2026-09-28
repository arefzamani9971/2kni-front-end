import type { ReactNode } from 'react';
import { AppBar, type AppBarProps } from '../patterns/AppBar';
import { StickyActionBar } from '../patterns/StickyActionBar';
import { Screen } from './Screen';
import { ScreenTop } from './ScreenTop';
import type { ShellCommonProps } from './shell-props';

/** Task flows (wizards, forms): App Bar with back, sticky actions, no bottom navigation (page-contracts). */
export function FlowShell({ appBar, top, ...rest }: ShellCommonProps & { appBar: AppBarProps; top?: ReactNode }) {
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
