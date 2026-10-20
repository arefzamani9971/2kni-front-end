import type { Dto } from '@dukani/contracts';
import { decimal, fromApiMoney, money, toApiDecimal, toApiMoney, type Money } from '@dukani/domain';
import type { Api } from '@dukani/http';
import type { ReceiptCommands } from '../application/receipt.ports';
import type { QuickReceipt, RecordedReceipt } from '../domain/receipt.types';

const amount = (m: Money | null) => (m ? toApiMoney(m) : undefined);

/** Receipt → QuickReceiveRequest; optional fields are left out when empty, so the Idempotency-Key body is stable. */
export const toQuickReceiveBody = (r: QuickReceipt): Dto<'QuickReceiveRequest'> => ({
  kind: r.kind,
  line: {
    storeProductId: r.line.productId,
    storeProductUnitId: r.line.unitId,
    quantity: toApiDecimal(r.line.quantity),
    unitCostAmount: r.line.unitCost ? toApiMoney(r.line.unitCost) : null,
    costStatus: r.line.costStatus,
    productionDate: r.line.productionDate,
    expiryDate: r.line.expiryDate,
    manufacturerPriceAmount: null,
    printedPriceAmount: null,
    ...(r.line.zeroCostReason ? { zeroCostReason: r.line.zeroCostReason } : {}),
  },
  supplierId: r.supplierId,
  supplierInvoiceNo: r.invoiceNo,
  ...(r.documentDate ? { documentDate: r.documentDate } : {}),
  ...(r.duplicateInvoiceReason !== null ? { duplicateInvoiceReason: r.duplicateInvoiceReason } : {}),
  ...(amount(r.charges.discount) ? { discountAmount: amount(r.charges.discount) } : {}),
  ...(amount(r.charges.shipping) ? { shippingAmount: amount(r.charges.shipping) } : {}),
  ...(amount(r.charges.sideCharge) ? { sideChargeAmount: amount(r.charges.sideCharge) } : {}),
});

/** The canonical receipt answer → what the flows show; names come from the receipt's own snapshot. */
export const toRecordedReceipt = (p: Dto<'PurchaseDto'>): RecordedReceipt => {
  const line = p.lines[0];
  return {
    id: p.id,
    number: p.number ?? null,
    kind: p.kind,
    documentDate: p.documentDate ?? null,
    supplierName: p.supplier?.name ?? null,
    title: line?.title ?? '',
    unitName: line?.unitName ?? '',
    quantity: decimal.of(line?.quantity ?? 0),
    qtyBase: decimal.of(line?.qtyBase ?? 0),
    costStatus: line?.costStatus ?? 'Unknown',
    totalAmount: fromApiMoney(p.totalAmount) ?? money(0),
  };
};

export const createHttpReceiptCommands = (api: Api): ReceiptCommands => ({
  record: async (storeId, receipt, operationId) =>
    toRecordedReceipt(
      await api.post('/api/v1/stores/{storeId}/purchases/quick', {
        path: { storeId },
        body: toQuickReceiveBody(receipt),
        operationId,
      }),
    ),
});
