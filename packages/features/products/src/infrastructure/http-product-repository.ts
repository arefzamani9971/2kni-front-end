import type { Api } from '@dukani/http';
import type { ProductRepository } from '../application/ports';

export const createHttpProductRepository = (api: Api): ProductRepository => ({
  list: (storeId, f, cursor, signal) =>
    api.get('/api/v1/stores/{storeId}/products', {
      path: { storeId },
      query: {
        q: f.q || undefined,
        stockState: f.stock === 'Any' ? 'Any' : f.stock,
        costStatus: f.cost === 'Unknown' ? 'Unknown' : undefined,
        cursor: cursor ?? undefined,
        limit: 30,
      },
      signal,
    }),
  get: (storeId, productId, signal) => api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId }, signal }),
  movements: (storeId, productId, signal) =>
    api.get('/api/v1/stores/{storeId}/inventory/{productId}/movements', { path: { storeId, productId }, query: { limit: 10 }, signal }),
});
