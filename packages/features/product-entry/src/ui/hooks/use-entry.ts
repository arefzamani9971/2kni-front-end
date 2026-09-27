'use client';
import { createQueryKeys, useAppQuery, useQueryCache } from '@dukani/data';
import { decimal, newUuid } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useCallback } from 'react';
import { newDraft, type CatalogChoice, type EntryDraft, type EntryStep } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';

export const entryKeys = createQueryKeys('entry');

/** Loads a wizard draft and saves changes to IndexedDB + the query cache. */
export function useEntryDraft(draftId: string) {
  const { drafts } = useProductEntryModule();
  const store = useActiveStore();
  const cache = useQueryCache();
  const key = entryKeys(store.id).custom('draft', draftId);
  const q = useAppQuery({ queryKey: key, queryFn: () => drafts.get(store.id, draftId), staleTime: Infinity });
  const save = useCallback(
    async (update: (d: EntryDraft) => EntryDraft) => {
      const current = cache.get<EntryDraft | null>(key) ?? (await drafts.get(store.id, draftId));
      if (!current) return null;
      const next = await drafts.save(store.id, update(current));
      cache.set(key, next);
      return next;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key is derived from these ids
    [drafts, store.id, draftId, cache],
  );
  return { draft: q.data ?? null, loading: q.isPending, missing: q.isSuccess && !q.data, save };
}

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

/** Starts a wizard from a catalog item (optionally already in the store) or a new item. */
export function useStartEntry() {
  const { drafts, catalog } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();

  const startNew = async (init: { title?: string; barcode?: string } = {}) => {
    const d = await drafts.save(store.id, newDraft(newUuid(), { source: 'new', ...init }));
    go.step(d.id, 'details');
  };

  const startFromCatalog = async (catalogItemId: string, storeProductId: string | null = null) => {
    const item = await catalog.catalogItem(store.id, catalogItemId);
    const choice: CatalogChoice = {
      id: item.id,
      title: item.title,
      typeName: item.productType.name,
      brandName: item.brand?.name ?? null,
      baseUnitName: item.baseUnit.name,
      baseUnitMaxDecimals: item.baseUnit.maxDecimals,
      units: item.units
        .filter((u) => u.isPurchasable)
        .map((u) => ({ key: u.kind === 'Base' ? 'base' : `unit:${u.id}`, name: u.name, baseQty: decimal.of(u.baseQty), catalogItemUnitId: u.id })),
      storeProductId: storeProductId ?? item.myStoreProductId ?? null,
    };
    const d = await drafts.save(store.id, newDraft(newUuid(), { source: 'catalog', catalog: choice }));
    go.step(d.id, 'details');
  };

  return { startNew, startFromCatalog };
}
