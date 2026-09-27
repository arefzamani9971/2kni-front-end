import type { Dto } from '@dukani/contracts';
import { seedId } from './ids';
import { seedCatalogItems, storeTypes, type CatalogItemRecord } from './reference';
import type { MockState, PurchaseRecord, StoreProductRecord, StoreProductUnitRecord } from './state';

/** FIXTURE-01 of the product docs: one owner with the store «نوشت‌افزار آفتاب». */
export const FIXTURE = {
  ownerMobile: '09123456789',
  newUserMobile: '09120000000',
  /** Mock OTP code (also returned as `devCode`, like the backend in Development). */
  otpCode: '123456',
  ownerId: seedId('user:owner'),
  storeId: seedId('store:aftab'),
  storeName: 'نوشت‌افزار آفتاب',
  supplierAlborzId: seedId('supplier:alborz'),
  supplierMehrId: seedId('supplier:mehr'),
} as const;

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number, hour = 10) => {
  const d = new Date(Date.now() - offsetDays * day);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
};

export const storeUnitsFor = (item: CatalogItemRecord, basePrice: number | null, storeProductId: string): StoreProductUnitRecord[] =>
  item.units.map((u) => ({
    id: seedId(`spu:${storeProductId}:${u.id}`),
    catalogItemUnitId: u.id,
    name: u.name,
    baseQty: u.baseQty,
    salePrice: u.kind === 'Base' ? basePrice : null,
    isSellable: u.isSellable,
    barcodes: u.barcodes.map((b) => b.code),
  }));

const item = (key: string) => {
  const found = seedCatalogItems.find((i) => i.id === seedId(`ci:${key}`));
  if (!found) throw new Error(`seed item ${key} missing`);
  return found;
};

type ProductSeed = {
  key: string;
  onHand: number;
  cost: number | null;
  costStatus: Dto<'CostStatus'>;
  pricing: Dto<'PriceRuleDto'>;
  price: number | null;
  low?: number;
};

const manual = (price: number): Dto<'PriceRuleDto'> => ({ method: 'Manual', manualPriceRials: price, roundingDirection: 'Nearest' });

const PRODUCTS: ProductSeed[] = [
  { key: 'item.bic_cristal_blue', onHand: 17, cost: 8000, costStatus: 'Known', pricing: manual(10000), price: 10000, low: 5 },
  {
    key: 'item.panter_pen_blue_07',
    onHand: 120,
    cost: 6500,
    costStatus: 'Known',
    pricing: { method: 'Markup', markupPercent: 30, roundingStepRials: 500, roundingDirection: 'Nearest' },
    price: 8500,
    low: 20,
  },
  { key: 'item.faber_colored_12', onHand: 2, cost: 185000, costStatus: 'Known', pricing: manual(240000), price: 240000, low: 3 },
  { key: 'item.papco_notebook_100', onHand: 45, cost: null, costStatus: 'Unknown', pricing: manual(65000), price: 65000 },
  { key: 'item.a4_paper_ream', onHand: 0, cost: 310000, costStatus: 'Known', pricing: manual(385000), price: 385000, low: 2 },
  {
    key: 'item.owner_eraser',
    onHand: 60,
    cost: 4000,
    costStatus: 'Estimated',
    pricing: { method: 'FixedProfit', fixedProfitRials: 2000, roundingDirection: 'Nearest' },
    price: 6000,
  },
];

