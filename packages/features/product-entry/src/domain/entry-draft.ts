import type { Dto } from '@dukani/contracts';
import {
  decimal,
  formatDecimalFa,
  moneyOps,
  money,
  MONEY_MAX_DECIMALS,
  toApiMoney,
  toBaseQuantity,
  type DecimalString,
  type Money,
} from '@dukani/domain';
import type {
  CatalogChoice,
  EntryDraft,
  EntryStep,
  EntryUnit,
  EntryTypePreset,
  NewItem,
  Pricing,
} from './entry-draft.types';

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

export const newDraft = (
  id: string,
  init:
    | { source: 'new'; title?: string; barcode?: string; productType?: EntryTypePreset }
    | { source: 'catalog'; catalog: CatalogChoice },
): EntryDraft => ({
  id,
  source: init.source,
  catalog: init.source === 'catalog' ? init.catalog : null,
  localTitle: '',
  newItem:
    init.source === 'new'
      ? {
          ...emptyNewItem(init.title, init.barcode),
          ...(init.productType
            ? {
                productTypeId: init.productType.id,
                productTypeName: init.productType.name,
                baseUnitId: init.productType.baseUnit.id,
                baseUnitName: init.productType.baseUnit.name,
                baseUnitMaxDecimals: init.productType.baseUnit.maxDecimals,
              }
            : {}),
        }
      : null,
  stock: null,
  stockDecided: false,
  pricing: null,
  lowStockThreshold: null,
  operationId: null,
  result: null,
});

/** Steps of a draft: new items define units; existing store products skip pricing (price page owns it). */
export const stepsOf = (d: EntryDraft): EntryStep[] => {
  if (d.intent === 'standalone') return ['details', 'review'];
  const steps: EntryStep[] = ['details'];
  if (kindOf(d) !== 'Service') {
    if (d.source === 'new') steps.push('units');
    steps.push('stock');
  }
  if (!d.catalog?.storeProductId) steps.push('pricing');
  steps.push('review');
  return steps;
};

export const kindOf = (d: EntryDraft): 'Goods' | 'Service' => d.catalog?.kind ?? d.newItem?.kind ?? 'Goods';

export const nextStep = (d: EntryDraft, current: EntryStep): EntryStep => {
  const steps = stepsOf(d);
  return steps[steps.indexOf(current) + 1] ?? 'review';
};

export const previousStep = (d: EntryDraft, current: EntryStep): EntryStep | null => {
  const steps = stepsOf(d);
  const i = steps.indexOf(current);
  return i > 0 ? steps[i - 1]! : null;
};

export const titleOf = (d: EntryDraft): string =>
  d.localTitle.trim() || d.catalog?.title || d.newItem?.title.trim() || '';
export const baseUnitNameOf = (d: EntryDraft): string =>
  d.catalog?.baseUnitName ?? d.newItem?.baseUnitName ?? '';
export const maxDecimalsOf = (d: EntryDraft): number =>
  d.catalog?.baseUnitMaxDecimals ?? d.newItem?.baseUnitMaxDecimals ?? 0;

/** Units the stock can be entered in: base + packagings (F12). */
export const entryUnitsOf = (d: EntryDraft): EntryUnit[] => {
  if (d.catalog) return [...d.catalog.units];
  const base: EntryUnit = { key: 'base', name: d.newItem?.baseUnitName ?? '', baseQty: decimal.of(1) };
  return [
    base,
    ...(d.newItem?.packagings ?? []).flatMap((p, i) =>
      p.isPurchasable === false
        ? []
        : [
            {
              key: `pack:${i + 1}`,
              name: p.name,
              baseQty: p.baseQty,
            },
          ],
    ),
  ];
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
  if (kindOf(d) === 'Service') return d.serviceCost ?? null;
  const s = d.stock;
  if (!s || !s.unitCost || s.costStatus === 'Unknown') return null;
  const unit = entryUnitsOf(d).find((u) => u.key === s.unitKey);
  if (!unit) return null;
  return money(decimal.round(decimal.div(s.unitCost.amount, unit.baseQty, 6), MONEY_MAX_DECIMALS));
};

