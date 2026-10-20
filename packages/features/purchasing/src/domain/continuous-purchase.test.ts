import { decimal, money } from '@dukani/domain';
import { afterRecorded, identifyProduct, newContinuousDraft } from './continuous-purchase';

const typed = {
  ...newContinuousDraft('2026-10-19', 'pen'),
  form: {
    ...newContinuousDraft('2026-10-19').form,
    unitId: 'pack',
    quantity: '3',
    unitCost: '200000',
    supplierId: 's',
    shipping: '100',
  },
};

describe('continuous purchase (CPB-06)', () => {
  it('identification only names the product and unit; typed quantity and cost stay for the seller to confirm', () => {
    const scanned = identifyProduct(typed, 'pen', 'box');
    expect(scanned.form).toMatchObject({ unitId: 'box', quantity: '3', unitCost: '200000' });
    expect(identifyProduct(typed, 'pen', null).form.unitId).toBe('pack');
    expect(identifyProduct(typed, 'notebook', null)).toMatchObject({
      productId: 'notebook',
      form: { unitId: '' },
    });
  });

  it('after a confirmed receipt nothing is carried over; the receipt stays viewable and the date is today', () => {
    const recorded = {
      id: 'r1',
      number: 7,
      kind: 'Purchase' as const,
      documentDate: '2026-10-18',
      supplierName: 's',
      title: 'pen',
      unitName: 'pack',
      quantity: decimal.of(3),
      qtyBase: decimal.of(60),
      costStatus: 'Known' as const,
      totalAmount: money(600_000),
    };
    const next = afterRecorded(recorded, '2026-10-19');
    expect(next).toMatchObject({ productId: null, pending: null, last: { id: 'r1', number: 7 } });
    expect(next.form).toEqual(newContinuousDraft('2026-10-19').form);
  });
});
