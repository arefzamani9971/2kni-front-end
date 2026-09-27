import type { Dto } from '@dukani/contracts';
import { normalizeDigits, normalizeTitle } from '@dukani/domain';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db';
import type { PurchaseLineRecord, PurchaseRecord } from '../db/state';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { computePurchase, page, toPurchaseDto, toPurchaseSummary } from './dto';
import { receiveStock } from './products';

/** Invoice numbers compare without separators and leading zeros (BIZ-PUR-03). */
const normalizeInvoiceNo = (s: string) => normalizeDigits(s).replace(/[\s\-_/]/g, '').replace(/^0+/, '').toLowerCase();

const toLines = (db: MockDb, storeId: string, lines: Dto<'PurchaseLineInput'>[] | null | undefined): PurchaseLineRecord[] =>
  (lines ?? []).map((l, i) => {
    const product = db.state.storeProducts.find((p) => p.id === l.storeProductId && p.storeId === storeId);
    if (!product) throw fail.validation(`lines[${i}].storeProductId`, 'کالا پیدا نشد.', 'NOT_FOUND');
    if (!product.units.some((u) => u.id === l.storeProductUnitId))
      throw fail.validation(`lines[${i}].storeProductUnitId`, 'این واحد متعلق به این کالا نیست.', 'ENTRY_UNIT_UNAVAILABLE');
    if (!(l.quantity > 0)) throw fail.validation(`lines[${i}].quantity`, 'تعداد باید بیشتر از صفر باشد.', 'QUANTITY_INVALID');
    if (l.costStatus !== 'Unknown' && (l.unitCostRials === null || l.unitCostRials === undefined))
      throw fail.validation(`lines[${i}].unitCostRials`, 'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.', 'COST_REQUIRED');
    if (l.productionDate && l.expiryDate && l.productionDate > l.expiryDate)
      throw fail.validation(`lines[${i}].expiryDate`, 'تاریخ تولید نباید بعد از تاریخ انقضا باشد.', 'PRODUCTION_AFTER_EXPIRY');
    return {
      id: randomId(),
      storeProductId: l.storeProductId,
      storeProductUnitId: l.storeProductUnitId,
      quantity: l.quantity,
      unitCost: l.costStatus === 'Unknown' ? null : (l.unitCostRials ?? null),
      costStatus: l.costStatus,
      productionDate: l.productionDate ?? null,
      expiryDate: l.expiryDate ?? null,
      manufacturerPrice: l.manufacturerPriceRials ?? null,
      printedPrice: l.printedPriceRials ?? null,
    };
  });

const checkSupplier = (db: MockDb, storeId: string, supplierId: string | null | undefined) => {
  if (supplierId && !db.state.suppliers.some((s) => s.id === supplierId && s.storeId === storeId && !s.isArchived))
    throw fail.validation('supplierId', 'تأمین‌کننده پیدا نشد یا بایگانی شده است.', 'SUPPLIER_UNAVAILABLE');
};