export const createFixtureState = (): MockState => {
  const { storeId, ownerId } = FIXTURE;
  const storeProducts: StoreProductRecord[] = PRODUCTS.map((p, i) => {
    const ci = item(p.key);
    const id = seedId(`sp:${p.key}`);
    return {
      id,
      storeId,
      catalogItemId: ci.id,
      localTitle: null,
      localNote: null,
      sku: `P${String(i + 1).padStart(5, '0')}`,
      onHand: p.onHand,
      reserved: 0,
      averageCost: p.cost,
      costStatus: p.costStatus,
      pricing: p.pricing,
      baseSalePrice: p.price,
      lowStockThreshold: p.low ?? null,
      units: storeUnitsFor(ci, p.price, id),
      status: 'Active',
      version: 1,
      createdAt: iso(20),
    };
  });
  const sp = (key: string) => storeProducts.find((p) => p.id === seedId(`sp:${key}`))!;
  const baseUnit = (p: StoreProductRecord) => p.units.find((u) => u.baseQty === 1) ?? p.units[0]!;

  const purchases: PurchaseRecord[] = [
    {
      id: seedId('purchase:1'),
      storeId,
      number: 1,
      kind: 'Opening',
      status: 'Finalized',
      supplierId: null,
      supplierInvoiceNo: null,
      purchasedAt: iso(20),
      discount: 0,
      shipping: 0,
      nonRecoverableTax: 0,
      note: 'موجودی اول دوره',
      lines: [sp('item.faber_colored_12'), sp('item.papco_notebook_100'), sp('item.owner_eraser')].map((p, i) => ({
        id: seedId(`pl:1:${i}`),
        storeProductId: p.id,
        storeProductUnitId: baseUnit(p).id,
        quantity: p.onHand + 5,
        unitCost: p.averageCost,
        costStatus: p.costStatus,
        productionDate: null,
        expiryDate: null,
        manufacturerPrice: null,
        printedPrice: null,
      })),
      attachmentFileIds: [],
      finalizedAt: iso(20),
      version: 2,
      createdAt: iso(20),
    },
    {
      id: seedId('purchase:2'),
      storeId,
      number: 2,
      kind: 'Purchase',
      status: 'Finalized',
      supplierId: FIXTURE.supplierAlborzId,
      supplierInvoiceNo: '۱۴۰۵-۲۳۱',
      purchasedAt: iso(2),
      discount: 50000,
      shipping: 0,
      nonRecoverableTax: 0,
      note: null,
      lines: [
        { p: sp('item.bic_cristal_blue'), qty: 20, cost: 8000 },
        { p: sp('item.panter_pen_blue_07'), qty: 120, cost: 6500 },
      ].map(({ p, qty, cost }, i) => ({
        id: seedId(`pl:2:${i}`),
        storeProductId: p.id,
        storeProductUnitId: baseUnit(p).id,
        quantity: qty,
        unitCost: cost,
        costStatus: 'Known' as const,
        productionDate: null,
        expiryDate: null,
        manufacturerPrice: null,
        printedPrice: null,
      })),
      attachmentFileIds: [],
      finalizedAt: iso(2),
      version: 2,
      createdAt: iso(2),
    },
    {
      id: seedId('purchase:3'),
      storeId,
      number: null,
      kind: 'Purchase',
      status: 'Draft',
      supplierId: FIXTURE.supplierMehrId,
      supplierInvoiceNo: null,
      purchasedAt: iso(0),
      discount: 0,
      shipping: 0,
      nonRecoverableTax: 0,
      note: null,
      lines: [
        {
          id: seedId('pl:3:0'),
          storeProductId: sp('item.a4_paper_ream').id,
          storeProductUnitId: baseUnit(sp('item.a4_paper_ream')).id,
          quantity: 10,
          unitCost: 310000,
          costStatus: 'Known',
          productionDate: null,
          expiryDate: null,
          manufacturerPrice: null,
          printedPrice: null,
        },
      ],
      attachmentFileIds: [],
      finalizedAt: null,
      version: 1,
      createdAt: iso(0, 9),
    },
  ];

  return {
    schema: 1,
    users: [{ id: ownerId, mobile: FIXTURE.ownerMobile, displayName: 'علی رضایی', defaultStoreId: storeId, platformRoles: [] }],
    otps: [],
    sessions: [],
    stores: [
      {
        id: storeId,
        name: FIXTURE.storeName,
        storeTypeId: storeTypes.find((t) => t.key === 'stationery')!.id,
        businessMode: 'Retail',
        phone: '02144556677',
        email: null,
        timeZoneId: 'Asia/Tehran',
        createdAt: iso(30),
      },
    ],
    members: [{ storeId, userId: ownerId, role: 'Owner', permissions: [] }],
    productTypes: [],
    brands: [],
    catalogItems: [],
    storeProducts,
    suppliers: [
      { id: FIXTURE.supplierAlborzId, storeId, name: 'پخش نوشت‌افزار البرز', phone: '02188776655', note: null, isArchived: false },
      { id: FIXTURE.supplierMehrId, storeId, name: 'بازرگانی مهر', phone: '09121112233', note: null, isArchived: false },
    ],
    purchases,
    operations: [],
    files: [],
    sequences: { [`${storeId}:sku`]: storeProducts.length, [`${storeId}:purchase`]: 2 },
  };
};
