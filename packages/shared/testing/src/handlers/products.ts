import type { Dto } from '@dukani/contracts';
import { normalizeTitle, toPersianDigits } from '@dukani/domain';
import { storeUnitsFor } from '../db/fixtures';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db';
import { unitById, type CatalogItemRecord } from '../db/reference';
import type { PurchaseRecord, StoreProductRecord } from '../db/state';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { createCatalogItem, titleCheck } from './catalog';
import { isLowStock, page, productTitle, toProductDto, toProductSummary } from './dto';
import { computePrice, pricePreview } from './pricing';

const fa = (n: number) => toPersianDigits(String(n));

type Plan = {
  item: CatalogItemRecord;
  existing?: StoreProductRecord;
  title: string;
  baseUnitName: string;
  entryUnitIndex: number | null;
  entryCatalogUnitId: string | null;
  qtyBase: number | null;
  conversionText: string | null;
  lineAmount: number | null;
  costPerBase: number | null;
  costStatus: Dto<'CostStatus'>;
  salePrice: number | null;
  isBelowCost: boolean;
  warnings: string[];
};

/** Mirror of backend `ProductRegistrationEngine.PlanRow` for one row (F08–F14). */
const planEntry = (db: MockDb, storeId: string, r: Dto<'RegisterProductRequest'>, mode: 'preview' | 'register'): Plan => {
  if (!!r.catalogItemId === !!r.newCatalogItem)
    throw fail.validation('catalogItemId', 'یک کالای موجود انتخاب کنید یا کالای جدید تعریف کنید.', 'ITEM_CHOICE_REQUIRED');
  const warnings: string[] = [];
  let item: CatalogItemRecord;
  let existing: StoreProductRecord | undefined;
  if (r.catalogItemId) {
    const found = db.catalogItems().find((i) => i.id === r.catalogItemId && (i.ownerStoreId === null || i.ownerStoreId === storeId));
    if (!found) throw fail.validation('catalogItemId', 'کالای کاتالوگ پیدا نشد.', 'NOT_FOUND');
    item = found;
    existing = db.state.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === item.id);
    if (existing)
      warnings.push(
        existing.status === 'Archived'
          ? 'این کالا بایگانی شده بود و با این ثبت دوباره فعال می‌شود.'
          : 'این کالا قبلاً در فروشگاه ثبت شده است؛ موجودی به همان کالا اضافه می‌شود.',
      );
  } else {
    item = createCatalogItem(db, storeId, r.newCatalogItem!, 'newCatalogItem.', { dryRun: true, allowDuplicateTitle: mode === 'preview' });
  }
  const title = r.localTitle?.trim() || item.title;
  const base = unitById(item.baseUnitId)!;
  const titleField = r.localTitle?.trim() ? 'localTitle' : r.newCatalogItem ? 'newCatalogItem.title' : 'catalogItemId';
  const taken = db.state.storeProducts.some(
    (p) => p.storeId === storeId && p.status === 'Active' && normalizeTitle(productTitle(db, p)) === normalizeTitle(title),
  );
  if (!existing && taken) {
    const message = 'کالای فعالی با همین عنوان در فروشگاه هست؛ مدل، رنگ یا بسته را در عنوان مشخص کنید.';
    if (mode === 'register') throw fail.validation(titleField, message, 'TITLE_DUPLICATE');
    warnings.push(message);
  }
  if (r.lowStockThreshold !== null && r.lowStockThreshold !== undefined && r.lowStockThreshold < 0)
    throw fail.validation('lowStockThreshold', 'آستانهٔ کمبود نمی‌تواند منفی باشد.', 'QUANTITY_INVALID');

  const plan: Plan = {
    item,
    existing,
    title,
    baseUnitName: base.name,
    entryUnitIndex: null,
    entryCatalogUnitId: null,
    qtyBase: null,
    conversionText: null,
    lineAmount: null,
    costPerBase: null,
    costStatus: existing?.costStatus ?? 'Unknown',
    salePrice: null,
    isBelowCost: false,
    warnings,
  };

  const s = r.stock;
  if (s) {
    if (!(s.quantity > 0)) throw fail.validation('stock.quantity', 'تعداد باید بیشتر از صفر باشد.', 'QUANTITY_INVALID');
    let unit = s.unit?.catalogItemUnitId ? item.units.find((u) => u.id === s.unit.catalogItemUnitId) : undefined;
    if (s.unit?.catalogItemUnitId && !unit)
      throw fail.validation('stock.unit.catalogItemUnitId', 'این واحد متعلق به این کالا نیست.', 'ENTRY_UNIT_UNAVAILABLE');
    if (!unit) {
      const index = s.unit?.newItemUnitIndex ?? 0;
      unit = index === 0 ? item.units.find((u) => u.kind === 'Base') : r.newCatalogItem ? item.units[index] : undefined;
      if (!unit)
        throw fail.validation('stock.unit.newItemUnitIndex', 'واحد انتخاب‌شده در بسته‌بندی‌های این کالا نیست.', 'ENTRY_UNIT_UNAVAILABLE');
      plan.entryUnitIndex = index;
    }
    plan.entryCatalogUnitId = unit.id;
    const qtyBase = s.quantity * unit.baseQty;
    const places = (qtyBase.toString().split('.')[1] ?? '').length;
    if (places > base.maxDecimals)
      throw fail.validation('stock.quantity', `«${base.name}» کسری ثبت نمی‌شود؛ تعداد را درست وارد کنید.`, 'QUANTITY_INVALID');
    plan.qtyBase = qtyBase;
    plan.conversionText =
      unit.baseQty === 1 ? `${fa(qtyBase)} ${base.name}` : `${fa(s.quantity)} ${unit.name} × ${fa(unit.baseQty)} = ${fa(qtyBase)} ${base.name}`;
    plan.costStatus = s.costStatus;
    if (s.costStatus === 'Unknown') warnings.push('بهای خرید نامعلوم است؛ سود این کالا تا اصلاح بها محاسبه نمی‌شود.');
    else if (s.unitCostRials === null || s.unitCostRials === undefined)
      throw fail.validation('stock.unitCostRials', 'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.', 'COST_REQUIRED');
    else if (s.unitCostRials < 0) throw fail.validation('stock.unitCostRials', 'بها نمی‌تواند منفی باشد.', 'AMOUNT_NEGATIVE');
    else {
      plan.lineAmount = Math.round(s.unitCostRials * s.quantity);
      plan.costPerBase = Math.round(plan.lineAmount / qtyBase);
      if (s.costStatus === 'Estimated') warnings.push('بهای تخمینی ثبت می‌شود و بعداً قابل اصلاح است.');
    }
    const today = new Date().toISOString().slice(0, 10);
    if (s.productionDate && s.expiryDate && s.productionDate > s.expiryDate)
      throw fail.validation('stock.expiryDate', 'تاریخ تولید نباید بعد از تاریخ انقضا باشد.', 'PRODUCTION_AFTER_EXPIRY');
    if (s.productionDate && s.productionDate > today) throw fail.validation('stock.productionDate', 'تاریخ تولید نمی‌تواند در آینده باشد.');
    if (s.expiryDate && s.expiryDate < today) warnings.push('تاریخ انقضای این کالا گذشته است.');
    if (s.supplierId && !db.state.suppliers.some((x) => x.id === s.supplierId && x.storeId === storeId && !x.isArchived))
      throw fail.validation('stock.supplierId', 'تأمین‌کننده پیدا نشد یا بایگانی شده است.', 'SUPPLIER_UNAVAILABLE');
  }

  if (existing) {
    plan.salePrice = existing.baseSalePrice;
    const cost = plan.costPerBase ?? existing.averageCost;
    plan.isBelowCost = existing.baseSalePrice !== null && cost !== null && existing.baseSalePrice < cost;
    if (r.pricing) warnings.push('قیمت فروش کالای موجود از این فرم تغییر نمی‌کند؛ از صفحهٔ قیمت‌گذاری استفاده کنید.');
    if (plan.isBelowCost) warnings.push('قیمت فروش فعلی کمتر از بهای خرید است.');
  } else if (!r.pricing) {
    warnings.push('قیمت فروش خالی است؛ کالا در موجودی هست ولی آماده فروش نیست.');
  } else {
    const price = computePrice(r.pricing, plan.costPerBase);
    if (price === null) {
      if (r.pricing.method === 'Manual') throw fail.validation('pricing.manualPriceRials', 'قیمت فروش را وارد کنید.', 'PRICE_REQUIRED');
      warnings.push('بهای خرید معلوم نیست؛ قیمت فروش پس از ثبت اولین بهای معلوم محاسبه می‌شود.');
    } else if (price <= 0) {
      throw fail.validation('pricing', 'قیمت فروش باید بیشتر از صفر باشد.', 'PRICE_REQUIRED');
    } else {
      plan.salePrice = price;
      plan.isBelowCost = plan.costPerBase !== null && price < plan.costPerBase;
      if (plan.isBelowCost) warnings.push('قیمت فروش کمتر از بهای خرید است.');
    }
  }
  return plan;
};

