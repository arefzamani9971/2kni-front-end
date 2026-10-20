import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import type { PurchaseRecord } from '../db/state';
import { num0 } from '../db/wire';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { receiveStock } from './inventory';
import { hasStockHistory } from './product-page';
import { computePurchase, toPurchaseDto } from './purchase-dto';
import { checkSupplier, duplicateOf, toLines } from './purchase-records';

const localDay = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * `POST …/purchases/quick` ♻: one finalized single-line receipt of an existing product (F13, CPB-04, CPB-06), with
 * the rules of the server: document date, charges with a known basis, zero-cost reason, owner's duplicate-invoice
 * reason and Opening only for a product without stock history (CPB-D04). Replays by Idempotency-Key in `route`.
 */
export const purchaseQuickHandlers = (db: MockDb) => [
  route.post('/api/v1/stores/{storeId}/purchases/quick', ({ request, params, body, idempotencyKey }) => {
    const { member } = db.requireMember(request, params.storeId, 'purchase.manage');
    const today = localDay();
    if (body.documentDate && body.documentDate > today)
      throw fail.validation('documentDate', 'تاریخ رسید نمی‌تواند در آینده باشد.');
    checkSupplier(db, params.storeId, body.supplierId);
    const lines = toLines(db, params.storeId, [body.line]);
    const product = db.state.storeProducts.find((p) => p.id === body.line.storeProductId)!;
    if (product.status !== 'Active')
      throw fail.validation(
        'lines[0].storeProductId',
        'این کالا بایگانی شده است؛ ابتدا آن را فعال کنید.',
        'PRODUCT_INACTIVE',
      );
    if ((product.kind ?? 'Goods') === 'Service')
      throw fail.validation(
        'lines[0].storeProductId',
        'خدمت موجودی ندارد و در رسید خرید ثبت نمی‌شود.',
        'SERVICE_NOT_STOCKABLE',
      );
    const charges = {
      discount: num0(body.discountAmount),
      shipping: num0(body.shippingAmount),
      sideCharge: num0(body.sideChargeAmount),
    };
    if (charges.discount < 0 || charges.shipping < 0 || charges.sideCharge < 0)
      throw fail.validation('shippingAmount', 'مبلغ نمی‌تواند منفی باشد.', 'AMOUNT_NEGATIVE');
    const now = new Date().toISOString();
    const record: PurchaseRecord = {
      id: randomId(),
      storeId: params.storeId,
      number: null,
      kind: body.kind,
      status: 'Draft',
      supplierId: body.supplierId ?? null,
      supplierInvoiceNo: body.supplierInvoiceNo?.trim() || null,
      purchasedAt: now,
      documentDate: body.documentDate ?? (body.kind === 'Opening' ? null : today),
      discount: charges.discount,
      shipping: charges.shipping,
      sideCharge: charges.sideCharge,
      nonRecoverableTax: 0,
      note: null,
      lines,
      attachmentFileIds: [],
      finalizedAt: null,
      version: 1,
      createdAt: now,
    };
    const totals = computePurchase(db, record);
    if (charges.shipping + charges.sideCharge > 0 && totals.subtotal === 0)
      throw fail.validation(
        'line.unitCostAmount',
        'برای تقسیم هزینه‌ها بهای کالا را وارد کنید یا هزینه‌ها را صفر کنید.',
        'COST_REQUIRED',
      );
    if (charges.discount > totals.subtotal)
      throw fail.validation('discountAmount', 'تخفیف بیشتر از جمع رسید است.', 'DISCOUNT_EXCEEDS_AMOUNT');
    if (body.kind === 'Opening' && hasStockHistory(db, product))
      throw fail.rule(
        'OPENING_NOT_ALLOWED',
        'این کالا قبلاً گردش موجودی دارد؛ موجودی اولیه فقط برای کالای بدون سابقه ثبت می‌شود. برای تغییر موجودی از «اصلاح موجودی» استفاده کنید.',
      );
    const duplicate = record.supplierId ? duplicateOf(db, record) : undefined;
    if (duplicate) {
      if (body.duplicateInvoiceReason == null)
        throw fail.rule(
          'PURCHASE_DUPLICATE_INVOICE',
          `این شماره فاکتور قبلاً برای همین تأمین‌کننده در رسید شماره ${duplicate.number ?? ''} ثبت شده است؛ در صورت اطمینان با ذکر دلیل ادامه دهید.`,
        );
      if (member.role !== 'Owner')
        throw fail.forbidden(
          'PERMISSION_DENIED',
          'ثبت رسید با شماره فاکتور تکراری فقط با تأیید مالک ممکن است.',
        );
      if (!body.duplicateInvoiceReason.trim())
        throw fail.validation(
          'duplicateInvoiceReason',
          'دلیل ثبت شماره فاکتور تکراری را بنویسید.',
          'DUPLICATE_REASON_REQUIRED',
        );
      record.duplicateReason = body.duplicateInvoiceReason.trim();
    }
    return db.mutate((s) => {
      for (const line of computePurchase(db, record).lines)
        receiveStock(product, line.qtyBase ?? 0, line.costPerBaseAmount ?? null, line.costStatus);
      record.status = 'Finalized';
      record.number = db.next(params.storeId, 'purchase');
      record.finalizedAt = now;
      s.purchases.push(record);
      db.recordOperation(idempotencyKey, 'QuickReceive', 'Purchase', record.id);
      return toPurchaseDto(db, record);
    });
  }),
];
