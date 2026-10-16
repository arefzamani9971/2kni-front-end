import type { Api } from '@dukani/http';
import type { CatalogAttachments } from '../application/catalog-attachment.ports';

export const createHttpCatalogAttachments = (api: Api): CatalogAttachments => ({
  search: (storeId, query, signal) =>
    api.post('/api/v1/stores/{storeId}/catalog-attachments/candidates', {
      path: { storeId },
      body: {
        page: query.page, pageSize: query.pageSize, sortModel: query.sort.map(({ field, direction }) => ({ colId: field, sort: direction })),
        q: query.filter.q ?? undefined, categoryId: query.filter.categoryId ?? undefined,
        productTypeId: query.filter.productTypeId ?? undefined,
        onlyStoreType: query.filter.onlyStoreType ?? true,
        onlyNotInMyStore: query.filter.onlyNotInMyStore ?? true,
      },
      signal,
    }),
  snapshot: (storeId, body) =>
    api.post('/api/v1/stores/{storeId}/catalog-attachments/selection', {
      path: { storeId },
      body: { ...body, limit: 100, includeTotalCount: true },
    }),
  preview: (storeId, rows) =>
    api.post('/api/v1/stores/{storeId}/catalog-attachments/preview', { path: { storeId }, body: { rows } }),
  commit: (storeId, operationId, body) =>
    api.post('/api/v1/stores/{storeId}/catalog-attachments', { path: { storeId }, operationId, body }),
  recover: (storeId, operationId) =>
    api.get('/api/v1/stores/{storeId}/catalog-attachments/operations/{operationId}', {
      path: { storeId, operationId },
    }),
});