const duplicateOf = (db: MockDb, p: PurchaseRecord) => {
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

/** Purchasing module: suppliers and purchase receipts (draft → finalize, F17–F21). */
export const purchasingHandlers = (db: MockDb) => {
  const load = (request: Request, storeId: string, purchaseId: string, permission = 'purchase.manage') => {
    db.requireMember(request, storeId, permission);
    const p = db.state.purchases.find((x) => x.id === purchaseId && x.storeId === storeId);
    if (!p) throw fail.notFound('رسید خرید');
    return p;
  };
  const draftOnly = (p: PurchaseRecord) => {
    if (p.status !== 'Draft') throw fail.rule('INVALID_STATE_TRANSITION', 'فقط پیش‌نویس قابل ویرایش است.');
  };

  return [
    route.get('/api/v1/stores/{storeId}/suppliers', ({ request, params, query }) => {
      db.requireMember(request, params.storeId);
      const q = normalizeTitle(query.get('q') ?? '');
      return db.state.suppliers
        .filter((s) => s.storeId === params.storeId && !s.isArchived && (!q || normalizeTitle(s.name).includes(q)))
        .map(({ storeId: _, ...s }) => s);
    }),

    route.post('/api/v1/stores/{storeId}/suppliers', ({ request, params, body }) => {
      db.requireMember(request, params.storeId, 'purchase.manage');
      const name = body.name?.trim();
      if (!name) throw fail.validation('name', 'نام تأمین‌کننده را وارد کنید.', 'SUPPLIER_NAME_REQUIRED');
      if (db.state.suppliers.some((s) => s.storeId === params.storeId && normalizeTitle(s.name) === normalizeTitle(name)))
        throw fail.conflict('SUPPLIER_DUPLICATE', 'تأمین‌کننده‌ای با همین نام در فروشگاه هست.');
      return db.mutate((s) => {
        const supplier = { id: randomId(), storeId: params.storeId, name, phone: body.phone?.trim() || null, note: body.note?.trim() || null, isArchived: false };
        s.suppliers.push(supplier);
        const { storeId: _, ...dto } = supplier;
        return dto;
      });
    }),

    route.get('/api/v1/stores/{storeId}/purchases', ({ request, params, query }) => {
      db.requireMember(request, params.storeId);
      const status = query.get('status');
      const kind = query.get('kind');
      const supplierId = query.get('supplierId');
      const from = query.get('from');
      const to = query.get('to');
      const q = normalizeTitle(query.get('q') ?? '');
      const items = db.state.purchases
        .filter((p) => p.storeId === params.storeId && p.status !== 'Discarded')
        .filter((p) => (!status || p.status === status) && (!kind || p.kind === kind) && (!supplierId || p.supplierId === supplierId))
        .filter((p) => (!from || p.purchasedAt.slice(0, 10) >= from) && (!to || p.purchasedAt.slice(0, 10) <= to))
        .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
        .map((p) => toPurchaseSummary(db, p))
        .filter((p) => !q || normalizeTitle(`${p.supplierName ?? ''} ${p.supplierInvoiceNo ?? ''} ${p.number ?? ''}`).includes(q));
      return page(items, query, 30);
    }),

    route.post('/api/v1/stores/{storeId}/purchases', ({ request, params, body }) => {
      db.requireMember(request, params.storeId, 'purchase.manage');
      checkSupplier(db, params.storeId, body.supplierId);
      return db.mutate((s) => {
        const now = new Date().toISOString();
        const p: PurchaseRecord = {
          id: randomId(),
          storeId: params.storeId,
          number: null,
          kind: body.kind,
          status: 'Draft',
          supplierId: body.supplierId ?? null,
          supplierInvoiceNo: body.supplierInvoiceNo?.trim() || null,
          purchasedAt: body.purchasedAt ?? now,
          discount: 0,
          shipping: 0,
          nonRecoverableTax: 0,
          note: null,
          lines: toLines(db, params.storeId, body.lines),
          attachmentFileIds: [],
          finalizedAt: null,
          version: 1,
          createdAt: now,
        };
        s.purchases.push(p);
        return toPurchaseDto(db, p);
      });
    }),

    route.get('/api/v1/stores/{storeId}/purchases/{purchaseId}', ({ request, params }) =>
      toPurchaseDto(db, load(request, params.storeId, params.purchaseId, 'stock.view')),
    ),

    route.put('/api/v1/stores/{storeId}/purchases/{purchaseId}', ({ request, params, body }) => {
      const p = load(request, params.storeId, params.purchaseId);
      draftOnly(p);
      if (body.expectedVersion !== p.version) throw fail.versionConflict();
      checkSupplier(db, params.storeId, body.supplierId);
      for (const [field, v] of [
        ['discountRials', body.discountRials],
        ['shippingRials', body.shippingRials],
        ['nonRecoverableTaxRials', body.nonRecoverableTaxRials],
      ] as const)
        if (v < 0) throw fail.validation(field, 'مبلغ نمی‌تواند منفی باشد.', 'AMOUNT_NEGATIVE');
      const lines = toLines(db, params.storeId, body.lines);
      return db.mutate(() => {
        Object.assign(p, {
          supplierId: body.supplierId ?? null,
          supplierInvoiceNo: body.supplierInvoiceNo?.trim() || null,
          purchasedAt: body.purchasedAt,
          discount: body.discountRials,
          shipping: body.shippingRials,
          nonRecoverableTax: body.nonRecoverableTaxRials,
          note: body.note?.trim() || null,
          lines,
          version: p.version + 1,
        });
        const subtotal = computePurchase(db, p).subtotal;
        if (p.discount > subtotal) throw fail.validation('discountRials', 'تخفیف بیشتر از جمع اقلام است.', 'DISCOUNT_EXCEEDS_AMOUNT');
        return toPurchaseDto(db, p);
      });
    }),

    route.delete('/api/v1/stores/{storeId}/purchases/{purchaseId}', ({ request, params }) => {
      const p = load(request, params.storeId, params.purchaseId);
      draftOnly(p);
      db.mutate(() => (p.status = 'Discarded'));
      return null;
    }),

    route.get('/api/v1/stores/{storeId}/purchases/{purchaseId}/totals', ({ request, params }) => {
      const p = load(request, params.storeId, params.purchaseId, 'stock.view');
      const t = computePurchase(db, p);
      const dup = duplicateOf(db, p);
      const warnings: string[] = [];
      if (dup) warnings.push(`فاکتور «${p.supplierInvoiceNo}» از همین تأمین‌کننده قبلاً در رسید ${dup.number ?? ''} ثبت شده است.`);
      if (p.lines.some((l) => l.costStatus === 'Unknown')) warnings.push('بهای بعضی اقلام نامعلوم است؛ سود آن‌ها محاسبه نمی‌شود.');
      return {
        subtotalRials: t.subtotal,
        discountRials: p.discount,
        extraCostsRials: t.extra,
        totalRials: t.total,
        lines: t.lines,
        duplicateOfPurchaseId: dup?.id ?? null,
        warnings,
      };
    }),

    route.post('/api/v1/stores/{storeId}/purchases/{purchaseId}/finalize', ({ request, params, body, idempotencyKey }) => {
      const p = load(request, params.storeId, params.purchaseId);
      draftOnly(p);
      if (body.expectedVersion !== p.version) throw fail.versionConflict();
      if (p.lines.length === 0) throw fail.rule('PURCHASE_EMPTY', 'رسید بدون قلم قابل ثبت نیست.');
      const dup = duplicateOf(db, p);
      if (dup && !body.confirmDuplicateInvoiceNo)
        throw fail.rule('PURCHASE_DUPLICATE_INVOICE', `این شماره فاکتور قبلاً در رسید ${dup.number ?? ''} ثبت شده است؛ اگر فاکتور دیگری است تأیید کنید.`);
      if (dup && !body.duplicateReason?.trim())
        throw fail.validation('duplicateReason', 'دلیل ثبت فاکتور تکراری را بنویسید.', 'DUPLICATE_REASON_REQUIRED');
      return db.mutate(() => {
        const t = computePurchase(db, p);
        for (const line of t.lines) {
          const product = db.state.storeProducts.find((x) => x.id === line.storeProductId);
          if (product) receiveStock(product, line.qtyBase, line.costPerBaseRials ?? null, line.costStatus);
        }
        p.status = 'Finalized';
        p.number = db.next(params.storeId, 'purchase');
        p.finalizedAt = new Date().toISOString();
        p.version += 1;
        db.recordOperation(idempotencyKey, 'FinalizePurchase', 'Purchase', p.id);
        return toPurchaseDto(db, p);
      });
    }),

    route.put('/api/v1/stores/{storeId}/purchases/{purchaseId}/attachments', ({ request, params, body }) => {
      const p = load(request, params.storeId, params.purchaseId);
      if (body.fileIds.length > 5) throw fail.validation('fileIds', 'حداکثر ۵ پیوست مجاز است.', 'IMAGES_TOO_MANY');
      return db.mutate(() => {
        p.attachmentFileIds = [...body.fileIds];
        if (p.status === 'Draft') p.version += 1;
        return toPurchaseDto(db, p);
      });
    }),
  ];
};
