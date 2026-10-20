import { costStatusValues } from '@dukani/contracts';
import { decimal, moneyOps, todayDateOnly } from '@dukani/domain';
import { rules, s, type ValidationRules } from '@dukani/forms';
import { chargesWithoutBasis, isKnownZero, lineAmountOf } from '../../domain/receipt';
import type { ReceiptKind } from '../../domain/receipt.types';
import type { PurchaseTranslator } from '../i18n/types';

/**
 * The single-product receipt form (F13 §4–§8): unit, quantity, cost state and cost with the zero-cost reason; for a
 * purchase its own date, supplier, invoice and charges. The client checks what the server checks; the server stays
 * the authority (its field errors land on the same fields).
 */
export const receiptSchemaFor = (
  kind: ReceiptKind,
  maxDecimals: number,
  t: PurchaseTranslator,
  validationRules: ValidationRules = rules,
) =>
  s
    .object({
      unitId: validationRules.required(t('receipt.unit')),
      quantity: validationRules.quantity(maxDecimals),
      costStatus: s.enum(costStatusValues),
      unitCost: validationRules.optionalMoney(),
      zeroCostReason: validationRules.optionalText(t('receipt.zeroCostReason'), 500),
      productionDate: validationRules.optionalDate(),
      expiryDate: validationRules.optionalDate(),
      documentDate:
        kind === 'Purchase' ? validationRules.date(t('purchaseDate')) : validationRules.optionalDate(),
      supplierId: s.string().transform((v) => v || null),
      invoiceNo: validationRules.optionalText(t('supplierInvoiceNumber'), 64),
      discount: validationRules.optionalMoney(),
      shipping: validationRules.optionalMoney(),
      sideCharge: validationRules.optionalMoney(),
      salePrice: validationRules.optionalMoney(),
    })
    .superRefine((v, ctx) => {
      const issue = (path: string, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message });
      if (v.costStatus !== 'Unknown' && !v.unitCost) issue('unitCost', t('costRequired'));
      if (isKnownZero(v.costStatus, v.unitCost) && !v.zeroCostReason)
        issue('zeroCostReason', t('receipt.zeroCostReasonRequired'));
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        issue('expiryDate', t('dateOrder'));
      if (v.documentDate && v.documentDate > todayDateOnly()) issue('documentDate', t('receipt.futureDate'));
      if (kind !== 'Purchase') return;
      const amount = lineAmountOf(v.costStatus, v.unitCost, v.quantity);
      if (chargesWithoutBasis(amount, v)) issue('shipping', t('receipt.chargesNeedCost'));
      if (
        v.discount &&
        !moneyOps.isZero(v.discount) &&
        (!amount || decimal.gt(v.discount.amount, amount.amount))
      )
        issue('discount', t('receipt.discountTooHigh'));
    });