/** Receives stock into a product and updates the moving average cost (BIZ-PUR-02/INV-03). */
export const receiveStock = (p: StoreProductRecord, qtyBase: number, costPerBase: number | null, status: Dto<'CostStatus'>) => {
  if (costPerBase !== null && status !== 'Unknown') {
    const known = p.averageCost !== null && p.costStatus !== 'Unknown' && p.onHand > 0;
    p.averageCost = known ? Math.round((p.onHand * p.averageCost! + qtyBase * costPerBase) / (p.onHand + qtyBase)) : costPerBase;
    p.costStatus = status === 'Estimated' || (known && p.costStatus === 'Estimated') ? 'Estimated' : 'Known';
  } else if (p.averageCost === null) {
    p.costStatus = 'Unknown';
  }
  p.onHand = Math.round((p.onHand + qtyBase) * 1000) / 1000;
  if (p.pricing.method !== 'Manual') p.baseSalePrice = computePrice(p.pricing, p.averageCost) ?? p.baseSalePrice;
  p.version += 1;
};

const STOCK_SORTS: Record<string, (a: Dto<'StoreProductSummaryDto'>, b: Dto<'StoreProductSummaryDto'>) => number> = {
  title: (a, b) => a.title.localeCompare(b.title, 'fa'),
  stock: (a, b) => a.available - b.available,
  stock_desc: (a, b) => b.available - a.available,
  price: (a, b) => (a.baseSalePriceRials ?? 0) - (b.baseSalePriceRials ?? 0),
  price_desc: (a, b) => (b.baseSalePriceRials ?? 0) - (a.baseSalePriceRials ?? 0),
};

