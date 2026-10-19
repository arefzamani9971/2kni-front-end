import { decimal, money } from '@dukani/domain';
import { entryUnitsOf, newDraft, toRegisterRequest } from './entry-draft';
import type { CatalogChoice, EntryDraft, EntryUnit } from './entry-draft.types';
import { checkPackRows } from './pack-rows';
import { forStockUnitReselection, initialStockUnit, stockUnitAvailable } from './stock-unit';
import { salePacksOf, unitPricesOf } from './unit-prices';

const unit = (key: string, name: string, baseQty: string, uses: Partial<EntryUnit> = {}): EntryUnit => ({
  key,
  name,
  baseQty: decimal.of(baseQty),
  ...uses,
});

/** A new pen with a sellable pack of 20 and a purchase-only carton of 240. */
const newPen = (): EntryDraft => {
  const draft = newDraft('d1', { source: 'new', title: 'خودکار' });
  return {
    ...draft,
    intent: 'compound',
    newItem: {
      ...draft.newItem!,
      baseUnitName: 'عدد',
      packagings: [
        { name: 'بسته ۲۰تایی', baseQty: decimal.of(20), isSellable: true, isPurchasable: true },
        { name: 'کارتن', baseQty: decimal.of(240), isSellable: false, isPurchasable: true },
      ],
    },
  };
};

const catalogChoice = (units: EntryUnit[], storeProductId: string | null = null): CatalogChoice => ({
  id: 'ci',
  title: 'خودکار',
  typeName: 'خودکار',
  brandName: null,
  baseUnitName: 'عدد',
  baseUnitMaxDecimals: 0,
  units,
  storeProductId,
});
const catalogPen = (storeProductId: string | null = null) => ({
  ...newDraft('d2', { source: 'catalog', catalog: catalogChoice([], storeProductId) }),
  catalog: catalogChoice(
    [
      unit('base', 'عدد', '1', { catalogItemUnitId: 'u0', isPurchasable: true, isSellable: true }),
      unit('unit:u1', 'بسته ۲۰تایی', '20', {
        catalogItemUnitId: 'u1',
        isPurchasable: true,
        isSellable: true,
      }),
      unit('unit:u2', 'جفت', '2', { catalogItemUnitId: 'u2', isPurchasable: false, isSellable: true }),
      unit('unit:u3', 'کارتن', '240', { catalogItemUnitId: 'u3', isPurchasable: true, isSellable: false }),
    ],
    storeProductId,
  ),
});

describe('package rows of a new item (F12 §5, §11)', () => {
  it('refuses what the server refuses and keeps the rows as typed', () => {
    const { errors, packs } = checkPackRows(
      [
        { name: ' ', baseQty: '20' },
        { name: 'عدد', baseQty: '2' }, // the base unit's own name
        { name: 'بسته', baseQty: '20.5' }, // a count base takes whole sizes
        { name: 'بسته ي', baseQty: '1000000001' }, // above 10⁹
        { name: 'جعبه', baseQty: '12', barcode: '12 34' },
        { name: 'نمایشی', baseQty: '2', isSellable: false, isPurchasable: false },
        { name: 'بستهٔ ده', baseQty: '10' },
        { name: '  بستهٔ ده ', baseQty: '20' }, // the same name after normalization
      ],
      'عدد',
      0,
    );
    expect(errors).toEqual([
      'name',
      'duplicate',
      'quantity',
      'quantity',
      'barcode',
      'uses',
      undefined,
      'duplicate',
    ]);
    expect(packs).toBeNull();
  });

  it('takes decimal sizes of a weighed base unit and keeps each use as chosen', () => {
    const { errors, packs } = checkPackRows(
      [{ name: 'کیسه ۲٫۵ کیلویی', baseQty: '۲٫۵', isSellable: false, isPurchasable: true }],
      'کیلوگرم',
      3,
    );
    expect(errors).toEqual([undefined]);
    expect(packs).toEqual([
      { name: 'کیسه ۲٫۵ کیلویی', baseQty: '2.5', barcode: undefined, isSellable: false, isPurchasable: true },
    ]);
  });
});

describe('purchase and sale uses stay apart (F12 AC02)', () => {
  it('offers purchase units for stock and sale packages for prices', () => {
    expect(entryUnitsOf(newPen()).map((u) => u.key)).toEqual(['base', 'pack:1', 'pack:2']);
    expect(salePacksOf(newPen()).map((u) => u.key)).toEqual(['pack:1']);
    const catalog = catalogPen();
    expect(entryUnitsOf(catalog).map((u) => u.key)).toEqual(['base', 'unit:u1', 'unit:u3']); // the pair is sale-only
    expect(salePacksOf(catalog).map((u) => u.key)).toEqual(['unit:u1', 'unit:u2']); // the carton is purchase-only
    expect(salePacksOf(catalogPen('sp1'))).toEqual([]); // a product in the store is priced on its page
  });
});

