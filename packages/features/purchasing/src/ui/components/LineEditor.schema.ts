import { costStatusValues } from '@dukani/contracts';
import { decimal } from '@dukani/domain';
import type { PurchaseTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

/** «مقدار خرید» line form (Figma 312:9194): unit, quantity, cost status/cost, optional dates. */
export const schemaFor = (
  maxDecimals: number,
  t: PurchaseTranslator,
  validationRules: ValidationRules = rules,
) =>
  s
    .object({
      unitId: validationRules.required(t('purchaseUnit')),
      quantity: validationRules.quantity(maxDecimals),
      costStatus: s.enum(costStatusValues),
      unitCost: validationRules.optionalMoney(),
      zeroCostReason: validationRules.optionalText(t('receipt.zeroCostReason'), 500),
      productionDate: validationRules.optionalDate(),
      expiryDate: validationRules.optionalDate(),
    })
    .superRefine((v, ctx) => {
      if (v.costStatus !== 'Unknown' && !v.unitCost)
        ctx.addIssue({
          code: 'custom',
          path: ['unitCost'],
          message: t('costRequired'),
        });
      // a known cost of zero needs its reason (F13 §5), as the server checks on every receipt line
      if (v.costStatus === 'Known' && v.unitCost && decimal.isZero(v.unitCost.amount) && !v.zeroCostReason)
        ctx.addIssue({
          code: 'custom',
          path: ['zeroCostReason'],
          message: t('receipt.zeroCostReasonRequired'),
        });
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        ctx.addIssue({
          code: 'custom',
          path: ['expiryDate'],
          message: t('dateOrder'),
        });
    });
