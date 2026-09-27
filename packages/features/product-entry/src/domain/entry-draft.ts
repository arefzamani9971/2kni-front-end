import type { Dto } from '@dukani/contracts';
import {
  decimal,
  formatDecimalFa,
  moneyOps,
  money,
  toApiMoney,
  toBaseQuantity,
  type DecimalString,
  type Money,
} from '@dukani/domain';

/**
 * Product entry wizard (F08–F16) kept as a local draft until «تأیید و ثبت». All numbers are canonical
 * decimal strings (never floats); money is converted to the API only in `toRegisterRequest`.
 */
export type EntrySource = 'catalog' | 'new';

export type EntryUnit = { readonly key: string; readonly name: string; readonly baseQty: DecimalString; readonly catalogItemUnitId?: string };

export type CatalogChoice = {
  readonly id: string;
  readonly title: string;
  readonly typeName: string;
  readonly brandName: string | null;
  readonly baseUnitName: string;
  readonly baseUnitMaxDecimals: number;
  readonly units: readonly EntryUnit[];
  /** Already in this store: registering adds stock to it (backend keeps its price). */
  readonly storeProductId: string | null;
};

export type AttributeValue = {
  readonly attributeId: string;
  readonly optionIds?: readonly string[];
  readonly text?: string;
  readonly number?: DecimalString;
  readonly bool?: boolean;
};

export type Packaging = { readonly name: string; readonly baseQty: DecimalString; readonly barcode?: string };

export type NewItem = {
  readonly title: string;
  readonly productTypeId: string;
  readonly productTypeName: string;
  readonly brandStatus: Dto<'BrandStatus'>;
  readonly brandId: string | null;
  readonly brandName: string | null;
  readonly baseUnitId: string;
  readonly baseUnitName: string;
  readonly baseUnitMaxDecimals: number;
  readonly baseBarcode: string;
  readonly attributes: readonly AttributeValue[];
  readonly packagings: readonly Packaging[];
};

export type CostStatus = Dto<'CostStatus'>;

export type StockEntry = {
  readonly kind: Dto<'PurchaseKind'>;
  /** `base` or `pack:<index>` (new item) / `unit:<catalogItemUnitId>` (catalog item). */
  readonly unitKey: string;
  readonly quantity: DecimalString;
  readonly costStatus: CostStatus;
  readonly unitCost: Money | null;
  readonly supplierId: string | null;
  readonly supplierName: string | null;
  readonly supplierInvoiceNo: string;
  readonly productionDate: string | null;
  readonly expiryDate: string | null;
};

export type PriceMethod = Dto<'PriceMethod'>;

export type Pricing = {
  readonly method: PriceMethod;
  readonly manualPrice: Money | null;
  readonly markupPercent: DecimalString | null;
  readonly fixedProfit: Money | null;
  readonly roundingStep: Money | null;
};

export type EntryResult = Dto<'RegisterProductResultDto'> & { readonly title: string; readonly baseUnitName: string; readonly catalogStatus: 'Private' | 'Public' };

export type EntryDraft = {
  readonly id: string;
  readonly source: EntrySource;
  readonly catalog: CatalogChoice | null;
  readonly localTitle: string;
  readonly newItem: NewItem | null;
  /** null = no stock now (stock is optional in the backend). */
  readonly stock: StockEntry | null;
  readonly stockDecided: boolean;
  readonly pricing: Pricing | null;
  readonly lowStockThreshold: DecimalString | null;
  /** One id for the whole «تأیید و ثبت» action; retries reuse it (P11). */
  readonly operationId: string | null;
  readonly result: EntryResult | null;
};

export type EntryStep = 'details' | 'units' | 'stock' | 'pricing' | 'review' | 'done';

export const emptyNewItem = (title = '', baseBarcode = ''): NewItem => ({
  title,
  productTypeId: '',
  productTypeName: '',
  brandStatus: 'Unknown',
  brandId: null,
  brandName: null,
  baseUnitId: '',
  baseUnitName: '',
  baseUnitMaxDecimals: 0,
  baseBarcode,
  attributes: [],
  packagings: [],
});

export const newDraft = (id: string, init: { source: 'new'; title?: string; barcode?: string } | { source: 'catalog'; catalog: CatalogChoice }): EntryDraft => ({
  id,
  source: init.source,
  catalog: init.source === 'catalog' ? init.catalog : null,
  localTitle: '',
  newItem: init.source === 'new' ? emptyNewItem(init.title, init.barcode) : null,
  stock: null,
  stockDecided: false,
  pricing: null,
  lowStockThreshold: null,
  operationId: null,
  result: null,
});

/** Steps of a draft: new items define units; existing store products skip pricing (price page owns it). */
export const stepsOf = (d: EntryDraft): EntryStep[] => {
  const steps: EntryStep[] = ['details'];
  if (d.source === 'new') steps.push('units');
  steps.push('stock');
  if (!d.catalog?.storeProductId) steps.push('pricing');
  steps.push('review');
  return steps;
};

export const nextStep = (d: EntryDraft, current: EntryStep): EntryStep => {
  const steps = stepsOf(d);
  return steps[steps.indexOf(current) + 1] ?? 'review';
};

export const previousStep = (d: EntryDraft, current: EntryStep): EntryStep | null => {
  const steps = stepsOf(d);
  const i = steps.indexOf(current);
  return i > 0 ? steps[i - 1]! : null;
};

