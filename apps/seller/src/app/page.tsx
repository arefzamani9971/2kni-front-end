'use client';
import { restoreOnce } from '@dukani/app-core';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { entryStoreId } from '@dukani/store';
import { useEffect } from 'react';
import { BootSpinner, useSeller } from '../composition/providers';

/** `/`: restore the session, then open the default store, the store list, or the login page. */
export default function RootPage() {
  const { session, modules } = useSeller();
  const nav = useNavigation();
  useEffect(() => {
    let alive = true;
    void (async () => {
      const state = await restoreOnce(session);
      if (!alive) return;
      if (state.status !== 'signed-in') return nav.replace(sellerRoutes.login());
      const my = await modules.store.stores.myStores().catch(() => null);
      const storeId = my ? entryStoreId(my, state.user.defaultStoreId) : state.user.defaultStoreId;
      if (alive) nav.replace(storeId ? sellerRoutes.store.home(storeId) : sellerRoutes.stores());
    })();
    return () => {
      alive = false;
    };
  }, [session, modules, nav]);
  return <BootSpinner />;
}
