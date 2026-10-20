import { decimal, money } from '@dukani/domain';
import { chargesWithoutBasis, isKnownZero, lineAmountOf, receiptPreview } from './receipt';
import { emptyReceiptForm, initialReceiptUnit, toQuickReceipt } from './receipt-form';
import type { ReceiptFormOutput } from './receipt-form.types';

const none = { discount: null, shipping: null, sideCharge: null };

describe('single-product receipt arithmetic (F13 §4–§6, BIZ-PUR-04)', () => {
  it('3 packs of 20 at 200,000 with charges: total and cost per base unit as the server computes them', () => {
    const amount = lineAmountOf('Known', money(200_000), decimal.of(3))!;
    const preview = receiptPreview(amount, decimal.of(60), {
      discount: money(10_000),
      shipping: money(30_000),
      sideCharge: money(20_000),
    });
    expect(amount.amount).toBe('600000');
    expect(preview.total?.amount).toBe('640000');
    expect(preview.costPerBase?.amount).toBe('10666.67');
  });

  it('an unknown cost has no amount at all, never a zero', () => {
    expect(lineAmountOf('Unknown', null, decimal.of(10))).toBeNull();
    expect(receiptPreview(null, decimal.of(10), none)).toEqual({ total: null, costPerBase: null });
  });

  it('a known zero needs its reason; an estimated zero or unknown cost does not', () => {
    expect(isKnownZero('Known', money(0))).toBe(true);
    expect(isKnownZero('Known', money(1))).toBe(false);
    expect(isKnownZero('Estimated', money(0))).toBe(false);
    expect(isKnownZero('Unknown', null)).toBe(false);
  });

  it('charges with no known amount to share them are a blocker (CPB-15); a discount alone is not a charge', () => {
    expect(chargesWithoutBasis(null, { ...none, shipping: money(5_000) })).toBe(true);
    expect(chargesWithoutBasis(money(0), { ...none, sideCharge: money(1) })).toBe(true);
    expect(chargesWithoutBasis(money(1_000), { ...none, shipping: money(5_000) })).toBe(false);
    expect(chargesWithoutBasis(null, { ...none, discount: money(10) })).toBe(false);
  });
});

const output = (patch: Partial<ReceiptFormOutput> = {}): ReceiptFormOutput => ({
  unitId: 'pack',
  quantity: decimal.of(3),
  costStatus: 'Known',
  unitCost: money(200_000),
  zeroCostReason: null,
  productionDate: null,
  expiryDate: null,
  documentDate: '2026-10-19',
  supplierId: 'supplier',
  invoiceNo: 'INV-1',
  discount: money(10_000),
  shipping: money(30_000),
  sideCharge: money(20_000),
  salePrice: null,
  ...patch,
});

describe('the receipt a validated form sends', () => {
  it('a purchase carries its own date, supplier, invoice and charges', () => {
    const r = toQuickReceipt('Purchase', 'pen', output());
    expect(r).toMatchObject({
      kind: 'Purchase',
      supplierId: 'supplier',
      invoiceNo: 'INV-1',
      documentDate: '2026-10-19',
    });
    expect(r.charges.sideCharge?.amount).toBe('20000');
    expect(r.line).toMatchObject({ productId: 'pen', unitId: 'pack', zeroCostReason: null });
  });

  it('an Opening is not a purchase: no supplier, invoice, charges or duplicate reason, and no made-up date', () => {
    const r = toQuickReceipt('Opening', 'pen', output({ documentDate: null }), 'reason');
    expect(r).toMatchObject({
      kind: 'Opening',
      supplierId: null,
      invoiceNo: null,
      documentDate: null,
      duplicateInvoiceReason: null,
    });
    expect(r.charges).toEqual(none);
  });

  it('the zero-cost reason travels only with a known zero; an unknown cost sends no amount', () => {
    expect(
      toQuickReceipt('Purchase', 'p', output({ unitCost: money(0), zeroCostReason: 'هدیه' })).line
        .zeroCostReason,
    ).toBe('هدیه');
    expect(
      toQuickReceipt('Purchase', 'p', output({ zeroCostReason: 'هدیه' })).line.zeroCostReason,
    ).toBeNull();
    expect(toQuickReceipt('Purchase', 'p', output({ costStatus: 'Unknown' })).line.unitCost).toBeNull();
  });

  it('a fresh form keeps nothing of an earlier receipt; only the date starts as given', () => {
    expect(emptyReceiptForm('2026-10-19')).toMatchObject({
      documentDate: '2026-10-19',
      supplierId: '',
      shipping: '',
      quantity: '',
    });
    expect(emptyReceiptForm('').documentDate).toBe('');
  });
});

describe('the entry unit a receipt starts with (F12 §6, AC07)', () => {
  const units = [
    { id: 'base', baseQty: '1' },
    { id: 'box', baseQty: '50' },
  ];
  it('keeps a held or scanned unit that can still be bought, else the first pack', () => {
    expect(initialReceiptUnit('base', units)).toEqual({ unitId: 'base', stale: false });
    expect(initialReceiptUnit('', units)).toEqual({ unitId: 'box', stale: false });
    expect(initialReceiptUnit('', [units[0]!])).toEqual({ unitId: 'base', stale: false });
  });
  it('a scanned unit that cannot be bought asks for a new choice, never another unit', () => {
    expect(initialReceiptUnit('retired', units)).toEqual({ unitId: '', stale: true });
  });
});