export const titleOf = (d: EntryDraft): string => d.localTitle.trim() || d.catalog?.title || d.newItem?.title.trim() || '';
export const baseUnitNameOf = (d: EntryDraft): string => d.catalog?.baseUnitName ?? d.newItem?.baseUnitName ?? '';
export const maxDecimalsOf = (d: EntryDraft): number => d.catalog?.baseUnitMaxDecimals ?? d.newItem?.baseUnitMaxDecimals ?? 0;

/** Units the stock can be entered in: base + packagings (F12). */
export const entryUnitsOf = (d: EntryDraft): EntryUnit[] => {
  if (d.catalog) return [...d.catalog.units];
  const base: EntryUnit = { key: 'base', name: d.newItem?.baseUnitName ?? '', baseQty: decimal.of(1) };
  return [base, ...(d.newItem?.packagings ?? []).map((p, i) => ({ key: `pack:${i + 1}`, name: p.name, baseQty: p.baseQty }))];
};

/** «۳ بسته × ۲۰ = ۶۰ عدد» (same text as the backend preview). */
export const conversionText = (d: EntryDraft): string | null => {
  const s = d.stock;
  if (!s) return null;
  const unit = entryUnitsOf(d).find((u) => u.key === s.unitKey);
  if (!unit) return null;
  const base = baseUnitNameOf(d);
  const qtyBase = toBaseQuantity(s.quantity, unit.baseQty);
  return decimal.eq(unit.baseQty, decimal.of(1))
    ? `${formatDecimalFa(qtyBase)} ${base}`
    : `${formatDecimalFa(s.quantity)} ${unit.name} × ${formatDecimalFa(unit.baseQty)} = ${formatDecimalFa(qtyBase)} ${base}`;
};

/** Cost of one base unit for the pricing helper (line amount ÷ base quantity). */
export const costPerBase = (d: EntryDraft): Money | null => {
  const s = d.stock;
  if (!s || !s.unitCost || s.costStatus === 'Unknown') return null;
  const unit = entryUnitsOf(d).find((u) => u.key === s.unitKey);
  if (!unit) return null;
  return money(decimal.round(decimal.div(s.unitCost.amount, unit.baseQty, 6), 0));
};

const n = (v: DecimalString) => Number(v);

const toPriceRule = (p: Pricing): Dto<'PriceRuleDto'> => ({
  method: p.method,
  manualPriceRials: p.method === 'Manual' && p.manualPrice ? toApiMoney(p.manualPrice) : null,
  markupPercent: p.method === 'Markup' && p.markupPercent ? n(p.markupPercent) : null,
  fixedProfitRials: p.method === 'FixedProfit' && p.fixedProfit ? toApiMoney(p.fixedProfit) : null,
  roundingStepRials: p.roundingStep && !moneyOps.isZero(p.roundingStep) ? toApiMoney(p.roundingStep) : null,
  roundingDirection: 'Nearest',
});

const unitRef = (d: EntryDraft, key: string): Dto<'EntryUnitRef'> => {
  if (key.startsWith('unit:')) return { catalogItemUnitId: key.slice(5) };
  if (key.startsWith('pack:')) return { newItemUnitIndex: Number(key.slice(5)) };
  const base = d.catalog?.units.find((u) => decimal.eq(u.baseQty, decimal.of(1)) && u.catalogItemUnitId);
  return base?.catalogItemUnitId ? { catalogItemUnitId: base.catalogItemUnitId } : { newItemUnitIndex: 0 };
};

/** Draft → `RegisterProductRequest` (preview and register use the same body). */
export const toRegisterRequest = (d: EntryDraft): Dto<'RegisterProductRequest'> => {
  const s = d.stock;
  const item = d.newItem;
  return {
    catalogItemId: d.catalog?.id ?? null,
    newCatalogItem:
      d.source === 'new' && item
        ? {
            productTypeId: item.productTypeId,
            title: item.title.trim(),
            baseUnitId: item.baseUnitId,
            brandStatus: item.brandStatus,
            brandId: item.brandStatus === 'Known' ? item.brandId : null,
            baseBarcode: item.baseBarcode.trim() || null,
            attributes: item.attributes.map((a) => ({
              attributeId: a.attributeId,
              optionIds: a.optionIds ? [...a.optionIds] : null,
              text: a.text ?? null,
              number: a.number ? n(a.number) : null,
              bool: a.bool ?? null,
            })),
            packagings: item.packagings.map((p) => ({
              name: p.name.trim(),
              baseQty: n(p.baseQty),
              barcode: p.barcode?.trim() || null,
              isSellable: true,
              isPurchasable: true,
            })),
            submitForPublicReview: false,
          }
        : null,
    localTitle: d.localTitle.trim() || null,
    stock: s
      ? {
          kind: s.kind,
          unit: unitRef(d, s.unitKey),
          quantity: n(s.quantity),
          unitCostRials: s.costStatus !== 'Unknown' && s.unitCost ? toApiMoney(s.unitCost) : null,
          costStatus: s.costStatus,
          supplierId: s.kind === 'Purchase' ? s.supplierId : null,
          supplierInvoiceNo: s.kind === 'Purchase' ? s.supplierInvoiceNo.trim() || null : null,
          productionDate: s.productionDate,
          expiryDate: s.expiryDate,
        }
      : null,
    pricing: d.pricing && !d.catalog?.storeProductId ? toPriceRule(d.pricing) : null,
    lowStockThreshold: d.lowStockThreshold ? n(d.lowStockThreshold) : null,
  };
};
