import type { Dto } from '@dukani/contracts';
import { decimal, money } from '@dukani/domain';
import type { QuickReceipt } from '../domain/receipt.types';
import { toQuickReceiveBody, toRecordedReceipt } from './http-receipts';

const receipt: QuickReceipt = {
  kind: 'Purchase',
  line: {
    productId: 'p',
    unitId: 'u',
    quantity: decimal.of(3),
    costStatus: 'Known',
    unitCost: money(0),
    zeroCostReason: 'هدیه',
    productionDate: null,
    expiryDate: null,
  },
  supplierId: null,
  invoiceNo: null,
  documentDate: null,
  duplicateInvoiceReason: null,
  charges: { discount: null, shipping: money(500), sideCharge: null },
};

describe('QuickReceiveRequest mapping (F13 contract)', () => {
  it('sends Decimal strings and leaves empty optional fields out so the Idempotency-Key body is stable', () => {
    const body = toQuickReceiveBody(receipt);
    expect(body).toEqual({
      kind: 'Purchase',
      line: {
        storeProductId: 'p',
        storeProductUnitId: 'u',
        quantity: '3',
        unitCostAmount: '0',
        costStatus: 'Known',
        productionDate: null,
        expiryDate: null,
        manufacturerPriceAmount: null,
        printedPriceAmount: null,
        zeroCostReason: 'هدیه',
      },
      supplierId: null,
      supplierInvoiceNo: null,
      shippingAmount: '500',
    });
    expect(JSON.stringify(toQuickReceiveBody(receipt))).toBe(JSON.stringify(body));
  });

  it('sends the date and the owner reason only when given', () => {
    const body = toQuickReceiveBody({
      ...receipt,
      documentDate: '2026-10-01',
      duplicateInvoiceReason: 'اصلاحی',
    });
    expect(body).toMatchObject({ documentDate: '2026-10-01', duplicateInvoiceReason: 'اصلاحی' });
  });

  it('reads the canonical answer from the receipt snapshot, with an unknown date kept unknown', () => {
    const dto = {
      id: 'r',
      number: 12,
      kind: 'Opening',
      supplier: null,
      documentDate: null,
      totalAmount: '0',
      lines: [{ title: 'pen', unitName: 'box', quantity: '2', qtyBase: '40', costStatus: 'Unknown' }],
    } as unknown as Dto<'PurchaseDto'>;
    expect(toRecordedReceipt(dto)).toMatchObject({
      id: 'r',
      number: 12,
      kind: 'Opening',
      documentDate: null,
      qtyBase: '40',
      costStatus: 'Unknown',
    });
  });
});
