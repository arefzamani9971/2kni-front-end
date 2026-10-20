import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { newOperationId } from '@dukani/domain';
import {
  compose,
  createApi,
  createFetchAdapter,
  withAuth,
  withErrorMapping,
  withIdempotency,
} from '@dukani/http';
import { FIXTURE } from './db/fixtures.constants';
import { createMockServer } from './node';

const BASE = 'http://api.test';
const mock = createMockServer({ baseUrl: BASE });
let token: string | null = null;
const api = createApi(
  compose(
    createFetchAdapter({ baseUrl: BASE }),
    withIdempotency,
    withAuth({ getAccessToken: () => token, refresh: async () => false, onSessionExpired: () => undefined }),
    withErrorMapping,
  ),
);
beforeAll(() => mock.server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  mock.reset();
  token = null;
});
afterAll(() => mock.server.close());
const signIn = async () => {
  const otp = await api.post('/api/v1/auth/otp/request', {
    body: { mobile: FIXTURE.ownerMobile },
    auth: false,
  });
  token = (
    await api.post('/api/v1/auth/otp/verify', {
      body: { requestId: otp.requestId, code: otp.devCode! },
      auth: false,
    })
  ).accessToken;
};

describe('mock F13 receipts follow the server rules', () => {
  it('pages products with stock history and filters the ones an Opening may still take', async () => {
    await signIn();
    const storeId = FIXTURE.storeId;
    const page = await api.post('/api/v1/stores/{storeId}/products/search', {
      path: { storeId },
      body: { page: 1, pageSize: 2, sortModel: [{ colId: 'title', sort: 'asc' }], kind: 'Goods' },
    });
    expect(page).toMatchObject({ page: 1, pageSize: 2 });
    expect(page.items.length).toBeLessThanOrEqual(2);
    expect(page.totalCount).toBeGreaterThanOrEqual(page.items.length);
    const fresh = await api.post('/api/v1/stores/{storeId}/products/search', {
      path: { storeId },
      body: { page: 1, pageSize: 100, withoutStockHistory: true },
    });
    expect(fresh.items.every((row) => !row.hasStockHistory)).toBe(true);
    await expect(
      api.post('/api/v1/stores/{storeId}/products/search', {
        path: { storeId },
        body: { sortModel: [{ colId: 'price' as never, sort: 'asc' }] },
      }),
    ).rejects.toMatchObject({ kind: 'Validation' });
  });

  it('records a quick purchase once per key, asks a reason for a known zero and refuses an Opening after history', async () => {
    await signIn();
    const storeId = FIXTURE.storeId;
    const products = await api.get('/api/v1/stores/{storeId}/products', {
      path: { storeId },
      query: { q: 'بیک' },
    });
    const product = await api.get('/api/v1/stores/{storeId}/products/{productId}', {
      path: { storeId, productId: products.items[0]!.id },
    });
    const line = {
      storeProductId: product.id,
      storeProductUnitId: product.units[0]!.id,
      quantity: '2',
      unitCostAmount: '0',
      costStatus: 'Known' as const,
    };
    const quick = (body: object, operationId = newOperationId()) =>
      api.post('/api/v1/stores/{storeId}/purchases/quick', {
        path: { storeId },
        body: { kind: 'Purchase', line, supplierId: null, supplierInvoiceNo: null, ...body } as never,
        operationId,
      });
    await expect(quick({})).rejects.toMatchObject({ code: 'ZERO_COST_REASON_REQUIRED' });
    const key = newOperationId();
    const gift = await quick({ line: { ...line, zeroCostReason: 'هدیه' }, sideChargeAmount: '0' }, key);
    expect(gift).toMatchObject({ status: 'Finalized', sideChargeAmount: '0' });
    expect(gift.lines[0]!.zeroCostReason).toBe('هدیه');
    expect(gift.documentDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const replay = await quick({ line: { ...line, zeroCostReason: 'هدیه' }, sideChargeAmount: '0' }, key);
    expect(replay.id).toBe(gift.id);
    await expect(
      quick({ line: { ...line, unitCostAmount: null, costStatus: 'Unknown' }, shippingAmount: '1000' }),
    ).rejects.toMatchObject({
      code: 'COST_REQUIRED',
    });
    await expect(
      quick({ kind: 'Opening', line: { ...line, unitCostAmount: null, costStatus: 'Unknown' } }),
    ).rejects.toMatchObject({
      code: 'OPENING_NOT_ALLOWED',
    });
  });
});
