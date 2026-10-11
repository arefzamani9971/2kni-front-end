import { decimal } from '@dukani/domain';
import { directScanMatch, scannedRow } from './bulk-scan';
import { newDraft } from './entry-draft';

const goods = { itemKind: 'Goods', unitActive: true, catalogStatus: 'Public', storeProductStatus: 'Active' };

describe('bulk scan routing', () => {
  it('adds directly only one active goods unit of this store', () => {
    expect(directScanMatch({ kind: 'StoreProduct', matches: [goods] })).toBe(goods);
  });
  it.each([
    ['catalog only', { kind: 'GlobalCatalog', matches: [goods] }],
    ['several matches', { kind: 'StoreProduct', matches: [goods, goods] }],
    ['service', { kind: 'StoreProduct', matches: [{ ...goods, itemKind: 'Service' }] }],
    ['inactive unit', { kind: 'StoreProduct', matches: [{ ...goods, unitActive: false }] }],
    ['archived product', { kind: 'StoreProduct', matches: [{ ...goods, storeProductStatus: 'Archived' }] }],
    ['archived catalog item', { kind: 'StoreProduct', matches: [{ ...goods, catalogStatus: 'Archived' }] }],
  ])('sends %s to explicit selection', (_case, lookup) => {
    expect(directScanMatch(lookup)).toBeNull();
  });
  it('builds one received unit on the shared receipt with unknown cost', () => {
    const row = scannedRow('r1', newDraft('d1', { source: 'new' }), 'base', { kind: 'Opening' });
    expect(row).toMatchObject({ clientRowId: 'r1', entry: { stockDecided: true } });
    expect(row.entry.stock).toMatchObject({
      kind: 'Opening',
      unitKey: 'base',
      quantity: decimal.of(1),
      costStatus: 'Unknown',
    });
  });
});
