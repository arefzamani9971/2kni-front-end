'use client';
import { SessionGate } from '@dukani/app-core';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { StoreGate } from '@dukani/store';
import { ShellNavProvider } from '@dukani/ui-kit';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { activeTab, sellerNav } from './nav';
import { BootSpinner, useSeller } from './providers';

/** Signed-in area without a store (stores list, create store). */
export function SignedIn({ children }: { children: ReactNode }) {
  const { session } = useSeller();
  return (
    <SessionGate session={session} loginHref={sellerRoutes.login} fallback={<BootSpinner />}>
      {children}
    </SessionGate>
  );
}

/** `/s/[storeId]`: signed in + member of the store (role, permissions → ActiveStore) + bottom navigation. */
export function InStore({ storeId, children }: { storeId: string; children: ReactNode }) {
  const nav = useNavigation();
  const pathname = usePathname();
  return (
    <SignedIn>
      <StoreGate storeId={storeId} onLeave={() => nav.replace(sellerRoutes.stores())}>
        <ShellNavProvider items={sellerNav(storeId)} activeId={activeTab(pathname)}>
          {children}
        </ShellNavProvider>
      </StoreGate>
    </SignedIn>
  );
}
