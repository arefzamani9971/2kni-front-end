import { formatDecimalFa, decimal } from '@dukani/domain';
import type { Api } from '@dukani/http';
import type { EntryCatalog, EntryCommands } from '../application/ports';
import { toRegisterRequest } from '../domain/entry-draft';

/** HTTP adapters of the entry ports; each method is one endpoint + DTO mapping. */
export const createHttpEntryCatalog = (api: Api): EntryCatalog => ({
  async search(storeId, q, signal) {
    const [products, catalog] = await Promise.all([
      api.get('/api/v1/stores/{storeId}/products', { path: { storeId }, query: { q, limit: 5, stockState: 'Any' }, signal }),
      api.get('/api/v1/stores/{storeId}/catalog/items', { path: { storeId }, query: { q, onlyNotInMyStore: true, limit: 8 }, signal }),
    ]);
    return {
      inStore: products.items.map((p) => ({
        storeProductId: p.id,
        catalogItemId: '',
        title: p.title,
        onHandText: `${formatDecimalFa(decimal.of(p.onHand))} ${p.baseUnitName} موجود`,
        baseUnitName: p.baseUnitName,
      })),
      inCatalog: catalog.items.map((c) => ({
        catalogItemId: c.id,
        title: c.title,
        subtitle: [c.productTypeName, c.brandName, c.keyAttributes].filter(Boolean).join(' · '),
      })),
    };
  },
  lookupBarcode: (storeId, code) => api.get('/api/v1/stores/{storeId}/barcodes/{code}', { path: { storeId, code } }),
  async storeProductCatalogId(storeId, productId) {
    return (await api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId } })).catalogItemId;
  },
  catalogItem: (storeId, itemId) => api.get('/api/v1/stores/{storeId}/catalog/items/{itemId}', { path: { storeId, itemId } }),
  productTypes: (storeId, signal) => api.get('/api/v1/stores/{storeId}/catalog/product-types', { path: { storeId }, signal }),
  productType: (storeId, productTypeId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}', { path: { storeId, productTypeId }, signal }),
  brands: (storeId, signal) => api.get('/api/v1/stores/{storeId}/catalog/brands', { path: { storeId }, signal }),
  titleCheck: (storeId, title, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/items/title-check', { path: { storeId }, query: { title }, signal }),
  suppliers: (storeId, signal) => api.get('/api/v1/stores/{storeId}/suppliers', { path: { storeId }, signal }),
});

export const createHttpEntryCommands = (api: Api): EntryCommands => ({
  preview: (storeId, draft) => api.post('/api/v1/stores/{storeId}/product-entry/preview', { path: { storeId }, body: toRegisterRequest(draft) }),
  pricePreview: (storeId, body) => api.post('/api/v1/stores/{storeId}/products/pricing/preview', { path: { storeId }, body }),
  register: (storeId, draft, operationId) =>
    api.post('/api/v1/stores/{storeId}/product-entry/register', { path: { storeId }, body: toRegisterRequest(draft), operationId }),
});
