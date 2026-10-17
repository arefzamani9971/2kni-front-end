import { normalizeDigits, parseBarcode } from '@dukani/domain';
import type { Dto } from '@dukani/contracts';
import type {
  CatalogBrand,
  CatalogCategory,
  CatalogItemSummary,
  CatalogType,
  CatalogTypeSummary,
} from '../domain/catalog.types';
import type { Api } from '@dukani/http';
import type { CatalogPort } from '../application/catalog-port.types';
const category = (row: Dto<'CategoryNodeDto'>): CatalogCategory => ({
  ...row,
  parentId: row.parentId ?? null,
  children: row.children.map(category),
});
const summary = (row: Dto<'ProductTypeSummaryDto'>): CatalogTypeSummary => ({
  ...row,
  categoryId: row.categoryId ?? null,
  categoryName: row.categoryName ?? null,
});
const type = (row: Dto<'ProductTypeDto'>): CatalogType => ({
  ...row,
  categoryId: row.categoryId ?? null,
  categoryName: row.categoryName ?? null,
  attributes: row.attributes.map((a) => ({
    ...a,
    options: a.options.map((o) => ({ ...o, colorHex: o.colorHex ?? null })),
  })),
});
const brand = (row: Dto<'BrandDto'>): CatalogBrand => ({ ...row, nameEn: row.nameEn ?? null });
const itemSummary = (row: Dto<'CatalogItemSummaryDto'>): CatalogItemSummary => ({
  ...row,
  brandName: row.brandName ?? null,
  keyAttributes: row.keyAttributes ?? null,
  myStoreProductId: row.myStoreProductId ?? null,
});
/** A valid GTIN (Persian digits allowed) searches the unit barcode; anything else is title/brand/model text. */
const searchTerms = (input: string) => {
  const text = input.trim();
  const digits = normalizeDigits(text);
  return /^[0-9]{8,14}$/.test(digits) && parseBarcode(digits).ok
    ? { barcode: digits }
    : { q: text || undefined };
};
export const createHttpCatalog = (api: Api): CatalogPort => ({
  categories: (storeId, signal) =>
    api
      .get('/api/v1/stores/{storeId}/catalog/categories', { path: { storeId }, signal })
      .then((rows) => rows.map(category)),
  types: (storeId, q, signal) =>
    api
      .get('/api/v1/stores/{storeId}/catalog/product-types', { path: { storeId }, query: { q }, signal })
      .then((rows) => rows.map(summary)),
  type: (storeId, productTypeId, signal) =>
    api
      .get('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}', {
        path: { storeId, productTypeId },
        signal,
      })
      .then(type),
  units: (signal) => api.get('/api/v1/units', { signal }),
  brands: (storeId, q, signal) =>
    api
      .get('/api/v1/stores/{storeId}/catalog/brands', { path: { storeId }, query: { q }, signal })
      .then((rows) => rows.map(brand)),
  // The list shows the store's own and every allowed catalog item unless a filter says otherwise (F07 §3).
  itemPage: (storeId, query, signal) =>
    api
      .post('/api/v1/stores/{storeId}/catalog/items/search', {
        path: { storeId },
        body: {
          page: query.page,
          pageSize: query.pageSize,
          sortModel: query.sort.map(({ field, direction }) => ({ colId: field, sort: direction })),
          ...searchTerms(query.filter.q),
          productTypeId: query.filter.productTypeId ?? undefined,
          onlyNotInMyStore: false,
          onlyStoreType: false,
        },
        signal,
      })
      .then((page) => ({ ...page, items: page.items.map(itemSummary) })),
  createCategory: (storeId, name, parentId, operationId) =>
    api
      .post('/api/v1/stores/{storeId}/catalog/categories', {
        path: { storeId },
        operationId,
        body: { name, parentId },
      })
      .then(category),
  createType: (storeId, body, operationId) =>
    api
      .post('/api/v1/stores/{storeId}/catalog/product-types', {
        path: { storeId },
        operationId,
        body: { ...body, defaultPackagings: [...body.defaultPackagings] },
      })
      .then(type),
  createBrand: (storeId, name, operationId, nameEn) =>
    api
      .post('/api/v1/stores/{storeId}/catalog/brands', {
        path: { storeId },
        operationId,
        body: { name, nameEn: nameEn?.trim() || null },
      })
      .then(brand),
  async submitType(storeId, productTypeId) {
    await api.post('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}/submit', {
      path: { storeId, productTypeId },
      body: { reason: null },
    });
  },
});
