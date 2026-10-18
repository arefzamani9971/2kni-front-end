'use client';
import type { Dto } from '@dukani/contracts';
import { decimal, newUuid } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { newDraft } from '../../domain/entry-draft';
import type { CatalogChoice, EntryTypePreset } from '../../domain/entry-draft.types';
import { useProductEntryModule } from '../../module';
import { useEntryNav } from './use-entry-nav';

/** Starts a wizard from a catalog item (optionally already in the store) or a new item. */
export function useStartEntry({
  bulk = false,
  purchaseHostId,
  replace = false,
  intent = bulk ? 'compound' : 'standalone',
}: { bulk?: boolean; purchaseHostId?: string; replace?: boolean; intent?: 'standalone' | 'compound' } = {}) {
  const { drafts, catalog } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();

  const startNew = async (
    init: {
      title?: string;
      barcode?: string;
      productType?: EntryTypePreset;
      kind?: 'Goods' | 'Service';
    } = {},
  ) => {
    const fresh = newDraft(newUuid(), { source: 'new', ...init });
    const d = await drafts.save(store.id, {
      ...fresh,
      intent,
      purchaseHostId,
      newItem: { ...fresh.newItem!, kind: init.kind ?? 'Goods' },
      ...(bulk ? { bulkHost: true } : {}),
    });
    go.step(d.id, 'details', replace);
  };

  const prepareCatalog = async (
    catalogItemId: string,
    storeProductId: string | null = null,
    selection?: { localTitle?: string; localNote?: string; match?: Dto<'BarcodeMatchDto'> },
  ) => {
    const item = await catalog.catalogItem(store.id, catalogItemId);
    if (item.status === 'Archived') throw new Error('CATALOG_ITEM_UNAVAILABLE');
    const existingId = storeProductId ?? item.myStoreProductId ?? null;
    const existing = existingId ? await catalog.storeProduct(store.id, existingId) : null;
    if (existing && existing.status !== 'Active') throw new Error('CATALOG_ITEM_UNAVAILABLE');
    const choice: CatalogChoice = {
      kind: item.kind,
      status: item.status,
      id: item.id,
      title: item.title,
      typeName: item.productType.name,
      brandName: item.brand?.name ?? null,
      baseUnitName: item.baseUnit.name,
      baseUnitMaxDecimals: item.baseUnit.maxDecimals,
      // F12: the store unit carries its own uses; a retired unit stays for history only
      units: existing
        ? existing.units
            .filter((u) => u.isPurchasable && !u.archivedAt)
            .map((u) => ({
              key: `store:${u.id}`,
              name: u.name,
              baseQty: decimal.of(u.baseQty),
              ...(u.catalogItemUnitId ? { catalogItemUnitId: u.catalogItemUnitId } : {}),
              storeProductUnitId: u.id,
              isPurchasable: true,
              isSellable: u.isSellable,
            }))
        : item.units.map((u) => ({
            key: u.kind === 'Base' ? 'base' : `unit:${u.id}`,
            name: u.name,
            baseQty: decimal.of(u.baseQty),
            catalogItemUnitId: u.id,
            isPurchasable: u.isPurchasable,
            isSellable: u.isSellable,
          })),
      storeProductId: storeProductId ?? item.myStoreProductId ?? null,
      storeProductVersion: existing?.version,
    };
    return {
      ...newDraft(newUuid(), { source: 'catalog', catalog: choice }),
      intent,
      purchaseHostId,
      localTitle: selection?.localTitle ?? '',
      localNote: selection?.localNote ?? '',
      ...(selection?.match ? { scanContext: selection.match } : {}),
      ...(bulk ? { bulkHost: true } : {}),
    };
  };

  const startFromCatalog = async (...args: Parameters<typeof prepareCatalog>) => {
    const d = await drafts.save(store.id, await prepareCatalog(...args));
    go.step(d.id, 'details');
  };
  return { startNew, startFromCatalog, prepareCatalog };
}
