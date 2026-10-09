'use client';
import { useAppTranslations } from '../i18n/use-app-translations';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { StoreGate } from '@dukani/store';
import { ShellNavProvider } from '@dukani/ui-kit';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { activeSidebarItem, activeTab, sellerNav, sellerSidebar } from './nav';
import { SIDEBAR_FOOTER, SIDEBAR_WORKSPACE } from './nav.constants';
import { SignedIn } from './signed-in';

/**
 * `/s/[storeId]`: signed in + member of the store (role, permissions → ActiveStore) + bottom navigation (mobile)
 * and the nine-row sidebar of Figma page 16 (desktop).
 */
export function InStore({ storeId, children }: { storeId: string; children: ReactNode }) {
  const t = useAppTranslations();
  const nav = useNavigation();
  const pathname = usePathname();
  return (
    <SignedIn>
      <StoreGate storeId={storeId} onLeave={() => nav.replace(sellerRoutes.stores())}>
        <ShellNavProvider
          items={sellerNav(storeId, t)}
          activeId={activeTab(pathname)}
          sidebarItems={sellerSidebar(storeId, t)}
          sidebarActiveId={activeSidebarItem(pathname)}
          workspace={t(SIDEBAR_WORKSPACE)}
          sidebarFooter={t(SIDEBAR_FOOTER)}
        >
          {children}
        </ShellNavProvider>
      </StoreGate>
    </SignedIn>
  );
}
