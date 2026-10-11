import type { Api } from '@dukani/http';
import type { EntryCatalog, EntryCommands } from '../application/ports';
import { toRegisterRequest } from '../domain/entry-draft';

/** HTTP adapters of the entry ports; each method is one endpoint + DTO mapping. */
export const createHttpEntryCatalog = (api: Api): EntryCatalog => ({
  units: (signal) => api.get('/api/v1/units', { signal }),
  settings: (storeId, signal) => api.get('/api/v1/stores/{storeId}/settings', { path: { storeId }, signal }),
  categories: (storeId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/categories', { path: { storeId }, signal }),
  imageUrl: (storeId, itemId, fileId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/items/{itemId}/images/{fileId}', {
      path: { storeId, itemId, fileId },
      signal,
    }),
  storeProducts: (storeId, q, cursor, signal) =>
    api.get('/api/v1/stores/{storeId}/products', {
      path: { storeId },
      query: { q, cursor, limit: 30, stockState: 'Any' },
      signal,
    }),
  catalogItems: (storeId, q, cursor, signal, filters) =>
    api.get('/api/v1/stores/{storeId}/catalog/items', {
      path: { storeId },
      query: { q, cursor, ...filters, onlyNotInMyStore: true, limit: 20 },
      signal,
    }),
  storeProduct: (storeId, productId, signal) =>
    api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId }, signal }),
  lookupBarcode: (storeId, code, signal) =>
    api.get('/api/v1/stores/{storeId}/barcodes/{code}', { path: { storeId, code }, signal }),
  async storeProductCatalogId(storeId, productId) {
    return (await api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId } }))
      .catalogItemId;
  },
  catalogItem: (storeId, itemId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/items/{itemId}', { path: { storeId, itemId }, signal }),
  productTypes: (storeId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/product-types', { path: { storeId }, signal }),
  productType: (storeId, productTypeId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}', {
      path: { storeId, productTypeId },
      signal,
    }),
  brands: (storeId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/brands', { path: { storeId }, signal }),
  titleCheck: (storeId, title, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/items/title-check', {
      path: { storeId },
      query: { title },
      signal,
    }),
  suppliers: (storeId, signal) =>
    api.get('/api/v1/stores/{storeId}/suppliers', { path: { storeId }, signal }),
});

export const createHttpEntryCommands = (api: Api): EntryCommands => ({
  uploadImage: (storeId, file, signal) => {
    const form = new FormData();
    form.append('File', file);
    form.append('Kind', 'ProductImage');
    return api.post('/api/v1/stores/{storeId}/files', { path: { storeId }, form, signal });
  },
  correct: (storeId, itemId, body, operationId) =>
    api.post('/api/v1/stores/{storeId}/catalog/items/{itemId}/corrections', {
      path: { storeId, itemId },
      body,
      operationId,
    }),
  registerRequest: (storeId, body, operationId) =>
    api.post('/api/v1/stores/{storeId}/product-entry/register', { path: { storeId }, body, operationId }),
  validateBulk: (storeId, body) =>
    api.post('/api/v1/stores/{storeId}/product-entry/bulk/validate', { path: { storeId }, body }),
  registerBulk: (storeId, body, operationId) =>
    api.post('/api/v1/stores/{storeId}/product-entry/bulk', { path: { storeId }, body, operationId }),
  preview: (storeId, draft) =>
    api.post('/api/v1/stores/{storeId}/product-entry/preview', {
      path: { storeId },
      body: toRegisterRequest(draft),
    }),
  pricePreview: (storeId, body) =>
    api.post('/api/v1/stores/{storeId}/products/pricing/preview', { path: { storeId }, body }),
  register: (storeId, draft, operationId) =>
    api.post('/api/v1/stores/{storeId}/product-entry/register', {
      path: { storeId },
      body: toRegisterRequest(draft),
      operationId,
    }),
});
