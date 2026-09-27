import { decimal, formatDecimalFa, formatMoney, fromApiMoney } from '@dukani/domain';
import type { Api, HttpClient } from '@dukani/http';
import type { FileUploader, ProductLookup, PurchaseRepository, SupplierRepository } from '../application/ports';

export const createHttpPurchaseRepository = (api: Api): PurchaseRepository => ({
  list: (storeId, q, cursor, signal) =>
    api.get('/api/v1/stores/{storeId}/purchases', { path: { storeId }, query: { status: q.status, q: q.q, cursor: cursor ?? undefined, limit: 30 }, signal }),
  get: (storeId, purchaseId, signal) => api.get('/api/v1/stores/{storeId}/purchases/{purchaseId}', { path: { storeId, purchaseId }, signal }),
  createDraft: (storeId, body) => api.post('/api/v1/stores/{storeId}/purchases', { path: { storeId }, body }),
  updateDraft: (storeId, purchaseId, body) => api.put('/api/v1/stores/{storeId}/purchases/{purchaseId}', { path: { storeId, purchaseId }, body }),
  discard: async (storeId, purchaseId) => {
    await api.delete('/api/v1/stores/{storeId}/purchases/{purchaseId}', { path: { storeId, purchaseId } });
  },
  totals: (storeId, purchaseId, signal) => api.get('/api/v1/stores/{storeId}/purchases/{purchaseId}/totals', { path: { storeId, purchaseId }, signal }),
  finalize: (storeId, purchaseId, body, operationId) =>
    api.post('/api/v1/stores/{storeId}/purchases/{purchaseId}/finalize', { path: { storeId, purchaseId }, body, operationId }),
  setAttachments: (storeId, purchaseId, fileIds) =>
    api.put('/api/v1/stores/{storeId}/purchases/{purchaseId}/attachments', { path: { storeId, purchaseId }, body: { fileIds } }),
});

export const createHttpSupplierRepository = (api: Api): SupplierRepository => ({
  list: (storeId, signal) => api.get('/api/v1/stores/{storeId}/suppliers', { path: { storeId }, signal }),
  create: (storeId, body) => api.post('/api/v1/stores/{storeId}/suppliers', { path: { storeId }, body }),
});

export const createHttpProductLookup = (api: Api): ProductLookup => ({
  async search(storeId, q, signal) {
    const page = await api.get('/api/v1/stores/{storeId}/products', { path: { storeId }, query: { q: q || undefined, limit: 20, stockState: 'Any' }, signal });
    return page.items.map((p) => ({
      id: p.id,
      title: p.title,
      meta: `${formatDecimalFa(decimal.of(p.available))} ${p.baseUnitName}${p.baseSalePriceRials != null ? ` · ${formatMoney(fromApiMoney(p.baseSalePriceRials)!)}` : ''}`,
    }));
  },
  get: (storeId, productId, signal) => api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId }, signal }),
});

/** Multipart upload through the authenticated http stack (not in OpenAPI yet → untyped request). */
export const createHttpFileUploader = (http: HttpClient): FileUploader => ({
  async upload(storeId, file, kind) {
    const form = new FormData();
    form.append('File', file);
    form.append('Kind', kind);
    const res = await http.request<{ fileId: string }>({ method: 'POST', path: `/api/v1/stores/${encodeURIComponent(storeId)}/files`, form });
    return { fileId: res.data.fileId, name: file.name };
  },
});
