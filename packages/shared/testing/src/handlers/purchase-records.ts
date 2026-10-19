import type { Dto } from '@dukani/contracts';
import { normalizeDigits } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import type { PurchaseLineRecord, PurchaseRecord } from '../db/state';
import { fail } from '../msw/problem';
import { num, num0 } from '../db/wire';

/** Invoice numbers compare without separators and leading zeros (BIZ-PUR-03). */
export const normalizeInvoiceNo = (s: string) =>
  normalizeDigits(s)
    .replace(/[\s\-_/]/g, '')
    .replace(/^0+/, '')
    .toLowerCase();

export const toLines = (
  db: MockDb,
  storeId: string,
  lines: Dto<'PurchaseLineInput'>[] | null | undefined,
): PurchaseLineRecord[] =>
  (lines ?? []).map((l, i) => {
    const product = db.state.storeProducts.find((p) => p.id === l.storeProductId && p.storeId === storeId);
    if (!product) throw fail.validation(`lines[${i}].storeProductId`, 'کالا پیدا نشد.', 'NOT_FOUND');
    const unit = product.units.find((u) => u.id === l.storeProductUnitId);
    if (!unit || unit.archivedAt)
      throw fail.validation(
        `lines[${i}].storeProductUnitId`,
        'واحد انتخاب‌شده برای این کالا معتبر نیست.',
        'ENTRY_UNIT_UNAVAILABLE',
      );
    // the server never relies on the picker hiding sale-only units (F12 §8)
    if (!unit.isPurchasable)
      throw fail.validation(
        `lines[${i}].storeProductUnitId`,
        'این واحد برای خرید تعریف نشده است؛ واحد دیگری انتخاب کنید.',
        'UNIT_NOT_PURCHASABLE',
      );
    if (!(num0(l.quantity) > 0))
      throw fail.validation(`lines[${i}].quantity`, 'تعداد باید بیشتر از صفر باشد.', 'QUANTITY_INVALID');
    if (l.costStatus !== 'Unknown' && (l.unitCostAmount === null || l.unitCostAmount === undefined))
      throw fail.validation(
        `lines[${i}].unitCostAmount`,
        'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.',
        'COST_REQUIRED',
      );
    if (l.productionDate && l.expiryDate && l.productionDate > l.expiryDate)
      throw fail.validation(
        `lines[${i}].expiryDate`,
        'تاریخ تولید نباید بعد از تاریخ انقضا باشد.',
        'PRODUCTION_AFTER_EXPIRY',
      );
    return {
      id: randomId(),
      storeProductId: l.storeProductId,
      storeProductUnitId: l.storeProductUnitId,
      quantity: num0(l.quantity),
      unitCost: l.costStatus === 'Unknown' ? null : num(l.unitCostAmount),
      costStatus: l.costStatus,
      productionDate: l.productionDate ?? null,
      expiryDate: l.expiryDate ?? null,
      manufacturerPrice: num(l.manufacturerPriceAmount),
      printedPrice: num(l.printedPriceAmount),
    };
  });

export const checkSupplier = (db: MockDb, storeId: string, supplierId: string | null | undefined) => {
  if (
    supplierId &&
    !db.state.suppliers.some((s) => s.id === supplierId && s.storeId === storeId && !s.isArchived)
  )
    throw fail.validation('supplierId', 'تأمین‌کننده پیدا نشد یا بایگانی شده است.', 'SUPPLIER_UNAVAILABLE');
};

export const duplicateOf = (db: MockDb, p: PurchaseRecord) => {
  if (!p.supplierInvoiceNo) return undefined;
  const no = normalizeInvoiceNo(p.supplierInvoiceNo);
  return db.state.purchases.find(
    (x) =>
      x.id !== p.id &&
      x.storeId === p.storeId &&
      x.status === 'Finalized' &&
      x.supplierId === p.supplierId &&
      !!x.supplierInvoiceNo &&
      normalizeInvoiceNo(x.supplierInvoiceNo) === no,
  );
};
