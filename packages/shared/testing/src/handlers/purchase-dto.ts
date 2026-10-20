import { productTitle } from './dto';
import { round2 } from './money';
import type { Dto } from '@dukani/contracts';
import type { MockDb } from '../db/mock-db.types';
import type { PurchaseRecord } from '../db/state';
import { str } from '../db/wire';
import type { NumericLine } from './dto.types';

/** Purchase record → DTO mappers and totals (one place per DTO, like backend projections). */

export const toLineDto = (l: NumericLine): Dto<'PurchaseLineDto'> => ({
  ...l,
  baseQtyPerUnit: str(l.baseQtyPerUnit ?? 1),
  quantity: str(l.quantity ?? 0),
  qtyBase: str(l.qtyBase ?? 0),
  unitCostAmount: str(l.unitCostAmount),
  lineAmount: str(l.lineAmount ?? 0),
  allocatedDiscountAmount: str(l.allocatedDiscountAmount ?? 0),
  allocatedExtraAmount: str(l.allocatedExtraAmount ?? 0),
  costPerBaseAmount: str(l.costPerBaseAmount),
  manufacturerPriceAmount: str(l.manufacturerPriceAmount),
  printedPriceAmount: str(l.printedPriceAmount),
});

export const computePurchase = (db: MockDb, p: PurchaseRecord) => {
  const lines = p.lines.map((l, i) => {
    const product = db.state.storeProducts.find((x) => x.id === l.storeProductId);
    const unit = product?.units.find((u) => u.id === l.storeProductUnitId);
    const baseQtyPerUnit = unit?.baseQty ?? 1;
    const amount = l.costStatus === 'Unknown' || l.unitCost === null ? 0 : round2(l.unitCost * l.quantity);
    return { l, i, product, unit, baseQtyPerUnit, qtyBase: l.quantity * baseQtyPerUnit, amount };
  });
  const subtotal = lines.reduce((s, x) => s + x.amount, 0);
  const extra = p.shipping + (p.sideCharge ?? 0) + p.nonRecoverableTax;
  const lineDtos: NumericLine[] = lines.map((x) => {
    const share = subtotal > 0 ? x.amount / subtotal : 0;
    const discount = round2(p.discount * share);
    const extraShare = round2(extra * share);
    return {
      id: x.l.id,
      lineNo: x.i + 1,
      storeProductId: x.l.storeProductId,
      title: x.product ? productTitle(db, x.product) : '—',
      storeProductUnitId: x.l.storeProductUnitId,
      unitName: x.unit?.name ?? '—',
      baseQtyPerUnit: x.baseQtyPerUnit,
      quantity: x.l.quantity,
      qtyBase: x.qtyBase,
      unitCostAmount: x.l.unitCost,
      costStatus: x.l.costStatus,
      lineAmount: x.amount,
      allocatedDiscountAmount: discount,
      allocatedExtraAmount: extraShare,
      costPerBaseAmount:
        x.l.costStatus === 'Unknown' || x.qtyBase <= 0
          ? null
          : round2((x.amount - discount + extraShare) / x.qtyBase),
      productionDate: x.l.productionDate,
      expiryDate: x.l.expiryDate,
      manufacturerPriceAmount: x.l.manufacturerPrice,
      printedPriceAmount: x.l.printedPrice,
      zeroCostReason: x.l.zeroCostReason ?? null,
    };
  });
  return { subtotal, total: subtotal - p.discount + extra, extra, lines: lineDtos };
};

/** The receipt's business date: given, else the purchase day; an Opening without one stays unknown (F13 §5). */
const documentDateOf = (p: PurchaseRecord) =>
  p.documentDate !== undefined ? p.documentDate : p.kind === 'Opening' ? null : p.purchasedAt.slice(0, 10);

export const toPurchaseDto = (db: MockDb, p: PurchaseRecord): Dto<'PurchaseDto'> => {
  const t = computePurchase(db, p);
  const supplier = p.supplierId ? db.state.suppliers.find((s) => s.id === p.supplierId) : undefined;
  return {
    id: p.id,
    number: p.number,
    kind: p.kind,
    status: p.status,
    supplier: supplier
      ? {
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          note: supplier.note,
          isArchived: supplier.isArchived,
        }
      : null,
    supplierInvoiceNo: p.supplierInvoiceNo,
    purchasedAt: p.purchasedAt,
    lines: t.lines.map(toLineDto),
    subtotalAmount: str(t.subtotal),
    discountAmount: str(p.discount),
    shippingAmount: str(p.shipping),
    nonRecoverableTaxAmount: str(p.nonRecoverableTax),
    totalAmount: str(t.total),
    attachmentFileIds: p.attachmentFileIds,
    note: p.note,
    corrections: [],
    finalizedAt: p.finalizedAt,
    version: p.version,
    sideChargeAmount: str(p.sideCharge ?? 0),
    documentDate: documentDateOf(p),
  };
};

export const toPurchaseSummary = (db: MockDb, p: PurchaseRecord): Dto<'PurchaseSummaryDto'> => {
  const t = computePurchase(db, p);
  return {
    id: p.id,
    number: p.number,
    kind: p.kind,
    status: p.status,
    supplierName: p.supplierId ? (db.state.suppliers.find((s) => s.id === p.supplierId)?.name ?? null) : null,
    supplierInvoiceNo: p.supplierInvoiceNo,
    purchasedAt: p.purchasedAt,
    lineCount: p.lines.length,
    totalAmount: str(t.total),
    hasUnknownCost: p.lines.some((l) => l.costStatus === 'Unknown'),
    documentDate: documentDateOf(p),
  };
};
