import { round2 } from './money';
import type { Dto } from '@dukani/contracts';
import { normalizeTitle, toPersianDigits } from '@dukani/domain';
import type { MockDb } from '../db/mock-db.types';
import { unitById } from '../db/reference';
import type { CatalogItemRecord } from '../db/reference.types';
import type { StoreProductRecord } from '../db/state';
import { fail } from '../msw/problem';
import { createCatalogItem } from './catalog-items';
import { productTitle } from './dto';
import { computePrice } from './pricing';
import { fromRuleDto, num, num0 } from '../db/wire';
import type { Plan } from './products.types';

const fa = (n: number) => toPersianDigits(String(n));

/** Mirror of backend `ProductRegistrationEngine.PlanRow` for one row (F08–F14). */
export const planEntry = (
  db: MockDb,
  storeId: string,
  r: Dto<'RegisterProductRequest'>,
  mode: 'preview' | 'register',
): Plan => {
  if (!!r.catalogItemId === !!r.newCatalogItem)
    throw fail.validation(
      'catalogItemId',
      'یک کالای موجود انتخاب کنید یا کالای جدید تعریف کنید.',
      'ITEM_CHOICE_REQUIRED',
    );
  const warnings: string[] = [];
  let item: CatalogItemRecord;
  let existing: StoreProductRecord | undefined;
  if (r.catalogItemId) {
    const found = db
      .catalogItems()
      .find((i) => i.id === r.catalogItemId && (i.ownerStoreId === null || i.ownerStoreId === storeId));
    if (!found) throw fail.validation('catalogItemId', 'کالای کاتالوگ پیدا نشد.', 'NOT_FOUND');
    item = found;
    existing = db.state.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === item.id);
    if (
      existing &&
      r.expectedStoreProductVersion != null &&
      r.expectedStoreProductVersion !== existing.version
    )
      throw fail.validation('expectedStoreProductVersion', 'اطلاعات ردیف تغییر کرده است.', 'BULK_ROW_STALE');
    if (existing?.status === 'Archived')
      throw fail.validation('catalogItemId', 'کالای فروشگاه بایگانی شده است.', 'PRODUCT_ARCHIVED');
    if (existing) warnings.push('این کالا قبلاً در فروشگاه ثبت شده است؛ موجودی به همان کالا اضافه می‌شود.');
  } else {
    item = createCatalogItem(db, storeId, r.newCatalogItem!, 'newCatalogItem.', {
      dryRun: true,
      allowDuplicateTitle: mode === 'preview',
    });
  }
  const title = r.localTitle?.trim() || item.title;
  if (item.kind === 'Service' && (r.stock || r.lowStockThreshold != null))
    throw fail.rule('SERVICE_NOT_STOCKABLE', 'خدمت موجودی ندارد.');
  if (
    r.shortcut &&
    db.state.storeProducts.some(
      (p) =>
        p.storeId === storeId && p.id !== existing?.id && p.shortcut === r.shortcut!.trim().toUpperCase(),
    )
  )
    throw fail.validation('shortcut', 'کد میان‌بر تکراری است.', 'SHORTCUT_DUPLICATE');
  const base = unitById(item.baseUnitId)!;
  const titleField = r.localTitle?.trim()
    ? 'localTitle'
    : r.newCatalogItem
      ? 'newCatalogItem.title'
      : 'catalogItemId';
  const taken = db.state.storeProducts.some(
    (p) =>
      p.storeId === storeId &&
      p.status === 'Active' &&
      normalizeTitle(productTitle(db, p)) === normalizeTitle(title),
  );
  if (!existing && taken) {
    const message = 'کالای فعالی با همین عنوان در فروشگاه هست؛ مدل، رنگ یا بسته را در عنوان مشخص کنید.';
    if (mode === 'register') throw fail.validation(titleField, message, 'TITLE_DUPLICATE');
    warnings.push(message);
  }
  if ((num(r.lowStockThreshold) ?? 0) < 0)
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
    const quantity = num0(s.quantity);
    const unitCost = num(s.unitCostAmount);
    if (!(quantity > 0))
      throw fail.validation('stock.quantity', 'تعداد باید بیشتر از صفر باشد.', 'QUANTITY_INVALID');
    const localUnit = s.unit?.storeProductUnitId
      ? existing?.units.find((u) => u.id === s.unit.storeProductUnitId)
      : undefined;
    if (s.unit?.storeProductUnitId && (!localUnit || localUnit.archivedAt))
      throw fail.validation(
        'stock.unit.storeProductUnitId',
        'واحد فروشگاه در دسترس نیست.',
        'ENTRY_UNIT_UNAVAILABLE',
      );
    if (localUnit && !localUnit.isPurchasable)
      throw fail.validation(
        'stock.unit.storeProductUnitId',
        'این واحد برای خرید تعریف نشده است؛ واحد دیگری انتخاب کنید.',
        'UNIT_NOT_PURCHASABLE',
      );
    let unit = localUnit
      ? item.units.find((u) => u.id === localUnit.catalogItemUnitId)
      : s.unit?.catalogItemUnitId
        ? item.units.find((u) => u.id === s.unit.catalogItemUnitId)
        : undefined;
    if (s.unit?.catalogItemUnitId && !unit)
      throw fail.validation(
        'stock.unit.catalogItemUnitId',
        'این واحد متعلق به این کالا نیست.',
        'ENTRY_UNIT_UNAVAILABLE',
      );
    if (!unit) {
      const index = s.unit?.newItemUnitIndex ?? 0;
      unit =
        index === 0
          ? item.units.find((u) => u.kind === 'Base')
          : r.newCatalogItem
            ? item.units[index]
            : undefined;
      if (!unit)
        throw fail.validation(
          'stock.unit.newItemUnitIndex',
          'واحد انتخاب‌شده در بسته‌بندی‌های این کالا نیست.',
          'ENTRY_UNIT_UNAVAILABLE',
        );
      plan.entryUnitIndex = index;
    }
    plan.entryCatalogUnitId = unit.id;
    const qtyBase = Number((quantity * (localUnit?.baseQty ?? unit.baseQty)).toFixed(6));
    const places = (qtyBase.toString().split('.')[1] ?? '').length;
    if (places > base.maxDecimals)
      throw fail.validation(
        'stock.quantity',
        `«${base.name}» کسری ثبت نمی‌شود؛ تعداد را درست وارد کنید.`,
        'QUANTITY_INVALID',
      );
    plan.qtyBase = qtyBase;
    plan.conversionText =
      unit.baseQty === 1
        ? `${fa(qtyBase)} ${base.name}`
        : `${fa(quantity)} ${unit.name} × ${fa(unit.baseQty)} = ${fa(qtyBase)} ${base.name}`;
    plan.costStatus = s.costStatus;
    if (s.costStatus === 'Unknown')
      warnings.push('بهای خرید نامعلوم است؛ سود این کالا تا اصلاح بها محاسبه نمی‌شود.');
    else if (unitCost === null)
      throw fail.validation(
        'stock.unitCostAmount',
        'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.',
        'COST_REQUIRED',
      );
    else if (unitCost < 0)
      throw fail.validation('stock.unitCostAmount', 'بها نمی‌تواند منفی باشد.', 'AMOUNT_NEGATIVE');
    else {
      plan.lineAmount = round2(unitCost * quantity);
      plan.costPerBase = round2(plan.lineAmount / qtyBase);
      if (s.costStatus === 'Estimated') warnings.push('بهای تخمینی ثبت می‌شود و بعداً قابل اصلاح است.');
    }
    const today = new Date().toISOString().slice(0, 10);
    if (s.productionDate && s.expiryDate && s.productionDate > s.expiryDate)
      throw fail.validation(
        'stock.expiryDate',
        'تاریخ تولید نباید بعد از تاریخ انقضا باشد.',
        'PRODUCTION_AFTER_EXPIRY',
      );
    if (s.productionDate && s.productionDate > today)
      throw fail.validation('stock.productionDate', 'تاریخ تولید نمی‌تواند در آینده باشد.');
    if (s.expiryDate && s.expiryDate < today) warnings.push('تاریخ انقضای این کالا گذشته است.');
    if (
      s.supplierId &&
      !db.state.suppliers.some((x) => x.id === s.supplierId && x.storeId === storeId && !x.isArchived)
    )
      throw fail.validation(
        'stock.supplierId',
        'تأمین‌کننده پیدا نشد یا بایگانی شده است.',
        'SUPPLIER_UNAVAILABLE',
      );
  }

  if (existing) {
    plan.salePrice = existing.baseSalePrice;
    const cost = plan.costPerBase ?? existing.averageCost;
    plan.isBelowCost = existing.baseSalePrice !== null && cost !== null && existing.baseSalePrice < cost;
    if (r.pricing)
      warnings.push('قیمت فروش کالای موجود از این فرم تغییر نمی‌کند؛ از صفحهٔ قیمت‌گذاری استفاده کنید.');
    if (plan.isBelowCost) warnings.push('قیمت فروش فعلی کمتر از بهای خرید است.');
  } else if (!r.pricing) {
    warnings.push('قیمت فروش خالی است؛ کالا در موجودی هست ولی آماده فروش نیست.');
  } else {
    const price = computePrice(
      fromRuleDto(r.pricing),
      item.kind === 'Service' ? num(r.serviceCostAmount) : plan.costPerBase,
    );
    if (price === null) {
      if (r.pricing.method === 'Manual')
        throw fail.validation('pricing.manualPriceAmount', 'قیمت فروش را وارد کنید.', 'PRICE_REQUIRED');
      warnings.push('بهای خرید معلوم نیست؛ قیمت فروش پس از ثبت اولین بهای معلوم محاسبه می‌شود.');
    } else if (price <= 0) {
      throw fail.validation('pricing', 'قیمت فروش باید بیشتر از صفر باشد.', 'PRICE_REQUIRED');
    } else {
      plan.salePrice = price;
      plan.isBelowCost = plan.costPerBase !== null && price < plan.costPerBase;
      if (plan.isBelowCost) warnings.push('قیمت فروش کمتر از بهای خرید است.');
    }
  }
  planUnitPrices(r, item, !!existing);
  return plan;
};

