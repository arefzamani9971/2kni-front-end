import { costStatusValues } from '@dukani/contracts';
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
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        ctx.addIssue({
          code: 'custom',
          path: ['expiryDate'],
          message: t('dateOrder'),
        });
    });
