import type { Api } from '@dukani/http';
import type { ProductRepository } from '../application/ports';

export const createHttpProductRepository = (api: Api): ProductRepository => ({
  shortcuts: (storeId, signal) =>
    api
      .get('/api/v1/stores/{storeId}/products/shortcuts', { path: { storeId }, signal })
      .then((d) => ({ ...d, items: d.items.map((i) => ({ ...i, sortOrder: i.sortOrder ?? null })) })),
  replaceShortcuts: (storeId, expectedVersion, items) =>
    api
      .put('/api/v1/stores/{storeId}/products/shortcuts', {
        path: { storeId },
        body: {
          expectedVersion,
          items: items.map(({ storeProductId, code, showInQuickPick, sortOrder }) => ({
            storeProductId,
            code,
            showInQuickPick,
            sortOrder,
          })),
        },
      })
      .then((d) => ({ ...d, items: d.items.map((i) => ({ ...i, sortOrder: i.sortOrder ?? null })) })),
  list: (storeId, f, cursor, signal) =>
    api.get('/api/v1/stores/{storeId}/products', {
      path: { storeId },
      query: {
        q: f.q || undefined,
        kind: f.kind,
        status: f.status,
        stockState: f.stock === 'Any' ? 'Any' : f.stock,
        costStatus: f.cost === 'Unknown' ? 'Unknown' : undefined,
        cursor: cursor ?? undefined,
        limit: 30,
      },
      signal,
    }),
  get: (storeId, productId, signal) =>
    api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId }, signal }),
  movements: (storeId, productId, signal) =>
    api.get('/api/v1/stores/{storeId}/inventory/{productId}/movements', {
      path: { storeId, productId },
      query: { limit: 10 },
      signal,
    }),
  updateLocal: (storeId, productId, body) =>
    api.put('/api/v1/stores/{storeId}/products/{productId}/local', { path: { storeId, productId }, body }),
  archive: (storeId, productId, expectedVersion) =>
    api.post('/api/v1/stores/{storeId}/products/{productId}/archive', {
      path: { storeId, productId },
      body: { expectedVersion },
    }),
  restore: (storeId, productId, expectedVersion) =>
    api.post('/api/v1/stores/{storeId}/products/{productId}/restore', {
      path: { storeId, productId },
      body: { expectedVersion },
    }),
  corrections: (storeId, catalogItemId, signal) =>
    api.get('/api/v1/stores/{storeId}/catalog/corrections', {
      path: { storeId },
      query: { catalogItemId },
      signal,
    }),
});
