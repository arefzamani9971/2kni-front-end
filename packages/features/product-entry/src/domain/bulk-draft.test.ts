import { describe, expect, it } from 'vitest';
import { decimal } from '@dukani/domain';
import {
  acceptBulkScan,
  appendBulkRow,
  undoBulkScan,
  toBulkRequest,
  type BulkDraft,
  type BulkRow,
} from './bulk-draft';
import { newDraft } from './entry-draft';
const draft = (): BulkDraft => ({
  schemaVersion: 1,
  id: 'b',
  updatedAt: '',
  rows: [],
  sharedReceipt: { kind: 'Purchase' },
});
const row = (id: string, unitKey = 'unit:pack'): BulkRow => ({
  clientRowId: id,
  entry: {
    ...newDraft(id, {
      source: 'catalog',
      catalog: {
        id: 'pen',
        title: 'Pen',
        typeName: '',
        brandName: null,
        baseUnitName: 'piece',
        baseUnitMaxDecimals: 0,
        storeProductId: 'p',
        units: [{ key: 'unit:pack', name: 'Pack', baseQty: decimal.of(20), catalogItemUnitId: 'pack' }],
      },
    }),
    stock: {
      kind: 'Purchase',
      unitKey,
      quantity: decimal.of(1),
      costStatus: 'Unknown',
      unitCost: null,
      supplierId: null,
      supplierName: null,
      supplierInvoiceNo: '',
      productionDate: null,
      expiryDate: null,
    },
  },
});
describe('bulk scan mutations', () => {
  it('increments the selected unit, and Undo restores only the last mutation', () => {
    const first = acceptBulkScan(draft(), row('a'));
    const second = acceptBulkScan(first, row('b'));
    expect(second.rows).toHaveLength(1);
    expect(second.rows[0]?.entry.stock?.quantity).toBe('2');
    const undone = undoBulkScan(second);
    expect(undone.rows[0]?.entry.stock?.quantity).toBe('1');
    expect(undoBulkScan(undone)).toBe(undone);
    expect(undoBulkScan(first).rows).toHaveLength(0);
  });
  it('retains different unit lines and stable correlation IDs', () => {
    const value = acceptBulkScan(acceptBulkScan(draft(), row('a')), row('b', 'base'));
    expect(value.rows).toHaveLength(2);
    expect(toBulkRequest(value).rows.map((r) => r.clientRowId)).toEqual(['a', 'b']);
    expect(toBulkRequest(value).rows[0]?.registration.stock?.unit).toEqual({ catalogItemUnitId: 'pack' });
  });
  it('cannot undo committed rows or mutate an uncertain operation', () => {
    const value = { ...acceptBulkScan(draft(), row('a')), result: { results: [], purchaseId: null } };
    expect(undoBulkScan(value)).toBe(value);
    expect(acceptBulkScan(value, row('b'))).toBe(value);
  });
});

describe('bulk row contract', () => {
  it('rejects over 200 rows and treats replay of the same client row as a no-op', () => {
    const one = appendBulkRow(draft(), row('a'));
    expect(appendBulkRow(one, row('a'))).toBe(one);
    const full = { ...draft(), rows: Array.from({ length: 200 }, (_, i) => row(String(i))) };
    expect(() => appendBulkRow(full, row('new'))).toThrow('BULK_ROW_LIMIT');
  });
  it('applies the explicitly chosen shared receipt to each row without replacing its quantity or cost', () => {
    const base = acceptBulkScan(draft(), row('a'));
    const request = toBulkRequest({
      ...base,
      sharedReceipt: { kind: 'Opening', supplierId: null, supplierInvoiceNo: null },
    });
    expect(request.rows[0]?.registration.stock?.kind).toBe('Opening');
    expect(request.rows[0]?.registration.stock?.quantity).toBe('1');
    expect(request.rows[0]?.registration.stock?.supplierId).toBeNull();
  });
});
