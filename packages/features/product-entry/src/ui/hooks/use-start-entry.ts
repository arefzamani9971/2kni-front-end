'use client';
import { decimal, newUuid } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { newDraft, type CatalogChoice } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { useEntryNav } from './use-entry-nav';

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
