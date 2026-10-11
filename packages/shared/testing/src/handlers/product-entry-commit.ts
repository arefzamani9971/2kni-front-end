import type { Dto } from '@dukani/contracts';
import { storeUnitsFor } from '../db/fixtures';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import type { PurchaseRecord } from '../db/state';
import { fail } from '../msw/problem';
import { fromRuleDto, num, num0, str } from '../db/wire';
import type { Plan } from './products.types';
import { receiveStock } from './inventory';
import { createCatalogItem } from './catalog-items';

/** Bulk rows checked against the shared receipt (BULK_* rules). */

export const resolveBulk = (body: Dto<'BulkRegisterRequest'>) => {
  if (body.rows.length < 1 || body.rows.length > 200)
    throw fail.validation('rows', 'بین ۱ تا ۲۰۰ ردیف لازم است.');
  if (new Set(body.rows.map((r) => r.clientRowId)).size !== body.rows.length)
    throw fail.rule('BULK_CLIENT_ROW_ID_DUPLICATE', 'شناسه ردیف‌ها باید یکتا باشد.');
  return body.rows.map((r) => {
    const stock = r.registration.stock;
    const shared = body.sharedReceipt;
    if (!stock) return r;
    if (!shared) throw fail.rule('BULK_SHARED_RECEIPT_REQUIRED', 'اطلاعات مشترک رسید لازم است.');
    if (
      stock.kind !== shared.kind ||
      (stock.supplierId && stock.supplierId !== shared.supplierId) ||
      (stock.supplierInvoiceNo && stock.supplierInvoiceNo.trim() !== shared.supplierInvoiceNo?.trim())
    )
      throw fail.rule('BULK_SHARED_RECEIPT_CONFLICT', 'اطلاعات ردیف با رسید مشترک یکسان نیست.');
    return {
      ...r,
      registration: {
        ...r.registration,
        stock: {
          ...stock,
          supplierId: shared.supplierId,
          supplierInvoiceNo: shared.supplierInvoiceNo,
          documentDate: shared.documentDate,
        },
      },
    };
  });
};

export const commitEntry = (
  db: MockDb,
  storeId: string,
  body: Dto<'RegisterProductRequest'>,
  plan: Plan,
  idempotencyKey: string,
): Dto<'RegisterProductResultDto'> => {
  return db.mutate((s) => {
    const created = !plan.existing && !!body.newCatalogItem;
    const item = created
      ? createCatalogItem(db, storeId, body.newCatalogItem!, 'newCatalogItem.')
      : plan.item;
    let product =
      plan.existing ?? s.storeProducts.find((p) => p.storeId === storeId && p.catalogItemId === item.id);
    if (!product) {
      const id = randomId();
      product = {
        id,
        storeId: storeId,
        catalogItemId: item.id,
        kind: item.kind ?? 'Goods',
        shortcut: body.shortcut?.trim().toUpperCase() || null,
        localTitle: body.localTitle?.trim() || null,
        localNote: body.localNote?.trim() || null,
        sku: `P${String(db.next(storeId, 'sku')).padStart(5, '0')}`,
        onHand: 0,
        reserved: 0,
        averageCost: item.kind === 'Service' ? num(body.serviceCostAmount) : null,
        costStatus: item.kind === 'Service' && body.serviceCostAmount != null ? 'Known' : 'Unknown',
        pricing: fromRuleDto(
          body.pricing ?? { method: 'Manual', manualPriceAmount: null, roundingDirection: 'Nearest' },
        ),
        baseSalePrice: plan.salePrice,
        lowStockThreshold: num(body.lowStockThreshold),
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
      const unit =
        product.units.find((u) =>
          body.stock?.unit.storeProductUnitId
            ? u.id === body.stock.unit.storeProductUnitId
            : u.catalogItemUnitId === catalogUnitId,
        ) ?? product.units[0]!;
      const now = new Date().toISOString();
      const purchase: PurchaseRecord = {
        id: randomId(),
        storeId: storeId,
        number: db.next(storeId, 'purchase'),
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
            quantity: num0(body.stock.quantity),
            unitCost: body.stock.costStatus === 'Unknown' ? null : num(body.stock.unitCostAmount),
            costStatus: body.stock.costStatus,
            productionDate: body.stock.productionDate ?? null,
            expiryDate: body.stock.expiryDate ?? null,
            manufacturerPrice: num(body.stock.manufacturerPriceAmount),
            printedPrice: num(body.stock.printedPriceAmount),
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
      onHand: str(product.onHand),
      salePriceAmount: str(product.baseSalePrice),
      itemKind: product.kind ?? 'Goods',
      catalogStatus: item.status,
      storeProductStatus: product.status,
      version: product.version,
    };
  });
};
