import type { Api } from '@dukani/http';
import type { CatalogAttachments } from '../application/catalog-attachment.ports';

export const createHttpCatalogAttachments = (api: Api): CatalogAttachments => ({
  search: (storeId, query, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog-attachments', { path: { storeId }, query, signal }),
  snapshot: (storeId, body) =>
    api.post('/api/v1/stores/{storeId}/catalog-attachments/selection', {
      path: { storeId },
      body: { ...body, limit: body.limit ?? 20, includeTotalCount: true },
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
