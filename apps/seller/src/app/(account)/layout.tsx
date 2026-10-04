'use client';
import { ShellNavProvider } from '@dukani/ui-kit';
import type { ReactNode } from 'react';
import { preStoreSidebar } from '../../composition/nav';
import { SIDEBAR_FOOTER, SIDEBAR_WORKSPACE } from '../../composition/nav.constants';
import { SignedIn } from '../../composition/signed-in';

/**
 * Signed in, no store chosen (storeselect, setup). Desktop keeps the Figma 16 sidebar, its rows disabled until a
 * store exists; mobile flows have no bottom navigation here.
 */
export default function AccountLayout({ children }: { children: ReactNode }) {
  const items = preStoreSidebar();
  return (
    <SignedIn>
      <ShellNavProvider items={items} sidebarItems={items} workspace={SIDEBAR_WORKSPACE} sidebarFooter={SIDEBAR_FOOTER}>
        {children}
      </ShellNavProvider>
    </SignedIn>
  );
}
