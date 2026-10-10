import { decimal, money } from '@dukani/domain';
import { conversionText, costPerBase, newDraft, stepsOf, toRegisterRequest } from './entry-draft';
import type { EntryDraft } from './entry-draft.types';

const newPen = (): EntryDraft => ({
  ...newDraft('d1', { source: 'new', title: 'خودکار بیک آبی مدل A' }),
  newItem: {
    title: 'خودکار بیک آبی مدل A',
    productTypeId: 'pt',
    productTypeName: 'خودکار',
    brandStatus: 'Known',
    brandId: 'bic',
    brandName: 'بیک',
    baseUnitId: 'piece',
    baseUnitName: 'عدد',
    baseUnitMaxDecimals: 0,
    baseBarcode: ' ',
    attributes: [{ attributeId: 'color', optionIds: ['blue'] }],
    packagings: [{ name: 'بسته', baseQty: decimal.of(20) }],
  },
  stock: {
    kind: 'Opening',
    unitKey: 'pack:1',
    quantity: decimal.of(3),
    costStatus: 'Known',
    unitCost: money(160000),
    supplierId: 'ignored-for-opening',
    supplierName: null,
    supplierInvoiceNo: 'X',
    productionDate: null,
    expiryDate: null,
  },
  pricing: {
    method: 'Markup',
    manualPrice: null,
    markupPercent: decimal.of(25),
    fixedProfit: null,
    roundingStep: money(500),
  },
});

describe('entry draft', () => {
  it('has the Figma step order for a new item', () => {
    expect(stepsOf(newPen())).toEqual(['details', 'units', 'stock', 'pricing', 'review']);
  });

  it('skips pricing for a product already in the store', () => {
    const d = newDraft('d2', {
      source: 'catalog',
      catalog: {
        id: 'c',
        title: 't',
        typeName: 'x',
        brandName: null,
        baseUnitName: 'عدد',
        baseUnitMaxDecimals: 0,
        units: [],
        storeProductId: 'sp',
      },
    });
    expect(stepsOf(d)).toEqual(['details', 'stock', 'review']);
  });

  it('explains pack conversion and base cost (F12)', () => {
    expect(conversionText(newPen())).toBe('۳ بسته × ۲۰ = ۶۰ عدد');
    expect(costPerBase(newPen())).toEqual(money(8000));
  });

  it('maps to the backend request without floats or unit conversion (BCR-01)', () => {
    const r = toRegisterRequest(newPen());
    expect(r.newCatalogItem).toMatchObject({
      title: 'خودکار بیک آبی مدل A',
      brandId: 'bic',
      baseBarcode: null,
      packagings: [{ name: 'بسته', baseQty: '20' }],
    });
    expect(r.stock).toMatchObject({
      kind: 'Opening',
      unit: { newItemUnitIndex: 1 },
      quantity: '3',
      unitCostAmount: '160000',
      supplierId: null,
      supplierInvoiceNo: null,
    });
    expect(r.pricing).toEqual({
      method: 'Markup',
      manualPriceAmount: null,
      markupPercent: '25',
      fixedProfitAmount: null,
      roundingStepAmount: '500',
      roundingDirection: 'Nearest',
    });
  });
});

it('starts a new item with the selected type and its suggested unit', () => {
  const draft = newDraft('preset', {
    source: 'new',
    productType: {
      id: 'type',
      name: 'Weighted product',
      baseUnit: { id: 'kg', name: 'Kilogram', maxDecimals: 3 },
    },
  });
  expect(draft.newItem).toMatchObject({
    productTypeId: 'type',
    baseUnitId: 'kg',
    baseUnitMaxDecimals: 3,
    attributes: [],
  });
});

it('preserves image identifiers when mapping the host draft to registration', () => {
  const draft = newPen();
  const images = ['image-a', 'image-b'];
  expect(
    toRegisterRequest({ ...draft, newItem: { ...draft.newItem!, imageFileIds: images } }).newCatalogItem
      ?.imageFileIds,
  ).toEqual(images);
});
