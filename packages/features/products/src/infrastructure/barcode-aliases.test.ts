import { createMemoryDraftStore } from '@dukani/platform';
import { createBarcodeAliasDrafts } from './barcode-aliases';
import { newOperationId } from '@dukani/domain';
it('serializes form writes and isolates user, store, product and confirmed intent', async () => {
  const storage = createMemoryDraftStore();
  let actor = 'alice';
  const repo = createBarcodeAliasDrafts(storage, () => actor);
  const form = { schemaVersion: 1 as const, unitId: 'pack', barcode: '00123457' };
  const first = repo.writeForm('store', 'product', { ...form, barcode: 'draft' });
  const second = repo.writeForm('store', 'product', form);
  expect(await repo.readForm('store', 'product')).toEqual(form);
  await Promise.all([first, second]);
  const intent = {
    schemaVersion: 1 as const,
    operationId: newOperationId(),
    payload: {
      storeProductUnitId: 'pack',
      barcode: form.barcode,
      expectedVersion: 3,
      previewToken: 'preview',
    },
  };
  await repo.write('store', 'product', intent);
  await repo.removeForm('store', 'product');
  expect(await repo.read('store', 'product')).toEqual(intent);
  expect(await repo.readForm('store', 'product')).toBeNull();
  actor = 'bob';
  expect(await repo.read('store', 'product')).toBeNull();
  actor = 'alice';
  expect(await repo.read('other', 'product')).toBeNull();
  expect(await repo.read('store', 'other')).toBeNull();
});
it('rejects unsupported saved schema without destroying the draft', async () => {
  const storage = createMemoryDraftStore();
  const repo = createBarcodeAliasDrafts(storage, () => 'alice');
  const scope = { userId: 'alice', storeId: 'store', flow: 'product-barcode-alias-form', id: 'product' };
  await storage.put(scope, { schemaVersion: 2, barcode: '00123457' });
  await expect(repo.readForm('store', 'product')).rejects.toMatchObject({ code: 'DRAFT_SCHEMA_UNSUPPORTED' });
  expect((await storage.get<{ schemaVersion: number }>(scope))?.data.schemaVersion).toBe(2);
});