/** API decimals travel as strings (BCR-01). */
const n = (v: DecimalString): DecimalString => v;

const toPriceRule = (p: Pricing): Dto<'PriceRuleDto'> => ({
  method: p.method,
  manualPriceAmount: p.method === 'Manual' && p.manualPrice ? toApiMoney(p.manualPrice) : null,
  markupPercent: p.method === 'Markup' && p.markupPercent ? n(p.markupPercent) : null,
  fixedProfitAmount: p.method === 'FixedProfit' && p.fixedProfit ? toApiMoney(p.fixedProfit) : null,
  roundingStepAmount: p.roundingStep && !moneyOps.isZero(p.roundingStep) ? toApiMoney(p.roundingStep) : null,
  roundingDirection: p.roundingDirection ?? 'Nearest',
});

const unitRef = (d: EntryDraft, key: string): Dto<'EntryUnitRef'> => {
  if (key.startsWith('store:')) return { storeProductUnitId: key.slice(6) };
  if (key.startsWith('unit:')) return { catalogItemUnitId: key.slice(5) };
  if (key.startsWith('pack:')) return { newItemUnitIndex: Number(key.slice(5)) };
  const base = d.catalog?.units.find((u) => decimal.eq(u.baseQty, decimal.of(1)) && u.catalogItemUnitId);
  return base?.catalogItemUnitId ? { catalogItemUnitId: base.catalogItemUnitId } : { newItemUnitIndex: 0 };
};

/** Draft → `RegisterProductRequest` (preview and register use the same body). */
export const toRegisterRequest = (d: EntryDraft): Dto<'RegisterProductRequest'> => {
  const s = d.intent === 'standalone' ? null : d.stock;
  const item = d.newItem;
  return {
    catalogItemId: d.catalog?.id ?? null,
    newCatalogItem:
      d.source === 'new' && item
        ? {
            kind: item.kind ?? 'Goods',
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
              isSellable: p.isSellable ?? true,
              isPurchasable: p.isPurchasable ?? true,
            })),
            imageFileIds: item.imageFileIds ? [...item.imageFileIds] : [],
            description: item.description?.trim() || null,
            netContentValue: item.netContentValue ?? null,
            netContentUnitId: item.netContentUnitId ?? null,
            submitForPublicReview: item.submitForPublicReview ?? false,
          }
        : null,
    localTitle: d.localTitle.trim() || null,
    localNote: d.localNote?.trim() || null,
    expectedStoreProductVersion: d.catalog?.storeProductVersion,
    stock: s
      ? {
          kind: s.kind,
          unit: unitRef(d, s.unitKey),
          quantity: n(s.quantity),
          unitCostAmount: s.costStatus !== 'Unknown' && s.unitCost ? toApiMoney(s.unitCost) : null,
          costStatus: s.costStatus,
          supplierId: s.kind === 'Purchase' ? s.supplierId : null,
          supplierInvoiceNo: s.kind === 'Purchase' ? s.supplierInvoiceNo.trim() || null : null,
          productionDate: s.productionDate,
          expiryDate: s.expiryDate,
          manufacturerPriceAmount: s.manufacturerPrice ? toApiMoney(s.manufacturerPrice) : null,
          printedPriceAmount: s.printedPrice ? toApiMoney(s.printedPrice) : null,
        }
      : null,
    pricing:
      d.intent !== 'standalone' && d.pricing && !d.catalog?.storeProductId ? toPriceRule(d.pricing) : null,
    lowStockThreshold: d.intent !== 'standalone' && d.lowStockThreshold ? n(d.lowStockThreshold) : null,
    shortcut: d.shortcut?.trim() || null,
    serviceCostAmount: d.serviceCost ? toApiMoney(d.serviceCost) : null,
  };
};
