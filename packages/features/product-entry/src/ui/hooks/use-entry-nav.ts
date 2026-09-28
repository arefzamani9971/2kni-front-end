'use client';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import type { EntryStep } from '../../domain/entry-draft';

export const useEntryNav = () => {
  const nav = useNavigation();
  const store = useActiveStore();
  return {
    step: (draftId: string, step: EntryStep, replace = false) =>
      (replace ? nav.replace : nav.push)(sellerRoutes.entry.draft(store.id, draftId, step)),
    method: () => nav.push(sellerRoutes.entry.method(store.id)),
    search: (q: string) => nav.push(sellerRoutes.entry.search(store.id, q)),
    back: () => nav.back(),
    home: () => nav.replace(sellerRoutes.store.home(store.id)),
    nav,
    storeId: store.id,
  };
};
