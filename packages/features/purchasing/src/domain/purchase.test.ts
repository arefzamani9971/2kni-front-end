import { decimal, money } from '@dukani/domain';
import { invoiceDifference, lineSummary, toLineInput } from './purchase';

describe('purchase rules', () => {
  it('summarizes a pack line like Figma 312:9194', () => {
    const s = lineSummary({ quantity: decimal.of(3), baseQtyPerUnit: decimal.of(20), unitName: 'بسته', baseUnitName: 'عدد', costStatus: 'Known', unitCost: money(120000) });
    expect(s.conversion).toBe('۳ × ۲۰ = ۶۰ عدد');
    expect(s.total).toEqual(money(360000));
    expect(s.perBase).toEqual(money(6000));
  });

  it('keeps unknown cost unknown (never zero)', () => {
    const s = lineSummary({ quantity: decimal.of(2), baseQtyPerUnit: decimal.of(1), unitName: 'عدد', baseUnitName: 'عدد', costStatus: 'Unknown', unitCost: null });
    expect(s.total).toBeNull();
    expect(
      toLineInput({ storeProductId: 'p', title: 't', baseUnitName: 'عدد', unitId: 'u', unitName: 'عدد', baseQtyPerUnit: decimal.of(1), quantity: decimal.of(2), costStatus: 'Unknown', unitCost: money(5), productionDate: null, expiryDate: null }),
    ).toMatchObject({ unitCostAmount: null, costStatus: 'Unknown', quantity: '2' });
  });

  it('compares the supplier invoice total', () => {
    expect(invoiceDifference('1800000', money(1_800_000))?.matches).toBe(true);
    expect(invoiceDifference('1800000', money(1_850_000))?.diff).toEqual(money(50000));
  });

});
