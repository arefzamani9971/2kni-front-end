'use client';
import { restoreOnce } from '@dukani/app-core';
import { useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useEffect } from 'react';
import { BootSpinner } from '../composition/boot-spinner';
import { entryRoute } from '../composition/entry-route';
import { useSeller } from '../composition/use-seller';

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
      const to = await entryRoute(modules, state.user.defaultStoreId);
      if (alive) nav.replace(to);
    })();
    return () => {
      alive = false;
    };
  }, [session, modules, nav]);
  return <BootSpinner />;
}