/** Inventory registry + product entry: product list/detail, price preview, preview/register (F08–F16). */
export const productHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/products', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const q = normalizeTitle(query.get('q') ?? '');
    const status = query.get('status') ?? 'Active';
    const stockState = query.get('stockState') ?? 'Any';
    const costStatus = query.get('costStatus');
    const items = db.state.storeProducts
      .filter((p) => p.storeId === params.storeId && p.status === status)
      .filter((p) => !costStatus || p.costStatus === costStatus)
      .filter((p) => {
        const avail = p.onHand - p.reserved;
        if (stockState === 'Out') return avail <= 0;
        if (stockState === 'Low') return isLowStock(p) && avail > 0;
        if (stockState === 'InStock') return avail > 0;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((p) => toProductSummary(db, p))
      .filter((p) => !q || q.split(' ').every((w) => normalizeTitle(`${p.title} ${p.sku}`).includes(w)));
    const sorter = STOCK_SORTS[query.get('sort') ?? ''];
    return page(sorter ? items.sort(sorter) : items, query, 30);
  }),

  route.get('/api/v1/stores/{storeId}/products/{productId}', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    const p = db.state.storeProducts.find((x) => x.id === params.productId && x.storeId === params.storeId);
    if (!p) throw fail.notFound('کالا');
    return toProductDto(db, p);
  }),

  route.get('/api/v1/stores/{storeId}/inventory/{productId}/movements', ({ request, params, query }) => {
    db.requireMember(request, params.storeId, 'stock.view');
    const p = db.state.storeProducts.find((x) => x.id === params.productId && x.storeId === params.storeId);
    if (!p) throw fail.notFound('کالا');
    // receipts come from finalized purchases; the remaining difference to on-hand is shown as sales (no sales module yet)
    let balance = 0;
    const moves: Dto<'StockMovementDto'>[] = [];
    for (const pur of db.state.purchases.filter((x) => x.storeId === params.storeId && x.status === 'Finalized').sort((a, b) => a.purchasedAt.localeCompare(b.purchasedAt))) {
      for (const l of pur.lines.filter((x) => x.storeProductId === p.id)) {
        const unit = p.units.find((u) => u.id === l.storeProductUnitId);
        const qtyBase = l.quantity * (unit?.baseQty ?? 1);
        balance += qtyBase;
        moves.push({
          id: l.id,
          occurredAt: pur.finalizedAt ?? pur.purchasedAt,
          type: pur.kind === 'Opening' ? 'Opening' : 'Purchase',
          qtyBase,
          balanceAfter: balance,
          unitCostRials: l.unitCost !== null ? Math.round(l.unitCost / (unit?.baseQty ?? 1)) : null,
          costKnown: l.costStatus !== 'Unknown',
          refType: 'purchase',
          refId: pur.id,
          refNumber: pur.number !== null ? String(pur.number) : null,
          note: null,
        });
      }
    }
    if (balance !== p.onHand)
      moves.push({
        id: `${p.id}-sales`,
        occurredAt: new Date().toISOString(),
        type: balance > p.onHand ? 'Sale' : 'Adjustment',
        qtyBase: p.onHand - balance,
        balanceAfter: p.onHand,
        unitCostRials: null,
        costKnown: false,
        refType: 'sale',
        refId: p.id,
        refNumber: null,
        note: balance > p.onHand ? 'فروش‌های ثبت‌شده' : 'اصلاح موجودی',
      });
    return page(moves.reverse(), query, 30);
  }),

  route.post('/api/v1/stores/{storeId}/products/pricing/preview', ({ request, params, body }) => {
    db.requireMember(request, params.storeId);
    return pricePreview(body);
  }),

  route.post('/api/v1/stores/{storeId}/product-entry/preview', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    const plan = planEntry(db, params.storeId, body, 'preview');
    return {
      title: plan.title,
      baseUnitName: plan.baseUnitName,
      qtyBase: plan.qtyBase,
      conversionText: plan.conversionText,
      costPerBaseRials: plan.costPerBase,
      costStatus: plan.costStatus,
      salePriceRials: plan.salePrice,
      isBelowCost: plan.isBelowCost,
      titleCheck: body.newCatalogItem
        ? titleCheck(db, params.storeId, body.newCatalogItem.title)
        : { normalizedTitle: normalizeTitle(plan.title), isAvailable: true, similarItems: [] },
      existingStoreProductId: plan.existing?.id ?? null,
      warnings: plan.warnings,
    };
  }),

  route.post('/api/v1/stores/{storeId}/product-entry/register', ({ request, params, body, idempotencyKey }) => {
    db.requireMember(request, params.storeId, 'product.manage');
    if (!idempotencyKey) throw fail.validation('Idempotency-Key', 'شناسهٔ عملیات لازم است.', 'IDEMPOTENCY_KEY_REQUIRED');
    const plan = planEntry(db, params.storeId, body, 'register');
    return db.mutate((s) => {
      const created = !plan.existing && !!body.newCatalogItem;
      const item = created ? createCatalogItem(db, params.storeId, body.newCatalogItem!, 'newCatalogItem.') : plan.item;
      let product = plan.existing;
      if (!product) {
        const id = randomId();
        product = {
          id,
          storeId: params.storeId,
          catalogItemId: item.id,
          localTitle: body.localTitle?.trim() || null,
          localNote: null,
          sku: `P${String(db.next(params.storeId, 'sku')).padStart(5, '0')}`,
          onHand: 0,
          reserved: 0,
          averageCost: null,
          costStatus: 'Unknown',
          pricing: body.pricing ?? { method: 'Manual', manualPriceRials: null, roundingDirection: 'Nearest' },
          baseSalePrice: plan.salePrice,
          lowStockThreshold: body.lowStockThreshold ?? null,
          units: storeUnitsFor(item, plan.salePrice, id),
          status: 'Active',
          version: 1,
          createdAt: new Date().toISOString(),
        };
        s.storeProducts.push(product);
      } else {
        product.status = 'Active';
      }
      let purchaseId: string | null = null;
      if (body.stock && plan.qtyBase !== null) {
        // units of a newly created item are resolved by index (base = 0, packagings 1…)
        const catalogUnitId = created ? item.units[plan.entryUnitIndex ?? 0]!.id : plan.entryCatalogUnitId;
        const unit = product.units.find((u) => u.catalogItemUnitId === catalogUnitId) ?? product.units[0]!;
        const now = new Date().toISOString();
        const purchase: PurchaseRecord = {
          id: randomId(),
          storeId: params.storeId,
          number: db.next(params.storeId, 'purchase'),
          kind: body.stock.kind,
          status: 'Finalized',
          supplierId: body.stock.supplierId ?? null,
          supplierInvoiceNo: body.stock.supplierInvoiceNo?.trim() || null,
          purchasedAt: now,
          discount: 0,
          shipping: 0,
          nonRecoverableTax: 0,
          note: null,
          lines: [
            {
              id: randomId(),
              storeProductId: product.id,
              storeProductUnitId: unit.id,
              quantity: body.stock.quantity,
              unitCost: body.stock.costStatus === 'Unknown' ? null : (body.stock.unitCostRials ?? null),
              costStatus: body.stock.costStatus,
              productionDate: body.stock.productionDate ?? null,
              expiryDate: body.stock.expiryDate ?? null,
              manufacturerPrice: body.stock.manufacturerPriceRials ?? null,
              printedPrice: body.stock.printedPriceRials ?? null,
            },
          ],
          attachmentFileIds: [],
          finalizedAt: now,
          version: 1,
          createdAt: now,
        };
        s.purchases.push(purchase);
        receiveStock(product, plan.qtyBase, plan.costPerBase, body.stock.costStatus);
        purchaseId = purchase.id;
      }
      db.recordOperation(idempotencyKey, 'RegisterProduct', 'StoreProduct', product.id);
      return {
        storeProductId: product.id,
        catalogItemId: item.id,
        catalogItemCreated: created,
        purchaseId,
        sku: product.sku,
        onHand: product.onHand,
        salePriceRials: product.baseSalePrice,
      };
    });
  }),
];
