import { normalizeTitle } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { categoriesByStoreType } from '../db/reference.constants';
import { storeCategoryIds, visibleItems } from './catalog-items';
import type { CatalogItemSearch } from './catalog-search.types';

/** A category and every visible descendant (backend `CatalogReadModel.Subtree`). */
const subtree = (db: MockDb, rootId: string) => {
  const ids = new Set([rootId]);
  for (let grew = true; grew;) {
    grew = false;
    for (const category of db.categories())
      if (category.parentId && ids.has(category.parentId) && !ids.has(category.id)) {
        ids.add(category.id);
        grew = true;
      }
  }
  return ids;
};

/**
 * Store catalog list filter (mirrors `CatalogService.FilterItemsAsync`): every word of `q` in the title, type,
 * brand or key attributes; exact unit barcode; category subtree, type and brand; items this store does not have;
 * the store type's suggested categories. Order and paging belong to the caller.
 */
export const searchCatalogItems = (db: MockDb, storeId: string, filter: CatalogItemSearch) => {
  const q = normalizeTitle(filter.q ?? '');
  const mine = new Set(
    db.state.storeProducts.filter((p) => p.storeId === storeId).map((p) => p.catalogItemId),
  );
  const categories = filter.categoryId ? subtree(db, filter.categoryId) : null;
  const storeTypeId = db.state.stores.find((store) => store.id === storeId)?.storeTypeId;
  const suggested =
    filter.onlyStoreType && storeTypeId && categoriesByStoreType.get(storeTypeId)?.size
      ? storeCategoryIds(db, storeId)
      : null;
  return visibleItems(db, storeId).filter((item) => {
    const type = db.productTypes().find((t) => t.id === item.productTypeId);
    const brand = db.brands().find((b) => b.id === item.brandId);
    const text = normalizeTitle(
      [item.title, type?.name, brand?.name, brand?.nameEn, item.keyAttributes].filter(Boolean).join(' '),
    );
    return (
      (!q || q.split(' ').every((word) => text.includes(word))) &&
      (!filter.barcode || item.units.some((u) => u.barcodes.some((b) => b.code === filter.barcode))) &&
      (!categories || (!!type?.categoryId && categories.has(type.categoryId))) &&
      (!filter.productTypeId || item.productTypeId === filter.productTypeId) &&
      (!filter.brandId || item.brandId === filter.brandId) &&
      (!filter.onlyNotInMyStore || !mine.has(item.id)) &&
      (!suggested ||
        item.ownerStoreId === storeId ||
        type?.ownerStoreId === storeId ||
        (!!type?.categoryId && suggested.has(type.categoryId)))
    );
  });
};