/** F12 §10: explicit package prices only for a product new to the store, each a different sellable package of it. */
const planUnitPrices = (r: Dto<'RegisterProductRequest'>, item: CatalogItemRecord, existing: boolean) => {
  const prices = r.unitPrices ?? [];
  if (!prices.length) return;
  if (existing)
    throw fail.validation(
      'unitPrices',
      'قیمت بسته‌های کالای موجود در صفحهٔ قیمت‌گذاری همان کالا تغییر می‌کند.',
    );
  const seen = new Set<string>();
  prices.forEach((price, i) => {
    const unit = catalogUnitOf(item, price.unit, !!r.newCatalogItem);
    if (!unit || unit.kind !== 'Package' || !unit.isSellable || seen.has(unit.id))
      throw fail.validation(
        `unitPrices[${i}].unit`,
        'قیمت جدا فقط برای یکی از بسته‌های قابل فروش همین کالا ثبت می‌شود.',
        'ENTRY_UNIT_UNAVAILABLE',
      );
    seen.add(unit.id);
    if (!(num0(price.salePriceAmount) > 0))
      throw fail.validation(`unitPrices[${i}].salePriceAmount`, 'قیمت بسته باید بیشتر از صفر باشد.');
  });
};

/** A unit reference of the request: an index into a new item's units (base = 0), or a catalog unit id. */
export const catalogUnitOf = (item: CatalogItemRecord, ref: Dto<'EntryUnitRef'>, created: boolean) =>
  created && ref.newItemUnitIndex != null
    ? item.units[ref.newItemUnitIndex]
    : ref.catalogItemUnitId
      ? item.units.find((u) => u.id === ref.catalogItemUnitId)
      : undefined;
