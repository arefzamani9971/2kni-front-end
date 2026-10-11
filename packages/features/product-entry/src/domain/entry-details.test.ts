import { decimal } from '@dukani/domain';
import { applyDetails, parseNetContent, switchKind } from './entry-details';
import { newDraft } from './entry-draft';
import type { EntryDraft } from './entry-draft.types';
import type { DetailsCommit } from './entry-details.types';

const draft = (kind: 'Goods' | 'Service' = 'Goods'): EntryDraft => ({
  ...newDraft('d1', { source: 'new', title: 'دفتر' }),
  newItem: {
    kind,
    title: 'دفتر',
    productTypeId: '',
    productTypeName: '',
    brandStatus: 'Unknown',
    brandId: null,
    brandName: null,
    baseUnitId: '',
    baseUnitName: '',
    baseUnitMaxDecimals: 0,
    baseBarcode: '6260000000017',
    attributes: [],
    packagings: [],
  },
});
const piece = { id: 'piece', name: 'عدد', maxDecimals: 0 };
const commit = (overrides: Partial<DetailsCommit> = {}): DetailsCommit => ({
  values: {
    title: 'دفتر ۱۰۰ برگ',
    baseUnitId: 'missing',
    barcode: '6260000000017',
    description: '',
    localTitle: '',
    localNote: 'قفسه ۲',
    shortcut: 'D1',
    serviceCost: { amount: decimal.of(5000) },
  },
  productType: {
    id: 'notebook',
    name: 'دفتر',
    defaultBaseUnit: piece,
    allowedUnits: [piece],
    defaultPackagings: [{ name: 'بسته', baseQty: '10' }],
  },
  brand: { id: 'b1', name: 'پاپکو' },
  brandStatus: 'Known',
  attributes: [{ attributeId: 'pages', number: decimal.of(100) }],
  netContent: { ok: true, value: null, unitId: null },
  ...overrides,
});

describe('details step model', () => {
  it('accepts empty net content and rejects a unit without an amount or a non-length unit', () => {
    expect(parseNetContent(' ', '', ['g'])).toEqual({ ok: true, value: null, unitId: null });
    expect(parseNetContent('', 'g', ['g'])).toEqual({ ok: false, field: 'netContentValue' });
    expect(parseNetContent('0', 'g', ['g'])).toEqual({ ok: false, field: 'netContentValue' });
    expect(parseNetContent('۲۵۰', 'piece', ['g'])).toEqual({ ok: false, field: 'netContentUnitId' });
    expect(parseNetContent('۲۵۰٫۵', 'g', ['g'])).toEqual({ ok: true, value: '250.5', unitId: 'g' });
  });
  it('writes the details, falls back to the default unit and suggests the type packages on first visit', () => {
    const next = applyDetails(draft(), commit());
    expect(next.newItem).toMatchObject({
      title: 'دفتر ۱۰۰ برگ',
      productTypeId: 'notebook',
      brandStatus: 'Known',
      brandId: 'b1',
      baseUnitId: 'piece',
      baseBarcode: '6260000000017',
      packagings: [{ name: 'بسته', baseQty: '10' }],
    });
    expect(next.localNote).toBe('قفسه ۲');
    expect(next.serviceCost).toBeNull();
  });
  it('keeps no barcode, packages or goods-only data for a service but keeps its cost', () => {
    const next = applyDetails(draft('Service'), commit());
    expect(next.newItem).toMatchObject({ baseBarcode: '', packagings: [] });
    expect(next.serviceCost).toEqual({ amount: '5000' });
  });
  it('drops stock, barcode and packages when switching to a service', () => {
    const next = switchKind({ ...draft(), stockDecided: false }, 'Service');
    expect(next).toMatchObject({ stock: null, stockDecided: true, lowStockThreshold: null });
    expect(next.newItem).toMatchObject({
      kind: 'Service',
      baseBarcode: '',
      packagings: [],
      submitForPublicReview: false,
    });
  });
});