describe('explicit package prices (F12 §10, scenario 10)', () => {
  const priced = (d: EntryDraft): EntryDraft => ({
    ...d,
    unitPrices: [{ unitKey: 'pack:1', name: 'بسته ۲۰تایی', baseQty: decimal.of(20), price: money(190000) }],
  });

  it('sends 190,000 for the pack, not 20 × 10,000', () => {
    const body = toRegisterRequest(priced(newPen()));
    expect(body.unitPrices).toEqual([{ unit: { newItemUnitIndex: 1 }, salePriceAmount: '190000' }]);
  });

  it('drops a price whose package changed or left, and sends none for identity-only drafts', () => {
    const changed = priced(newPen());
    const resized: EntryDraft = {
      ...changed,
      newItem: {
        ...changed.newItem!,
        packagings: [{ ...changed.newItem!.packagings[0]!, baseQty: decimal.of(24) }],
      },
    };
    expect(unitPricesOf(resized)).toEqual([]);
    expect('unitPrices' in toRegisterRequest(resized)).toBe(false);
    expect('unitPrices' in toRegisterRequest({ ...priced(newPen()), intent: 'standalone' })).toBe(false);
  });

  it('refers to a catalog package by its id', () => {
    const d: EntryDraft = {
      ...catalogPen(),
      unitPrices: [{ unitKey: 'unit:u2', name: 'جفت', baseQty: decimal.of(2), price: money(19000) }],
    };
    expect(toRegisterRequest(d).unitPrices).toEqual([
      { unit: { catalogItemUnitId: 'u2' }, salePriceAmount: '19000' },
    ]);
  });
});

describe('the stock unit is never switched silently (F12 §12, AC07)', () => {
  const units = entryUnitsOf(catalogPen());

  it('starts with the held unit, else the scanned package, else the first purchase unit', () => {
    const held = { ...catalogPen(), stock: { ...stock(), unitKey: 'unit:u3' } };
    expect(initialStockUnit(held, units, 'Purchase')).toEqual({ key: 'unit:u3', notice: null });
    const scanned = { ...catalogPen(), scanContext: match('u1') };
    expect(initialStockUnit(scanned, units, 'Purchase')).toEqual({ key: 'unit:u1', notice: null });
    expect(initialStockUnit(catalogPen(), units, 'Purchase')).toEqual({ key: 'base', notice: null });
  });

  it('asks again for a stale unit or a scanned sale-only package', () => {
    const stale = { ...catalogPen(), stock: { ...stock(), unitKey: 'unit:gone' } };
    expect(initialStockUnit(stale, units, 'Purchase')).toEqual({ key: '', notice: 'stale' });
    expect(stockUnitAvailable(stale, units)).toBe(false);
    const saleOnly = { ...catalogPen(), scanContext: match('u2') };
    expect(initialStockUnit(saleOnly, units, 'Purchase')).toEqual({ key: '', notice: 'scan' });
    // the request never names the base unit for a unit nobody chose
    const unchosen = { ...catalogPen(), stock: { ...stock(), unitKey: '' } };
    expect(toRegisterRequest(unchosen).stock?.unit).toEqual({});
  });

  it('clears the refused unit and takes the units read again', () => {
    const stale = { ...catalogPen(), stock: { ...stock(), unitKey: 'unit:u1' } };
    const fresh = [unit('base', 'عدد', '1', { catalogItemUnitId: 'u0', isPurchasable: true })];
    const next = forStockUnitReselection(stale, { units: fresh, storeProductVersion: 9 });
    expect(next.stock?.unitKey).toBe('');
    expect(next.catalog?.units).toEqual(fresh);
    expect(next.catalog?.storeProductVersion).toBe(9);
    expect(initialStockUnit(next, entryUnitsOf(next), 'Purchase')).toEqual({ key: '', notice: 'stale' });
  });
});

function stock(): NonNullable<EntryDraft['stock']> {
  return {
    kind: 'Purchase',
    unitKey: 'base',
    quantity: decimal.of(3),
    costStatus: 'Known',
    unitCost: money(1000),
    supplierId: null,
    supplierName: null,
    supplierInvoiceNo: '',
    productionDate: null,
    expiryDate: null,
  };
}

function match(catalogItemUnitId: string): NonNullable<EntryDraft['scanContext']> {
  return {
    catalogItemId: 'ci',
    catalogItemUnitId,
    title: 'خودکار',
    unitName: catalogItemUnitId,
    baseQty: '1',
    catalogStatus: 'Public',
    itemKind: 'Goods',
  };
}
