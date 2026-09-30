import { detailRows, parseFilter, productLine } from './product';

describe('product presentation', () => {
  it('formats a list row with Persian digits and toman', () => {
    expect(
      productLine({ id: '1', title: 't', sku: 'P1', productTypeName: 'x', baseUnitName: 'عدد', onHand: '17', available: '17', baseSalePriceAmount: '10000', costStatus: 'Known', isLowStock: false, status: 'Active', kind: 'Goods' }),
    ).toBe('۱۷ عدد · ۱۰٬۰۰۰ تومان');
  });

  it('describes packs and prices on the detail (Figma 312:9534)', () => {
    const rows = detailRows({
      id: '1', catalogItemId: 'c', title: 't', catalogTitle: 't', sku: 'P1', catalogStatus: 'Public', productTypeName: 'خودکار',
      baseUnitName: 'عدد', baseUnitMaxDecimals: 0, onHand: '17', reserved: '0', available: '17', averageCostAmount: '8000', costStatus: 'Known',
      pricing: { method: 'Manual', manualPriceAmount: '10000', roundingDirection: 'Nearest' }, baseSalePriceAmount: '10000', isBelowCost: false,
      noReorder: false, status: 'Active', version: 1, kind: 'Goods', allowPreOrder: false,
      units: [
        { id: 'u1', name: 'عدد', baseQty: '1', salePriceAmount: '10000', effectivePriceAmount: '10000', isSellable: true, barcodes: [] },
        { id: 'u2', name: 'بسته', baseQty: '20', salePriceAmount: '190000', effectivePriceAmount: '190000', isSellable: true, barcodes: [] },
      ],
    });
    expect(rows.slice(0, 3)).toEqual(['۱۷ عدد قابل‌فروش', 'هر بسته = ۲۰ عدد', 'فروش تکی ۱۰٬۰۰۰ تومان · بسته ۱۹۰٬۰۰۰ تومان']);
  });

  it('reads filters from the URL', () => {
    expect(parseFilter({ stock: 'Low', cost: 'x' })).toEqual({ q: '', stock: 'Low', cost: 'Any' });
  });
});
