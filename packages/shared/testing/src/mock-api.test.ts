import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import type { AppError } from '@dukani/domain';
import { newOperationId } from '@dukani/domain';
import { compose, createApi, createFetchAdapter, withAuth, withErrorMapping, withIdempotency } from '@dukani/http';
import { FIXTURE } from './db/fixtures';
import { createMockServer } from './node';

const BASE = 'http://api.test';
const mock = createMockServer({ baseUrl: BASE });
let token: string | null = null;
const http = compose(
  createFetchAdapter({ baseUrl: BASE }),
  withIdempotency,
  withAuth({ getAccessToken: () => token, refresh: async () => false, onSessionExpired: () => undefined }),
  withErrorMapping,
);
const api = createApi(http);

beforeAll(() => mock.server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  mock.reset();
  token = null;
});
afterAll(() => mock.server.close());

const signIn = async (mobile: string = FIXTURE.ownerMobile) => {
  const otp = await api.post('/api/v1/auth/otp/request', { body: { mobile }, auth: false });
  const tokens = await api.post('/api/v1/auth/otp/verify', { body: { requestId: otp.requestId, code: otp.devCode! }, auth: false });
  token = tokens.accessToken;
  return tokens;
};

describe('mock backend through the real http stack', () => {
  it('logs in with OTP and lists the fixture store', async () => {
    const tokens = await signIn();
    expect(tokens.isNewUser).toBe(false);
    const mine = await api.get('/api/v1/stores', {});
    expect(mine.stores.map((s) => s.storeName)).toEqual([FIXTURE.storeName]);
  });

  it('maps wrong OTP to a business error with remaining attempts', async () => {
    const otp = await api.post('/api/v1/auth/otp/request', { body: { mobile: '۰۹۱۲۳۴۵۶۷۸۹' }, auth: false });
    expect(otp.mobileMasked).toBe('0912***6789');
    const e = await api.post('/api/v1/auth/otp/verify', { body: { requestId: otp.requestId, code: '000000' }, auth: false }).catch((x: AppError) => x);
    expect(e).toMatchObject({ code: 'OTP_WRONG', kind: 'BusinessRule' });
    expect((e as AppError).message).toContain('۴ تلاش');
  });

  it('rejects store routes without a session', async () => {
    const e = await api.get('/api/v1/stores/{storeId}', { path: { storeId: FIXTURE.storeId } }).catch((x: AppError) => x);
    expect(e).toMatchObject({ kind: 'Unauthorized' });
  });

  it('registers a new item with opening stock and pricing (F08–F16)', async () => {
    await signIn();
    const storeId = FIXTURE.storeId;
    const types = await api.get('/api/v1/stores/{storeId}/catalog/product-types', { path: { storeId }, query: { q: 'پاک‌کن' } });
    const type = await api.get('/api/v1/stores/{storeId}/catalog/product-types/{productTypeId}', { path: { storeId, productTypeId: types[0]!.id } });
    const newCatalogItem = {
      productTypeId: type.id,
      title: 'پاک‌کن نرم مدل آزمایشی',
      baseUnitId: type.defaultBaseUnit.id,
      brandStatus: 'Unknown' as const,
      packagings: [{ name: 'بسته ۲۰تایی', baseQty: 20, isSellable: true, isPurchasable: true }],
      submitForPublicReview: false,
      attributes: type.attributes.filter((a) => a.isRequired).map((a) => ({ attributeId: a.attributeId, optionIds: [a.options[0]!.id] })),
    };
    const request = {
      newCatalogItem,
      stock: { kind: 'Opening' as const, unit: { newItemUnitIndex: 1 }, quantity: 3, unitCostRials: 100000, costStatus: 'Known' as const },
      pricing: { method: 'Markup' as const, markupPercent: 25, roundingDirection: 'Nearest' as const },
    };
    const preview = await api.post('/api/v1/stores/{storeId}/product-entry/preview', { path: { storeId }, body: request });
    expect(preview).toMatchObject({ qtyBase: 60, costPerBaseRials: 5000, salePriceRials: 6250, isBelowCost: false });
    expect(preview.conversionText).toBe('۳ بسته ۲۰تایی × ۲۰ = ۶۰ عدد');

    const operationId = newOperationId();
    const result = await api.post('/api/v1/stores/{storeId}/product-entry/register', { path: { storeId }, body: request, operationId });
    expect(result).toMatchObject({ catalogItemCreated: true, onHand: 60, salePriceRials: 6250, sku: 'P00007' });
    // same operation id → same result, no second product
    const again = await api.post('/api/v1/stores/{storeId}/product-entry/register', { path: { storeId }, body: request, operationId });
    expect(again.storeProductId).toBe(result.storeProductId);
    const op = await api.get('/api/v1/stores/{storeId}/operations/{operationId}', { path: { storeId, operationId } });
    expect(op).toMatchObject({ status: 'Succeeded', resultId: result.storeProductId });

    const list = await api.get('/api/v1/stores/{storeId}/products', { path: { storeId }, query: { q: 'آزمایشی' } });
    expect(list.items).toHaveLength(1);
  });

  it('finalizes a purchase draft and moves stock with landed cost (F17–F21)', async () => {
    await signIn();
    const storeId = FIXTURE.storeId;
    const products = await api.get('/api/v1/stores/{storeId}/products', { path: { storeId }, query: { q: 'بیک' } });
    const product = await api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId: products.items[0]!.id } });
    const draft = await api.post('/api/v1/stores/{storeId}/purchases', {
      path: { storeId },
      body: { kind: 'Purchase', supplierId: FIXTURE.supplierAlborzId, supplierInvoiceNo: '۱۴۰۵-۲۳۱' },
    });
    const updated = await api.put('/api/v1/stores/{storeId}/purchases/{purchaseId}', {
      path: { storeId, purchaseId: draft.id },
      body: {
        supplierId: FIXTURE.supplierAlborzId,
        supplierInvoiceNo: '۱۴۰۵-۲۳۱',
        purchasedAt: new Date().toISOString(),
        discountRials: 10000,
        shippingRials: 0,
        nonRecoverableTaxRials: 0,
        lines: [{ storeProductId: product.id, storeProductUnitId: product.units[0]!.id, quantity: 10, unitCostRials: 9000, costStatus: 'Known' }],
        expectedVersion: draft.version,
      },
    });
    expect(updated.totalRials).toBe(80000);
    const totals = await api.get('/api/v1/stores/{storeId}/purchases/{purchaseId}/totals', { path: { storeId, purchaseId: draft.id } });
    expect(totals.duplicateOfPurchaseId).toBeTruthy();

    const finalize = (confirm: boolean) =>
      api.post('/api/v1/stores/{storeId}/purchases/{purchaseId}/finalize', {
        path: { storeId, purchaseId: draft.id },
        body: { expectedVersion: updated.version, confirmDuplicateInvoiceNo: confirm, duplicateReason: confirm ? 'فاکتور دوم همان روز' : null },
        operationId: newOperationId(),
      });
    await expect(finalize(false)).rejects.toMatchObject({ code: 'PURCHASE_DUPLICATE_INVOICE' });
    const done = await finalize(true);
    expect(done).toMatchObject({ status: 'Finalized', number: 3 });
    expect(done.lines[0]!.costPerBaseRials).toBe(8000);
    const after = await api.get('/api/v1/stores/{storeId}/products/{productId}', { path: { storeId, productId: product.id } });
    expect(after.onHand).toBe(product.onHand + 10);
  });

  it('reports version conflicts on stale drafts', async () => {
    await signIn();
    const storeId = FIXTURE.storeId;
    const draft = await api.post('/api/v1/stores/{storeId}/purchases', { path: { storeId }, body: { kind: 'Purchase' } });
    const e = await api
      .post('/api/v1/stores/{storeId}/purchases/{purchaseId}/finalize', {
        path: { storeId, purchaseId: draft.id },
        body: { expectedVersion: draft.version + 5, confirmDuplicateInvoiceNo: false },
        operationId: newOperationId(),
      })
      .catch((x: AppError) => x);
    expect(e).toMatchObject({ kind: 'Conflict', code: 'VERSION_CONFLICT' });
  });
});
