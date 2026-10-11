import { decimal, money } from '@dukani/domain';
import {
  conversionText,
  costPerBase,
  entryUnitsOf,
  newDraft,
  stepsOf,
  toRegisterRequest,
} from './entry-draft';
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
  it('keeps purchase-unit indexes when a non-purchasable packaging is omitted', () => {
    const original = newPen();
    const d = {
      ...original,
      newItem: {
        ...original.newItem!,
        packagings: [
          { name: 'display', baseQty: decimal.of(2), isPurchasable: false },
          { name: 'carton', baseQty: decimal.of(20), isSellable: false, isPurchasable: true },
        ],
      },
    };
    expect(entryUnitsOf(d).map((u) => u.key)).toEqual(['base', 'pack:2']);
    const body = toRegisterRequest({ ...d, stock: { ...d.stock!, unitKey: 'pack:2' } });
    expect(body.stock?.unit.newItemUnitIndex).toBe(2);
    expect(body.newCatalogItem?.packagings?.[0]?.isPurchasable).toBe(false);
    expect(body.newCatalogItem?.packagings?.[1]?.isSellable).toBe(false);
  });
  it('service skips inventory steps and uses its nullable service cost for pricing', () => {
    const d = {
      ...newDraft('service', { source: 'new' }),
      newItem: { ...newPen().newItem!, kind: 'Service' as const, baseBarcode: '', packagings: [] },
      serviceCost: money(80),
      shortcut: 'S1',
      localNote: 'note',
    };
    expect(stepsOf(d)).toEqual(['details', 'pricing', 'review']);
    expect(costPerBase(d)).toEqual(money(80));
    const body = toRegisterRequest(d);
    expect(body.stock).toBeNull();
    expect(body.serviceCostAmount).toBe('80');
    expect(body.newCatalogItem?.kind).toBe('Service');
    expect(body.localNote).toBe('note');
    expect(costPerBase({ ...d, serviceCost: null })).toBeNull();
  });
  it('maps all optional catalog, receipt and rounding fields without guessing defaults', () => {
    const d = newPen();
    const body = toRegisterRequest({
      ...d,
      newItem: {
        ...d.newItem!,
        netContentValue: decimal.of('2.5'),
        netContentUnitId: 'kg',
        description: 'desc',
        submitForPublicReview: true,
        imageFileIds: ['image'],
      },
      stock: { ...d.stock!, manufacturerPrice: money(100), printedPrice: money(200) },
      pricing: { ...d.pricing!, roundingDirection: 'Up' },
    });
    expect(body.stock?.manufacturerPriceAmount).toBe('100');
    expect(body.stock?.printedPriceAmount).toBe('200');
    expect(body.pricing?.roundingDirection).toBe('Up');
    expect(body.newCatalogItem?.netContentValue).toBe('2.5');
    expect(body.newCatalogItem?.submitForPublicReview).toBe(true);
    expect(body.lowStockThreshold).toBeNull();
  });
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
